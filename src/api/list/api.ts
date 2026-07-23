import type { PageSearchPageParams, PageSearchQueryParams, PageSearchResponse } from "@puture-ui/capabilities"
import { productList } from "./mock"
import type { ProductCategory, ProductItem, ProductStatus } from "./mock"

type SearchForm = {
  name: string
  brand: string | null
  category: ProductCategory | null
  country: string | null
  status: ProductStatus | null
  stock: 'all' | 'in-stock' | 'empty'
}

export type ProductPageParams = PageSearchPageParams & {
  orders: Array<{
    column: string
    asc: boolean
  }>
}

export function queryProductList(
  params: PageSearchQueryParams<ProductPageParams, SearchForm>,
  signal: AbortSignal
): Promise<PageSearchResponse<ProductItem>> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (signal.aborted) return

      const keyword = params.param.name.trim().toLowerCase()
      const filteredData = productList.filter(item => {
        const matchName = !keyword || item.name.toLowerCase().includes(keyword)
        const matchBrand = !params.param.brand || item.brand === params.param.brand
        const matchCategory = !params.param.category || item.category === params.param.category
        const matchCountry = !params.param.country || item.country === params.param.country
        const matchStatus = !params.param.status || item.status === params.param.status
        const matchStock =
          params.param.stock === 'all' ||
          (params.param.stock === 'in-stock' && item.stock > 0) ||
          (params.param.stock === 'empty' && item.stock === 0)

        return matchName && matchBrand && matchCategory && matchCountry && matchStatus && matchStock
      })
      const [order] = params.page.orders
      const sortedData = [...filteredData]
      if (order && (order.column === 'price' || order.column === 'updatedAt')) {
        const column = order.column
        sortedData.sort((left, right) => {
          const leftValue = left[column]
          const rightValue = right[column]
          const comparison =
            typeof leftValue === 'number' && typeof rightValue === 'number'
              ? leftValue - rightValue
              : String(leftValue).localeCompare(String(rightValue))
          return order.asc ? comparison : -comparison
        })
      }
      const start = (params.page.current - 1) * params.page.size

      resolve({
        data: {
          records: sortedData.slice(start, start + params.page.size),
          total: filteredData.length
        }
      })
    }, 680)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('请求已取消', 'AbortError'))
      },
      { once: true }
    )
  })
}
