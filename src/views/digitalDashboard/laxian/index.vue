<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, Boxes, CircleDot, UsersRound } from 'lucide-vue-next'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import EChart from '../components/EChart.vue'
import LineMap from '../components/LineMap.vue'
import MetricValue from '../components/MetricValue.vue'
import { donutChartOption, lineChartOption } from '../chartOptions'
import { useDashboardFilters } from '../composables/useDashboardFilters'
import { useDashboardResource } from '../composables/useDashboardResource'
import { dashboardDataSource } from '../data/dashboardDataSource'

const router = useRouter()
const { store, workshops, workshop, lines, line, currentLine } = useDashboardFilters()
const { data, status, error, reload } = useDashboardResource(() => dashboardDataSource.getLineDashboard(line.value), [line])

const attendanceRate = computed(() => data.value ? Math.round(data.value.attendance.actual / data.value.attendance.target * 100) : 0)
const attendanceOption = computed(() => donutChartOption(attendanceRate.value, '#62d69a'))
const qualityOption = computed(() => data.value ? lineChartOption(data.value.quality.labels, [{ name: '一次良率', values: data.value.quality.values, color: '#55d4db', area: true }], '%') : {})
const statusCount = computed(() => {
  const rows = data.value?.stations || []
  return {
    total: rows.length,
    running: rows.filter((item) => item.status === 'running').length,
    idle: rows.filter((item) => item.status === 'idle').length,
    warning: rows.filter((item) => item.status === 'warning').length,
    offline: rows.filter((item) => item.status === 'offline').length,
  }
})
const completionRate = computed(() => data.value ? Math.round(data.value.output.current / data.value.output.target * 100) : 0)
const back = () => void router.push({ name: 'digitalDashboard', query: { line: line.value, workshop: workshop.value } })
</script>

<template>
  <div class="digital-dashboard-layout line-page">
    <DashboardTopbar title="拉线运行看板" eyebrow="PRODUCTION CONTROL" :context="`${store.site.name} · ${currentLine?.name || ''}`" back :loading="status === 'loading'" @back="back" @refresh="reload">
      <el-select v-model="workshop" size="small" style="width: 130px"><el-option v-for="item in workshops" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="line" size="small" style="width: 145px"><el-option v-for="item in lines" :key="item.id" :label="item.name" :value="item.id" /></el-select>
      <div class="station-summary mono"><span>{{ statusCount.total }} TOTAL</span><i class="run" />{{ statusCount.running }}<i class="idle" />{{ statusCount.idle }}<i class="warn" />{{ statusCount.warning }}<i class="off" />{{ statusCount.offline }}</div>
    </DashboardTopbar>

    <main class="dashboard-page-body line-grid">
      <DashboardPanel class="attendance" title="人员到岗" kicker="PEOPLE" :status="status" :error-message="error" @retry="reload">
        <div v-if="data" class="attendance-body">
          <div class="donut"><EChart :option="attendanceOption" /><strong class="mono">{{ attendanceRate }}<small>%</small></strong></div>
          <div class="attendance-list">
            <div><span>应出勤</span><strong class="mono">{{ data.attendance.target }}</strong></div><div><span>实出勤</span><strong class="mono text-green">{{ data.attendance.actual }}</strong></div>
            <div><span>迟到早退</span><strong class="mono text-amber">{{ data.attendance.late }}</strong></div><div><span>请假</span><strong class="mono">{{ data.attendance.leave }}</strong></div>
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="line-map-panel" title="产线拓扑与工站状态" kicker="LINE TOPOLOGY" :status="status">
        <template #header-extra><span><CircleDot :size="11" /> takt 12.0s</span></template>
        <LineMap v-if="data" :stations="data.stations" />
      </DashboardPanel>

      <DashboardPanel class="output" title="当班产出" kicker="SHIFT OUTPUT" :status="status">
        <div v-if="data" class="output-body">
          <div class="output-hero"><span>当前产量</span><strong class="mono">{{ data.output.current }}</strong><small>/ {{ data.output.target }} pcs</small></div>
          <div class="completion"><div><span>计划完成度</span><strong class="mono">{{ completionRate }}%</strong></div><i><b :style="{ width: `${completionRate}%` }" /></i></div>
          <div class="metrics-row"><MetricValue label="在制品 WIP" :value="data.output.wip" compact /><MetricValue label="不良品" :value="data.output.defects" tone="red" compact /></div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="health" title="设备健康矩阵" kicker="HEALTH" :status="status">
        <template #header-extra><UsersRound :size="12" /></template>
        <div v-if="data" class="health-list">
          <div v-for="item in data.health" :key="item.name" class="health-row"><span>{{ item.name }}</span><i><b :class="item.value >= 80 ? 'good' : item.value >= 60 ? 'medium' : 'bad'" :style="{ width: `${item.value}%` }" /></i><strong class="mono">{{ item.value }}</strong></div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="cycle" title="节拍偏差" kicker="CYCLE TIME" :status="status">
        <div v-if="data" class="cycle-list"><div v-for="row in data.cycleRows" :key="row.process"><span>{{ row.process }}</span><strong class="mono">{{ row.cycle }}s</strong><em class="mono" :class="row.overRate > 0 ? 'text-red' : 'text-green'">{{ row.overRate > 0 ? '+' : '' }}{{ row.overRate }}%</em></div></div>
      </DashboardPanel>

      <DashboardPanel class="quality" title="一次良率趋势" kicker="QUALITY" :status="status"><EChart v-if="data" :option="qualityOption" /></DashboardPanel>

      <DashboardPanel class="materials" title="物料风险" kicker="MATERIAL" :status="status">
        <template #header-extra><Boxes :size="12" /></template>
        <div v-if="data" class="alert-list"><div v-for="item in data.materialAlerts" :key="item"><AlertTriangle :size="14" /><span>{{ item }}</span></div><div class="supply-note"><span>预计影响窗口</span><strong class="mono">01:24:00</strong></div></div>
      </DashboardPanel>
    </main>
  </div>
