import type { DashboardCockpitData } from '../../../types/dashboard';
import { DashboardBarChart } from './DashboardCharts';
import DashboardPanel from './DashboardPanel';
import './DashboardComponents.css';

export interface WaterVolumePanelProps {
  data: DashboardCockpitData['waterVolumeTrend'];
  summary: DashboardCockpitData['waterVolumeSummary'];
}

function formatChangeRate(rate: number) {
  if (rate > 0) return `+${rate}%`;
  if (rate < 0) return `${rate}%`;
  return '0%';
}

function getChangeTone(rate: number): 'up' | 'down' | 'flat' {
  if (rate > 0) return 'up';
  if (rate < 0) return 'down';
  return 'flat';
}

export default function WaterVolumePanel({ data, summary }: WaterVolumePanelProps) {
  const trendSummary = data.map((item) => `${item.label}供水量${item.value}吨`).join('，');
  const changeTone = getChangeTone(summary.dayOverDayChangeRate);
  const statsSummary = `今日供水量${summary.today}吨，较昨日${summary.yesterday}吨环比${formatChangeRate(summary.dayOverDayChangeRate)}`;

  return (
    <DashboardPanel title="供水量统计" className="dashboard-analysis-panel">
      <div className="dashboard-water-volume-summary" aria-label={statsSummary}>
        <div className="dashboard-water-volume-stat">
          <span className="dashboard-water-volume-stat-label">今日供水量</span>
          <div className="dashboard-water-volume-stat-value-row">
            <strong className="dashboard-water-volume-stat-value">{summary.today}</strong>
            <span className="dashboard-water-volume-stat-unit">吨</span>
          </div>
        </div>
        <div className="dashboard-water-volume-stat">
          <span className="dashboard-water-volume-stat-label">环比变化率</span>
          <div className="dashboard-water-volume-stat-value-row">
            <strong
              className={`dashboard-water-volume-change dashboard-water-volume-change--${changeTone}`}
            >
              {formatChangeRate(summary.dayOverDayChangeRate)}
            </strong>
          </div>
          <span className="dashboard-water-volume-stat-detail">较昨日 {summary.yesterday} 吨</span>
        </div>
      </div>
      <DashboardBarChart
        categories={data.map((item) => item.label)}
        series={[
          {
            name: '供水量',
            data: data.map((item) => item.value),
            color: 'var(--color-chart-blue)',
          },
        ]}
        unit="吨"
        showLegend={false}
        height={168}
        ariaLabel={`最近七日供水量统计柱状图，单位为吨；${statsSummary}${trendSummary ? `；${trendSummary}` : ''}`}
      />
      <p className="dashboard-visually-hidden">供水量摘要：{statsSummary}；七日数据：{trendSummary}</p>
    </DashboardPanel>
  );
}
