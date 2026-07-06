import { useCurrency } from "@/Context/CurrencyContext";
import React from "react";
import { FaHandshake, FaGift } from "react-icons/fa";
import { MdAccountTree } from "react-icons/md";

interface IncomeData {
  SponsorIncome?: number;
  BinaryIncome?: number;
  RewardIncome?: number;
  ROIIncome?: number;
  TotalEarning?: number;
}

interface IncomesProps {
  incomeData?: IncomeData | null;
}

const Incomes: React.FC<IncomesProps> = ({ incomeData }) => {
  const { currency } = useCurrency();

  const fmt = (val: number) =>
    `${currency.symbol}${Number(val ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const incomes = [
    {
      icon: <MdAccountTree />,
      label: fmt(incomeData?.BinaryIncome ?? incomeData?.ROIIncome ?? 0),
      sub: "Binary Income",
      color: "#6366f1",
      bg: "rgb(99 102 241 / 12%)",
    },
    {
      icon: <FaHandshake />,
      label: fmt(incomeData?.SponsorIncome ?? 0),
      sub: "Referral Income",
      color: "#22c55e",
      bg: "rgb(34 197 94 / 12%)",
    },
    {
      icon: <FaGift />,
      label: fmt(incomeData?.RewardIncome ?? 0),
      sub: "Reward Income",
      color: "#f59e0b",
      bg: "rgb(245 158 11 / 12%)",
    },
  ];

  return (
    <div className="quick-actions-card dash-card">
      <div className="dash-card-header">
        <h5>Income Statistics</h5>
      </div>
      <div className="quick-actions-grid">
        {incomes.map((a, i) => (
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

export default Incomes;
