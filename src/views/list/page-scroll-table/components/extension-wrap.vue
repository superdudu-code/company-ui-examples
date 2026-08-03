<template>
  <section class="extension-wrap" aria-label="当前页数据概览">
    <div class="overview-wrap" aria-label="数据概览">
      <article v-for="item in overviewItems" :key="item.label" class="overview-item" :class="`overview-item--${item.tone}`">
        <div class="overview-label">{{ item.label }}</div>
        <div class="overview-value">
          {{ numberFormatter.format(item.value) }}<span class="overview-suffix">{{ item.suffix }}</span>
        </div>
        <div class="overview-description">{{ item.description }}</div>
      </article>
    </div>

    <div class="chart-wrap">
      <header class="chart-header">
        <div>
          <h2 class="extension-title">当前页分类概览</h2>
        </div>
        <div class="chart-legend" aria-label="图表图例">
          <span><i class="chart-legend-dot chart-legend-dot--stock"></i>库存</span>
          <span><i class="chart-legend-dot chart-legend-dot--sales"></i>销量</span>
        </div>
      </header>

      <div ref="chartSurfaceRef" class="chart-surface">
        <svg
          v-if="chartItems.length > 0"
          class="category-chart"
          :width="chartWidth"
          :height="CHART_HEIGHT"
          :viewBox="`0 0 ${chartWidth} ${CHART_HEIGHT}`"
          role="img"
          aria-label="当前页各商品分类的库存与销量图表"
          focusable="false"
        >
          <title>当前页各商品分类的库存与销量</title>

          <g class="chart-grid" aria-hidden="true">
            <g v-for="tick in chartModel.axisTicks" :key="tick.y">
              <line
                :x1="CHART_PADDING.left"
                :x2="chartWidth - CHART_PADDING.right"
                :y1="tick.y"
                :y2="tick.y"
              />
              <text :x="CHART_PADDING.left - 12" :y="tick.y + 4" text-anchor="end">{{ tick.stockLabel }}</text>
              <text :x="chartWidth - CHART_PADDING.right + 12" :y="tick.y + 4" text-anchor="start">
                {{ tick.salesLabel }}
              </text>
            </g>
            <line
              v-for="point in chartModel.points"
              :key="`${point.label}-grid`"
              :x1="point.x"
              :x2="point.x"
              :y1="CHART_PADDING.top"
              :y2="chartModel.baseline"
              class="chart-grid-vertical"
            />
          </g>

          <path :d="chartModel.stockAreaPath" class="chart-area chart-area--stock" />
          <path :d="chartModel.salesAreaPath" class="chart-area chart-area--sales" />
          <path :d="chartModel.stockPath" class="chart-line chart-line--stock" />
          <path :d="chartModel.salesPath" class="chart-line chart-line--sales" />

          <g v-for="point in chartModel.points" :key="point.label" class="chart-point">
            <circle :cx="point.x" :cy="point.stockY" r="4" class="chart-point-dot chart-point-dot--stock">
              <title>{{ point.label }}库存：{{ numberFormatter.format(point.stock) }}</title>
            </circle>
            <circle :cx="point.x" :cy="point.salesY" r="4" class="chart-point-dot chart-point-dot--sales">
              <title>{{ point.label }}销量：{{ numberFormatter.format(point.sales) }}</title>
            </circle>
            <text :x="point.x" :y="CHART_HEIGHT - 14" text-anchor="middle" class="chart-axis-label">
              {{ point.label }}
            </text>
          </g>
        </svg>
        <div v-else class="chart-empty">暂无当前页分类数据</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ProductItem, ProductStatus } from '@/api/list/mock'

type OverviewTone = 'primary' | 'success' | 'danger' | 'neutral' | 'stock' | 'sales'

type OverviewItem = {
  label: string
  value: number
  suffix: string
  description: string
  tone: OverviewTone
}

type StatusOverviewDefinition = {
  label: string
  status: ProductStatus
  tone: OverviewTone
}

type CategoryAggregate = {
  label: ProductItem['category']
  stock: number
  sales: number
}

type ChartCoordinate = {
  x: number
  y: number
}

const CHART_HEIGHT = 300
const MIN_CHART_WIDTH = 760
const CHART_PADDING = {
  top: 22,
  right: 64,
  bottom: 48,
  left: 64
} as const

const numberFormatter = new Intl.NumberFormat('zh-CN')
const percentageFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 0
})
const axisNumberFormatter = new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  maximumFractionDigits: 1
})

