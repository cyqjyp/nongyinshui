/**
 * Domain types for the Rural Drinking Water Safety Management Platform.
 *
 * These types define the contract between the UI and the data layer.
 * The current implementation (see src/services) backs these types with
 * mock data, but the shapes are designed to map 1:1 onto the future
 * backend API responses so services can be swapped without touching
 * the UI layer.
 */

export type SupplyMode = '集中供水' | '分散供水';

export type WaterSourceType = '地表水' | '地下水' | '山泉水';

export type ManagedBy = '公司直管' | '村级管护';

export type WaterPointType =
  | '集中式水厂'
  | '集中式水站'
  | '蓄水池'
  | '分散式机井'
  | '分散式山泉';

export type OperationalStatus = 'running' | 'stopped' | 'fault' | 'warning';

export interface Village {
  id: string;
  name: string;
  township: string;
  population: number;
  households: number;
  isPilot: boolean;
  location: { lat: number; lng: number };
  healthScore?: number;
  keyContact?: {
    name: string;
    role: string;
    phone: string;
  };
}

export interface WaterPoint {
  id: string;
  name: string;
  villageId: string;
  type: WaterPointType;
  sourceType: WaterSourceType;
  supplyMode: SupplyMode;
  managedBy: ManagedBy;
  coveredHouseholds: number;
  coveredPopulation: number;
  designCapacity: number; // m3/day
  currentFlow: number; // m3/h
  reservoirLevel?: number; // percentage, only for tanks/reservoirs
  status: OperationalStatus;
  location: { lat: number; lng: number };
}

export type DeviceType =
  | '水质监测仪'
  | '水泵'
  | '加氯消毒设备'
  | '流量计'
  | '液位计';

export interface Device {
  id: string;
  waterPointId: string;
  name: string;
  type: DeviceType;
  status: OperationalStatus;
  online: boolean;
  lastReportAt: string;
  installedAt: string;
}

export type WaterQualitySource = 'online' | 'lab';

export interface OnlineWaterQualityRecord {
  id: string;
  waterPointId: string;
  source: 'online';
  timestamp: string;
  turbidity: number; // NTU
  residualChlorine: number; // mg/L
  ph: number;
  turbidityStandard: [number, number];
  chlorineStandard: [number, number];
  phStandard: [number, number];
  isQualified: boolean;
}

/** 水源地监测指标（pH、氨氮、TP、溶解氧） */
export interface SourceWaterMetric {
  label: string;
  value: number;
  unit: string;
  limit: string;
  isQualified: boolean;
}

/** 出厂水/末梢水监测指标（pH、浊度、余氯） */
export interface FinishedWaterMetric {
  label: string;
  value: number;
  unit: string;
  limit: string;
  isQualified: boolean;
}

/** 监测位置类型 */
export type MonitoringPosition = 'source' | 'finished' | 'terminal';

/** 监测位置实时数据 */
export interface MonitoringPositionData {
  position: MonitoringPosition;
  label: string;
  metrics: SourceWaterMetric[] | FinishedWaterMetric[];
  updatedAt: string;
}

export interface LabWaterQualityRecord {
  id: string;
  waterPointId: string;
  source: 'lab';
  testDate: string;
  institution: string;
  bacteriaCount: number; // CFU/mL
  coliformDetected: boolean;
  turbidity: number;
  residualChlorine: number;
  ph: number;
  conclusion: '合格' | '不合格';
  reportFileName?: string;
}

export type WaterQualityRecord = OnlineWaterQualityRecord | LabWaterQualityRecord;

export type AlertLevel = 'warning' | 'critical';
export type AlertStatus = '待处理' | '已处理';

export interface AlertEvent {
  id: string;
  waterPointId: string;
  villageId: string;
  indicator: string;
  value: number;
  unit: string;
  threshold: string;
  level: AlertLevel;
  status: AlertStatus;
  triggeredAt: string;
  handledAt?: string;
  handledBy?: string;
  notifyChannels: Array<'系统预警' | '短信'>;
  notifiedPersons: string[];
}

export type InspectionResult = '正常' | '异常';

export interface InspectionRecord {
  id: string;
  waterPointId: string;
  villageId: string;
  inspector: string;
  inspectedAt: string;
  items: string[];
  result: InspectionResult;
  issueDescription?: string;
}

export type RepairSource = '电话反映' | '现场反映' | '小程序自助(预留)';
export type RepairStatus = '待派单' | '处理中' | '已完成' | '已回访';

export interface RepairOrder {
  id: string;
  villageId: string;
  waterPointId?: string;
  source: RepairSource;
  reporterContact?: string;
  description: string;
  reportedAt: string;
  handler?: string;
  status: RepairStatus;
  dispatchedAt?: string;
  resolvedAt?: string;
  resolution?: string;
  visitedAt?: string;
  visitResult?: string;
  visitConfirmed?: boolean;
}

export interface WaterMeter {
  id: string;
  villageId: string;
  waterPointId: string;
  meterNumber: string;
  householdName: string;
  address: string;
  installedAt: string;
  lastReading: number;
  lastReadingDate: string;
  status: '正常' | '故障' | '待更换';
}

export interface OperationOverview {
  totalPopulation: number;
  totalHouseholds: number;
  waterPointCount: number;
  villageCount: number;
  centralizedRatio: number;
  decentralizedRatio: number;
  deviceOnlineRate: number;
  qualityPassRate: number;
  pendingAlerts: number;
  pendingRepairs: number;
}

export interface SourceTypeBreakdown {
  type: WaterSourceType;
  count: number;
}

export interface ManagementBreakdown {
  type: ManagedBy;
  count: number;
}

export interface VillageSummary {
  villageId: string;
  villageName: string;
  population: number;
  waterPointCount: number;
  qualityPassRate: number;
  pendingAlerts: number;
  dryRisk: boolean;
}
