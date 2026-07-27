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

export type ProductFormPayload = Pick<ProductItem, 'name' | 'brand' | 'price'> & {
  id?: number
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

/** 保存新增或编辑的商品，并返回最新商品数据。 */
export function saveProduct(params: ProductFormPayload): Promise<ProductItem> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const updatedAt = new Date().toISOString().slice(0, 10)

      if (params.id !== undefined) {
        const product = productList.find(item => item.id === params.id)
        if (!product) {
          reject(new Error('未找到需要编辑的商品'))
          return
        }

        Object.assign(product, {
          name: params.name,
          brand: params.brand,
          price: params.price,
          updatedAt
        })
        resolve(product)
        return
      }

      const id = productList.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
      const product: ProductItem = {
        id,
        name: params.name,
        sku: `SKU-${String(100000 + id)}`,
        imageUrl: '',
        brand: params.brand,
        model: '-',
        category: '生活百货',
        country: 'CN',
        purchaser: '-',
        developer: '-',
        productType: '普通产品',
        tags: [],
        price: params.price,
        stock: 0,
        status: 'draft',
        sales: 0,
        updatedAt
      }

      productList.unshift(product)
      resolve(product)
    }, 480)
  })
}
