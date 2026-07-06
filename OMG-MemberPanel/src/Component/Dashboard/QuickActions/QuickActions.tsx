import React from "react";
// import "./QuickActions.scss";
import { RiTeamFill } from "react-icons/ri";
import { MdBusinessCenter } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";
import { MdOutlineBarChart } from "react-icons/md";
import { useCurrency } from "@/Context/CurrencyContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessData {
  TotalBusiness: number;
  DirectBusiness: number;
  PowerLegBusiness: number;
  WeakerZoneBusiness: number;
}

interface QuickActionsProps {
  businessData?: BusinessData | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

const QuickActions: React.FC<QuickActionsProps> = ({ businessData }) => {
  const { currency } = useCurrency();
  // ── Helper ────────────────────────────────────────────────────────────────────

  const fmt = (val: number) =>
    `${currency.symbol}${Number(val ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const actions = [
    {
      icon: <RiTeamFill />,
      label: fmt(businessData?.TotalBusiness ?? 0),
      sub: "Total Team Business",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
    },
    {
      icon: <MdBusinessCenter />,
      label: fmt(businessData?.DirectBusiness ?? 0),
      sub: "Direct Business",
      color: "#7c5cfc",
      bg: "rgba(124,92,252,0.12)",
    },
    {
      icon: <IoStatsChart />,
      label: fmt(businessData?.PowerLegBusiness ?? 0),
      sub: "Power Leg",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      icon: <MdOutlineBarChart />,
      label: fmt(businessData?.WeakerZoneBusiness ?? 0),
      sub: "Weaker Leg",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    },
  ];

  return (
    <div className="quick-actions-card dash-card">
      <div className="dash-card-header">
        <h5>Business Statistics</h5>
      </div>
      <div className="quick-actions-grid">
        {actions.map((a, i) => (
          <button
            key={i}
            className="qa-btn"
            style={
              { "--qa-color": a.color, "--qa-bg": a.bg } as React.CSSProperties
            }
          >
            <div className="qa-btn__icon">{a.icon}</div>
            <div className="qa-btn__text">
              <span className="qa-btn__label">{a.label}</span>
              <span className="qa-btn__sub">{a.sub}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
