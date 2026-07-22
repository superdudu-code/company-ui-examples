<template>
  <div class="page-container">
    <section class="filter-wrap">
      <NForm :model="searchParams" label-placement="left" class="filter-wrap-grid">
        <NFormItem label="商品分类" class="grid-item4">
          <NRadioGroup v-model:value="searchParams.category" clearable placeholder="请输入商品名称">
            <NRadioButton v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="商品名称">
          <NInput v-model:value="searchParams.name" clearable placeholder="请输入商品名称" @keyup.enter="handleSearch" />
        </NFormItem>
        <NFormItem label="商品分类">
          <NSelect v-model:value="searchParams.category" clearable :options="categoryOptions" placeholder="请选择商品分类" />
        </NFormItem>
        <NFormItem label="国家">
          <PcCountrySelect v-model:value="searchParams.country" placeholder="请选择国家" />
        </NFormItem>
        <NFormItem label="商品状态">
          <NSelect v-model:value="searchParams.status" clearable :options="statusOptions" placeholder="请选择商品状态" />
        </NFormItem>
        <NFormItem label="库存状态">
          <NSelect v-model:value="searchParams.stock" :options="stockOptions" placeholder="请选择库存状态" />
        </NFormItem>
        <NFormItem label="库存状态">
          <NSelect v-model:value="searchParams.stock" :options="stockOptions" placeholder="请选择库存状态" />
        </NFormItem>
        <NFormItem label="">
          <NButton type="primary" @click="handleSearch">查询</NButton>
          <NButton style="margin-left: 10px" @click="handleReset">重置</NButton>
        </NFormItem>
      </NForm>
    </section>

    <section class="tool-wrap">
      <div class="btn-wrap">
        <NButton type="primary" @click="handleSearch">新增商品</NButton>
        <NButton type="primary" secondary :disabled="selectIds.length === 0" @click="handleSearch">批量xx操作</NButton>
        <NButton @click="handleSearch">更次要的</NButton>
      </div>
      <div class="btn-right-wrap">
        <div class="tip">Tips：文字提示~</div>
        <div class="line"></div>
        <NButton text @click="queryData" data-report-name="刷新">
          <NIcon :component="ReloadOutline" :class="{ 'loading-icon': loading }"></NIcon>
        </NButton>
        <NButton
          text
          tag="a"
          href="https://docs.puture-in.com/docs/dawnwinerp_manual/WorkOrderManagement"
          target="_blank"
          data-report-name="帮助文档"
        >
          <NIcon :component="HelpCircleOutline"></NIcon>
        </NButton>
      </div>
    </section>

    <section class="table-wrap">
      <NDataTable
        :checked-row-keys="selectIds"
        class="page-table"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="false"
        table-layout="fixed"
        flex-height
        size="small"
        :row-key="row => row.id"
        :row-props="rowProps"
        :scroll-x="1160"
        @update:checked-row-keys="handleCheckedRowChange"
      />
    </section>

    <section class="page-wrap">
      <div class="base-table-page__selected">
        <NDropdown v-if="selectRows.length > 0" trigger="hover" :options="selectOption" @select="handleSelectCall">
          <NButton size="small" quaternary type="primary" icon-placement="right">
            已选中 {{ selectRows.length }} 条数据
            <template #icon>
              <NIcon :component="ChevronDown" size="14"></NIcon>
            </template>
          </NButton>
        </NDropdown>
      </div>
      <NPagination
        :page="pageParams.current"
        :item-count="total"
        :page-size="pageParams.size"
        :page-sizes="[10, 20, 30, 50]"
        show-size-picker
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </section>
  </div>
</template>

<script setup lang="tsx">
import { onBeforeUnmount } from 'vue'
import { moneyFormat, usePageSearch, useTableSelect } from '@puture-ui/capabilities'
import { PcCountrySelect } from '@puture-ui/business'
import { PcTableImagePreview } from '@puture-ui/ui'
import type { DataTableColumns } from 'naive-ui'
import {
  NButton,
  NDataTable,
  NDropdown,
  NForm,
  NFormItem,
  NInput,
  NPagination,
  NSelect,
  NTag,
  NIcon,
  NRadioGroup,
  NRadioButton
} from 'naive-ui'
import { productStatusText, type ProductCategory, type ProductItem, type ProductStatus } from '@/api/list/mock'
import { ChevronDown, HelpCircleOutline, ReloadOutline } from '@vicons/ionicons5'
import { queryProductList } from '@/api/list/api'

