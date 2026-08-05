import { repairs, getRepairsByVillage } from '../mock/repairs';
import { resolveMock } from './http';
import type { RepairOrder } from '../types';

export async function fetchRepairs(villageId?: string): Promise<RepairOrder[]> {
  const result = villageId ? getRepairsByVillage(villageId) : repairs;
  return resolveMock([...result].sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1)));
}

export async function createRepair(order: Omit<RepairOrder, 'id' | 'status'>): Promise<RepairOrder> {
  const created: RepairOrder = { ...order, id: `rep-${Date.now()}`, status: '待派单' };
  repairs.unshift(created);
  return resolveMock(created, 150);
}

export async function updateRepairStatus(
  id: string,
  status: RepairOrder['status'],
  updates?: Partial<RepairOrder>,
): Promise<RepairOrder | undefined> {
  const order = repairs.find((r) => r.id === id);
  if (order) {
    order.status = status;
    if (status === '处理中' && updates?.handler) {
      order.handler = updates.handler;
      order.dispatchedAt = new Date().toISOString();
    }
    if (status === '已完成') {
      order.resolvedAt = new Date().toISOString();
      order.resolution = updates?.resolution ?? order.resolution;
    }
    if (status === '已回访') {
      order.visitedAt = new Date().toISOString();
      order.visitResult = updates?.visitResult ?? order.visitResult;
      order.visitConfirmed = updates?.visitConfirmed ?? true;
    }
  }
  return resolveMock(order, 150);
}
