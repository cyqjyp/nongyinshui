import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  ToolOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import SectionTitle from '../../components/common/SectionTitle';
import { fetchVillages } from '../../services/waterPointService';
import { getSmartVillageProfile } from '../../mock/smartVillage';
import type { Village } from '../../types';

interface VillageStats {
  hasComplaint: boolean;
  hasAbnormalUsage: boolean;
  hasInspectionOrder: boolean;
  leakageExceeded: boolean;
  paymentAbnormal: boolean;
  waterQualityAbnormal: boolean;
}

export default function SmartVillageOverview() {
  const navigate = useNavigate();
  const [villages, setVillages] = useState<Village[]>([]);
  const [filter, setFilter] = useState<'all' | 'abnormal' | 'normal'>('all');
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchVillages().then(setVillages);
  }, []);

  const getVillageStats = (villageId: string): VillageStats => {
    const profile = getSmartVillageProfile(villageId);
    if (!profile) {
      return {
        hasComplaint: false,
        hasAbnormalUsage: false,
        hasInspectionOrder: false,
        leakageExceeded: false,
        paymentAbnormal: false,
        waterQualityAbnormal: false,
      };
    }

    const leakageExceeded = profile.leakageData.leakageRate > 5;
    const paymentAbnormal = profile.waterUsageData.paymentRate < 80;
    const waterQualityAbnormal =
      profile.finishedWater.statusText.includes('异常') ||
      profile.finishedWater.statusText.includes('偏低');

    return {
      hasComplaint: false,
      hasAbnormalUsage: false,
      hasInspectionOrder: profile.alarms.length > 0,
      leakageExceeded,
      paymentAbnormal,
      waterQualityAbnormal,
    };
  };

  const villageStatsMap = villages.reduce<Record<string, VillageStats>>((acc, v) => {
    acc[v.id] = getVillageStats(v.id);
    return acc;
  }, {});

  const complaintCount = villages.filter((v) => villageStatsMap[v.id]?.hasComplaint).length;
  const abnormalUsageCount = villages.filter((v) => villageStatsMap[v.id]?.hasAbnormalUsage).length;
  const inspectionCount = villages.filter((v) => villageStatsMap[v.id]?.hasInspectionOrder).length;
  const leakageExceededCount = villages.filter((v) => villageStatsMap[v.id]?.leakageExceeded).length;
  const paymentAbnormalCount = villages.filter((v) => villageStatsMap[v.id]?.paymentAbnormal).length;
  const waterQualityAbnormalCount = villages.filter(
    (v) => villageStatsMap[v.id]?.waterQualityAbnormal,
  ).length;

  const filteredVillages = villages.filter((v) => {
    const stats = villageStatsMap[v.id];

    // 指标筛选
    if (activeMetric === 'complaint' && !stats.hasComplaint) return false;
    if (activeMetric === 'abnormalUsage' && !stats.hasAbnormalUsage) return false;
    if (activeMetric === 'inspection' && !stats.hasInspectionOrder) return false;
    if (activeMetric === 'leakage' && !stats.leakageExceeded) return false;
    if (activeMetric === 'payment' && !stats.paymentAbnormal) return false;
    if (activeMetric === 'waterQuality' && !stats.waterQualityAbnormal) return false;

    if (filter === 'abnormal') {
      return (
        stats.hasComplaint ||
        stats.hasAbnormalUsage ||
        stats.hasInspectionOrder ||
        stats.leakageExceeded ||
        stats.paymentAbnormal ||
        stats.waterQualityAbnormal
      );
    }
    if (filter === 'normal') {
      return (
        !stats.hasComplaint &&
        !stats.hasAbnormalUsage &&
        !stats.hasInspectionOrder &&
        !stats.leakageExceeded &&
        !stats.paymentAbnormal &&
        !stats.waterQualityAbnormal
      );
    }
    return true;
  });

  const handleMetricClick = (metric: string) => {
    if (activeMetric === metric) {
      setActiveMetric(null);
    } else {
      setActiveMetric(metric);
      setFilter('all');
    }
  };

  const getVillageStatus = (stats: VillageStats) => {
    if (stats.waterQualityAbnormal || stats.leakageExceeded) return 'abnormal';
    if (stats.hasInspectionOrder || stats.paymentAbnormal) return 'warning';
    return 'normal';
  };

  return (
    <div style={{ padding: 24, height: 'calc(100vh - 112px)', overflow: 'auto' }}>
      <SectionTitle icon={<HomeOutlined />} title="智慧村庄" />

      {/* 统计面板 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          className="glass-card"
          onClick={() => handleMetricClick('complaint')}
          style={{
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            border: activeMetric === 'complaint' ? '2px solid var(--color-status-fault)' : '1px solid rgba(58, 73, 75, 0.25)',
            boxShadow: activeMetric === 'complaint' ? '0 0 12px rgba(245, 82, 82, 0.3)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>投诉村庄</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-status-fault)' }}>{complaintCount}</div>
        </div>
        <div
          className="glass-card"
          onClick={() => handleMetricClick('abnormalUsage')}
          style={{
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            border: activeMetric === 'abnormalUsage' ? '2px solid var(--color-status-warning)' : '1px solid rgba(58, 73, 75, 0.25)',
            boxShadow: activeMetric === 'abnormalUsage' ? '0 0 12px rgba(255, 159, 10, 0.3)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>异常用水</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-status-warning)' }}>{abnormalUsageCount}</div>
        </div>
        <div
          className="glass-card"
          onClick={() => handleMetricClick('inspection')}
          style={{
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            border: activeMetric === 'inspection' ? '2px solid var(--color-secondary)' : '1px solid rgba(58, 73, 75, 0.25)',
            boxShadow: activeMetric === 'inspection' ? '0 0 12px rgba(12, 184, 182, 0.3)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>巡检工单</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-secondary)' }}>{inspectionCount}</div>
        </div>
        <div
          className="glass-card"
          onClick={() => handleMetricClick('leakage')}
          style={{
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            border: activeMetric === 'leakage' ? '2px solid var(--color-status-fault)' : '1px solid rgba(58, 73, 75, 0.25)',
            boxShadow: activeMetric === 'leakage' ? '0 0 12px rgba(245, 82, 82, 0.3)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>漏损超标</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-status-fault)' }}>{leakageExceededCount}</div>
        </div>
        <div
          className="glass-card"
          onClick={() => handleMetricClick('payment')}
          style={{
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            border: activeMetric === 'payment' ? '2px solid var(--color-status-warning)' : '1px solid rgba(58, 73, 75, 0.25)',
            boxShadow: activeMetric === 'payment' ? '0 0 12px rgba(255, 159, 10, 0.3)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>缴费异常</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-status-warning)' }}>{paymentAbnormalCount}</div>
        </div>
        <div
          className="glass-card"
          onClick={() => handleMetricClick('waterQuality')}
          style={{
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            border: activeMetric === 'waterQuality' ? '2px solid var(--color-status-fault)' : '1px solid rgba(58, 73, 75, 0.25)',
            boxShadow: activeMetric === 'waterQuality' ? '0 0 12px rgba(245, 82, 82, 0.3)' : 'none',
          }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>水质异常</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-status-fault)' }}>{waterQualityAbnormalCount}</div>
        </div>
      </div>

      {/* 筛选按钮 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => { setFilter('all'); setActiveMetric(null); }}
          style={{
            padding: '6px 16px',
            background: filter === 'all' ? 'var(--color-secondary)' : 'rgba(36, 42, 53, 0.4)',
            border: '1px solid rgba(58, 73, 75, 0.25)',
            borderRadius: 'var(--radius-default)',
            color: filter === 'all' ? '#fff' : 'var(--color-on-surface-variant)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          全部 ({villages.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'abnormal' ? 'active' : ''}`}
          onClick={() => setFilter('abnormal')}
          style={{
            padding: '6px 16px',
            background: filter === 'abnormal' ? 'var(--color-status-fault)' : 'rgba(36, 42, 53, 0.4)',
            border: '1px solid rgba(58, 73, 75, 0.25)',
            borderRadius: 'var(--radius-default)',
            color: filter === 'abnormal' ? '#fff' : 'var(--color-on-surface-variant)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          异常 (
          {villages.filter((v) => {
            const s = villageStatsMap[v.id];
            return (
              s.hasComplaint ||
              s.hasAbnormalUsage ||
              s.hasInspectionOrder ||
              s.leakageExceeded ||
              s.paymentAbnormal ||
              s.waterQualityAbnormal
            );
          }).length}
          )
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'normal' ? 'active' : ''}`}
          onClick={() => setFilter('normal')}
          style={{
            padding: '6px 16px',
            background: filter === 'normal' ? 'var(--color-status-running)' : 'rgba(36, 42, 53, 0.4)',
            border: '1px solid rgba(58, 73, 75, 0.25)',
            borderRadius: 'var(--radius-default)',
            color: filter === 'normal' ? '#fff' : 'var(--color-on-surface-variant)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          正常 (
          {villages.filter((v) => {
            const s = villageStatsMap[v.id];
            return (
              !s.hasComplaint &&
              !s.hasAbnormalUsage &&
              !s.hasInspectionOrder &&
              !s.leakageExceeded &&
              !s.paymentAbnormal &&
              !s.waterQualityAbnormal
            );
          }).length}
          )
        </button>
      </div>

      {/* 村庄卡片列表 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {filteredVillages.map((village) => {
          const profile = getSmartVillageProfile(village.id);
          const stats = villageStatsMap[village.id];
          const status = getVillageStatus(stats);

          return (
            <div
              key={village.id}
              className="glass-card"
              onClick={() => navigate(`/smart-village/${village.id}`)}
              style={{
                padding: 20,
                cursor: 'pointer',
                borderLeft: `4px solid ${
                  status === 'abnormal'
                    ? 'var(--color-status-fault)'
                    : status === 'warning'
                      ? 'var(--color-status-warning)'
                      : 'var(--color-status-running)'
                }`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {village.name}
                </h3>
                {status === 'abnormal' && <Tag color="red">异常</Tag>}
                {status === 'warning' && <Tag color="orange">预警</Tag>}
                {status === 'normal' && <Tag color="green">正常</Tag>}
              </div>

              <div style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 12 }}>
                {village.township} · {profile?.basicInfo.households ?? 0} 户
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>漏损率：</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        profile && profile.leakageData.leakageRate > 5
                          ? 'var(--color-status-fault)'
                          : profile && profile.leakageData.leakageRate > 3
                            ? 'var(--color-status-warning)'
                            : 'var(--color-status-running)',
                    }}
                  >
                    {profile?.leakageData.leakageRate ?? 0}%
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>缴费率：</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        profile && profile.waterUsageData.paymentRate >= 90
                          ? 'var(--color-status-running)'
                          : profile && profile.waterUsageData.paymentRate >= 80
                            ? 'var(--color-status-warning)'
                            : 'var(--color-status-fault)',
                    }}
                  >
                    {profile?.waterUsageData.paymentRate ?? 0}%
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>水质：</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        stats.waterQualityAbnormal
                          ? 'var(--color-status-fault)'
                          : 'var(--color-status-running)',
                    }}
                  >
                    {stats.waterQualityAbnormal ? '异常' : '正常'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>告警：</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        profile && profile.alarms.length > 0
                          ? 'var(--color-status-warning)'
                          : 'var(--color-status-running)',
                    }}
                  >
                    {profile?.alarms.length ?? 0} 条
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--color-secondary)',
                  }}
                >
                  点击查看详情 →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
