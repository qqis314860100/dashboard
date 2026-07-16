<script setup lang="ts">
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { init, use, type EChartsType } from 'echarts/core'
import type { EChartsOption } from 'echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ option: EChartsOption }>()
const root = ref<HTMLElement | null>(null)
let chart: EChartsType | null = null
let observer: ResizeObserver | null = null

const render = async () => {
  await nextTick()
  if (!root.value) return
  chart ||= init(root.value, undefined, { renderer: 'canvas' })
  chart.setOption(props.option, true)
}

watch(() => props.option, render, { deep: true })
onMounted(() => {
  void render()
  observer = new ResizeObserver(() => chart?.resize())
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => { observer?.disconnect(); chart?.dispose(); chart = null })
</script>

<template><div ref="root" class="echart-root" /></template>

<style scoped>.echart-root { width: 100%; height: 100%; min-height: 80px; }</style>
