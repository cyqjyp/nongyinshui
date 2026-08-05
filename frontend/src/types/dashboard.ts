export interface DashboardKpi {
  key: string;
  title: string;
  value: string | number;
  unit?: string;
  detail: string;
  tone: 'cyan' | 'green' | 'blue' | 'orange';
}

export interface DashboardTrendPoint {
  label: string;
  value: number;
}

export interface RealtimeMonitorRow {
  id: string;
  name: string;
  region: string;
  passRate: number;
  turbidity: number;
  residualChlorine: number;
  ph: number;
  qualified: boolean;
  updatedAt: string;
}

export interface DashboardCockpitData {
  kpis: DashboardKpi[];
  qualitySummary: {
    qualified: number;
    unqualified: number;
    unmonitored: number;
    passRate: number;
  };
  qualitySummaryByRange: Record<'day' | 'week' | 'month', {
    qualified: number;
    unqualified: number;
    unmonitored: number;
    passRate: number;
  }>;
  qualityDrillDownByRange: Record<'day' | 'week' | 'month', {
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
  }[]>;
  qualityTrend: DashboardTrendPoint[];
  waterVolumeTrend: DashboardTrendPoint[];
  waterVolumeSummary: {
    today: number;
    yesterday: number;
    dayOverDayChangeRate: number;
  };
  sourceStatus: {
    normal: number;
    warning: number;
    risk: number;
    hasDryRisk: boolean;
    notice: string;
  };
  alertCategories: Array<{ name: string; value: number }>;
  alertDrillDown: Array<{
    id: string;
    waterPointName: string;
    villageName: string;
    indicator: string;
    value: string;
    threshold: string;
    level: 'critical' | 'warning';
    status: string;
    triggeredAt: string;
    handledAt?: string;
    handledBy?: string;
    notifyChannels: string[];
    notifiedPersons: string[];
    category: string;
  }>;
  workOrders: {
    pending: number;
    processing: number;
    completed: number;
    completionRate: number;
  };
  workOrdersByRange: Record<'day' | 'week', {
    pending: number;
    processing: number;
    completed: number;
    completionRate: number;
  }>;
  repairTypes: Array<{ name: string; value: number }>;
  pressure: {
    normal: number;
    low: number;
    high: number;
    dates: string[];
    normalSeries: number[];
    lowSeries: number[];
    highSeries: number[];
  };
  realtimeRows: RealtimeMonitorRow[];
}
