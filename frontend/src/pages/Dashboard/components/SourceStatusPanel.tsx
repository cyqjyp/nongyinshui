import { useState } from 'react';
import type { DashboardCockpitData } from '../../../types/dashboard';
import type { WaterPoint } from '../../../types';
import DashboardPanel from './DashboardPanel';
import SourceDrillDownModal from './SourceDrillDownModal';
import SourceDetailModal from './SourceDetailModal';
import { waterPoints } from '../../../mock/waterPoints';

export interface SourceStatusPanelProps {
  data: DashboardCockpitData['sourceStatus'];
}

export default function SourceStatusPanel({ data }: SourceStatusPanelProps) {
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownData, setDrillDownData] = useState<WaterPoint[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPoint, setDetailPoint] = useState<WaterPoint | null>(null);

  const hasData = data.breakdown && data.breakdown.length > 0;
  const total = data.normal + data.warning + data.risk;

  const handleTypeClick = (type: string) => {
    const filtered = waterPoints.filter((wp) => wp.sourceType === type);
    setDrillDownTitle(`${type}水源地列表`);
    setDrillDownData(filtered);
    setDrillDownOpen(true);
  };

  const handleStatusClick = (type: string, status: string) => {
    const filtered = waterPoints.filter(
      (wp) => wp.sourceType === type && wp.status === status,
    );
    const statusText = status === 'running' ? '正常' : status === 'warning' ? '预警' : '风险';
    setDrillDownTitle(`${type} - ${statusText}水源地`);
    setDrillDownData(filtered);
    setDrillDownOpen(true);
  };

  const handleViewDetail = (point: WaterPoint) => {
    setDetailPoint(point);
    setDetailOpen(true);
    setDrillDownOpen(false);
  };

  if (!hasData) {
    return (
      <DashboardPanel title="水源状况" className="dashboard-analysis-panel">
        <div className="dashboard-panel-empty" role="status">
          暂无数据
        </div>
      </DashboardPanel>
    );
  }

  return (
    <>
      <DashboardPanel title="水源状况" className="dashboard-analysis-panel">
        <div className="source-status-list">
          {data.breakdown.map((item) => (
            <div
              key={item.type}
              className="source-status-row"
              onClick={() => handleTypeClick(item.type)}
              style={{ cursor: 'pointer' }}
            >
              <span className="source-type-label">{item.type}</span>
              <span className="source-total">{item.total}处</span>
              <span className="source-status-badges">
                {item.normal > 0 && (
                  <span
                    className="badge badge-normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusClick(item.type, 'running');
                    }}
                  >
                    <span className="badge-dot dot-normal" />
                    {item.normal}
                  </span>
                )}
                {item.warning > 0 && (
                  <span
                    className="badge badge-warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusClick(item.type, 'warning');
                    }}
                  >
                    <span className="badge-dot dot-warning" />
                    {item.warning}
                  </span>
                )}
                {item.risk > 0 && (
                  <span
                    className="badge badge-risk"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusClick(item.type, 'fault');
                    }}
                  >
                    <span className="badge-dot dot-risk" />
                    {item.risk}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="source-status-summary">
          <span className="summary-total">合计 {total}处</span>
          <span className="summary-item summary-normal">正常 {data.normal}</span>
          <span className="summary-item summary-warning">预警 {data.warning}</span>
          <span className="summary-item summary-risk">风险 {data.risk}</span>
        </div>
        {data.hasDryRisk && (
          <p className="dashboard-source-notice dashboard-source-notice--warning">
            <span className="dashboard-source-notice-label">水源提示</span>
            {data.notice}
          </p>
        )}
      </DashboardPanel>

      <SourceDrillDownModal
        open={drillDownOpen}
        title={drillDownTitle}
        data={drillDownData}
        onClose={() => setDrillDownOpen(false)}
        onViewDetail={handleViewDetail}
      />

      <SourceDetailModal
        open={detailOpen}
        point={detailPoint}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
