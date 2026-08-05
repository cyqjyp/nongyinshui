# 运营总览紧凑布局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将运营总览六张指标卡片调整为大屏两列三行的紧凑布局。

**Architecture:** 保持 Dashboard JSX 与通用 DataCard 组件不变，仅通过 Dashboard 页面局部 CSS 覆盖实现网格布局和紧凑尺寸，避免影响其他页面。

**Tech Stack:** React 19、TypeScript、CSS、Vite

## Global Constraints

- 不修改指标数据、顺序、图标和颜色。
- 大屏两列三行，窄屏单列。
- 不修改通用 `DataCard.css`。

---

### Task 1: 调整运营总览局部样式

**Files:**
- Modify: `frontend/src/pages/Dashboard/Dashboard.css`

**Interfaces:**
- Consumes: `.overview-side-card`、`.overview-side-list`、`.data-card`
- Produces: 两列三行紧凑布局及窄屏单列响应式布局

- [ ] **Step 1: 修改布局样式**

将 `.overview-side-list` 改为两列网格，并通过 `.overview-side-card .data-card` 局部覆盖卡片内边距、高度和间距。

- [ ] **Step 2: 添加窄屏规则**

在 `max-width: 768px` 下将网格切换为单列。

- [ ] **Step 3: 检查编辑文件诊断**

确认 `Dashboard.css` 与 `Dashboard/index.tsx` 没有新增诊断。

- [ ] **Step 4: 验证构建**

运行：

```powershell
Set-Location "d:\工作资料\2026\000AItest\农饮水方案\frontend"
npm run build
```

预期：TypeScript 和 Vite 构建成功。
