import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Select, Tag } from 'antd';
import {
  InfoCircleOutlined,
  CloudOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  InboxOutlined,
  ControlOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LockOutlined,
  SyncOutlined,
  PlusOutlined,
  MinusOutlined,
  AppstoreOutlined,
  DownOutlined,
} from '@ant-design/icons';
import TrendChart from '../../components/common/TrendChart';
import StatusPill from '../../components/common/StatusPill';
import SectionTitle from '../../components/common/SectionTitle';
import SupplyTrendArrow from './SupplyTrendArrow';
import { fetchVillages } from '../../services/waterPointService';
import { getSmartVillageProfile } from '../../mock/smartVillage';
import type { Village } from '../../types';
import './SmartVillage.css';

function generateTrendData(base: number, variance = 0.05): number[] {
  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin(i / 3) * variance;
    return Number((base + wave + (Math.random() - 0.5) * variance * 0.5).toFixed(2));
  });
}

function getMetricYRange(label: string): { yMin?: number; yMax?: number; unit?: string } {
  if (label.includes('pH')) return { yMin: 6, yMax: 8, unit: '' };
  if (label.includes('余氯')) return { yMin: 0, yMax: 1.2, unit: 'mg/L' };
  if (label.includes('浊度')) return { yMin: 0, yMax: 0.8, unit: 'NTU' };
  return {};
}

function calcPopupPosition(rect: DOMRect, width = 340, height = 260) {
  let left = rect.left;
  let top = rect.bottom + 6;

  if (top + height > window.innerHeight - 16) {
    top = rect.top - height - 6;
  }
  if (left + width > window.innerWidth - 16) {
    left = window.innerWidth - width - 16;
  }
  if (left < 16) left = 16;
  if (top < 16) top = 16;

  return { left, top };
}

