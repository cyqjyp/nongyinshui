import { villages } from '../mock/villages';
import { waterPoints } from '../mock/waterPoints';
import { devices } from '../mock/devices';
import { alerts } from '../mock/alerts';
import { repairs } from '../mock/repairs';
import { labRecords, onlineSeriesByWaterPoint } from '../mock/waterQuality';
import {
  dashboardPressureSeries,
  dashboardQualityPassRates,
  dashboardWaterVolumes,
} from '../mock/dashboardCockpit';
import { smartVillageProfiles } from '../mock/smartVillage';
import { resolveMock } from './http';
import type {
  ManagementBreakdown,
  OperationOverview,
  SourceTypeBreakdown,
  VillageSummary,
  WaterSourceType,
  ManagedBy,
  OnlineWaterQualityRecord,
} from '../types';
import type {
  DashboardCockpitData,
  DashboardTrendPoint,
  RealtimeMonitorRow,
} from '../types/dashboard';

const DRY_RISK_VILLAGE_IDS = new Set(['v-03']);

function getLatestOnlineRecords(): OnlineWaterQualityRecord[] {
  return Object.values(onlineSeriesByWaterPoint)
    .map((series) => series[series.length - 1])
    .filter((record): record is OnlineWaterQualityRecord => record !== undefined);
}

function computeQualityPassRate(): number {
  const latestOnline = getLatestOnlineRecords();
  const onlineQualified = latestOnline.filter((r) => r.isQualified).length;
  const labQualified = labRecords.filter((r) => r.conclusion === '合格').length;
  const total = latestOnline.length + labRecords.length;
  if (total === 0) return 0;
  return Math.round(((onlineQualified + labQualified) / total) * 1000) / 10;
}

function computeQualitySummaryByDays(days: number): {
  qualified: number;
  unqualified: number;
  unmonitored: number;
  passRate: number;
} {
  const nowMs = Date.now();
  const cutoff = nowMs - days * 24 * 60 * 60 * 1000;

  // 在线监测记录：统计时间范围内的所有记录
  let onlineQualified = 0;
  let onlineUnqualified = 0;
  Object.values(onlineSeriesByWaterPoint).forEach((series) => {
    series.forEach((record) => {
      const ts = Date.parse(record.timestamp);
      if (Number.isFinite(ts) && ts >= cutoff) {
        if (record.isQualified) onlineQualified++;
        else onlineUnqualified++;
      }
    });
  });

  // 实验室检测记录
  const labQualified = labRecords.filter((r) => {
    const ts = Date.parse(r.testDate);
    return Number.isFinite(ts) && ts >= cutoff && r.conclusion === '合格';
  }).length;
  const labUnqualified = labRecords.filter((r) => {
    const ts = Date.parse(r.testDate);
    return Number.isFinite(ts) && ts >= cutoff && r.conclusion !== '合格';
  }).length;

  const qualified = onlineQualified + labQualified;
  const unqualified = onlineUnqualified + labUnqualified;
  const total = qualified + unqualified;
  const passRate = total === 0 ? 0 : roundToOneDecimal((qualified / total) * 100);
  const unmonitored = Math.max(0, waterPoints.length - total);

  return { qualified, unqualified, unmonitored, passRate };
}

