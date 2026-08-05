import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import './DashboardComponents.css';

interface DashboardChartBaseProps {
  height?: number | string;
  className?: string;
  ariaLabel: string;
  onEvents?: Record<string, (params: unknown) => void>;
}

export interface DashboardDonutDatum {
  name: string;
  value: number;
}

export interface DashboardDonutChartProps extends DashboardChartBaseProps {
  data: DashboardDonutDatum[];
  colors?: string[];
  centerText?: string;
  centerSubtext?: string;
  unit?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  onLegendClick?: (params: { name: string }) => void;
  onChartClick?: (params: { name?: string }) => void;
}

export interface DashboardLineSeries {
  name: string;
  data: number[];
  color?: string;
  area?: boolean;
}

export interface DashboardLineChartProps extends DashboardChartBaseProps {
  categories: string[];
  series: DashboardLineSeries[];
  unit?: string;
  yMin?: number;
  yMax?: number;
  showLegend?: boolean;
}

export interface DashboardBarSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface DashboardBarChartProps extends DashboardChartBaseProps {
  categories: string[];
  series: DashboardBarSeries[];
  unit?: string;
  horizontal?: boolean;
  showLegend?: boolean;
}

interface DashboardTheme {
  surface: string;
  surfaceCard: string;
  text: string;
  textMuted: string;
  outline: string;
  fontMono: string;
  cyan: string;
  teal: string;
  blue: string;
  green: string;
  orange: string;
  red: string;
}

const THEME_VARIABLES: Record<keyof DashboardTheme, string> = {
  surface: '--color-surface-container',
  surfaceCard: '--color-surface-card',
  text: '--color-on-surface',
  textMuted: '--color-on-surface-variant',
  outline: '--color-outline-variant',
  fontMono: '--font-mono',
  cyan: '--color-chart-cyan',
  teal: '--color-chart-teal',
  blue: '--color-chart-blue',
  green: '--color-status-running',
  orange: '--color-status-warning',
  red: '--color-status-fault',
};

function readTheme(): DashboardTheme {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(THEME_VARIABLES).map(([key, variable]) => [key, styles.getPropertyValue(variable).trim()]),
  ) as unknown as DashboardTheme;
}

function resolveColor(color: string | undefined, fallback: string) {
  if (!color) return fallback;
  const variable = color.match(/^var\((--[^)]+)\)$/)?.[1];
  return variable ? getComputedStyle(document.documentElement).getPropertyValue(variable).trim() : color;
}

function useDashboardTheme() {
  return useMemo(readTheme, []);
}

function chartStyle(height: number | string): CSSProperties {
  return { width: '100%', height: typeof height === 'number' ? `${height}px` : height };
}

function DashboardChart({
  option,
  height = 220,
  className = '',
  ariaLabel,
  onEvents,
}: DashboardChartBaseProps & { option: EChartsOption }) {
  return (
    <div
      className={['dashboard-chart', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={ariaLabel}
    >
      <ReactECharts
        option={option}
        notMerge
        lazyUpdate
        autoResize
        style={chartStyle(height)}
        opts={{ renderer: 'canvas' }}
        onEvents={onEvents}
      />
    </div>
  );
}

function EmptyChart({
  height = 220,
  ariaLabel,
}: Pick<DashboardChartBaseProps, 'height' | 'ariaLabel'>) {
  return (
    <div
      className="dashboard-chart-empty"
      role="status"
      aria-live="polite"
      style={chartStyle(height)}
    >
      {ariaLabel}：暂无数据
    </div>
  );
}

function hasSeriesData(series: ReadonlyArray<{ data: readonly number[] }>) {
  return series.some((item) => item.data.length > 0);
}

function axisStyle(theme: DashboardTheme) {
  return {
    axisLine: { lineStyle: { color: theme.outline } },
    axisTick: { show: false },
    axisLabel: {
      color: theme.textMuted,
      fontFamily: theme.fontMono,
      fontSize: 10,
    },
    splitLine: { lineStyle: { color: theme.outline, opacity: 0.35 } },
  };
}

function tooltipStyle(theme: DashboardTheme, trigger: 'axis' | 'item', unit?: string) {
  return {
    trigger,
    backgroundColor: theme.surface,
    borderColor: theme.outline,
    textStyle: {
      color: theme.text,
      fontFamily: theme.fontMono,
      fontSize: 12,
    },
    valueFormatter: unit ? (value: unknown) => `${String(value)}${unit}` : undefined,
  };
}

function legendStyle(theme: DashboardTheme) {
  return {
    top: 0,
    right: 0,
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    textStyle: {
      color: theme.textMuted,
      fontFamily: theme.fontMono,
      fontSize: 10,
    },
  };
}

export function DashboardDonutChart({
  data,
  colors,
  centerText,
  centerSubtext,
  unit,
  showLegend = true,
  showLabels = true,
  onLegendClick,
  onChartClick,
  ...chartProps
}: DashboardDonutChartProps) {
  const theme = useDashboardTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <EmptyChart height={chartProps.height} ariaLabel={chartProps.ariaLabel} />;
  }

  const palette = colors?.map((color, index) =>
    resolveColor(color, [theme.cyan, theme.teal, theme.blue, theme.orange, theme.red][index % 5]),
  ) ?? [theme.cyan, theme.teal, theme.blue, theme.orange, theme.red];
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    color: palette,
    tooltip: tooltipStyle(theme, 'item', unit),
    legend: showLegend ? { ...legendStyle(theme), bottom: 0, top: undefined } : undefined,
    title: centerText
      ? {
          text: centerText,
          subtext: centerSubtext,
          left: 'center',
          top: showLegend ? '34%' : '39%',
          textStyle: { color: theme.text, fontFamily: theme.fontMono, fontSize: 20, fontWeight: 700 },
          subtextStyle: { color: theme.textMuted, fontFamily: theme.fontMono, fontSize: 10 },
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: ['52%', '74%'],
        center: ['50%', showLegend ? '43%' : '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: theme.surfaceCard, borderWidth: 2 },
        label: showLabels
          ? { color: theme.text, fontFamily: theme.fontMono, fontSize: 10 }
          : { show: false },
        labelLine: showLabels ? { lineStyle: { color: theme.outline } } : { show: false },
        data,
      },
    ],
  };

  const events: Record<string, (params: unknown) => void> = {};
  if (onLegendClick) {
    events['legendselectchanged'] = (params: unknown) => {
      const p = params as { name: string };
      onLegendClick(p);
    };
  }
  if (onChartClick) {
    events['click'] = (params: unknown) => {
      const p = params as { name?: string; componentType?: string };
      if (p.componentType === 'series') {
        onChartClick({ name: p.name });
      }
    };
  }

  return <DashboardChart {...chartProps} option={option} onEvents={Object.keys(events).length > 0 ? events : undefined} />;
}