const statusOverviewDefinitions = [
  { label: '在售商品', status: 'selling', tone: 'success' },
  { label: '售罄商品', status: 'sold-out', tone: 'danger' },
  { label: '草稿商品', status: 'draft', tone: 'neutral' }
] satisfies StatusOverviewDefinition[]

const props = defineProps<{
  tableData: ProductItem[]
}>()

const chartSurfaceRef = ref<HTMLDivElement | null>(null)
const chartWidth = ref(MIN_CHART_WIDTH)
let resizeObserver: ResizeObserver | null = null

const overviewItems = computed<OverviewItem[]>(() => {
  const rows = props.tableData
  const statusCounts: Record<ProductStatus, number> = {
    selling: 0,
    'sold-out': 0,
    draft: 0
  }
  let totalStock = 0
  let totalSales = 0

  rows.forEach(row => {
    statusCounts[row.status] += 1
    totalStock += row.stock
    totalSales += row.sales
  })

  const statusItems = statusOverviewDefinitions.map<OverviewItem>(item => ({
    label: item.label,
    value: statusCounts[item.status],
    suffix: '项',
    description: `占比 ${percentageFormatter.format(rows.length === 0 ? 0 : statusCounts[item.status] / rows.length)}`,
    tone: item.tone
  }))

  return [
    { label: '当前页商品', value: rows.length, suffix: '项', description: '当前分页数据', tone: 'primary' },
    ...statusItems,
    { label: '当前页库存', value: totalStock, suffix: '件', description: '所有商品库存合计', tone: 'stock' },
    { label: '当前页销量', value: totalSales, suffix: '件', description: '所有商品销量合计', tone: 'sales' }
  ]
})

const chartItems = computed<CategoryAggregate[]>(() => {
  const categoryMap = new Map<ProductItem['category'], CategoryAggregate>()

  props.tableData.forEach(row => {
    const aggregate = categoryMap.get(row.category) ?? {
      label: row.category,
      stock: 0,
      sales: 0
    }

    aggregate.stock += row.stock
    aggregate.sales += row.sales
    categoryMap.set(row.category, aggregate)
  })

  return Array.from(categoryMap.values())
})

const chartModel = computed(() => {
  const items = chartItems.value
  const plotWidth = chartWidth.value - CHART_PADDING.left - CHART_PADDING.right
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom
  const baseline = CHART_PADDING.top + plotHeight
  const stockMaximum = getNiceMaximum(Math.max(...items.map(item => item.stock), 0))
  const salesMaximum = getNiceMaximum(Math.max(...items.map(item => item.sales), 0))
  const points = items.map((item, index) => ({
    ...item,
    x: getChartX(index, items.length, plotWidth),
    stockY: getChartY(item.stock, stockMaximum, plotHeight),
    salesY: getChartY(item.sales, salesMaximum, plotHeight)
  }))
  const stockCoordinates = points.map(point => ({ x: point.x, y: point.stockY }))
  const salesCoordinates = points.map(point => ({ x: point.x, y: point.salesY }))
  const axisTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4

    return {
      y: CHART_PADDING.top + plotHeight * ratio,
      stockLabel: axisNumberFormatter.format(stockMaximum * (1 - ratio)),
      salesLabel: axisNumberFormatter.format(salesMaximum * (1 - ratio))
    }
  })

  return {
    points,
    axisTicks,
    baseline,
    stockPath: createLinePath(stockCoordinates),
    salesPath: createLinePath(salesCoordinates),
    stockAreaPath: createAreaPath(stockCoordinates, baseline),
    salesAreaPath: createAreaPath(salesCoordinates, baseline)
  }
})

/** 将图表横坐标均匀分布在绘图区内。 */
function getChartX(index: number, count: number, plotWidth: number) {
  if (count <= 1) return CHART_PADDING.left + plotWidth / 2
  return CHART_PADDING.left + (plotWidth * index) / (count - 1)
}

/** 将业务数值映射为图表纵坐标。 */
function getChartY(value: number, maximum: number, plotHeight: number) {
  return CHART_PADDING.top + plotHeight * (1 - value / maximum)
}

