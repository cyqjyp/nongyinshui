import { onlineSeriesByWaterPoint, labRecords as labRecordsStore, getLabRecordsByWaterPoint } from '../mock/waterQuality';
import { alerts, getAlertsByWaterPoint } from '../mock/alerts';
import { resolveMock } from './http';
import type { AlertEvent, LabWaterQualityRecord, OnlineWaterQualityRecord } from '../types';

export async function fetchOnlineSeries(waterPointId: string): Promise<OnlineWaterQualityRecord[]> {
  return resolveMock(onlineSeriesByWaterPoint[waterPointId] ?? []);
}

export async function fetchAllOnlineLatest(): Promise<OnlineWaterQualityRecord[]> {
  const latest = Object.values(onlineSeriesByWaterPoint).map((series) => series[series.length - 1]);
  return resolveMock(latest);
}

export async function fetchLabRecords(waterPointId?: string): Promise<LabWaterQualityRecord[]> {
  const result = waterPointId ? getLabRecordsByWaterPoint(waterPointId) : labRecordsStore;
  return resolveMock(result);
}

export async function createLabRecord(
  record: Omit<LabWaterQualityRecord, 'id' | 'source'>,
): Promise<LabWaterQualityRecord> {
  const created: LabWaterQualityRecord = { ...record, id: `lab-${Date.now()}`, source: 'lab' };
  labRecordsStore.unshift(created);
  return resolveMock(created, 150);
}

export async function fetchAlerts(waterPointId?: string): Promise<AlertEvent[]> {
  const result = waterPointId ? getAlertsByWaterPoint(waterPointId) : alerts;
  return resolveMock([...result].sort((a, b) => (a.triggeredAt < b.triggeredAt ? 1 : -1)));
}

/** Mutates the in-memory mock alert list — mirrors what a PATCH /alerts/:id would do. */
export async function markAlertHandled(alertId: string, handledBy: string): Promise<AlertEvent | undefined> {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.status = '已处理';
    alert.handledAt = new Date().toISOString();
    alert.handledBy = handledBy;
  }
  return resolveMock(alert, 150);
}
