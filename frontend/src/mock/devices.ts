import type { Device } from '../types';

const now = () => new Date().toISOString();

export const devices: Device[] = [
  { id: 'dev-01', waterPointId: 'wp-01', name: '水质监测仪', type: '水质监测仪', status: 'running', online: true, lastReportAt: now(), installedAt: '2025-03-10' },
  { id: 'dev-04', waterPointId: 'wp-01', name: '1号送水泵', type: '水泵', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-11-02' },
  { id: 'dev-05', waterPointId: 'wp-01', name: '加氯消毒装置', type: '加氯消毒设备', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-11-02' },
  { id: 'dev-06', waterPointId: 'wp-01', name: '出厂流量计', type: '流量计', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-11-02' },

  { id: 'dev-07', waterPointId: 'wp-02', name: '高位水池液位计', type: '液位计', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-11-05' },

  { id: 'dev-08', waterPointId: 'wp-03', name: '水质监测仪', type: '水质监测仪', status: 'warning', online: true, lastReportAt: now(), installedAt: '2025-01-18' },
  { id: 'dev-11', waterPointId: 'wp-03', name: '2号送水泵', type: '水泵', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-09-20' },
  { id: 'dev-12', waterPointId: 'wp-03', name: '水站液位计', type: '液位计', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-09-20' },

  { id: 'dev-13', waterPointId: 'wp-04', name: '水质监测仪', type: '水质监测仪', status: 'running', online: true, lastReportAt: now(), installedAt: '2025-05-01' },
  { id: 'dev-14', waterPointId: 'wp-04', name: '机井潜水泵', type: '水泵', status: 'running', online: true, lastReportAt: now(), installedAt: '2024-06-15' },

  { id: 'dev-16', waterPointId: 'wp-05', name: '引水流量计', type: '流量计', status: 'stopped', online: false, lastReportAt: '2026-07-21T09:12:00', installedAt: '2024-06-15' },
];

export function getDevicesByWaterPoint(waterPointId: string): Device[] {
  return devices.filter((d) => d.waterPointId === waterPointId);
}
