import type {
  ProductCategory,
  ProductStatus,
  ProductTag,
  ProductType
} from '@/api/list/mock'

export type ProductSearchForm = {
  name: string
  brand: string | null
  category: ProductCategory | null
  country: string | null
  status: ProductStatus | null
  stock: 'all' | 'in-stock' | 'empty'
}

export const defaultProductSearchParams: ProductSearchForm = {
  name: '',
  brand: null,
  category: null,
  country: null,
  status: null,
  stock: 'all'
}

export const productCategoryOptions = [
  { label: '家用电器', value: '家用电器' },
  { label: '数码配件', value: '数码配件' },
  { label: '办公用品', value: '办公用品' },
  { label: '生活百货', value: '生活百货' }
] satisfies Array<{ label: ProductCategory; value: ProductCategory }>

export const productStatusOptions = [
  { label: '在售', value: 'selling' },
  { label: '售罄', value: 'sold-out' },
  { label: '草稿', value: 'draft' }
] satisfies Array<{ label: string; value: ProductStatus }>

export const productStockOptions = [
  { label: '全部库存', value: 'all' },
  { label: '有库存', value: 'in-stock' },
  { label: '无库存', value: 'empty' }
] satisfies Array<{ label: string; value: ProductSearchForm['stock'] }>

export const productStatusTagType: Record<ProductStatus, 'success' | 'error' | 'default'> = {
  selling: 'success',
  'sold-out': 'error',
  draft: 'default'
}

export const productTypeTagType: Record<ProductType, 'default' | 'info'> = {
  普通产品: 'default',
  组合产品: 'info'
}

export const productTagType: Record<ProductTag, 'success' | 'error' | 'warning' | 'default'> = {
  新品: 'success',
  危险品: 'error',
  大件: 'warning',
  xxx: 'default'
}
