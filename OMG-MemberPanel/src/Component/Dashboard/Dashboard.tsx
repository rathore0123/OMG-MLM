import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";

// Components — all unchanged
import WalletProfileCard from "./ProfileGreet/Profile";
import WalletCard from "./OtherWallet/WalletCard";
import EarningsChart from "./EarningsChart/EarningsChart";
import TransectionContainer from "./RecentTransection/TransectionContainer";
import WinningInfo from "./WinningInfo/WinningInfo";
import TeamGrowth from "./TeamGrowth/TeamGrowth";
import QuickActions from "./QuickActions/QuickActions";
import AccountOverview from "./AccountOverview/AccountOverview";
import RecentActivity from "./RecentActivity/RecentActivity";
import Breadcrumbs from "@/CommonElements/Breadcrumbs/Breadcrumbs";
import { IoMdWallet } from "react-icons/io";
import { GrMoney } from "react-icons/gr";
import { RiTeamFill } from "react-icons/ri";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import Incomes from "./Incomes/Incomes";
import { IoWallet } from "react-icons/io5";
import { BiMoneyWithdraw } from "react-icons/bi";

import { ApiService } from "@/Service/UniversalService/ApiService";
import { decryptData } from "@/utils/helper/Crypto";
import { useCurrency } from "../../Context/CurrencyContext";
import { GiWallet } from "react-icons/gi";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { FaCopy, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RecentDirect {
  ClientName: string;
  UserName: string;
  RegistrationDate: string;
  InvestmentAmount: number;
}

interface RecentTransaction {
  TransactionNote: string;
  TransType: string;
  Amount: string;
  TransDate: string;
}

interface DashboardData {
  CommissionWallet: number;
  ROIWallet: number;
  ProductWallet: number;
  TotalEarning: number;
  WithdrawalAmount: number;
  TotalTeam: number;
  PaidTeam: number;
  TotalDirect: number;
  PaidDirect: number;
  TotalBusiness: number;
  PowerLegBusiness: number;
  WeakerZoneBusiness: number;
  DirectBusiness: number;
  ROIIncome: number;
  ROILevelIncome: number;
  SponsorIncome: number;
  BinaryIncome?: number;
  RewardIncome?: number;
  RecentDirects: string;
  Transactions: string;
  EarningsChart: string;
  TeamGrowth: string;
  ThisWeekMembers: number;
  ThisMonthMembers: number;
  TotalPaidBusiness: number;
  UserName?: string;
  MemberId?: string;
  LeftBV?: number;
  RightBV?: number;
  TotalBinaryBV?: number;
  CurrentLeftBV?: number;
  CurrentRightBV?: number;
  TotalCurrentBV?: number;
  PrevLeftCF?: number;
  PrevRightCF?: number;
  TotalPrevCF?: number;
  TotalLeftTeamBotCount?: number;
  TotalRightTeamBotCount?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const safeParseJSON = <T,>(str: string, fallback: T): T => {
  try {
    if (!str || str === "NoRecord") return fallback;
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
};

const isCreditType = (transType: string) =>
  transType?.trim().toUpperCase() === "CR";

const mapTransType = (transType: string, note: string): string => {
  const type = transType?.trim().toUpperCase();
  const noteLower = note?.toLowerCase() || "";
  if (noteLower.includes("withdrawal") || noteLower.includes("withdraw"))
    return "payout";
  if (noteLower.includes("investment") || noteLower.includes("invest"))
    return "invest";
  if (noteLower.includes("deposit")) return "deposit";
  if (noteLower.includes("referral") || noteLower.includes("sponsor"))
    return "referral";
  if (noteLower.includes("team") || noteLower.includes("level")) return "team";
  return type === "CR" ? "deposit" : "payout";
};

const sparkData = [
  { value: 10 },
  { value: 30 },
  { value: 20 },
  { value: 45 },
  { value: 25 },
  { value: 50 },
  { value: 35 },
];

const colorMap = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#22c55e",
  orange: "#f97316",
} as const;

type CardColor = keyof typeof colorMap;

// ── Component ─────────────────────────────────────────────────────────────────

const ContainerDashboard = () => {
  const { universalService } = ApiService();
  const { currency } = useCurrency();
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);

  const fmt = (val: number) =>
    `${currency.symbol}${Number(val ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /* ──────────────── state ──────────────── */
  const [modalOpen, setModalOpen] = useState(false);
  const [nextModalOpen, setNextModalOpen] = useState(false);
  const [fxstModal, setFxstModal] = useState(false);
  const [popImageURL, setPopImageURL] = useState("announcement.jpeg");

  /* ── live dashboard data ── */
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [bvStats, setBvStats] = useState<any>(null);

  const IMAGE_PREVIEW_URL = import.meta.env.VITE_IMAGE_PREVIEW_URL ?? "";
  const REGISTRATION_URL = window.location.origin + "/member/register";

  /* ──────────────── Safe decryption helper ──────────────── */
  const safeDecrypt = (encryptedData: string | null): string => {
    if (!encryptedData) return "";
    try {
      const decrypted = decryptData(encryptedData);
      return decrypted || "";
    } catch (error) {
      console.error("Decryption error:", error);
      return "";
    }
  };

  /* ──────────────── referral link generation ──────────────── */
  const getSponsorId = () => {
    // Try multiple sources for the sponsor ID
    const username = localStorage.getItem("UserName");
    console.log(username);
    if (username) return username;

    // Try localStorage with safe decryption
    const encryptedClientId = localStorage.getItem("clientId");
    if (encryptedClientId) {
      const decrypted = safeDecrypt(encryptedClientId);
      if (decrypted) return decrypted;
    }

    const encryptedUsername = localStorage.getItem("username");
    if (encryptedUsername) {
      const decrypted = safeDecrypt(encryptedUsername);
      if (decrypted) return decrypted;
    }

    // Fallback to a default or empty string
    return "";
  };

  const leftReferralLink = getSponsorId()
    ? `${REGISTRATION_URL}?sponsor=${encodeURIComponent(getSponsorId())}&position=left`
    : `${REGISTRATION_URL}?position=left`;

  const rightReferralLink = getSponsorId()
    ? `${REGISTRATION_URL}?sponsor=${encodeURIComponent(getSponsorId())}&position=right`
    : `${REGISTRATION_URL}?position=right`;

  const copyToClipboard = async (text: string, side: "left" | "right") => {
    try {
      await navigator.clipboard.writeText(text);
      if (side === "left") {
        setCopiedLeft(true);
        setTimeout(() => setCopiedLeft(false), 2000);
      } else {
        setCopiedRight(true);
        setTimeout(() => setCopiedRight(false), 2000);
      }
      toast.success(
        `${side === "left" ? "Left" : "Right"} referral link copied!`,
      );
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  /* ──────────────── fetch ──────────────── */
  const fetchDashboard = useCallback(async () => {
    try {
      const encryptedClientId = localStorage.getItem("clientId");
      let clientId = 1;

      if (encryptedClientId) {
        const decrypted = safeDecrypt(encryptedClientId);
        clientId = decrypted ? parseInt(decrypted) : 1;
      }

      const [mainRes, bvRes, teamCountRes] = await Promise.all([
        universalService({
          procName: "FetchMemberDashboardData",
          Para: JSON.stringify({ ClientId: clientId }),
        }),
        universalService({
          procName: "GetCurrentCycleBV",
          Para: JSON.stringify({ ClientId: clientId }),
        }),
        universalService({
          procName: "GetTeamLeftRightCount",
          Para: JSON.stringify({ ClientId: clientId }),
        }),
      ]);

      const mainRow: DashboardData = Array.isArray(mainRes?.data ?? mainRes)
        ? (mainRes?.data ?? mainRes)[0]
        : (mainRes?.data ?? mainRes);

      const bvRow = Array.isArray(bvRes?.data ?? bvRes)
        ? (bvRes?.data ?? bvRes)[0]
        : (bvRes?.data ?? bvRes);

      const teamCountRow = Array.isArray(teamCountRes?.data ?? teamCountRes)
        ? (teamCountRes?.data ?? teamCountRes)[0]
        : (teamCountRes?.data ?? teamCountRes);

      if (mainRow)
        setDashData({
          ...mainRow,
          ...(bvRow ?? {}),
          TotalLeftTeamBotCount: teamCountRow?.LeftTeamCount ?? 0,
          TotalRightTeamBotCount: teamCountRow?.RightTeamCount ?? 0,
        });
      if (bvRow) setBvStats(bvRow);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ──────────────── derived values ──────────────── */

  const recentDirects = safeParseJSON<RecentDirect[]>(
    dashData?.RecentDirects ?? "",
    [],
  );

  const rawTransactions = safeParseJSON<RecentTransaction[]>(
    dashData?.Transactions ?? "",
    [],
  );

  const recentTransactions = rawTransactions.map((t) => {
    const isCredit = isCreditType(t.TransType);
    return {
      type: mapTransType(t.TransType, t.TransactionNote),
      desc: t.TransactionNote,
      date: t.TransDate,
      amount: `${isCredit ? "+" : "-"}${currency.symbol}${Math.abs(Number(t.Amount)).toFixed(2)}`,
      positive: isCredit,
    };
  });

  const recentActivity = rawTransactions.map((t) => {
    const isCredit = isCreditType(t.TransType);
    return {
      type: mapTransType(t.TransType, t.TransactionNote),
      desc: t.TransType?.trim(),
      sub: t.TransactionNote,
      amount: `${currency.symbol}${Math.abs(Number(t.Amount)).toFixed(2)}`,
      status: isCredit ? "Success" : "Pending",
      time: t.TransDate,
    };
  });

  const recentWinners = recentDirects.length
    ? recentDirects.map((d) => ({
        name: d.ClientName?.trim() ?? d.UserName,
        time: d.RegistrationDate,
        amount: `+${currency.symbol}${Number(d.InvestmentAmount ?? 0).toFixed(2)}`,
      }))
    : [
        {
          name: "Mem***ZED",
          time: "2 minutes ago",
          amount: `+${currency.symbol}260.00`,
        },
        {
          name: "Mem***JAX",
          time: "5 minutes ago",
          amount: `+${currency.symbol}325.00`,
        },
        {
          name: "Mem***FSA",
          time: "12 minutes ago",
          amount: `+${currency.symbol}194.00`,
        },
        {
          name: "Mem***SYC",
          time: "18 minutes ago",
          amount: `+${currency.symbol}111.20`,
        },
      ];

  const walletBalance = fmt(dashData?.CommissionWallet ?? 0);
  const totalEarnings = fmt(dashData?.ROIWallet ?? 0);
  const activeTeam = fmt(dashData?.TotalEarning ?? 125);
  const todayProfit = fmt(dashData?.WithdrawalAmount ?? 0);

  /* ──────────────── modal handlers ──────────────── */
  const closeModal = () => {
    document.body.style.paddingRight = "";
    setModalOpen(false);
  };
  const closeNextModal = () => {
    document.body.style.paddingRight = "";
    setNextModalOpen(false);
  };
  const closeFxstModal = () => {
    document.body.style.paddingRight = "";
    setFxstModal(false);
  };

  /* ──────────────── team stats computed values ──────────────── */
  const leftBiz = dashData?.PowerLegBusiness ?? 0;
  const rightBiz = dashData?.WeakerZoneBusiness ?? 0;

  /* ──────────────── render ──────────────── */
  return (
    <>
      <Breadcrumbs mainTitle="Dashboard" parent="Dashboard" />
      <Container fluid className="dashboard-container">
        <div className="dashboard-root">
          {/* ── Referral Link Boxes with Vibrant Theme Colors (No Open Button) ── */}
          {getSponsorId() && (
            <Row className="referral-links-row g-3 mb-4">
              <Col md="6">
                <div className="referral-card left-card">
                  <div className="referral-card-header">
                    <div className="referral-icon left-icon">
                      <RiTeamFill />
                    </div>
                    <h4>Left Position Referral</h4>
                  </div>
                  <div className="referral-card-body">
                    <div className="referral-link-container">
                      <input
                        type="text"
                        className="referral-link-input left-input"
                        value={leftReferralLink}
                        readOnly
                        onClick={() =>
                          copyToClipboard(leftReferralLink, "left")
                        }
                      />
                      <button
                        className="btn-copy left-copy"
                        onClick={() =>
                          copyToClipboard(leftReferralLink, "left")
                        }
                        type="button"
                      >
                        {copiedLeft ? <FaCheck /> : <FaCopy />}
                        {copiedLeft ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="referral-info left-info">
                      <small>Sponsor ID: {getSponsorId()}</small>
                      <small>Position: Left</small>
                    </div>
                  </div>
                </div>
              </Col>

              <Col md="6">
                <div className="referral-card right-card">
                  <div className="referral-card-header">
                    <div className="referral-icon right-icon">
                      <RiTeamFill />
                    </div>
                    <h4>Right Position Referral</h4>
                  </div>
                  <div className="referral-card-body">
                    <div className="referral-link-container">
                      <input
                        type="text"
                        className="referral-link-input right-input"
                        value={rightReferralLink}
                        readOnly
                        onClick={() =>
                          copyToClipboard(rightReferralLink, "right")
                        }
                      />
                      <button
                        className="btn-copy right-copy"
                        onClick={() =>
                          copyToClipboard(rightReferralLink, "right")
                        }
                        type="button"
                      >
                        {copiedRight ? <FaCheck /> : <FaCopy />}
                        {copiedRight ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="referral-info right-info">
                      <small>Sponsor ID: {getSponsorId()}</small>
                      <small>Position: Right</small>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
          {/* ── Wallet Stats Row (sparkline cards) ── */}
          {(() => {
            const walletCards: {
              icon: React.ReactNode;
              label: string;
              value: string;
              change: string;
              color: CardColor;
            }[] = [
              {
                icon: <IoMdWallet />,
                label: "Wallet Balance",
                value: fmt(dashData?.CommissionWallet ?? 0),
                change: "Commission wallet",
                color: "green",
              },
              {
                icon: <IoWallet />,
                label: "Deposit Wallet",
                value: fmt(dashData?.ProductWallet ?? 0),
                change: "Product wallet balance",
                color: "blue",
              },
              {
                icon: <GrMoney />,
                label: "Total Earnings",
                value: fmt(dashData?.TotalEarning ?? 0),
                change: "Total earnings",
                color: "orange",
              },
              {
                icon: <BiMoneyWithdraw />,
                label: "Total Withdrawal",
                value: fmt(dashData?.WithdrawalAmount ?? 0),
                change: "Lifetime withdrawals",
                color: "purple",
              },
            ];
            return (
              <Row className="stat-cards-row g-3 mb-4">
                {walletCards.map((card, i) => (
                  <Col key={i} xl="3" lg="6" md="6" sm="6" xs="6">
                    <div className={`stat-card premium ${card.color}`}>
                      <div className="d-flex p-md-3 p-2 pb-0 align-items-center gap-3">
                        <div className="stat-card__icon d-none d-md-flex">
                          {card.icon}
                        </div>
                        <div>
                          <p className="stat-card__label">{card.label}</p>
                          <h3 className="stat-card__value">{card.value}</h3>
                          <span className="stat-card__change">
                            {card.change}
                          </span>
                        </div>
                      </div>
                      <div className="stat-card__chart">
                        <ResponsiveContainer width="100%" height={70}>
                          <AreaChart data={sparkData}>
                            <defs>
                              <linearGradient
                                id={`wgrad-${i}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={colorMap[card.color]}
                                  stopOpacity={0.6}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={colorMap[card.color]}
                                  stopOpacity={0}
                                />
                              </linearGradient>
                              <filter id={`wglow-${i}`}>
                                <feGaussianBlur
                                  stdDeviation="3.5"
                                  result="coloredBlur"
                                />
                                <feMerge>
                                  <feMergeNode in="coloredBlur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={colorMap[card.color]}
                              strokeWidth={2.5}
                              fill={`url(#wgrad-${i})`}
                              filter={`url(#wglow-${i})`}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            );
          })()}
          {/* ── Team Stats Row (image-style cards) ── */}
          {(() => {
            const activeDirect = dashData?.PaidDirect ?? 0;
            const inactiveDirect = Math.max(
              0,
              (dashData?.TotalDirect ?? 0) - activeDirect,
            );
            const totalDirectSum = activeDirect + inactiveDirect || 1;
            const bizSum = leftBiz + rightBiz || 1;

            const tsCard = (
              accentColor: string,
              icon: React.ReactNode,
              title: string,
              mainVal: React.ReactNode,
              subA: { label: string; val: React.ReactNode },
              subB: { label: string; val: React.ReactNode },
              leftPct: number,
              leftLbl: string,
              rightLbl: string,
              footer: string,
            ) => (
              <div
                style={{
                  background: "var(--card-bg, #fff)",
                  borderRadius: 14,
                  padding: "16px 18px 14px",
                  borderTop: `3px solid ${accentColor}`,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column" as const,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase" as const,
                      letterSpacing: 0.8,
                    }}
                  >
                    {title}
                  </span>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: `${accentColor}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: accentColor,
                      fontSize: 18,
                    }}
                  >
                    {icon}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "var(--card-text-color, #1e293b)",
                    margin: "2px 0 14px",
                  }}
                >
                  {mainVal}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      background: "var(--body-bg, #f1f5f9)",
                      borderRadius: 7,
                      padding: "7px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        textTransform: "uppercase" as const,
                        letterSpacing: 0.5,
                        marginBottom: 3,
                      }}
                    >
                      {subA.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--card-text-color, #1e293b)",
                      }}
                    >
                      {subA.val}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "var(--body-bg, #f1f5f9)",
                      borderRadius: 7,
                      padding: "7px 10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        textTransform: "uppercase" as const,
                        letterSpacing: 0.5,
                        marginBottom: 3,
                      }}
                    >
                      {subB.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--card-text-color, #1e293b)",
                      }}
                    >
                      {subB.val}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: 5,
                    background: "var(--body-bg, #e2e8f0)",
                    borderRadius: 99,
                    overflow: "hidden",
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${leftPct}%`,
                      background: accentColor,
                      borderRadius: 99,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>
                    {leftLbl}
                  </span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>
                    {rightLbl}
                  </span>
                </div>
                <div
                  style={{ fontSize: 11, color: "#94a3b8", marginTop: "auto" }}
                >
                  {footer}
                </div>
              </div>
            );

            return (
              <Row className="g-3 mb-4">
                <Col xl="3" lg="6" md="6" xs="12">
                  {tsCard(
                    "#0891b2",
                    <RiTeamFill />,
                    "MY DIRECT",
                    dashData?.TotalDirect ?? 0,
                    { label: "PAID", val: activeDirect },
                    { label: "UNPAID", val: inactiveDirect },
                    Math.round((activeDirect / totalDirectSum) * 100),
                    "PAID",
                    "UNPAID",
                    "Direct referral income",
                  )}
                </Col>
                <Col xl="3" lg="6" md="6" xs="12">
                  {tsCard(
                    "#ef4444",
                    <FaMoneyBillTrendUp />,
                    "TOTAL BUSINESS",
                    fmt(dashData?.TotalBusiness ?? 0),
                    { label: "LEFT", val: fmt(leftBiz) },
                    { label: "RIGHT", val: fmt(rightBiz) },
                    Math.round((leftBiz / bizSum) * 100),
                    "LEFT BUSINESS",
                    "RIGHT BUSINESS",
                    "Cumulative volume",
                  )}
                </Col>
                <Col xl="3" lg="6" md="6" xs="12">
                  {tsCard(
                    "#0d9488",
                    <GiWallet />,
                    "TOTAL CARRY FORWARD",
                    (dashData?.TotalPrevCF ?? 0).toLocaleString(),
                    {
                      label: "LEFT CARRY FORWARD",
                      val: (dashData?.PrevLeftCF ?? 0).toLocaleString(),
                    },
                    {
                      label: "RIGHT CARRY FORWARD",
                      val: (dashData?.PrevRightCF ?? 0).toLocaleString(),
                    },
                    Math.round(
                      ((dashData?.PrevLeftCF ?? 0) /
                        Math.max(dashData?.TotalPrevCF ?? 1, 1)) *
                        100,
                    ),
                    "LEFT",
                    "RIGHT",
                    "Accumulated carry forward (all cycles)",
                  )}
                </Col>
                <Col xl="3" lg="6" md="6" xs="12">
                  {tsCard(
                    "#f59e0b",
                    <IoMdWallet />,
                    "CURRENT BUSINESS",
                    (dashData?.TotalCurrentBV ?? 0).toLocaleString(),
                    {
                      label: "LEFT BUSINESS",
                      val: (dashData?.CurrentLeftBV ?? 0).toLocaleString(),
                    },
                    {
                      label: "RIGHT BUSINESS",
                      val: (dashData?.CurrentRightBV ?? 0).toLocaleString(),
                    },
                    Math.round(
                      ((dashData?.CurrentLeftBV ?? 0) /
                        Math.max((dashData?.TotalCurrentBV ?? 0) || 1, 1)) *
                        100,
                    ),
                    "LEFT",
                    "RIGHT",
                    "Current 6-hour cycle BV",
                  )}
                </Col>
              </Row>
            );
          })()}

          <Row className="g-3">
            {/* ── Left / Centre column ── */}
            <Col xl="9" lg="8" md="12">
              <WalletProfileCard />
              
             <WalletCard walletData={dashData} />

              <Row className="g-3 mt-0">
                <Col xl="7" md="7" sm="12">
                  <EarningsChart
                    chartData={safeParseJSON(
                      dashData?.EarningsChart ?? "[]",
                      [],
                    )}
                  />
                </Col>
                <Col xl="5" md="5" sm="12">
                  <TeamGrowth teamData={dashData} />
                </Col>
              </Row>

              <QuickActions businessData={dashData} />
              <Incomes incomeData={dashData} />
              {/* <RecentActivity data={recentActivity} /> */}
            </Col>

            {/* ── Right sidebar ── */}
            <Col xl="3" lg="4" md="12">
              <WinningInfo winners={recentWinners} />
              <TransectionContainer transactions={recentTransactions} />
              <AccountOverview incomeData={dashData} />
            </Col>
          </Row>
        </div>

        {/* Modals remain unchanged */}
        <Modal
          isOpen={modalOpen}
          toggle={closeModal}
          centered
          className="dashboard-modal"
        >
          <ModalHeader toggle={closeModal} className="modal-header-dark px-4">
            Big Opportunity
          </ModalHeader>
          <ModalBody className="modal-body-dark text-center">
            <img
              className="img-fluid rounded"
              alt="popimage"
              src={`${IMAGE_PREVIEW_URL}${popImageURL}`}
            />
          </ModalBody>
        </Modal>

        <Modal
          isOpen={nextModalOpen}
          toggle={closeNextModal}
          centered
          className="dashboard-modal"
        >
          <ModalHeader
            toggle={closeNextModal}
            className="modal-header-dark px-4"
          >
            IMPORTANT NOTICE (KYC Verification)
          </ModalHeader>
          <ModalBody className="modal-body-dark">
            <div className="kyc-modal-content">
              <p>
                We are delighted to announce an amazing opportunity for our
                members to participate in the U.S. Government Lottery Scheme
                starting this New Year!
              </p>
              <p>
                Purchase lottery tickets via USDT starting 1st January; KYC is
                mandatory!
              </p>
              <h5>KYC Process</h5>
              <ul>
                <li>
                  <b style={{ color: "#E6B855" }}>Aadhaar card</b> required for
                  KYC.
                </li>
                <li>
                  Fee:{" "}
                  <b style={{ color: "#E6B855" }}>
                    {currency.symbol}100 (~₹8,500)
                  </b>{" "}
                  for KYC process.
                </li>
                <li style={{ color: "red" }}>Deadline: 1st–3rd January.</li>
              </ul>
              <div className="text-end mt-3">
                <button className="btn-primary-dash" onClick={closeNextModal}>
                  Close
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>

        <Modal
          isOpen={fxstModal}
          toggle={closeFxstModal}
          centered
          className="dashboard-modal"
        >
          <ModalHeader
            toggle={closeFxstModal}
            className="modal-header-dark px-4"
          >
            🎉✨💥 Happy New Year 💥✨🎉
          </ModalHeader>
          <ModalBody className="modal-body-dark text-center">
            <div style={{ height: "60vh" }} />
            <div className="text-end">
              <button className="btn-primary-dash" onClick={closeFxstModal}>
                Close
              </button>
            </div>
          </ModalBody>
        </Modal>
      </Container>

      {/* CSS styles - Vibrant theme colors for referral cards (Updated for single button) */}
      <style>{`
        .referral-card {
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          position: relative;
        }
        
        .referral-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          z-index: 0;
        }
        
        .left-card {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border: 1px solid rgba(59, 130, 246, 0.5);
        }
        
        .left-card::before {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        }
        
        .right-card {
          background: linear-gradient(135deg, #14532d 0%, #166534 100%);
          border: 1px solid rgba(34, 197, 94, 0.5);
        }
        
        .right-card::before {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        }
        
        .referral-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        
        .left-card:hover {
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }
        
        .right-card:hover {
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
        }
        
        .referral-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }
        
        .referral-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
        }
        
        .left-icon {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.5);
        }
        
        .right-icon {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.5);
        }
        
        .referral-card-header h4 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
        }
        
        .referral-link-container {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        
        .referral-link-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 6px 10px;
          color: white;
          font-size: 0.75rem;
          font-family: monospace;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .left-input:focus {
          border-color: #60a5fa;
          outline: none;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .right-input:focus {
          border-color: #4ade80;
          outline: none;
          background: rgba(0, 0, 0, 0.5);
        }
        
        .referral-link-input:hover {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(0, 0, 0, 0.5);
        }
        
        .btn-copy {
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        .left-copy {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .right-copy {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }
        
        .btn-copy:hover {
          transform: translateY(-1px);
        }
        
        .left-copy:hover {
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }
        
        .right-copy:hover {
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
        }
        
        .referral-info {
          display: flex;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
        }
        
        .referral-info small {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .left-info small:first-child {
          color: #93c5fd;
        }
        
        .right-info small:first-child {
          color: #86efac;
        }
        
        @media (max-width: 768px) {
          .referral-card {
            padding: 10px 12px;
          }
          
          .referral-link-container {
            flex-direction: column;
          }
          
          .btn-copy {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default ContainerDashboard;
