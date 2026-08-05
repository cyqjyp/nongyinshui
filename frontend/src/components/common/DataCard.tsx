import type { ReactNode } from 'react';
import ReactECharts from 'echarts-for-react';
import './DataCard.css';

interface DataCardProps {
  title: string;
  value: string | number;
  unit?: string;
  accentColor?: string;
  trend?: number[];
  footer?: ReactNode;
  icon?: ReactNode;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const option = {
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}55` },
              { offset: 1, color: `${color}00` },
            ],
          },
        },
      },
    ],
    tooltip: { show: false },
  };
  return <ReactECharts option={option} style={{ height: 40, width: '100%' }} opts={{ renderer: 'svg' }} />;
}

export default function DataCard({
  title,
  value,
  unit,
  accentColor = 'var(--color-chart-cyan)',
  trend,
  footer,
  icon,
}: DataCardProps) {
  return (
    <div className="data-card glass-card" style={{ borderLeft: `2px solid ${accentColor}` }}>
      <div className="data-card-header">
        <span className="text-label-sm data-card-title">{title}</span>
        {icon && <span className="data-card-icon">{icon}</span>}
      </div>
      <div className="data-card-value-row">
        <span className="text-data-display">{value}</span>
        {unit && <span className="text-label-sm data-card-unit">{unit}</span>}
      </div>
      {trend && trend.length > 1 && (
        <div className="data-card-sparkline">
          <Sparkline data={trend} color={accentColor} />
        </div>
      )}
      {footer && <div className="data-card-footer">{footer}</div>}
    </div>
  );
}
