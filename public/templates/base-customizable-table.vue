<template>
  <NMessageProvider>
    <div class="page-container">
      <section class="filter-wrap">
        <PcSearchForm
          :model="searchParams"
          :default-values="defaultProductSearchParams"
          :fields="searchFields"
          :search-view="searchViewOptions"
          :loading="loading"
          :column-count="4"
          size="small"
          label-placement="left"
          :label-width="70"
          @search="handleSearch"
          @reset="handleSearch"
          @view-applied="handleSearch"
        />
      </section>

      <section class="tool-wrap">
        <div class="btn-wrap">
          <NButton type="primary" size="small" @click="handleCreate">新增商品</NButton>
          <NButton type="primary" size="small" secondary :disabled="selectIds.length === 0" @click="handleSearch">批量xx操作</NButton>
          <NButton size="small" @click="handleSearch">更次要的</NButton>
        </div>
        <div class="btn-right-wrap">
          <div class="tip">Tips：鼠标移到表格区域，按住 shift + 鼠标滚轮，可以直接横向滚动噢~</div>
          <div class="line"></div>
          <NButton size="small" secondary @click="openColumnCustomizer">
            <template #icon>
              <NIcon :component="OptionsOutline"></NIcon>
            </template>
            列配置
          </NButton>
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

      <section class="table-wrap">
        <PcTableColumnCustomizer
          ref="columnCustomizerRef"
          table-key="docs:example-base-table"
          :columns="columns"
          @error="handleColumnCustomizerError"
        >
          <template #default="{ ready, columns: displayColumns, scrollX }">
            <NDataTable
              v-if="ready"
              :checked-row-keys="selectIds"
              class="page-table"
              :columns="displayColumns"
              :data="tableData"
              :loading="loading"
              :pagination="false"
              table-layout="fixed"
              flex-height
              size="small"
              :row-key="row => row.id"
              :row-props="rowProps"
              :scroll-x="scrollX"
              @update:checked-row-keys="handleCheckedRowChange"
            />
            <div v-else class="base-customizable-table__loading">
              <NSpin size="small" />
            </div>
          </template>
        </PcTableColumnCustomizer>
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

      <!-- 新增/编辑商品弹窗 -->
      <BaseDialogForm ref="baseDialogFormRef" @success="queryWithSelectionClear" />
    </div>
  </NMessageProvider>
</template>

<script setup lang="tsx">
import { onBeforeUnmount, ref } from 'vue'
import { moneyFormat, usePageSearch, useTableSelect } from '@puture-ui/capabilities'
import {
  PcBrandSelect,
  PcCountrySelect,
  PcSearchForm,
  PcTableColumnCustomizer,
  type PcSearchFormFields,
  type PcSearchViewOptions,
  type PcTableColumnCustomizerError,
  type PcTableColumnCustomizerExpose,
  type PcTableCustomColumns
} from '@puture-ui/business'
import { PcTableImagePreview, PcTableOrdering } from '@puture-ui/ui'
import {
  NButton,
  NDataTable,
  NDropdown,
  NInput,
  NMessageProvider,
  NPagination,
  NSelect,
  NSpin,
  NTag,
  NIcon,
  NRadioGroup,
  NRadioButton
} from 'naive-ui'
import { productStatusText, type ProductItem } from '@/api/list/mock'
import { ChevronDown, HelpCircleOutline, OptionsOutline, ReloadOutline } from '@vicons/ionicons5'
import { queryProductList, type ProductPageParams } from '@/api/list/api'
import {
  defaultProductSearchParams,
  productCategoryOptions,
  productStatusOptions,
  productStatusTagType,
  productTagType,
  productTypeTagType,
  type ProductSearchForm
} from '../product-list-config'
import BaseDialogForm from '../base-table/components/base-dialog-form/index.vue'

const searchViewOptions: PcSearchViewOptions = {
  pageKey: 'docs:example-base-customizable-table'
}

/**
 * 搜索表单字段配置
 */
