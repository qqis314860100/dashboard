<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, Clock3, Gauge, ShieldCheck, TriangleAlert } from 'lucide-vue-next'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import EChart from '../components/EChart.vue'
import MetricValue from '../components/MetricValue.vue'
import { lineChartOption } from '../chartOptions'
import { useDashboardFilters } from '../composables/useDashboardFilters'
import { useDashboardResource } from '../composables/useDashboardResource'
import { dashboardDataSource } from '../data/dashboardDataSource'

const router = useRouter()
const dtMode = ref<'rate' | 'duration'>('rate')
const { store, workshops, workshop, lines, line, currentLine, timeRange } = useDashboardFilters()
const { data, status, error, reload } = useDashboardResource(() => dashboardDataSource.getReliabilityDashboard(line.value, timeRange.value), [line, timeRange])
const mainOption = computed(() => data.value ? lineChartOption(data.value.mtbf.labels, [
  { name: 'MTBF', values: data.value.mtbf.values, color: '#55d4db', area: true },
  { name: 'MTTR', values: data.value.mttr.values, color: '#f0b95c' },
], 'h') : {})
const dtOption = computed(() => {
  if (!data.value) return {}
  const source = dtMode.value === 'rate' ? data.value.faultRate : data.value.downtime
  return lineChartOption(source.labels, [{ name: dtMode.value === 'rate' ? '故障率' : '停机时长', values: source.values, color: dtMode.value === 'rate' ? '#ff6f68' : '#5aa7ff', area: true }], dtMode.value === 'rate' ? '%' : 'min')
})
const rangeLabel = computed(() => ({ '1d': '近 24 小时', '7d': '近 7 天', '30d': '近 30 天' }[timeRange.value]))
const back = () => void router.push({ name: 'digitalDashboard', query: { line: line.value, workshop: workshop.value } })
</script>

<template>
  <div class="digital-dashboard-layout reliability-page">
    <DashboardTopbar title="MTBF / MTTR 可靠性分析" eyebrow="RELIABILITY ENGINEERING" :context="`${store.site.name} · ${currentLine?.name || ''}`" back :loading="status === 'loading'" @back="back" @refresh="reload">
      <el-select v-model="workshop" size="small" style="width: 125px"><el-option v-for="item in workshops" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="line" size="small" style="width: 140px"><el-option v-for="item in lines" :key="item.id" :label="item.name" :value="item.id" /></el-select>
      <div class="range-switch"><button v-for="item in ['1d', '7d', '30d']" :key="item" type="button" :class="{ active: timeRange === item }" @click="timeRange = item as '1d' | '7d' | '30d'">{{ item }}</button></div>
    </DashboardTopbar>

    <main class="dashboard-page-body reliability-grid">
      <DashboardPanel class="summary-panel" title="可靠性核心指标" kicker="KPI" :status="status" :error-message="error" @retry="reload">
        <div v-if="data" class="summary-body">
          <MetricValue label="平均故障间隔 MTBF" :value="data.summary.mtbf" unit="h" tone="cyan" />
          <MetricValue label="平均修复时间 MTTR" :value="data.summary.mttr" unit="min" tone="green" />
          <MetricValue label="设备可用率" :value="data.summary.availability" unit="%" tone="green" />
          <MetricValue label="故障次数" :value="data.summary.faults" tone="amber" />
        </div>
      </DashboardPanel>

      <DashboardPanel class="main-chart" title="MTBF 与 MTTR 联合趋势" kicker="RELIABILITY TREND" :status="status">
        <template #header-extra><ShieldCheck :size="12" />{{ rangeLabel }}</template>
        <EChart v-if="data" :option="mainOption" />
      </DashboardPanel>

      <DashboardPanel class="dt-chart" title="停机数据分析" kicker="DOWNTIME" :status="status">
        <template #header-extra><div class="mode-switch"><button type="button" :class="{ active: dtMode === 'rate' }" @click="dtMode = 'rate'">故障率</button><button type="button" :class="{ active: dtMode === 'duration' }" @click="dtMode = 'duration'">停机时长</button></div></template>
        <EChart v-if="data" :option="dtOption" />
      </DashboardPanel>

      <DashboardPanel class="fault-panel" title="故障优先级" kicker="FAULT ANALYSIS" :status="status">
        <template #header-extra><TriangleAlert :size="12" />按影响排序</template>
        <div v-if="data" class="fault-list">
          <div v-for="fault in data.faults" :key="fault.device" class="fault-row" :class="fault.impact">
            <span class="impact">{{ fault.impact }}</span><div><strong>{{ fault.device }}</strong><small>{{ fault.type }}</small></div><span><Activity :size="11" /><b class="mono">{{ fault.count }}</b> 次</span><span><Clock3 :size="11" /><b class="mono">{{ fault.duration }}</b> min</span>
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="health-panel" title="可靠性健康度" kicker="HEALTH INDEX" :status="status">
        <template #header-extra><Gauge :size="12" /></template>
        <div v-if="data" class="health-index">
          <div class="health-score"><span>综合健康度</span><strong class="mono">91.6</strong><small>GOOD</small></div>
          <div class="health-items"><div><span>机械系统</span><i><b style="width: 94%" /></i><em class="mono">94</em></div><div><span>电气系统</span><i><b style="width: 89%" /></i><em class="mono">89</em></div><div><span>控制系统</span><i><b style="width: 92%" /></i><em class="mono">92</em></div></div>
        </div>
      </DashboardPanel>
    </main>
  </div>
