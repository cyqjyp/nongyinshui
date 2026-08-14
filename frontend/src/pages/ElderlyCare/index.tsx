import { useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Badge,
  message,
} from 'antd';
import {
  PlusOutlined,
  HeartOutlined,
  SearchOutlined,
  EyeOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { ElderlyPerson, ElderlyWaterAlert } from '../../types';
import {
  getElderlyCareOverview,
  getElderlyPersons,
  getElderlyPersonById,
  getCareRecords,
  getWaterAlerts,
  getUnhandledWaterAlerts,
} from '../../services/elderlyCareService';
import { villages } from '../../mock/villages';
import './ElderlyCare.css';

const { TextArea } = Input;

type FilterStatus = 'all' | 'pending' | 'waterAbnormal';

export default function ElderlyCarePage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  const [careModalOpen, setCareModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const [selectedElderly, setSelectedElderly] = useState<ElderlyPerson | null>(null);
  const [careForm] = Form.useForm();
  const [addForm] = Form.useForm();

  const overview = useMemo(() => getElderlyCareOverview(), []);
  const unhandledAlerts = useMemo(() => getUnhandledWaterAlerts(), []);

  const elderlyList = useMemo(() => {
    let list = getElderlyPersons(selectedVillage || undefined);

    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.address.toLowerCase().includes(kw) ||
          villages.find((v) => v.id === p.villageId)?.name.toLowerCase().includes(kw),
      );
    }

    if (filterStatus === 'pending') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      list = list.filter((p) => {
        const records = getCareRecords(p.id);
        if (records.length === 0) return true;
        return new Date(records[0].careDate) < sevenDaysAgo;
      });
    }

    if (filterStatus === 'waterAbnormal') {
      const abnormalIds = new Set(unhandledAlerts.map((a) => a.elderlyId));
      list = list.filter((p) => abnormalIds.has(p.id));
    }

    return list;
  }, [filterStatus, searchText, selectedVillage, unhandledAlerts]);

  const handleCareClick = (person: ElderlyPerson) => {
    setSelectedElderly(person);
    careForm.resetFields();
    careForm.setFieldsValue({
      careDate: new Date(),
      careMethod: '上门走访',
      caregiver: '张海涛',
    });
    setCareModalOpen(true);
  };

  const handleCareSubmit = () => {
    careForm.validateFields().then((values) => {
      console.log('关怀登记:', values);
      message.success('关怀记录已保存');
      setCareModalOpen(false);
    });
  };

  const handleDetailClick = (person: ElderlyPerson) => {
    setSelectedElderly(person);
    setDetailModalOpen(true);
  };

  const handleAddSubmit = () => {
    addForm.validateFields().then((values) => {
      console.log('新增老人:', values);
      message.success('老人档案已添加');
      setAddModalOpen(false);
      addForm.resetFields();
    });
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ElderlyPerson) => (
        <a onClick={() => handleDetailClick(record)}>{text}</a>
      ),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 70,
    },
    {
      title: '所属村庄',
      dataIndex: 'villageId',
      key: 'villageId',
      render: (villageId: string) => villages.find((v) => v.id === villageId)?.name || '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '联系人',
      key: 'contact',
      render: (_: unknown, record: ElderlyPerson) => (
        <span>
          {record.contactName}
          <br />
          <span className="text-muted">{record.contactPhone}</span>
        </span>
      ),
    },
    {
      title: '健康状况',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      width: 90,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          自理: 'green',
          半自理: 'orange',
          需照料: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '上次关怀',
      key: 'lastCare',
      width: 120,
      render: (_: unknown, record: ElderlyPerson) => {
        const records = getCareRecords(record.id);
        if (records.length === 0) return <Tag color="red">未关怀</Tag>;
        const daysDiff = Math.floor(
          (Date.now() - new Date(records[0].careDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff > 7) return <Tag color="red">{records[0].careDate}（{daysDiff}天前）</Tag>;
        return <Tag color="green">{records[0].careDate}</Tag>;
      },
    },
    {
      title: '用水状态',
      key: 'waterStatus',
      width: 100,
      render: (_: unknown, record: ElderlyPerson) => {
        const alerts = getWaterAlerts(record.id);
        const unhandled = alerts.filter((a) => !a.handled);
        if (unhandled.length > 0) {
          return (
            <Badge count={unhandled.length} size="small">
              <Tag color="red">异常</Tag>
            </Badge>
          );
        }
        return <Tag color="green">正常</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: ElderlyPerson) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleCareClick(record)}>
            <HeartOutlined /> 关怀登记
          </Button>
          <Button type="link" size="small" onClick={() => handleDetailClick(record)}>
            <EyeOutlined /> 详情
          </Button>
        </Space>
      ),
    },
  ];

  const careRecords = selectedElderly ? getCareRecords(selectedElderly.id) : [];
  const waterAlerts = selectedElderly ? getWaterAlerts(selectedElderly.id) : [];

  return (
    <div className="elderly-care-page">
      <div className="elderly-care-header">
        <h2 className="page-title">
          <span className="title-bar" />
          独居老人关怀
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          新增老人
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="elderly-stats-row">
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="在册独居老人" value={overview.totalElderly} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="关怀覆盖率" value={overview.careCoverage} suffix="%" valueStyle={{ color: '#00d4ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="本周已关怀" value={overview.weeklyCared} suffix="人" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="待关怀 / 用水异常"
              value={`${overview.pendingCare}人 / ${overview.waterAbnormal}人`}
              valueStyle={{ color: overview.pendingCare > 0 || overview.waterAbnormal > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <div className="elderly-filter-bar">
        <Space>
          <Button
            type={filterStatus === 'all' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('all')}
          >
            全部
          </Button>
          <Button
            type={filterStatus === 'pending' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('pending')}
          >
            待关怀（超7天）
          </Button>
          <Button
            type={filterStatus === 'waterAbnormal' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('waterAbnormal')}
          >
            用水异常
          </Button>
        </Space>
        <Space>
          <Select
            placeholder="选择村庄"
            allowClear
            style={{ width: 150 }}
            value={selectedVillage || undefined}
            onChange={(v) => setSelectedVillage(v || '')}
            options={villages.map((v) => ({ label: v.name, value: v.id }))}
          />
          <Input
            placeholder="搜索姓名/地址"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </div>

      {/* 用水预警提示 */}
      {unhandledAlerts.length > 0 && (
        <div className="elderly-alert-banner" onClick={() => setAlertModalOpen(true)}>
          <BellOutlined style={{ marginRight: 8 }} />
          当前有 <strong>{unhandledAlerts.length}</strong> 条未处理的用水异常预警，点击查看
        </div>
      )}

      {/* 列表 */}
      <Table
        columns={columns}
        dataSource={elderlyList}
        rowKey="id"
        pagination={false}
        size="middle"
      />

      {/* 关怀登记弹窗 */}
      <Modal
        title={`关怀登记 - ${selectedElderly?.name}`}
        open={careModalOpen}
        onCancel={() => setCareModalOpen(false)}
        onOk={handleCareSubmit}
        width={600}
      >
        <Form form={careForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="careDate" label="关怀日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="careMethod" label="关怀方式" rules={[{ required: true }]}>
                <Select options={[{ label: '上门走访', value: '上门走访' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="caregiver" label="关怀人" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '张海涛', value: '张海涛' },
                { label: '陈美玲', value: '陈美玲' },
                { label: '王建国', value: '王建国' },
              ]}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="waterStatus" label="用水情况" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '正常', value: '正常' },
                    { label: '异常', value: '异常' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="healthStatus" label="健康状况" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '良好', value: '良好' },
                    { label: '需关注', value: '需关注' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="measures" label="处理措施">
            <TextArea rows={2} placeholder="如发现问题，记录处理措施" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="其他情况记录" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title={`老人详情 - ${selectedElderly?.name}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedElderly && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="姓名">{selectedElderly.name}</Descriptions.Item>
              <Descriptions.Item label="年龄">{selectedElderly.age}岁</Descriptions.Item>
              <Descriptions.Item label="性别">{selectedElderly.gender}</Descriptions.Item>
              <Descriptions.Item label="所属村庄">
                {villages.find((v) => v.id === selectedElderly.villageId)?.name}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{selectedElderly.address}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedElderly.contactName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedElderly.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="供水方式">{selectedElderly.supplyMode}</Descriptions.Item>
              <Descriptions.Item label="健康状况">
                <Tag color={selectedElderly.healthStatus === '自理' ? 'green' : selectedElderly.healthStatus === '半自理' ? 'orange' : 'red'}>
                  {selectedElderly.healthStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="水表编号">{selectedElderly.meterNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="关联供水点">
                {selectedElderly.waterPointId || '-'}
              </Descriptions.Item>
              {selectedElderly.remark && (
                <Descriptions.Item label="备注" span={2}>{selectedElderly.remark}</Descriptions.Item>
              )}
            </Descriptions>

            {careRecords.length > 0 && (
              <>
                <h4 style={{ marginTop: 20, marginBottom: 10 }}>关怀记录</h4>
                <Table
                  dataSource={careRecords}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '关怀日期', dataIndex: 'careDate', key: 'careDate' },
                    { title: '关怀人', dataIndex: 'caregiver', key: 'caregiver' },
                    { title: '用水情况', dataIndex: 'waterStatus', key: 'waterStatus', render: (v: string) => <Tag color={v === '正常' ? 'green' : 'red'}>{v}</Tag> },
                    { title: '健康状况', dataIndex: 'healthStatus', key: 'healthStatus' },
                    { title: '处理措施', dataIndex: 'measures', key: 'measures', render: (v: string) => v || '-' },
                  ]}
                />
              </>
            )}

            {waterAlerts.length > 0 && (
              <>
                <h4 style={{ marginTop: 20, marginBottom: 10 }}>用水预警</h4>
                <Table
                  dataSource={waterAlerts}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '预警类型', dataIndex: 'alertType', key: 'alertType' },
                    { title: '触发时间', dataIndex: 'triggeredAt', key: 'triggeredAt' },
                    { title: '描述', dataIndex: 'description', key: 'description' },
                    { title: '状态', key: 'handled', render: (_: unknown, r: ElderlyWaterAlert) => <Tag color={r.handled ? 'green' : 'red'}>{r.handled ? '已处理' : '未处理'}</Tag> },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Modal>

      {/* 新增老人弹窗 */}
      <Modal
        title="新增独居老人"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={handleAddSubmit}
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="age" label="年龄" rules={[{ required: true }]}>
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
                <Select options={[{ label: '男', value: '男' }, { label: '女', value: '女' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="villageId" label="所属村庄" rules={[{ required: true }]}>
                <Select options={villages.map((v) => ({ label: v.name, value: v.id }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="地址" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactName" label="联系人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="联系电话" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplyMode" label="供水方式" rules={[{ required: true }]}>
                <Select options={[{ label: '集中供水', value: '集中供水' }, { label: '分散供水', value: '分散供水' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="healthStatus" label="健康状况" rules={[{ required: true }]}>
                <Select options={[{ label: '自理', value: '自理' }, { label: '半自理', value: '半自理' }, { label: '需照料', value: '需照料' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="meterNumber" label="水表编号">
                <Input placeholder="关联水表（可选）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="waterPointId" label="关联供水点">
                <Input placeholder="关联供水点（可选）" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="特殊情况说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预警列表弹窗 */}
      <Modal
        title="用水异常预警"
        open={alertModalOpen}
        onCancel={() => setAlertModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={unhandledAlerts}
          rowKey="id"
          size="middle"
          pagination={false}
          columns={[
            {
              title: '老人姓名',
              dataIndex: 'elderlyId',
              key: 'elderlyName',
              render: (id: string) => getElderlyPersonById(id)?.name || '-',
            },
            { title: '预警类型', dataIndex: 'alertType', key: 'alertType', render: (v: string) => <Tag color="red">{v}</Tag> },
            { title: '触发时间', dataIndex: 'triggeredAt', key: 'triggeredAt' },
            { title: '描述', dataIndex: 'description', key: 'description' },
            { title: '已通知', dataIndex: 'notifiedPersons', key: 'notifiedPersons', render: (persons: string[]) => persons.join('、') },
          ]}
        />
      </Modal>
    </div>
  );
}
