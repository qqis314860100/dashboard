<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ArrowLeft, Radio, RefreshCw } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  context?: string
  back?: boolean
  loading?: boolean
}>(), { eyebrow: 'DIGITAL OPERATIONS', context: '', back: false, loading: false })

defineEmits<{ back: []; refresh: [] }>()

const now = ref(new Date())
const timer = window.setInterval(() => { now.value = new Date() }, 1000)
onBeforeUnmount(() => window.clearInterval(timer))

const time = computed(() => now.value.toLocaleTimeString('zh-CN', { hour12: false }))
const date = computed(() => now.value.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' }))
</script>

<template>
  <header class="dashboard-topbar">
    <div class="brand-block">
      <button v-if="back" class="icon-button" type="button" title="返回监控室" @click="$emit('back')"><ArrowLeft :size="17" /></button>
      <div class="brand-copy">
        <span class="eyebrow mono">{{ eyebrow }}</span>
        <div class="title-row"><h1>{{ title }}</h1><span v-if="context" class="context">{{ context }}</span></div>
      </div>
    </div>

    <div class="topbar-filters"><slot /></div>

    <div class="system-block">
      <div class="live-state"><Radio :size="14" /><span>LIVE</span></div>
      <button class="icon-button" type="button" title="刷新数据" :class="{ spinning: loading }" @click="$emit('refresh')"><RefreshCw :size="15" /></button>
      <div class="clock mono"><strong>{{ time }}</strong><span>{{ date }}</span></div>
    </div>
  </header>
</template>

<style scoped>
.dashboard-topbar { height: 52px; display: grid; grid-template-columns: minmax(330px, 1fr) auto minmax(250px, 1fr); align-items: center; gap: 18px; padding: 0 14px; border: 1px solid var(--dd-line); border-radius: var(--dd-radius); background: rgba(12, 19, 24, .96); box-shadow: 0 12px 30px rgba(0, 0, 0, .16); }
.brand-block, .brand-copy, .title-row, .system-block, .topbar-filters { display: flex; align-items: center; }
.brand-block { min-width: 0; gap: 11px; }
.brand-copy { min-width: 0; align-items: flex-start; flex-direction: column; gap: 2px; }
.eyebrow { color: var(--dd-cyan); font-size: 8px; font-weight: 700; }
.title-row { min-width: 0; gap: 10px; }
h1 { margin: 0; overflow: hidden; font-family: "DIN Condensed", "Bahnschrift", sans-serif; font-size: 19px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.context { padding-left: 10px; border-left: 1px solid var(--dd-line); color: var(--dd-text-3); font-size: 11px; white-space: nowrap; }
.topbar-filters { justify-content: center; gap: 8px; }
.system-block { justify-content: flex-end; gap: 9px; }
.live-state { display: flex; align-items: center; gap: 5px; color: var(--dd-green); font-size: 9px; font-weight: 800; }
.live-state svg { animation: dd-pulse 1.8s ease-in-out infinite; }
.clock { min-width: 78px; display: grid; justify-items: end; line-height: 1.05; }
.clock strong { font-size: 16px; font-weight: 650; }
.clock span { margin-top: 3px; color: var(--dd-text-3); font-size: 8px; }
.spinning svg { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1450px) { .dashboard-topbar { grid-template-columns: minmax(280px, 1fr) auto minmax(215px, 1fr); gap: 10px; padding: 0 10px; } .context { display: none; } }
</style>
