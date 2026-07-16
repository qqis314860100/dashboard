import type {
  AgvDashboardData,
  DashboardDataSource,
  DeviceDashboardData,
  LineDashboardData,
  OverviewData,
  ReliabilityDashboardData,
  TighteningDashboardData,
} from '../types'

const labels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']

const overview: OverviewData = {
  line: { oee: 86.4, yieldRate: 98.2, output: 856, target: 1200, trend: { labels, values: [74, 79, 81, 84, 87, 86.4] } },
  agv: { online: 7, total: 8, utilization: 76.8, tasks: 342, trend: { labels, values: [62, 68, 71, 74, 79, 76.8] } },
  device: { running: 28, total: 32, alarms: 3, availability: 94.6 },
  tightening: { passRate: 97.6, averageAngle: 42.8, anomalies: 7, trend: { labels, values: [96.2, 96.8, 97.1, 96.9, 97.4, 97.6] } },
  reliability: { mtbf: 128, mttr: 27, faultRate: 1.8, trend: { labels, values: [108, 116, 112, 124, 131, 128] } },
}

const lineData: LineDashboardData = {
  stations: [
    { id: 'st-01', name: '上料缓存', code: 'ST-01', status: 'running', cycle: 11.8, x: 8, y: 30 },
    { id: 'st-02', name: '壳体装配', code: 'ST-02', status: 'running', cycle: 12.2, x: 22, y: 30 },
    { id: 'st-03', name: '视觉检测', code: 'ST-03', status: 'warning', cycle: 14.6, x: 36, y: 30 },
    { id: 'st-04', name: '精密拧紧', code: 'ST-04', status: 'running', cycle: 11.4, x: 50, y: 30 },
    { id: 'st-05', name: '气密测试', code: 'ST-05', status: 'idle', cycle: 18.1, x: 64, y: 30 },
    { id: 'st-06', name: '功能检测', code: 'ST-06', status: 'running', cycle: 12.7, x: 78, y: 30 },
    { id: 'st-07', name: '激光打标', code: 'ST-07', status: 'offline', cycle: 0, x: 78, y: 68 },
    { id: 'st-08', name: '成品下线', code: 'ST-08', status: 'running', cycle: 12.1, x: 64, y: 68 },
  ],
  attendance: { target: 48, actual: 45, late: 2, leave: 1 },
  health: [
    { name: '压装机 A01', value: 92 }, { name: '机器人 R01', value: 88 }, { name: '视觉机 V03', value: 76 },
    { name: '拧紧机 T04', value: 84 }, { name: '气密台 L02', value: 58 }, { name: '打标机 M01', value: 81 },
  ],
  output: { current: 856, target: 1200, wip: 43, defects: 7 },
  cycleRows: [
    { process: '上料缓存', cycle: 11.8, overRate: -1.7 }, { process: '壳体装配', cycle: 12.2, overRate: 1.7 },
    { process: '视觉检测', cycle: 14.6, overRate: 21.7 }, { process: '精密拧紧', cycle: 11.4, overRate: -5 },
  ],
  quality: { labels, values: [96.8, 97.3, 97.1, 98.2, 98.6, 98.4] },
  materialAlerts: ['密封圈 SR-204 低于安全库存', 'M8 法兰螺栓剩余 1.4 小时'],
}

const agvData: AgvDashboardData = {
  records: [
    { id: 'AGV-01', type: '物料', status: '运行', position: '总装 A 区', battery: 86, task: '配送中', x: 15, y: 24 },
    { id: 'AGV-02', type: '物料', status: '运行', position: '缓存区', battery: 72, task: '取料中', x: 41, y: 22 },
    { id: 'AGV-03', type: '人员', status: '充电', position: '充电桩 02', battery: 38, task: '待命', x: 82, y: 74 },
    { id: 'AGV-04', type: '物料', status: '运行', position: '总装 B 区', battery: 91, task: '配送中', x: 67, y: 28 },
    { id: 'AGV-05', type: '人员', status: '离线', position: '维修区', battery: 0, task: '离线', x: 84, y: 18 },
    { id: 'AGV-06', type: '物料', status: '运行', position: '立库出口', battery: 64, task: '取料中', x: 19, y: 72 },
    { id: 'AGV-07', type: '物料', status: '运行', position: '总装 A 区', battery: 55, task: '配送中', x: 46, y: 70 },
    { id: 'AGV-08', type: '人员', status: '运行', position: '办公通道', battery: 78, task: '运输中', x: 68, y: 66 },
  ],
  utilization: { labels, values: [62, 68, 71, 74, 79, 76] },
  cycle: [
    { station: '线边库 A', actual: 3.8, target: 4.2 }, { station: '总装 A 区', actual: 5.1, target: 4.8 },
    { station: '总装 B 区', actual: 4.4, target: 4.6 }, { station: '成品暂存', actual: 6.2, target: 5.5 },
  ],
  completedTasks: 342,
  mileage: 86.4,
  activeAlarms: 1,
}

