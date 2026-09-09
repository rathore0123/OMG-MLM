import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Container } from "reactstrap";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { RankRewardTitle, RewardTitle } from "../../../utils/Constant";
import { decryptData } from "../../../utils/helper/Crypto";
import { useCurrency } from "../../../Context/CurrencyContext";

/* ── Rank Reward Report ──
   Per-level breakdown of the binary rank/matching plan: for every rank
   (Bronze..Diamond) shows how many qualifying members currently sit in
   the left/right leg vs the required count (5-and-5), the reward, and
   whether it's already been achieved (permanent, one-time). ── */

const RANK_STYLE: Record<string, { color: string; soft: string; icon: string }> = {
  Bronze: { color: "#B45309", soft: "#FDF0DF", icon: "military_tech" },
  Silver: { color: "#64748B", soft: "#F1F3F6", icon: "military_tech" },
  Gold: { color: "#CA8A04", soft: "#FEF7E0", icon: "military_tech" },
  Platinum: { color: "#0E9C93", soft: "#E4FBF8", icon: "workspace_premium" },
  Diamond: { color: "#2563EB", soft: "#E7EFFE", icon: "diamond" },
};
const DEFAULT_RANK_STYLE = { color: "#6B7280", soft: "#F1F2F4", icon: "military_tech" };

