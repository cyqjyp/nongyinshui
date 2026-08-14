import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SmartVillageProfile } from '../../mock/smartVillage';

interface SupplyFlowMapProps {
  profile: SmartVillageProfile;
  villageName: string;
}

// 村庄中心坐标（模拟）
const VILLAGE_CENTERS: Record<string, [number, number]> = {
  '青溪村': [27.85, 119.95],
  '石桥村': [27.82, 119.92],
  '梅岭村': [27.88, 119.98],
};

// 设施类型定义
interface FacilityNode {
  id: string;
  name: string;
  type: 'source' | 'plant' | 'pump' | 'pool' | 'monitor-source' | 'monitor-finished' | 'valve' | 'user';
  status: 'normal' | 'warning' | 'fault' | 'offline';
  lat: number;
  lng: number;
  detail: string;
  step?: number;
}

interface Pipeline {
  from: string;
  to: string;
}

// 3D 建筑 SVG 图标
function getBuildingSVG(type: string, status: string): string {
  const glow = status === 'fault' ? '#ff4d4f' : status === 'warning' ? '#faad14' : '#00dbe7';

  const svgs: Record<string, string> = {
    source: `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="20" ry="5" fill="#000" opacity="0.2"/>
      <!-- 水面 -->
      <ellipse cx="28" cy="44" rx="18" ry="5" fill="#00b4d8" opacity="0.25"/>
      <!-- 水坝主体 3D - 正面 -->
      <polygon points="12,22 44,22 40,42 16,42" fill="#2563eb"/>
      <!-- 水坝主体 3D - 左侧面 -->
      <polygon points="12,22 16,42 16,44 12,24" fill="#1d4ed8"/>
      <!-- 水坝主体 3D - 顶面 -->
      <polygon points="12,22 44,22 40,18 8,18" fill="#3b82f6"/>
      <!-- 水流效果 -->
      <path d="M22,26 Q28,34 34,26" stroke="${glow}" stroke-width="2" fill="none" opacity="0.9"/>
      <path d="M20,30 Q28,38 36,30" stroke="${glow}" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M24,34 Q28,40 32,34" stroke="${glow}" stroke-width="1" fill="none" opacity="0.4"/>
      <!-- 顶部发光 -->
      <circle cx="28" cy="18" r="3" fill="${glow}" opacity="0.6"/>
    </svg>`,
    plant: `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="22" ry="5" fill="#000" opacity="0.2"/>
      <!-- 主厂房 3D - 正面 -->
      <polygon points="8,44 8,26 22,18 22,44" fill="#475569"/>
      <!-- 主厂房 3D - 顶面 -->
      <polygon points="8,26 22,18 36,26 22,34" fill="#64748b"/>
      <!-- 主厂房 3D - 右侧面 -->
      <polygon points="22,34 36,26 36,44 22,44" fill="#334155"/>
      <!-- 烟囱 -->
      <rect x="26" y="10" width="5" height="14" fill="#64748b"/>
      <rect x="26" y="10" width="5" height="3" fill="#94a3b8"/>
      <!-- 烟囱烟雾 -->
      <circle cx="28" cy="7" r="3" fill="#94a3b8" opacity="0.4"/>
      <circle cx="30" cy="4" r="2" fill="#94a3b8" opacity="0.2"/>
      <!-- 窗户发光 -->
      <rect x="12" y="28" width="5" height="5" fill="${glow}" opacity="0.8" rx="1"/>
      <rect x="12" y="36" width="5" height="5" fill="${glow}" opacity="0.6" rx="1"/>
      <rect x="26" y="36" width="5" height="5" fill="${glow}" opacity="0.5" rx="1"/>
    </svg>`,
    pump: `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="20" ry="5" fill="#000" opacity="0.2"/>
      <!-- 泵房 3D - 正面 -->
      <polygon points="14,44 14,28 28,20 28,44" fill="#475569"/>
      <!-- 泵房 3D - 顶面 -->
      <polygon points="14,28 28,20 42,28 28,36" fill="#64748b"/>
      <!-- 泵房 3D - 右侧面 -->
      <polygon points="28,36 42,28 42,44 28,44" fill="#334155"/>
      <!-- 进水管道 -->
      <rect x="2" y="34" width="14" height="5" fill="#00b4d8" rx="2"/>
      <rect x="2" y="34" width="14" height="2" fill="#00dbe7" rx="1" opacity="0.5"/>
      <!-- 出水管道 -->
      <rect x="40" y="34" width="14" height="5" fill="#00b4d8" rx="2"/>
      <rect x="40" y="34" width="14" height="2" fill="#00dbe7" rx="1" opacity="0.5"/>
      <!-- 齿轮 -->
      <circle cx="28" cy="32" r="5" fill="none" stroke="${glow}" stroke-width="2"/>
      <circle cx="28" cy="32" r="2" fill="${glow}"/>
      <!-- 齿轮齿 -->
      <line x1="28" y1="26" x2="28" y2="28" stroke="${glow}" stroke-width="2"/>
      <line x1="28" y1="36" x2="28" y2="38" stroke="${glow}" stroke-width="2"/>
      <line x1="22" y1="32" x2="24" y2="32" stroke="${glow}" stroke-width="2"/>
      <line x1="32" y1="32" x2="34" y2="32" stroke="${glow}" stroke-width="2"/>
    </svg>`,
    pool: `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="18" ry="5" fill="#000" opacity="0.2"/>
      <!-- 支架 -->
      <line x1="18" y1="46" x2="22" y2="32" stroke="#475569" stroke-width="3"/>
      <line x1="38" y1="46" x2="34" y2="32" stroke="#475569" stroke-width="3"/>
      <!-- 水塔主体 3D - 正面 -->
      <polygon points="16,32 16,18 40,18 40,32" fill="#475569"/>
      <!-- 水塔主体 3D - 顶面 -->
      <polygon points="16,18 40,18 36,14 20,14" fill="#64748b"/>
      <!-- 水塔主体 3D - 右侧面 -->
      <polygon points="40,18 40,32 36,32 36,18" fill="#334155"/>
      <!-- 水面 -->
      <ellipse cx="28" cy="24" rx="10" ry="4" fill="#00b4d8" opacity="0.5"/>
      <!-- 顶部盖子 -->
      <polygon points="18,14 38,14 34,10 22,10" fill="#94a3b8"/>
      <!-- 发光指示 -->
      <circle cx="28" cy="10" r="2" fill="${glow}"/>
    </svg>`,
    'monitor-source': `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="18" ry="5" fill="#000" opacity="0.2"/>
      <!-- 监测站 3D - 正面 -->
      <polygon points="16,44 16,30 28,22 28,44" fill="#475569"/>
      <!-- 监测站 3D - 顶面 -->
      <polygon points="16,30 28,22 40,30 28,38" fill="#64748b"/>
      <!-- 监测站 3D - 右侧面 -->
      <polygon points="28,38 40,30 40,44 28,44" fill="#334155"/>
      <!-- 天线杆 -->
      <line x1="28" y1="22" x2="28" y2="8" stroke="#94a3b8" stroke-width="2.5"/>
      <!-- 天线球 -->
      <circle cx="28" cy="7" r="3" fill="${glow}"/>
      <!-- 信号波 -->
      <path d="M22,11 Q28,8 34,11" stroke="${glow}" stroke-width="1.5" fill="none" opacity="0.7"/>
      <path d="M19,14 Q28,10 37,14" stroke="${glow}" stroke-width="1" fill="none" opacity="0.4"/>
      <!-- 屏幕 -->
      <rect x="20" y="32" width="6" height="4" fill="${glow}" opacity="0.6" rx="1"/>
    </svg>`,
    'monitor-finished': `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="50" rx="18" ry="5" fill="#000" opacity="0.2"/>
      <polygon points="16,44 16,30 28,22 28,44" fill="#475569"/>
      <polygon points="16,30 28,22 40,30 28,38" fill="#64748b"/>
      <polygon points="28,38 40,30 40,44 28,44" fill="#334155"/>
      <line x1="28" y1="22" x2="28" y2="8" stroke="#94a3b8" stroke-width="2.5"/>
      <circle cx="28" cy="7" r="3" fill="${glow}"/>
      <path d="M22,11 Q28,8 34,11" stroke="${glow}" stroke-width="1.5" fill="none" opacity="0.7"/>
      <path d="M19,14 Q28,10 37,14" stroke="${glow}" stroke-width="1" fill="none" opacity="0.4"/>
      <rect x="20" y="32" width="6" height="4" fill="${glow}" opacity="0.6" rx="1"/>
    </svg>`,
    valve: `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="22" ry="5" fill="#000" opacity="0.2"/>
      <!-- 主管道 -->
      <rect x="2" y="30" width="52" height="8" fill="#475569" rx="3"/>
      <rect x="2" y="30" width="52" height="3" fill="#64748b" rx="2" opacity="0.5"/>
      <!-- 管道内水流 -->
      <rect x="4" y="32" width="48" height="3" fill="#00b4d8" opacity="0.4" rx="1"/>
      <!-- 阀门主体 3D -->
      <polygon points="20,30 20,20 36,20 36,30" fill="#64748b"/>
      <polygon points="20,20 36,20 32,16 24,16" fill="#94a3b8"/>
      <!-- 手轮 -->
      <circle cx="28" cy="14" r="5" fill="none" stroke="${glow}" stroke-width="2.5"/>
      <line x1="28" y1="9" x2="28" y2="19" stroke="${glow}" stroke-width="2"/>
      <line x1="23" y1="14" x2="33" y2="14" stroke="${glow}" stroke-width="2"/>
      <!-- 手轮中心 -->
      <circle cx="28" cy="14" r="2" fill="${glow}"/>
    </svg>`,
    user: `<svg viewBox="0 0 56 56" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <!-- 底座阴影 -->
      <ellipse cx="28" cy="50" rx="22" ry="5" fill="#000" opacity="0.2"/>
      <!-- 房屋1 3D -->
      <polygon points="4,44 4,30 16,22 16,44" fill="#475569"/>
      <polygon points="4,30 16,22 28,30 16,38" fill="#64748b"/>
      <polygon points="16,38 28,30 28,44 16,44" fill="#334155"/>
      <!-- 房屋2 3D -->
      <polygon points="30,44 30,34 40,26 40,44" fill="#475569"/>
      <polygon points="30,34 40,26 50,34 40,42" fill="#64748b"/>
      <polygon points="40,42 50,34 50,44 40,44" fill="#334155"/>
      <!-- 屋顶 -->
      <polygon points="2,30 16,22 16,24 2,32" fill="#94a3b8"/>
      <polygon points="28,34 40,26 40,28 28,36" fill="#94a3b8"/>
      <!-- 窗户灯光 -->
      <rect x="8" y="32" width="4" height="4" fill="#fbbf24" opacity="0.9" rx="1"/>
      <rect x="8" y="38" width="4" height="4" fill="#fbbf24" opacity="0.7" rx="1"/>
      <rect x="34" y="36" width="4" height="4" fill="#fbbf24" opacity="0.8" rx="1"/>
      <!-- 烟囱 -->
      <rect x="10" y="24" width="3" height="6" fill="#64748b"/>
    </svg>`,
  };
  return svgs[type] || svgs.source;
}