type SearchForm = {
  name: string
  category: ProductCategory | null
  country: string | null
  status: ProductStatus | null
  stock: 'all' | 'in-stock' | 'empty'
}

type ProductPageParams = {
  current: number
  size: number
}

const defaultSearchParams: SearchForm = {
  name: '',
  category: null,
  country: null,
  status: null,
  stock: 'all'
}

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

/**
 * 搜索逻辑
 */
const {
  loading,
  tableData,
  total,
  searchParams,
  pageParams,
  queryData,
  handleSearch: search,
  handleResetForm,
  handlePageChange: changePage,
  handlePageSizeChange: changePageSize,
  cancelRequest
} = usePageSearch<ProductPageParams, SearchForm, ProductItem>(queryProductList, {
  defaultPageParams: {
    current: 1,
    size: 50
  },
  defaultSearchParams
})

/**
 * 表格列配置
 */
const columns: DataTableColumns<ProductItem> = [
  { type: 'selection' },
  {
    title: '商品信息',
    key: 'productInfo',
    minWidth: 260,
    render(row) {
      return (
        <div class="base-table-page__product-info">
          <PcTableImagePreview url={row.imageUrl} width={38} height={38} fit="cover" lazy />
          <div class="base-table-page__product-content">
            <div class="base-table-page__product-name">{row.name}</div>
            <div class="base-table-page__product-sku">SKU：{row.sku}</div>
          </div>
        </div>
      )
    }
  },
  { title: '产地', key: 'country', width: 120 },
  { title: '分类', key: 'category', width: 100 },
  {
    title: '价格',
    key: 'price',
    width: 128,
    align: 'right',
    render(row) {
      return moneyFormat(row.price, { preUnit: '¥' })
    }
  },
  { title: '库存', key: 'stock', width: 88, align: 'right' },
  { title: '销量', key: 'sales', width: 88, align: 'right' },
  {
    title: '状态',
    key: 'status',
    width: 96,
    align: 'center',
    render(row) {
      return <NTag size="small" type={statusTagType[row.status]}>{productStatusText[row.status]}</NTag>
    }
  },
  { title: '更新时间', key: 'updatedAt', width: 130 },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render(row) {
      return (
        <div class="table-btn-wrap">
          <NButton text type="primary" onClick={() => handleEdit(row)}>编辑</NButton>
          <NButton text type="error" onClick={() => handleDelete(row)}>删除</NButton>
        </div>
      )
    }
  }
]

/**
 * 表格选择逻辑
 */
const { selectRows, selectIds, selectOption, handleSelectCall, handleCheckedRowChange, rowProps, handleUnSelect } = useTableSelect<
  ProductItem,
  number
>({
  primaryRowKeyFn: row => row.id
})

/** 清空已选数据并执行查询。 */
function queryWithSelectionClear() {
  handleUnSelect()
  return queryData()
}

/** 应用筛选条件。 */
function handleSearch() {
  handleUnSelect()
  return search()
}

/** 清空筛选条件和已选数据。 */
function handleReset() {
  handleUnSelect()
  handleResetForm()
  return search()
}

/** 提示当前编辑的数据。 */
function handleEdit(row: ProductItem) {
  window.alert(`编辑：${row.name}`)
}

/** 提示当前删除的数据。 */
function handleDelete(row: ProductItem) {
  window.alert(`删除：${row.name}`)
}

/** 切换页码并清空已选数据。 */
function handlePageChange(page: number) {
  handleUnSelect()
  return changePage(page)
}

/** 切换每页条数并清空已选数据。 */
function handlePageSizeChange(size: number) {
  handleUnSelect()
  return changePageSize(size)
}

queryWithSelectionClear()
onBeforeUnmount(() => {
  cancelRequest()
})
</script>

<style lang="scss" scoped>
@use '@/styles/base-table-page' as tablePage;
</style>
