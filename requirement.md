# 数字看板（Digital Dashboard）— Vibecoding 需求文档

> 用途：可直接喂给 AI 编码助手，逐模块实现
> 技术栈：Vue 3 + TypeScript + Pinia + Element Plus + SCSS
> 基础路径：`src/views/digitalDashboard/`

---

## 目录

- [模块 0：基础设施（必须先完成）](#模块-0基础设施必须先完成)
- [模块 1：电视墙总览页](#模块-1电视墙总览页)
- [模块 2：拉线看板](#模块-2拉线看板)
- [模块 3：AGV 看板](#模块-3agv-看板)
- [模块 4：设备看板](#模块-4设备看板)
- [模块 5：拧紧角度管控看板](#模块-5拧紧角度管控看板)
- [模块 6：MTBF/MTTR 分析看板](#模块-6mtbfmttr-分析看板)
- [模块 7：统一筛选机制](#模块-7统一筛选机制)
- [模块 8：公共组件体系](#模块-8公共组件体系)
- [模块 9：样式系统](#模块-9样式系统)

---

## 模块 0：基础设施（必须先完成）

### Task 0.1：路由注册

**路径**：`src/router/route.ts`

注册 1 个父路由 + 5 个子路由（全部隐藏，不显示在侧边栏）：

```typescript
// 父路由 - 侧边栏可见
{ path: '/digitalDashboard', name: 'digitalDashboard', component: () => import('/@/views/digitalDashboard/index.vue'),
  meta: { title: '数字看板', isHide: false, isKeepAlive: true, icon: 'ele-Clock' } }

// 5个子路由 - 全部 isHide: true
{ path: '/digitalDashboard/laxian',  name: 'digitalDashboard-laxian',  component: () => import('/@/views/digitalDashboard/laxian/index.vue'),  meta: { title: '拉线看板', isHide: true, isKeepAlive: true } }
{ path: '/digitalDashboard/agv',     name: 'digitalDashboard-agv',     component: () => import('/@/views/digitalDashboard/agv/index.vue'),     meta: { title: 'AGV看板', isHide: true, isKeepAlive: true } }
{ path: '/digitalDashboard/device',  name: 'digitalDashboard-device',  component: () => import('/@/views/digitalDashboard/device/index.vue'),  meta: { title: '设备看板', isHide: true, isKeepAlive: true } }
{ path: '/digitalDashboard/ningjing',name: 'digitalDashboard-ningjing',component: () => import('/@/views/digitalDashboard/ningjingjiaodu/index.vue'), meta: { title: '拧紧角度看板', isHide: true, isKeepAlive: true } }
{ path: '/digitalDashboard/mtbf',    name: 'digitalDashboard-mtbf',    component: () => import('/@/views/digitalDashboard/mtbf/index.vue'),    meta: { title: 'MTBF看板', isHide: true, isKeepAlive: true } }
```

**验收**：导航到 `/digitalDashboard` 显示总览页，点击卡片可跳转到对应子路由

### Task 0.2：看板类型定义

**路径**：`src/views/digitalDashboard/dashboardConfig.ts`

```typescript
export type DashboardTabKey = "laxian" | "agv" | "device" | "ningjing" | "mtbf";
export type DashboardFilterKey =
  | "site"
  | "workshop"
  | "line"
  | "device"
  | "timeRange";

export interface DashboardTabMeta {
  key: DashboardTabKey;
  label: string;
  kicker: string;
  filters: DashboardFilterKey[]; // 该看板需要哪些筛选维度
  component: Component;
}

export interface DashboardQueryParams {
  site: string;
  workshop: string;
  line: string;
  deviceId: string;
  timeRange: "1d" | "7d" | "30d";
}

// 各看板配置（筛选维度见下表）
export const createDashboardTabs = (
  components: Record<DashboardTabKey, Component>,
): DashboardTabMeta[] => [
  {
    key: "laxian",
    label: "拉线",
    kicker: "LINE",
    filters: ["site", "workshop", "line"],
    component: components.laxian,
  },
  {
    key: "agv",
    label: "AGV",
    kicker: "AGV",
    filters: ["site", "workshop", "line"],
    component: components.agv,
  },
  {
    key: "device",
    label: "设备",
    kicker: "DEVICE",
    filters: ["site", "workshop", "line", "device"],
    component: components.device,
  },
  {
    key: "ningjing",
    label: "拧紧角度",
    kicker: "ANGLE",
    filters: ["line"],
    component: components.ningjing,
  },
  {
    key: "mtbf",
    label: "MTBF",
    kicker: "MTBF",
    filters: ["site", "workshop", "line", "timeRange"],
    component: components.mtbf,
  },
];
```

---

## 模块 1：电视墙总览页

**路径**：`src/views/digitalDashboard/index.vue`

### 描述

数字看板总入口。"电视墙"风格，展示 5 个子看板的缩略实时数据，点击卡片下钻到详情。

### UI 布局

```
┌──────────────────────────────────────────────────────┐
│ [基地名称]          数字看板监控室       [时钟] [拉线▼] │
├──────────┬──────────┬──────────┬──────────┬──────────┤
│ 拉线看板   │ AGV看板  │ 设备看板  │ 拧紧角度  │ MTBF     │
│ ┌──────┐ │ ┌──────┐  │ ┌──────┐ │ 合格率    │ ┌──────┐ │
│ │ 产线  │ │ │ AGV  │  │ │ 视频  │ │ 85%     │ │ 图表  │ │
│ │ 地图  │ │ │ 地图  │  │ │ 流缩略 │ │         │ │ 缩略  │ │
│ └──────┘ │ └──────┘  │ └──────┘ │          │ └──────┘ │
│ OEE 85%  │ 在线 10/12│ [hover    │          │ MTBF 120│
│ 良率 98% │ 利用率76%  │  遮罩层]  │          │         │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Task 1.1：顶部工具栏

**输入**：从 Pinia store `useSiteLine` 获取 site 和 lineDetails
**处理**：

1. 左侧：显示当前基地名称
2. 中间：标题"数字看板监控室"
3. 右侧：实时时钟（`setInterval` 1秒刷新）+ 拉线下拉框（`el-select`，可搜索过滤）

**输出**：工具栏 HTML + 时钟定时器（`onBeforeUnmount` 清除）

**验收**：

- 基地名称与 store 一致
- 拉线下拉框显示所有拉线，选中后触发 `handleLineChange`
- 时钟每秒跳动

### Task 1.2：电视墙 Grid 卡片

**布局**：`display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); grid-auto-rows: 1fr; gap: 10px`

**5 张卡片**（无序，需支持后续扩展）：

| 卡片     | 缩略内容                   | KPI 脚标             |
| -------- | -------------------------- | -------------------- |
| 拉线     | Line 组件（产线微缩地图）  | OEE x% / 良率 y%     |
| AGV      | Agv 组件（AGV微缩地图）    | 在线 a/b / 利用率 c% |
| 设备     | video 标签（视频流）或占位 | 无（视频流本身）     |
| 拧紧角度 | 合格率百分比数值           | 合格率 d%            |
| MTBF     | MtbfChartPanel 组件缩略    | 无（图表本身）       |

**交互**：

- 每个卡片 hover 时遮罩层（`opacity: 0 → 1`）+ 蓝光边框
- 点击卡片 → `router.push({ name: 'digitalDashboard-{target}', query: { line: selectedLine } })`

**验收**：

- 页面加载时 5 张卡片均渲染
- 点击任意卡片跳转到对应子看板，URL 携带拉线参数
- 响应式：窗口缩小时卡片自动换行

### Task 1.3：Hub 数据聚合

**路径**：`src/views/digitalDashboard/composables/useHubData.ts`

```typescript
interface HubCardData {
  laxian: { oee: number; yield: number; lineName: string };
  agv: { online: number; total: number; utilization: number };
  device: {
    oee: number;
    available: number;
    alarmCount: number;
    topAlarm: string;
  };
  ningjing: { passRate: number; torque: number; anomalyCount: number };
  mtbf: { mtbf: number; faultRate: number; mttr: number };
}
```

**API 调用**（watch lineId 变化触发）：

```typescript
GET /ilc/statistics/line/yield?lineId={lineId}         → yieldRate
POST /ilc/oee/query { lineId, timeUnit: 1 }            → oee
```

**处理**：`useHubData(lineId: Ref<string>)` 返回 `{ data, loading, reload }`
**验收**：切换拉线时 hubData 更新，卡片 KPI 刷新

## 模块 2：拉线看板

**路径**：`src/views/digitalDashboard/laxian/index.vue`
**路由**：`/digitalDashboard/laxian?site=xxx&line=xxx`

### 布局

```
┌──────────────────────────────────────────────────────────┐
│ [基地] | 拉线名        工站:32 运行:24 待机:4 离线:2 异常:2  LIVE │
├──────────┬──────────────────────────────┬──────────┤
│ 人员统计  │     产线地图 (55%)            │ 当班产出  │
│ ┌──────┐ │  ┌────────────────────────┐  │ 产量 856  │
│ │ 出勤 │ │  │                        │  │ 目标 1200 │
│ │ 率图 │ │  │    SVG 产线布局         │  │ 完成率71% │
│ └──────┘ │  │    工站状态标记          │  │ WIP 43   │
│ 应出勤 48│  │                        │  │ 不良 7   │
│ 实出勤 45│  └────────────────────────┘  │          │
│ 迟到  2 │  ├────────────┬─────────────┤  ├──────────┤
│ 请假  1 │  │ 节拍分析    │ 质量统计     │  │ 物料缺料  │
├──────────┤  │ A段 12s   │ 良率趋势图   │  │ · 缺料A  │
│ 设备健康  │  │ B段 15s   │             │  │ · 缺料B  │
│ SMT-01 92│  │ 工序明细表  │             │  │          │
│ DIP-03 78│  └────────────┴─────────────┘  │          │
└──────────┴──────────────────────────────┴──────────┘
```

### Task 2.1：顶部状态栏

**输入**：`route.query.site`, `route.query.line`
**内容**：

- 左侧：基地名 + 分隔线 + 拉线名 + "拉线看板"小标签
- 中间：5 个工站状态统计 PILL（总数/运行/待机/离线/异常），带颜色圆点
- 右侧：LIVE 标记 + "返回监控室"按钮

**悬浮面板**（Teleport 到 body）：

- hover "运行/待机/离线/异常" 时弹出详细工站名称列表
- 由 `showPanel(type, event)` / `hidePanel()` / `keepPanel()` 控制
- 200ms 延迟隐藏避免闪烁

**验收**：

- 5 个 PILL 正确显示数字
- hover 显示工站详情面板，移出后自动隐藏

### Task 2.2：左侧栏 - 人员统计卡片

**数据**：`attendanceData = { targetCount, realCount, lateCount, leaveCount }`（可 mock）

**展示**：

- SVG 环形出勤率图（`stroke-dasharray` 驱动动画）
- 百分比数值居中
- 4 行明细：应出勤 / 实出勤(绿色) / 迟到早退(黄色) / 请假(灰色)

**交互**：点击卡片跳转到考勤管理页 `/system/attendanceconfig`

**验收**：mock 数据正确渲染环形图和明细行

### Task 2.3：左侧栏 - 设备健康值卡片

**API**：`GET /ilc/phm/healthvalue/list?lineId={lineId}`
**响应**：`[{ describe: string, healthValue: number }]`

**展示**：

- 最多 8 行设备健康值进度条
- 颜色分档：`>=80 绿色` / `>=60 黄色` / `<60 红色`
- 每行：设备名 + 进度条 + 数值

**交互**：点击卡片跳转到 PHM 预测维护页 `/externalLinks/predMaint`

**验收**：不同健康值显示对应颜色

### Task 2.4：中间 - 产线地图

**组件**：`Line`（来自 `/@/components/dashboard/Line/index.vue`）
**参数**：`:line`, `:workshop`, `:site`
**占高**：55%
**标签**：顶部居中 "产线地图 · PRODUCTION LINE"

**验收**：地图组件正常渲染

### Task 2.5：中间下半 - 节拍分析卡片

**数据**：`beatAnalysisData = { data: { sectionAName, sectionBName, sectionACycle, sectionBCycle }, tableData: [{ describe, cycleTime, cycleTimeOverRate }] }`

**展示**：

- 顶部两个六边形卡片显示 A 段/B 段节拍（秒）
- 下方明细表：工序名 | 节拍 | 超出比（超出比 >0 时红色标记）

**验收**：明细表正确渲染，超出比为正的行显示红色

### Task 2.6：中间下半 - 质量统计卡片

**组件**：`QualityAnalysis`（本地 `components/QualityAnalysis/index.vue`）
**参数**：`:data`, `:x-data`, `:line`
**验收**：良率趋势图正确渲染

### Task 2.7：右侧栏 - 当班产出卡片

**组件**：`LineShiftProdStats`（来自 `/@/components/dashboard/LineShiftProdStats/index.vue`）
**数据**：`prodStats = { shiftProduction, shiftTargetProd, completionRate, wip, shiftNg }`（可 mock）

**验收**：产出数据图表正确渲染

### Task 2.8：右侧栏 - 物料缺料提醒卡片

**数据**：`thingsLackData.thingslackData = [{ label: string }]`
**展示**：

- 列表样式：每行红色圆点 + 缺料名称
- 边框左带红色警示条
- 无缺料时显示"暂无缺料"

**验收**：有缺料时红色列表，无缺料时灰色占位文字

---

## 模块 3：AGV 看板

**路径**：`src/views/digitalDashboard/agv/index.vue`
**路由**：`/digitalDashboard/agv?site=xxx&line=xxx`

### 布局

```
┌────────────────────────────────────────────────────────────┐
│ [基地] | 拉线名          AGV 看板           [监控室] [LIVE]  │
├──────────────────────────────┬─────────────────────────────┤
│  ┌────────────────────────┐  │  AGV利用率                  │
│  │    AGV 地图             │  │  ┌──────────────────────┐  │
│  │    (Agv 组件)           │  │  │ 利用率趋势图          │  │
│  │                         │  │  └──────────────────────┘  │
│  │  [总10(物料6/人员4)]    │  │  AGV工位节拍              │
│  │  [运行8]  [离线2]       │  │  ┌──────────────────────┐  │
│  └────────────────────────┘  │  │ 节拍列表              │  │
├──────────────────────────────┤  └──────────────────────┘  │
│  AGV 列表表格 (分页)         │                             │
│  ┌─────────────────────────┐│                             │
│  │ 设备名 | 状态 | 位置 |...││                             │
│  └─────────────────────────┘│                             │
└──────────────────────────────┴─────────────────────────────┘
```

### Task 3.1：顶部状态栏

同拉线看板风格：基地 + 拉线 + 返回按钮 + LIVE

### Task 3.2：AGV 地图

**组件**：`Agv`（本地 `components/Agv/index.vue`）
**参数**：`:line`, `:workshop`, `:site`, `:points`
**数据状态摘要**：AGV总数(物料数/人员数) / 运行数 / 离线数（含离线AGV名称列表）

### Task 3.3：AGV 利用率图表

**组件**：`Utilization`（本地 `components/Utilization/index.vue`）
**数据**：`utilizationData = { x: string[], y: number[] }`
**交互**：点击数据点跳转到统计详情 `/statistics/agvrate?line=xxx`

### Task 3.4：AGV 工位节拍

**组件**：`CycleTime`（本地 `components/CycleTime/index.vue`）
**数据**：`cycleTimeList: Array`
**交互**：点击卡片跳转到工位节拍详情 `/statistics/agvbeat?line=xxx`

### Task 3.5：AGV 列表表格

**组件**：`AgvTable`（本地 `components/AgvTable/index.vue`）
**数据**：分页参数 `{ page, pageSize, total }` + `currentPageData`
**交互**：支持分页切换

### Task 3.6：报警浮窗

```html
<div class="floating-alarm" v-if="alertVisible">
  <el-alert
    title="报警信息"
    type="error"
    :description="realtimeAlarmInfo"
    show-icon
    @click="gotoAgvAlarmPage"
  />
</div>
```

**交互**：点击跳转到报警详情 `/statistics/agvalarm?line=xxx`

---

## 模块 4：设备看板

**路径**：`src/views/digitalDashboard/device/index.vue`
**路由**：`/digitalDashboard/device?site=xxx&line=xxx&deviceId=xxx`

### 布局

```
┌──────────────────────────────────────────────────────────┐
│ [基地] | 拉线名         设备看板            [监控室] [LIVE] │
├──────────┬────────────────────────────────┬─────────────┤
│ 当班产出  │    视频监控流                    │ [其他指标]   │
│ 统计卡片  │  ┌─────────────────────────┐   │             │
│          │  │  自动播放视频            │   │             │
│          │  │  设备状态主题边框         │   │             │
│          │  └─────────────────────────┘   │             │
├──────────┤                                ├─────────────┤
│ 实时报警  │                                │             │
│ 列表     │                                │             │
└──────────┴────────────────────────────────┴─────────────┘
```

### Task 4.1：顶部状态栏

同前风格，额外显示当前设备名称 `deviceNameChs`

### Task 4.2：设备筛选

顶部或侧边 el-select 切换设备，触发数据和视频流更新

### Task 4.3：当班产出统计

**组件**：`DeviceProdStats`（本地组件）
**参数**：`:deviceId`, `:deviceName`, `:line`, `:data`

### Task 4.4：实时报警列表

**组件**：`RealtimeAlert`（本地组件）
**数据**：`realtimeAlertData`（MQTT 或 HTTP）
**交互**：点击跳转到报警详情

### Task 4.5：视频监控流

**API**：`detailVideoByParams(site, line, '')` 获取视频地址
**展示**：

```html
<video v-if="videoSrc" controls :src="videoSrc" autoplay loop muted></video>
<div v-else class="video-empty-state"><p>未配置视频源</p></div>
```

**状态主题**：根据设备运行状态切换 `statusThemeClass`（边框/背景色变化）

---

## 模块 5：拧紧角度管控看板

**路径**：`src/views/digitalDashboard/ningjingjiaodu/index.vue`
**路由**：`/digitalDashboard/ningjing?line=xxx`

### 布局

```
┌──────────────────────────────────────────────────────────────┐
│ [拉线名]         拧紧角度收严分析          [监控室] [LIVE]     │
├──────────────────────────────────────────────────────────────┤
│ [更新日期▼] [查看天数▼] [时间范围显示] [查询按钮]              │
├──────────────────────────────┬───────────────────────────────┤
│ 整体收严幅度及重点优化项      │ By拉线拧紧角度平均收严幅度      │
│ 数量变化趋势图               │ 柱状图                         │
├──────────────────────────────┼───────────────────────────────┤
│ 拧紧角度分布图               │ 重点优化项列表                  │
└──────────────────────────────┴───────────────────────────────┘
```

### Task 5.1：顶部状态栏 + 筛选栏

**筛选参数**：`{ updateDate: string, days: number, startTime: string, endTime: string }`
**交互**：选择更新日期和查看天数，自动计算时间范围，点击查询按钮加载数据

### Task 5.2：趋势图 & 收严幅度

**组件**：`TrendChart` / `LineAmplitudeChart`（本地 `components/`）
**数据**：`trendChartData`, `lineAmplitudeData`

### Task 5.3：分布图 & 优化项

**组件**：拧紧角度分布图组件 + 重点优化项列表组件
**验收**：4 张图表均正确展示，筛选条件变化后刷新数据

---

## 模块 6：MTBF/MTTR 分析看板

**路径**：`src/views/digitalDashboard/mtbf/index.vue`
**路由**：`/digitalDashboard/mtbf?site=xxx&line=xxx&timeRange=7d`

### 布局

```
┌──────────────────────────────────────────────────────────┐
│ [基地] | 拉线名     MTBF&MTTR 分析       [7d] [监控室] [LIVE] │
├──────────┬────────────────────────────┬──────────────────┤
│ 整线MTBF │   MTBF&MTTR 分析主图表      │  故障分析        │
│ 数据卡片  │  ┌──────────────────────┐  │  ┌────────────┐  │
│          │  │                      │  │  │            │  │
├──────────┤  │  趋势图               │  │  │            │  │
│ DT Data  │  │                      │  │  └────────────┘  │
│ [故障率▼] │  └──────────────────────┘  │                  │
│ 趋势图    │                            │                  │
└──────────┴────────────────────────────┴──────────────────┘
```

### Task 6.1：顶部状态栏

显示时间范围标签（`timeRangeLabel`）

### Task 6.2：整线 MTBF 数据卡片

**组件**：`MtbfKpiPanel`（本地 `components/`）
**数据**：`kpiData`

### Task 6.3：DT Data 趋势图

**切换按钮**：故障率 / 故障时间
**数据**：`dtShowFaultRate` 控制显示模式
**API**：`POST /ilc/alarmlog/show`

### Task 6.4：MTBF&MTTR 主图表

ECharts 图表，使用 `useMtbfCharts` composable 生成 option

### Task 6.5：故障分析

故障分析图表 + 分页列表

### API 类型定义

```typescript
interface AlarmQueryParams {
  line: string; deviceName?: string; dimension?: 'times' | 'duration';
  datePicker?: string[]; startTime?: string; endTime?: string;
  field?: string; order?: string | null; page?: number; pageSize?: number;
}

POST /ilc/alarmlog/show  → 故障统计（图表用）
POST /ilc/alarmlog/page  → 故障分页（表格用）
```

---

## 模块 7：统一筛选机制

**路径**：`src/views/digitalDashboard/useDashboardFilters.ts`

### Task 7.1：筛选状态管理

```typescript
const {
  activeTab,
  queryParams,
  workshops,
  lines,
  deviceOptions,
  currentTabProps,
  showSiteFilter,
  showWorkshopFilter,
  showLineFilter,
  showDeviceFilter,
  showTimeRangeFilter,
  handleSiteChange,
  handleWorkshopChange,
  handleTabChange,
} = useDashboardFilters({
  storeSite,
  sites,
  hierarchy,
  lineDetails,
  tabs,
  initialTab: "laxian",
});
```

**功能要求**：

1. 筛选维度：site → workshop → line → device（级联联动）
2. 按当前看板类型动态显示/隐藏筛选器（看 dashboardConfig 中的 filters 配置）
3. Tab 切换时保留各看板独立的筛选状态
4. 状态持久化到 SessionStorage（key: `digitalDashboardFiltersState`）
5. 筛选条件同步到 URL query 参数

**行为说明**：
| 操作 | 效果 |
|------|------|
| 切换 site | workshop 和 line 重置，重新加载 workshop 列表 |
| 切换 workshop | line 重置，重新加载 line 列表 |
| 切换到 device 看板 | 额外加载 device 下拉列表 |
| 刷新页面 | 从 SessionStorage 恢复筛选状态 |
| URL 携带参数进入 | 优先使用 URL 参数覆盖 SessionStorage |

---

## 模块 8：公共组件体系

**路径**：`src/views/digitalDashboard/components/`

### Task 8.1：DashboardPanel（通用面板容器）

```vue
<DashboardPanel
  title="标题"
  :loading="bool"
  :state="'loading' | 'success' | 'empty' | 'error'"
  :retryable="true"
  @retry="handler"
>
  <template #header-extra>右上角额外内容</template>
  主内容插槽
</DashboardPanel>
```

**三态管理**：
| 状态 | 展示 | 触发条件 |
|------|------|---------|
| `loading` | PanelLoading 组件（脉冲动画 + 文字） | `loading=true` |
| `empty` | PanelEmpty 组件（空数据样式 + 自定义文字） | `state='empty'` 或内容为空 |
| `error` | PanelError 组件（错误图标 + 重试按钮） | 内部 errorCaptured 或手动设置 |

### Task 8.2：PanelStates 三态子组件

- `PanelLoading.vue`：加载动画 + message 文字
- `PanelEmpty.vue`：空图标 + title + description
- `PanelError.vue`：错误图标 + title + message + 重试按钮

**验收**：任意面板运行时手动切换状态可看到对应 UI

---

## 模块 9：样式系统

**路径**：`src/views/digitalDashboard/styles/`

### Task 9.1：变量系统

**文件**：`variables.scss`

```scss
// 主题色
$dashboard-primary: #4b8bff;
$dashboard-primary-light: rgba(75, 139, 255, 0.12);
// 状态色
$dashboard-success: #3acf7a; // 运行
$dashboard-warning: #f0a030; // 待机/警告
$dashboard-danger: #e85550; // 异常/危险
// 文字色 3级：主/次/弱
$dashboard-text-primary: rgba(225, 235, 255, 0.9);
$dashboard-text-secondary: rgba(200, 215, 240, 0.72);
$dashboard-text-muted: rgba(160, 180, 210, 0.5);
// 背景色
$dashboard-bg-dark: #0f1118;
$dashboard-bg-card: #181b26;
// 卡片
$dashboard-card-radius: 14px;
$dashboard-card-gap: 10px;
```

全部通过 `@mixin dashboard-variables` 导出为 CSS 自定义属性（`--dashboard-*`）。

### Task 9.2：基础样式

**文件**：`base.scss` — reset + 字体家族
**文件**：`layout.scss` — 看板通用布局类（`.digital-dashboard-layout`, `.layout-main`, `.layout-row`, `.layout-column`）
**文件**：`responsive.scss` — 响应式断点（1920/1600/1366/1280/768px）

### Task 9.3：设计原则

> 可视化大屏需保持清爽干净，数据界面让人一眼看过去一目了然。
> 不要过多配色和 tag，选项切换用下拉方式。
> 布局呈豆腐块卡片布局。
> 卡片内部标题、图表等自适应各屏幕大小。

---

## 附录：API 接口清单

| 接口路径                            | 方法 | 用途                       | 所属模块 |
| ----------------------------------- | ---- | -------------------------- | -------- |
| `/ilc/statistics/line/yield`        | GET  | 产线良率(参数lineId)       | 模块1,2  |
| `/ilc/oee/query`                    | POST | OEE查询 {lineId,timeUnit?} | 模块1,2  |
| `/ilc/phm/healthvalue/list`         | GET  | 设备健康值列表             | 模块2    |
| `/ilc/statistics/line/firstyield`   | GET  | 直通率数据                 | 模块2    |
| `/ilc/alarmlog/topAlarm`            | GET  | 告警Top3(按次数)           | 模块2    |
| `/ilc/alarmlog/topduration`         | GET  | 告警Top3(按时长)           | 模块2    |
| `/ilc/report/processData`           | GET  | CPK/CMK/Sigma数据          | 模块2    |
| `/ilc/alarmlog/show`                | POST | 故障统计(图表展示)         | 模块6    |
| `/ilc/alarmlog/page`                | POST | 故障分页(表格展示)         | 模块6    |
| `detailVideoByParams(site,line,'')` | -    | 获取设备视频流地址         | 模块4    |
