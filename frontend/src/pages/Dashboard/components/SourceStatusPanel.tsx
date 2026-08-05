import type { DashboardCockpitData } from '../../../types/dashboard';
import DashboardPanel from './DashboardPanel';

export interface SourceStatusPanelProps {
  data: DashboardCockpitData['sourceStatus'];
}

const SOURCE_STATUS_ITEMS = [
  { key: 'normal', label: '正常水源', tone: 'normal' },
  { key: 'warning', label: '预警水源', tone: 'warning' },
  { key: 'risk', label: '风险水源', tone: 'risk' },
] as const;

export default function SourceStatusPanel({ data }: SourceStatusPanelProps) {
  const hasData = SOURCE_STATUS_ITEMS.some((item) => data[item.key] > 0) || data.hasDryRisk;
  const summary = `正常水源${data.normal}处，预警水源${data.warning}处，风险水源${data.risk}处；${data.notice}`;

  return (
    <DashboardPanel title="水源状况" className="dashboard-analysis-panel">
      {hasData ? (
        <>
          <ul className="dashboard-source-status-list" aria-label={`供水点水源状况数量：${summary}`}>
            {SOURCE_STATUS_ITEMS.map((item) => (
              <li
                key={item.key}
                className={`dashboard-source-status-item dashboard-status--${item.tone}`}
              >
                <span className="dashboard-source-status-label">
                  <span className="dashboard-status-dot" aria-hidden="true" />
                  {item.label}
                </span>
                <strong>{data[item.key]}</strong>
              </li>
            ))}
          </ul>
          <p
            className={`dashboard-source-notice ${
              data.hasDryRisk ? 'dashboard-source-notice--warning' : ''
            }`}
          >
            <span className="dashboard-source-notice-label">水源提示</span>
            {data.notice}
          </p>
          <p className="dashboard-visually-hidden">水源状况摘要：{summary}</p>
        </>
      ) : (
        <div className="dashboard-panel-empty" role="status">
          暂无数据
        </div>
      )}
    </DashboardPanel>
  );
}
