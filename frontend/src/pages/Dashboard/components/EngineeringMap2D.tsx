import { useMemo, useState } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { countyGeoJson, COUNTY_MAP_NAME } from '../../../mock/countyGeo';
import type { OperationalStatus, Village, WaterPoint } from '../../../types';
import DashboardPanel from './DashboardPanel';
import './DashboardComponents.css';

if (!echarts.getMap(COUNTY_MAP_NAME)) {
  echarts.registerMap(
    COUNTY_MAP_NAME,
    countyGeoJson as unknown as Parameters<typeof echarts.registerMap>[1],
  );
}

type MapFilter = 'all' | 'running' | 'abnormal';

interface EngineeringMap2DProps {
  villages: Village[];
  waterPoints: WaterPoint[];
}

interface WaterPointMapDatum {
  name: string;
  value: [number, number, number];
  villageName: string;
  pointType: string;
  status: OperationalStatus;
  coveredPopulation: number;
  itemStyle: { color: string };
}

const FILTERS: Array<{ key: MapFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'running', label: '正常' },
  { key: 'abnormal', label: '预警/异常' },
];

const STATUS_COLOR: Record<OperationalStatus, string> = {
  running: '#00ff41',
  warning: '#f59e0b',
  fault: '#ff3131',
  stopped: '#94a3b8',
};

const STATUS_LABEL: Record<OperationalStatus, string> = {
  running: '运行中',
  warning: '预警',
  fault: '故障',
  stopped: '已停用',
};

const ABNORMAL_STATUSES = new Set<OperationalStatus>(['warning', 'fault', 'stopped']);

function matchesFilter(status: OperationalStatus, filter: MapFilter) {
  if (filter === 'all') return true;
  if (filter === 'running') return status === 'running';
  return ABNORMAL_STATUSES.has(status);
}

function safeText(value: string | number) {
  return echarts.format.encodeHTML(String(value));
}

export default function EngineeringMap2D({ villages, waterPoints }: EngineeringMap2DProps) {
  const [filter, setFilter] = useState<MapFilter>('all');
  const villageNames = useMemo(
    () => new Map(villages.map((village) => [village.id, village.name])),
    [villages],
  );
  const filteredWaterPoints = useMemo(
    () => waterPoints.filter((waterPoint) => matchesFilter(waterPoint.status, filter)),
    [filter, waterPoints],
  );

  const option = useMemo<EChartsOption>(() => {
    const scatterData: WaterPointMapDatum[] = filteredWaterPoints.map((waterPoint) => ({
      name: waterPoint.name,
      value: [
        waterPoint.location.lng,
        waterPoint.location.lat,
        Math.max(9, Math.min(18, Math.sqrt(waterPoint.coveredPopulation) / 2.5)),
      ],
      villageName: villageNames.get(waterPoint.villageId) ?? '未知村庄',
      pointType: waterPoint.type,
      status: waterPoint.status,
      coveredPopulation: waterPoint.coveredPopulation,
      itemStyle: { color: STATUS_COLOR[waterPoint.status] },
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22, 30, 45, 0.96)',
        borderColor: 'rgba(0, 242, 255, 0.28)',
        textStyle: {
          color: '#dde2f1',
          fontFamily: 'JetBrains Mono',
          fontSize: 12,
        },
        formatter: (params) => {
          if (Array.isArray(params)) return '';
          const datum = params.data as WaterPointMapDatum | undefined;
          if (!datum?.status) {
            return `<strong>${safeText(params.name)}</strong>`;
          }
          return [
            `<strong>${safeText(datum.name)}</strong>`,
            `所属村庄：${safeText(datum.villageName)}`,
            `工程类型：${safeText(datum.pointType)}`,
            `运行状态：${safeText(STATUS_LABEL[datum.status])}`,
            `覆盖人口：${safeText(datum.coveredPopulation)} 人`,
          ].join('<br/>');
        },
      },
      geo: {
        map: COUNTY_MAP_NAME,
        roam: true,
        layoutCenter: ['50%', '50%'],
        layoutSize: '92%',
        itemStyle: {
          areaColor: '#122833',
          borderColor: 'rgba(0, 242, 255, 0.58)',
          borderWidth: 1.2,
        },
        emphasis: {
          itemStyle: { areaColor: '#1a4850' },
          label: { color: '#e1fdff' },
        },
        select: {
          itemStyle: { areaColor: '#1a4850' },
          label: { color: '#e1fdff' },
        },
        label: {
          show: true,
          color: '#b9cacb',
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          backgroundColor: 'rgba(8, 14, 24, 0.66)',
          padding: [3, 5],
          borderRadius: 2,
        },
      },
      series: [
        {
          name: '供水点',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: scatterData,
          symbol: 'circle',
          symbolSize: (value) => Number((value as number[])[2] ?? 10),
          showEffectOn: 'render',
          rippleEffect: { scale: 2.6, brushType: 'stroke' },
          itemStyle: {
            borderColor: '#e1fdff',
            borderWidth: 1,
            shadowBlur: 8,
          },
          emphasis: {
            scale: 1.25,
            label: {
              show: true,
              formatter: '{b}',
              position: 'top',
              color: '#e1fdff',
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              backgroundColor: 'rgba(8, 14, 24, 0.88)',
              padding: [3, 5],
            },
          },
          zlevel: 2,
        },
      ],
    };
  }, [filteredWaterPoints, villageNames]);

  const filterControls = (
    <div className="dashboard-map-filters" role="group" aria-label="供水点状态筛选">
      {FILTERS.map((item) => (
        <button
          key={item.key}
          type="button"
          className="dashboard-map-filter"
          aria-pressed={filter === item.key}
          onClick={() => setFilter(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardPanel title="供水工程分布" extra={filterControls} className="dashboard-map-panel">
      <div
        className="dashboard-engineering-map"
        role={filteredWaterPoints.length > 0 ? 'img' : undefined}
        aria-label={
          filteredWaterPoints.length > 0
            ? `二维供水工程地图，当前显示${FILTERS.find((item) => item.key === filter)?.label ?? '全部'}供水点`
            : undefined
        }
      >
        {filteredWaterPoints.length > 0 ? (
          <ReactECharts
            option={option}
            notMerge
            lazyUpdate
            autoResize
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        ) : (
          <div className="dashboard-engineering-map-empty" role="status">
            当前筛选条件下暂无供水点
          </div>
        )}
      </div>
      <details className="dashboard-map-accessible-list">
        <summary>查看当前供水点文字信息（{filteredWaterPoints.length}）</summary>
        {filteredWaterPoints.length > 0 ? (
          <ul>
            {filteredWaterPoints.map((waterPoint) => (
              <li key={waterPoint.id} tabIndex={0}>
                <strong>{waterPoint.name}</strong>
                <span>村庄：{villageNames.get(waterPoint.villageId) ?? '未知村庄'}</span>
                <span>类型：{waterPoint.type}</span>
                <span>状态：{STATUS_LABEL[waterPoint.status]}</span>
                <span>覆盖人口：{waterPoint.coveredPopulation} 人</span>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status">当前筛选条件下暂无供水点</p>
        )}
      </details>
    </DashboardPanel>
  );
}
