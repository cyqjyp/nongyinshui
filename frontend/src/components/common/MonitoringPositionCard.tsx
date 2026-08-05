import { useState } from 'react';
import type { SourceWaterMetric, FinishedWaterMetric } from '../../types';
import { metricTrendData, type MetricTrendData } from '../../mock/waterQuality';
import MetricTrendModal from './MetricTrendModal';
import './MonitoringPositionCard.css';

export interface MonitoringPositionCardProps {
  position: 'source' | 'finished' | 'terminal';
  label: string;
  metrics: SourceWaterMetric[] | FinishedWaterMetric[];
  updatedAt: string;
}

function MetricItem({
  metric,
  onTrendClick,
}: {
  metric: SourceWaterMetric | FinishedWaterMetric;
  position: 'source' | 'finished' | 'terminal';
  onTrendClick: (metric: SourceWaterMetric | FinishedWaterMetric) => void;
}) {
  const isNormal = metric.isQualified;

  return (
    <div className="mpc-metric-item" onClick={() => onTrendClick(metric)} role="button" tabIndex={0}>
      <div className="mpc-metric-header">
        <span className="mpc-metric-label">{metric.label}</span>
        <span className={`mpc-metric-status ${isNormal ? 'normal' : 'warning'}`}>
          {isNormal ? '正常' : '异常'}
        </span>
      </div>
      <div className="mpc-metric-value-row">
        <span className="mpc-metric-value">{metric.value}</span>
        {metric.unit && <span className="mpc-metric-unit">{metric.unit}</span>}
      </div>
      <div className="mpc-metric-limit">{metric.limit}</div>
    </div>
  );
}

export default function MonitoringPositionCard({ position, label, metrics, updatedAt }: MonitoringPositionCardProps) {
  const allNormal = metrics.every((m) => m.isQualified);
  const [trendModalOpen, setTrendModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricTrendData | null>(null);

  const handleTrendClick = (metric: SourceWaterMetric | FinishedWaterMetric) => {
    const trend = metricTrendData[position]?.[metric.label];
    if (trend) {
      setSelectedMetric(trend);
      setTrendModalOpen(true);
    }
  };

  return (
    <>
      <div className={`monitoring-position-card ${allNormal ? 'normal' : 'has-warning'}`}>
        <div className="mpc-header">
          <h3 className="mpc-title">{label}</h3>
          <span className="mpc-update-time">
            更新于 {new Date(updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="mpc-metrics-grid">
          {metrics.map((metric) => (
            <MetricItem key={metric.label} metric={metric} position={position} onTrendClick={handleTrendClick} />
          ))}
        </div>
      </div>

      <MetricTrendModal
        open={trendModalOpen}
        positionLabel={label}
        metric={selectedMetric}
        onClose={() => setTrendModalOpen(false)}
      />
    </>
  );
}
