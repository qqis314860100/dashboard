import type { Component } from 'vue'

export type DashboardTabKey = 'laxian' | 'agv' | 'device' | 'ningjing' | 'mtbf'
export type DashboardFilterKey = 'site' | 'workshop' | 'line' | 'device' | 'timeRange'

export interface DashboardTabMeta {
  key: DashboardTabKey
  label: string
  kicker: string
  filters: DashboardFilterKey[]
  component: Component
}

export interface DashboardQueryParams {
  site: string
  workshop: string
  line: string
  deviceId: string
  timeRange: '1d' | '7d' | '30d'
}

export const createDashboardTabs = (components: Record<DashboardTabKey, Component>): DashboardTabMeta[] => [
  { key: 'laxian', label: '拉线', kicker: 'LINE', filters: ['site', 'workshop', 'line'], component: components.laxian },
  { key: 'agv', label: 'AGV', kicker: 'AGV', filters: ['site', 'workshop', 'line'], component: components.agv },
  { key: 'device', label: '设备', kicker: 'DEVICE', filters: ['site', 'workshop', 'line', 'device'], component: components.device },
  { key: 'ningjing', label: '拧紧角度', kicker: 'ANGLE', filters: ['line'], component: components.ningjing },
  { key: 'mtbf', label: 'MTBF', kicker: 'MTBF', filters: ['site', 'workshop', 'line', 'timeRange'], component: components.mtbf },
]
