<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, Camera, Gauge, Radio, ScanLine, TriangleAlert } from 'lucide-vue-next'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import EChart from '../components/EChart.vue'
import MetricValue from '../components/MetricValue.vue'
import { lineChartOption } from '../chartOptions'
import { useDashboardFilters } from '../composables/useDashboardFilters'
import { useDashboardResource } from '../composables/useDashboardResource'
import { dashboardDataSource } from '../data/dashboardDataSource'

const router = useRouter()
const { store, workshops, workshop, lines, line, currentLine, deviceId } = useDashboardFilters()
const { data, status, error, reload } = useDashboardResource(() => dashboardDataSource.getDeviceDashboard(line.value, deviceId.value), [line, deviceId])
const currentDevice = computed(() => data.value?.devices.find((item) => item.id === deviceId.value) || data.value?.devices[0])
const temperatureOption = computed(() => data.value ? lineChartOption(data.value.temperature.labels, [{ name: '控制温度', values: data.value.temperature.values, color: '#f0b95c', area: true }], '°C') : {})
const completion = computed(() => data.value ? Math.round(data.value.output.current / data.value.output.target * 100) : 0)
const statusClass = computed(() => currentDevice.value?.status === '异常' ? 'danger' : currentDevice.value?.status === '待机' ? 'warning' : 'running')
const back = () => void router.push({ name: 'digitalDashboard', query: { line: line.value, workshop: workshop.value } })
</script>

<template>
  <div class="digital-dashboard-layout device-page">
    <DashboardTopbar title="设备运行看板" eyebrow="EQUIPMENT TELEMETRY" :context="`${currentLine?.name || ''} · ${currentDevice?.name || ''}`" back :loading="status === 'loading'" @back="back" @refresh="reload">
      <el-select v-model="workshop" size="small" style="width: 125px"><el-option v-for="item in workshops" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="line" size="small" style="width: 140px"><el-option v-for="item in lines" :key="item.id" :label="item.name" :value="item.id" /></el-select>
      <el-select v-model="deviceId" size="small" style="width: 165px"><el-option v-for="item in data?.devices || []" :key="item.id" :label="item.name" :value="item.id" /></el-select>
    </DashboardTopbar>

    <main class="dashboard-page-body device-grid">
      <DashboardPanel class="output-panel" title="当班生产" kicker="SHIFT" :status="status" :error-message="error" @retry="reload">
        <div v-if="data" class="output-body">
          <div class="output-hero"><span>当前产出</span><strong class="mono">{{ data.output.current }}</strong><small>/ {{ data.output.target }} pcs</small></div>
          <div class="progress"><span><em>计划完成</em><b class="mono">{{ completion }}%</b></span><i><b :style="{ width: `${completion}%` }" /></i></div>
          <div class="metric-pair"><MetricValue label="一次合格率" :value="data.output.passRate" unit="%" tone="green" compact /><MetricValue label="设备节拍" :value="data.output.cycle" unit="s" tone="cyan" compact /></div>
        </div>
      </DashboardPanel>

      <DashboardPanel class="camera-panel" title="设备视觉监控" kicker="CAMERA 04" :status="status">
        <template #header-extra><span class="camera-state" :class="statusClass"><Radio :size="11" />{{ currentDevice?.status }}</span></template>
        <div class="camera-stage" :class="statusClass">
          <div class="camera-background" />
          <Camera :size="54" />
          <div class="machine-outline"><i /><i /><i /></div>
          <div class="camera-meta"><span class="mono">{{ currentDevice?.code }}</span><strong>{{ currentDevice?.name }}</strong><small class="mono">1080P · 25 FPS · LIVE</small></div>
          <span class="scan" />
          <div class="corner tl" /><div class="corner tr" /><div class="corner bl" /><div class="corner br" />
        </div>
      </DashboardPanel>

      <DashboardPanel class="telemetry-panel" title="实时遥测" kicker="TELEMETRY" :status="status">
        <template #header-extra><Activity :size="12" /></template>
        <div v-if="data" class="telemetry-list"><div v-for="item in data.telemetry" :key="item.label" :class="item.tone"><span>{{ item.label }}</span><strong class="mono">{{ item.value }}</strong><i /></div></div>
      </DashboardPanel>

      <DashboardPanel class="alarm-panel" title="实时告警" kicker="ALARM STREAM" :status="status">
        <template #header-extra><TriangleAlert :size="12" />{{ data?.alarms.length || 0 }}</template>
        <div v-if="data" class="alarms"><div v-for="alarm in data.alarms" :key="alarm.time" :class="alarm.level"><span class="mono">{{ alarm.time }}</span><i>{{ alarm.level }}</i><strong>{{ alarm.message }}</strong></div></div>
      </DashboardPanel>

      <DashboardPanel class="trend-panel" title="温度与负载趋势" kicker="CONDITION" :status="status"><template #header-extra><Gauge :size="12" /></template><EChart v-if="data" :option="temperatureOption" /></DashboardPanel>

      <DashboardPanel class="signal-panel" title="控制信号" kicker="I/O STATUS" :status="status">
        <template #header-extra><ScanLine :size="12" /></template>
        <div class="signal-grid"><div v-for="index in 12" :key="index" :class="{ active: ![4, 9].includes(index), warning: index === 7 }"><span class="mono">DI-{{ String(index).padStart(2, '0') }}</span><i /><strong>{{ [4, 9].includes(index) ? 'OFF' : 'ON' }}</strong></div></div>
      </DashboardPanel>
    </main>
  </div>
