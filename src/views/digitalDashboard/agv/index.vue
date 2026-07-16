<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, BatteryCharging, CircleCheck, Navigation, Route } from 'lucide-vue-next'
import DashboardPanel from '../components/DashboardPanel.vue'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import EChart from '../components/EChart.vue'
import AgvMap from '../components/AgvMap.vue'
import MetricValue from '../components/MetricValue.vue'
import { barChartOption, lineChartOption } from '../chartOptions'
import { useDashboardFilters } from '../composables/useDashboardFilters'
import { useDashboardResource } from '../composables/useDashboardResource'
import { dashboardDataSource } from '../data/dashboardDataSource'

const router = useRouter()
const page = ref(1)
const pageSize = 5
const { store, workshops, workshop, lines, line, currentLine } = useDashboardFilters()
const { data, status, error, reload } = useDashboardResource(() => dashboardDataSource.getAgvDashboard(line.value), [line])
const utilizationOption = computed(() => data.value ? lineChartOption(data.value.utilization.labels, [{ name: '利用率', values: data.value.utilization.values, color: '#55d4db', area: true }], '%') : {})
const cycleOption = computed(() => data.value ? barChartOption(data.value.cycle.map((item) => item.station), data.value.cycle.map((item) => item.actual), '#f0b95c', 'min') : {})
const pageRows = computed(() => data.value?.records.slice((page.value - 1) * pageSize, page.value * pageSize) || [])
const online = computed(() => data.value?.records.filter((item) => item.status !== '离线').length || 0)
const back = () => void router.push({ name: 'digitalDashboard', query: { line: line.value, workshop: workshop.value } })
</script>

<template>
  <div class="digital-dashboard-layout agv-page">
    <DashboardTopbar title="AGV 调度看板" eyebrow="FLEET ORCHESTRATION" :context="`${store.site.name} · ${currentLine?.name || ''}`" back :loading="status === 'loading'" @back="back" @refresh="reload">
      <el-select v-model="workshop" size="small" style="width: 130px"><el-option v-for="item in workshops" :key="item" :label="item" :value="item" /></el-select>
      <el-select v-model="line" size="small" style="width: 145px"><el-option v-for="item in lines" :key="item.id" :label="item.name" :value="item.id" /></el-select>
    </DashboardTopbar>

    <main class="dashboard-page-body agv-grid">
      <DashboardPanel class="map-panel" title="实时路径调度" kicker="LIVE MAP" :status="status" :error-message="error" @retry="reload">
        <template #header-extra><Navigation :size="12" />动态位置</template>
        <div v-if="data" class="map-body">
          <div class="fleet-metrics">
            <MetricValue label="在线车辆" :value="`${online}/${data.records.length}`" tone="green" compact />
            <MetricValue label="完成任务" :value="data.completedTasks" tone="cyan" compact />
            <MetricValue label="运行里程" :value="data.mileage" unit="km" compact />
            <MetricValue label="活动告警" :value="data.activeAlarms" tone="red" compact />
          </div>
          <AgvMap :records="data.records" />
        </div>
      </DashboardPanel>

      <DashboardPanel class="utilization" title="车队利用率" kicker="UTILIZATION" :status="status"><EChart v-if="data" :option="utilizationOption" /></DashboardPanel>
      <DashboardPanel class="cycle" title="工位配送节拍" kicker="CYCLE TIME" :status="status"><EChart v-if="data" :option="cycleOption" /></DashboardPanel>

      <DashboardPanel class="table-panel" title="AGV 运行清单" kicker="FLEET STATUS" :status="status">
        <template #header-extra><Route :size="12" />{{ data?.records.length || 0 }} 台</template>
        <div v-if="data" class="table-body">
          <el-table :data="pageRows" height="100%" size="small">
            <el-table-column prop="id" label="车辆" width="90" />
            <el-table-column prop="type" label="类型" width="72" />
            <el-table-column label="状态" width="86"><template #default="scope"><span class="status-cell" :class="scope.row.status"><i />{{ scope.row.status }}</span></template></el-table-column>
            <el-table-column prop="position" label="当前位置" min-width="130" />
            <el-table-column prop="task" label="任务" min-width="110" />
            <el-table-column label="电量" width="130"><template #default="scope"><span class="battery"><BatteryCharging :size="12" /><i><b :style="{ width: `${scope.row.battery}%` }" /></i><em class="mono">{{ scope.row.battery }}%</em></span></template></el-table-column>
          </el-table>
          <el-pagination v-model:current-page="page" small background layout="prev, pager, next" :page-size="pageSize" :total="data.records.length" />
        </div>
      </DashboardPanel>

      <DashboardPanel class="alarm-panel" title="调度事件" kicker="EVENT STREAM" :status="status">
        <div class="event-stream">
          <div class="event alarm"><AlertTriangle :size="14" /><span><strong>AGV-05 通信中断</strong><small class="mono">16:22:19 · 维修区</small></span></div>
          <div class="event"><CircleCheck :size="14" /><span><strong>AGV-04 完成配送任务</strong><small class="mono">16:21:46 · 总装 B 区</small></span></div>
          <div class="event"><CircleCheck :size="14" /><span><strong>AGV-02 进入取料位</strong><small class="mono">16:20:03 · 缓存区</small></span></div>
        </div>
      </DashboardPanel>
    </main>
  </div>
</template>

<style scoped>
.agv-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(340px, .9fr); grid-template-rows: minmax(0, 1.1fr) minmax(0, .9fr); gap: var(--dd-gap); }.map-panel { grid-row: 1; }.utilization { grid-column: 2; grid-row: 1; margin-bottom: calc(50% + 5px); }.cycle { grid-column: 2; grid-row: 1; margin-top: calc(50% + 5px); }.table-panel { grid-column: 1; grid-row: 2; }.alarm-panel { grid-column: 2; grid-row: 2; }
.map-body { height: 100%; display: grid; grid-template-rows: 50px minmax(0, 1fr); gap: 9px; }.fleet-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.table-body { height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) 28px; }.el-pagination { justify-self: end; align-self: end; }
.status-cell { display: inline-flex; align-items: center; gap: 5px; }.status-cell i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }.status-cell.运行 { color: var(--dd-green); }.status-cell.充电 { color: var(--dd-amber); }.status-cell.离线 { color: var(--dd-red); }
.battery { display: grid; grid-template-columns: auto 1fr 32px; align-items: center; gap: 5px; color: var(--dd-text-3); }.battery i { height: 4px; overflow: hidden; background: rgba(126,160,180,.12); }.battery b { display: block; height: 100%; background: var(--dd-green); }.battery em { font-size: 8px; font-style: normal; }
.event-stream { display: grid; gap: 7px; }.event { min-height: 48px; display: flex; align-items: center; gap: 9px; padding: 8px 9px; border-left: 2px solid var(--dd-green); background: rgba(98,214,154,.04); color: var(--dd-green); }.event.alarm { border-color: var(--dd-red); color: var(--dd-red); background: rgba(255,111,104,.05); }.event span { display: grid; gap: 4px; }.event strong { color: var(--dd-text-2); font-size: 10px; }.event small { color: var(--dd-text-3); font-size: 8px; }
</style>