/** 计算适合坐标轴展示的向上取整最大值。 */
function getNiceMaximum(value: number) {
  if (value <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalizedValue = value / magnitude
  const roundedValue = normalizedValue <= 1 ? 1 : normalizedValue <= 2 ? 2 : normalizedValue <= 5 ? 5 : 10

  return roundedValue * magnitude
}

/** 根据坐标点生成折线路径。 */
function createLinePath(points: ChartCoordinate[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

/** 根据坐标点生成闭合面积路径。 */
function createAreaPath(points: ChartCoordinate[], baseline: number) {
  if (points.length === 0) return ''

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const lineCommands = points.map(point => `L ${point.x} ${point.y}`).join(' ')

  return `M ${firstPoint.x} ${baseline} ${lineCommands} L ${lastPoint.x} ${baseline} Z`
}

/** 根据容器宽度同步图表画布，窄屏保留横向滚动。 */
function syncChartWidth() {
  const surfaceWidth = chartSurfaceRef.value?.clientWidth
  if (!surfaceWidth) return
  chartWidth.value = Math.max(MIN_CHART_WIDTH, Math.floor(surfaceWidth))
}

onMounted(() => {
  syncChartWidth()
  resizeObserver = new ResizeObserver(syncChartWidth)
  if (chartSurfaceRef.value) resizeObserver.observe(chartSurfaceRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
.extension-wrap {
  margin-top: 10px;
  padding: 14px;
  border-radius: 4px;
  background-color: var(--pc-fill-card, #fff);
  box-shadow: var(--section-box-shadow);
}

.overview-wrap {
  display: grid;
  grid-template-columns: repeat(6, minmax(150px, 1fr));
  gap: 10px;
  overflow-x: auto;
  padding: 1px 1px 4px;
  scrollbar-width: thin;
}

.overview-item {
  --overview-accent: #4f7cff;

  position: relative;
  min-width: 0;
  min-height: 92px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 12px 14px 11px 16px;
  border-radius: 4px;
  background-color: var(--pc-fill-card, #fff);
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 6%),
    0 1px 2px -1px rgb(0 0 0 / 6%),
    0 2px 4px rgb(0 0 0 / 4%);

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    border-radius: 4px 0 0 4px;
    background-color: var(--overview-accent);
    content: '';
  }

  &--success {
    --overview-accent: #18a058;
  }

  &--danger {
    --overview-accent: #d03050;
  }

  &--neutral {
    --overview-accent: #8b5cf6;
  }

  &--stock {
    --overview-accent: #36adff;
  }

  &--sales {
    --overview-accent: #ff718d;
  }
}

.overview-label {
  color: var(--pc-text-color-2);
  font-size: var(--pc-font-size-small);
  text-wrap: pretty;
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

.overview-description {
  margin-top: 6px;
  overflow: hidden;
  color: var(--pc-text-color-3);
  font-size: 12px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-wrap {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--pc-border-color-divider);
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px 8px;
}

.extension-title {
  margin: 0;
  color: var(--pc-text-color-1);
  font-size: var(--pc-font-size-body);
  font-weight: var(--pc-font-weight-strong);
  text-wrap: balance;
}

.chart-description {
  margin: 4px 0 0;
  color: var(--pc-text-color-3);
  font-size: 12px;
  text-wrap: pretty;
}

.chart-legend {
  display: flex;
  flex: none;
  align-items: center;
  gap: 18px;
  min-height: 24px;
  color: var(--pc-text-color-2);
  font-size: 12px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.chart-legend-dot {
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background-color: #36adff;

  &--sales {
    background-color: #ff718d;
  }
}

.chart-surface {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.category-chart {
  display: block;
  overflow: visible;
  font-variant-numeric: tabular-nums;
}

.chart-grid {
  color: var(--pc-text-color-3);
  font-size: 11px;

  line {
    stroke: var(--pc-border-color-divider);
    stroke-dasharray: 4 4;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .chart-grid-vertical {
    stroke-dasharray: none;
    opacity: 0.55;
  }
}

.chart-area {
  stroke: none;

  &--stock {
    fill: rgb(54 173 255 / 12%);
  }

  &--sales {
    fill: rgb(255 113 141 / 7%);
  }
}

.chart-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;

  &--stock {
    stroke: #36adff;
  }

  &--sales {
    stroke: #ff718d;
  }
}

.chart-point-dot {
  fill: var(--pc-fill-card, #fff);
  stroke-width: 2;
  cursor: crosshair;
  vector-effect: non-scaling-stroke;

  &--stock {
    stroke: #36adff;
  }

  &--sales {
    stroke: #ff718d;
  }
}

.chart-axis-label {
  fill: var(--pc-text-color-2);
  font-size: 12px;
}

.chart-empty {
  display: grid;
  min-height: 260px;
  place-items: center;
  color: var(--pc-text-color-3);
  font-size: var(--pc-font-size-small);
}

@media (max-width: 768px) {
  .extension-wrap {
    padding: 12px;
  }

  .overview-wrap {
    grid-template-columns: repeat(6, 150px);
  }

  .chart-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
