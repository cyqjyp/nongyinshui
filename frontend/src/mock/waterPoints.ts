import type { WaterPoint } from '../types';

export const waterPoints: WaterPoint[] = [
  {
    id: 'wp-01',
    name: '青溪水厂',
    villageId: 'v-01',
    type: '集中式水厂',
    sourceType: '地表水',
    supplyMode: '集中供水',
    managedBy: '公司直管',
    coveredHouseholds: 612,
    coveredPopulation: 2140,
    designCapacity: 480,
    currentFlow: 16.8,
    status: 'running',
    location: { lat: 28.42, lng: 118.86 },
  },
  {
    id: 'wp-02',
    name: '青溪高位水池',
    villageId: 'v-01',
    type: '蓄水池',
    sourceType: '地表水',
    supplyMode: '集中供水',
    managedBy: '公司直管',
    coveredHouseholds: 612,
    coveredPopulation: 2140,
    designCapacity: 200,
    currentFlow: 0,
    reservoirLevel: 78,
    status: 'running',
    location: { lat: 28.424, lng: 118.865 },
  },
  {
    id: 'wp-03',
    name: '石桥水站',
    villageId: 'v-02',
    type: '集中式水站',
    sourceType: '地下水',
    supplyMode: '集中供水',
    managedBy: '公司直管',
    coveredHouseholds: 438,
    coveredPopulation: 1580,
    designCapacity: 260,
    currentFlow: 11.2,
    reservoirLevel: 62,
    status: 'warning',
    location: { lat: 28.451, lng: 118.902 },
  },
  {
    id: 'wp-04',
    name: '梅岭1号机井',
    villageId: 'v-03',
    type: '分散式机井',
    sourceType: '地下水',
    supplyMode: '分散供水',
    managedBy: '村级管护',
    coveredHouseholds: 160,
    coveredPopulation: 570,
    designCapacity: 60,
    currentFlow: 2.1,
    status: 'running',
    location: { lat: 28.501, lng: 118.83 },
  },
  {
    id: 'wp-05',
    name: '梅岭2号山泉引水点',
    villageId: 'v-03',
    type: '分散式山泉',
    sourceType: '山泉水',
    supplyMode: '分散供水',
    managedBy: '村级管护',
    coveredHouseholds: 111,
    coveredPopulation: 390,
    designCapacity: 40,
    currentFlow: 1.4,
    status: 'fault',
    location: { lat: 28.508, lng: 118.822 },
  },
];

export function getWaterPointsByVillage(villageId: string): WaterPoint[] {
  return waterPoints.filter((wp) => wp.villageId === villageId);
}

export function getWaterPointById(id: string): WaterPoint | undefined {
  return waterPoints.find((wp) => wp.id === id);
}
