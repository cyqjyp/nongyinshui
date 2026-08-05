import { useEffect, useMemo, useState } from 'react';
import type { AlertEvent, Village, WaterPoint } from '../../../types';
import AlertDetailModal from './AlertDetailModal';
import './DashboardComponents.css';

export interface LatestAlertsPanelProps {
  alerts: AlertEvent[];
  waterPoints: WaterPoint[];
  villages: Village[];
}

const ROTATE_INTERVAL_MS = 4000;

const formatAlertTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getTimestamp = (value: string) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default function LatestAlertsPanel({
  alerts,
  waterPoints,
  villages,
}: LatestAlertsPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const waterPointNames = useMemo(
    () => new Map(waterPoints.map((waterPoint) => [waterPoint.id, waterPoint.name])),
    [waterPoints],
  );
  const villageNames = useMemo(
    () => new Map(villages.map((village) => [village.id, village.name])),
    [villages],
  );

  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort((left, right) => {
        const pendingDifference =
          Number(right.status === '待处理') - Number(left.status === '待处理');

        return pendingDifference || getTimestamp(right.triggeredAt) - getTimestamp(left.triggeredAt);
      }),
    [alerts],
  );

  useEffect(() => {
    setActiveIndex(0);
    setDetailOpen(false);
  }, [sortedAlerts.length]);

  useEffect(() => {
    if (sortedAlerts.length <= 1 || paused || detailOpen) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % sortedAlerts.length);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [sortedAlerts.length, paused, detailOpen]);

  if (sortedAlerts.length === 0) {
    return (
      <section className="dashboard-alert-ticker glass-card" aria-label="最新告警">
        <div className="dashboard-alert-ticker-label">最新告警</div>
        <div className="dashboard-alert-ticker-empty" role="status">
          暂无告警
        </div>
      </section>
    );
  }

  const alert = sortedAlerts[Math.min(activeIndex, sortedAlerts.length - 1)];
  const waterPointName = waterPointNames.get(alert.waterPointId) ?? '未关联供水点';
  const villageName = villageNames.get(alert.villageId) ?? '未关联村庄';
  const pending = alert.status === '待处理';
  const formattedTime = formatAlertTime(alert.triggeredAt);
  const levelLabel = alert.level === 'critical' ? '严重' : '预警';

  const openDetail = () => setDetailOpen(true);

  return (
    <>
      <section
        className="dashboard-alert-ticker glass-card"
        aria-label="最新告警"
        aria-live="polite"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div className="dashboard-alert-ticker-label">最新告警</div>
        <button
          type="button"
          className="dashboard-alert-ticker-item dashboard-alert-ticker-item--clickable"
          onClick={openDetail}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openDetail();
            }
          }}
          aria-label={`查看告警详情：${alert.indicator || '未知告警'}，${waterPointName}，${villageName}，${alert.status}`}
        >
          <span className={`dashboard-latest-alert-level dashboard-latest-alert-level--${alert.level}`}>
            {levelLabel}
          </span>
          <div className="dashboard-latest-alert-content">
            <strong className="dashboard-latest-alert-type">{alert.indicator || '未知告警'}</strong>
            <span className="dashboard-latest-alert-location">
              {waterPointName} · {villageName}
            </span>
          </div>
          {formattedTime === null ? (
            <span className="dashboard-latest-alert-time">时间未知</span>
          ) : (
            <time className="dashboard-latest-alert-time" dateTime={alert.triggeredAt}>
              {formattedTime}
            </time>
          )}
          <span
            className={`dashboard-latest-alert-status dashboard-latest-alert-status--${pending ? 'pending' : 'handled'}`}
          >
            {alert.status}
          </span>
        </button>
        {sortedAlerts.length > 1 ? (
          <div className="dashboard-alert-ticker-meta text-label-sm" aria-hidden="true">
            {activeIndex + 1}/{sortedAlerts.length}
          </div>
        ) : null}
      </section>

      <AlertDetailModal
        open={detailOpen}
        alert={alert}
        waterPointName={waterPointName}
        villageName={villageName}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