function computeQualityDrillDownByDays(days: number): Array<{
  waterPointId: string;
  waterPointName: string;
  villageName: string;
  qualified: number;
  unqualified: number;
  total: number;
  passRate: number;
  mainIssue: string;
  category: 'qualified' | 'unqualified' | 'unmonitored';
  trendData?: {
    timestamps: string[];
    turbidity: number[];
    chlorine: number[];
    ph: number[];
  };
}> {
  const nowMs = Date.now();
  const cutoff = nowMs - days * 24 * 60 * 60 * 1000;

  return waterPoints.map((wp) => {
    const series = onlineSeriesByWaterPoint[wp.id];
    const village = villages.find((v) => v.id === wp.villageId);

    let onlineQualified = 0;
    let onlineUnqualified = 0;
    let turbidityIssues = 0;
    let chlorineIssues = 0;
    let phIssues = 0;

    const trendData: {
      timestamps: string[];
      turbidity: number[];
      chlorine: number[];
      ph: number[];
    } = {
      timestamps: [],
      turbidity: [],
      chlorine: [],
      ph: [],
    };

    if (series) {
      series.forEach((record) => {
        const ts = Date.parse(record.timestamp);
        if (Number.isFinite(ts) && ts >= cutoff) {
          // 收集趋势数据（每小时采样）
          trendData.timestamps.push(record.timestamp);
          trendData.turbidity.push(record.turbidity);
          trendData.chlorine.push(record.residualChlorine);
          trendData.ph.push(record.ph);

          if (record.isQualified) {
            onlineQualified++;
          } else {
            onlineUnqualified++;
            // 统计主要超标指标
            if (record.turbidity > record.turbidityStandard[1]) turbidityIssues++;
            if (record.residualChlorine < record.chlorineStandard[0] || record.residualChlorine > record.chlorineStandard[1]) chlorineIssues++;
            if (record.ph < record.phStandard[0] || record.ph > record.phStandard[1]) phIssues++;
          }
        }
      });
    }

    const labRecordsForPoint = labRecords.filter((r) => r.waterPointId === wp.id);
    const labQualified = labRecordsForPoint.filter((r) => {
      const ts = Date.parse(r.testDate);
      return Number.isFinite(ts) && ts >= cutoff && r.conclusion === '合格';
    }).length;
    const labUnqualified = labRecordsForPoint.filter((r) => {
      const ts = Date.parse(r.testDate);
      return Number.isFinite(ts) && ts >= cutoff && r.conclusion !== '合格';
    }).length;

    const qualified = onlineQualified + labQualified;
    const unqualified = onlineUnqualified + labUnqualified;
    const total = qualified + unqualified;
    const passRate = total === 0 ? 0 : roundToOneDecimal((qualified / total) * 100);

    // 确定主要问题指标
    let mainIssue = '';
    if (unqualified > 0) {
      const issues: Array<{ name: string; count: number }> = [
        { name: '余氯偏低', count: chlorineIssues },
        { name: '浑浊度超标', count: turbidityIssues },
        { name: 'pH异常', count: phIssues },
      ];
      issues.sort((a, b) => b.count - a.count);
      mainIssue = issues[0].count > 0 ? issues[0].name : '指标超标';
    }

    let category: 'qualified' | 'unqualified' | 'unmonitored';
    if (total === 0) {
      category = 'unmonitored';
    } else if (passRate >= 90) {
      category = 'qualified';
    } else {
      category = 'unqualified';
    }

    return {
      waterPointId: wp.id,
      waterPointName: wp.name,
      villageName: village?.name ?? '未知',
      qualified,
      unqualified,
      total,
      passRate,
      mainIssue,
      category,
      trendData: trendData.timestamps.length > 0 ? trendData : undefined,
    };
  });
}

export async function fetchOperationOverview(): Promise<OperationOverview> {
  const totalPopulation = villages.reduce((sum, v) => sum + v.population, 0);
  const totalHouseholds = villages.reduce((sum, v) => sum + v.households, 0);
  const centralized = waterPoints.filter((wp) => wp.supplyMode === '集中供水').length;
  const decentralized = waterPoints.filter((wp) => wp.supplyMode === '分散供水').length;
  const onlineDevices = devices.filter((d) => d.online).length;

  const overview: OperationOverview = {
    totalPopulation,
    totalHouseholds,
    waterPointCount: waterPoints.length,
    villageCount: villages.length,
    centralizedRatio: Math.round((centralized / waterPoints.length) * 1000) / 10,
    decentralizedRatio: Math.round((decentralized / waterPoints.length) * 1000) / 10,
    deviceOnlineRate: Math.round((onlineDevices / devices.length) * 1000) / 10,
    qualityPassRate: computeQualityPassRate(),
    pendingAlerts: alerts.filter((a) => a.status === '待处理').length,
    pendingRepairs: repairs.filter((r) => r.status !== '已完成').length,
  };

  return resolveMock(overview);
}

