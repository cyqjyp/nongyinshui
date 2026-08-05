import type { LabWaterQualityRecord, OnlineWaterQualityRecord } from '../types';
import { randomFloat, chance } from './random';

const TURBIDITY_STANDARD: [number, number] = [0, 1];
const CHLORINE_STANDARD: [number, number] = [0.05, 4];
const PH_STANDARD: [number, number] = [6.5, 8.5];

// 水源地标准 (GB 3838-2002 地表水 III 类)
const AMMONIA_NITROGEN_STANDARD: [number, number] = [0, 1.0]; // mg/L
const TP_STANDARD: [number, number] = [0, 0.2]; // mg/L
const DISSOLVED_OXYGEN_STANDARD: [number, number] = [5, 100]; // mg/L

function isQualified(turbidity: number, chlorine: number, ph: number): boolean {
  return (
    turbidity <= TURBIDITY_STANDARD[1] &&
    chlorine >= CHLORINE_STANDARD[0] &&
    chlorine <= CHLORINE_STANDARD[1] &&
    ph >= PH_STANDARD[0] &&
    ph <= PH_STANDARD[1]
  );
}

/** Generates a 7-day, hourly online monitoring series ending at "now". */
export function generateOnlineSeries(
  waterPointId: string,
  options?: { drift?: 'normal' | 'elevated-turbidity' | 'low-chlorine' },
): OnlineWaterQualityRecord[] {
  const drift = options?.drift ?? 'normal';
  const records: OnlineWaterQualityRecord[] = [];
  const now = new Date();
  const totalHours = 7 * 24; // 7 days

  for (let i = totalHours - 1; i >= 0; i -= 1) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000);
    let turbidity = randomFloat(0.25, 0.75);
    let chlorine = randomFloat(0.35, 0.85);
    const ph = randomFloat(7.0, 7.9);

    // Recent anomalies (last few hours)
    if (drift === 'elevated-turbidity' && i < 4) {
      turbidity = randomFloat(1.1, 1.8);
    }
    if (drift === 'low-chlorine' && i < 3) {
      chlorine = randomFloat(0.01, 0.04);
    }

    // Historical anomalies (3-5 days ago) for week view differentiation
    if (drift === 'elevated-turbidity' && i >= 72 && i < 80) {
      turbidity = randomFloat(1.0, 1.5);
    }
    if (drift === 'low-chlorine' && i >= 96 && i < 102) {
      chlorine = randomFloat(0.02, 0.04);
    }

    records.push({
      id: `owq-${waterPointId}-${i}`,
      waterPointId,
      source: 'online',
      timestamp: ts.toISOString(),
      turbidity,
      residualChlorine: chlorine,
      ph,
      turbidityStandard: TURBIDITY_STANDARD,
      chlorineStandard: CHLORINE_STANDARD,
      phStandard: PH_STANDARD,
      isQualified: isQualified(turbidity, chlorine, ph),
    });
  }
  return records;
}

export const onlineSeriesByWaterPoint: Record<string, OnlineWaterQualityRecord[]> = {
  'wp-01': generateOnlineSeries('wp-01', { drift: 'normal' }),
  'wp-03': generateOnlineSeries('wp-03', { drift: 'low-chlorine' }),
  'wp-04': generateOnlineSeries('wp-04', { drift: 'normal' }),
  'wp-05': generateOnlineSeries('wp-05', { drift: 'elevated-turbidity' }),
};

export const labRecords: LabWaterQualityRecord[] = [
  {
    id: 'lab-01',
    waterPointId: 'wp-01',
    source: 'lab',
    testDate: '2026-06-15',
    institution: '县疾控中心水质检测所',
    bacteriaCount: 12,
    coliformDetected: false,
    turbidity: 0.42,
    residualChlorine: 0.48,
    ph: 7.3,
    conclusion: '合格',
    reportFileName: '青溪水厂-2026Q2检测报告.pdf',
  },
  {
    id: 'lab-02',
    waterPointId: 'wp-01',
    source: 'lab',
    testDate: '2026-03-12',
    institution: '县疾控中心水质检测所',
    bacteriaCount: 8,
    coliformDetected: false,
    turbidity: 0.38,
    residualChlorine: 0.51,
    ph: 7.2,
    conclusion: '合格',
    reportFileName: '青溪水厂-2026Q1检测报告.pdf',
  },
  {
    id: 'lab-03',
    waterPointId: 'wp-03',
    source: 'lab',
    testDate: '2026-06-18',
    institution: '县疾控中心水质检测所',
    bacteriaCount: 46,
    coliformDetected: false,
    turbidity: 0.61,
    residualChlorine: 0.22,
    ph: 7.5,
    conclusion: '合格',
    reportFileName: '石桥水站-2026Q2检测报告.pdf',
  },
  {
    id: 'lab-04',
    waterPointId: 'wp-04',
    source: 'lab',
    testDate: '2026-06-20',
    institution: '县疾控中心水质检测所',
    bacteriaCount: 34,
    coliformDetected: false,
    turbidity: 0.55,
    residualChlorine: 0.4,
    ph: 7.1,
    conclusion: '合格',
    reportFileName: '梅岭1号机井-2026Q2检测报告.pdf',
  },
  {
    id: 'lab-05',
    waterPointId: 'wp-05',
    source: 'lab',
    testDate: '2026-06-22',
    institution: '县疾控中心水质检测所',
    bacteriaCount: 130,
    coliformDetected: true,
    turbidity: 1.4,
    residualChlorine: 0.03,
    ph: 6.9,
    conclusion: '不合格',
    reportFileName: '梅岭2号山泉引水点-2026Q2检测报告.pdf',
  },
];

