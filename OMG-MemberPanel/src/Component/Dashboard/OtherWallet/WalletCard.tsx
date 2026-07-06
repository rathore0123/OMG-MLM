import React from "react";
import { Col, Row } from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { IoWallet } from "react-icons/io5";
import { BiMoneyWithdraw } from "react-icons/bi";
import { RiLuggageDepositLine } from "react-icons/ri";
import { FaRegShareSquare } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";
import { BiSolidWallet } from "react-icons/bi";
import { RiTeamFill } from "react-icons/ri";
import { GrMoney } from "react-icons/gr";
import { IoCopy } from "react-icons/io5";
import { FaDownload } from "react-icons/fa6";
// import "./WalletCard.scss";
import { ProgressBar } from "react-bootstrap";
import { MdGroupAdd } from "react-icons/md";
import { GrGroup } from "react-icons/gr";
import SVGIcons from "../../../CommonElements/SVG/SVGIcons";
import SvgIcon from "@/CommonElements/SVG/SvgIcon";
import SVGIconsNew from "@/CommonElements/SVG/SVGIconsNew";
import { useCurrency } from "@/Context/CurrencyContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WalletData {
  CommissionWallet: number;
  ROIWallet: number;
  ProductWallet: number;
  TotalEarning: number;
  TotalTeam: number;
  PaidTeam: number;
  TotalDirect: number;
  PaidDirect: number;
  TotalLeftTeamBotCount?: number;
  TotalRightTeamBotCount?: number;
}

interface WalletCardProps {
  walletData?: WalletData | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

const WalletCard: React.FC<WalletCardProps> = ({ walletData }) => {
  const { currency } = useCurrency();
  const refURL =
    (localStorage.getItem("refURL") as string) ?? "https://mlmerp.com/ref/demo";

  const onCopy = (_: any, result: boolean) => {
    if (result) toast.success("Referral link copied!");
  };

  const quickLinks = [
    { icon: <BiMoneyWithdraw />, label: "Withdraw", color: "#ef4444" },
    { icon: <RiLuggageDepositLine />, label: "Deposit", color: "#22c55e" },
    { icon: <FaRegShareSquare />, label: "Refer", color: "#7c5cfc" },
    { icon: <FaTelegramPlane />, label: "Telegram", color: "#3b82f6" },
  ];

  // ── Helper ────────────────────────────────────────────────────────────────────

  const fmt = (val: number) =>
    `${currency.symbol}${Number(val ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Mini stats — driven by live walletData, fall back to 0 until data arrives
  const miniStats = [
    {
      icon: <SVGIconsNew name="wallet" />,
      value: walletData?.TotalTeam ?? 0,
      label: "Total Team",
    },
    {
      icon: <SVGIcons name="powerLeg" />,
      value: walletData?.TotalLeftTeamBotCount ?? 0,
      label: "Total Left Team",
    },
    {
      icon: <SVGIcons name="weakerLeg" />,
      value: walletData?.TotalRightTeamBotCount ?? 0,
      label: "Total Right Team",
    },
    {
      icon: <SVGIcons name="paidMember" />,
      value: walletData?.PaidTeam ?? 0,
      label: "Total Paid Team",
    },
  ];

  // Wallet balance line — CommissionWallet as primary, ROIWallet in parentheses
  const commissionDisplay = fmt(walletData?.ProductWallet ?? 0);
  const roiDisplay = fmt(walletData?.ROIWallet ?? 0);

  return (
    <div className="wallet-card-section">
      <Row className="g-3">
        {/* Mini stat tiles — now live */}
        {miniStats.map((s, i) => (
          <Col key={i} xs="6" sm="6" md="3">
            <div className="mini-stat-tile">
              <div className="mini-stat-tile__icon">{s.icon}</div>
              <div>
                <h4 className="mini-stat-tile__value">{s.value}</h4>
                <p className="mini-stat-tile__label">{s.label}</p>
              </div>
            </div>
          </Col>
        ))}

        {/* Download button */}
      

        {/* Wallet info + quick links — now live */}
 

        {/* Referral URL bar
        <Col xs="12">
          <div className="referral-bar">
            <div className="referral-bar__url" title={refURL}>
              {refURL}
            </div>
            <CopyToClipboard text={refURL} onCopy={onCopy}>
              <button className="referral-bar__btn">
                <IoCopy /> Copy
              </button>
            </CopyToClipboard>
          </div>
        </Col> */}
      </Row>
    </div>
  );
};

export default WalletCard;
