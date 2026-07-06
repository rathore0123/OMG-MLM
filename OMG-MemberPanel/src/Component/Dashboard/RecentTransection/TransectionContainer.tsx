import React from "react";
// import "./TransectionContainer.scss";
import { ProgressBar } from "react-bootstrap";
import { FaDownload } from "react-icons/fa6";

interface Transaction {
  type: string;
  desc: string;
  date: string;
  amount: string;
  positive: boolean;
}

interface Props {
  transactions?: Transaction[];
}

const iconMap: Record<string, string> = {
  deposit: "⬇️",
  team: "👥",
  payout: "🏦",
  referral: "🎁",
  invest: "📦",
  default: "💳",
};

const DEFAULT: Transaction[] = [
  {
    type: "deposit",
    desc: "Deposit from Wallet",
    date: "10 Jan 2024 · 10:30 AM",
    amount: "+Rs.100.00",
    positive: true,
  },
  {
    type: "team",
    desc: "Team Commission",
    date: "09 Jan 2024 · 04:15 PM",
    amount: "+Rs.25.50",
    positive: true,
  },
  {
    type: "payout",
    desc: "Payout to Bank ****4589",
    date: "08 Jan 2024 · 11:20 AM",
    amount: "-Rs.80.00",
    positive: false,
  },
  {
    type: "referral",
    desc: "Referral Bonus",
    date: "07 Jan 2024 · 09:10 PM",
    amount: "+Rs.45.20",
    positive: true,
  },
  {
    type: "invest",
    desc: "Investment Package",
    date: "06 Jan 2024 · 02:45 PM",
    amount: "-Rs.200.00",
    positive: false,
  },
];

const TransectionContainer = ({ transactions = DEFAULT }: Props) => (
  <div className="transection-container">
    <a href="assets/pdf/business-plan.pdf" download>
      <div className="download-btn mb-3">
        <FaDownload />
        <span>Download Business Plan</span>
      </div>
    </a>

    {/* Recent Transactions list */}
    <div className="dash-card">
      <div className="dash-card-header">
        <h5>Recent Transactions</h5>
        <button>View All</button>
      </div>

      <div className="txn-list">
        {transactions.map((t, i) => (
          <div key={i} className="txn-row">
            <div className="txn-icon">{iconMap[t.type] ?? iconMap.default}</div>
            <div className="txn-body">
              <p className="txn-desc">{t.desc}</p>
              <span className="txn-date">{t.date}</span>
            </div>
            <span className={`txn-amount ${t.positive ? "pos" : "neg"}`}>
              {t.amount}
            </span>
          </div>
        ))}
      </div>

      {/* <button className="download-statement-btn">
        ⬇ Download Statement
      </button> */}
    </div>
  </div>
);

export default TransectionContainer;
