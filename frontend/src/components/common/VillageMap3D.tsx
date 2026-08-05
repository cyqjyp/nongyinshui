import { useMemo } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import ReactECharts from 'echarts-for-react';
import { countyGeoJson, COUNTY_MAP_NAME } from '../../mock/countyGeo';
import type { OperationalStatus, Village, VillageSummary, WaterPoint } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
echarts.registerMap(COUNTY_MAP_NAME, countyGeoJson as any);

const STATUS_COLOR: Record<OperationalStatus, string> = {
  running: '#00ff41',
  warning: '#f59e0b',
  fault: '#ff3131',
  stopped: '#94a3b8',
};

interface VillageMap3DProps {
  villages: Village[];
  waterPoints: WaterPoint[];
  villageSummaries: VillageSummary[];
  height?: number;
}

export default function VillageMap3D({ villages, waterPoints, villageSummaries, height = 420 }: VillageMap3DProps) {
  const option = useMemo(() => {
    const regionData = villages.map((village) => {
      const summary = villageSummaries.find((s) => s.villageId === village.id);
      const passRate = summary?.qualityPassRate ?? 100;
      const hasAlert = (summary?.pendingAlerts ?? 0) > 0;
      const color = hasAlert ? '#7a3b12' : passRate >= 90 ? '#0d3b3f' : '#4a3a12';
      return {
        name: village.name,
        value: passRate,
        itemStyle: {
          color,
          opacity: 0.92,
          borderWidth: 1.2,
          borderColor: hasAlert ? '#ff3131' : '#00dbe7',
        },
      };
    });

    const scatterData = waterPoints.map((wp) => {
      const village = villages.find((v) => v.id === wp.villageId);
      return {
        name: wp.name,
        value: [wp.location.lng, wp.location.lat, Math.max(Math.sqrt(wp.coveredPopulation) / 2.4, 9)],
        itemStyle: { color: STATUS_COLOR[wp.status] },
        villageName: village?.name ?? '',
        status: wp.status,
        coveredPopulation: wp.coveredPopulation,
      };
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(22,30,45,0.95)',
        borderColor: 'rgba(0,242,255,0.25)',
        textStyle: { color: '#dde2f1', fontFamily: 'JetBrains Mono', fontSize: 12 },
        formatter: (params: {
          seriesType?: string;
          name?: string;
          value?: number;
          data?: Record<string, unknown>;
        }) => {
          if (params.seriesType === 'scatter3D') {
            const d = params.data ?? {};
            return `<strong>${params.name}</strong><br/>所属村庄:${d.villageName}<br/>运行状态:${
              d.status === 'running' ? '运行中' : d.status === 'warning' ? '预警' : d.status === 'fault' ? '故障' : '停用'
            }<br/>覆盖人口:${d.coveredPopulation}人`;
          }
          return `<strong>${params.name}</strong><br/>水质达标率:${params.value}%`;
        },
      },
      geo3D: {
        map: COUNTY_MAP_NAME,
        shading: 'lambert',
        environment: '#0a0f18',
        light: {
          main: { intensity: 1.3, shadow: false, alpha: 45, beta: 25 },
          ambient: { intensity: 0.55 },
        },
        viewControl: {
          alpha: 42,
          beta: 15,
          distance: 110,
          autoRotate: true,
          autoRotateSpeed: 3,
          panMouseButton: 'left',
          rotateMouseButton: 'right',
        },
        regionHeight: 3,
        groundPlane: { show: true, color: '#05080d' },
        itemStyle: {
          color: '#111826',
          borderWidth: 0.6,
          borderColor: 'rgba(0, 219, 231, 0.35)',
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            distance: 4,
            color: '#00f2ff',
            fontFamily: 'JetBrains Mono',
            fontSize: 12,
            backgroundColor: 'rgba(10,15,24,0.75)',
            padding: [3, 6],
            borderRadius: 2,
          },
          itemStyle: { color: '#1a4a4d' },
        },
        data: regionData,
      },
      series: [
        {
          type: 'scatter3D',
          coordinateSystem: 'geo3D',
          symbolSize: (val: number[]) => val[2],
          data: scatterData,
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              formatter: (p: { name?: string }) => p.name ?? '',
              color: '#00f2ff',
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              position: 'top',
            },
          },
          itemStyle: { opacity: 0.95 },
        },
      ],
    };
  }, [villages, waterPoints, villageSummaries]);

  return (
    <ReactECharts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      option={option as any}
      style={{ height, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
