# 驾驶舱顶部告警轮播 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除快捷入口，并将最新告警改为驾驶舱顶部每 4 秒垂直轮播的单条信息栏。

**Architecture:** 复用现有告警排序和关联逻辑，在 `LatestAlertsPanel` 内维护当前索引、暂停状态和减少动画偏好。页面只负责把轮播组件移动到 KPI 上方，同时删除底部和快捷入口。

**Tech Stack:** React 19、TypeScript、CSS、Vite

## Global Constraints

- 保留现有主题和状态颜色。
- 待处理优先、时间倒序。
- 每 4 秒切换；悬停、聚焦、减少动画时暂停。
- 不创建新依赖或新路由。

---

### Task 1: 实现顶部垂直告警轮播

**Files:**
- Modify: `frontend/src/pages/Dashboard/components/LatestAlertsPanel.tsx`
- Modify: `frontend/src/pages/Dashboard/components/DashboardComponents.css`
- Modify: `frontend/src/pages/Dashboard/index.tsx`
- Modify: `frontend/src/pages/Dashboard/Dashboard.css`
- Delete: `frontend/src/pages/Dashboard/components/QuickEntryPanel.tsx`

**Interfaces:**
- 保留 `LatestAlertsPanelProps`
- 页面仍传入 `alerts`、`waterPoints`、`villages`

- [ ] **Step 1: 改造告警组件**

使用 `useMemo` 排序，`useState` 保存索引和交互暂停，`useEffect` 创建 4000ms 定时器并清理。监听 `window.matchMedia('(prefers-reduced-motion: reduce)')`。

- [ ] **Step 2: 实现垂直切换样式**

固定高度、隐藏溢出，通过 translateY 和 opacity 切换；窄屏允许内容换行。

- [ ] **Step 3: 移动组件并删除快捷入口**

将 `LatestAlertsPanel` 放在 `DashboardKpiBar` 上方，删除 `QuickEntryPanel` import、底部容器及组件文件。

- [ ] **Step 4: 清理 CSS**

删除快捷入口和底部双栏相关规则，保留告警轮播所需样式。

- [ ] **Step 5: 验证**

运行 `npm run lint`、`npm run build` 并检查改动文件诊断。
