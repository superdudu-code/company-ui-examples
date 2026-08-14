<template>
  <div ref="pageContainerRef" class="page-container">
    <section class="filter-wrap">
      <NForm :model="searchParams" label-placement="left" size="small" label-width="70px" class="filter-wrap-grid">
        <NFormItem label="商品分类" class="grid-item4">
          <NRadioGroup v-model:value="searchParams.category" clearable placeholder="请输入商品名称">
            <NRadioButton v-for="option in productCategoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem label="商品名称">
          <NInput v-model:value="searchParams.name" clearable placeholder="请输入商品名称" @keyup.enter="handleSearch" />
        </NFormItem>
        <NFormItem label="品牌">
          <PcBrandSelect v-model:value="searchParams.brand" clearable value-field="goodsBrandName" placeholder="请选择品牌" />
        </NFormItem>
        <NFormItem label="商品分类">
          <NSelect v-model:value="searchParams.category" clearable :options="productCategoryOptions" placeholder="请选择商品分类" />
        </NFormItem>
        <NFormItem label="国家">
          <PcCountrySelect v-model:value="searchParams.country" placeholder="请选择国家" />
        </NFormItem>
        <NFormItem label="商品状态">
          <NSelect v-model:value="searchParams.status" clearable :options="productStatusOptions" placeholder="请选择商品状态" />
        </NFormItem>
        <NFormItem label="库存状态">
          <NSelect v-model:value="searchParams.stock" :options="productStockOptions" placeholder="请选择库存状态" />
        </NFormItem>
        <NFormItem label="库存状态">
          <NSelect v-model:value="searchParams.stock" :options="productStockOptions" placeholder="请选择库存状态" />
        </NFormItem>
        <NFormItem label="">
          <NButton type="primary" @click="handleSearch">查询</NButton>
          <NButton style="margin-left: 10px" @click="handleReset">重置</NButton>
        </NFormItem>
      </NForm>
    </section>

    <ExtensionWrap :table-data="tableData" />

    <section class="table-section">
      <section ref="toolbarRef" class="tool-wrap">
        <div class="btn-wrap">
          <NButton type="primary" size="small" @click="handleCreate">新增商品</NButton>
          <NButton type="primary" size="small" secondary :disabled="selectIds.length === 0" @click="handleSearch">批量xx操作</NButton>
          <NButton size="small" @click="handleSearch">更次要的</NButton>
        </div>
        <div class="btn-right-wrap">
          <div class="tip">Tips：鼠标移到表格区域，按住 shift + 鼠标滚轮，可以直接横向滚动噢~</div>
          <div class="line"></div>
          <NButton size="small" text @click="queryData" data-report-name="刷新">
            <NIcon :component="ReloadOutline" :class="{ 'loading-icon': loading }"></NIcon>
          </NButton>
          <NButton
            size="small"
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

      <section ref="tableContainerRef" class="table-wrap" :class="{ 'header-fixed': headerFixed }">
        <NDataTable
          ref="tableRef"
          :checked-row-keys="selectIds"
          class="page-table"
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :pagination="false"
          table-layout="fixed"
          size="small"
          :row-key="row => row.id"
          :row-props="rowProps"
          :scroll-x="2000"
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
    </section>

    <BaseDialogForm ref="baseDialogFormRef" @success="queryWithSelectionClear" />
  </div>
</template>

<script setup lang="tsx">
import { onBeforeUnmount, ref } from 'vue'
import { moneyFormat, usePageSearch, useTableSelect } from '@puture-ui/capabilities'
import { PcBrandSelect, PcCountrySelect } from '@puture-ui/business'
import { PcTableImagePreview, PcTableOrdering } from '@puture-ui/ui'
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
import { productStatusText, type ProductItem } from '@/api/list/mock'
import { ChevronDown, HelpCircleOutline, ReloadOutline } from '@vicons/ionicons5'
import { queryProductList, type ProductPageParams } from '@/api/list/api'
import { usePageScrollTable } from '@/hooks/use-page-scroll-table'
import {
  defaultProductSearchParams,
  productCategoryOptions,
  productStatusOptions,
  productStatusTagType,
  productStockOptions,
  productTagType,
  productTypeTagType,
  type ProductSearchForm
} from '../product-list-config'
import BaseDialogForm from '../base-table/components/base-dialog-form/index.vue'
import ExtensionWrap from './components/extension-wrap.vue'

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
} = usePageSearch<ProductPageParams, ProductSearchForm, ProductItem>(queryProductList, {
  defaultPageParams: {
    current: 1,
    size: 50,
    orders: [{ column: 'updatedAt', asc: false }]
  },
  defaultSearchParams: defaultProductSearchParams
})

