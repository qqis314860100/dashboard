<script setup lang="ts">
import { BatteryCharging, Box, UserRound } from 'lucide-vue-next'
import type { AgvRecord } from '../types'

withDefaults(defineProps<{ records: AgvRecord[]; compact?: boolean }>(), { compact: false })
</script>

<template>
  <div class="agv-map" :class="{ compact }">
    <div class="route route-a" /><div class="route route-b" /><div class="route route-c" />
    <div class="zone zone-a">ASSEMBLY A</div><div class="zone zone-b">ASSEMBLY B</div><div class="zone zone-c">BUFFER</div>
    <button v-for="agv in records" :key="agv.id" type="button" class="agv-unit" :class="agv.status" :style="{ left: `${agv.x}%`, top: `${agv.y}%` }" :title="`${agv.id} · ${agv.position} · ${agv.task}`">
      <Box v-if="agv.type === '物料'" :size="compact ? 10 : 13" />
      <UserRound v-else :size="compact ? 10 : 13" />
      <span class="mono">{{ agv.id.replace('AGV-', '') }}</span>
      <small v-if="!compact"><BatteryCharging :size="10" />{{ agv.battery }}%</small>
    </button>
    <div class="map-legend mono"><span><i class="running-dot" />运行</span><span><i class="charging-dot" />充电</span><span><i class="offline-dot" />离线</span></div>
  </div>
</template>

<style scoped>
.agv-map { position: relative; height: 100%; min-height: 190px; overflow: hidden; border: 1px solid rgba(126, 162, 182, .12); background: rgba(8, 13, 17, .5); }
.agv-map::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(110,155,169,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(110,155,169,.04) 1px, transparent 1px); background-size: 22px 22px; }
.route { position: absolute; border: 1px dashed rgba(85, 212, 219, .22); }.route-a { inset: 13% 9% 54% 8%; }.route-b { inset: 54% 16% 10% 8%; }.route-c { top: 16%; right: 8%; width: 14%; height: 68%; }
.zone { position: absolute; display: grid; place-items: center; border: 1px solid rgba(137, 168, 181, .1); color: rgba(151, 182, 190, .18); font: 700 11px "DIN Alternate", sans-serif; }.zone-a { left: 23%; top: 20%; width: 22%; height: 21%; }.zone-b { left: 52%; top: 20%; width: 20%; height: 21%; }.zone-c { left: 28%; top: 61%; width: 32%; height: 18%; }
.agv-unit { position: absolute; z-index: 2; width: 48px; height: 34px; display: grid; grid-template-columns: auto auto; place-content: center; gap: 2px 4px; transform: translate(-50%, -50%); border: 1px solid var(--tone); border-radius: 3px; color: var(--tone); background: #101a20; cursor: default; box-shadow: 0 0 12px color-mix(in srgb, var(--tone) 18%, transparent); }
.agv-unit span { font-size: 9px; font-weight: 700; }.agv-unit small { grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 2px; color: var(--dd-text-3); font-size: 7px; }
.运行 { --tone: var(--dd-green); }.充电 { --tone: var(--dd-amber); }.离线 { --tone: var(--dd-red); opacity: .68; }
.map-legend { position: absolute; right: 9px; bottom: 7px; display: flex; gap: 10px; color: var(--dd-text-3); font-size: 7px; }.map-legend span { display: flex; align-items: center; gap: 4px; }.map-legend i { width: 5px; height: 5px; border-radius: 50%; }.running-dot { background: var(--dd-green); }.charging-dot { background: var(--dd-amber); }.offline-dot { background: var(--dd-red); }
.compact .agv-unit { width: 26px; height: 22px; grid-template-columns: auto auto; }.compact .agv-unit span { font-size: 6px; }.compact .map-legend { display: none; }
</style>
