import { useState, useMemo } from 'react';
import { Modal, Table, Tag, Empty } from 'antd';
import type { DashboardCockpitData } from '../../../types/dashboard';
import { DashboardDonutChart } from './DashboardCharts';
import DashboardPanel from './DashboardPanel';
import AlertDetailModal from './AlertDetailModal';
import './DashboardComponents.css';

export interface AlertStatsPanelProps {
  data: DashboardCockpitData['alertCategories'];
  drillDownData: DashboardCockpitData['alertDrillDown'];
}

const ALERT_COLORS = [
  'var(--color-status-fault)',
  'var(--color-status-warning)',
  'var(--color-chart-cyan)',
  'var(--color-chart-blue)',
  'var(--color-status-stopped)',
];

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function AlertStatsPanel({ data, drillDownData }: AlertStatsPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<DashboardCockpitData['alertDrillDown'][number] | null>(null);

  const categories = data.map((item) => ({
    name: item.name,
    value: Number.isFinite(item.value) ? Math.max(0, item.value) : 0,
  }));
  const total = categories.reduce((sum, item) => sum + item.value, 0);

  const filteredAlerts = useMemo(() => {
    if (!selectedCategory) return drillDownData;
    return drillDownData.filter((a) => a.category === selectedCategory);
  }, [drillDownData, selectedCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setModalOpen(true);
  };

  const handleAlertClick = (alert: DashboardCockpitData['alertDrillDown'][number]) => {
    setSelectedAlert(alert);
    setDetailOpen(true);
  };

  const handleLegendClick = (params: { name: string }) => {
    handleCategoryClick(params.name);
  };

  return (
    <>
      <DashboardPanel
        title="告警统计"
        className="dashboard-operation-panel"
        extra={<span aria-hidden="true">近7日 {total}条</span>}
      >
        <div style={{ cursor: 'pointer' }} onClick={() => handleCategoryClick('')}>
          <DashboardDonutChart
            data={categories}
            colors={ALERT_COLORS}
            centerText={`${total}`}
            centerSubtext="近7日告警"
            unit="条"
            showLegend
            showLabels={false}
            height={168}
            ariaLabel="最近七日告警分类环形图"
            onLegendClick={handleLegendClick}
            onChartClick={(params: { name?: string }) => {
              if (params.name) handleCategoryClick(params.name);
            }}
          />
        </div>
      </DashboardPanel>

      <Modal
        title={selectedCategory ? `${selectedCategory}类告警列表` : '全部告警列表'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedCategory('');
        }}
        footer={null}
        width={800}
        centered
      >
        <Table
          size="small"
          rowKey="id"
          dataSource={filteredAlerts}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无数据" /> }}
          columns={[
            {
              title: '告警时间',
              dataIndex: 'triggeredAt',
              render: (v: string) => formatDateTime(v),
              width: 150,
            },
            {
              title: '所属村庄',
              dataIndex: 'villageName',
              width: 100,
            },
            {
              title: '供水点',
              dataIndex: 'waterPointName',
              width: 120,
            },
            {
              title: '告警指标',
              dataIndex: 'indicator',
              width: 100,
            },
            {
              title: '监测数值',
              dataIndex: 'value',
              width: 100,
            },
            {
              title: '标准阈值',
              dataIndex: 'threshold',
              width: 100,
            },
            {
              title: '级别',
              dataIndex: 'level',
              width: 70,
              render: (v: string) => (
                <Tag color={v === 'critical' ? 'error' : 'warning'}>
                  {v === 'critical' ? '严重' : '预警'}
                </Tag>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 80,
              render: (v: string) => (
                <Tag color={v === '待处理' ? 'error' : 'success'}>{v}</Tag>
              ),
            },
            {
              title: '操作',
              width: 70,
              render: (_: unknown, record: DashboardCockpitData['alertDrillDown'][number]) => (
                <a
                  onClick={() => handleAlertClick(record)}
                  style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
                >
                  详情
                </a>
              ),
            },
          ]}
        />
      </Modal>

      {selectedAlert && (
        <AlertDetailModal
          open={detailOpen}
          alert={{
            id: selectedAlert.id,
            waterPointId: '',
            villageId: '',
            indicator: selectedAlert.indicator,
            value: parseFloat(selectedAlert.value) || 0,
            unit: selectedAlert.value.replace(/[\d.]/g, ''),
            threshold: selectedAlert.threshold,
            level: selectedAlert.level,
            status: selectedAlert.status as '待处理' | '已处理',
            triggeredAt: selectedAlert.triggeredAt,
            handledAt: selectedAlert.handledAt,
            handledBy: selectedAlert.handledBy,
            notifyChannels: selectedAlert.notifyChannels as Array<'系统预警' | '短信'>,
            notifiedPersons: selectedAlert.notifiedPersons,
          }}
          waterPointName={selectedAlert.waterPointName}
          villageName={selectedAlert.villageName}
          onClose={() => {
            setDetailOpen(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </>
  );
}
