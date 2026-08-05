import type { MouseEvent as ReactMouseEvent } from 'react';

interface SupplyTrendArrowProps {
  positive: boolean;
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

/** Zigzag trend arrow (Material trending_up/down style) with blink hint for drill-down. */
export default function SupplyTrendArrow({ positive, onClick }: SupplyTrendArrowProps) {
  return (
    <button
      type="button"
      className={`supply-trend-arrow ${positive ? 'up' : 'down'}`}
      onClick={onClick}
      aria-label="查看供水总量变化详情"
      title="点击查看变化值与变化率"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        {positive ? (
          <>
            <polyline
              points="4,17 9,12 13,14 17,8 20,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="17,8 20,10 20,6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <polyline
              points="4,7 9,12 13,10 17,16 20,14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="17,16 20,14 20,18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}
