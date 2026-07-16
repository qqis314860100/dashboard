import { createRouter, createWebHistory } from 'vue-router'
import { digitalDashboardRoutes } from './route'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/digitalDashboard' },
    ...digitalDashboardRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/digitalDashboard' },
  ],
})
