import type { DashboardKpi } from '../../../types/dashboard';
import './DashboardComponents.css';

export interface DashboardKpiBarProps {
  items: DashboardKpi[];
}

export default function DashboardKpiBar({ items }: DashboardKpiBarProps) {
  if (items.length === 0) {
    return (
      <div className="dashboard-kpi-bar-empty glass-card" role="status">
        暂无数据
      </div>
    );
  }

  return (
    <div className="dashboard-kpi-bar" aria-label="核心运营指标">
      {items.map((item) => (
        <article
          key={item.key}
          className={`dashboard-kpi-card dashboard-kpi-card--${item.tone} glass-card`}
        >
          <span className="dashboard-kpi-title">{item.title}</span>
          <div className="dashboard-kpi-value-row">
            <strong className="dashboard-kpi-value">{item.value}</strong>
            {item.unit && <span className="dashboard-kpi-unit">{item.unit}</span>}
          </div>
          <span className="dashboard-kpi-detail">{item.detail}</span>
        </article>
      ))}
    </div>
  );
}
