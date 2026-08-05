import { villages } from '../mock/villages';
import { waterPoints, getWaterPointsByVillage } from '../mock/waterPoints';
import { devices, getDevicesByWaterPoint } from '../mock/devices';
import { resolveMock } from './http';
import type { Device, Village, WaterPoint } from '../types';

export async function fetchVillages(): Promise<Village[]> {
  return resolveMock(villages);
}

export async function fetchWaterPoints(villageId?: string): Promise<WaterPoint[]> {
  const result = villageId ? getWaterPointsByVillage(villageId) : waterPoints;
  return resolveMock(result);
}

export async function fetchWaterPointById(id: string): Promise<WaterPoint | undefined> {
  return resolveMock(waterPoints.find((wp) => wp.id === id));
}

export async function fetchDevices(waterPointId?: string): Promise<Device[]> {
  const result = waterPointId ? getDevicesByWaterPoint(waterPointId) : devices;
  return resolveMock(result);
}