const deviceData: DeviceDashboardData = {
  devices: [
    { id: 'dev-01', name: '精密压装机 A01', code: 'PRESS-A01', status: '运行' },
    { id: 'dev-02', name: '自动拧紧机 T04', code: 'TIGHT-T04', status: '待机' },
    { id: 'dev-03', name: '气密检测台 L02', code: 'LEAK-L02', status: '异常' },
  ],
  output: { current: 684, target: 900, passRate: 98.6, cycle: 11.8 },
  telemetry: [
    { label: '主轴载荷', value: '68%', tone: 'normal' }, { label: '液压压力', value: '6.4 MPa', tone: 'normal' },
    { label: '振动 RMS', value: '4.8 mm/s', tone: 'warning' }, { label: '控制温度', value: '46.2°C', tone: 'normal' },
  ],
  alarms: [
    { time: '16:42:08', level: '严重', message: '检测压力低于控制下限' },
    { time: '16:38:21', level: '警告', message: '主轴振动接近预警阈值' },
    { time: '16:31:45', level: '提示', message: '夹具寿命剩余 12%' },
  ],
  temperature: { labels, values: [38, 40, 41, 43, 45, 46.2] },
}

const tighteningData: TighteningDashboardData = {
  passRate: { labels: ['07/10', '07/11', '07/12', '07/13', '07/14', '07/15', '07/16'], values: [96.2, 96.8, 97.1, 96.9, 97.4, 97.2, 97.6] },
  amplitudeByLine: [
    { name: '总装一线', value: 8.4 }, { name: '总装二线', value: 6.7 }, { name: '电驱装配', value: 5.2 }, { name: '电池包一线', value: 3.8 },
  ],
  distribution: [
    { range: '< -5°', value: 4 }, { range: '-5~-2°', value: 12 }, { range: '-2~0°', value: 31 },
    { range: '0~2°', value: 46 }, { range: '2~5°', value: 18 }, { range: '> 5°', value: 6 },
  ],
  priorities: [
    { rank: 1, item: '电驱壳体 M8-04', line: '电驱装配线', deviation: 6.8, owner: '工艺一组' },
    { rank: 2, item: '电池托盘 B12', line: '电池包一线', deviation: 5.6, owner: '工艺三组' },
    { rank: 3, item: '前副车架 A07', line: '总装一线', deviation: 4.9, owner: '工艺二组' },
  ],
}

const reliabilityData: ReliabilityDashboardData = {
  mtbf: { labels, values: [108, 116, 112, 124, 131, 128] },
  mttr: { labels, values: [38, 34, 36, 29, 25, 27] },
  faultRate: { labels, values: [3.8, 3.1, 3.4, 2.6, 1.9, 1.8] },
  downtime: { labels, values: [86, 74, 81, 62, 48, 52] },
  summary: { mtbf: 128, mttr: 27, availability: 96.8, faults: 21 },
  faults: [
    { device: '气密检测台 L02', type: '压力异常', count: 8, duration: 126, impact: '高' },
    { device: '视觉检测机 V03', type: '识别失败', count: 6, duration: 72, impact: '中' },
    { device: '自动拧紧机 T04', type: '扭矩超限', count: 4, duration: 48, impact: '中' },
    { device: '上料机器人 R01', type: '夹取失败', count: 3, duration: 31, impact: '低' },
  ],
}

const wait = <T>(value: T, delay = 260) => new Promise<T>((resolve) => window.setTimeout(() => resolve(structuredClone(value)), delay))

export const dashboardDataSource: DashboardDataSource = {
  getOverview: () => wait(overview),
  getLineDashboard: () => wait(lineData),
  getAgvDashboard: () => wait(agvData),
  getDeviceDashboard: () => wait(deviceData),
  getTighteningDashboard: () => wait(tighteningData),
  getReliabilityDashboard: () => wait(reliabilityData),
}
