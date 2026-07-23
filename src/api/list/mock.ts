export type ProductStatus = "selling" | "sold-out" | "draft"

export type ProductCategory = "家用电器" | "数码配件" | "办公用品" | "生活百货"

const productModels = [
  "PT-LAMP-01",
  "PT-AUDIO-02",
  "PT-KEY-03",
  "PT-CUP-04",
  "PT-AIR-05",
  "PT-BOX-06",
  "PT-SPK-07",
  "PT-PWR-08"
] as const

export type ProductType = "普通产品" | "组合产品"

export type ProductTag = "新品" | "危险品" | "大件" | "xxx"

export type ProductItem = {
  id: number
  name: string
  sku: string
  imageUrl: string
  brand: string
  model: string
  category: ProductCategory
  country: string
  purchaser: string
  developer: string
  productType: ProductType
  tags: ProductTag[]
  price: number
  stock: number
  status: ProductStatus
  sales: number
  updatedAt: string
}

const productNames = [
  "智能台灯",
  "无线耳机",
  "机械键盘",
  "保温水杯",
  "空气炸锅",
  "桌面收纳盒",
  "蓝牙音箱",
  "便携充电宝",
  "人体工学椅",
  "迷你加湿器"
]

const productBrands = ["Puture", "Moring", "Aster", "NOVA", "Kairo"]

const productImageUrls = [
  "https://picsum.photos/id/26/480/480",
  "https://picsum.photos/id/42/480/480",
  "https://picsum.photos/id/96/480/480",
  "https://picsum.photos/id/119/480/480",
  "https://picsum.photos/id/122/480/480",
  "https://picsum.photos/id/250/480/480",
  "https://picsum.photos/id/292/480/480",
  "https://picsum.photos/id/367/480/480",
  "https://picsum.photos/id/431/480/480",
  "https://picsum.photos/id/534/480/480"
]

const productPrices = [99, 135, 207, 459, 699, 12999, 23888, 45999, 329, 518, 889, 16999]

const categories: ProductCategory[] = ["家用电器", "数码配件", "办公用品", "生活百货"]

  const countries: string[] = ["CN", "US", "JP", "DE"]

const purchasers = ["林悦", "周扬", "许宁", "陈序"]

const developers = ["王拓", "赵珂", "李昂", "沈岚"]

const productTypes: ProductType[] = ["普通产品", "组合产品"]

const productTagGroups: ProductTag[][] = [
  ["新品"],
  ["危险品"],
  ["大件"],
  ["新品", "大件"],
  ["危险品", "xxx"],
  ["新品", "危险品", "大件"],
  ["xxx"]
]

const statuses: ProductStatus[] = ["selling", "sold-out", "draft"]

export const productStatusText: Record<ProductStatus, string> = {
  selling: "在售",
  "sold-out": "售罄",
  draft: "草稿"
}

/** 格式化 mock 商品更新时间。 */
function formatDate(day: number) {
  return `2026-06-${String(day).padStart(2, "0")}`
}

export const productList: ProductItem[] = Array.from({ length: 70 }, (_, index) => {
  const id = index + 1
  const category = categories[index % categories.length]
  const country = countries[index % countries.length]
  const status = statuses[index % statuses.length]

  return {
    id,
    name: `Goods moring ${productNames[index % productNames.length]} ${String(id).padStart(2, "0")}`,
    sku: `SKU-${String(100000 + id)}`,
    imageUrl: productImageUrls[index % productImageUrls.length],
    brand: productBrands[index % productBrands.length],
    model: productModels[index % productModels.length],
    category,
    country,
    purchaser: purchasers[index % purchasers.length],
    developer: developers[index % developers.length],
    productType: productTypes[index % productTypes.length],
    tags: productTagGroups[index % productTagGroups.length],
    price: productPrices[index % productPrices.length],
    stock: status === "sold-out" ? 0 : 12 + (index * 7) % 96,
    status,
    sales: 80 + (index * 13) % 520,
    updatedAt: formatDate((index % 28) + 1)
  }
})