export default function SmartVillagePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const trendPopupRef = useRef<HTMLDivElement>(null);
  const supplyPopupRef = useRef<HTMLDivElement>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState('v-01');
  const [alarmCollapsed, setAlarmCollapsed] = useState(true);
  const [trendPopup, setTrendPopup] = useState<{
    open: boolean;
    label: string;
    limit: string;
    data: number[];
    left: number;
    top: number;
  }>({ open: false, label: '', limit: '', data: [], left: 0, top: 0 });
  const [supplyPopup, setSupplyPopup] = useState<{
    open: boolean;
    change: number;
    rate: number;
    left: number;
    top: number;
  }>({ open: false, change: 0, rate: 0, left: 0, top: 0 });

  const openTrendPopup = (e: ReactMouseEvent<HTMLElement>, q: { label: string; value: number; limit: string }) => {
    e.stopPropagation();
    setSupplyPopup((prev) => ({ ...prev, open: false }));
    const rect = e.currentTarget.getBoundingClientRect();
    const { left, top } = calcPopupPosition(rect);
    setTrendPopup({
      open: true,
      label: q.label,
      limit: q.limit,
      data: generateTrendData(q.value),
      left,
      top,
    });
  };

  const openSupplyPopup = (
    e: ReactMouseEvent<HTMLButtonElement>,
    ps: { supplyChange: number; supplyChangeRate: number },
  ) => {
    e.stopPropagation();
    setTrendPopup((prev) => ({ ...prev, open: false }));
    const rect = e.currentTarget.getBoundingClientRect();
    const { left, top } = calcPopupPosition(rect, 220, 96);
    setSupplyPopup({
      open: true,
      change: ps.supplyChange,
      rate: ps.supplyChangeRate,
      left,
      top,
    });
  };

  useEffect(() => {
    if (!trendPopup.open && !supplyPopup.open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('.supply-trend-arrow') || target.closest('.smart-village-quality-chip')) {
        return;
      }
      if (trendPopup.open && trendPopupRef.current && !trendPopupRef.current.contains(target)) {
        setTrendPopup((prev) => ({ ...prev, open: false }));
      }
      if (supplyPopup.open && supplyPopupRef.current && !supplyPopupRef.current.contains(target)) {
        setSupplyPopup((prev) => ({ ...prev, open: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [trendPopup.open, supplyPopup.open]);

  const villageIdFromUrl = searchParams.get('villageId');

  useEffect(() => {
    fetchVillages().then(setVillages);
  }, []);

  useEffect(() => {
    if (villages.length === 0) return;
    const nextId =
      villageIdFromUrl && villages.some((v) => v.id === villageIdFromUrl)
        ? villageIdFromUrl
        : villages[0].id;
    setSelectedVillageId(nextId);
  }, [villages, villageIdFromUrl]);

  const handleVillageChange = (villageId: string) => {
    setSearchParams({ villageId });
  };

  const village = villages.find((v) => v.id === selectedVillageId);
  const profile = getSmartVillageProfile(selectedVillageId);

  const liquidCategories = useMemo(
    () => profile?.liquidLevels.series.clearPool.map((_, i) => `${String(i * 2).padStart(2, '0')}:00`) ?? [],
    [profile],
  );

  if (!profile || !village) {
    return null;
  }

  const finishedStatusClass =
    profile.finishedWater.statusText.includes('异常') || profile.finishedWater.statusText.includes('偏低')
      ? profile.finishedWater.statusText.includes('异常')
        ? 'fault'
        : 'warning'
      : '';

  return (
    <div className="smart-village-page">
      <div className="smart-village-toolbar">
        <SectionTitle title="智慧村庄" />
        <Select
          style={{ width: 220 }}
          value={selectedVillageId}
          options={villages.map((v) => ({ value: v.id, label: `${v.name} · ${v.township}` }))}
          onChange={handleVillageChange}
        />
      </div>

      <div className="smart-village-grid">
        <div className="smart-village-top">
          {/* 3D/航拍地图区 */}
          <div className="smart-village-map glass-card">
            <img src={profile.mapImage} alt={`${village.name}供水网络分布`} />
            <div className="smart-village-map-controls">
              <button type="button" className="smart-village-map-btn" aria-label="放大">
                <PlusOutlined />
              </button>
              <button type="button" className="smart-village-map-btn" aria-label="缩小">
                <MinusOutlined />
              </button>
              <button type="button" className="smart-village-map-btn" aria-label="图层">
                <AppstoreOutlined />
              </button>
            </div>
          </div>

          {/* 右侧信息栏 */}
          <div className="smart-village-sidebar">
            <div className="smart-village-glass smart-village-panel">
              <div className="smart-village-panel-header">
                <div className="smart-village-panel-title">
                  <InfoCircleOutlined />
                  基础信息
                </div>
              </div>
              <div className="smart-village-basic-grid">
                <div className="smart-village-basic-item">
                  <span>{village.name}</span>
                  <span>
                    {profile.basicInfo.households}
                    <small>户</small>
                  </span>
                </div>
                <div className="smart-village-basic-item">
                  <span>分区计量表</span>
                  <span>
                    {profile.basicInfo.zoneMeters}
                    <small>个</small>
                  </span>
                </div>
                <div className="smart-village-basic-item">
                  <span>供水泵站</span>
                  <span>
                    {profile.basicInfo.pumpStations}
                    <small>座</small>
                  </span>
                </div>
                <div className="smart-village-basic-item">
                  <span>水质仪</span>
                  <span>
                    {profile.basicInfo.qualityMonitors}
                    <small>个</small>
                  </span>
                </div>
                <div className="smart-village-basic-item">
                  <span>液位监测仪</span>
                  <span>
                    {profile.basicInfo.levelMonitors}
                    <small>个</small>
                  </span>
                </div>
                <div className="smart-village-basic-item">
                  <span>户表</span>
                  <span>
                    {profile.basicInfo.householdMeters}
                    <small>个</small>
                  </span>
                </div>
                <div className="smart-village-basic-item">
                  <span>漏损率</span>
                  <span>{profile.basicInfo.leakageRate}%</span>
                </div>
                <div className="smart-village-basic-item">
                  <span>供水人口</span>
                  <span>
                    {village.population}
                    <small>人</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="smart-village-glass smart-village-panel">
              <div className="smart-village-panel-header">
                <div className="smart-village-panel-title">
                  <CloudOutlined />
                  水源地水质监测仪
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="text-label-sm">{profile.sourceWater.online ? '在线' : '离线'}</span>
                  <span className={`smart-village-online-dot ${profile.sourceWater.online ? '' : 'offline'}`} />
                </div>
              </div>
              <div className="smart-village-metrics-grid">
                {profile.sourceWater.metrics.map((m) => (
                  <div key={m.label} className="smart-village-metric-cell">
                    <p>{m.label}</p>
                    <p className="metric-value">
                      {m.value}
                      {m.unit && <small style={{ fontSize: 11, fontWeight: 400 }}> {m.unit}</small>}
                    </p>
                    <div className="metric-limit">{m.limit}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="smart-village-glass smart-village-panel">
              <div className="smart-village-panel-header">
                <div className="smart-village-panel-title">
                  <SafetyCertificateOutlined />
                  出厂水质监测仪
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="text-label-sm">{profile.finishedWater.online ? '在线' : '离线'}</span>
                  <span className={`smart-village-online-dot ${profile.finishedWater.online ? '' : 'offline'}`} />
                </div>
              </div>
              <div className="smart-village-metrics-grid">
                {profile.finishedWater.metrics.map((m) => (
                  <div key={m.label} className="smart-village-metric-cell">
                    <p>{m.label}</p>
                    <p className="metric-value primary">
                      {m.value}
                      {m.unit && <small style={{ fontSize: 11, fontWeight: 400 }}> {m.unit}</small>}
                    </p>
                    <div className="metric-limit">{m.limit}</div>
                  </div>
                ))}
              </div>
              <div className={`smart-village-status-bar ${finishedStatusClass}`}>
                <span>{profile.finishedWater.statusText}</span>
                {finishedStatusClass ? <WarningOutlined /> : <CheckCircleOutlined />}
              </div>
            </div>
          </div>
        </div>

        {/* 底部三栏 */}
        <div className="smart-village-bottom">
          <div className="smart-village-glass smart-village-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="smart-village-panel-title" style={{ marginBottom: 8 }}>
              <BuildOutlined />
              供水泵站
            </div>
            <div className="smart-village-pump-list">
              {profile.pumpStations.map((ps) => (
                <div key={ps.id} className="smart-village-pump-card">
                  <div className="smart-village-pump-header">
                    <span className="text-label-sm" style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {ps.name}
                    </span>
                    <StatusPill status={ps.status} />
                  </div>
                  <div className="smart-village-pump-stats">
                    <div>
                      <p>进水压力</p>
                      <span className="value">{ps.inletPressure} MPa</span>
                    </div>
                    <div>
                      <p>出水压力</p>
                      <span className="value">{ps.outletPressure} MPa</span>
                    </div>
                    <div>
                      <p>瞬时流量</p>
                      <span className="value">{ps.flowRate} m³/h</span>
                    </div>
                    <div>
                      <p>供水总量</p>
                      <span className="value supply-total-row">
                        {ps.totalSupply} km³
                        <SupplyTrendArrow
                          positive={ps.supplyChange >= 0}
                          onClick={(e) => openSupplyPopup(e, ps)}
                        />
                      </span>
                    </div>
                  </div>
                  {ps.realtimeQuality && (
                    <div className="smart-village-quality-row">
                      {ps.realtimeQuality.map((q) => (
                        <div
                          key={q.label}
                          className="smart-village-quality-chip"
                          onClick={(e) => openTrendPopup(e, q)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              openTrendPopup(e as unknown as ReactMouseEvent<HTMLElement>, q);
                            }
                          }}
                        >
                          <p style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', margin: 0 }}>{q.label}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, margin: '2px 0', color: 'var(--color-secondary)' }}>
                            {q.value}
                          </p>
                          <span style={{ fontSize: 10, color: 'var(--color-outline)' }}>{q.limit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="smart-village-glass smart-village-panel">
            <div className="smart-village-panel-header">
              <div className="smart-village-panel-title">
                <InboxOutlined />
                液位监控
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Tag color={profile.liquidLevels.clearPool.status === '正常' ? 'success' : 'warning'}>
                  清水池: {profile.liquidLevels.clearPool.status}
                </Tag>
                <Tag color={profile.liquidLevels.rawPool.status === '正常' ? 'success' : 'warning'}>
                  原水池: {profile.liquidLevels.rawPool.status}
                </Tag>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
              <div>
                <p className="text-label-sm">清水池液位</p>
                <p className="text-data-display" style={{ fontSize: 18, color: '#00dbe7' }}>
                  {profile.liquidLevels.clearPool.current}
                  <small style={{ fontSize: 12 }}> m</small>
                </p>
              </div>
              <div>
                <p className="text-label-sm">原水池液位</p>
                <p className="text-data-display" style={{ fontSize: 18, color: 'var(--color-status-warning)' }}>
                  {profile.liquidLevels.rawPool.current}
                  <small style={{ fontSize: 12 }}> m</small>
                </p>
              </div>
            </div>
            <TrendChart
              height={100}
              categories={liquidCategories}
              series={[
                { name: '清水池', color: '#00F2FF', data: profile.liquidLevels.series.clearPool },
                { name: '原水池(24h)', color: '#F59E0B', data: profile.liquidLevels.series.rawPool },
              ]}
              unit="m"
            />
          </div>

          <div className="smart-village-glass smart-village-panel">
            <div className="smart-village-panel-title" style={{ marginBottom: 10 }}>
              <ControlOutlined />
              阀门状态
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.valves.map((valve) => (
                <div key={valve.name} className="smart-village-valve-item">
                  <div className={`smart-village-valve-icon ${valve.running ? '' : 'stopped'}`}>
                    {valve.running ? <SyncOutlined spin style={{ fontSize: 14 }} /> : <LockOutlined style={{ fontSize: 14 }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{valve.name}</span>
                      <span style={{ color: valve.running ? 'var(--color-status-running)' : 'var(--color-status-stopped)', fontSize: 12 }}>
                        {valve.status}
                      </span>
                    </div>
                    <div className="smart-village-valve-bar">
                      <div className="smart-village-valve-bar-fill" style={{ width: `${valve.openPercent}%`, background: valve.running ? undefined : 'var(--color-outline)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
                      <span>开度</span>
                      <span style={{ fontWeight: 600 }}>{valve.openPercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 实时报警浮窗 */}
      {profile.alarms.length > 0 && (
        <div className={`smart-village-alarm-float ${alarmCollapsed ? 'collapsed' : ''}`}>
          <div className="smart-village-alarm-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <WarningOutlined style={{ color: 'var(--color-status-fault)' }} />
              <span className="text-label-sm" style={{ fontWeight: 700 }}>
                实时报警
              </span>
              <Tag color="error">{profile.alarms.length}</Tag>
            </div>
            <DownOutlined
              style={{ cursor: 'pointer', transform: alarmCollapsed ? 'rotate(180deg)' : 'none', transition: '0.3s' }}
              onClick={() => setAlarmCollapsed((c) => !c)}
            />
          </div>
          <div className="smart-village-alarm-list">
            {profile.alarms.map((alarm) => (
              <div key={alarm.id} className="smart-village-alarm-item">
                <span>{alarm.message}</span>
                <time>{alarm.time}</time>
              </div>
            ))}
          </div>
        </div>
      )}

      {trendPopup.open && (
        <div
          ref={trendPopupRef}
          className="smart-village-trend-popup"
          style={{ left: trendPopup.left, top: trendPopup.top }}
        >
          <div className="smart-village-trend-popup-header">
            <span>{trendPopup.label}</span>
            <span className="text-label-sm">近24小时趋势</span>
          </div>
          <div className="metric-limit">{trendPopup.limit}</div>
          <TrendChart
            categories={trendPopup.data.map((_, i) => `${String(i).padStart(2, '0')}:00`)}
            series={[{ name: trendPopup.label, color: '#00F2FF', data: trendPopup.data }]}
            height={180}
            {...getMetricYRange(trendPopup.label)}
          />
        </div>
      )}

      {supplyPopup.open && (
        <div
          ref={supplyPopupRef}
          className="smart-village-supply-popup"
          style={{ left: supplyPopup.left, top: supplyPopup.top }}
        >
          <div className="smart-village-supply-popup-title">供水总量对比分析</div>
          <div className="smart-village-supply-popup-row">
            <span>较昨日值变化:</span>
            <span className={supplyPopup.change >= 0 ? 'positive' : 'negative'}>
              {supplyPopup.change >= 0 ? '+' : ''}
              {supplyPopup.change.toFixed(2)} km³
            </span>
          </div>
          <div className="smart-village-supply-popup-row">
            <span>变化率:</span>
            <span className={supplyPopup.rate >= 0 ? 'positive' : 'negative'}>
              {supplyPopup.rate >= 0 ? '+' : ''}
              {supplyPopup.rate.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
