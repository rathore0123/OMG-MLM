import { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { format, startOfMonth } from "date-fns";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdBarChart,
  MdSearchOff,
} from "react-icons/md";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import DateRange from "../../../CommonElements/DateRangePicker/DateRange";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import { decryptData } from "../../../utils/helper/Crypto";
import { useCurrency } from "../../../Context/CurrencyContext";
import "./BusinessReport.scss";

interface BusinessData {
  StrongerZoneBusiness: number;
  WeakerZoneBusiness: number;
  Total: number;
}

const BusinessReport = () => {
  
  const { universalService, loading } = ApiService();
  const { currency } = useCurrency();
  const ClientId = decryptData(localStorage.getItem("clientId") as string);

  const fmt = (v: number) =>
    `${currency?.symbol ?? ""}${Number(v ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const today = new Date();
  const [dateRange, setDateRange] = useState({ start: startOfMonth(today), end: today });
  const [data, setData] = useState<BusinessData | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchReport = async (range = dateRange) => {
    try {
      const payload = {
        procName: "GetBusiness",
        Para: JSON.stringify({
          MemberId: ClientId,
          FromDATE: format(range.start, "yyyy-MM-dd"),
          ToDATE: format(range.end, "yyyy-MM-dd"),
        }),
      };
      const res = await universalService(payload);
      setFetched(true);

      if (
        !res ||
        res === "NoRecord" ||
        res[0] === "NoRecord" ||
        res[0]?.Status === "NoRecord" ||
        res.length === 0
      ) {
        setData(null);
        return;
      }

      setData({
        StrongerZoneBusiness: Number(res[0]?.StrongerZoneBusiness ?? 0),
        WeakerZoneBusiness: Number(res[0]?.WeakerZoneBusiness ?? 0),
        Total: Number(res[0]?.Total ?? 0),
      });
    } catch {
      setData(null);
      setFetched(true);
    }
  };

  // auto-load on mount with current month
  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateChange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    fetchReport(range);
  };

  const strongerPct =
    data && data.Total > 0
      ? Math.round((data.StrongerZoneBusiness / data.Total) * 100)
      : 0;
  const weakerPct = data && data.Total > 0 ? 100 - strongerPct : 0;

  const DETAIL_CARDS = [
    {
      key: "stronger",
      label: "Stronger Zone",
      value: fmt(data?.StrongerZoneBusiness ?? 0),
      pct: strongerPct,
      icon: <MdTrendingUp />,
      desc: "Highest business referral leg",
    },
    {
      key: "weaker",
      label: "Weaker Zone",
      value: fmt(data?.WeakerZoneBusiness ?? 0),
      pct: weakerPct,
      icon: <MdTrendingDown />,
      desc: "Combined remaining referrals",
    },
    {
      key: "total",
      label: "Total Business",
      value: fmt(data?.Total ?? 0),
      pct: 100,
      icon: <MdBarChart />,
      desc: "Stronger + Weaker combined",
    },
  ];

  return (
    <>
      <Breadcrumbs
        mainTitle="Business Report"
        parent="Business Statistics"
        ChildName="Business Report"
      />

      <Container fluid className="br-page">

        {/* ── Date filter ── */}
        <div className="br-filter-card">
          <span className="br-filter-label">Select Date Range</span>
          <DateRange onChange={handleDateChange} initialRange={dateRange} />
        </div>

        {/* ── Skeletons while loading ── */}
        {loading && (
          <>
            <div className="br-stat-row">
              {[1, 2, 3].map((i) => <div key={i} className="br-card-skeleton" />)}
            </div>
            <div className="br-card-skeleton br-card-skeleton--bar" />
            <div className="br-stat-row">
              {[1, 2, 3].map((i) => <div key={i} className="br-card-skeleton br-card-skeleton--detail" />)}
            </div>
          </>
        )}

        {/* ── Data ── */}
        {!loading && fetched && data && (
          <>
            {/* Top stat cards */}
            <div className="br-stat-row">
              {DETAIL_CARDS.map((s) => (
                <div key={s.key} className={`br-stat-card br-stat-card--${s.key}`}>
                  <div className="br-stat-icon">{s.icon}</div>
                  <div className="br-stat-body">
                    <span className="br-stat-label">{s.label}</span>
                    <span className="br-stat-value">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone distribution bar */}
            {data.Total > 0 && (
              <div className="br-bar-card">
                <h6 className="br-bar-title">Zone Distribution</h6>
                <div className="br-bar-track">
                  <div
                    className="br-bar-fill br-bar-fill--stronger"
                    style={{ width: `${strongerPct}%` }}
                  >
                    {strongerPct > 8 && <span>{strongerPct}%</span>}
                  </div>
                  <div
                    className="br-bar-fill br-bar-fill--weaker"
                    style={{ width: `${weakerPct}%` }}
                  >
                    {weakerPct > 8 && <span>{weakerPct}%</span>}
                  </div>
                </div>
                <div className="br-bar-legend">
                  <span className="br-legend-item">
                    <span className="br-legend-dot br-legend-dot--stronger" />
                    Stronger Zone — {fmt(data.StrongerZoneBusiness)}
                  </span>
                  <span className="br-legend-item">
                    <span className="br-legend-dot br-legend-dot--weaker" />
                    Weaker Zone — {fmt(data.WeakerZoneBusiness)}
                  </span>
                </div>
              </div>
            )}

            {/* Detail cards */}
            <div className="br-detail-row">
              {DETAIL_CARDS.map((c) => (
                <div key={c.key} className={`br-detail-card br-detail-card--${c.key}`}>
                  <div className="br-detail-top">
                    <div className={`br-detail-icon`}>{c.icon}</div>
                    {c.key !== "total" && data.Total > 0 && (
                      <span className="br-detail-badge">{c.pct}%</span>
                    )}
                  </div>
                  <div className="br-detail-amount">{c.value}</div>
                  <div className="br-detail-label">{c.label}</div>
                  <div className="br-detail-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── No data ── */}
        {!loading && fetched && !data && (
          <div className="br-empty">
            <MdSearchOff size={52} />
            <p>No business data found for the selected period.</p>
          </div>
        )}

      </Container>
    </>
  );
};

export default BusinessReport;
