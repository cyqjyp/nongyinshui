import { Modal, Descriptions, Tag } from 'antd';
import type { WaterPoint } from '../../../types';
import { villages } from '../../../mock/villages';

interface SourceDetailModalProps {
  open: boolean;
  point: WaterPoint | null;
  onClose: () => void;
}

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  running: { color: 'green', text: '正常' },
  warning: { color: 'orange', text: '预警' },
  fault: { color: 'red', text: '故障' },
  stopped: { color: 'default', text: '停用' },
};

export default function SourceDetailModal({ open, point, onClose }: SourceDetailModalProps) {
  if (!point) return null;

  const village = villages.find((v) => v.id === point.villageId);
  const statusConfig = STATUS_MAP[point.status] || STATUS_MAP.running;

  return (
    <Modal
      title={`水源地详情 - ${point.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="水源地名称">{point.name}</Descriptions.Item>
        <Descriptions.Item label="所属村庄">{village?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="水源类型">{point.sourceType}</Descriptions.Item>
        <Descriptions.Item label="供水方式">{point.supplyMode}</Descriptions.Item>
        <Descriptions.Item label="管理方式">{point.managedBy}</Descriptions.Item>
        <Descriptions.Item label="当前状态">
          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="覆盖户数">{point.coveredHouseholds} 户</Descriptions.Item>
        <Descriptions.Item label="覆盖人口">{point.coveredPopulation} 人</Descriptions.Item>
        <Descriptions.Item label="设计供水能力">{point.designCapacity} m³/d</Descriptions.Item>
        <Descriptions.Item label="当前流量">{point.currentFlow} m³/h</Descriptions.Item>
        {point.reservoirLevel !== undefined && (
          <Descriptions.Item label="蓄水量">{point.reservoirLevel}%</Descriptions.Item>
        )}
        <Descriptions.Item label="位置">
          {point.location.lat.toFixed(4)}, {point.location.lng.toFixed(4)}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
