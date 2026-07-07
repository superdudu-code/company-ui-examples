import { PageSearchPageParams, PageSearchQueryParams, PageSearchResponse } from "@puture-ui/capabilities"
import { ProductCategory, ProductItem, productList, ProductStatus } from "./mock"

type SearchForm = {
  name: string
  category: ProductCategory | null
  country: string | null
  status: ProductStatus | null
  stock: 'all' | 'in-stock' | 'empty'
}

export function queryProductList(
  params: PageSearchQueryParams<PageSearchPageParams, SearchForm>,
  signal: AbortSignal
): Promise<PageSearchResponse<ProductItem>> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (signal.aborted) return

      const keyword = params.param.name.trim().toLowerCase()
      const filteredData = productList.filter(item => {
        const matchName = !keyword || item.name.toLowerCase().includes(keyword)
        const matchCategory = !params.param.category || item.category === params.param.category
        const matchCountry = !params.param.country || item.country === params.param.country
        const matchStatus = !params.param.status || item.status === params.param.status
        const matchStock =
          params.param.stock === 'all' ||
          (params.param.stock === 'in-stock' && item.stock > 0) ||
          (params.param.stock === 'empty' && item.stock === 0)

        return matchName && matchCategory && matchCountry && matchStatus && matchStock
      })
      const start = (params.page.current - 1) * params.page.size

      resolve({
        data: {
          records: filteredData.slice(start, start + params.page.size),
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