export function getLabRecordsByWaterPoint(waterPointId: string): LabWaterQualityRecord[] {
  return labRecords.filter((r) => r.waterPointId === waterPointId);
}

export function isDueForNextTest(lastTestDate: string, cycleDays = 90): boolean {
  const last = new Date(lastTestDate).getTime();
  const diffDays = (Date.now() - last) / (1000 * 60 * 60 * 24);
  return diffDays >= cycleDays - 10;
}

export function randomFutureChance(prob: number): boolean {
  return chance(prob);
}

/* ────────────────────────────────────────────────────────────────────────────
   三个监测位置实时数据
   ─────────────────────────────────────────────────────────────────────────── */

export interface MetricTrendPoint {
  date: string;
  value: number;
}

export interface MetricTrendData {
  metricLabel: string;
  unit: string;
  limit: string;
  limitType: 'range' | 'max' | 'min';
  limitValue: [number, number];
  data: MetricTrendPoint[];
}

function generate7DayTrend(base: number, variance: number, days = 7): MetricTrendPoint[] {
  const points: MetricTrendPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    points.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      value: +(base + (Math.random() - 0.5) * variance * 2).toFixed(2),
    });
  }
  return points;
}

export const metricTrendData: Record<string, Record<string, MetricTrendData>> = {
  source: {
    pH: {
      metricLabel: 'pH',
      unit: '',
      limit: '6.5 ~ 8.5',
      limitType: 'range',
      limitValue: [6.5, 8.5],
      data: generate7DayTrend(7.35, 0.3),
    },
    氨氮: {
      metricLabel: '氨氮',
      unit: 'mg/L',
      limit: '≤ 1.0 mg/L',
      limitType: 'max',
      limitValue: [0, 1.0],
      data: generate7DayTrend(0.42, 0.15),
    },
    TP: {
      metricLabel: 'TP',
      unit: 'mg/L',
      limit: '≤ 0.2 mg/L',
      limitType: 'max',
      limitValue: [0, 0.2],
      data: generate7DayTrend(0.11, 0.05),
    },
    溶解氧: {
      metricLabel: '溶解氧',
      unit: 'mg/L',
      limit: '≥ 5 mg/L',
      limitType: 'min',
      limitValue: [5, 100],
      data: generate7DayTrend(7.2, 0.8),
    },
  },
  finished: {
    pH: {
      metricLabel: 'pH',
      unit: '',
      limit: '6.5 ~ 8.5',
      limitType: 'range',
      limitValue: [6.5, 8.5],
      data: generate7DayTrend(7.28, 0.25),
    },
    浊度: {
      metricLabel: '浊度',
      unit: 'NTU',
      limit: '≤ 1 NTU',
      limitType: 'max',
      limitValue: [0, 1],
      data: generate7DayTrend(0.38, 0.15),
    },
    余氯: {
      metricLabel: '余氯',
      unit: 'mg/L',
      limit: '0.05 ~ 4 mg/L',
      limitType: 'range',
      limitValue: [0.05, 4],
      data: generate7DayTrend(0.52, 0.15),
    },
  },
  terminal: {
    pH: {
      metricLabel: 'pH',
      unit: '',
      limit: '6.5 ~ 8.5',
      limitType: 'range',
      limitValue: [6.5, 8.5],
      data: generate7DayTrend(7.15, 0.3),
    },
    浊度: {
      metricLabel: '浊度',
      unit: 'NTU',
      limit: '≤ 1 NTU',
      limitType: 'max',
      limitValue: [0, 1],
      data: generate7DayTrend(0.69, 0.2),
    },
    余氯: {
      metricLabel: '余氯',
      unit: 'mg/L',
      limit: '≥ 0.05 mg/L',
      limitType: 'min',
      limitValue: [0.05, 100],
      data: generate7DayTrend(0.18, 0.08),
    },
  },
};

export const monitoringPositions = {
  source: {
    position: 'source' as const,
    label: '水源地',
    metrics: [
      { label: 'pH', value: 7.35, unit: '', limit: '6.5 ~ 8.5', isQualified: true },
      { label: '氨氮', value: 0.42, unit: 'mg/L', limit: '≤ 1.0 mg/L', isQualified: true },
      { label: 'TP', value: 0.11, unit: 'mg/L', limit: '≤ 0.2 mg/L', isQualified: true },
      { label: '溶解氧', value: 7.2, unit: 'mg/L', limit: '≥ 5 mg/L', isQualified: true },
    ],
    updatedAt: new Date().toISOString(),
  },
  finished: {
    position: 'finished' as const,
    label: '出厂水',
    metrics: [
      { label: 'pH', value: 7.28, unit: '', limit: '6.5 ~ 8.5', isQualified: true },
      { label: '浊度', value: 0.38, unit: 'NTU', limit: '≤ 1 NTU', isQualified: true },
      { label: '余氯', value: 0.52, unit: 'mg/L', limit: '0.05 ~ 4 mg/L', isQualified: true },
    ],
    updatedAt: new Date().toISOString(),
  },
  terminal: {
    position: 'terminal' as const,
    label: '管网末梢水',
    metrics: [
      { label: 'pH', value: 7.15, unit: '', limit: '6.5 ~ 8.5', isQualified: true },
      { label: '浊度', value: 0.69, unit: 'NTU', limit: '≤ 1 NTU', isQualified: true },
      { label: '余氯', value: 0.18, unit: 'mg/L', limit: '≥ 0.05 mg/L', isQualified: true },
    ],
    updatedAt: new Date().toISOString(),
  },
};
