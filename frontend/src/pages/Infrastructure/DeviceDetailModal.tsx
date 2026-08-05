import { Modal, Descriptions, Tag } from 'antd';
import StatusPill from '../../components/common/StatusPill';
import type { Device } from '../../types';

interface DeviceDetailModalProps {
  open: boolean;
  device: Device | null;
  waterPointName?: string;
  villageName?: string;
  onClose: () => void;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function DeviceDetailModal({
  open,
  device,
  waterPointName,
  villageName,
  onClose,
}: DeviceDetailModalProps) {
  if (!device) return null;

  return (
    <Modal title="设备详情" open={open} onCancel={onClose} footer={null} width={560} destroyOnHidden>
      <Descriptions column={1} size="small" className="infra-device-detail">
        <Descriptions.Item label="设备名称">{device.name}</Descriptions.Item>
        <Descriptions.Item label="设备编号">{device.id}</Descriptions.Item>
        <Descriptions.Item label="设备类型">{device.type}</Descriptions.Item>
        <Descriptions.Item label="所属村庄">{villageName ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="所属供水点">{waterPointName ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="安装日期">{device.installedAt}</Descriptions.Item>
        <Descriptions.Item label="最近上报">{formatDateTime(device.lastReportAt)}</Descriptions.Item>
        <Descriptions.Item label="在线状态">
          {device.online ? <Tag color="success">在线</Tag> : <Tag color="default">离线</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="运行状态">
          <StatusPill status={device.status} />
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
