import type { DashboardCockpitData } from '../../../types/dashboard';
import { DashboardBarChart } from './DashboardCharts';
import DashboardPanel from './DashboardPanel';

export interface RepairTypePanelProps {
  data: DashboardCockpitData['repairTypes'];
}

export default function RepairTypePanel({ data }: RepairTypePanelProps) {
  const topFive = data
    .map((item) => ({
      name: item.name,
      value: Number.isFinite(item.value) ? Math.max(0, item.value) : 0,
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
  const hasData = topFive.some((item) => item.value > 0);
  const summary = topFive.map((item, index) => `第${index + 1}名${item.name}${item.value}件`).join('，');

  return (
    <DashboardPanel title="维修类型 TOP5" className="dashboard-operation-panel">
      {hasData ? (
        <>
          <DashboardBarChart
            categories={topFive.map((item) => item.name)}
            series={[
              {
                name: '维修工单',
                data: topFive.map((item) => item.value),
                color: 'var(--color-chart-cyan)',
              },
            ]}
            unit="件"
            horizontal
            showLegend={false}
            height={168}
            ariaLabel={`维修类型前五名横向条形图，按工单数量降序排列：${summary}`}
          />
          <p className="dashboard-visually-hidden">维修类型数据摘要：{summary}</p>
        </>
      ) : (
        <div className="dashboard-panel-empty" role="status">
          暂无数据
        </div>
      )}
    </DashboardPanel>
  );
}
