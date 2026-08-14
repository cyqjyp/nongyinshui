import { Modal, Table, Tag } from 'antd';
import type { WaterPoint } from '../../../types';
import { villages } from '../../../mock/villages';

interface SourceDrillDownModalProps {
  open: boolean;
  title: string;
  data: WaterPoint[];
  onClose: () => void;
  onViewDetail: (point: WaterPoint) => void;
}

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  running: { color: 'green', text: '正常' },
  warning: { color: 'orange', text: '预警' },
  fault: { color: 'red', text: '故障' },
  stopped: { color: 'default', text: '停用' },
};

export default function SourceDrillDownModal({
  open,
  title,
  data,
  onClose,
  onViewDetail,
}: SourceDrillDownModalProps) {
  const columns = [
    {
      title: '水源地名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: WaterPoint) => (
        <a onClick={() => onViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: '所属村庄',
      dataIndex: 'villageId',
      key: 'villageId',
      render: (villageId: string) => villages.find((v) => v.id === villageId)?.name || '-',
    },
    {
      title: '水源类型',
      dataIndex: 'sourceType',
      key: 'sourceType',
    },
    {
      title: '供水方式',
      dataIndex: 'supplyMode',
      key: 'supplyMode',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = STATUS_MAP[status] || STATUS_MAP.running;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '覆盖人口',
      dataIndex: 'coveredPopulation',
      key: 'coveredPopulation',
      render: (pop: number) => `${pop}人`,
    },
    {
      title: '设计能力',
      dataIndex: 'designCapacity',
      key: 'designCapacity',
      render: (cap: number) => `${cap} m³/d`,
    },
  ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Modal>
  );
}
