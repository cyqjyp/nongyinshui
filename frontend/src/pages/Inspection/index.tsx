import { useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SectionTitle from '../../components/common/SectionTitle';
import InspectionFormModal from './InspectionFormModal';
import { fetchInspections } from '../../services/inspectionService';
import { fetchWaterPoints } from '../../services/waterPointService';
import type { InspectionRecord, WaterPoint } from '../../types';

export default function InspectionPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => fetchInspections().then(setInspections);

  useEffect(() => {
    load();
    fetchWaterPoints().then(setWaterPoints);
  }, []);

  return (
    <div>
      <SectionTitle
        title="巡检与运行管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            登记巡检记录
          </Button>
        }
      />
      <div className="glass-card" style={{ padding: 'var(--spacing-internal-padding)' }}>
        <Table
          size="small"
          rowKey="id"
          dataSource={inspections}
          columns={[
            { title: '巡检时间', dataIndex: 'inspectedAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
            {
              title: '供水点',
              dataIndex: 'waterPointId',
              render: (id: string) => waterPoints.find((wp) => wp.id === id)?.name ?? id,
            },
            { title: '巡检人', dataIndex: 'inspector' },
            { title: '巡检项目', dataIndex: 'items', render: (items: string[]) => items.join('、') },
            {
              title: '巡检结果',
              dataIndex: 'result',
              render: (v: string) => <Tag color={v === '正常' ? 'success' : 'error'}>{v}</Tag>,
            },
            { title: '问题描述', dataIndex: 'issueDescription', render: (v?: string) => v ?? '-' },
          ]}
        />
      </div>

      <InspectionFormModal
        open={modalOpen}
        waterPoints={waterPoints}
        onCancel={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          load();
          message.success('巡检记录已登记');
        }}
      />
    </div>
  );
}
