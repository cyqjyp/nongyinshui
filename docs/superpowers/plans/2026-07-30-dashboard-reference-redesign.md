# 运营驾驶舱参考图改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/dashboard` 改造成保留现有主题和页面框架的顶部指标、左中右三栏、底部信息栏运营驾驶舱。

**Architecture:** 新增驾驶舱专用视图模型和稳定演示数据，由 `dashboardService` 统一聚合现有业务数据。页面组件按 KPI、左侧分析、二维地图与实时表、右侧运营、底部信息拆分，`Dashboard/index.tsx` 只负责加载和布局。

**Tech Stack:** React 19、TypeScript 6、Ant Design 6、ECharts 6、echarts-for-react、Vite 8

## Global Constraints

- 保留现有 `MainLayout` 左侧菜单和顶部栏。
- 保留现有青黑色主题、CSS 变量和 `glass-card` 风格。
- 中心地图使用二维 ECharts geo，不使用 `echarts-gl`。
- 缺失数据必须是固定值或确定性推导，不使用 `Math.random()`。
- 不修改现有村庄、供水点、设备、水质、告警和报修核心数据结构。
- 1366px、1920px 和窄屏下不出现横向溢出。

---

### Task 1: 建立驾驶舱视图模型和稳定演示数据

**Files:**
- Create: `frontend/src/types/dashboard.ts`
- Create: `frontend/src/mock/dashboardCockpit.ts`
- Modify: `frontend/src/services/dashboardService.ts`

**Interfaces:**
- Produces: `DashboardCockpitData`
- Produces: `fetchDashboardCockpit(): Promise<DashboardCockpitData>`
- Consumes: 现有 villages、waterPoints、devices、alerts、repairs、onlineSeriesByWaterPoint

- [ ] **Step 1: 定义驾驶舱类型**

在 `types/dashboard.ts` 定义：

```ts
export interface DashboardKpi {
  key: string;
  title: string;
  value: string | number;
  unit?: string;
  detail: string;
  tone: 'cyan' | 'green' | 'blue' | 'orange';
}

export interface DashboardTrendPoint {
  label: string;
  value: number;
}

export interface RealtimeMonitorRow {
  id: string;
  name: string;
  region: string;
  passRate: number;
  turbidity: number;
  residualChlorine: number;
  ph: number;
  qualified: boolean;
  updatedAt: string;
}

export interface DashboardCockpitData {
  kpis: DashboardKpi[];
  qualitySummary: { qualified: number; unqualified: number; unmonitored: number; passRate: number };
  qualityTrend: DashboardTrendPoint[];
  waterVolumeTrend: DashboardTrendPoint[];
  sourceStatus: { normal: number; warning: number; risk: number; notice: string };
  alertCategories: Array<{ name: string; value: number }>;
  workOrders: { pending: number; processing: number; completed: number; completionRate: number };
  repairTypes: Array<{ name: string; value: number }>;
  pressure: {
    normal: number;
    low: number;
    high: number;
    dates: string[];
    normalSeries: number[];
    lowSeries: number[];
    highSeries: number[];
  };
  realtimeRows: RealtimeMonitorRow[];
}
```

- [ ] **Step 2: 新增固定演示序列**

在 `mock/dashboardCockpit.ts` 导出七日日期、水质达标率、供水量和压力序列。数组为固定值，不读取当前随机数。

- [ ] **Step 3: 聚合现有业务数据**

在 `dashboardService.ts` 新增 `fetchDashboardCockpit()`：

- KPI 主值来自现有人口、工程、流量、水质、监测仪和工单数据。
- 今日供水量使用 `currentFlow × 24` 求和。
- 监测点只统计 `type === '水质监测仪'` 的设备。
- 实时监测行由在线水质最新记录关联供水点和村庄。
- 告警分类按水质、设备、压力、流量、其他映射。
- 维修类型按描述关键词映射为设备故障、管网漏损、水质问题、压力异常和其他。

- [ ] **Step 4: 验证类型和数据层**

运行：

```powershell
npm run build
```

预期：TypeScript 编译通过。

---