</template>

<style scoped>
.device-grid { display: grid; grid-template-columns: 2.2fr 5.2fr 2.6fr; grid-template-rows: minmax(0, 1.05fr) minmax(0, .95fr); gap: var(--dd-gap); }.output-panel { grid-column: 1; grid-row: 1; }.camera-panel { grid-column: 2; grid-row: 1 / 3; }.telemetry-panel { grid-column: 3; grid-row: 1; }.alarm-panel { grid-column: 1; grid-row: 2; }.trend-panel { grid-column: 3; grid-row: 2; margin-bottom: calc(43% + 5px); }.signal-panel { grid-column: 3; grid-row: 2; margin-top: calc(57% + 5px); }
.output-body { height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto 50px; gap: 10px; }.output-hero { display: grid; place-content: center; justify-items: center; }.output-hero span { color: var(--dd-text-3); font-size: 10px; }.output-hero strong { color: var(--dd-cyan); font-size: 44px; }.output-hero small { color: var(--dd-text-3); font-size: 9px; }.progress span { display: flex; justify-content: space-between; color: var(--dd-text-3); font-size: 9px; }.progress span b { color: var(--dd-text); }.progress > i { display: block; height: 4px; margin-top: 6px; background: rgba(127,160,180,.12); }.progress > i b { display: block; height: 100%; background: var(--dd-cyan); }.metric-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.camera-stage { position: relative; height: 100%; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--dd-line); color: var(--dd-cyan); background: #090f13; }.camera-background { position: absolute; inset: 0; background-image: linear-gradient(rgba(96,151,167,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(96,151,167,.045) 1px, transparent 1px); background-size: 24px 24px; }.machine-outline { position: absolute; width: 42%; height: 54%; border: 1px solid rgba(85,212,219,.14); }.machine-outline i { position: absolute; background: rgba(85,212,219,.08); border: 1px solid rgba(85,212,219,.12); }.machine-outline i:nth-child(1) { inset: 12% 58% 20% 8%; }.machine-outline i:nth-child(2) { inset: 22% 12% 42% 50%; }.machine-outline i:nth-child(3) { inset: 66% 12% 8% 38%; }.camera-meta { position: absolute; right: 15px; bottom: 13px; left: 15px; display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 4px 12px; }.camera-meta span { color: var(--dd-green); font-size: 8px; }.camera-meta strong { grid-row: 2; color: var(--dd-text); font-size: 12px; }.camera-meta small { grid-column: 2; grid-row: 1 / span 2; color: var(--dd-text-3); font-size: 8px; }.scan { position: absolute; top: 0; right: 0; left: 0; height: 1px; background: currentColor; box-shadow: 0 0 16px currentColor; animation: dd-scan 5s linear infinite; }.corner { position: absolute; width: 18px; height: 18px; border-color: currentColor; }.tl { top: 12px; left: 12px; border-top: 2px solid; border-left: 2px solid; }.tr { top: 12px; right: 12px; border-top: 2px solid; border-right: 2px solid; }.bl { bottom: 12px; left: 12px; border-bottom: 2px solid; border-left: 2px solid; }.br { right: 12px; bottom: 12px; border-right: 2px solid; border-bottom: 2px solid; }.camera-stage.warning, .camera-state.warning { color: var(--dd-amber); }.camera-stage.danger, .camera-state.danger { color: var(--dd-red); }.camera-state { display: inline-flex; align-items: center; gap: 4px; color: var(--dd-green); }
.telemetry-list { display: grid; gap: 8px; }.telemetry-list div { position: relative; display: flex; align-items: center; justify-content: space-between; min-height: 43px; padding: 0 9px; border: 1px solid var(--dd-line); overflow: hidden; }.telemetry-list span { color: var(--dd-text-3); font-size: 9px; }.telemetry-list strong { font-size: 14px; }.telemetry-list i { position: absolute; right: 0; bottom: 0; left: 0; height: 2px; background: var(--dd-green); }.telemetry-list .warning i { background: var(--dd-amber); }.telemetry-list .danger i { background: var(--dd-red); }
.alarms { display: grid; gap: 7px; }.alarms div { display: grid; grid-template-columns: 58px 38px 1fr; align-items: center; min-height: 44px; gap: 6px; padding: 0 8px; border-left: 2px solid var(--dd-line); background: rgba(255,255,255,.018); }.alarms span { color: var(--dd-text-3); font-size: 8px; }.alarms i { padding: 3px 4px; color: var(--dd-text-2); font-size: 8px; font-style: normal; text-align: center; background: rgba(255,255,255,.05); }.alarms strong { color: var(--dd-text-2); font-size: 9px; font-weight: 500; }.alarms .严重 { border-color: var(--dd-red); }.alarms .警告 { border-color: var(--dd-amber); }
.signal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }.signal-grid div { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 3px; padding: 7px; border: 1px solid var(--dd-line); }.signal-grid span { color: var(--dd-text-3); font-size: 7px; }.signal-grid i { width: 6px; height: 6px; border-radius: 50%; background: #69757c; }.signal-grid strong { grid-column: 1 / -1; color: var(--dd-text-3); font-size: 8px; }.signal-grid .active i { background: var(--dd-green); box-shadow: 0 0 8px rgba(98,214,154,.5); }.signal-grid .warning i { background: var(--dd-amber); }
</style>
