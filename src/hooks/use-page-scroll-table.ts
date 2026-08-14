import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DataTableInst } from 'naive-ui'

/** 管理页面滚动、操作栏吸顶和 Naive UI 表头固定。 */
export function usePageScrollTable() {
  const pageContainerRef = ref<HTMLElement | null>(null)
  const toolbarRef = ref<HTMLElement | null>(null)
  const tableContainerRef = ref<HTMLElement | null>(null)
  const tableRef = ref<DataTableInst | null>(null)
  const headerFixed = ref(false)

  let tableHeader: HTMLElement | null = null
  let tableHeaderRow: HTMLElement | null = null
  let tableInner: HTMLElement | null = null
  let tableScrollContainer: HTMLElement | null = null
  let resizeObserver: ResizeObserver | null = null
  let headerMutationObserver: MutationObserver | null = null
  let tableMutationObserver: MutationObserver | null = null
  let animationFrameId: number | null = null
  const originalHeaderCellWidths = new Map<HTMLTableCellElement, { value: string; priority: string }>()

  /** 将表体 colgroup 的实际列宽同步到吸顶表头。 */
  function syncHeaderColumnWidths() {
    if (!tableHeader || !tableInner) return

    const tableColumns = tableInner.querySelectorAll<HTMLTableColElement>('colgroup > col')
    const headerCells = tableHeader.querySelectorAll<HTMLTableCellElement>('th')
    if (tableColumns.length !== headerCells.length) return

    const columnWidths = Array.from(tableColumns, tableColumn => tableColumn.getBoundingClientRect().width)
    headerCells.forEach((headerCell, index) => {
      const width = `${columnWidths[index]}px`
      if (headerCell.style.width === width) return

      if (!originalHeaderCellWidths.has(headerCell)) {
        originalHeaderCellWidths.set(headerCell, {
          value: headerCell.style.getPropertyValue('width'),
          priority: headerCell.style.getPropertyPriority('width')
        })
      }
      headerCell.style.width = width
    })
    headerMutationObserver?.takeRecords()
  }

  /** 清理吸顶表头写入的列宽并恢复原始样式。 */
  function restoreHeaderColumnWidths() {
    originalHeaderCellWidths.forEach(({ value, priority }, headerCell) => {
      if (value) {
        headerCell.style.setProperty('width', value, priority)
      } else {
        headerCell.style.removeProperty('width')
      }
    })
    originalHeaderCellWidths.clear()
  }

  /** 始终同步表头自然高度到 CSS 变量，保证占位符与 thead 高度一致。 */
  function syncHeaderHeightVar() {
    const tableContainer = tableContainerRef.value
    if (!tableContainer || !tableHeader) return
    tableContainer.style.setProperty('--page-scroll-table-header-height', `${tableHeader.offsetHeight}px`)
  }

  /** 同步表头宽度、左侧位置和横向滚动位置。 */
  function updateHeaderGeometry() {
    const tableContainer = tableContainerRef.value
    if (!tableContainer || !tableHeader || !tableHeaderRow || !tableInner) return

    const tableRect = tableContainer.getBoundingClientRect()
    syncHeaderHeightVar()
    tableHeader.style.left = `${tableRect.left}px`
    tableHeader.style.width = `${tableRect.width}px`
    tableHeaderRow.style.width = `${tableInner.offsetWidth}px`

    if (tableScrollContainer) {
      tableHeader.scrollLeft = tableScrollContainer.scrollLeft
    }
  }

  /** 清理吸顶时写入的定位相关 inline 样式，避免退出吸顶后残留。 */
  function clearHeaderGeometry() {
    if (!tableHeader || !tableHeaderRow) return
    tableHeader.style.removeProperty('left')
    tableHeader.style.removeProperty('width')
    tableHeader.scrollLeft = 0
    tableHeaderRow.style.removeProperty('width')
  }

  /** 根据表格相对页面滚动容器的位置切换表头吸顶状态。 */
  function updateStickyState() {
    animationFrameId = null
    refreshTableElements()

    const pageContainer = pageContainerRef.value
    const toolbar = toolbarRef.value
    const tableContainer = tableContainerRef.value
    if (!pageContainer || !toolbar || !tableContainer || !tableHeader) return

    const pageRect = pageContainer.getBoundingClientRect()
    const tableRect = tableContainer.getBoundingClientRect()
    const toolbarHeight = toolbar.offsetHeight
    const stickyBoundary = pageRect.top + toolbarHeight
    const nextHeaderFixed = tableRect.top <= stickyBoundary && tableRect.bottom > stickyBoundary + tableHeader.offsetHeight

    pageContainer.style.setProperty('--page-scroll-table-top', `${pageRect.top}px`)
    pageContainer.style.setProperty('--page-scroll-table-toolbar-height', `${toolbarHeight}px`)
    syncHeaderHeightVar()

    if (headerFixed.value !== nextHeaderFixed) {
      if (nextHeaderFixed) {
        syncHeaderColumnWidths()
        headerFixed.value = true
      } else {
        headerFixed.value = false
        void nextTick(() => {
          if (!headerFixed.value) {
            restoreHeaderColumnWidths()
            clearHeaderGeometry()
          }
        })
      }
    }

    if (nextHeaderFixed) {
      void nextTick(() => {
        if (!headerFixed.value) return
        syncHeaderColumnWidths()
        updateHeaderGeometry()
      })
    }
  }

  /** 使用动画帧合并连续滚动和尺寸变化计算。 */
  function scheduleStickyUpdate() {
    if (animationFrameId !== null) return
    animationFrameId = window.requestAnimationFrame(updateStickyState)
  }

  /** 将表体横向滚动位置同步给固定表头。 */
  function handleTableBodyScroll() {
    if (!headerFixed.value || !tableHeader || !tableScrollContainer) return
    tableHeader.scrollLeft = tableScrollContainer.scrollLeft
  }

  /** 将固定表头横向滚动位置同步给表体。 */
  function handleFixedHeaderScroll() {
    if (!headerFixed.value || !tableHeader) return
    tableRef.value?.scrollTo({ left: tableHeader.scrollLeft })
  }

  /** 重新查找 Naive UI 表格节点，并在节点变化后更新相关监听。 */
  function refreshTableElements() {
    const tableContainer = tableContainerRef.value
    if (!tableContainer) return

    const nextTableHeader = tableContainer.querySelector<HTMLElement>('.n-data-table-thead')
    const nextTableHeaderRow = nextTableHeader?.querySelector<HTMLElement>('.n-data-table-tr') ?? null
    const nextTableScrollContainer = tableContainer.querySelector<HTMLElement>('.n-scrollbar-container')
    const nextTableInner = nextTableScrollContainer?.querySelector<HTMLElement>('.n-data-table-table') ?? null
    const elementsChanged =
      tableHeader !== nextTableHeader ||
      tableHeaderRow !== nextTableHeaderRow ||
      tableScrollContainer !== nextTableScrollContainer ||
      tableInner !== nextTableInner

    if (!elementsChanged) return

    tableScrollContainer?.removeEventListener('scroll', handleTableBodyScroll)
    tableHeader?.removeEventListener('scroll', handleFixedHeaderScroll)
    if (tableHeader) resizeObserver?.unobserve(tableHeader)
    headerMutationObserver?.disconnect()
    restoreHeaderColumnWidths()
    clearHeaderGeometry()

    tableHeader = nextTableHeader
    tableHeaderRow = nextTableHeaderRow
    tableScrollContainer = nextTableScrollContainer
    tableInner = nextTableInner

    if (!tableHeader || !tableHeaderRow || !tableInner || !tableScrollContainer) return

    tableScrollContainer.addEventListener('scroll', handleTableBodyScroll, { passive: true })
    tableHeader.addEventListener('scroll', handleFixedHeaderScroll, { passive: true })
    resizeObserver?.observe(tableHeader)

    headerMutationObserver?.observe(tableHeader, { attributes: true, childList: true, subtree: true })
  }

  /** 查找 Naive UI 表格节点并注册滚动、尺寸监听。 */
  function initializePageScrollTable() {
    const pageContainer = pageContainerRef.value
    const toolbar = toolbarRef.value
    const tableContainer = tableContainerRef.value
    if (!pageContainer || !toolbar || !tableContainer) return

    pageContainer.addEventListener('scroll', scheduleStickyUpdate, { passive: true })
    window.addEventListener('resize', scheduleStickyUpdate, { passive: true })

    resizeObserver = new ResizeObserver(scheduleStickyUpdate)
    resizeObserver.observe(pageContainer)
    resizeObserver.observe(toolbar)
    resizeObserver.observe(tableContainer)

    // Naive UI 会在勾选、排序等状态变化时重写表头单元格样式。
    headerMutationObserver = new MutationObserver(mutations => {
      if (!headerFixed.value) return

      const headerChanged = mutations.some(
        mutation =>
          mutation.type === 'childList' || (mutation.target !== tableHeader && mutation.target !== tableHeaderRow)
      )
      if (headerChanged) scheduleStickyUpdate()
    })

    tableMutationObserver = new MutationObserver(scheduleStickyUpdate)
    tableMutationObserver.observe(tableContainer, { childList: true, subtree: true })

    refreshTableElements()

    updateHeaderGeometry()
    scheduleStickyUpdate()
  }

  /** 清理页面滚动表格注册的监听。 */
  function disposePageScrollTable() {
    const pageContainer = pageContainerRef.value
    pageContainer?.removeEventListener('scroll', scheduleStickyUpdate)
    tableScrollContainer?.removeEventListener('scroll', handleTableBodyScroll)
    tableHeader?.removeEventListener('scroll', handleFixedHeaderScroll)
    window.removeEventListener('resize', scheduleStickyUpdate)
    resizeObserver?.disconnect()
    headerMutationObserver?.disconnect()
    tableMutationObserver?.disconnect()

    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId)
    }
  }

  /** 平滑滚动到表格顶部，并为吸顶操作栏预留空间。 */
  function scrollToTableTop() {
    const pageContainer = pageContainerRef.value
    const toolbar = toolbarRef.value
    const tableContainer = tableContainerRef.value
    if (!pageContainer || !toolbar || !tableContainer) return

    const pageRect = pageContainer.getBoundingClientRect()
    const tableRect = tableContainer.getBoundingClientRect()
    const top = pageContainer.scrollTop + tableRect.top - pageRect.top - toolbar.offsetHeight

    pageContainer.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  onMounted(() => {
    void nextTick(initializePageScrollTable)
  })
  onBeforeUnmount(disposePageScrollTable)

  return {
    pageContainerRef,
    toolbarRef,
    tableContainerRef,
    tableRef,
    headerFixed,
    scrollToTableTop
  }
}
