import React from "react";

type IconName =
  | "wallet"
  | "deposit"
  | "earning"
  | "withdrawal"
  | "totalMember"
  | "paidMember"
  | "directMember"
  | "directPaidMember"
  | "withdrawAction"
  | "depositAction"
  | "refer"
  | "telegram"
  | "teamBusiness"
  | "directBusiness"
  | "powerLeg"
  | "weakerLeg"
  | "directIncome"
  | "roiIncome"
  | "roiWallet"
  | "rewardIncome"
  | "credit"
  | "debit"
  // MLM ERP & Tasks Overview Icons
  | "dashboard"
  | "investment"
  | "profile"
  | "accountSetting"
  | "depositPlus"
  | "team"
  | "businessStatistics"
  | "payoutIncome"
  | "withdraw"
  | "p2p"
  | "transactionLog"
  | "supportTicket"
  | "promotionalTool"
  | "commissionWallet"
  | "otpSecurity"
  | "search"
  | "home"
  | "transfer"
  | "report"
  | "sync"
  | "bitcoin"
  | "dollar"
  | "creditCard"
  | "lockSecure"
  | "notification"
  | "projectBriefing"
  | "conceptDesign"
  | "functionalLogics"
  | "development"
  | "testing";

interface SVGIconsProps {
  name: IconName;
  size?: number;
  className?: string;
}

