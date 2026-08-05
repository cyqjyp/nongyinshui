import StatusPill from './StatusPill';
import type { OperationalStatus } from '../../types';
import './PumpStatus.css';

interface PumpStatusProps {
  name: string;
  status: OperationalStatus;
}

/** Read-only pump status indicator (this platform monitors safety data; it does
 * not issue remote control commands to field equipment). */
export default function PumpStatus({ name, status }: PumpStatusProps) {
  return (
    <div className="pump-status">
      <span className="text-label-sm pump-status-name">{name}</span>
      <StatusPill status={status} />
    </div>
  );
}
