<script setup lang="ts">
import { computed } from 'vue'
import type { Station } from '../types'

const props = withDefaults(defineProps<{ stations: Station[]; compact?: boolean }>(), { compact: false })
const statusLabel = { running: '运行', idle: '待机', warning: '异常', offline: '离线' }
const path = computed(() => props.stations.map((item, index) => `${index ? 'L' : 'M'} ${item.x} ${item.y}`).join(' '))
</script>

<template>
  <div class="line-map" :class="{ compact }">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="产线工站状态图">
      <path :d="path" class="flow-base" />
      <path :d="path" class="flow-active" />
    </svg>
    <button v-for="station in stations" :key="station.id" type="button" class="station" :class="station.status" :style="{ left: `${station.x}%`, top: `${station.y}%` }" :title="`${station.name} · ${statusLabel[station.status]}`">
      <span class="station-code mono">{{ station.code }}</span>
      <strong v-if="!compact">{{ station.name }}</strong>
      <small v-if="!compact" class="mono">{{ station.cycle ? `${station.cycle}s` : '--' }}</small>
    </button>
    <div class="map-axis mono"><span>FLOW / 01</span><span>TACT 12.0s</span></div>
  </div>
</template>

<style scoped>
.line-map { position: relative; width: 100%; height: 100%; min-height: 150px; overflow: hidden; border: 1px solid rgba(126, 162, 182, .12); background-image: linear-gradient(rgba(110,155,169,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(110,155,169,.045) 1px, transparent 1px); background-size: 24px 24px; }
svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.flow-base, .flow-active { fill: none; vector-effect: non-scaling-stroke; }
.flow-base { stroke: rgba(123, 162, 180, .22); stroke-width: 2; }
.flow-active { stroke: var(--dd-cyan); stroke-width: 1.5; stroke-dasharray: 5 7; animation: flow 4s linear infinite; }
@keyframes flow { to { stroke-dashoffset: -48; } }
.station { position: absolute; width: 92px; min-height: 48px; display: grid; justify-items: start; gap: 2px; padding: 7px 8px; transform: translate(-50%, -50%); border: 1px solid var(--dd-line); border-radius: 3px; color: var(--dd-text); background: #121c22; text-align: left; cursor: default; }
.station::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--tone); }
.station-code { color: var(--tone); font-size: 8px; }.station strong { font-size: 10px; font-weight: 600; }.station small { color: var(--dd-text-3); font-size: 8px; }
.running { --tone: var(--dd-green); }.idle { --tone: var(--dd-amber); }.warning { --tone: var(--dd-red); }.offline { --tone: #75838d; opacity: .62; }
.map-axis { position: absolute; right: 8px; bottom: 7px; left: 8px; display: flex; justify-content: space-between; color: var(--dd-text-3); font-size: 7px; }
.compact .station { width: 30px; min-height: 22px; padding: 5px 4px; justify-items: center; }.compact .station-code { font-size: 6px; }.compact .map-axis { display: none; }
</style>
