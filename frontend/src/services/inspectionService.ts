import { inspections, getInspectionsByWaterPoint } from '../mock/inspections';
import { resolveMock } from './http';
import type { InspectionRecord } from '../types';

export async function fetchInspections(waterPointId?: string): Promise<InspectionRecord[]> {
  const result = waterPointId ? getInspectionsByWaterPoint(waterPointId) : inspections;
  return resolveMock([...result].sort((a, b) => (a.inspectedAt < b.inspectedAt ? 1 : -1)));
}

export async function createInspection(record: Omit<InspectionRecord, 'id'>): Promise<InspectionRecord> {
  const created: InspectionRecord = { ...record, id: `insp-${Date.now()}` };
  inspections.unshift(created);
  return resolveMock(created, 150);
}
