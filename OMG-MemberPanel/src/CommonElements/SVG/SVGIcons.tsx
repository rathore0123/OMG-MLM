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
  | "debit";

interface SVGIconsProps {
  name: IconName;
  size?: number;
  className?: string;
}

const icons: Record<IconName, React.ReactNode> = {
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
};

const SVGIcons: React.FC<SVGIconsProps> = ({ name, size = 22, className = "" }) => {
  return (
    <span
      className={className}
      style={{ width: size, height: size, display: "inline-flex" }}
    >
      {icons[name]}
    </span>
  );
};

export default SVGIcons;