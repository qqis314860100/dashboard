<script setup lang="ts">
import { RefreshCw, TriangleAlert } from 'lucide-vue-next'
withDefaults(defineProps<{ message?: string; retryable?: boolean }>(), { message: '运行数据暂时不可用', retryable: true })
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="panel-state">
    <TriangleAlert :size="24" />
    <strong>连接异常</strong>
    <span>{{ message }}</span>
    <button v-if="retryable" type="button" @click="$emit('retry')"><RefreshCw :size="13" />重试</button>
  </div>
</template>

<style scoped>
.panel-state { height: 100%; min-height: 90px; display: grid; place-content: center; justify-items: center; gap: 7px; color: var(--dd-red); text-align: center; }
strong { font-size: 13px; }
span { color: var(--dd-text-3); font-size: 11px; }
button { display: inline-flex; align-items: center; gap: 6px; margin-top: 3px; padding: 6px 10px; border: 1px solid rgba(255, 111, 104, .3); border-radius: 4px; color: var(--dd-red); background: rgba(255, 111, 104, .07); cursor: pointer; }
</style>
