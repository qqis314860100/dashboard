<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUpRight, CircleGauge, Cpu, Route, ScanLine, Wrench } from 'lucide-vue-next'
import DashboardPanel from './components/DashboardPanel.vue'
import DashboardTopbar from './components/DashboardTopbar.vue'
import EChart from './components/EChart.vue'
import LineMap from './components/LineMap.vue'
import AgvMap from './components/AgvMap.vue'
import MetricValue from './components/MetricValue.vue'
import { lineChartOption } from './chartOptions'
import { useDashboardFilters } from './composables/useDashboardFilters'
import { useDashboardResource } from './composables/useDashboardResource'
import { dashboardDataSource } from './data/dashboardDataSource'
import type { DashboardTabKey } from './dashboardConfig'

const router = useRouter()
const { store, workshops, workshop, lines, line, currentLine } = useDashboardFilters()
const { data, status, error, reload } = useDashboardResource(async () => {
  const [overview, lineDashboard, agvDashboard] = await Promise.all([
    dashboardDataSource.getOverview(line.value),
    dashboardDataSource.getLineDashboard(line.value),
    dashboardDataSource.getAgvDashboard(line.value),
  ])
  return { overview, lineDashboard, agvDashboard }
}, [line])

const qualityOption = computed(() => data.value ? lineChartOption(data.value.overview.line.trend.labels, [{ name: 'OEE', values: data.value.overview.line.trend.values, color: '#55d4db', area: true }], '%') : {})
const agvOption = computed(() => data.value ? lineChartOption(data.value.overview.agv.trend.labels, [{ name: '利用率', values: data.value.overview.agv.trend.values, color: '#62d69a', area: true }], '%') : {})
const tighteningOption = computed(() => data.value ? lineChartOption(data.value.overview.tightening.trend.labels, [{ name: '合格率', values: data.value.overview.tightening.trend.values, color: '#f0b95c', area: true }], '%') : {})
const reliabilityOption = computed(() => data.value ? lineChartOption(data.value.overview.reliability.trend.labels, [{ name: 'MTBF', values: data.value.overview.reliability.trend.values, color: '#5aa7ff', area: true }], 'h') : {})

const openDashboard = (target: DashboardTabKey) => {
  void router.push({ name: `digitalDashboard-${target}`, query: { site: store.site.id, workshop: workshop.value, line: line.value } })
}
</script>

<template>
  <div class="digital-dashboard-layout overview-page">
    <DashboardTopbar title="数字运行监控室" :context="`${store.site.name} · ${currentLine?.name || ''}`" :loading="status === 'loading'" @refresh="reload">
      <el-select v-model="workshop" size="small" style="width: 136px" aria-label="选择车间">
        <el-option v-for="item in workshops" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="line" size="small" filterable style="width: 150px" aria-label="选择产线">
        <el-option v-for="item in lines" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </DashboardTopbar>

    <main class="dashboard-page-body overview-grid">
      <DashboardPanel class="line-card" title="拉线运行态势" kicker="LINE / 01" :status="status" :error-message="error" interactive @retry="reload" @activate="openDashboard('laxian')">
        <template #header-extra><span>全线节拍 12.0s</span><ArrowUpRight :size="13" /></template>
        <div v-if="data" class="line-card-body">
          <div class="metrics-row">
            <MetricValue label="综合效率 OEE" :value="data.overview.line.oee" unit="%" tone="cyan" />
            <MetricValue label="一次良率" :value="data.overview.line.yieldRate" unit="%" tone="green" />
            <MetricValue label="当班产出" :value="data.overview.line.output" unit="pcs" />
            <MetricValue label="目标完成" :value="Math.round(data.overview.line.output / data.overview.line.target * 100)" unit="%" tone="amber" />
          </div>
          <div class="line-visual"><LineMap :stations="data.lineDashboard.stations" /></div>
          <div class="line-trend"><EChart :option="qualityOption" /></div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="agv-card" title="AGV 调度网络" kicker="FLEET / 02" :status="status" interactive @activate="openDashboard('agv')">
        <template #header-extra><Route :size="13" /><ArrowUpRight :size="13" /></template>
        <div v-if="data" class="vertical-card-body">
          <div class="metrics-row metrics-3">
            <MetricValue label="在线" :value="`${data.overview.agv.online}/${data.overview.agv.total}`" tone="green" compact />
            <MetricValue label="利用率" :value="data.overview.agv.utilization" unit="%" tone="cyan" compact />
            <MetricValue label="任务" :value="data.overview.agv.tasks" compact />
          </div>
          <div class="map-slot"><AgvMap :records="data.agvDashboard.records" compact /></div>
          <div class="mini-chart"><EChart :option="agvOption" /></div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="device-card" title="关键设备监控" kicker="EQUIPMENT / 03" :status="status" interactive @activate="openDashboard('device')">
        <template #header-extra><Cpu :size="13" /><ArrowUpRight :size="13" /></template>
        <div v-if="data" class="device-card-body">
          <div class="camera-feed">
            <div class="camera-grid" />
            <ScanLine :size="42" />
            <div class="camera-copy"><span class="mono">CAM 04 / LIVE</span><strong>精密压装机 A01</strong></div>
            <i class="scan-line" />
          </div>
          <div class="metrics-row metrics-3">
            <MetricValue label="运行设备" :value="`${data.overview.device.running}/${data.overview.device.total}`" tone="green" compact />
            <MetricValue label="可用率" :value="data.overview.device.availability" unit="%" tone="cyan" compact />
            <MetricValue label="实时告警" :value="data.overview.device.alarms" tone="red" compact />
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="tightening-card" title="拧紧角度管控" kicker="ANGLE / 04" :status="status" interactive @activate="openDashboard('ningjing')">
        <template #header-extra><Wrench :size="13" /><ArrowUpRight :size="13" /></template>
        <div v-if="data" class="compact-analysis">
          <div class="hero-number"><span>实时合格率</span><strong class="mono">{{ data.overview.tightening.passRate }}<small>%</small></strong><em>较昨日 +0.4%</em></div>
          <div class="mini-chart"><EChart :option="tighteningOption" /></div>
          <div class="metrics-row metrics-2"><MetricValue label="平均角度" :value="data.overview.tightening.averageAngle" unit="°" compact /><MetricValue label="待优化项" :value="data.overview.tightening.anomalies" tone="amber" compact /></div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="mtbf-card" title="可靠性分析" kicker="MTBF / 05" :status="status" interactive @activate="openDashboard('mtbf')">
        <template #header-extra><CircleGauge :size="13" /><ArrowUpRight :size="13" /></template>
        <div v-if="data" class="mtbf-body">
          <div class="metrics-column">
            <MetricValue label="平均故障间隔" :value="data.overview.reliability.mtbf" unit="h" tone="cyan" />
            <MetricValue label="平均修复时间" :value="data.overview.reliability.mttr" unit="min" tone="green" compact />
            <MetricValue label="故障率" :value="data.overview.reliability.faultRate" unit="%" tone="amber" compact />
          </div>
          <div class="reliability-chart"><EChart :option="reliabilityOption" /></div>
        </div>
      </DashboardPanel>
    </main>
  </div>
