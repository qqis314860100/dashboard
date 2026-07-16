<script setup lang="ts">
withDefaults(defineProps<{ label: string; value: string | number; unit?: string; tone?: 'default' | 'green' | 'amber' | 'red' | 'cyan'; compact?: boolean }>(), { unit: '', tone: 'default', compact: false })
</script>

<template>
  <div class="metric-value" :class="[tone, { compact }]">
    <span>{{ label }}</span>
    <strong class="mono">{{ value }}<small>{{ unit }}</small></strong>
  </div>
</template>

<style scoped>
.metric-value { min-width: 0; display: grid; align-content: center; gap: 4px; padding: 9px 10px; border-left: 2px solid var(--dd-line); background: rgba(255,255,255,.018); }
.metric-value span { overflow: hidden; color: var(--dd-text-3); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.metric-value strong { overflow: hidden; color: var(--dd-text); font-size: 22px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.metric-value small { margin-left: 3px; color: var(--dd-text-3); font-size: 9px; font-weight: 500; }
.metric-value.compact { padding: 5px 8px; }
.metric-value.compact strong { font-size: 17px; }
.metric-value.green { border-color: var(--dd-green); }.metric-value.green strong { color: var(--dd-green); }
.metric-value.amber { border-color: var(--dd-amber); }.metric-value.amber strong { color: var(--dd-amber); }
.metric-value.red { border-color: var(--dd-red); }.metric-value.red strong { color: var(--dd-red); }
.metric-value.cyan { border-color: var(--dd-cyan); }.metric-value.cyan strong { color: var(--dd-cyan); }
</style>
