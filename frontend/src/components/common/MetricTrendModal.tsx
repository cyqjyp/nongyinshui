import { Modal } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { MetricTrendData } from '../../mock/waterQuality';
import './MetricTrendModal.css';

interface MetricTrendModalProps {
  open: boolean;
  positionLabel: string;
  metric: MetricTrendData | null;
  onClose: () => void;
}

export default function MetricTrendModal({ open, positionLabel, metric, onClose }: MetricTrendModalProps) {
  if (!metric) return null;

  const categories = metric.data.map((p) => p.date);
  const values = metric.data.map((p) => p.value);

  const markLines: { yAxis: number; label: string; lineStyle: { color: string; type: string } }[] = [];

  if (metric.limitType === 'range') {
    markLines.push(
      { yAxis: metric.limitValue[0], label: `下限 ${metric.limitValue[0]}`, lineStyle: { color: '#f59e0b', type: 'dashed' } },
      { yAxis: metric.limitValue[1], label: `上限 ${metric.limitValue[1]}`, lineStyle: { color: '#f59e0b', type: 'dashed' } },
    );
  } else if (metric.limitType === 'max') {
    markLines.push({
      yAxis: metric.limitValue[1],
      label: `限值 ${metric.limitValue[1]}`,
      lineStyle: { color: '#f59e0b', type: 'dashed' },
    });
  } else if (metric.limitType === 'min') {
    markLines.push({
      yAxis: metric.limitValue[0],
      label: `限值 ${metric.limitValue[0]}`,
      lineStyle: { color: '#f59e0b', type: 'dashed' },
    });
  }

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 48, right: 24, top: 20, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(22,30,45,0.95)',
      borderColor: 'rgba(0,242,255,0.2)',
      textStyle: { color: '#dde2f1', fontFamily: 'JetBrains Mono', fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `${p.name}<br/>${metric.metricLabel}: ${p.value}${metric.unit}`;
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#3a494b' } },
      axisLabel: { color: '#849495', fontFamily: 'JetBrains Mono', fontSize: 11 },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: metric.unit || undefined,
      nameTextStyle: { color: '#849495', fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: '#849495', fontFamily: 'JetBrains Mono', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00f2ff', width: 2 },
        itemStyle: { color: '#00f2ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,242,255,0.3)' },
              { offset: 1, color: 'rgba(0,242,255,0)' },
            ],
          },
        },
        markLine:
          markLines.length > 0
            ? {
                symbol: 'none',
                label: { color: '#b9cacb', fontSize: 11, position: 'end' },
                lineStyle: { type: 'dashed', width: 1 },
                data: markLines.map((m) => ({ yAxis: m.yAxis, name: m.label, lineStyle: { color: m.lineStyle.color, type: m.lineStyle.type } })),
              }
            : undefined,
      },
    ],
  };

  return (
    <Modal
      title={`${positionLabel} - ${metric.metricLabel} 近7日趋势`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      className="metric-trend-modal"
    >
      <div className="mtm-info-bar">
        <span className="mtm-limit-label">标准限值：</span>
        <span className="mtm-limit-value">{metric.limit}</span>
      </div>
      <ReactECharts option={option} style={{ height: 320, width: '100%' }} />
    </Modal>
  );
}