### Task 2: 建立驾驶舱面板基础组件与顶部 KPI

**Files:**
- Create: `frontend/src/pages/Dashboard/components/DashboardPanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/DashboardKpiBar.tsx`
- Create: `frontend/src/pages/Dashboard/components/DashboardCharts.tsx`
- Create: `frontend/src/pages/Dashboard/components/DashboardComponents.css`

**Interfaces:**
- `DashboardPanel({ title, extra, children, className })`
- `DashboardKpiBar({ items }: { items: DashboardKpi[] })`
- `DashboardDonutChart`、`DashboardLineChart`、`DashboardBarChart`

- [ ] **Step 1: 创建统一面板容器**

面板复用 `glass-card`，标题使用现有青色竖线视觉，支持右侧额外操作。

- [ ] **Step 2: 创建六项 KPI 横条**

大屏使用六列，1366px 下允许三列两行，窄屏使用一列；颜色从现有 CSS 变量映射，不使用参考图颜色。

- [ ] **Step 3: 创建通用图表包装**

统一 tooltip、文字、坐标轴、网格和 resize 行为，避免各业务面板重复 ECharts 基础配置。

- [ ] **Step 4: 验证组件诊断**

使用 IDE 诊断检查新增文件，无 TypeScript 或 ESLint 错误。

---

### Task 3: 实现左侧分析栏

**Files:**
- Create: `frontend/src/pages/Dashboard/components/QualityCompliancePanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/QualityTrendPanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/WaterVolumePanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/SourceStatusPanel.tsx`

**Interfaces:**
- Consumes: `DashboardCockpitData` 中 qualitySummary、qualityTrend、waterVolumeTrend、sourceStatus
- Produces: 四个可独立渲染的面板组件

- [ ] **Step 1: 实现水质达标环图**

环图显示达标率中心值，并列出达标、不达标、未监测数量。

- [ ] **Step 2: 实现七日水质折线图**

Y 轴按数据范围显示，tooltip 显示日期和百分比。

- [ ] **Step 3: 实现七日供水量柱图**

显示最近七日供水量，单位为吨。

- [ ] **Step 4: 实现水源状况**

显示正常、预警、风险数量和风险提示文案。

- [ ] **Step 5: 检查空数据**

数组为空时显示“暂无数据”，不渲染空 ECharts。

---

### Task 4: 实现二维工程地图和实时监测表

**Files:**
- Create: `frontend/src/pages/Dashboard/components/EngineeringMap2D.tsx`
- Create: `frontend/src/pages/Dashboard/components/RealtimeMonitorTable.tsx`

**Interfaces:**
- `EngineeringMap2D({ villages, waterPoints })`
- `RealtimeMonitorTable({ rows })`

- [ ] **Step 1: 注册二维地图**

复用 `countyGeoJson` 和 `COUNTY_MAP_NAME`，通过 ECharts `geo` 和 `effectScatter` 展示区域及供水点。

- [ ] **Step 2: 添加状态筛选**

组件内部维护 `'all' | 'running' | 'abnormal'`，筛选仅影响散点；异常包含 warning、fault、stopped。

- [ ] **Step 3: 添加地图提示**

点击或悬停显示供水点名称、所属村庄、类型、状态、覆盖人口。

- [ ] **Step 4: 实现实时监测表**

表格列为监测点、所属区域、达标率、浊度、余氯、pH、状态、更新时间；数值和状态使用现有语义色。

- [ ] **Step 5: 验证二维地图不依赖 echarts-gl**

新增组件只导入 `echarts` 和 `echarts-for-react`。

---

### Task 5: 实现右侧运营栏

**Files:**
- Create: `frontend/src/pages/Dashboard/components/AlertStatsPanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/WorkOrderPanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/RepairTypePanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/PressurePanel.tsx`

**Interfaces:**
- Consumes: alertCategories、workOrders、repairTypes、pressure
- Produces: 四个右侧运营面板

- [ ] **Step 1: 实现告警分类环图**

显示最近七日告警总数和分类占比。

- [ ] **Step 2: 实现工单状态卡**

