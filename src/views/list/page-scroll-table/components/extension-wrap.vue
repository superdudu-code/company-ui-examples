<template>
  <section class="extension-wrap">
    <div class="overview-wrap" aria-label="数据概览">
      <div v-for="item in overviewItems" :key="item.label" class="overview-item">
        <div class="overview-label">{{ item.label }}</div>
        <div class="overview-value">
          {{ item.value }}<span class="overview-suffix">{{ item.suffix }}</span>
        </div>
      </div>
    </div>
    <div class="distribution-wrap">
      <h2 class="extension-title">当前页状态分布</h2>
      <div class="distribution-list">
        <div v-for="item in distributionItems" :key="item.label" class="distribution-item">
          <span>{{ item.label }}</span>
          <NProgress type="line" :percentage="item.percentage" :show-indicator="false" :height="8" :border-radius="4" />
          <span class="distribution-value">{{ item.count }} 项</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NProgress } from 'naive-ui'
import type { ProductItem, ProductStatus } from '@/api/list/mock'

type OverviewItem = {
  label: string
  value: number
  suffix: string
}

type DistributionItem = {
  label: string
  count: number
  percentage: number
}

const props = defineProps<{
  tableData: ProductItem[]
}>()

const statusOptions = [
  { label: '在售', value: 'selling' },
  { label: '售罄', value: 'sold-out' },
  { label: '草稿', value: 'draft' }
] satisfies Array<{ label: string; value: ProductStatus }>

const overviewItems = computed<OverviewItem[]>(() => {
  const rows = props.tableData

  return [
    { label: '当前页商品', value: rows.length, suffix: '项' },
    { label: '在售商品', value: rows.filter(row => row.status === 'selling').length, suffix: '项' },
    { label: '当前页库存', value: rows.reduce((totalStock, row) => totalStock + row.stock, 0), suffix: '件' },
    { label: '当前页销量', value: rows.reduce((totalSales, row) => totalSales + row.sales, 0), suffix: '件' }
  ]
})

const distributionItems = computed<DistributionItem[]>(() => {
  const rows = props.tableData

  return statusOptions.map(option => {
    const count = rows.filter(row => row.status === option.value).length

    return {
      label: option.label,
      count,
      percentage: rows.length === 0 ? 0 : Math.round((count / rows.length) * 100)
    }
  })
})
</script>

<style lang="scss" scoped>
.extension-wrap {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.overview-wrap,
.distribution-wrap {
  border-radius: 4px;
  background-color: #fff;
  box-shadow: var(--section-box-shadow);
}

.extension-title {
  margin: 0;
  color: var(--pc-text-color-1);
  font-size: var(--pc-font-size-body);
  font-weight: var(--pc-font-weight-strong);
  text-wrap: balance;
}

.overview-wrap {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 14px 16px;
}

.overview-item {
  min-width: 0;
  padding: 0 16px;
  border-right: 1px solid var(--pc-border-color-divider);

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    border-right: 0;
  }
}

.overview-label {
  color: var(--pc-text-color-3);
  font-size: var(--pc-font-size-small);
}

.overview-value {
  margin-top: 6px;
  overflow: hidden;
  color: var(--pc-text-color-1);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  font-weight: var(--pc-font-weight-strong);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-suffix {
  margin-left: 4px;
  color: var(--pc-text-color-3);
  font-size: var(--pc-font-size-small);
  font-weight: var(--pc-font-weight-regular);
}

.distribution-wrap {
  padding: 12px 16px;
}

.distribution-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.distribution-item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
  color: var(--pc-text-color-2);
  font-size: var(--pc-font-size-small);
}

.distribution-value {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

@media (max-width: 1200px) {
  .extension-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
