# 农村饮水安全管理平台 · 前端原型(HydroMetric Pro)

这是《农村饮水安全管理系统需求清单》对应的可交互前端原型,用于向领导/评审展示系统效果。当前版本使用**模拟数据(mock data)**驱动,但目录结构与数据契约按照可直接演进为正式开发项目的标准编写——后端接口就绪后,只需替换 `src/services` 中的实现,页面和组件代码不需要改动。

## 技术栈

- **React 18 + TypeScript + Vite**:开发与构建
- **Ant Design v6**:组件库,深色主题按 `DESIGN.md` 设计系统定制(见 `src/theme`)
- **ECharts (echarts-for-react) + echarts-gl**:驾驶舱图表、水质趋势图、供水网络三维分布地图
- **React Router**:页面路由
- **xlsx (SheetJS)**:报表导出为 Excel
- **dayjs**:日期处理

## 目录结构与设计约定

```
src/
├── types/            领域数据类型定义(供水点、水质记录、巡检、报修等)
│                     —— 这是前后端的数据契约,后端接口字段应与此对齐
├── mock/             模拟数据(村庄/供水点/设备/水质/巡检/报修)
│                     —— 仅在演示阶段使用,替换后端后可整体删除此目录
├── services/         数据访问层,页面只通过这一层拿数据,不直接依赖 mock
│                     —— 对接真实后端时,只需把每个函数体换成真实的 fetch/axios 调用,
│                        函数签名和返回类型保持不变,页面代码无需改动
├── theme/            Ant Design 主题 token 与全局 CSS 变量(对应 DESIGN.md)
├── layouts/          整体布局(侧边导航 + 顶部栏)
├── components/common/ 设计系统组件(DataCard、CircularProgress、TrendChart、
│                       StatusPill、PhMeter、ValveIndicator、PumpStatus 等)
├── pages/            六大功能模块页面(与需求清单模块 A-F 一一对应)
│   ├── Dashboard/        模块A 运营驾驶舱
│   ├── Infrastructure/   模块B 基础台账管理
│   ├── WaterQuality/     模块C 水质管理
│   ├── Inspection/       模块D 巡检与运行管理
│   ├── Repair/           模块E 报修管理
│   └── Reports/          模块F 报表导出
└── router/           路由配置
```

## 关于 mock 数据与后续对接真实接口

所有页面都通过 `src/services/*.ts` 里的 `async` 函数获取数据(例如 `fetchOperationOverview()`、`fetchAlerts()`),这些函数当前从 `src/mock` 读取内存数据并用 `resolveMock()` 包装成 `Promise`,以模拟真实网络请求的异步特性。

对接正式后端时:

1. 在 `src/services/http.ts` 里换成真实的请求客户端(建议用 `fetch` 封装或引入 `axios`)。
2. 逐个替换 `src/services/*.ts` 里的函数实现,函数名、入参、返回的 TypeScript 类型保持不变。
3. 删除 `src/mock` 目录。
4. 页面组件(`src/pages/**`)完全不需要改动。

这也是当前本版本里几个**待确认技术风险项**(见需求清单第七节)在前端预留的位置:

- 在线监测设备数据 → 对应 `fetchOnlineSeries()`,未来可能是轮询接口或 WebSocket 推送,替换该函数内部实现即可。
- 短信/系统预警通知 → 当前 `markAlertHandled()` 只更新本地状态,真实环境需要额外调用通知发送接口。
- 城镇供水数据接口、现场APP数据接口、村民小程序报修接口 → 均已在 `types/index.ts` 中为对应实体预留字段(如 `RepairOrder.source` 包含 `"小程序自助(预留)"`),后续接入时补充实现即可。
- 运营驾驶舱的"供水网络三维分布"地图(`components/common/VillageMap3D.tsx`)当前用 `mock/countyGeo.ts` 里程序生成的六边形示意边界代替真实村界 GeoJSON(试点村暂无正式行政边界数据)。接入真实 GIS 数据后,只需把 `countyGeoJson` 换成真实的边界文件,组件逻辑不需要改动。

## 开发

```bash
npm install
npm run dev       # 本地开发,默认 http://localhost:5173
npm run build     # 生产构建(含 TypeScript 类型检查)
npm run preview   # 预览生产构建
```

## 已知待优化项(非本次演示范围)

- 生产构建的 JS 包体积较大(主要来自 antd + echarts),后续可通过路由级代码分割(`React.lazy`)优化首屏加载。
- 报表 PDF 导出目前使用浏览器打印能力(`window.print()`),中文渲染稳定但依赖用户手动"打印为PDF";如需服务端直出 PDF,后续可在后端补充导出接口。
