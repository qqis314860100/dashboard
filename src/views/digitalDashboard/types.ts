export type DashboardStatus = 'loading' | 'success' | 'empty' | 'error'
export type StationStatus = 'running' | 'idle' | 'warning' | 'offline'

export interface TrendSeries {
  labels: string[]
  values: number[]
}

export interface Station {
  id: string
  name: string
  code: string
  status: StationStatus
  cycle: number
  x: number
  y: number
}

export interface OverviewData {
  line: { oee: number; yieldRate: number; output: number; target: number; trend: TrendSeries }
  agv: { online: number; total: number; utilization: number; tasks: number; trend: TrendSeries }
  device: { running: number; total: number; alarms: number; availability: number }
  tightening: { passRate: number; averageAngle: number; anomalies: number; trend: TrendSeries }
  reliability: { mtbf: number; mttr: number; faultRate: number; trend: TrendSeries }
}

export interface LineDashboardData {
  stations: Station[]
  attendance: { target: number; actual: number; late: number; leave: number }
  health: Array<{ name: string; value: number }>
  output: { current: number; target: number; wip: number; defects: number }
  cycleRows: Array<{ process: string; cycle: number; overRate: number }>
  quality: TrendSeries
  materialAlerts: string[]
}

export interface AgvRecord {
  id: string
  type: '物料' | '人员'
  status: '运行' | '充电' | '离线'
  position: string
  battery: number
  task: string
  x: number
  y: number
}

export interface AgvDashboardData {
  records: AgvRecord[]
  utilization: TrendSeries
  cycle: Array<{ station: string; actual: number; target: number }>
  completedTasks: number
  mileage: number
  activeAlarms: number
}

export interface DeviceDashboardData {
  devices: Array<{ id: string; name: string; code: string; status: '运行' | '待机' | '异常' }>
  output: { current: number; target: number; passRate: number; cycle: number }
  telemetry: Array<{ label: string; value: string; tone: 'normal' | 'warning' | 'danger' }>
  alarms: Array<{ time: string; level: '严重' | '警告' | '提示'; message: string }>
  temperature: TrendSeries
}

export interface TighteningDashboardData {
  passRate: TrendSeries
  amplitudeByLine: Array<{ name: string; value: number }>
  distribution: Array<{ range: string; value: number }>
  priorities: Array<{ rank: number; item: string; line: string; deviation: number; owner: string }>
}

export interface ReliabilityDashboardData {
  mtbf: TrendSeries
  mttr: TrendSeries
  faultRate: TrendSeries
  downtime: TrendSeries
  summary: { mtbf: number; mttr: number; availability: number; faults: number }
  faults: Array<{ device: string; type: string; count: number; duration: number; impact: '高' | '中' | '低' }>
}

export interface DashboardDataSource {
  getOverview(lineId: string): Promise<OverviewData>
  getLineDashboard(lineId: string): Promise<LineDashboardData>
  getAgvDashboard(lineId: string): Promise<AgvDashboardData>
  getDeviceDashboard(lineId: string, deviceId: string): Promise<DeviceDashboardData>
  getTighteningDashboard(lineId: string, days: number): Promise<TighteningDashboardData>
  getReliabilityDashboard(lineId: string, range: string): Promise<ReliabilityDashboardData>
}
