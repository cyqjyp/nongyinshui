import { useState, useMemo } from 'react';
import { Segmented, Modal, Table, Tag, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { DashboardCockpitData } from '../../../types/dashboard';
import { DashboardDonutChart } from './DashboardCharts';
import DashboardPanel from './DashboardPanel';
import './QualityCompliancePanel.css';

export interface QualityCompliancePanelProps {
  data: DashboardCockpitData['qualitySummary'];
  dataByRange: DashboardCockpitData['qualitySummaryByRange'];
  drillDownData: DashboardCockpitData['qualityDrillDownByRange'];
}

const COMPLIANCE_ITEMS = [
  { key: 'qualified', label: '达标', tone: 'normal' },
  { key: 'unqualified', label: '不达标', tone: 'risk' },
  { key: 'unmonitored', label: '未监测', tone: 'muted' },
] as const;

const RANGE_OPTIONS = [
  { label: '当日', value: 'day' },
  { label: '近七日', value: 'week' },
] as const;

type RangeKey = 'day' | 'week';
type CategoryKey = 'qualified' | 'unqualified' | 'unmonitored';

export default function QualityCompliancePanel({ dataByRange, drillDownData }: QualityCompliancePanelProps) {
  const [range, setRange] = useState<RangeKey>('day');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('qualified');
  const [selectedWaterPoint, setSelectedWaterPoint] = useState<string | null>(null);

  const current = dataByRange[range];
  const currentDrillDown = drillDownData[range];

  const chartData = COMPLIANCE_ITEMS.map((item) => ({
    name: item.label,
    value: current[item.key],
  }));
  const hasData = chartData.some((item) => item.value > 0);

  const filteredRows = useMemo(() => {
    return currentDrillDown
      .filter((row) => row.category === selectedCategory)
      .sort((a, b) => a.passRate - b.passRate);
  }, [currentDrillDown, selectedCategory]);

  const handleItemClick = (category: CategoryKey) => {
    setSelectedCategory(category);
    setSelectedWaterPoint(null);
    setModalOpen(true);
  };

  const handleWaterPointClick = (waterPointId: string) => {
    setSelectedWaterPoint(waterPointId);
  };

  const selectedPointData = useMemo(() => {
    if (!selectedWaterPoint) return null;
    return currentDrillDown.find((row) => row.waterPointId === selectedWaterPoint);
  }, [currentDrillDown, selectedWaterPoint]);

  const modalTitle = selectedPointData
    ? `${selectedPointData.waterPointName} - 水质详情`
    : `${COMPLIANCE_ITEMS.find((i) => i.key === selectedCategory)?.label}供水点列表`;

  const ariaLabel = `水质达标率环形图：已监测达标${current.qualified}处，已监测不达标${current.unqualified}处，未监测${current.unmonitored}处，已监测达标率${current.passRate}%`;

  return (
    <>
      <DashboardPanel
        title="水质达标率"
        className="dashboard-analysis-panel"
        extra={
          <div className="quality-range-segmented">
            <Segmented
              size="small"
              options={[...RANGE_OPTIONS]}
              value={range}
              onChange={(v) => setRange(v as RangeKey)}
            />
          </div>
        }
      >
        <DashboardDonutChart
          data={chartData}
          colors={[
            'var(--color-status-running)',
            'var(--color-status-fault)',
            'var(--color-status-stopped)',
          ]}
          centerText={`${current.passRate}%`}
          centerSubtext="已监测达标率"
          showLegend={false}
          showLabels={false}
          height={168}
          ariaLabel={ariaLabel}
        />
        {hasData && (
          <ul className="dashboard-compliance-list" aria-label="水质监测数量">
            {COMPLIANCE_ITEMS.map((item) => (
              <li
                key={item.key}
                className={`dashboard-compliance-item dashboard-status--${item.tone}`}
                onClick={() => handleItemClick(item.key)}
                style={{ cursor: 'pointer' }}
                title={`点击查看${item.label}供水点详情`}
              >
                <span className="dashboard-compliance-label">
                  <span className="dashboard-status-dot" aria-hidden="true" />
                  {item.label}
                </span>
                <strong>{current[item.key]}</strong>
              </li>
            ))}
          </ul>
        )}
      </DashboardPanel>

      <Modal
        title={modalTitle}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedWaterPoint(null);
        }}
        footer={null}
        width={720}
        centered
      >
        {selectedPointData ? (
          <div className="quality-drilldown-detail">
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setSelectedWaterPoint(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                }}
              >
                ← 返回列表
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, marginBottom: 4 }}>所属村庄</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{selectedPointData.villageName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, marginBottom: 4 }}>达标率</div>
                <Tag color={selectedPointData.passRate >= 90 ? 'success' : selectedPointData.passRate >= 60 ? 'warning' : 'error'}>
                  {selectedPointData.passRate}%
                </Tag>
              </div>
              <div>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, marginBottom: 4 }}>达标次数</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-status-running)' }}>{selectedPointData.qualified}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, marginBottom: 4 }}>不达标次数</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-status-fault)' }}>{selectedPointData.unqualified}</div>
              </div>
            </div>
            {selectedPointData.mainIssue && (
              <div style={{ padding: 10, background: 'var(--color-surface-card)', borderRadius: 6, marginBottom: 20 }}>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, marginBottom: 4 }}>主要问题</div>
                <div style={{ fontSize: 14, color: 'var(--color-status-fault)' }}>{selectedPointData.mainIssue}</div>
              </div>
            )}
            {selectedPointData.trendData && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>指标趋势</div>
                <ReactECharts
                  option={{
                    backgroundColor: 'transparent',
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['浑浊度', '余氯', 'pH'], textStyle: { color: '#999' }, bottom: 0 },
                    grid: { left: 40, right: 20, top: 20, bottom: 40 },
                    xAxis: {
                      type: 'category',
                      data: selectedPointData.trendData.timestamps.map((t) => {
                        const d = new Date(t);
                        return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00`;
                      }),
                      axisLine: { lineStyle: { color: '#444' } },
                      axisLabel: { color: '#999', fontSize: 10, rotate: 45 },
                    },
                    yAxis: [
                      { type: 'value', name: '浑浊度/余氯', axisLine: { lineStyle: { color: '#444' } }, axisLabel: { color: '#999' }, splitLine: { lineStyle: { color: '#333' } } },
                      { type: 'value', name: 'pH', axisLine: { lineStyle: { color: '#444' } }, axisLabel: { color: '#999' }, splitLine: { show: false } },
                    ],
                    series: [
                      { name: '浑浊度', type: 'line', data: selectedPointData.trendData.turbidity, smooth: true, symbol: 'none', lineStyle: { color: '#13c2c2' } },
                      { name: '余氯', type: 'line', data: selectedPointData.trendData.chlorine, smooth: true, symbol: 'none', lineStyle: { color: '#52c41a' } },
                      { name: 'pH', type: 'line', yAxisIndex: 1, data: selectedPointData.trendData.ph, smooth: true, symbol: 'none', lineStyle: { color: '#faad14' } },
                    ],
                  }}
                  style={{ height: 260 }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            )}
          </div>
        ) : (
          <Table
            size="small"
            rowKey="waterPointId"
            dataSource={filteredRows}
            pagination={false}
            locale={{ emptyText: <Empty description="暂无数据" /> }}
            columns={[
              {
                title: '供水点',
                dataIndex: 'waterPointName',
                render: (name: string, record) => (
                  <a onClick={() => handleWaterPointClick(record.waterPointId)} style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>
                    {name}
                  </a>
                ),
              },
              { title: '所属村庄', dataIndex: 'villageName' },
              {
                title: '达标次数',
                dataIndex: 'qualified',
                render: (v: number) => <span style={{ color: 'var(--color-status-running)' }}>{v}</span>,
              },
              {
                title: '不达标次数',
                dataIndex: 'unqualified',
                render: (v: number) => <span style={{ color: 'var(--color-status-fault)' }}>{v}</span>,
              },
              {
                title: '达标率',
                dataIndex: 'passRate',
                render: (v: number) => (
                  <Tag color={v >= 90 ? 'success' : v >= 60 ? 'warning' : 'error'}>{v}%</Tag>
                ),
              },
              {
                title: '主要问题',
                dataIndex: 'mainIssue',
                render: (v: string) => v || '-',
              },
            ]}
          />
        )}
      </Modal>
    </>
  );
}