</template>

<style scoped>
.overview-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-template-rows: minmax(0, 1.15fr) minmax(0, 1fr) minmax(150px, .8fr); gap: var(--dd-gap); }
.line-card { grid-column: 1 / 8; grid-row: 1 / 3; }.agv-card { grid-column: 8 / 13; grid-row: 1; }.device-card { grid-column: 8 / 13; grid-row: 2; }.tightening-card { grid-column: 1 / 5; grid-row: 3; }.mtbf-card { grid-column: 5 / 13; grid-row: 3; }
.line-card-body, .vertical-card-body, .device-card-body, .compact-analysis { height: 100%; min-height: 0; display: grid; gap: 10px; }
.line-card-body { grid-template-rows: 58px minmax(180px, 1fr) 112px; }.vertical-card-body { grid-template-rows: 46px minmax(78px, 1fr) 68px; }.device-card-body { grid-template-rows: minmax(94px, 1fr) 48px; }
.metrics-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }.metrics-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }.metrics-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.line-visual, .line-trend, .map-slot, .mini-chart, .reliability-chart { min-height: 0; }
.camera-feed { position: relative; min-height: 0; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--dd-line); color: rgba(85,212,219,.7); background: #0a1116; }
.camera-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(97,152,168,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(97,152,168,.05) 1px, transparent 1px); background-size: 18px 18px; }
.camera-copy { position: absolute; right: 10px; bottom: 9px; left: 10px; display: flex; align-items: center; justify-content: space-between; }.camera-copy span { color: var(--dd-green); font-size: 8px; }.camera-copy strong { color: var(--dd-text-2); font-size: 10px; }
.scan-line { position: absolute; top: 0; right: 0; left: 0; height: 1px; background: rgba(85,212,219,.45); box-shadow: 0 0 12px rgba(85,212,219,.6); animation: dd-scan 4s linear infinite; }
.compact-analysis { grid-template-columns: 180px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 52px; }.hero-number { grid-row: 1 / span 2; display: grid; place-content: center; justify-items: center; border-right: 1px solid var(--dd-line); }.hero-number span { color: var(--dd-text-3); font-size: 10px; }.hero-number strong { margin: 5px 0; color: var(--dd-cyan); font-size: 40px; }.hero-number small { font-size: 15px; }.hero-number em { color: var(--dd-green); font-size: 9px; font-style: normal; }
.mtbf-body { height: 100%; display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 12px; }.metrics-column { display: grid; gap: 7px; }
@media (max-width: 1500px) { .compact-analysis { grid-template-columns: 140px minmax(0, 1fr); }.hero-number strong { font-size: 32px; }.line-card-body { grid-template-rows: 54px minmax(160px, 1fr) 96px; } }
</style>
