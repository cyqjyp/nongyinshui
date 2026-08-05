import ReactECharts from 'echarts-for-react';

export interface TrendSeries {
  name: string;
  color: string;
  data: number[];
  markLine?: { value: number; label: string }[];
}

interface TrendChartProps {
  categories: string[];
  series: TrendSeries[];
  height?: number;
  unit?: string;
  yMin?: number;
  yMax?: number;
}

export default function TrendChart({ categories, series, height = 260, unit, yMin, yMax }: TrendChartProps) {
  const option = {
    backgroundColor: 'transparent',
    grid: { left: 48, right: 24, top: series.length > 1 ? 36 : 20, bottom: 32 },
    legend:
      series.length > 1
        ? {
            top: 0,
            textStyle: { color: '#b9cacb', fontFamily: 'JetBrains Mono', fontSize: 11 },
            icon: 'circle',
          }
        : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(22,30,45,0.95)',
      borderColor: 'rgba(0,242,255,0.2)',
      textStyle: { color: '#dde2f1', fontFamily: 'JetBrains Mono', fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#3a494b' } },
      axisLabel: { color: '#849495', fontFamily: 'JetBrains Mono', fontSize: 10 },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: unit,
      min: yMin,
      max: yMax,
      nameTextStyle: { color: '#849495', fontSize: 10 },
      axisLine: { show: false },
      axisLabel: { color: '#849495', fontFamily: 'JetBrains Mono', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      showSymbol: false,
      lineStyle: { color: s.color, width: 2 },
      itemStyle: { color: s.color },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${s.color}4D` },
            { offset: 1, color: `${s.color}00` },
          ],
        },
      },
      markLine: s.markLine
        ? {
            symbol: 'none',
            label: { color: '#b9cacb', fontSize: 10 },
            lineStyle: { color: '#f59e0b', type: 'dashed', width: 1 },
            data: s.markLine.map((m) => ({ yAxis: m.value, name: m.label })),
          }
        : undefined,
    })),
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
