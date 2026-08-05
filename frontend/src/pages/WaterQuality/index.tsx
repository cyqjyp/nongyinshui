import { useEffect, useMemo, useState } from 'react';
import { Row, Col, Select, Table, Tag, Button, message, Modal, Tabs, Card } from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  FileTextOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import SectionTitle from '../../components/common/SectionTitle';
import MonitoringPositionCard from '../../components/common/MonitoringPositionCard';
import LabRecordFormModal from './LabRecordFormModal';
import { fetchWaterPoints } from '../../services/waterPointService';
import {
  fetchOnlineSeries,
  fetchLabRecords,
  fetchAlerts,
  markAlertHandled,
} from '../../services/waterQualityService';
import { monitoringPositions } from '../../mock/waterQuality';
import type { AlertEvent, LabWaterQualityRecord, OnlineWaterQualityRecord, WaterPoint } from '../../types';
import './WaterQuality.css';

export default function WaterQualityPage() {
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [, setOnlineSeries] = useState<OnlineWaterQualityRecord[]>([]);
  const [labRecords, setLabRecords] = useState<LabWaterQualityRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('online');

  useEffect(() => {
    fetchWaterPoints().then((points) => {
      setWaterPoints(points);
      setSelectedId(points[0]?.id ?? '');
    });
  }, []);

  const reload = (id: string) => {
    if (!id) return;
    fetchOnlineSeries(id).then(setOnlineSeries);
    fetchLabRecords(id).then(setLabRecords);
    fetchAlerts(id).then(setAlerts);
  };

  useEffect(() => {
    reload(selectedId);
  }, [selectedId]);

  const handleMarkHandled = async (alertId: string) => {
    await markAlertHandled(alertId, '公司管理人员-李峰');
    message.success('已标记为已处理');
    reload(selectedId);
  };

  const selectedPoint = waterPoints.find((wp) => wp.id === selectedId);

  const tabItems = [
    {
      key: 'online',
      label: (
        <span>
          <LineChartOutlined />
          在线水质监测
        </span>
      ),
      children: (
        <div className="wq-tab-content">
          {selectedPoint && (
            <>
              {/* 三个监测位置卡片 */}
              <div className="wq-section-label text-label-sm">
                <LineChartOutlined style={{ marginRight: 6 }} />
                在线自动监测
              </div>
              <Row gutter={[16, 16]}>
                {Object.values(monitoringPositions).map((pos) => (
                  <Col xs={24} md={8} key={pos.position}>
                    <MonitoringPositionCard
                      position={pos.position}
                      label={pos.label}
                      metrics={pos.metrics}
                      updatedAt={pos.updatedAt}
                    />
                  </Col>
                ))}
              </Row>

              {/* 送检记录 */}
              <div className="wq-section-label text-label-sm wq-section-label-spaced">
                <FileTextOutlined style={{ marginRight: 6 }} />
                第三方送检记录
              </div>
              <div className="glass-card wq-table-card">
                <div className="infra-toolbar">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setLabModalOpen(true)}>
                    登记送检报告
                  </Button>
                </div>
                <Table
                  size="small"
                  rowKey="id"
                  pagination={false}
                  dataSource={labRecords}
                  columns={[
                    { title: '检测日期', dataIndex: 'testDate' },
                    { title: '检测机构', dataIndex: 'institution' },
                    { title: '菌落总数(CFU/mL)', dataIndex: 'bacteriaCount' },
                    {
                      title: '总大肠菌群',
                      dataIndex: 'coliformDetected',
                      render: (v: boolean) => (v ? <Tag color="error">检出</Tag> : <Tag color="success">未检出</Tag>),
                    },
                    { title: '浑浊度(NTU)', dataIndex: 'turbidity' },
                    { title: '余氯(mg/L)', dataIndex: 'residualChlorine' },
                    { title: 'pH', dataIndex: 'ph' },
                    {
                      title: '结论',
                      dataIndex: 'conclusion',
                      render: (v: string) => <Tag color={v === '合格' ? 'success' : 'error'}>{v}</Tag>,
                    },
                    { title: '报告附件', dataIndex: 'reportFileName', render: (v?: string) => v ?? '-' },
                  ]}
                />
              </div>

              {/* 异常预警 */}
              <div className="wq-section-label text-label-sm wq-section-label-spaced">
                <WarningOutlined style={{ marginRight: 6 }} />
                该供水点异常预警与处置状态
              </div>
              <div className="glass-card wq-table-card">
                <Table
                  size="small"
                  rowKey="id"
                  pagination={false}
                  dataSource={alerts}
                  columns={[
                    { title: '触发时间', dataIndex: 'triggeredAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
                    { title: '异常指标', dataIndex: 'indicator' },
                    { title: '数值', dataIndex: 'value', render: (v: number, r: AlertEvent) => `${v}${r.unit}` },
                    { title: '标准', dataIndex: 'threshold' },
                    {
                      title: '级别',
                      dataIndex: 'level',
                      render: (v: string) => <Tag color={v === 'critical' ? 'error' : 'warning'}>{v === 'critical' ? '严重' : '一般'}</Tag>,
                    },
                    { title: '通知渠道', dataIndex: 'notifyChannels', render: (v: string[]) => v.join(' + ') },
                    { title: '通知对象', dataIndex: 'notifiedPersons', render: (v: string[]) => v.join('、') },
                    {
                      title: '处置状态',
                      dataIndex: 'status',
                      render: (v: string) => <Tag color={v === '待处理' ? 'error' : 'default'}>{v}</Tag>,
                    },
                    {
                      title: '操作',
                      render: (_: unknown, record: AlertEvent) =>
                        record.status === '待处理' ? (
                          <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleMarkHandled(record.id)}>
                            标记已处理
                          </Button>
                        ) : (
                          <span className="text-label-sm">
                            {record.handledBy} · {record.handledAt && new Date(record.handledAt).toLocaleString('zh-CN')}
                          </span>
                        ),
                    },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'lab',
      label: (
        <span>
          <ExperimentOutlined />
          实验室监测
        </span>
      ),
      children: <LabMonitoringTab waterPoints={waterPoints} selectedId={selectedId} setSelectedId={setSelectedId} labRecords={labRecords} alerts={alerts} setLabModalOpen={setLabModalOpen} reload={reload} handleMarkHandled={handleMarkHandled} />,
    },
  ];

  return (
    <div>
      <SectionTitle
        title="水质安全管理"
        extra={
          <Select
            style={{ width: 240 }}
            value={selectedId || undefined}
            placeholder="选择供水点"
            options={waterPoints.map((wp) => ({ value: wp.id, label: wp.name }))}
            onChange={setSelectedId}
          />
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="wq-tabs"
      />

      <LabRecordFormModal
        open={labModalOpen}
        waterPointId={selectedId}
        onCancel={() => setLabModalOpen(false)}
        onCreated={() => {
          setLabModalOpen(false);
          reload(selectedId);
          Modal.success({ title: '登记成功', content: '送检报告已登记，数据已计入水质达标统计。' });
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   实验室监测 Tab
   ──────────────────────────────────────────────────────────────────────────── */

interface LabMonitoringTabProps {
  waterPoints: WaterPoint[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  labRecords: LabWaterQualityRecord[];
  alerts: AlertEvent[];
  setLabModalOpen: (open: boolean) => void;
  reload: (id: string) => void;
  handleMarkHandled: (alertId: string) => void;
}

function LabMonitoringTab({
  waterPoints,
  selectedId,
  setSelectedId: _setSelectedId,
  labRecords,
  alerts,
  setLabModalOpen,
  reload: _reload,
  handleMarkHandled: _handleMarkHandled,
}: LabMonitoringTabProps) {
  const stats = useMemo(() => {
    const total = labRecords.length;
    const qualified = labRecords.filter((r) => r.conclusion === '合格').length;
    const unqualified = labRecords.filter((r) => r.conclusion === '不合格').length;
    const passRate = total > 0 ? ((qualified / total) * 100).toFixed(1) : '0';
    return { total, qualified, unqualified, passRate };
  }, [labRecords]);

  const unqualifiedRecords = useMemo(() => labRecords.filter((r) => r.conclusion === '不合格'), [labRecords]);

  const relatedAlerts = useMemo(
    () => alerts.filter((a) => a.waterPointId === selectedId),
    [alerts, selectedId],
  );

  return (
    <div className="wq-tab-content">
      <div className="wq-section-label text-label-sm">
        <ClockCircleOutlined style={{ marginRight: 6 }} />
        检测计划管理
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="wq-stat-card" bordered={false}>
            <div className="wq-stat-icon" style={{ background: 'rgba(0,242,255,0.15)' }}>
              <FileTextOutlined style={{ color: '#00f2ff' }} />
            </div>
            <div className="wq-stat-info">
              <span className="text-label-sm">累计检测</span>
              <span className="text-data-display">{stats.total}</span>
              <span className="text-label-sm">次</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="wq-stat-card" bordered={false}>
            <div className="wq-stat-icon" style={{ background: 'rgba(82,196,26,0.15)' }}>
              <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
            </div>
            <div className="wq-stat-info">
              <span className="text-label-sm">合格次数</span>
              <span className="text-data-display" style={{ color: '#52c41a' }}>{stats.qualified}</span>
              <span className="text-label-sm">次</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="wq-stat-card" bordered={false}>
            <div className="wq-stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <WarningOutlined style={{ color: '#f59e0b' }} />
            </div>
            <div className="wq-stat-info">
              <span className="text-label-sm">不合格次数</span>
              <span className="text-data-display" style={{ color: '#f59e0b' }}>{stats.unqualified}</span>
              <span className="text-label-sm">次</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="wq-stat-card" bordered={false}>
            <div className="wq-stat-icon" style={{ background: 'rgba(0,242,255,0.15)' }}>
              <ThunderboltOutlined style={{ color: '#00f2ff' }} />
            </div>
            <div className="wq-stat-info">
              <span className="text-label-sm">合格率</span>
              <span className="text-data-display">{stats.passRate}</span>
              <span className="text-label-sm">%</span>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="wq-section-label text-label-sm wq-section-label-spaced">
        <FileTextOutlined style={{ marginRight: 6 }} />
        检测结果录入与自动判定（对照 GB 5749-2022 标准）
      </div>
      <div className="glass-card wq-table-card">
        <div className="infra-toolbar">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setLabModalOpen(true)}>
            登记送检报告
          </Button>
        </div>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={labRecords}
          columns={[
            { title: '检测日期', dataIndex: 'testDate' },
            { title: '检测机构', dataIndex: 'institution' },
            { title: '菌落总数(CFU/mL)', dataIndex: 'bacteriaCount' },
            {
              title: '总大肠菌群',
              dataIndex: 'coliformDetected',
              render: (v: boolean) => (v ? <Tag color="error">检出</Tag> : <Tag color="success">未检出</Tag>),
            },
            { title: '浑浊度(NTU)', dataIndex: 'turbidity' },
            { title: '余氯(mg/L)', dataIndex: 'residualChlorine' },
            { title: 'pH', dataIndex: 'ph' },
            {
              title: '结论',
              dataIndex: 'conclusion',
              render: (v: string) => <Tag color={v === '合格' ? 'success' : 'error'}>{v}</Tag>,
            },
            { title: '报告附件', dataIndex: 'reportFileName', render: (v?: string) => v ?? '-' },
          ]}
        />
      </div>

      {unqualifiedRecords.length > 0 && (
        <>
          <div className="wq-section-label text-label-sm wq-section-label-spaced">
            <WarningOutlined style={{ marginRight: 6 }} />
            不合格项目自动标记 + 整改跟踪闭环
          </div>
          <div className="glass-card wq-table-card">
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={unqualifiedRecords}
              columns={[
                { title: '检测日期', dataIndex: 'testDate' },
                { title: '检测机构', dataIndex: 'institution' },
                {
                  title: '不合格指标',
                  render: (_: unknown, record: LabWaterQualityRecord) => {
                    const items: string[] = [];
                    if (record.bacteriaCount > 100) items.push(`菌落总数(${record.bacteriaCount} CFU/mL)`);
                    if (record.coliformDetected) items.push('总大肠菌群(检出)');
                    if (record.turbidity > 1) items.push(`浑浊度(${record.turbidity} NTU)`);
                    if (record.residualChlorine < 0.05) items.push(`余氯(${record.residualChlorine} mg/L)`);
                    if (record.ph < 6.5 || record.ph > 8.5) items.push(`pH(${record.ph})`);
                    return items.join('、') || '-';
                  },
                },
                {
                  title: '关联告警',
                  render: (_: unknown, record: LabWaterQualityRecord) => {
                    const related = relatedAlerts.filter(
                      (a) =>
                        a.waterPointId === record.waterPointId &&
                        new Date(a.triggeredAt).toDateString() === new Date(record.testDate).toDateString(),
                    );
                    if (related.length === 0) return <Tag color="default">无</Tag>;
                    return related.map((a) => (
                      <Tag key={a.id} color={a.status === '待处理' ? 'error' : 'default'}>
                        {a.indicator}({a.status})
                      </Tag>
                    ));
                  },
                },
                {
                  title: '整改状态',
                  render: (_: unknown, record: LabWaterQualityRecord) => {
                    const hasHandledAlert = relatedAlerts.some(
                      (a) =>
                        a.waterPointId === record.waterPointId &&
                        a.status === '已处理' &&
                        new Date(a.triggeredAt).toDateString() === new Date(record.testDate).toDateString(),
                    );
                    return hasHandledAlert ? (
                      <Tag color="success">已整改</Tag>
                    ) : (
                      <Tag color="error">待整改</Tag>
                    );
                  },
                },
              ]}
            />
          </div>
        </>
      )}

      <div className="wq-section-label text-label-sm wq-section-label-spaced">
        <ExperimentOutlined style={{ marginRight: 6 }} />
        委托第三方检测管理（外检报告上传归档）
      </div>
      <div className="glass-card wq-table-card">
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={labRecords}
          locale={{ emptyText: '暂无第三方外检报告' }}
          columns={[
            { title: '检测日期', dataIndex: 'testDate' },
            { title: '检测机构', dataIndex: 'institution' },
            { title: '供水点', dataIndex: 'waterPointId', render: (id: string) => waterPoints.find((wp) => wp.id === id)?.name ?? id },
            { title: '报告附件', dataIndex: 'reportFileName', render: (v?: string) => v ?? '-' },
            {
              title: '结论',
              dataIndex: 'conclusion',
              render: (v: string) => <Tag color={v === '合格' ? 'success' : 'error'}>{v}</Tag>,
            },
          ]}
        />
      </div>
    </div>
  );
}