</template>

<style scoped>
.range-switch, .mode-switch { display: inline-flex; padding: 2px; border: 1px solid var(--dd-line); border-radius: 4px; background: rgba(8,14,18,.55); }.range-switch button, .mode-switch button { height: 24px; padding: 0 9px; border: 0; border-radius: 2px; color: var(--dd-text-3); background: transparent; cursor: pointer; }.range-switch button.active, .mode-switch button.active { color: var(--dd-cyan); background: rgba(85,212,219,.1); }
.reliability-grid { display: grid; grid-template-columns: 2.1fr 2.1fr 3.3fr 2.5fr; grid-template-rows: minmax(0, 1.08fr) minmax(0, .92fr); gap: var(--dd-gap); }.summary-panel { grid-column: 1; grid-row: 1; }.main-chart { grid-column: 2 / 4; grid-row: 1; }.fault-panel { grid-column: 4; grid-row: 1 / 3; }.health-panel { grid-column: 1; grid-row: 2; }.dt-chart { grid-column: 2 / 4; grid-row: 2; }
.summary-body { height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-content: center; }
.fault-list { display: grid; gap: 8px; }.fault-row { display: grid; grid-template-columns: 28px 1fr; gap: 5px 8px; padding: 9px; border: 1px solid var(--dd-line); border-left: 2px solid var(--tone); }.fault-row.高 { --tone: var(--dd-red); }.fault-row.中 { --tone: var(--dd-amber); }.fault-row.低 { --tone: var(--dd-green); }.impact { grid-row: span 2; align-self: start; padding: 4px; color: var(--tone); font-size: 8px; text-align: center; background: color-mix(in srgb, var(--tone) 9%, transparent); }.fault-row div { display: grid; gap: 4px; }.fault-row strong { color: var(--dd-text-2); font-size: 10px; }.fault-row small { color: var(--dd-text-3); font-size: 8px; }.fault-row > span:not(.impact) { display: inline-flex; align-items: center; gap: 4px; color: var(--dd-text-3); font-size: 8px; }.fault-row b { color: var(--dd-text-2); }
.health-index { height: 100%; display: grid; grid-template-columns: 120px 1fr; gap: 12px; }.health-score { display: grid; place-content: center; justify-items: center; border-right: 1px solid var(--dd-line); }.health-score span { color: var(--dd-text-3); font-size: 9px; }.health-score strong { color: var(--dd-green); font-size: 36px; }.health-score small { color: var(--dd-green); font-size: 8px; }.health-items { display: grid; align-content: center; gap: 10px; }.health-items div { display: grid; grid-template-columns: 66px 1fr 22px; align-items: center; gap: 7px; }.health-items span { color: var(--dd-text-3); font-size: 8px; }.health-items i { height: 4px; overflow: hidden; background: rgba(127,160,180,.12); }.health-items b { display: block; height: 100%; background: var(--dd-green); }.health-items em { color: var(--dd-text-2); font-size: 8px; font-style: normal; }
</style>
