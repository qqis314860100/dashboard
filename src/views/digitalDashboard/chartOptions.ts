import type { EChartsOption } from 'echarts'

const axisColor = 'rgba(154, 179, 201, 0.46)'
const splitColor = 'rgba(121, 151, 175, 0.11)'
const tooltip = { trigger: 'axis' as const, backgroundColor: '#111a22', borderColor: 'rgba(83, 201, 221, .35)', textStyle: { color: '#eef8fa' } }

export function lineChartOption(labels: string[], series: Array<{ name: string; values: number[]; color: string; area?: boolean }>, unit = ''): EChartsOption {
  return {
    animationDuration: 700,
    color: series.map((item) => item.color),
    tooltip: { ...tooltip, valueFormatter: (value) => `${value}${unit}` },
    grid: { left: 42, right: 18, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: labels, boundaryGap: false, axisLine: { lineStyle: { color: axisColor } }, axisTick: { show: false }, axisLabel: { color: axisColor, fontSize: 10 } },
    yAxis: { type: 'value', scale: true, splitNumber: 4, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: axisColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitColor } } },
    series: series.map((item) => ({
      name: item.name,
      type: 'line',
      data: item.values,
      smooth: 0.36,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 2 },
      areaStyle: item.area ? { opacity: 0.09 } : undefined,
    })),
  }
}

export function barChartOption(labels: string[], values: number[], color = '#55d4db', unit = ''): EChartsOption {
  return {
    animationDuration: 650,
    tooltip: { ...tooltip, valueFormatter: (value) => `${value}${unit}` },
    grid: { left: 42, right: 18, top: 22, bottom: 32 },
    xAxis: { type: 'category', data: labels, axisLine: { lineStyle: { color: axisColor } }, axisTick: { show: false }, axisLabel: { color: axisColor, fontSize: 10, interval: 0 } },
    yAxis: { type: 'value', axisLabel: { color: axisColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitColor } } },
    series: [{ type: 'bar', data: values, barWidth: '48%', itemStyle: { color, borderRadius: [2, 2, 0, 0] } }],
  }
}

export function donutChartOption(value: number, color = '#55d4db'): EChartsOption {
  return {
    animationDuration: 700,
    series: [{
      type: 'pie',
      radius: ['72%', '88%'],
      silent: true,
      label: { show: false },
      data: [
        { value, itemStyle: { color } },
        { value: Math.max(0, 100 - value), itemStyle: { color: 'rgba(126, 158, 181, .12)' } },
      ],
    }],
  }
}
