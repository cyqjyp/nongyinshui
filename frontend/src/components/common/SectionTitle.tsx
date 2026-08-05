import type { ReactNode } from 'react';
import './SectionTitle.css';

export default function SectionTitle({ title, extra }: { title: string; extra?: ReactNode }) {
  return (
    <div className="section-title">
      <div className="section-title-bar" />
      <span className="section-title-text">{title}</span>
      {extra && <div className="section-title-extra">{extra}</div>}
    </div>
  );
}