const searchFields = [
  {
    key: 'category',
    label: '商品分类',
    span: 4,
    render(model) {
      return (
        <NRadioGroup v-model:value={model.category}>
          {productCategoryOptions.map(option => (
            <NRadioButton key={option.value} value={option.value}>
              {option.label}
            </NRadioButton>
          ))}
        </NRadioGroup>
      )
    }
  },
  {
    key: 'name',
    label: '商品名称',
    render(model, { search }) {
      return (
        <NInput
          v-model:value={model.name}
          clearable
          placeholder="请输入商品名称"
          onKeyup={event => {
            if (event.key === 'Enter') search()
          }}
        />
      )
    }
  },
  {
    key: 'brand',
    label: '品牌',
    render(model) {
      return (
        <PcBrandSelect
          v-model:value={model.brand}
          clearable
          value-field="goodsBrandName"
          placeholder="请选择品牌"
        />
      )
    }
  },
  {
    key: 'country',
    label: '国家',
    render(model) {
      return (
        <PcCountrySelect
          v-model:value={model.country}
          clearable
          placeholder="请选择国家"
        />
      )
    }
  },
  {
    key: 'status',
    label: '商品状态',
    render(model) {
      return (
        <NSelect
          v-model:value={model.status}
          clearable
          options={productStatusOptions}
          placeholder="请选择商品状态"
        />
      )
    }
  }
] satisfies PcSearchFormFields<ProductSearchForm>

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

/**
 * 表格列配置
 */
const columns: PcTableCustomColumns<ProductItem> = [
  { type: 'selection' },
  {
    title: '商品信息',
    key: 'productInfo',
    minWidth: 260,
    pcCustom: {
      group: '基础信息',
      required: true
    },
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
  { title: '品牌', key: 'brand', width: 110, pcCustom: { group: '基础信息' } },
  { title: '型号', key: 'model', width: 132, pcCustom: { group: '基础信息' } },
  { title: '产地', key: 'country', width: 120, pcCustom: { group: '商品属性' } },
  { title: '分类', key: 'category', width: 100, pcCustom: { group: '商品属性' } },
  {
    title: '产品类型',
    key: 'productType',
    width: 110,
    align: 'center',
    pcCustom: {
      group: '商品属性'
    },
    render(row) {
      return <NTag size="small" type={productTypeTagType[row.productType]} bordered={false}>{row.productType}</NTag>
    }
  },
  {
    title: '标签',
    key: 'tags',
    width: 220,
    pcCustom: {
      group: '商品属性'
    },
    render(row) {
      return (
        <div class="base-table-page__tag-list">
          {row.tags.map(tag => (
            <NTag key={tag} size="small" type={productTagType[tag]} bordered={false}>{tag}</NTag>
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
    pcCustom: {
      label: '价格',
      group: '经营数据'
    },
    render(row) {
      return moneyFormat(row.price, { preUnit: '¥' })
    }
  },
  { title: '采购员', key: 'purchaser', width: 96, pcCustom: { group: '人员信息' } },
  { title: '开发员', key: 'developer', width: 96, pcCustom: { group: '人员信息' } },
  { title: '库存', key: 'stock', width: 88, align: 'right', pcCustom: { group: '经营数据' } },
  { title: '销量', key: 'sales', width: 88, align: 'right', pcCustom: { group: '经营数据' } },
  {
    title: '状态',
    key: 'status',
    width: 96,
    align: 'center',
    pcCustom: {
      group: '状态时间'
    },
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
    width: 130,
    pcCustom: {
      label: '更新时间',
      group: '状态时间'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    pcCustom: {
      group: '基础信息',
      required: true
    },
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

/**
 * 表格选择逻辑
 */
const { selectRows, selectIds, selectOption, handleSelectCall, handleCheckedRowChange, rowProps, handleUnSelect } = useTableSelect<
  ProductItem,
  number
>({
  primaryRowKeyFn: row => row.id
})
const columnCustomizerRef = ref<PcTableColumnCustomizerExpose | null>(null)
const baseDialogFormRef = ref<InstanceType<typeof BaseDialogForm> | null>(null)

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

/** 打开表格列配置弹窗。 */
function openColumnCustomizer() {
  columnCustomizerRef.value?.open()
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

/** 记录列偏好加载、保存或迁移错误。 */
function handleColumnCustomizerError(error: PcTableColumnCustomizerError) {
  console.warn('表格列配置处理失败：', error)
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

.base-customizable-table__loading {
  display: grid;
  height: 100%;
  place-items: center;
}

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
