<template>
  <div class="page-container">
    <section class="filter-wrap">
      <NForm :model="searchForm" label-placement="left" size="small">
        <div class="base-table-page__filter-grid">
          <NFormItem label="商品名称">
            <NInput v-model:value="searchForm.name" clearable placeholder="请输入商品名称" @keyup.enter="handleSearch" />
          </NFormItem>
          <NFormItem label="商品分类">
            <NSelect v-model:value="searchForm.category" clearable :options="categoryOptions" placeholder="请选择商品分类" />
          </NFormItem>
          <NFormItem label="商品状态">
            <NSelect v-model:value="searchForm.status" clearable :options="statusOptions" placeholder="请选择商品状态" />
          </NFormItem>
          <NFormItem label="库存状态">
            <NSelect v-model:value="searchForm.stock" :options="stockOptions" placeholder="请选择库存状态" />
          </NFormItem>
        </div>
      </NForm>
    </section>

    <section class="tool-wrap">
      <NSpace>
        <NButton size="small" type="primary" @click="handleSearch">查询</NButton>
        <NButton size="small" @click="handleReset">重置</NButton>
      </NSpace>
      <NSpace>
        <NButton size="small" type="primary">新增商品</NButton>
        <NButton size="small" :disabled="checkedRowKeys.length === 0">批量下架</NButton>
      </NSpace>
    </section>

    <section class="table-wrap">
      <NDataTable
        class="page-table"
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="pageData"
        :pagination="false"
        table-layout="fixed"
        flex-height
        size="small"
        :row-key="row => row.id"
        :scroll-x="920"
      />
    </section>

    <section class="page-wrap">
      <div class="base-table-page__selected">已选择 {{ checkedRowKeys.length }} 条数据</div>
      <NPagination
        v-model:page="page"
        :item-count="filteredData.length"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        show-size-picker
        @update:page-size="handlePageSizeChange"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import { NButton, NDataTable, NForm, NFormItem, NInput, NPagination, NSelect, NSpace, NTag } from 'naive-ui'
import { productList, productStatusText, type ProductCategory, type ProductItem, type ProductStatus } from './mock'

type SearchForm = {
  name: string
  category: ProductCategory | null
  status: ProductStatus | null
  stock: 'all' | 'in-stock' | 'empty'
}

const searchForm = reactive<SearchForm>({
  name: '',
  category: null,
  status: null,
  stock: 'all'
})

const page = ref(1)
const pageSize = ref(10)
const checkedRowKeys = ref<DataTableRowKey[]>([])

const categoryOptions = [
  { label: '家用电器', value: '家用电器' },
  { label: '数码配件', value: '数码配件' },
  { label: '办公用品', value: '办公用品' },
  { label: '生活百货', value: '生活百货' }
] satisfies Array<{ label: ProductCategory; value: ProductCategory }>

const statusOptions = [
  { label: '在售', value: 'selling' },
  { label: '售罄', value: 'sold-out' },
  { label: '草稿', value: 'draft' }
] satisfies Array<{ label: string; value: ProductStatus }>

const stockOptions = [
  { label: '全部库存', value: 'all' },
  { label: '有库存', value: 'in-stock' },
  { label: '无库存', value: 'empty' }
] satisfies Array<{ label: string; value: SearchForm['stock'] }>

const statusTagType: Record<ProductStatus, 'success' | 'error' | 'default'> = {
  selling: 'success',
  'sold-out': 'error',
  draft: 'default'
}

const columns: DataTableColumns<ProductItem> = [
  { type: 'selection' },
  { title: '商品名称', key: 'name', minWidth: 160 },
  { title: '分类', key: 'category', width: 120 },
  {
    title: '价格',
    key: 'price',
    width: 110,
    render(row) {
      return `¥${row.price.toFixed(2)}`
    }
  },
  { title: '库存', key: 'stock', width: 100 },
  { title: '销量', key: 'sales', width: 100 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(NTag, { size: 'small', type: statusTagType[row.status] }, { default: () => productStatusText[row.status] })
    }
  },
  { title: '更新时间', key: 'updatedAt', width: 130 }
]

const filteredData = computed(() => {
  const keyword = searchForm.name.trim().toLowerCase()

  return productList.filter(item => {
    const matchName = !keyword || item.name.toLowerCase().includes(keyword)
    const matchCategory = !searchForm.category || item.category === searchForm.category
    const matchStatus = !searchForm.status || item.status === searchForm.status
    const matchStock =
      searchForm.stock === 'all' ||
      (searchForm.stock === 'in-stock' && item.stock > 0) ||
      (searchForm.stock === 'empty' && item.stock === 0)

    return matchName && matchCategory && matchStatus && matchStock
  })
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value

  return filteredData.value.slice(start, start + pageSize.value)
})

/** 重置分页到第一页。 */
function resetPage() {
  page.value = 1
}

/** 清空筛选条件和已选数据。 */
function handleReset() {
  searchForm.name = ''
  searchForm.category = null
  searchForm.status = null
  searchForm.stock = 'all'
  checkedRowKeys.value = []
  resetPage()
}

/** 应用筛选条件。 */
function handleSearch() {
  resetPage()
}

/** 更新每页条数并重置分页。 */
function handlePageSizeChange(size: number) {
  pageSize.value = size
  resetPage()
}
</script>

<style lang="scss" scoped>
@use '@/styles/base-table-page' as tablePage;

.base-table-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.base-table-page__filter,
.base-table-page__toolbar,
.base-table-page__table,
.base-table-page__pagination {
  background: var(--pc-fill-card);
  border: 1px solid var(--pc-border-color-divider);
  border-radius: var(--pc-radius-base);
}

.base-table-page__filter {
  padding: 18px 20px 0;
}

.base-table-page__filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
}

.base-table-page__toolbar,
.base-table-page__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
}

.base-table-page__table {
  padding: 0 20px;
}

.base-table-page__selected {
  color: var(--pc-text-color-2);
  font-size: var(--pc-font-size-base);
  white-space: nowrap;
}

@media (max-width: 960px) {
  .base-table-page__filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .base-table-page__filter-grid {
    grid-template-columns: 1fr;
  }

  .base-table-page__toolbar,
  .base-table-page__pagination {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
