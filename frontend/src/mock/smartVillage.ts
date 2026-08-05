import type { OperationalStatus } from '../types';

export interface SmartVillageProfile {
  villageId: string;
  mapImage: string;
  basicInfo: {
    households: number;
    zoneMeters: number;
    pumpStations: number;
    qualityMonitors: number;
    levelMonitors: number;
    householdMeters: number;
    leakageRate: number;
  };
  sourceWater: {
    online: boolean;
    metrics: Array<{ label: string; value: number; unit: string; limit: string }>;
  };
  finishedWater: {
    online: boolean;
    metrics: Array<{ label: string; value: number; unit: string; limit: string }>;
    statusText: string;
  };
  pumpStations: Array<{
    id: string;
    name: string;
    status: OperationalStatus;
    inletPressure: number;
    outletPressure: number;
    flowRate: number;
    totalSupply: number;
    supplyChange: number;
    supplyChangeRate: number;
    realtimeQuality?: Array<{ label: string; value: number; unit: string; limit: string }>;
  }>;
  liquidLevels: {
    clearPool: { current: number; status: '正常' | '预警' };
    rawPool: { current: number; status: '正常' | '预警' };
    series: {
      clearPool: number[];
      rawPool: number[];
    };
  };
  valves: Array<{
    name: string;
    status: '已开启' | '全关';
    openPercent: number;
    running: boolean;
  }>;
  alarms: Array<{ id: string; message: string; time: string }>;
}

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXnjB9h8CKe4DQ2pi_kuSPEJOzFFBaYbpJoMLwPvbKkfF-E1xdHePcWHVrdyRvfwMSQy0rae9L78rmPcN-eJplP_9XBZKYP_nSy8sHsFMlsl7FUqcppZYhH4AfVdTnxTAaNa-zWt2KJ8uULuz81VPT2KmFpvnnx2Fww5Si3KM7JTcKIfe0kIFIE8DBgUJCXu_PUMt2mq67yZCaqldVhH6GtXpPs5w8aUWfUehHn03j7nrPQwsgP5DdHWyJEL2LJqPxzvS9y_PUMMkl';