const columns: DataTableColumns<ProductItem> = [
  { type: 'selection', fixed: 'left' },
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
  { title: '品牌', key: 'brand', width: 110 },
  { title: '型号', key: 'model', width: 132 },
  { title: '产地', key: 'country', width: 120 },
  { title: '分类', key: 'category', width: 100 },
  {
    title: '产品类型',
    key: 'productType',
    width: 110,
    align: 'center',
    render(row) {
      return (
        <NTag size="small" type={productTypeTagType[row.productType]} bordered={false}>
          {row.productType}
        </NTag>
      )
    }
  },
  {
    title: '标签',
    key: 'tags',
    width: 220,
    render(row) {
      return (
        <div class="base-table-page__tag-list">
          {row.tags.map(tag => (
            <NTag key={tag} size="small" type={productTagType[tag]} bordered={false}>
              {tag}
            </NTag>
          ))}
        </div>
      )
    }
  },
  {
    title: () => (
      <PcTableOrdering v-model:value={pageParams.value.orders} keyName="price" single onChange={handleSearch}>
        价格
      </PcTableOrdering>
    ),
    key: 'price',
    width: 128,
    align: 'right',
    render(row) {
      return moneyFormat(row.price, { preUnit: '¥' })
    }
  },
  { title: '采购员', key: 'purchaser', width: 96 },
  { title: '开发员', key: 'developer', width: 96 },
  { title: '库存', key: 'stock', width: 88, align: 'right' },
  { title: '销量', key: 'sales', width: 88, align: 'right' },
  {
    title: '状态',
    key: 'status',
    width: 96,
    align: 'center',
    render(row) {
      return (
        <NTag size="small" type={productStatusTagType[row.status]}>
          {productStatusText[row.status]}
        </NTag>
      )
    }
  },
  {
    title: () => (
      <PcTableOrdering v-model:value={pageParams.value.orders} keyName="updatedAt" single onChange={handleSearch}>
        更新时间
      </PcTableOrdering>
    ),
    key: 'updatedAt',
    width: 130
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render(row) {
      return (
        <div class="table-btn-wrap">
          <NButton text type="primary" onClick={() => handleEdit(row)}>
            编辑
          </NButton>
          <NButton text type="error" onClick={() => handleDelete(row)}>
            删除
          </NButton>
        </div>
      )
    }
  }
]

const { selectRows, selectIds, selectOption, handleSelectCall, handleCheckedRowChange, rowProps, handleUnSelect } = useTableSelect<
  ProductItem,
  number
>({
  primaryRowKeyFn: row => row.id
})

const baseDialogFormRef = ref<InstanceType<typeof BaseDialogForm> | null>(null)
const { pageContainerRef, toolbarRef, tableContainerRef, tableRef, headerFixed, scrollToTableTop } = usePageScrollTable()

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

/** 打开新增商品弹窗。 */
function handleCreate() {
  baseDialogFormRef.value?.open('create')
}

/** 打开编辑商品弹窗。 */
function handleEdit(row: ProductItem) {
  baseDialogFormRef.value?.open('edit', row)
}

/** 提示当前删除的数据。 */
function handleDelete(row: ProductItem) {
  window.alert(`删除：${row.name}`)
}

/** 切换页码并将视口定位到表格顶部。 */
async function handlePageChange(page: number) {
  handleUnSelect()
  await changePage(page)
  scrollToTableTop()
}

/** 切换每页条数并将视口定位到表格顶部。 */
async function handlePageSizeChange(size: number) {
  handleUnSelect()
  await changePageSize(size)
  scrollToTableTop()
}

queryWithSelectionClear()
onBeforeUnmount(() => {
  cancelRequest()
})
</script>

<style lang="scss" scoped>
@use '@/styles/page-scroll-table-page' as pageScrollTablePage;

:deep(.page-table) {
  .base-table-page__product-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .base-table-page__product-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .base-table-page__product-name {
    overflow: hidden;
    color: var(--pc-text-color-1);
    font-weight: var(--pc-font-weight-strong);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .base-table-page__product-sku {
    overflow: hidden;
    color: var(--pc-text-color-3);
    font-size: var(--pc-font-size-small);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .base-table-page__tag-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }
}
</style>
