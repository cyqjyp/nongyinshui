import type { DashboardCockpitData } from '../../../types/dashboard';
import { DashboardLineChart } from './DashboardCharts';
import DashboardPanel from './DashboardPanel';
import './DashboardComponents.css';

export interface PressurePanelProps {
  data: DashboardCockpitData['pressure'];
}

const PRESSURE_ITEMS = [
  { key: 'normal', label: '正常', tone: 'normal' },
  { key: 'low', label: '低压', tone: 'warning' },
  { key: 'high', label: '高压', tone: 'risk' },
] as const;

function hasValidTrend(data: DashboardCockpitData['pressure']) {
  const series = [data.normalSeries, data.lowSeries, data.highSeries];
  return (
    data.dates.length > 0 &&
    series.every(
      (values) => values.length === data.dates.length && values.every((value) => Number.isFinite(value)),
    )
  );
}

export default function PressurePanel({ data }: PressurePanelProps) {
  const counts = {
    normal: Number.isFinite(data.normal) ? Math.max(0, data.normal) : 0,
    low: Number.isFinite(data.low) ? Math.max(0, data.low) : 0,
    high: Number.isFinite(data.high) ? Math.max(0, data.high) : 0,
  };
  const trendIsValid = hasValidTrend(data);
  const total = counts.normal + counts.low + counts.high;
  const trendSummary = (trendIsValid ? data.dates : [])
    .map(
      (date, index) =>
        `${date}正常${data.normalSeries[index]}处、低压${data.lowSeries[index]}处、高压${data.highSeries[index]}处`,
    )
    .join('，');
  const countSummary =
    total === 0
      ? '当前无有效压力监测点'
      : `当前正常${counts.normal}处，低压${counts.low}处，高压${counts.high}处`;

  return (
    <DashboardPanel title="管网压力监测" className="dashboard-operation-panel">
      <ul className="dashboard-pressure-status-list" aria-label={`管网压力监测点数量：${countSummary}`}>
        {PRESSURE_ITEMS.map((item) => (
          <li
            key={item.key}
            className={`dashboard-pressure-status-item dashboard-status--${item.tone}`}
          >
            <span className="dashboard-pressure-status-label">
              <span className="dashboard-status-dot" aria-hidden="true" />
              {item.label}
            </span>
            <strong>{counts[item.key]}</strong>
          </li>
        ))}
      </ul>
      <DashboardLineChart
        categories={trendIsValid ? data.dates : []}
        series={[
          {
            name: '正常',
            data: trendIsValid ? data.normalSeries : [],
            color: 'var(--color-status-running)',
          },
          {
            name: '低压',
            data: trendIsValid ? data.lowSeries : [],
            color: 'var(--color-status-warning)',
          },
          {
            name: '高压',
            data: trendIsValid ? data.highSeries : [],
            color: 'var(--color-status-fault)',
          },
        ]}
        unit="处"
        showLegend
        height={168}
        ariaLabel={`最近七日管网压力监测趋势折线图：${countSummary}${
          trendSummary ? `；七日数据为${trendSummary}` : ''
        }`}
      />
      <p className="dashboard-visually-hidden">
        压力数据摘要：{countSummary}
        {trendSummary ? `；${trendSummary}` : ''}
      </p>
    </DashboardPanel>
  );
}