export const smartVillageProfiles: Record<string, SmartVillageProfile> = {
  'v-01': {
    villageId: 'v-01',
    mapImage: MAP_IMAGE,
    basicInfo: {
      households: 612,
      zoneMeters: 18,
      pumpStations: 2,
      qualityMonitors: 2,
      levelMonitors: 2,
      householdMeters: 612,
      leakageRate: 4.8,
    },
    sourceWater: {
      online: true,
      metrics: [
        { label: '总磷', value: 0.01, unit: 'mg/L', limit: '限值≤0.2' },
        { label: 'pH值', value: 7.08, unit: '', limit: '限值 6.0-9.0' },
        { label: '溶解氧(DO)', value: 9.03, unit: 'mg/L', limit: '限值≥5.0' },
        { label: '氨氮', value: 0.54, unit: 'mg/L', limit: '限值≤1.0' },
      ],
    },
    finishedWater: {
      online: true,
      metrics: [
        { label: '出厂余氯', value: 0.74, unit: 'mg/L', limit: '限值≥0.3' },
        { label: '出厂浊度', value: 0.5, unit: 'NTU', limit: '限值≤1.0' },
      ],
      statusText: '各项参数监测正常',
    },
    pumpStations: [
      {
        id: 'ps-01',
        name: '1# 青溪水厂泵站',
        status: 'running',
        inletPressure: 0.49,
        outletPressure: 0.64,
        flowRate: 119.7,
        totalSupply: 2.2,
        supplyChange: 0.12,
        supplyChangeRate: 5.3,
        realtimeQuality: [
          { label: '余氯', value: 0.9, unit: 'mg/L', limit: '限值≥0.5' },
          { label: '浊度', value: 0.19, unit: 'NTU', limit: '限值≤1' },
          { label: 'pH值', value: 7.16, unit: '', limit: '限值 6.5-8.5' },
        ],
      },
      {
        id: 'ps-02',
        name: '2# 高位水池泵站',
        status: 'running',
        inletPressure: 0.18,
        outletPressure: 0.51,
        flowRate: 94.83,
        totalSupply: 1.98,
        supplyChange: -0.08,
        supplyChangeRate: -4.2,
      },
    ],
    liquidLevels: {
      clearPool: { current: 3.81, status: '正常' },
      rawPool: { current: 2.43, status: '预警' },
      series: {
        clearPool: [3.65, 3.72, 3.68, 3.75, 3.8, 3.78, 3.82, 3.79, 3.85, 3.81, 3.76, 3.83],
        rawPool: [2.35, 2.4, 2.38, 2.42, 2.45, 2.41, 2.44, 2.46, 2.43, 2.4, 2.38, 2.43],
      },
    },
    valves: [
      { name: '主管道进水阀', status: '已开启', openPercent: 85, running: true },
      { name: '旁路泄压阀', status: '全关', openPercent: 0, running: false },
    ],
    alarms: [{ id: 'a1', message: '高位水池液位偏低', time: '10:42' }],
  },
  'v-02': {
    villageId: 'v-02',
    mapImage: MAP_IMAGE,
    basicInfo: {
      households: 438,
      zoneMeters: 12,
      pumpStations: 1,
      qualityMonitors: 1,
      levelMonitors: 1,
      householdMeters: 438,
      leakageRate: 5.4,
    },
    sourceWater: {
      online: true,
      metrics: [
        { label: '总磷', value: 0.02, unit: 'mg/L', limit: '限值≤0.2' },
        { label: 'pH值', value: 7.12, unit: '', limit: '限值 6.0-9.0' },
        { label: '溶解氧(DO)', value: 8.76, unit: 'mg/L', limit: '限值≥5.0' },
        { label: '氨氮', value: 0.61, unit: 'mg/L', limit: '限值≤1.0' },
      ],
    },
    finishedWater: {
      online: true,
      metrics: [
        { label: '出厂余氯', value: 0.22, unit: 'mg/L', limit: '限值≥0.3' },
        { label: '出厂浊度', value: 0.61, unit: 'NTU', limit: '限值≤1.0' },
      ],
      statusText: '余氯偏低,需关注加氯装置',
    },
    pumpStations: [
      {
        id: 'ps-03',
        name: '1# 石桥水站泵站',
        status: 'warning',
        inletPressure: 0.32,
        outletPressure: 0.48,
        flowRate: 86.5,
        totalSupply: 1.56,
        supplyChange: -0.05,
        supplyChangeRate: -3.1,
        realtimeQuality: [
          { label: '余氯', value: 0.22, unit: 'mg/L', limit: '限值≥0.5' },
          { label: '浊度', value: 0.61, unit: 'NTU', limit: '限值≤1' },
          { label: 'pH值', value: 7.5, unit: '', limit: '限值 6.5-8.5' },
        ],
      },
    ],
    liquidLevels: {
      clearPool: { current: 2.62, status: '正常' },
      rawPool: { current: 2.18, status: '正常' },
      series: {
        clearPool: [2.5, 2.55, 2.58, 2.6, 2.62, 2.59, 2.61, 2.63, 2.6, 2.58, 2.61, 2.62],
        rawPool: [2.1, 2.12, 2.15, 2.18, 2.2, 2.17, 2.19, 2.16, 2.18, 2.15, 2.17, 2.18],
      },
    },
    valves: [{ name: '水站进水阀', status: '已开启', openPercent: 72, running: true }],
    alarms: [
      { id: 'a2', message: '出厂余氯持续偏低', time: '09:15' },
      { id: 'a3', message: '加氯装置药量不足', time: '08:40' },
    ],
  },
  'v-03': {
    villageId: 'v-03',
    mapImage: MAP_IMAGE,
    basicInfo: {
      households: 271,
      zoneMeters: 8,
      pumpStations: 2,
      qualityMonitors: 2,
      levelMonitors: 1,
      householdMeters: 271,
      leakageRate: 6.2,
    },
    sourceWater: {
      online: false,
      metrics: [
        { label: '总磷', value: 0.08, unit: 'mg/L', limit: '限值≤0.2' },
        { label: 'pH值', value: 6.9, unit: '', limit: '限值 6.0-9.0' },
        { label: '溶解氧(DO)', value: 7.42, unit: 'mg/L', limit: '限值≥5.0' },
        { label: '氨氮', value: 0.88, unit: 'mg/L', limit: '限值≤1.0' },
      ],
    },
    finishedWater: {
      online: false,
      metrics: [
        { label: '出厂余氯', value: 0.03, unit: 'mg/L', limit: '限值≥0.3' },
        { label: '出厂浊度', value: 1.4, unit: 'NTU', limit: '限值≤1.0' },
      ],
      statusText: '水质指标异常,请立即处置',
    },
    pumpStations: [
      {
        id: 'ps-04',
        name: '1# 机井潜水泵',
        status: 'running',
        inletPressure: 0.12,
        outletPressure: 0.35,
        flowRate: 42.1,
        totalSupply: 0.86,
        supplyChange: 0.03,
        supplyChangeRate: 2.1,
      },
      {
        id: 'ps-05',
        name: '2# 山泉引水泵',
        status: 'fault',
        inletPressure: 0,
        outletPressure: 0,
        flowRate: 0,
        totalSupply: 0.42,
        supplyChange: -0.12,
        supplyChangeRate: -22.4,
      },
    ],
    liquidLevels: {
      clearPool: { current: 1.85, status: '预警' },
      rawPool: { current: 1.52, status: '预警' },
      series: {
        clearPool: [2.1, 2.05, 2.0, 1.95, 1.9, 1.88, 1.86, 1.84, 1.82, 1.85, 1.83, 1.85],
        rawPool: [1.8, 1.75, 1.7, 1.65, 1.6, 1.58, 1.55, 1.53, 1.52, 1.5, 1.51, 1.52],
      },
    },
    valves: [
      { name: '机井出水阀', status: '已开启', openPercent: 100, running: true },
      { name: '山泉引水阀', status: '全关', openPercent: 0, running: false },
    ],
    alarms: [
      { id: 'a4', message: '山泉引水点监测设备离线', time: '09:12' },
      { id: 'a5', message: '出厂浊度超标', time: '08:39' },
      { id: 'a6', message: '2#引水泵故障停机', time: '07:55' },
    ],
  },
};

export function getSmartVillageProfile(villageId: string): SmartVillageProfile | undefined {
  return smartVillageProfiles[villageId];
}