</template>

<style scoped>
.station-summary { height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid var(--dd-line); border-radius: 4px; color: var(--dd-text-3); font-size: 8px; }.station-summary i { width: 6px; height: 6px; margin-left: 3px; border-radius: 50%; }.run { background: var(--dd-green); }.idle { background: var(--dd-amber); }.warn { background: var(--dd-red); }.off { background: #74818a; }
.line-grid { display: grid; grid-template-columns: 2.1fr 2.75fr 2.75fr 2.4fr; grid-template-rows: minmax(0, 1.18fr) minmax(0, .82fr); gap: var(--dd-gap); }.attendance { grid-column: 1; grid-row: 1; }.line-map-panel { grid-column: 2 / 4; grid-row: 1; }.output { grid-column: 4; grid-row: 1; }.health { grid-column: 1; grid-row: 2; }.cycle { grid-column: 2; grid-row: 2; }.quality { grid-column: 3; grid-row: 2; }.materials { grid-column: 4; grid-row: 2; }
.attendance-body, .output-body { height: 100%; display: grid; gap: 10px; }.attendance-body { grid-template-rows: minmax(120px, 1fr) auto; }.donut { position: relative; min-height: 0; }.donut strong { position: absolute; inset: 50% auto auto 50%; transform: translate(-50%, -50%); font-size: 28px; }.donut small { font-size: 10px; color: var(--dd-text-3); }.attendance-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }.attendance-list div { display: flex; align-items: center; justify-content: space-between; padding: 7px; border: 1px solid var(--dd-line); }.attendance-list span { color: var(--dd-text-3); font-size: 9px; }.attendance-list strong { font-size: 14px; }
.output-body { grid-template-rows: minmax(0, 1fr) auto 48px; }.output-hero { display: grid; place-content: center; justify-items: center; }.output-hero span { color: var(--dd-text-3); font-size: 10px; }.output-hero strong { color: var(--dd-cyan); font-size: 45px; }.output-hero small { color: var(--dd-text-3); font-size: 9px; }.completion div { display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--dd-text-3); font-size: 9px; }.completion strong { color: var(--dd-text); }.completion i, .health-row i { display: block; height: 4px; overflow: hidden; background: rgba(127,160,180,.12); }.completion b, .health-row b { display: block; height: 100%; background: var(--dd-cyan); }.metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.health-list, .cycle-list, .alert-list { height: 100%; display: grid; align-content: start; gap: 7px; }.health-row { display: grid; grid-template-columns: 88px 1fr 24px; align-items: center; gap: 7px; }.health-row span { overflow: hidden; color: var(--dd-text-2); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.health-row strong { color: var(--dd-text-2); font-size: 10px; text-align: right; }.health-row .good { background: var(--dd-green); }.health-row .medium { background: var(--dd-amber); }.health-row .bad { background: var(--dd-red); }
.cycle-list div { display: grid; grid-template-columns: 1fr 55px 54px; align-items: center; min-height: 34px; padding: 0 8px; border-bottom: 1px solid var(--dd-line); }.cycle-list span { color: var(--dd-text-2); font-size: 10px; }.cycle-list strong, .cycle-list em { font-size: 10px; font-style: normal; text-align: right; }
.alert-list > div { min-height: 42px; display: flex; align-items: center; gap: 8px; padding: 8px; border-left: 2px solid var(--dd-red); background: rgba(255,111,104,.055); color: var(--dd-red); }.alert-list span { color: var(--dd-text-2); font-size: 9px; line-height: 1.45; }.alert-list .supply-note { margin-top: 4px; justify-content: space-between; border-left-color: var(--dd-amber); background: rgba(240,185,92,.05); }.supply-note strong { color: var(--dd-amber); font-size: 12px; }
</style>
