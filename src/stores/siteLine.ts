import { defineStore } from 'pinia'

export interface LineDetail {
  id: string
  name: string
  workshop: string
}

export const useSiteLine = defineStore('siteLine', {
  state: () => ({
    site: { id: 'wuxi', name: '无锡智能制造基地' },
    lineDetails: [
      { id: 'line-a', name: '总装一线', workshop: '总装车间' },
      { id: 'line-b', name: '总装二线', workshop: '总装车间' },
      { id: 'line-c', name: '电驱装配线', workshop: '动力车间' },
      { id: 'line-d', name: '电池包一线', workshop: '新能源车间' },
    ] as LineDetail[],
  }),
})
