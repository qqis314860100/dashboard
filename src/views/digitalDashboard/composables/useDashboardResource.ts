import { onScopeDispose, ref, shallowRef, watch, type WatchSource } from 'vue'
import type { DashboardStatus } from '../types'

export function useDashboardResource<T>(loader: () => Promise<T>, sources: WatchSource[] = []) {
  const data = shallowRef<T | null>(null)
  const status = ref<DashboardStatus>('loading')
  const error = ref('')
  let requestId = 0

  const reload = async () => {
    const currentRequest = ++requestId
    status.value = 'loading'
    error.value = ''
    try {
      const result = await loader()
      if (currentRequest !== requestId) return
      data.value = result
      status.value = result ? 'success' : 'empty'
    } catch (reason) {
      if (currentRequest !== requestId) return
      error.value = reason instanceof Error ? reason.message : '数据加载失败'
      status.value = 'error'
    }
  }

  const stop = watch(sources, reload, { immediate: true })
  onScopeDispose(() => {
    requestId += 1
    stop()
  })

  return { data, status, error, reload }
}
