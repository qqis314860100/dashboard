import type { RouteRecordRaw } from 'vue-router'

export const digitalDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/digitalDashboard',
    name: 'digitalDashboard',
    component: () => import('@/views/digitalDashboard/index.vue'),
    meta: { title: '数字看板', isHide: false, isKeepAlive: true, icon: 'ele-Clock' },
  },
  {
    path: '/digitalDashboard/laxian',
    name: 'digitalDashboard-laxian',
    component: () => import('@/views/digitalDashboard/laxian/index.vue'),
    meta: { title: '拉线看板', isHide: true, isKeepAlive: true },
  },
  {
    path: '/digitalDashboard/agv',
    name: 'digitalDashboard-agv',
    component: () => import('@/views/digitalDashboard/agv/index.vue'),
    meta: { title: 'AGV看板', isHide: true, isKeepAlive: true },
  },
  {
    path: '/digitalDashboard/device',
    name: 'digitalDashboard-device',
    component: () => import('@/views/digitalDashboard/device/index.vue'),
    meta: { title: '设备看板', isHide: true, isKeepAlive: true },
  },
  {
    path: '/digitalDashboard/ningjing',
    name: 'digitalDashboard-ningjing',
    component: () => import('@/views/digitalDashboard/ningjingjiaodu/index.vue'),
    meta: { title: '拧紧角度看板', isHide: true, isKeepAlive: true },
  },
  {
    path: '/digitalDashboard/mtbf',
    name: 'digitalDashboard-mtbf',
    component: () => import('@/views/digitalDashboard/mtbf/index.vue'),
    meta: { title: 'MTBF看板', isHide: true, isKeepAlive: true },
  },
]
