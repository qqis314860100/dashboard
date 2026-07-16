import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteLine } from '@/stores/siteLine'

const STORAGE_KEY = 'digitalDashboardFiltersState'

interface PersistedFilters {
  workshop?: string
  line?: string
  deviceId?: string
  timeRange?: '1d' | '7d' | '30d'
}

function readPersisted(): PersistedFilters {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as PersistedFilters
  } catch {
    return {}
  }
}

export function useDashboardFilters() {
  const store = useSiteLine()
  const route = useRoute()
  const router = useRouter()
  const persisted = readPersisted()

  const workshops = computed(() => [...new Set(store.lineDetails.map((item) => item.workshop))])
  const workshop = ref(String(route.query.workshop || persisted.workshop || workshops.value[0] || ''))
  const lines = computed(() => store.lineDetails.filter((item) => item.workshop === workshop.value))
  const line = ref(String(route.query.line || persisted.line || lines.value[0]?.id || ''))
  const deviceId = ref(String(route.query.deviceId || persisted.deviceId || 'dev-01'))
  const timeRange = ref<'1d' | '7d' | '30d'>((route.query.timeRange || persisted.timeRange || '7d') as '1d' | '7d' | '30d')

  const currentLine = computed(() => store.lineDetails.find((item) => item.id === line.value) || lines.value[0])

  watch(workshop, () => {
    if (!lines.value.some((item) => item.id === line.value)) line.value = lines.value[0]?.id || ''
  })

  watch([workshop, line, deviceId, timeRange], () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ workshop: workshop.value, line: line.value, deviceId: deviceId.value, timeRange: timeRange.value }))
    void router.replace({
      query: {
        ...route.query,
        site: store.site.id,
        workshop: workshop.value || undefined,
        line: line.value || undefined,
        deviceId: route.path.includes('/device') ? deviceId.value : undefined,
        timeRange: route.path.includes('/mtbf') ? timeRange.value : undefined,
      },
    })
  }, { immediate: true })

  return { store, workshops, workshop, lines, line, currentLine, deviceId, timeRange }
}
