import CircularProgress from './CircularProgress';

interface ValveIndicatorProps {
  name: string;
  openPercent: number;
}

/** Read-only dial showing a valve's current opening percentage. This platform
 * is monitoring-only (no remote control), so the dial never accepts input. */
export default function ValveIndicator({ name, openPercent }: ValveIndicatorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <CircularProgress percent={openPercent} size={72} color="var(--color-chart-teal)" />
      <span className="text-label-sm">{name}</span>
    </div>
  );
}
