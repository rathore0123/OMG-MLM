import { useCurrency } from "@/Context/CurrencyContext";
import React from "react";
// import "./TeamGrowth.scss";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GrowthPoint {
  week: string;
  members: number;
}

interface TeamData {
  TotalTeam: number;
  ThisWeekMembers: number;
  ThisMonthMembers: number;
  TotalPaidBusiness: number;
  TeamGrowth: string; // JSON string from SP
}

interface TeamGrowthProps {
  teamData?: TeamData | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

const TeamGrowth: React.FC<TeamGrowthProps> = ({ teamData }) => {
  const { currency } = useCurrency();
  // ── Helpers ───────────────────────────────────────────────────────────────────

  const fmt = (val: number) =>
    `${currency.symbol}${Number(val ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const safeParseJSON = <T,>(str: string, fallback: T): T => {
    try {
      if (!str || str === "[]" || str === "null") return fallback;
      return JSON.parse(str) as T;
    } catch {
      return fallback;
    }
  };

  const FALLBACK_GROWTH: GrowthPoint[] = [
    { week: "W1", members: 60 },
    { week: "W2", members: 75 },
    { week: "W3", members: 88 },
    { week: "W4", members: 100 },
    { week: "W5", members: 110 },
    { week: "W6", members: 125 },
  ];

  // Parse weekly growth points from SP JSON string
  const growthData: GrowthPoint[] = teamData?.TeamGrowth
    ? safeParseJSON<GrowthPoint[]>(teamData.TeamGrowth, FALLBACK_GROWTH)
    : FALLBACK_GROWTH;

  const totalTeam = teamData?.TotalTeam ?? 125;
  const thisWeek = teamData?.ThisWeekMembers ?? 12;
  const thisMonth = teamData?.ThisMonthMembers ?? 48;
  const totalPaidBiz = teamData?.TotalPaidBusiness ?? 0;

  // Calculate growth % vs previous week if we have at least 2 data points
  const growthPct = (() => {
    if (growthData.length < 2) return "0.0";
    const curr = growthData[growthData.length - 1].members;
    const prev = growthData[growthData.length - 2].members;
    if (prev === 0) return "0.0";
    return (((curr - prev) / prev) * 100).toFixed(1);
  })();

  const isPositive = parseFloat(growthPct) >= 0;

  return (
    <div className="team-growth-card dash-card">
      <div className="dash-card-header">
        <h5>Team Growth</h5>
        <button>View Team</button>
      </div>

      <div className="team-growth-card__hero">
        <span className="team-count">{totalTeam}</span>
        <span className="team-growth-badge">
          {isPositive ? "↑" : "↓"} {Math.abs(parseFloat(growthPct))}%
        </span>
      </div>
      <p className="team-growth-card__sub">Total Members</p>

      <div className="team-growth-chart">
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart
            data={growthData}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gTeam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" hide />
            <Tooltip
              contentStyle={{
                background: "#1c2333",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                fontSize: 11,
                color: "#f0f6fc",
              }}
              itemStyle={{ color: "#7c5cfc" }}
            />
            <Area
              type="monotone"
              dataKey="members"
              stroke="#7c5cfc"
              strokeWidth={2.5}
              fill="url(#gTeam)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row — now live */}
      <div className="team-growth-stats">
        {[
          { label: "This Week", value: String(thisWeek) },
          { label: "This Month", value: String(thisMonth) },
          { label: "Total Paid", value: fmt(totalPaidBiz) },
        ].map((s, i) => (
          <div key={i} className="team-growth-stat">
            <p>{s.label}</p>
            <h5>{s.value}</h5>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamGrowth;