显示待处理、处理中、已完成、办结率和进度条。

- [ ] **Step 3: 实现维修类型 TOP5**

使用横向条形图，按数量降序。

- [ ] **Step 4: 实现压力监测**

显示正常、低压、高压点数量，并绘制三条七日压力趋势线。

- [ ] **Step 5: 检查空数据**

分类为空时显示“暂无数据”，百分比除数为零时返回 0。

---

### Task 6: 实现底部告警与快捷入口

**Files:**
- Create: `frontend/src/pages/Dashboard/components/LatestAlertsPanel.tsx`
- Create: `frontend/src/pages/Dashboard/components/QuickEntryPanel.tsx`

**Interfaces:**
- `LatestAlertsPanel({ alerts, waterPoints, villages })`
- `QuickEntryPanel()` 使用 `useNavigate`

- [ ] **Step 1: 实现最新告警列表**

待处理记录优先，再按触发时间倒序；显示类型、供水点/村庄、时间和状态。

- [ ] **Step 2: 实现快捷入口**

提供基础台账、水质管理、报修管理、巡检管理、报表导出、智慧村庄等现有路由入口；不创建不存在的路由。

- [ ] **Step 3: 添加键盘与可访问性**

入口使用 `button` 或可聚焦元素，保留可见焦点状态。

---

### Task 7: 组装页面并完成响应式布局

**Files:**
- Rewrite: `frontend/src/pages/Dashboard/index.tsx`
- Rewrite: `frontend/src/pages/Dashboard/Dashboard.css`

**Interfaces:**
- Consumes: `fetchDashboardCockpit`、现有 alerts/villages/waterPoints
- Produces: 完整驾驶舱页面

- [ ] **Step 1: 重写数据加载**

使用 `Promise.all` 加载驾驶舱视图模型、告警、村庄和供水点；增加 `error` 状态和重试按钮。

- [ ] **Step 2: 组装顶部和三栏**

结构为：

```tsx
<DashboardKpiBar />
<div className="cockpit-main-grid">
  <aside className="cockpit-left-column">{/* 四面板 */}</aside>
  <main className="cockpit-center-column">{/* 地图、实时表 */}</main>
  <aside className="cockpit-right-column">{/* 四面板 */}</aside>
</div>
<div className="cockpit-bottom-grid">{/* 最新告警、快捷入口 */}</div>
```

- [ ] **Step 3: 删除旧驾驶舱重复区域**

移除村庄速览、原三饼图、分村运营表和季节性风险标签区的 JSX 与无用 imports。

- [ ] **Step 4: 实现响应式 CSS**

- 1600px 以上：`280px minmax(520px, 1fr) 300px`
- 1200px–1599px：`250px minmax(460px, 1fr) 270px`
- 992px–1199px：中心地图独占第一行，左右栏并排第二行
- 991px 以下：全部单列

- [ ] **Step 5: 控制面板高度**

地图为中心主视觉，实时表紧随其下；两侧面板使用紧凑 padding，普通桌面允许纵向滚动。

---

### Task 8: 全量验证与清理

**Files:**
- Check: `frontend/src/pages/Dashboard/**`
- Check: `frontend/src/services/dashboardService.ts`
- Check: `frontend/src/types/dashboard.ts`
- Check: `frontend/src/mock/dashboardCockpit.ts`

**Interfaces:**
- Produces: 可构建、可运行的改版驾驶舱

- [ ] **Step 1: 检查诊断**

读取所有改动文件的 IDE diagnostics，修复新增错误。

- [ ] **Step 2: 运行 lint**

```powershell
npm run lint
```

预期：无新增 lint 错误。

- [ ] **Step 3: 运行构建**

```powershell
npm run build
```

预期：TypeScript 与 Vite 构建成功。

- [ ] **Step 4: 浏览器人工检查**

检查 1366px、1920px 和窄屏：

- 无横向滚动条。
- KPI、三栏、地图、实时表、底栏均完整展示。
- 状态颜色符合现有主题。
- 地图筛选和快捷入口可交互。
- 空数据面板不会崩溃。
