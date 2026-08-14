import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import {
  InfoCircleOutlined,
  CloudOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  AppstoreOutlined,
  DownOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import TrendChart from '../../components/common/TrendChart';
import StatusPill from '../../components/common/StatusPill';
import SectionTitle from '../../components/common/SectionTitle';
import SupplyTrendArrow from './SupplyTrendArrow';
import SupplyFlowMap from './SupplyFlowMap';
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

export default function SmartVillageDetail() {
  const { villageId } = useParams<{ villageId: string }>();
  const navigate = useNavigate();
  const trendPopupRef = useRef<HTMLDivElement>(null);
  const supplyPopupRef = useRef<HTMLDivElement>(null);
  const [villages, setVillages] = useState<Village[]>([]);
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

  const openTrendPopup = (e: ReactMouseEvent<HTMLElement>, q: { label: string; value: number; limit: string; series?: number[] }) => {
    e.stopPropagation();
    setSupplyPopup((prev) => ({ ...prev, open: false }));
    const rect = e.currentTarget.getBoundingClientRect();
    const { left, top } = calcPopupPosition(rect);
    setTrendPopup({
      open: true,
      label: q.label,
      limit: q.limit,
      data: q.series ?? generateTrendData(q.value),
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

  useEffect(() => {
    fetchVillages().then(setVillages);
  }, []);

  const village = villages.find((v) => v.id === villageId);
  const profile = getSmartVillageProfile(villageId || '');

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
      </div>

      <div className="smart-village-grid">
        {/* 左侧信息栏 */}
        <div className="smart-village-left-sidebar">
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
                  <div
                    key={m.label}
                    className="smart-village-metric-cell"
                    onClick={(e) => openTrendPopup(e, m)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        openTrendPopup(e as unknown as ReactMouseEvent<HTMLElement>, m);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <p>{m.label}</p>
                    <p className="metric-value">
                      {m.value}
                      {m.unit && <small style={{ fontSize: 11, fontWeight: 400 }}> {m.unit}</small>}
                    </p>
                    <div className="metric-limit">{m.limit}</div>
                  </div>
                ))}
              </div>
              <div className="smart-village-status-bar">
                <span>各项参数监测正常</span>
                <CheckCircleOutlined />
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
                  <div
                    key={m.label}
                    className="smart-village-metric-cell"
                    onClick={(e) => openTrendPopup(e, m)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        openTrendPopup(e as unknown as ReactMouseEvent<HTMLElement>, m);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
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

            {/* 供水泵站水质 */}
            <div className="smart-village-glass smart-village-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="smart-village-panel-title" style={{ marginBottom: 8 }}>
                <SafetyCertificateOutlined />
                供水泵站水质
              </div>
              {profile.pumpStations[0]?.realtimeQuality && (
                <div className="smart-village-quality-row">
                  {profile.pumpStations[0].realtimeQuality.map((q) => (
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
              <div className="smart-village-status-bar">
                <span>各项参数监测正常</span>
                <CheckCircleOutlined />
              </div>
            </div>
          </div>

          {/* 中间地图区 */}
          <div className="smart-village-map-wrapper">
            <div className="smart-village-map glass-card">
              <SupplyFlowMap profile={profile} villageName={village.name} />
            </div>
          </div>

          {/* 右侧信息栏 */}
          <div className="smart-village-right-sidebar">
            {/* 村庄漏损数据 */}
            <div className="smart-village-glass smart-village-panel">
              <div className="smart-village-panel-header">
                <div className="smart-village-panel-title">
                  <WarningOutlined />
                  村庄漏损数据
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="text-label-sm">供水量</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#00dbe7' }}>
                    {profile.leakageData.supplyVolume}
                    <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)' }}> m³</small>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="text-label-sm">用水量</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#00dbe7' }}>
                    {profile.leakageData.usageVolume}
                    <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)' }}> m³</small>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="text-label-sm">漏损率</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: profile.leakageData.leakageRate > 5 ? '#ff4d4f' : profile.leakageData.leakageRate > 3 ? '#faad14' : '#52c41a',
                  }}>
                    {profile.leakageData.leakageRate}
                    <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)' }}>%</small>
                  </span>
                </div>
              </div>
            </div>

            {/* 村庄用水数据 */}
            <div className="smart-village-glass smart-village-panel">
              <div className="smart-village-panel-header">
                <div className="smart-village-panel-title">
                  <InboxOutlined />
                  村庄用水数据
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span className="text-label-sm" style={{ display: 'block', marginBottom: 6 }}>用水来源</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.waterUsageData.sourceTypes.map((s) => (
                      <span
                        key={s.type}
                        style={{
                          padding: '2px 10px',
                          background: 'rgba(0, 219, 231, 0.1)',
                          border: '1px solid rgba(0, 219, 231, 0.3)',
                          borderRadius: 4,
                          fontSize: 12,
                          color: '#00dbe7',
                        }}
                      >
                        {s.type}
                        <span style={{ marginLeft: 4, color: 'rgba(255,255,255,0.5)' }}>{s.count}处</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="text-label-sm">月用水量</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#00dbe7' }}>
                    {profile.waterUsageData.monthlyUsage}
                    <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)' }}> m³</small>
                  </span>
                </div>
                <div style={{ borderTop: '1px solid rgba(58,73,75,0.3)', paddingTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span className="text-label-sm">集中供水户数</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)' }}>
                      {profile.waterUsageData.centralizedHouseholds} 户
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span className="text-label-sm">缴费率</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: profile.waterUsageData.paymentRate >= 90 ? '#52c41a' : profile.waterUsageData.paymentRate >= 80 ? '#faad14' : '#ff4d4f',
                    }}>
                      {profile.waterUsageData.paymentRate}
                      <small style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-on-surface-variant)' }}>%</small>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="text-label-sm">未缴费户数</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: '#ff4d4f' }}>
                      {profile.waterUsageData.unpaidHouseholds} 户
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 供水泵站数据 */}
            <div className="smart-village-glass smart-village-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="smart-village-panel-title" style={{ marginBottom: 8 }}>
                <BuildOutlined />
                供水泵站数据
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profile.pumpStations.map((ps) => (
                  <div key={ps.id} style={{ padding: 8, background: 'rgba(36, 42, 53, 0.2)', border: '1px solid rgba(58, 73, 75, 0.25)', borderRadius: 'var(--radius-lg)' }}>
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