export function DashboardLineChart({
  categories,
  series,
  unit,
  yMin,
  yMax,
  showLegend,
  ...chartProps
}: DashboardLineChartProps) {
  const theme = useDashboardTheme();
  if (categories.length === 0 || series.length === 0 || !hasSeriesData(series)) {
    return <EmptyChart height={chartProps.height} ariaLabel={chartProps.ariaLabel} />;
  }

  const shouldShowLegend = showLegend ?? series.length > 1;
  const defaults = [theme.cyan, theme.teal, theme.blue, theme.orange, theme.red];
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    grid: { left: 44, right: 14, top: shouldShowLegend ? 34 : 16, bottom: 28, containLabel: false },
    tooltip: tooltipStyle(theme, 'axis', unit),
    legend: shouldShowLegend ? legendStyle(theme) : undefined,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories,
      ...axisStyle(theme),
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: unit,
      min: yMin,
      max: yMax,
      nameTextStyle: { color: theme.textMuted, fontFamily: theme.fontMono, fontSize: 10 },
      ...axisStyle(theme),
      axisLine: { show: false },
    },
    series: series.map((item, index) => {
      const color = resolveColor(item.color, defaults[index % defaults.length]);
      return {
        name: item.name,
        type: 'line' as const,
        data: item.data,
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        areaStyle: item.area ? { color, opacity: 0.12 } : undefined,
      };
    }),
  };

  return <DashboardChart {...chartProps} option={option} />;
}

export function DashboardBarChart({
  categories,
  series,
  unit,
  horizontal = false,
  showLegend,
  ...chartProps
}: DashboardBarChartProps) {
  const theme = useDashboardTheme();
  if (categories.length === 0 || series.length === 0 || !hasSeriesData(series)) {
    return <EmptyChart height={chartProps.height} ariaLabel={chartProps.ariaLabel} />;
  }

  const shouldShowLegend = showLegend ?? series.length > 1;
  const categoryAxis = {
    type: 'category' as const,
    data: categories,
    inverse: horizontal,
    ...axisStyle(theme),
    splitLine: { show: false },
  };
  const valueAxis = {
    type: 'value' as const,
    name: unit,
    nameTextStyle: { color: theme.textMuted, fontFamily: theme.fontMono, fontSize: 10 },
    ...axisStyle(theme),
    axisLine: { show: false },
  };
  const defaults = [theme.cyan, theme.teal, theme.blue, theme.orange, theme.red];
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      left: horizontal ? 66 : 44,
      right: 14,
      top: shouldShowLegend ? 34 : 16,
      bottom: 28,
      containLabel: false,
    },
    tooltip: tooltipStyle(theme, 'axis', unit),
    legend: shouldShowLegend ? legendStyle(theme) : undefined,
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: series.map((item, index) => ({
      name: item.name,
      type: 'bar' as const,
      data: item.data,
      barMaxWidth: 18,
      itemStyle: {
        color: resolveColor(item.color, defaults[index % defaults.length]),
        borderRadius: horizontal ? [0, 2, 2, 0] : [2, 2, 0, 0],
      },
    })),
  };

  return <DashboardChart {...chartProps} option={option} />;
}
