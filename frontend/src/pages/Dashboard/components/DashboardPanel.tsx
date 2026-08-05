import type { HTMLAttributes, ReactNode } from 'react';
import './DashboardComponents.css';

export interface DashboardPanelProps extends HTMLAttributes<HTMLElement> {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DashboardPanel({
  title,
  extra,
  children,
  className = '',
  ...rest
}: DashboardPanelProps) {
  const panelClassName = ['dashboard-panel', 'glass-card', className].filter(Boolean).join(' ');

  return (
    <section className={panelClassName} {...rest}>
      <header className="dashboard-panel-header">
        <span className="dashboard-panel-title-mark" aria-hidden="true" />
        <h2 className="dashboard-panel-title">{title}</h2>
        {extra !== undefined && <div className="dashboard-panel-extra">{extra}</div>}
      </header>
      <div className="dashboard-panel-body">{children}</div>
    </section>
  );
}
