import { useCurrency } from "@/Context/CurrencyContext";
import React, { useState } from "react";
// import "./AccountOverview.scss";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IncomeData {
  BinaryIncome: number;
  ROIIncome: number;
  ROILevelIncome: number;
  SponsorIncome: number;
  TotalEarning: number;
}

interface AccountOverviewProps {
  actOverviewData?: any[]; // kept for backward compat
  incomeData?: IncomeData | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

const AccountOverview: React.FC<AccountOverviewProps> = ({
  actOverviewData,
  incomeData,
}) => {
  const { currency } = useCurrency();
  // ── Helper ────────────────────────────────────────────────────────────────────

  const fmt = (val: number) =>
    `${currency.symbol}${Number(val ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const TABS = ["Weekly", "Monthly", "Yearly"];
  const [activeTab, setActiveTab] = useState("Weekly");

  // If a legacy actOverviewData array is passed, use it as before
  // Otherwise build the list from incomeData (SP fields)
  const items = actOverviewData?.length
    ? actOverviewData.map((d: any, i: number) => ({
        label: d.key ?? `Income ${i + 1}`,
        value: d.value ?? `${currency.symbol}0.00`,
      }))
    : [
        // SP field → row label mapping

        {
          label: "Binary Income",
          value: `${currency.symbol} ${incomeData?.BinaryIncome}`,
        },
        {
          label: "Referral Income",
          value: fmt(incomeData?.SponsorIncome ?? 0),
        },
        { label: "Reward Income", value: fmt(incomeData?.RewardIncome ?? 0) },
      ];

  return (
    <div className="account-overview-card dash-card mb-3">
      <div className="dash-card-header">
        <h5>Income Overview</h5>
        <div className="ao-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`ao-tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="ao-list">
        {items.map((item, i) => (
          <div key={i} className="ao-row">
            <span className="ao-row__label">{item.label}</span>
            <span className="ao-row__value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountOverview;