const icons: Record<IconName, React.ReactNode> = {
  // ─── Original Icons ───────────────────────────────────────────────────────
  wallet: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="12" rx="3" fill="currentColor" opacity="0.15"/>
      <rect x="3" y="8" width="18" height="4" rx="2" fill="currentColor"/>
      <circle cx="17" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor" opacity="0.15"/>
      <path d="M12 9V15M12 9L9 12M12 9L15 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  earning: (
    <svg viewBox="0 0 24 24">
      <ellipse cx="12" cy="7" rx="7" ry="3" fill="currentColor" opacity="0.15"/>
      <path d="M5 7V17C5 19 9 20 12 20C15 20 19 19 19 17V7" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M5 12C5 14 9 15 12 15C15 15 19 14 19 12" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  withdrawal: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" opacity="0.15"/>
      <path d="M12 15V9M12 15L15 12M12 15L9 12" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  totalMember: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" fill="currentColor"/>
      <circle cx="17" cy="10" r="2" fill="currentColor" opacity="0.5"/>
      <rect x="4" y="14" width="10" height="5" rx="2.5" fill="currentColor"/>
    </svg>
  ),
  paidMember: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" fill="currentColor"/>
      <path d="M15 10L17 12L20 8" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="14" width="10" height="5" rx="2.5" fill="currentColor" opacity="0.2"/>
    </svg>
  ),
  directMember: (
    <svg viewBox="0 0 24 24">
      <circle cx="8" cy="9" r="3" fill="currentColor"/>
      <circle cx="16" cy="9" r="3" fill="currentColor" opacity="0.5"/>
      <path d="M4 18C4 15 7 14 8 14C9 14 12 15 12 18" fill="currentColor"/>
    </svg>
  ),
  directPaidMember: (
    <svg viewBox="0 0 24 24">
      <circle cx="8" cy="9" r="3" fill="currentColor"/>
      <path d="M14 9L16 11L20 7" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="15" width="10" height="4" rx="2" fill="currentColor" opacity="0.2"/>
    </svg>
  ),
  withdrawAction: (
    <svg viewBox="0 0 24 24">
      <path d="M12 16V8M12 16L16 12M12 16L8 12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  depositAction: (
    <svg viewBox="0 0 24 24">
      <path d="M12 8V16M12 8L8 12M12 8L16 12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  refer: (
    <svg viewBox="0 0 24 24">
      <circle cx="6" cy="12" r="2" fill="currentColor"/>
      <circle cx="18" cy="6" r="2" fill="currentColor"/>
      <circle cx="18" cy="18" r="2" fill="currentColor"/>
      <path d="M8 12L16 6M8 12L16 18" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24">
      <path d="M21 4L3 11L10 13L12 20L21 4Z" fill="currentColor"/>
    </svg>
  ),
  teamBusiness: (
    <svg viewBox="0 0 24 24">
      <circle cx="7" cy="10" r="3" fill="currentColor"/>
      <circle cx="17" cy="10" r="3" fill="currentColor" opacity="0.4"/>
      <rect x="4" y="15" width="16" height="4" rx="2" fill="currentColor"/>
    </svg>
  ),
  directBusiness: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="8" width="16" height="10" rx="2" fill="currentColor"/>
      <path d="M8 8V6H16V8" stroke="white" strokeWidth="1.5"/>
    </svg>
  ),
  powerLeg: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="10" width="3" height="7" fill="currentColor"/>
      <rect x="10" y="7" width="3" height="10" fill="currentColor"/>
      <rect x="15" y="4" width="3" height="13" fill="currentColor"/>
    </svg>
  ),
  weakerLeg: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="12" width="3" height="5" fill="currentColor"/>
      <rect x="10" y="10" width="3" height="7" fill="currentColor"/>
      <rect x="15" y="8" width="3" height="9" fill="currentColor"/>
    </svg>
  ),
  directIncome: (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="6" width="16" height="10" rx="2" fill="currentColor"/>
      <circle cx="12" cy="11" r="2" fill="white"/>
    </svg>
  ),
  roiIncome: (
    <svg viewBox="0 0 24 24">
      <path d="M5 15L10 10L14 14L19 9" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  roiWallet: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="12" rx="3" fill="currentColor"/>
      <path d="M15 12H18" stroke="white" strokeWidth="2"/>
    </svg>
  ),
  rewardIncome: (
    <svg viewBox="0 0 24 24">
      <path d="M12 2L15 8H9L12 2Z" fill="currentColor"/>
      <rect x="6" y="10" width="12" height="10" rx="2" fill="currentColor"/>
    </svg>
  ),
  credit: (
    <svg viewBox="0 0 24 24">
      <path d="M12 6V18M12 6L8 10M12 6L16 10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  debit: (
    <svg viewBox="0 0 24 24">
      <path d="M12 18V6M12 18L8 14M12 18L16 14" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // ─── MLM ERP & Tasks Overview Icons ──────────────────────────────────────
  dashboard: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor"/>
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor"/>
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  investment: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="14" width="4" height="6" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="10" y="10" width="4" height="10" rx="1" fill="currentColor"/>
      <rect x="17" y="6" width="4" height="14" rx="1" fill="currentColor" opacity="0.7"/>
      <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" fill="currentColor"/>
      <path d="M4 20Q4 14 12 14Q20 14 20 20" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  accountSetting: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.5"/>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="21" y2="12"/>
        <line x1="5.6" y1="5.6" x2="7.8" y2="7.8"/>
        <line x1="16.2" y1="16.2" x2="18.4" y2="18.4"/>
        <line x1="18.4" y1="5.6" x2="16.2" y2="7.8"/>
        <line x1="7.8" y1="16.2" x2="5.6" y2="18.4"/>
      </g>
    </svg>
  ),
  depositPlus: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
      <rect x="11" y="7" width="2" height="10" rx="1" fill="currentColor"/>
      <rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor"/>
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="16" cy="8" r="3" fill="currentColor"/>
      <path d="M2 20Q2 14 9 14Q12 14 12 17" fill="currentColor" opacity="0.4"/>
      <path d="M12 17Q12 14 16 14Q22 14 22 20" fill="currentColor"/>
    </svg>
  ),
  businessStatistics: (
    <svg viewBox="0 0 24 24">
      <polyline points="3,17 8,11 13,14 21,6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.4"/>
      <polyline points="3,17 8,11 13,14 21,6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="3" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="8" cy="11" r="1.5" fill="currentColor"/>
      <circle cx="13" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="21" cy="6" r="1.5" fill="currentColor"/>
    </svg>
  ),
  payoutIncome: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="9" width="20" height="12" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="2" y="5" width="13" height="6" rx="2" fill="currentColor"/>
      <rect x="16" y="11" width="6" height="6" rx="2" fill="currentColor"/>
      <circle cx="19" cy="14" r="1.5" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  withdraw: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
      <rect x="11" y="7" width="2" height="8" rx="1" fill="currentColor"/>
      <polygon points="12,17 8,12 16,12" fill="currentColor"/>
    </svg>
  ),
  p2p: (
    <svg viewBox="0 0 24 24">
      <circle cx="6" cy="9" r="3" fill="currentColor" opacity="0.4"/>
      <circle cx="18" cy="15" r="3" fill="currentColor"/>
      <polygon points="14,12 18,9 18,11" fill="currentColor"/>
      <polygon points="10,12 6,15 6,13" fill="currentColor" opacity="0.5"/>
      <path d="M9 9Q13 9 13 12Q13 15 10 15" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M15 15Q11 15 11 12Q11 9 14 9" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.5"/>
    </svg>
  ),
  transactionLog: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="2" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="3" y="10" width="13" height="2" rx="1" fill="currentColor"/>
      <rect x="3" y="15" width="16" height="2" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="3" y="20" width="10" height="2" rx="1" fill="currentColor"/>
    </svg>
  ),
  supportTicket: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="32" rx="2" fill="currentColor" opacity="0.15"/>
      <path d="M8 8H18M8 12H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="8" cy="17" r="2" fill="currentColor"/>
      <path d="M11 17H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  promotionalTool: (
    <svg viewBox="0 0 24 24">
      <polygon points="5,10 17,5 17,19 5,14" fill="currentColor" opacity="0.35"/>
      <rect x="2" y="10" width="5" height="5" rx="1.5" fill="currentColor"/>
      <line x1="18" y1="8" x2="22" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="18" y1="16" x2="22" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  commissionWallet: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="8" width="20" height="13" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="2" y="5" width="14" height="5" rx="2" fill="currentColor"/>
      <rect x="17" y="11" width="5" height="5" rx="1.5" fill="currentColor"/>
      <circle cx="19.5" cy="13.5" r="1" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  otpSecurity: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3L20 7V13Q20 19 12 22Q4 19 4 13V7Z" fill="currentColor" opacity="0.25"/>
      <path d="M12 3L20 7V13Q20 19 12 22Q4 19 4 13V7Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="13" r="2.5" fill="currentColor"/>
      <rect x="11" y="13" width="2" height="4" rx="1" fill="currentColor"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      <circle cx="11" cy="11" r="4" fill="currentColor" opacity="0.2"/>
      <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24">
      <polygon points="12,3 3,11 5,11 5,21 10,21 10,15 14,15 14,21 19,21 19,11 21,11" fill="currentColor" opacity="0.35"/>
      <polygon points="12,3 3,11 21,11" fill="currentColor"/>
      <rect x="10" y="15" width="4" height="6" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  transfer: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="17,9 21,12 17,15" fill="currentColor"/>
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" opacity="0.2"/>
      <rect x="5" y="3" width="14" height="6" rx="2" fill="currentColor"/>
      <rect x="8" y="12" width="8" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="8" y="15" width="6" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="8" y="18" width="7" height="1.5" rx="0.75" fill="currentColor"/>
    </svg>
  ),
  sync: (
    <svg viewBox="0 0 24 24">
      <path d="M12 5A7 7 0 1 1 5 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <polygon points="5,12 2,7 8,7" fill="currentColor"/>
      <path d="M12 19A7 7 0 1 1 19 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/>
    </svg>
  ),
  bitcoin: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="sans-serif">₿</text>
    </svg>
  ),
  dollar: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="sans-serif">$</text>
    </svg>
  ),
  creditCard: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="13" rx="3" fill="currentColor" opacity="0.25"/>
      <rect x="2" y="10" width="20" height="4" fill="currentColor"/>
      <rect x="5" y="16" width="5" height="1.5" rx="0.75" fill="currentColor"/>
      <rect x="17" y="16" width="3" height="1.5" rx="0.75" fill="currentColor"/>
    </svg>
  ),
  lockSecure: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor" opacity="0.3"/>
      <path d="M8 11V8Q8 4 12 4Q16 4 16 8V11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="2" fill="currentColor"/>
      <rect x="11" y="16" width="2" height="3" rx="1" fill="currentColor"/>
    </svg>
  ),
  notification: (
    <svg viewBox="0 0 24 24">
      <path d="M12 3Q7 3 6 9L4 18H20L18 9Q17 3 12 3Z" fill="currentColor" opacity="0.3"/>
      <path d="M12 3Q7 3 6 9L4 18H20L18 9Q17 3 12 3Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="9" y="18" width="6" height="3" rx="1.5" fill="currentColor"/>
      <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
    </svg>
  ),
  projectBriefing: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="17" width="18" height="3.5" rx="1.75" fill="currentColor" opacity="0.4"/>
      <rect x="5" y="12" width="14" height="3.5" rx="1.75" fill="currentColor" opacity="0.65"/>
      <rect x="7" y="7" width="10" height="3.5" rx="1.75" fill="currentColor"/>
    </svg>
  ),
  conceptDesign: (
    <svg viewBox="0 0 24 24">
      <rect x="11" y="4" width="5" height="14" rx="2.5" fill="currentColor" opacity="0.4" transform="rotate(45 12 12)"/>
      <polygon points="8.5,18 15.5,18 12,22" fill="currentColor"/>
      <rect x="11" y="4" width="5" height="5" rx="2" fill="currentColor" transform="rotate(45 12 12)"/>
    </svg>
  ),
  functionalLogics: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="13" rx="4" fill="currentColor" opacity="0.25"/>
      <polygon points="8,19 2,22 5,19" fill="currentColor" opacity="0.3"/>
      <rect x="5" y="10" width="12" height="2" rx="1" fill="currentColor"/>
      <rect x="5" y="14" width="8" height="2" rx="1" fill="currentColor"/>
    </svg>
  ),
  development: (
    <svg viewBox="0 0 24 24">
      <g transform="rotate(-45 12 12)">
        <rect x="2" y="9" width="9" height="6" rx="3" fill="currentColor" opacity="0.4"/>
        <rect x="13" y="9" width="9" height="6" rx="3" fill="currentColor"/>
        <rect x="9" y="11" width="6" height="2" rx="1" fill="currentColor" opacity="0.6"/>
      </g>
    </svg>
  ),
  testing: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.4"/>
      <path d="M4 21Q4 15 12 15Q20 15 20 21" fill="currentColor"/>
    </svg>
  ),
};

const SVGIconsNew: React.FC<SVGIconsProps> = ({ name, size = 22, className = "" }) => {
  return (
    <span
      className={className}
      style={{ width: size, height: size, display: "inline-flex" }}
    >
      {icons[name]}
    </span>
  );
};

export default SVGIconsNew;
