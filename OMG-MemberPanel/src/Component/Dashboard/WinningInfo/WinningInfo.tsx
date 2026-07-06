import React, { useEffect, useRef } from "react";
import "./WinningInfo.scss";

interface Winner {
  name: string;
  time: string;
  amount: string;
}

interface Props {
  winners?: Winner[];
}

const DEFAULT_WINNERS: Winner[] = [
  { name: "Mem***ZED", time: "2 minutes ago", amount: "+₹960.00" },
  { name: "Mem***JAX", time: "5 minutes ago", amount: "+₹925.00" },
  { name: "Mem***FSA", time: "12 minutes ago", amount: "+₹194.00" },
  { name: "Mem***SYC", time: "18 minutes ago", amount: "+₹111.20" },
];

const COLORS = ["#7c5cfc", "#22c55e", "#f59e0b", "#3b82f6"];

const WinningInfo = ({ winners = DEFAULT_WINNERS }: Props) => {
  const listRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll effect */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let frame: number;
    let top = 0;

    const tick = () => {
      top += 0.4;
      if (top >= el.scrollHeight / 2) top = 0;
      el.scrollTop = top;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="winning-info-card dash-card mb-3">
      <div className="dash-card-header">
        <h5> Recent Sponsor </h5>
        <button>View All</button>
      </div>

      {/* Duplicate list for seamless loop */}
      <div className="winners-scroll-wrap" ref={listRef}>
        {[...winners, ...winners].map((w, i) => (
          <div key={i} className="winner-row">
            <div
              className="winner-avatar"
              style={{
                background: `${COLORS[i % COLORS.length]}22`,
                color: COLORS[i % COLORS.length],
              }}
            >
              {w.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="winner-info">
              <p className="winner-name">{w.name}</p>
              <span className="winner-time">{w.time}</span>
            </div>
            <span className="winner-amount">{w.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinningInfo;
