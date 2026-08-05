import type { RealtimeMonitorRow } from '../../../types/dashboard';
import DashboardPanel from './DashboardPanel';
import './DashboardComponents.css';

export interface RealtimeMonitorTableProps {
  rows: RealtimeMonitorRow[];
}

function formatNumber(value: number, digits: number, suffix = '') {
  return Number.isFinite(value) ? `${value.toFixed(digits)}${suffix}` : '—';
}

function formatDateTime(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RealtimeMonitorTable({ rows }: RealtimeMonitorTableProps) {
  return (
    <DashboardPanel title="实时监测数据" className="dashboard-monitor-panel">
      {rows.length === 0 ? (
        <div className="dashboard-panel-empty" role="status">
          暂无数据
        </div>
      ) : (
        <div className="dashboard-monitor-table-scroll" tabIndex={0} aria-label="实时监测数据表格，可横向滚动">
          <table className="dashboard-monitor-table">
            <caption className="dashboard-visually-hidden">实时水质监测数据</caption>
            <thead>
              <tr>
                <th scope="col">监测点</th>
                <th scope="col">所属区域</th>
                <th scope="col">达标率</th>
                <th scope="col">浊度</th>
                <th scope="col">余氯</th>
                <th scope="col">pH</th>
                <th scope="col">状态</th>
                <th scope="col">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.name || '—'}</th>
                  <td>{row.region || '—'}</td>
                  <td className={row.qualified ? 'dashboard-value-normal' : 'dashboard-value-risk'}>
                    {formatNumber(row.passRate, 1, '%')}
                  </td>
                  <td className="dashboard-monitor-number">
                    {formatNumber(row.turbidity, 2, ' NTU')}
                  </td>
                  <td className="dashboard-monitor-number">
                    {formatNumber(row.residualChlorine, 2, ' mg/L')}
                  </td>
                  <td className="dashboard-monitor-number">{formatNumber(row.ph, 2)}</td>
                  <td>
                    <span
                      className={`dashboard-monitor-status ${
                        row.qualified ? 'dashboard-monitor-status--normal' : 'dashboard-monitor-status--risk'
                      }`}
                    >
                      <span className="dashboard-status-dot" aria-hidden="true" />
                      {row.qualified ? '达标' : '不达标'}
                    </span>
                  </td>
                  <td className="dashboard-monitor-time">{formatDateTime(row.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}
