<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Search, Target, Wrench } from 'lucide-vue-next'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import EChart from '../components/EChart.vue'
import MetricValue from '../components/MetricValue.vue'
import { barChartOption, lineChartOption } from '../chartOptions'
import { useDashboardFilters } from '../composables/useDashboardFilters'
import { useDashboardResource } from '../composables/useDashboardResource'
import { dashboardDataSource } from '../data/dashboardDataSource'

const router = useRouter()
const updateDate = ref('2026-07-16')
const days = ref(7)
const { workshop, line, currentLine, lines } = useDashboardFilters()
const { data, status, error, reload } = useDashboardResource(() => dashboardDataSource.getTighteningDashboard(line.value, days.value), [line, days])
const passRateOption = computed(() => data.value ? lineChartOption(data.value.passRate.labels, [{ name: '合格率', values: data.value.passRate.values, color: '#55d4db', area: true }], '%') : {})
const amplitudeOption = computed(() => data.value ? barChartOption(data.value.amplitudeByLine.map((item) => item.name), data.value.amplitudeByLine.map((item) => item.value), '#5aa7ff', '°') : {})
const distributionOption = computed(() => data.value ? barChartOption(data.value.distribution.map((item) => item.range), data.value.distribution.map((item) => item.value), '#f0b95c', '') : {})
const period = computed(() => `${days.value} 天窗口 · 截止 ${updateDate.value}`)
const back = () => void router.push({ name: 'digitalDashboard', query: { line: line.value, workshop: workshop.value } })
</script>

<template>
  <div class="digital-dashboard-layout tightening-page">
    <DashboardTopbar title="拧紧角度收严分析" eyebrow="PROCESS CAPABILITY" :context="`${currentLine?.name || ''} · ${period}`" back :loading="status === 'loading'" @back="back" @refresh="reload">
      <el-select v-model="line" size="small" style="width: 145px"><el-option v-for="item in lines" :key="item.id" :label="item.name" :value="item.id" /></el-select>
      <el-date-picker v-model="updateDate" type="date" size="small" value-format="YYYY-MM-DD" style="width: 136px" aria-label="更新日期" />
      <el-select v-model="days" size="small" style="width: 92px"><el-option label="近 7 天" :value="7" /><el-option label="近 14 天" :value="14" /><el-option label="近 30 天" :value="30" /></el-select>
      <button type="button" class="query-button" @click="reload"><Search :size="14" />查询</button>
    </DashboardTopbar>

    <main class="dashboard-page-body tightening-grid">
      <DashboardPanel class="trend-panel" title="整体合格率与收严趋势" kicker="PASS RATE" :status="status" :error-message="error" @retry="reload">
        <template #header-extra><CalendarDays :size="12" />{{ period }}</template>
        <div v-if="data" class="trend-body"><div class="trend-summary"><MetricValue label="当前合格率" :value="data.passRate.values.at(-1) || 0" unit="%" tone="cyan" /><MetricValue label="周期提升" value="+1.4" unit="%" tone="green" compact /><MetricValue label="优化项" :value="data.priorities.length" tone="amber" compact /></div><div class="chart"><EChart :option="passRateOption" /></div></div>
      </DashboardPanel>

      <DashboardPanel class="amplitude-panel" title="各拉线平均收严幅度" kicker="AMPLITUDE" :status="status"><template #header-extra><Target :size="12" /></template><EChart v-if="data" :option="amplitudeOption" /></DashboardPanel>
      <DashboardPanel class="distribution-panel" title="拧紧角度偏差分布" kicker="DISTRIBUTION" :status="status"><template #header-extra><Wrench :size="12" /></template><EChart v-if="data" :option="distributionOption" /></DashboardPanel>

      <DashboardPanel class="priority-panel" title="重点优化队列" kicker="PRIORITY QUEUE" :status="status">
        <template #header-extra><span class="queue-health"><i />3 项待闭环</span></template>
        <div v-if="data" class="priority-list">
          <div v-for="item in data.priorities" :key="item.rank" class="priority-row">
            <span class="rank mono">0{{ item.rank }}</span><div><strong>{{ item.item }}</strong><small>{{ item.line }} · {{ item.owner }}</small></div><em class="mono">+{{ item.deviation }}°</em><span class="state">待优化</span>
          </div>
          <div class="control-band"><span>控制窗口</span><strong class="mono">-2.0° ~ +2.0°</strong><small>CPK ≥ 1.33</small></div>
        </div>
      </DashboardPanel>
    </main>
  </div>
</template>

<style scoped>
.query-button { height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 11px; border: 1px solid var(--dd-line-strong); border-radius: 4px; color: var(--dd-cyan); background: rgba(85,212,219,.08); cursor: pointer; }
.tightening-grid { display: grid; grid-template-columns: 1.15fr .85fr; grid-template-rows: 1fr 1fr; gap: var(--dd-gap); }.trend-panel { grid-column: 1; }.amplitude-panel { grid-column: 2; }.distribution-panel { grid-column: 1; }.priority-panel { grid-column: 2; }
.trend-body { height: 100%; display: grid; grid-template-columns: 175px minmax(0, 1fr); gap: 12px; }.trend-summary { display: grid; align-content: center; gap: 7px; }.chart { min-height: 0; }
.queue-health { display: inline-flex; align-items: center; gap: 5px; }.queue-health i { width: 6px; height: 6px; border-radius: 50%; background: var(--dd-amber); }
.priority-list { display: grid; align-content: start; gap: 8px; }.priority-row { min-height: 52px; display: grid; grid-template-columns: 30px 1fr 58px 50px; align-items: center; gap: 8px; padding: 7px 8px; border: 1px solid var(--dd-line); background: rgba(255,255,255,.017); }.rank { color: var(--dd-cyan); font-size: 11px; }.priority-row div { display: grid; gap: 4px; }.priority-row strong { color: var(--dd-text-2); font-size: 10px; }.priority-row small { color: var(--dd-text-3); font-size: 8px; }.priority-row em { color: var(--dd-red); font-size: 11px; font-style: normal; text-align: right; }.state { padding: 4px; color: var(--dd-amber); font-size: 8px; text-align: center; background: rgba(240,185,92,.08); }
.control-band { min-height: 44px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 3px 10px; padding: 7px 9px; border-left: 2px solid var(--dd-green); background: rgba(98,214,154,.04); }.control-band span, .control-band small { color: var(--dd-text-3); font-size: 8px; }.control-band strong { color: var(--dd-green); font-size: 11px; }.control-band small { grid-column: 1 / -1; }
</style>