// 创建自定义图标
function createFacilityIcon(type: string, status: string, step?: number): L.DivIcon {
  const colorMap: Record<string, string> = {
    normal: '#52c41a',
    warning: '#faad14',
    fault: '#ff4d4f',
    offline: '#8c8c8c',
  };
  const color = colorMap[status] || '#00dbe7';
  const svg = getBuildingSVG(type, status);

  return L.divIcon({
    className: 'facility-marker',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        ${step !== undefined ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:#00dbe7;color:#0f172a;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:2;box-shadow:0 0 8px #00dbe7;">${step}</div>` : ''}
        <div style="position:relative;filter:drop-shadow(0 4px 8px ${color}50);">
          ${svg}
        </div>
        <div style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:32px;height:6px;background:${color};border-radius:50%;opacity:0.3;filter:blur(3px);"></div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -30],
  });
}

// 地图自适应组件
function FitBounds({ nodes }: { nodes: FacilityNode[] }) {
  const map = useMap();
  useEffect(() => {
    if (nodes.length === 0) return;
    const bounds = L.latLngBounds(nodes.map(n => [n.lat, n.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [nodes, map]);
  return null;
}

export default function SupplyFlowMap({ profile, villageName }: SupplyFlowMapProps) {
  const center = VILLAGE_CENTERS[villageName] || [27.85, 119.95];

  // 构建设施节点
  const nodes: FacilityNode[] = [];
  const pipelines: Pipeline[] = [];

  // 1. 水源地
  profile.waterUsageData.sourceTypes.forEach((s, i) => {
    nodes.push({
      id: `source-${i}`,
      name: `${s.type}(${s.count}处)`,
      type: 'source',
      status: 'normal',
      lat: center[0] + 0.015 + i * 0.008,
      lng: center[1] - 0.02 + i * 0.005,
      detail: `${s.type}水源，共${s.count}处`,
      step: 1,
    });
  });

  // 2. 水源水质监测
  const sourceMonitorId = 'source-monitor';
  nodes.push({
    id: sourceMonitorId,
    name: '水源水质监测',
    type: 'monitor-source',
    status: profile.sourceWater.online ? 'normal' : 'offline',
    lat: center[0] + 0.01,
    lng: center[1] - 0.01,
    detail: profile.sourceWater.metrics.map(m => `${m.label}: ${m.value}${m.unit}`).join('\n'),
  });

  // 3. 水厂/泵站
  profile.pumpStations.forEach((ps, i) => {
    const isPlant = ps.name.includes('水厂');
    nodes.push({
      id: `pump-${i}`,
      name: ps.name.replace(/^\d+#\s*/, ''),
      type: isPlant ? 'plant' : 'pump',
      status: ps.status === 'running' ? 'normal' : ps.status === 'warning' ? 'warning' : 'fault',
      lat: center[0] + 0.005 - i * 0.006,
      lng: center[1] + i * 0.008,
      detail: `进水: ${ps.inletPressure}MPa\n出水: ${ps.outletPressure}MPa\n流量: ${ps.flowRate}m³/h`,
      step: isPlant ? 2 : 4,
    });
  });

  // 4. 出厂水质监测
  const finishedMonitorId = 'finished-monitor';
  const finishedStatus = profile.finishedWater.statusText.includes('异常')
    ? 'fault'
    : profile.finishedWater.statusText.includes('偏低') || profile.finishedWater.statusText.includes('需关注')
      ? 'warning'
      : 'normal';
  nodes.push({
    id: finishedMonitorId,
    name: '出厂水质监测',
    type: 'monitor-finished',
    status: finishedStatus,
    lat: center[0] - 0.003,
    lng: center[1] + 0.012,
    detail: profile.finishedWater.metrics.map(m => `${m.label}: ${m.value}${m.unit}`).join('\n'),
  });

  // 5. 高位水池（如果有）
  profile.pumpStations.forEach((ps, i) => {
    if (ps.name.includes('高位') || ps.name.includes('水池')) {
      nodes.push({
        id: `pool-${i}`,
        name: ps.name.replace(/^\d+#\s*/, ''),
        type: 'pool',
        status: ps.status === 'running' ? 'normal' : 'warning',
        lat: center[0] - 0.008 + i * 0.004,
        lng: center[1] + 0.015 + i * 0.005,
        detail: `进水: ${ps.inletPressure}MPa | 出水: ${ps.outletPressure}MPa`,
        step: 5,
      });
    }
  });

  // 6. 阀门
  profile.valves.forEach((v, i) => {
    nodes.push({
      id: `valve-${i}`,
      name: v.name,
      type: 'valve',
      status: v.status === '已开启' ? 'normal' : 'warning',
      lat: center[0] - 0.005 + i * 0.006,
      lng: center[1] + 0.018 + i * 0.004,
      detail: `${v.name}\n状态: ${v.status} (${v.openPercent}%)`,
      step: 6,
    });
  });

  // 7. 用户
  nodes.push({
    id: 'users',
    name: `${villageName}用户`,
    type: 'user',
    status: 'normal',
    lat: center[0] - 0.01,
    lng: center[1] + 0.025,
    detail: `${profile.basicInfo.households}户\n供水人口: ${Math.round(profile.basicInfo.households * 3.5)}人\n缴费率: ${profile.waterUsageData.paymentRate}%`,
    step: 7,
  });

  // 构建管线连接
  const sourceIds = nodes.filter(n => n.type === 'source').map(n => n.id);
  sourceIds.forEach(id => pipelines.push({ from: id, to: sourceMonitorId }));
  pipelines.push({ from: sourceMonitorId, to: 'pump-0' });

  // 泵站之间连接
  for (let i = 0; i < profile.pumpStations.length - 1; i++) {
    pipelines.push({ from: `pump-${i}`, to: `pump-${i + 1}` });
  }

  // 最后一个泵站到出厂监测
  const lastPumpIdx = profile.pumpStations.length - 1;
  pipelines.push({ from: `pump-${lastPumpIdx}`, to: finishedMonitorId });

  // 出厂监测到阀门
  profile.valves.forEach((_, i) => {
    pipelines.push({ from: finishedMonitorId, to: `valve-${i}` });
  });

  // 阀门到用户
  profile.valves.forEach((_, i) => {
    pipelines.push({ from: `valve-${i}`, to: 'users' });
  });

  // 获取节点坐标
  const getNode = (id: string) => nodes.find(n => n.id === id);
  const pipelineCoords = pipelines
    .map(p => {
      const from = getNode(p.from);
      const to = getNode(p.to);
      if (from && to) return [[from.lat, from.lng], [to.lat, to.lng]] as [[number, number], [number, number]];
      return null;
    })
    .filter(Boolean) as [[number, number], [number, number]][];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* 暗色卫星地图瓦片 */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <FitBounds nodes={nodes} />

        {/* 管线 */}
        {pipelineCoords.map((coords, i) => (
          <Polyline
            key={`pipe-${i}`}
            positions={coords}
            pathOptions={{
              color: '#00b4d8',
              weight: 3,
              opacity: 0.7,
              dashArray: '8, 4',
            }}
          />
        ))}

        {/* 设施标记 */}
        {nodes.map(node => (
          <Marker
            key={node.id}
            position={[node.lat, node.lng]}
            icon={createFacilityIcon(node.type, node.status, node.step)}
          >
            <Popup>
              <div style={{ minWidth: 160, color: '#1e293b' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{node.name}</div>
                <div style={{ whiteSpace: 'pre-line', fontSize: 12, color: '#475569' }}>{node.detail}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

    </div>
  );
}
