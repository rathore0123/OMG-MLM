import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdPhoneAndroid,
  MdElectricBolt,
  MdWifi,
  MdWater,
  MdSatelliteAlt,
  MdOutlineHealthAndSafety,
  MdArrowForward,
} from "react-icons/md";
import { FaFireAlt, FaCreditCard, FaHandHoldingUsd } from "react-icons/fa";
import { BsGrid3X3Gap } from "react-icons/bs";
import "./RechargeSection.scss";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
  route?: string;
  soon?: boolean;
}

const SERVICES: Service[] = [
  {
    id: "mobile",
    label: "Mobile Recharge",
    icon: <MdPhoneAndroid />,
    bg: "linear-gradient(145deg, #3b82f6, #6366f1)",
    route: "recharge/mobile",
  },
  {
    id: "electricity",
    label: "Electricity Bill",
    icon: <MdElectricBolt />,
    bg: "linear-gradient(145deg, #f59e0b, #f97316)",
    route: "bills/ELECTRICITY",
  },
  {
    id: "gas",
    label: "Gas Bill",
    icon: <FaFireAlt />,
    bg: "linear-gradient(145deg, #ef4444, #dc2626)",
    route: "bills/GAS",
  },
  {
    id: "water",
    label: "Water Bill",
    icon: <MdWater />,
    bg: "linear-gradient(145deg, #06b6d4, #0891b2)",
    route: "bills/WATER",
  },
  {
    id: "dth",
    label: "DTH / Cable TV",
    icon: <MdSatelliteAlt />,
    bg: "linear-gradient(145deg, #8b5cf6, #6d28d9)",
    route: "bills/DTH",
  },
  {
    id: "broadband",
    label: "Broadband",
    icon: <MdWifi />,
    bg: "linear-gradient(145deg, #22c55e, #16a34a)",
    route: "bills/BROADBAND",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: <MdOutlineHealthAndSafety />,
    bg: "linear-gradient(145deg, #ec4899, #be185d)",
    route: "bills/INSURANCE",
  },
  {
    id: "fastag",
    label: "FASTag Recharge",
    icon: <FaCreditCard />,
    bg: "linear-gradient(145deg, #0ea5e9, #0284c7)",
    route: "bills/FASTAG",
  },
  {
    id: "loan",
    label: "Loan Repayment",
    icon: <FaHandHoldingUsd />,
    bg: "linear-gradient(145deg, #a855f7, #7c3aed)",
    soon: true,
  },
];

const RechargeSection: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = (s: Service) => {
    if (s.route) {
      navigate(`${import.meta.env.BASE_URL}/${s.route}`);
      return;
    }
    setToast(`${s.label} — Coming Soon!`);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="rch-section dash-card">
      {/* ── Header ── */}
      <div className="dash-card-header">
        <h5>Recharge &amp; Bills</h5>
        <button type="button" onClick={() => navigate(`${import.meta.env.BASE_URL}/recharge`)}>
          View All <MdArrowForward size={12} style={{ marginLeft: 2 }} />
        </button>
      </div>

      {/* ── Service cards ── */}
      <div className="rch-grid">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="rch-item"
            onClick={() => handleClick(s)}
          >
            {s.soon && <span className="rch-soon-badge">Soon</span>}

            <span className="rch-icon-wrap" style={{ background: s.bg }}>
              {s.icon}
            </span>

            <span className="rch-label">{s.label}</span>
          </button>
        ))}

        {/* ── "More" tile ── */}
        <button type="button" className="rch-item rch-item--more" onClick={() => navigate(`${import.meta.env.BASE_URL}/recharge`)}>
          <span className="rch-icon-wrap rch-icon-wrap--more">
            <BsGrid3X3Gap />
          </span>
          <span className="rch-label">More</span>
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && <div className="rch-toast">{toast}</div>}
    </div>
  );
};

export default RechargeSection;