export async function fetchSourceTypeBreakdown(): Promise<SourceTypeBreakdown[]> {
  const types: WaterSourceType[] = ['地表水', '地下水', '山泉水'];
  const breakdown = types.map((type) => ({
    type,
    count: waterPoints.filter((wp) => wp.sourceType === type).length,
  }));
  return resolveMock(breakdown);
}

export async function fetchManagementBreakdown(): Promise<ManagementBreakdown[]> {
  const types: ManagedBy[] = ['公司直管', '村级管护'];
  const breakdown = types.map((type) => ({
    type,
    count: waterPoints.filter((wp) => wp.managedBy === type).length,
  }));
  return resolveMock(breakdown);
}

export async function fetchVillageSummaries(): Promise<VillageSummary[]> {
  const summaries: VillageSummary[] = villages.map((village) => {
    const points = waterPoints.filter((wp) => wp.villageId === village.id);
    const pointIds = points.map((p) => p.id);
    const villageAlerts = alerts.filter((a) => a.villageId === village.id && a.status === '待处理');
    const relevantLab = labRecords.filter((r) => pointIds.includes(r.waterPointId));
    const relevantOnlineLatest = pointIds
      .map((id) => onlineSeriesByWaterPoint[id])
      .filter(Boolean)
      .map((series) => series[series.length - 1]);

    const total = relevantLab.length + relevantOnlineLatest.length;
    const qualified =
      relevantLab.filter((r) => r.conclusion === '合格').length +
      relevantOnlineLatest.filter((r) => r.isQualified).length;

    return {
      villageId: village.id,
      villageName: village.name,
      population: village.population,
      waterPointCount: points.length,
      qualityPassRate: total === 0 ? 0 : Math.round((qualified / total) * 1000) / 10,
      pendingAlerts: villageAlerts.length,
      dryRisk: DRY_RISK_VILLAGE_IDS.has(village.id),
    };
  });
  return resolveMock(summaries);
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildSevenDayLabels(today = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  });
}

function buildTrend(values: number[], labels: string[]): DashboardTrendPoint[] {
  return labels.map((label, index) => ({
    label,
    value: values[index] ?? 0,
  }));
}

function buildRealtimeRows(): RealtimeMonitorRow[] {
  const rows: RealtimeMonitorRow[] = [];
  const onlineQualityWaterPointIds = new Set(
    devices
      .filter((device) => device.type === '水质监测仪' && device.online)
      .map((device) => device.waterPointId),
  );

  Object.entries(onlineSeriesByWaterPoint).forEach(([waterPointId, series]) => {
    const latest = series[series.length - 1];
    const waterPoint = waterPoints.find((point) => point.id === waterPointId);
    if (!latest || !waterPoint || !onlineQualityWaterPointIds.has(waterPointId)) return;

    const village = villages.find((item) => item.id === waterPoint.villageId);
    const qualifiedCount = series.filter((record) => record.isQualified).length;

    rows.push({
      id: waterPointId,
      name: `${waterPoint.name}监测点`,
      region: village ? `${village.township} · ${village.name}` : '未知区域',
      passRate: series.length === 0 ? 0 : roundToOneDecimal((qualifiedCount / series.length) * 100),
      turbidity: latest.turbidity,
      residualChlorine: latest.residualChlorine,
      ph: latest.ph,
      qualified: latest.isQualified,
      updatedAt: latest.timestamp,
    });
  });

  return rows;
}

