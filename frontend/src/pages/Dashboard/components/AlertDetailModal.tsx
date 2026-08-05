import { Descriptions, Modal, Tag } from 'antd';
import type { AlertEvent } from '../../../types';

interface AlertDetailModalProps {
  open: boolean;
  alert: AlertEvent | null;
  waterPointName?: string;
  villageName?: string;
  onClose: () => void;
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function AlertDetailModal({
  open,
  alert,
  waterPointName,
  villageName,
  onClose,
}: AlertDetailModalProps) {
  if (!alert) return null;

  const pending = alert.status === '待处理';
  const levelLabel = alert.level === 'critical' ? '严重' : '预警';
  const measuredValue =
    alert.unit && alert.unit !== '-'
      ? `${alert.value}${alert.unit}`
      : String(alert.value);

  return (
    <Modal title="告警详情" open={open} onCancel={onClose} footer={null} width={560} destroyOnHidden>
      <Descriptions column={1} size="small" className="dashboard-alert-detail">
        <Descriptions.Item label="告警指标">{alert.indicator || '未知告警'}</Descriptions.Item>
        <Descriptions.Item label="告警级别">
          <Tag color={alert.level === 'critical' ? 'error' : 'warning'}>{levelLabel}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="处理状态">
          <Tag color={pending ? 'error' : 'success'}>{alert.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="监测数值">{measuredValue}</Descriptions.Item>
        <Descriptions.Item label="标准阈值">{alert.threshold || '—'}</Descriptions.Item>
        <Descriptions.Item label="所属村庄">{villageName ?? '未关联村庄'}</Descriptions.Item>
        <Descriptions.Item label="所属供水点">{waterPointName ?? '未关联供水点'}</Descriptions.Item>
        <Descriptions.Item label="触发时间">{formatDateTime(alert.triggeredAt)}</Descriptions.Item>
        <Descriptions.Item label="处理时间">{formatDateTime(alert.handledAt)}</Descriptions.Item>
        <Descriptions.Item label="处理人">{alert.handledBy || '—'}</Descriptions.Item>
        <Descriptions.Item label="通知渠道">
          {alert.notifyChannels.length > 0 ? alert.notifyChannels.join('、') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="通知对象">
          {alert.notifiedPersons.length > 0 ? alert.notifiedPersons.join('、') : '—'}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
