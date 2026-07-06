import React, { useState, useEffect, useCallback } from "react";
// import "./EarningsChart.scss";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ApiService } from "@/Service/UniversalService/ApiService";
import { decryptData } from "@/utils/helper/Crypto";
import { useCurrency } from "@/Context/CurrencyContext";
// ── Types ─────────────────────────────────────────────────────────────────────

interface ChartPoint {
  date: string;
  earnings: number;
  withdrawals: number;
}

interface EarningsChartProps {
  // Optional: pre-parsed data passed from parent (ContainerDashboard)
  chartData?: ChartPoint[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS = ["Last 7 Days", "Last 30 Days", "Last Year"];

const FALLBACK: ChartPoint[] = [
  { date: "04 Jan", earnings: 80, withdrawals: 40 },
  { date: "05 Jan", earnings: 120, withdrawals: 55 },
  { date: "06 Jan", earnings: 95, withdrawals: 70 },
  { date: "07 Jan", earnings: 170, withdrawals: 60 },
  { date: "08 Jan", earnings: 210, withdrawals: 90 },
  { date: "09 Jan", earnings: 185, withdrawals: 110 },
  { date: "10 Jan", earnings: 240, withdrawals: 80 },
];

const safeParseJSON = <T,>(str: string, fallback: T): T => {
  try {
    if (!str || str === "[]" || str === "null") return fallback;
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <b>Rs.{p.value}</b>
        </p>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const EarningsChart: React.FC<EarningsChartProps> = ({ chartData }) => {
  const { currency } = useCurrency();
  const [filter, setFilter] = useState("Last 7 Days");

  // Use data passed from parent if available, else fallback
  const data: ChartPoint[] =
    chartData && chartData.length > 0 ? chartData : FALLBACK;

  return (
    <div className="earnings-chart-card dash-card">
      <div className="dash-card-header">
        <h5>Earnings Overview</h5>
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTERS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-legend-row">
        <span className="legend-dot earnings-dot" />
        <span className="legend-text">Earnings</span>
        <span className="legend-dot withdrawals-dot" />
        <span className="legend-text">Withdrawals</span>
      </div>

      <div className="chart-area-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gWithdrawals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8b949e", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8b949e", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${currency.symbol}${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              name="Earnings"
              stroke="#7c5cfc"
              strokeWidth={2.5}
              fill="url(#gEarnings)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#7c5cfc",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
            <Area
              type="monotone"
              dataKey="withdrawals"
              name="Withdrawals"
              stroke="#22c55e"
              strokeWidth={2.5}
              fill="url(#gWithdrawals)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#22c55e",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EarningsChart;