const RankRewardReport: React.FC = () => {
  const [ClientId] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const { universalService } = ApiService();
  const { currency } = useCurrency();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatAmount = (val: number) => {
    const formatted = Number(val || 0).toLocaleString();
    return currency.symbol.length === 1
      ? `${currency.symbol}${formatted}`
      : `${formatted} ${currency.symbol}`;
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const payload = {
        procName: "RankRewardReport",
        Para: JSON.stringify({ ClientId }),
      };
      const res = await universalService(payload);
      const result = res?.data ?? res ?? [];
      setRows(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Rank reward report fetch failed", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const achievedRows = rows.filter((r) => r.Status === "Achieved");
  const currentRank = achievedRows.length
    ? achievedRows[achievedRows.length - 1]
    : null;
  const totalEarned = achievedRows.reduce(
    (sum, r) => sum + Number(r.RewardAmount || 0),
    0,
  );
  const nextRank = rows.find((r) => r.Status !== "Achieved");

  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={RankRewardTitle}
        parent={RewardTitle}
        ChildName={RankRewardTitle}
      />
      <Container fluid>
        {/* ── Summary tiles ── */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <div
              className="trezo-card h-100"
              style={{
                background: currentRank
                  ? `linear-gradient(135deg, ${(RANK_STYLE[currentRank.RankName] || DEFAULT_RANK_STYLE).color}, ${(RANK_STYLE[currentRank.RankName] || DEFAULT_RANK_STYLE).color}CC)`
                  : "linear-gradient(135deg, #9CA3AF, #6B7280)",
                color: "#fff",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "34px", opacity: 0.9 }}
                >
                  {currentRank
                    ? (RANK_STYLE[currentRank.RankName] || DEFAULT_RANK_STYLE).icon
                    : "military_tech"}
                </span>
                <div>
                  <div style={{ fontSize: "12px", opacity: 0.85 }}>Current Rank</div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    {currentRank ? currentRank.RankName : "Not Achieved Yet"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="trezo-card h-100"
              style={{ padding: "20px", borderRadius: "12px" }}
            >
              <div className="d-flex align-items-center gap-3">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "34px", color: "#16A34A" }}
                >
                  account_balance_wallet
                </span>
                <div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>
                    Total Rank Reward Earned
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    {formatAmount(totalEarned)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="trezo-card h-100"
              style={{ padding: "20px", borderRadius: "12px" }}
            >
              <div className="d-flex align-items-center gap-3">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "34px", color: "#2563EB" }}
                >
                  flag
                </span>
                <div>
                  <div className="text-muted" style={{ fontSize: "12px" }}>
                    Next Target
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700 }}>
                    {nextRank ? nextRank.RankName : "All Ranks Achieved 🎉"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Rank ladder ── */}
        <div className="trezo-card">
          <div className="trezo-card-header">
            <div className="trezo-card-title">
              <h5 className="mb-0">Rank Progress</h5>
              <span className="text-muted" style={{ fontSize: "13px" }}>
                5 qualifying members needed on each leg to unlock the next rank
              </span>
            </div>
          </div>

          <div className="trezo-card-content" style={{ padding: "10px 20px 25px" }}>
            {loading && (
              <div className="text-center py-5 text-muted">Loading...</div>
            )}

            {!loading && rows.length === 0 && (
              <div className="text-center py-5 text-muted">No rank data found.</div>
            )}

            {!loading &&
              rows.map((row, idx) => {
                const style = RANK_STYLE[row.RankName] || DEFAULT_RANK_STYLE;
                const achieved = row.Status === "Achieved";
                const required = Number(row.RequiredCount) || 1;
                const leftPct = Math.min(
                  100,
                  (Number(row.CurrentLeftCount) / required) * 100,
                );
                const rightPct = Math.min(
                  100,
                  (Number(row.CurrentRightCount) / required) * 100,
                );
                const isLast = idx === rows.length - 1;

                return (
                  <div key={row.RankId} className="d-flex" style={{ gap: "18px" }}>
                    {/* timeline rail */}
                    <div
                      className="d-flex flex-column align-items-center"
                      style={{ width: "56px", flexShrink: 0 }}
                    >
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: achieved ? style.color : style.soft,
                          border: achieved ? "none" : `2px solid ${style.color}55`,
                          boxShadow: achieved
                            ? `0 4px 12px ${style.color}55`
                            : "none",
                          marginTop: "6px",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "24px",
                            color: achieved ? "#fff" : style.color,
                          }}
                        >
                          {achieved ? "check" : style.icon}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          style={{
                            width: "3px",
                            flexGrow: 1,
                            minHeight: "40px",
                            background: achieved ? style.color : "#E5E7EB",
                            borderRadius: "2px",
                            margin: "4px 0",
                          }}
                        />
                      )}
                    </div>

                    {/* content card */}
                    <div style={{ flex: 1, paddingBottom: "22px" }}>
                      <div
                        style={{
                          background: style.soft,
                          borderRadius: "12px",
                          padding: "16px 20px",
                          border: `1px solid ${style.color}22`,
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div>
                            <div
                              style={{
                                fontSize: "17px",
                                fontWeight: 700,
                                color: style.color,
                              }}
                            >
                              {row.RankName}
                            </div>
                            <div className="text-muted" style={{ fontSize: "12px" }}>
                              Reward:{" "}
                              <span className="fw-semibold text-dark">
                                {formatAmount(row.RewardAmount)}
                              </span>
                            </div>
                          </div>

                          <div className="text-end">
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                                background: achieved ? "#DCFCE7" : "#F1F2F4",
                                color: achieved ? "#15803D" : "#6B7280",
                              }}
                            >
                              {achieved ? "Achieved" : "Unachieved"}
                            </span>
                            {achieved && row.AchievedDate && (
                              <div
                                className="text-muted"
                                style={{ fontSize: "11px", marginTop: "3px" }}
                              >
                                {format(new Date(row.AchievedDate), "dd MMM yyyy")}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* progress bars */}
                        <div className="row mt-3 g-3">
                          <div className="col-sm-6">
                            <div className="d-flex justify-content-between" style={{ fontSize: "12px" }}>
                              <span className="text-muted">Left Leg</span>
                              <span className="fw-semibold">
                                {row.CurrentLeftCount} / {row.RequiredCount}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "8px",
                                borderRadius: "6px",
                                background: "#E5E7EB",
                                overflow: "hidden",
                                marginTop: "4px",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${leftPct}%`,
                                  background: style.color,
                                  borderRadius: "6px",
                                  transition: "width .4s ease",
                                }}
                              />
                            </div>
                          </div>

                          <div className="col-sm-6">
                            <div className="d-flex justify-content-between" style={{ fontSize: "12px" }}>
                              <span className="text-muted">Right Leg</span>
                              <span className="fw-semibold">
                                {row.CurrentRightCount} / {row.RequiredCount}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "8px",
                                borderRadius: "6px",
                                background: "#E5E7EB",
                                overflow: "hidden",
                                marginTop: "4px",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${rightPct}%`,
                                  background: style.color,
                                  borderRadius: "6px",
                                  transition: "width .4s ease",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default RankRewardReport;
