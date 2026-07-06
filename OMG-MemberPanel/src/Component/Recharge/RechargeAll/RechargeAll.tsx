import { useState, useMemo } from "react";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import {
  MdPhoneAndroid,
  MdElectricBolt,
  MdWifi,
  MdWater,
  MdSatelliteAlt,
  MdOutlineHealthAndSafety,
  MdSearch,
  MdClose,
} from "react-icons/md";
import {
  FaFireAlt,
  FaCreditCard,
  FaHandHoldingUsd,
  FaBus,
  FaPlane,
  FaTrain,
  FaGraduationCap,
  FaHospital,
} from "react-icons/fa";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import "./RechargeAll.scss";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
  route?: string;
  soon?: boolean;
}

interface Category {
  title: string;
  services: Service[];
}

const CATEGORIES: Category[] = [
  {
    title: "Recharge",
    services: [
      {
        id: "mobile",
        label: "Mobile Recharge",
        icon: <MdPhoneAndroid />,
        bg: "linear-gradient(145deg, #3b82f6, #6366f1)",
        route: "recharge/mobile",
      },
      {
        id: "broadband",
        label: "Broadband",
        icon: <MdWifi />,
        bg: "linear-gradient(145deg, #22c55e, #16a34a)",
        route: "bills/BROADBAND",
      },
      {
        id: "dth",
        label: "DTH / Cable TV",
        icon: <MdSatelliteAlt />,
        bg: "linear-gradient(145deg, #8b5cf6, #6d28d9)",
        route: "bills/DTH",
      },
    ],
  },
  {
    title: "Utility Bills",
    services: [
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
    ],
  },
  {
    title: "Financial Services",
    services: [
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
      {
        id: "insurance",
        label: "Insurance",
        icon: <MdOutlineHealthAndSafety />,
        bg: "linear-gradient(145deg, #ec4899, #be185d)",
        route: "bills/INSURANCE",
      },
      {
        id: "hospital",
        label: "Hospital / Health",
        icon: <FaHospital />,
        bg: "linear-gradient(145deg, #f43f5e, #e11d48)",
        soon: true,
      },
    ],
  },
  {
    title: "Travel",
    services: [
      {
        id: "flight",
        label: "Flight Tickets",
        icon: <FaPlane />,
        bg: "linear-gradient(145deg, #0ea5e9, #38bdf8)",
        soon: true,
      },
      {
        id: "train",
        label: "Train Tickets",
        icon: <FaTrain />,
        bg: "linear-gradient(145deg, #16a34a, #15803d)",
        soon: true,
      },
      {
        id: "bus",
        label: "Bus Tickets",
        icon: <FaBus />,
        bg: "linear-gradient(145deg, #f97316, #ea580c)",
        soon: true,
      },
    ],
  },
  {
    title: "Education",
    services: [
      {
        id: "fees",
        label: "School / College Fees",
        icon: <FaGraduationCap />,
        bg: "linear-gradient(145deg, #6366f1, #4338ca)",
        soon: true,
      },
    ],
  },
];

const ALL_SERVICES = CATEGORIES.flatMap((c) => c.services);

const RechargeAll = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const base = import.meta.env.BASE_URL;

  const handleClick = (s: Service) => {
    if (s.route) {
      navigate(`${base}/${s.route}`);
      return;
    }
    setToast(`${s.label} — Coming Soon!`);
    setTimeout(() => setToast(null), 2400);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ALL_SERVICES.filter((s) => s.label.toLowerCase().includes(q));
  }, [query]);

  const renderService = (s: Service) => (
    <button
      key={s.id}
      type="button"
      className="ra-item"
      onClick={() => handleClick(s)}
    >
      {s.soon && <span className="ra-soon-badge">Soon</span>}
      <span className="ra-icon-wrap" style={{ background: s.bg }}>
        {s.icon}
      </span>
      <span className="ra-label">{s.label}</span>
    </button>
  );

  return (
    <>
      <Breadcrumbs
        mainTitle="Recharge & Bills"
        parent="Dashboard"
        ChildName="All Services"
      />

      <Container fluid className="ra-page">

        {/* ── Search ── */}
        <div className="ra-search-wrap">
          <MdSearch className="ra-search-icon" size={18} />
          <input
            className="ra-search-input"
            type="text"
            placeholder="Search services — mobile, electricity, DTH…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="ra-search-clear"
              onClick={() => setQuery("")}
            >
              <MdClose size={16} />
            </button>
          )}
        </div>

        {/* ── Search results ── */}
        {filtered && (
          <div className="ra-card">
            <h6 className="ra-category-title">
              Search results for &ldquo;{query}&rdquo;
            </h6>
            {filtered.length > 0 ? (
              <div className="ra-grid">{filtered.map(renderService)}</div>
            ) : (
              <p className="ra-no-result">No services match your search.</p>
            )}
          </div>
        )}

        {/* ── Categories ── */}
        {!filtered &&
          CATEGORIES.map((cat) => (
            <div key={cat.title} className="ra-card">
              <h6 className="ra-category-title">{cat.title}</h6>
              <div className="ra-grid">{cat.services.map(renderService)}</div>
            </div>
          ))}

      </Container>

      {/* ── Toast ── */}
      {toast && <div className="ra-toast">{toast}</div>}
    </>
  );
};

export default RechargeAll;
