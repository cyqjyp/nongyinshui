import { useState } from 'react';
import { Segmented } from 'antd';
import type { DashboardCockpitData } from '../../../types/dashboard';
import DashboardPanel from './DashboardPanel';
import './DashboardComponents.css';

export interface WorkOrderPanelProps {
  data: DashboardCockpitData['workOrders'];
  dataByRange: DashboardCockpitData['workOrdersByRange'];
}

const WORK_ORDER_ITEMS = [
  { key: 'pending', label: '待处理', tone: 'warning' },
  { key: 'processing', label: '处理中', tone: 'active' },
  { key: 'completed', label: '已完成', tone: 'normal' },
] as const;

const RANGE_OPTIONS = [
  { label: '当日', value: 'day' },
  { label: '近7日', value: 'week' },
] as const;

type RangeKey = 'day' | 'week';

function safeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export default function WorkOrderPanel({ dataByRange }: WorkOrderPanelProps) {
  const [range, setRange] = useState<RangeKey>('week');

  const current = dataByRange[range];
  const counts = {
    pending: safeCount(current.pending),
    processing: safeCount(current.processing),
    completed: safeCount(current.completed),
  };
  const total = counts.pending + counts.processing + counts.completed;
  const completionRate =
    total === 0 || !Number.isFinite(current.completionRate)
      ? 0
      : Math.min(100, Math.max(0, current.completionRate));
  const summary = `工单总数${total}件，待处理${counts.pending}件，处理中${counts.processing}件，已完成${counts.completed}件，办结率${completionRate}%`;

  return (
    <DashboardPanel
      title="工单处理情况"
      className="dashboard-operation-panel"
      extra={
        <div className="quality-range-segmented">
          <Segmented
            size="small"
            options={[...RANGE_OPTIONS]}
            value={range}
            onChange={(v) => setRange(v as RangeKey)}
          />
        </div>
      }
    >
      {total === 0 ? (
        <div className="dashboard-panel-empty" role="status">
          暂无数据
        </div>
      ) : (
        <>
          <div className="dashboard-work-order" aria-label={summary}>
            <ul className="dashboard-work-order-list">
              {WORK_ORDER_ITEMS.map((item) => (
                <li
                  key={item.key}
                  className={`dashboard-work-order-item dashboard-operation-status--${item.tone}`}
                >
                  <span>{item.label}</span>
                  <strong>{counts[item.key]}</strong>
                </li>
              ))}
            </ul>
            <div className="dashboard-completion">
              <div className="dashboard-completion-heading">
                <span>办结率</span>
                <strong>{completionRate}%</strong>
              </div>
              <progress
                className="dashboard-completion-progress"
                max={100}
                value={completionRate}
                aria-label={`工单办结率${completionRate}%`}
              >
                {completionRate}%
              </progress>
            </div>
          </div>
          <p className="dashboard-visually-hidden">工单数据摘要：{summary}</p>
        </>
      )}
    </DashboardPanel>
  );
}
