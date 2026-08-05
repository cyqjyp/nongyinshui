import './PhMeter.css';

interface PhMeterProps {
  value: number;
  min?: number;
  max?: number;
  safeRange?: [number, number];
}

export default function PhMeter({ value, min = 0, max = 14, safeRange = [6.5, 8.5] }: PhMeterProps) {
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;
  const safeStart = toPercent(safeRange[0]);
  const safeWidth = toPercent(safeRange[1]) - safeStart;
  const pointerPos = Math.min(100, Math.max(0, toPercent(value)));
  const isSafe = value >= safeRange[0] && value <= safeRange[1];

  return (
    <div className="ph-meter">
      <div className="ph-meter-track">
        <div className="ph-meter-safe-zone" style={{ left: `${safeStart}%`, width: `${safeWidth}%` }} />
        <div
          className="ph-meter-pointer"
          style={{
            left: `${pointerPos}%`,
            background: isSafe ? 'var(--color-chart-cyan)' : 'var(--color-status-warning)',
            boxShadow: `0 0 8px ${isSafe ? 'rgba(0,242,255,0.7)' : 'rgba(245,158,11,0.7)'}`,
          }}
        />
      </div>
      <div className="ph-meter-scale">
        <span className="text-label-sm">{min}</span>
        <span className="text-label-sm">安全区间 {safeRange[0]}–{safeRange[1]}</span>
        <span className="text-label-sm">{max}</span>
      </div>
      <div className="ph-meter-value">
        <span className="text-data-display" style={{ fontSize: 22, color: isSafe ? undefined : 'var(--color-status-warning)' }}>
          {value.toFixed(2)}
        </span>
        <span className="text-label-sm">pH</span>
      </div>
    </div>
  );
}
