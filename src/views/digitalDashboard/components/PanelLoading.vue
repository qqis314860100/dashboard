<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), { message: '正在同步运行数据' })
</script>

<template>
  <div class="panel-state">
    <div class="loading-bars" aria-hidden="true"><i /><i /><i /><i /></div>
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
.panel-state { height: 100%; min-height: 90px; display: grid; place-content: center; gap: 12px; color: var(--dd-text-3); font-size: 12px; text-align: center; }
.loading-bars { display: flex; justify-content: center; align-items: end; gap: 4px; height: 24px; }
.loading-bars i { width: 3px; height: 10px; background: var(--dd-cyan); animation: bars .9s ease-in-out infinite; }
.loading-bars i:nth-child(2) { height: 20px; animation-delay: .12s; }
.loading-bars i:nth-child(3) { height: 15px; animation-delay: .24s; }
.loading-bars i:nth-child(4) { height: 22px; animation-delay: .36s; }
@keyframes bars { 50% { opacity: .32; transform: scaleY(.55); } }
</style>
