import type { OperationalStatus } from '../../types';
import './StatusPill.css';

const STATUS_CONFIG: Record<OperationalStatus, { label: string; color: string; glow: string }> = {
  running: { label: '运行中', color: 'var(--color-status-running)', glow: 'glow-running' },
  stopped: { label: '已停用', color: 'var(--color-status-stopped)', glow: '' },
  fault: { label: '故障', color: 'var(--color-status-fault)', glow: 'glow-fault' },
  warning: { label: '预警', color: 'var(--color-status-warning)', glow: 'glow-warning' },
};

export default function StatusPill({ status, label }: { status: OperationalStatus; label?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className="status-pill">
      <span className={`status-pill-dot ${config.glow}`} style={{ background: config.color }} />
      <span className="text-label-sm">{label ?? config.label}</span>
    </span>
  );
}
