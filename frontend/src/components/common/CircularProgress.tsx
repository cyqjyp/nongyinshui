import './CircularProgress.css';

interface CircularProgressProps {
  percent: number;
  label?: string;
  size?: number;
  color?: string;
}

export default function CircularProgress({
  percent,
  label,
  size = 96,
  color = 'var(--color-chart-cyan)',
}: CircularProgressProps) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-container-high)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="circular-progress-arc"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="circular-progress-center">
        <span className="text-data-display" style={{ fontSize: size > 80 ? 20 : 16 }}>
          {percent}%
        </span>
        {label && <span className="text-label-sm">{label}</span>}
      </div>
    </div>
  );
}