function classifyAlert(indicator: string): string {
  if (/压力|水压/.test(indicator)) return '压力';
  if (/流量|供水量/.test(indicator)) return '流量';
  if (/浑浊|余氯|pH|大肠|水质|菌|氨氮|总磷|溶解氧/i.test(indicator)) {
    return '水质';
  }
  if (/设备|仪|泵|阀|离线|故障/.test(indicator)) return '设备';
  return '其他';
}

function isWithinTrailingDays(value: string, nowMs: number, days: number): boolean {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;

  const lowerBound = nowMs - days * 24 * 60 * 60 * 1000;
  return timestamp >= lowerBound && timestamp <= nowMs;
}

function classifyRepair(description: string): string {
  if (/压力|水压/.test(description)) return '压力异常';
  if (/浑浊|发黄|异味|余氯|pH|水质|菌/i.test(description)) return '水质问题';
  if (/管道|管网|水管|漏水|渗水|爆管/.test(description)) return '管网漏损';
  if (/设备|水泵|泵|电机|仪表|灯|阀|损坏|故障|离线/.test(description)) {
    return '设备故障';
  }
  return '其他';
}

export async function fetchDashboardCockpit(): Promise<DashboardCockpitData> {
  const sevenDayLabels = buildSevenDayLabels();
  const realtimeRows = buildRealtimeRows();
  const qualifiedOnline = realtimeRows.filter((row) => row.qualified).length;
  const unqualifiedOnline = realtimeRows.length - qualifiedOnline;
  const onlineQualityPassRate =
    realtimeRows.length === 0
      ? 0
      : roundToOneDecimal((qualifiedOnline / realtimeRows.length) * 100);
  const qualityPassRateSeries = [
    ...dashboardQualityPassRates.slice(0, 6),
    onlineQualityPassRate,
  ];
  const totalPopulation = villages.reduce((sum, village) => sum + village.population, 0);
  const runningWaterPoints = waterPoints.filter((point) => point.status === 'running').length;
  const todayWaterVolume = roundToOneDecimal(
    waterPoints.reduce((sum, point) => sum + point.currentFlow * 24, 0),
  );
  const yesterdayWaterVolume =
    dashboardWaterVolumes[dashboardWaterVolumes.length - 2] ?? 0;
  const dayOverDayChangeRate =
    yesterdayWaterVolume === 0
      ? 0
      : roundToOneDecimal(
          ((todayWaterVolume - yesterdayWaterVolume) / yesterdayWaterVolume) * 100,
        );
  const qualityDevices = devices.filter((device) => device.type === '水质监测仪');
  const qualityMonitorWaterPointCount = new Set(
    qualityDevices.map((device) => device.waterPointId),
  ).size;
  const completedRepairs = repairs.filter((repair) => repair.status === '已完成').length;

  const alertCategoryNames = ['水质', '设备', '压力', '流量', '其他'];
  const alertCategoryCounts = Object.fromEntries(alertCategoryNames.map((name) => [name, 0]));
  const nowMs = Date.now();
  alerts.filter((alert) => isWithinTrailingDays(alert.triggeredAt, nowMs, 7)).forEach((alert) => {
    alertCategoryCounts[classifyAlert(alert.indicator)] += 1;
  });

  const repairTypeNames = ['设备故障', '管网漏损', '水质问题', '压力异常', '其他'];
  const repairTypeCounts = Object.fromEntries(repairTypeNames.map((name) => [name, 0]));
  repairs.forEach((repair) => {
    repairTypeCounts[classifyRepair(repair.description)] += 1;
  });

  const pendingRepairs = repairs.filter((repair) => repair.status === '待派单').length;
  const processingRepairs = repairs.filter((repair) => repair.status === '处理中').length;
  const pumpStations = Object.values(smartVillageProfiles).flatMap(
    (profile) => profile.pumpStations,
  );
  // 驾驶舱当前压力数量来自智慧村庄演示监测点，仅分类运行/预警且有有效读数的点位。
  const pressureMonitoringPoints = pumpStations.filter(
    (station) =>
      (station.status === 'running' || station.status === 'warning') &&
      Number.isFinite(station.outletPressure),
  );
  const lowPressure = pressureMonitoringPoints.filter(
    (station) => station.outletPressure < 0.2,
  ).length;
  const highPressure = pressureMonitoringPoints.filter(
    (station) => station.outletPressure > 0.6,
  ).length;
  const normalPressure = pressureMonitoringPoints.filter(
    (station) => station.outletPressure >= 0.2 && station.outletPressure <= 0.6,
  ).length;
  const dryRiskVillages = villages.filter((village) => DRY_RISK_VILLAGE_IDS.has(village.id));
  const sourceStatusCounts = waterPoints.reduce(
    (counts, point) => {
      if (
        DRY_RISK_VILLAGE_IDS.has(point.villageId) ||
        point.status === 'fault' ||
        point.status === 'stopped'
      ) {
        counts.risk += 1;
      } else if (point.status === 'warning') {
        counts.warning += 1;
      } else {
        counts.normal += 1;
      }
      return counts;
    },
    { normal: 0, warning: 0, risk: 0 },
  );
  const pressureDates = pressureMonitoringPoints.length > 0 ? [...sevenDayLabels] : [];
  const normalPressureSeries =
    pressureMonitoringPoints.length > 0 ? [...dashboardPressureSeries.normal] : [];
  const lowPressureSeries =
    pressureMonitoringPoints.length > 0 ? [...dashboardPressureSeries.low] : [];
  const highPressureSeries =
    pressureMonitoringPoints.length > 0 ? [...dashboardPressureSeries.high] : [];
  if (pressureMonitoringPoints.length > 0) {
    normalPressureSeries[normalPressureSeries.length - 1] = normalPressure;
    lowPressureSeries[lowPressureSeries.length - 1] = lowPressure;
    highPressureSeries[highPressureSeries.length - 1] = highPressure;
  }

  const data: DashboardCockpitData = {
    kpis: [
      {
        key: 'population',
        title: '覆盖人口',
        value: totalPopulation,
        unit: '人',
        detail: `覆盖 ${villages.length} 个行政村`,
        tone: 'cyan',
      },
      {
        key: 'water-points',
        title: '供水工程',
        value: waterPoints.length,
        unit: '处',
        detail: `正常运行 ${runningWaterPoints} 处`,
        tone: 'blue',
      },
      {
        key: 'water-volume',
        title: '今日供水量',
        value: todayWaterVolume,
        unit: '吨',
        detail: `昨日 ${dashboardWaterVolumes[dashboardWaterVolumes.length - 2]} 吨`,
        tone: 'cyan',
      },
      {
        key: 'quality',
        title: '水质达标率',
        value: onlineQualityPassRate,
        unit: '%',
        detail: `${qualifiedOnline}/${realtimeRows.length} 个在线监测点达标`,
        tone: 'green',
      },
      {
        key: 'monitors',
        title: '在线监测点',
        value: realtimeRows.length,
        unit: '个',
        detail: `在线率 ${
          qualityMonitorWaterPointCount === 0
            ? 0
            : roundToOneDecimal((realtimeRows.length / qualityMonitorWaterPointCount) * 100)
        }%`,
        tone: 'green',
      },
      {
        key: 'repairs',
        title: '累计维修工单',
        value: repairs.length,
        unit: '单',
        detail: `已完成 ${completedRepairs} 单`,
        tone: 'orange',
      },
    ],
    qualitySummary: {
      qualified: qualifiedOnline,
      unqualified: unqualifiedOnline,
      unmonitored: Math.max(0, waterPoints.length - realtimeRows.length),
      passRate: onlineQualityPassRate,
    },
    qualitySummaryByRange: {
      day: computeQualitySummaryByDays(1),
      week: computeQualitySummaryByDays(7),
      month: computeQualitySummaryByDays(30),
    },
    qualityDrillDownByRange: {
      day: computeQualityDrillDownByDays(1),
      week: computeQualityDrillDownByDays(7),
      month: computeQualityDrillDownByDays(30),
    },
    qualityTrend: buildTrend(qualityPassRateSeries, sevenDayLabels),
    waterVolumeTrend: buildTrend(dashboardWaterVolumes, sevenDayLabels),
    waterVolumeSummary: {
      today: todayWaterVolume,
      yesterday: yesterdayWaterVolume,
      dayOverDayChangeRate,
    },
    sourceStatus: {
      normal: sourceStatusCounts.normal,
      warning: sourceStatusCounts.warning,
      risk: sourceStatusCounts.risk,
      hasDryRisk: dryRiskVillages.length > 0,
      notice: dryRiskVillages.length
        ? `${dryRiskVillages.map((village) => village.name).join('、')}水源存在季节性枯水风险，建议核查水源蓄水并完善应急供水预案`
        : '当前各供水点水源状况正常，无季节性枯水风险',
    },
    alertCategories: alertCategoryNames.map((name) => ({
      name,
      value: alertCategoryCounts[name],
    })),
    alertDrillDown: alerts
      .filter((alert) => isWithinTrailingDays(alert.triggeredAt, nowMs, 7))
      .map((alert) => {
        const waterPoint = waterPoints.find((wp) => wp.id === alert.waterPointId);
        const village = villages.find((v) => v.id === alert.villageId);
        return {
          id: alert.id,
          waterPointName: waterPoint?.name ?? '未知供水点',
          villageName: village?.name ?? '未知村庄',
          indicator: alert.indicator,
          value: alert.unit && alert.unit !== '-' ? `${alert.value}${alert.unit}` : String(alert.value),
          threshold: alert.threshold,
          level: alert.level,
          status: alert.status,
          triggeredAt: alert.triggeredAt,
          handledAt: alert.handledAt,
          handledBy: alert.handledBy,
          notifyChannels: alert.notifyChannels,
          notifiedPersons: alert.notifiedPersons,
          category: classifyAlert(alert.indicator),
        };
      }),
    workOrders: {
      pending: pendingRepairs,
      processing: processingRepairs,
      completed: completedRepairs,
      completionRate:
        repairs.length === 0 ? 0 : roundToOneDecimal((completedRepairs / repairs.length) * 100),
    },
    workOrdersByRange: {
      day: (() => {
        const dayRepairs = repairs.filter((r) => isWithinTrailingDays(r.reportedAt, nowMs, 1));
        const dPending = dayRepairs.filter((r) => r.status === '待派单').length;
        const dProcessing = dayRepairs.filter((r) => r.status === '处理中').length;
        const dCompleted = dayRepairs.filter((r) => r.status === '已完成').length;
        const dTotal = dPending + dProcessing + dCompleted;
        return {
          pending: dPending,
          processing: dProcessing,
          completed: dCompleted,
          completionRate: dTotal === 0 ? 0 : roundToOneDecimal((dCompleted / dTotal) * 100),
        };
      })(),
      week: (() => {
        const wPending = pendingRepairs;
        const wProcessing = processingRepairs;
        const wCompleted = completedRepairs;
        const wTotal = wPending + wProcessing + wCompleted;
        return {
          pending: wPending,
          processing: wProcessing,
          completed: wCompleted,
          completionRate: wTotal === 0 ? 0 : roundToOneDecimal((wCompleted / wTotal) * 100),
        };
      })(),
    },
    repairTypes: repairTypeNames
      .map((name) => ({ name, value: repairTypeCounts[name] }))
      .sort((left, right) => right.value - left.value),
    pressure: {
      normal: normalPressure,
      low: lowPressure,
      high: highPressure,
      dates: pressureDates,
      normalSeries: normalPressureSeries,
      lowSeries: lowPressureSeries,
      highSeries: highPressureSeries,
    },
    realtimeRows,
  };

  return resolveMock(data);
}
