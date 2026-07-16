<script setup lang="ts">
import type { DashboardStatus } from '../types'
import PanelEmpty from './PanelEmpty.vue'
import PanelError from './PanelError.vue'
import PanelLoading from './PanelLoading.vue'

withDefaults(defineProps<{
  title: string
  kicker?: string
  status?: DashboardStatus
  errorMessage?: string
  interactive?: boolean
}>(), { kicker: '', status: 'success', errorMessage: '', interactive: false })

defineEmits<{ retry: []; activate: [] }>()
</script>

<template>
  <section class="dashboard-panel" :class="{ interactive }" @click="interactive && $emit('activate')">
    <header class="panel-header">
      <div class="panel-title">
        <span v-if="kicker" class="kicker mono">{{ kicker }}</span>
        <h2>{{ title }}</h2>
      </div>
      <div class="header-extra" @click.stop><slot name="header-extra" /></div>
    </header>
    <div class="panel-body">
      <PanelLoading v-if="status === 'loading'" />
      <PanelEmpty v-else-if="status === 'empty'" />
      <PanelError v-else-if="status === 'error'" :message="errorMessage" @retry="$emit('retry')" />
      <slot v-else />
    </div>
    <span class="panel-index" aria-hidden="true" />
  </section>
</template>

<style scoped>
.dashboard-panel {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--dd-line);
  border-radius: var(--dd-radius);
  background: rgba(17, 25, 32, .94);
  box-shadow: 0 16px 36px rgba(0, 0, 0, .13);
  animation: dd-enter .38s ease both;
}
.dashboard-panel::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 2px; background: linear-gradient(var(--dd-cyan), transparent 72%); opacity: .55; }
.dashboard-panel.interactive { cursor: pointer; transition: transform .18s ease, border-color .18s ease, background .18s ease; }
.dashboard-panel.interactive:hover { transform: translateY(-2px); border-color: var(--dd-line-strong); background: rgba(19, 30, 37, .98); }
.panel-header { height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 13px; border-bottom: 1px solid var(--dd-line); }
.panel-title { min-width: 0; display: flex; align-items: baseline; gap: 9px; }
.kicker { color: var(--dd-cyan); font-size: 9px; font-weight: 700; letter-spacing: 0; }
h2 { margin: 0; overflow: hidden; color: var(--dd-text); font-size: 13px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.header-extra { display: flex; align-items: center; gap: 7px; color: var(--dd-text-3); font-size: 10px; }
.panel-body { height: calc(100% - 42px); min-height: 0; padding: 12px; }
.panel-index { position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; border-right: 1px solid rgba(85, 212, 219, .3); border-bottom: 1px solid rgba(85, 212, 219, .3); pointer-events: none; }
@media (max-width: 1450px) { .panel-body { padding: 10px; } .panel-header { height: 40px; } }
</style>
