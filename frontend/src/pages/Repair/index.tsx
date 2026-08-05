import { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Space, Modal, Input, Select } from 'antd';
import { PlusOutlined, CheckOutlined, SwapOutlined, PhoneOutlined } from '@ant-design/icons';
import SectionTitle from '../../components/common/SectionTitle';
import RepairFormModal from './RepairFormModal';
import { fetchRepairs, updateRepairStatus } from '../../services/repairService';
import { fetchVillages } from '../../services/waterPointService';
import type { RepairOrder, Village } from '../../types';

// 维修人员列表（演示数据）
const HANDLERS = ['张海涛', '陈美玲', '王建国', '李师傅', '赵师傅'];

export default function RepairPage() {
  const [repairs, setRepairs] = useState<RepairOrder[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => fetchRepairs().then(setRepairs);

  useEffect(() => {
    load();
    fetchVillages().then(setVillages);
  }, []);

  // 派单
  const handleDispatch = (id: string) => {
    let selectedHandler = '';
    Modal.confirm({
      title: '派单',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>请选择处理人：</p>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择维修人员"
            onChange={(v) => {
              selectedHandler = v;
            }}
            options={HANDLERS.map((h) => ({ label: h, value: h }))}
          />
        </div>
      ),
      okText: '确认派单',
      cancelText: '取消',
      onOk: async () => {
        if (!selectedHandler) {
          message.warning('请选择处理人');
          return Promise.reject();
        }
        await updateRepairStatus(id, '处理中', { handler: selectedHandler });
        message.success(`已派单给 ${selectedHandler}`);
        load();
      },
    });
  };

  // 转派
  const handleTransfer = (id: string) => {
    let selectedHandler = '';
    Modal.confirm({
      title: '转派工单',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>请选择新的处理人：</p>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择维修人员"
            onChange={(v) => {
              selectedHandler = v;
            }}
            options={HANDLERS.map((h) => ({ label: h, value: h }))}
          />
        </div>
      ),
      okText: '确认转派',
      cancelText: '取消',
      onOk: async () => {
        if (!selectedHandler) {
          message.warning('请选择处理人');
          return Promise.reject();
        }
        await updateRepairStatus(id, '处理中', { handler: selectedHandler });
        message.success(`已转派给 ${selectedHandler}`);
        load();
      },
    });
  };

  // 完成处理
  const handleComplete = (id: string) => {
    let resolution = '';
    Modal.confirm({
      title: '完成处理',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>请填写处理结果：</p>
          <Input.TextArea
            rows={3}
            placeholder="请描述维修措施、更换配件等"
            onChange={(e) => {
              resolution = e.target.value;
            }}
          />
        </div>
      ),
      okText: '确认完成',
      cancelText: '取消',
      onOk: async () => {
        if (!resolution.trim()) {
          message.warning('请填写处理结果');
          return Promise.reject();
        }
        await updateRepairStatus(id, '已完成', { resolution });
        message.success('工单已标记为已完成');
        load();
      },
    });
  };

  // 回访确认
  const handleVisit = (id: string) => {
    let visitResult = '';
    Modal.confirm({
      title: '回访确认',
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>请填写回访结果：</p>
          <Input.TextArea
            rows={3}
            placeholder="请描述回访情况，村民是否满意等"
            onChange={(e) => {
              visitResult = e.target.value;
            }}
          />
        </div>
      ),
      okText: '确认回访',
      cancelText: '取消',
      onOk: async () => {
        if (!visitResult.trim()) {
          message.warning('请填写回访结果');
          return Promise.reject();
        }
        await updateRepairStatus(id, '已回访', { visitResult, visitConfirmed: true });
        message.success('回访已完成');
        load();
      },
    });
  };

  // 状态颜色映射
  const statusColorMap: Record<string, string> = {
    '待派单': 'error',
    '处理中': 'warning',
    '已完成': 'success',
    '已回访': 'cyan',
  };

  return (
    <div>
      <SectionTitle
        title="报修管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            代客登记报修
          </Button>
        }
      />
      <div className="glass-card" style={{ padding: 'var(--spacing-internal-padding)' }}>
        <Table
          size="small"
          rowKey="id"
          dataSource={repairs}
          columns={[
            { title: '工单编号', dataIndex: 'id', render: (v: string) => v.toUpperCase() },
            { title: '上报时间', dataIndex: 'reportedAt', render: (v: string) => new Date(v).toLocaleDateString('zh-CN') },
            {
              title: '村庄',
              dataIndex: 'villageId',
              render: (id: string) => villages.find((v) => v.id === id)?.name ?? id,
            },
            { title: '来源', dataIndex: 'source' },
            { title: '问题描述', dataIndex: 'description' },
            { title: '处理人', dataIndex: 'handler', render: (v?: string) => v ?? '未指派' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (v: string) => <Tag color={statusColorMap[v] ?? 'default'}>{v}</Tag>,
            },
            { title: '处理结果', dataIndex: 'resolution', render: (v?: string) => v ?? '-' },
            {
              title: '回访结果',
              render: (_: unknown, record: RepairOrder) => record.visitResult ?? '-',
            },
            {
              title: '操作',
              render: (_: unknown, record: RepairOrder) => (
                <Space>
                  {record.status === '待派单' && (
                    <Button size="small" type="primary" icon={<SwapOutlined />} onClick={() => handleDispatch(record.id)}>
                      派单
                    </Button>
                  )}
                  {record.status === '处理中' && (
                    <>
                      <Button size="small" icon={<SwapOutlined />} onClick={() => handleTransfer(record.id)}>
                        转派
                      </Button>
                      <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleComplete(record.id)}>
                        完成处理
                      </Button>
                    </>
                  )}
                  {record.status === '已完成' && (
                    <Button size="small" icon={<PhoneOutlined />} onClick={() => handleVisit(record.id)}>
                      回访确认
                    </Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </div>

      <RepairFormModal
        open={modalOpen}
        villages={villages}
        onCancel={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          load();
          message.success('报修工单已登记');
        }}
      />
    </div>
  );
}
