import type { DashboardCockpitData } from '../../../types/dashboard';
import { DashboardLineChart } from './DashboardCharts';
import DashboardPanel from './DashboardPanel';

export interface QualityTrendPanelProps {
  data: DashboardCockpitData['qualityTrend'];
}

function getQualityRange(data: DashboardCockpitData['qualityTrend']) {
  if (data.length === 0) return {};

  const values = data.map((item) => item.value);
  return {
    yMin: Math.max(0, Math.floor(Math.min(...values) - 5)),
    yMax: Math.min(100, Math.ceil(Math.max(...values) + 5)),
  };
}

export default function QualityTrendPanel({ data }: QualityTrendPanelProps) {
  const range = getQualityRange(data);
  const summary = data.map((item) => `${item.label}已监测达标率${item.value}%`).join('，');

  return (
    <DashboardPanel title="已监测水质达标率趋势" className="dashboard-analysis-panel">
      <DashboardLineChart
        categories={data.map((item) => item.label)}
        series={[
          {
            name: '达标率',
            data: data.map((item) => item.value),
            color: 'var(--color-chart-cyan)',
            area: true,
          },
        ]}
        unit="%"
        yMin={range.yMin}
        yMax={range.yMax}
        showLegend={false}
        height={168}
        ariaLabel={`最近七日已监测水质达标率趋势折线图${summary ? `：${summary}` : ''}`}
      />
      {summary && <p className="dashboard-visually-hidden">七日数据摘要：{summary}</p>}
    </DashboardPanel>
  );
}
