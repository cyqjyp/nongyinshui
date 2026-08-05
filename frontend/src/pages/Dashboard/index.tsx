import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert as AntAlert, Button, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { fetchDashboardCockpit } from '../../services/dashboardService';
import { fetchAlerts } from '../../services/waterQualityService';
import { fetchVillages, fetchWaterPoints } from '../../services/waterPointService';
import type { AlertEvent, Village, WaterPoint } from '../../types';
import type { DashboardCockpitData } from '../../types/dashboard';
import AlertStatsPanel from './components/AlertStatsPanel';
import DashboardKpiBar from './components/DashboardKpiBar';
import EngineeringMap2D from './components/EngineeringMap2D';
import LatestAlertsPanel from './components/LatestAlertsPanel';
import PressurePanel from './components/PressurePanel';
import QualityCompliancePanel from './components/QualityCompliancePanel';
import QualityTrendPanel from './components/QualityTrendPanel';
import RealtimeMonitorTable from './components/RealtimeMonitorTable';
import RepairTypePanel from './components/RepairTypePanel';
import SourceStatusPanel from './components/SourceStatusPanel';
import WaterVolumePanel from './components/WaterVolumePanel';
import WorkOrderPanel from './components/WorkOrderPanel';
import './Dashboard.css';

export default function DashboardPage() {
  const [cockpit, setCockpit] = useState<DashboardCockpitData | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);
  const mountedRef = useRef(false);

  const loadDashboard = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const [cockpitData, alertList, villageList, waterPointList] = await Promise.all([
        fetchDashboardCockpit(),
        fetchAlerts(),
        fetchVillages(),
        fetchWaterPoints(),
      ]);
      if (!mountedRef.current || requestSequence !== requestSequenceRef.current) return;

      setCockpit(cockpitData);
      setAlerts(alertList);
      setVillages(villageList);
      setWaterPoints(waterPointList);
    } catch (reason) {
      if (!mountedRef.current || requestSequence !== requestSequenceRef.current) return;
      setError(reason instanceof Error ? reason.message : '驾驶舱数据加载失败，请稍后重试。');
    } finally {
      if (mountedRef.current && requestSequence === requestSequenceRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadDashboard();

    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <span className="text-label-sm" style={{ marginTop: 12 }}>
          正在加载运营数据...
        </span>
      </div>
    );
  }

  if (error || !cockpit) {
    return (
      <div className="dashboard-error" role="alert">
        <AntAlert
          type="error"
          showIcon
          title="运营驾驶舱加载失败"
          description={error ?? '未能获取驾驶舱数据，请重试。'}
          action={
            <Button type="primary" icon={<ReloadOutlined />} onClick={() => void loadDashboard()}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <LatestAlertsPanel alerts={alerts} waterPoints={waterPoints} villages={villages} />
      <DashboardKpiBar items={cockpit.kpis} />

      <div className="cockpit-main-grid">
        <aside className="cockpit-column cockpit-left-column" aria-label="水质与供水分析">
          <QualityCompliancePanel data={cockpit.qualitySummary} dataByRange={cockpit.qualitySummaryByRange} drillDownData={cockpit.qualityDrillDownByRange} />
          <QualityTrendPanel data={cockpit.qualityTrend} />
          <WaterVolumePanel
            data={cockpit.waterVolumeTrend}
            summary={cockpit.waterVolumeSummary}
          />
          <SourceStatusPanel data={cockpit.sourceStatus} />
        </aside>

        <main className="cockpit-column cockpit-center-column">
          <EngineeringMap2D villages={villages} waterPoints={waterPoints} />
          <RealtimeMonitorTable rows={cockpit.realtimeRows} />
        </main>

        <aside className="cockpit-column cockpit-right-column" aria-label="告警与运维分析">
          <AlertStatsPanel data={cockpit.alertCategories} drillDownData={cockpit.alertDrillDown} />
          <WorkOrderPanel data={cockpit.workOrders} dataByRange={cockpit.workOrdersByRange} />
          <RepairTypePanel data={cockpit.repairTypes} />
          <PressurePanel data={cockpit.pressure} />
        </aside>
      </div>
    </div>
  );
}
