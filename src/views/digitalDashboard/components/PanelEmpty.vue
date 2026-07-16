<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
withDefaults(defineProps<{ title?: string; description?: string }>(), { title: '暂无数据', description: '当前筛选条件没有返回结果' })
</script>

<template>
  <div class="panel-state"><Inbox :size="24" /><strong>{{ title }}</strong><span>{{ description }}</span></div>
</template>

<style scoped>
.panel-state { height: 100%; min-height: 90px; display: grid; place-content: center; justify-items: center; gap: 7px; color: var(--dd-text-3); text-align: center; }
strong { color: var(--dd-text-2); font-size: 13px; font-weight: 600; }
span { font-size: 11px; }
</style>
