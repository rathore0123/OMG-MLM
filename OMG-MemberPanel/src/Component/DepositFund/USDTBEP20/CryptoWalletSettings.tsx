import React, { useState, useEffect } from "react";
import "./CryptoWalletSettings.scss";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { useTransferFundService } from "../../../Service/TransferFundToDepositWallet/TransferFundToDepositWallet";
import { decryptData } from "../../../utils/helper/Crypto";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import { Container } from "reactstrap";
import { MdLabelImportantOutline } from "react-icons/md";

// ================= ICONS =================
const ShieldIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const WalletIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ================= VALIDATION FUNCTIONS =================

// Validate based on chain type
const validateWalletAddress = (
  address: string,
  chain: string,
): { isValid: boolean; error: string } => {
  if (!address || address.trim() === "") {
    return { isValid: false, error: "Wallet address is required" };
  }

  const trimmedAddress = address.trim();
  const upperChain = chain?.toUpperCase() || "";

  switch (upperChain) {
    case "BEP20":
    case "ERC20":
    case "POL":
    case "POLYGON":
      return validateEVMAddress(trimmedAddress, upperChain);

    case "TRC20":
    case "TRX":
      return validateTronAddress(trimmedAddress);

    case "BTC":
      return validateBitcoinAddress(trimmedAddress);

    case "SOL":
      return validateSolanaAddress(trimmedAddress);

    default:
      return { isValid: true, error: "" };
  }
};

// EVM based chains (BEP20, ERC20, Polygon, etc.)
const validateEVMAddress = (
  address: string,
  chain: string,
): { isValid: boolean; error: string } => {
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!evmRegex.test(address)) {
    return {
      isValid: false,
      error: `Invalid ${chain} address. Address must start with '0x' and be followed by 40 hexadecimal characters.`,
    };
  }

  return { isValid: true, error: "" };
};

// TRON addresses (TRC20, TRX)
const validateTronAddress = (
  address: string,
): { isValid: boolean; error: string } => {
  const tronRegex = /^T[a-zA-Z0-9]{33}$/;

  if (!tronRegex.test(address)) {
    return {
      isValid: false,
      error:
        "Invalid TRON address. Address must start with 'T' and be 34 characters long.",
    };
  }

  return { isValid: true, error: "" };
};

// Bitcoin addresses
const validateBitcoinAddress = (
  address: string,
): { isValid: boolean; error: string } => {
  const btcRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/;

  if (!btcRegex.test(address)) {
    return {
      isValid: false,
      error:
        "Invalid Bitcoin address. Address should start with '1', '3', or 'bc1'.",
    };
  }

  return { isValid: true, error: "" };
};

// Solana addresses
const validateSolanaAddress = (
  address: string,
): { isValid: boolean; error: string } => {
  const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  if (!solRegex.test(address)) {
    return {
      isValid: false,
      error:
        "Invalid Solana address. Address should be 32-44 characters long (base58 encoded).",
    };
  }

  return { isValid: true, error: "" };
};

// Helper function to get chain color
const getChainColor = (chain: string): string => {
  const colors: Record<string, string> = {
    BEP20: "#f3ba2f",
    TRC20: "#ff060a",
    ERC20: "#627eea",
    TRX: "#ef4444",
    BTC: "#f59e0b",
    SOL: "#1e1b4b",
    POL: "#7c3aed",
    POLYGON: "#7c3aed",
  };
  return colors[chain?.toUpperCase()] || "#7c3aed";
};

// Helper function to get chain icon
const getChainIcon = (chain: string): string => {
  const icons: Record<string, string> = {
    BEP20: "B",
    TRC20: "T",
    ERC20: "E",
    TRX: "T",
    BTC: "₿",
    SOL: "◎",
    POL: "P",
    POLYGON: "P",
  };
  return icons[chain?.toUpperCase()] || chain?.[0] || "C";
};

// Helper to get example address based on chain
const getExampleAddress = (chain: string): string => {
  const examples: Record<string, string> = {
    BEP20: "0x71c7656...a4b8 (BEP-20 Address)",
    ERC20: "0x71c7656...a4b8 (ERC-20 Address)",
    TRC20: "TXyz...abc (TRC-20 Address)",
    TRX: "TXyz...abc (TRX Address)",
    BTC: "bc1q...xyz (BTC Address)",
    SOL: "AbC1...xyz (SOL Address)",
    POL: "0x71c7656...a4b8 (Polygon Address)",
    POLYGON: "0x71c7656...a4b8 (Polygon Address)",
  };
  return examples[chain?.toUpperCase()] || "Enter valid wallet address";
};

// Helper to get min withdraw amount
const getMinWithdraw = (chain: string): string => {
  const mins: Record<string, string> = {
    BEP20: "10 USDT",
    ERC20: "10 USDT",
    TRC20: "10 USDT",
    TRX: "5 TRX",
    BTC: "0.0005 BTC",
    SOL: "0.1 SOL",
    POL: "10 POL",
    POLYGON: "10 POL",
  };
  return mins[chain?.toUpperCase()] || "Check minimum requirements";
};

export const CryptoWalletSettings: React.FC = () => {
  const { getWalletBalance } = useTransferFundService();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();

  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );

  const [walletTypes, setWalletTypes] = useState<any[]>([]);
  const [activeWallet, setActiveWallet] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [addressError, setAddressError] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(179);
  const [timerActive, setTimerActive] = useState(false);
  const [copied, setCopied] = useState(false);

  // ================= FETCH CHAINS =================
  const GetWalletTypes = async () => {
    try {
      const param = { ActionMode: "GET_CHAINS" };

      const obj = {
        procName: "ManageMemberCryptoWallet",
        Para: JSON.stringify(param),
      };

      const res = await getWalletBalance(obj);

      if (res && Array.isArray(res)) {
        setWalletTypes(res);

        if (res.length > 0) {
          setActiveWallet(res[0]);
          GetWallet(res[0].WalletTypeId);
          // Get mobile/email from localStorage
          setMobileNumber(
            decryptData(localStorage.getItem("EmailId") as string),
          );
        }
      }
    } catch (e) {
      console.error(e);
      showAlert("Failed to fetch wallet types");
    }
  };

  // ================= GET WALLET =================
  const GetWallet = async (walletTypeId: number) => {
    try {
      const param = {
        ActionMode: "GET_WALLET",
        MemberId: ClientID,
        WalletTypeId: walletTypeId,
      };

      const obj = {
        procName: "ManageMemberCryptoWallet",
        Para: JSON.stringify(param),
      };

      const res = await getWalletBalance(obj);

      if (res[0]?.StatusCode === 1) {
        setWalletAddress(res[0].WalletAddress);
      } else {
        setWalletAddress("");
      }
    } catch (e) {
      console.error(e);
      showAlert("Failed to fetch wallet address");
    }
  };

  // ================= SAVE =================
  const SaveWallet = async () => {
    try {
      if (!walletAddress) {
        showAlert("Please enter wallet address");
        return;
      }

      // Validate wallet address based on chain
      const validation = validateWalletAddress(
        walletAddress,
        activeWallet?.Chain,
      );

      if (!validation.isValid) {
        showAlert(validation.error);
        return;
      }

      if (!otp) {
        showAlert("Please enter OTP");
        return;
      }

      if (otp.length !== 6) {
        showAlert("Please enter a valid 6-digit OTP");
        return;
      }

      const param = {
        ActionMode: "SAVE",
        MemberId: ClientID,
        WalletTypeId: activeWallet?.WalletTypeId,
        WalletAddress: walletAddress.trim(),
        OTP: otp,
      };

      const obj = {
        procName: "ManageMemberCryptoWallet",
        Para: JSON.stringify(param),
      };

      const res = await getWalletBalance(obj);

      if (res[0]?.StatusCode === 1) {
        ShowSuccessAlert(res[0].Msg || "Wallet address updated successfully");
        setOtpSent(false);
        setOtp("");
        // Refresh wallet data
        GetWallet(activeWallet?.WalletTypeId);
      } else {
        showAlert(res[0]?.Msg || "Failed to update wallet address");
      }
    } catch (e) {
      console.error(e);
      showAlert("An error occurred while saving wallet address");
    }
  };

  // ================= SEND OTP =================
  const SendOtp = async () => {
    try {
      const param = {
        ClientId: ClientID,
      };

      const obj = {
        procName: "SendOTP",
        Para: JSON.stringify(param),
      };

      const res = await getWalletBalance(obj);

      if (res[0]?.StatusCode === 1) {
        ShowSuccessAlert("OTP sent successfully to your registered email");
        setOtpSent(true);
        setTimerActive(true);
        setTimer(179);

        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setTimerActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showAlert(res[0]?.Msg || "Failed to send OTP");
      }
    } catch (e) {
      console.error(e);
      showAlert("Failed to send OTP");
    }
  };

  const handleSendOtp = () => {
    if (!mobileNumber) {
      showAlert("Email not found. Please contact support.");
      return;
    }
    SendOtp();
  };

  // ================= HANDLE ADDRESS CHANGE =================
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setWalletAddress(newAddress);

    if (newAddress && activeWallet?.Chain) {
      const validation = validateWalletAddress(newAddress, activeWallet?.Chain);
      setAddressError(validation.isValid ? "" : validation.error);
    } else {
      setAddressError("");
    }
  };

  // ================= HANDLE PASTE =================
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
      setCopied(true);

      // Validate after paste
      if (text && activeWallet?.Chain) {
        const validation = validateWalletAddress(text, activeWallet?.Chain);
        setAddressError(validation.isValid ? "" : validation.error);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch {
      showAlert("Unable to paste. Please manually enter the address.");
    }
  };

  // ================= TAB CLICK =================
  const handleTabClick = (wallet: any) => {
    setActiveWallet(wallet);
    setWalletAddress("");
    setOtp("");
    setOtpSent(false);
    setTimerActive(false);
    setAddressError("");
    GetWallet(wallet.WalletTypeId);
  };

  // ================= CANCEL =================
  const handleCancel = () => {
    setWalletAddress("");
    setOtp("");
    setOtpSent(false);
    setTimerActive(false);
    setAddressError("");
    if (activeWallet) {
      GetWallet(activeWallet.WalletTypeId);
    }
  };

  // ================= CLEAR ERROR ON CHAIN CHANGE =================
  useEffect(() => {
    setAddressError("");
  }, [activeWallet]);

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    GetWalletTypes();
  }, []);

  const activeChain = activeWallet?.Chain || "";
  const chainColor = getChainColor(activeChain);
  const chainIcon = getChainIcon(activeChain);

  return (
    <div className="cws-page">
      <Breadcrumbs
        mainTitle={"Crypto Wallet Setting"}
        parent={"Account Settings"}
        ChildName={"Crypto Wallet Setting"}
      />
      <Container fluid>
        {/* DYNAMIC TABS */}
        <div className="cws-tabs">
          {walletTypes.map((tab: any) => (
            <button
              key={tab.WalletTypeId}
              className={`cws-tabs__tab${
                activeWallet?.WalletTypeId === tab.WalletTypeId
                  ? " cws-tabs__tab--active"
                  : ""
              }`}
              onClick={() => handleTabClick(tab)}
            >
              <span
                className="cws-tabs__icon"
                style={{ background: getChainColor(tab.Chain) }}
              >
                {getChainIcon(tab.Chain)}
              </span>
              {tab.Name} ({tab.Chain})
            </button>
          ))}
        </div>

        {/* MAIN CARD */}
        <div className="cws-card">
          {/* Important Notice - INFO */}
          {/* <div className="cws-notice cws-notice--info">
            <div className="cws-notice__icon">
              <InfoIcon />
            </div>
            <div>
              <p className="cws-notice__title">Important</p>
              <p className="cws-notice__text">
                Please enter the correct {activeWallet?.Name} ({activeChain})
                wallet address. Transactions sent to wrong addresses cannot be
                recovered.
              </p>
            </div>
          </div> */}

          {/* Wallet Address Section */}
          <div className="cws-section">
            <h2 className="cws-section__title">
              {activeWallet?.Name} ({activeChain}) Wallet Address
            </h2>
            <p className="cws-section__subtitle">
              Enter your wallet address on {activeChain} network.
            </p>

            <div className="cws-field">
              <label className="cws-field__label">Wallet Address</label>
              <div className="cws-input-wrap">
                <span className="cws-input-wrap__icon">
                  <WalletIcon />
                </span>
                <input
                  className={`cws-input ${addressError ? "cws-input--error" : ""}`}
                  type="text"
                  placeholder={`Enter ${activeWallet?.Name} ${activeChain} Wallet Address`}
                  value={walletAddress}
                  onChange={handleAddressChange}
                />
                <button className="cws-input-wrap__paste" onClick={handlePaste}>
                  <ClipboardIcon />
                  {copied ? "Copied!" : "Paste"}
                </button>
              </div>
              {addressError ? (
                <p className="cws-field__error">{addressError}</p>
              ) : (
                <div className="d-flex flex-md-row flex-column gap-md-2 gap-0 align-items-md-center align-items-start">
                  <p className="cws-field__hint">
                    Example: {getExampleAddress(activeChain)}
                  </p>{" "}
                  <p className="cws-notice__text">
                    <MdLabelImportantOutline /> Please enter the correct{" "}
                    {activeWallet?.Name} ({activeChain}) wallet address.
                    Transactions sent to wrong addresses cannot be recovered.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* OTP Section */}
          <div className="cws-otp-card">
            <div className="cws-otp-card__header">
              <div className="cws-otp-card__icon">
                <ShieldIcon />
              </div>
              <div>
                <p className="cws-otp-card__title">Verify with OTP</p>
                <p className="cws-otp-card__desc">
                  We will send a One-Time Password (OTP) to your registered
                  email address <strong>{mobileNumber}</strong>
                </p>
              </div>
            </div>

            <div className="cws-field">
              <label className="cws-field__label">OTP</label>
              <div className="cws-input-wrap cws-input-wrap--otp">
                <span className="cws-input-wrap__icon">
                  <LockIcon />
                </span>
                <input
                  className="cws-input"
                  type="text"
                  placeholder="Enter 6 Digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  className="cws-btn cws-btn--otp"
                  onClick={handleSendOtp}
                  disabled={timerActive}
                >
                  {timerActive
                    ? `Resend OTP (${formatTimer(timer)})`
                    : "Send OTP"}
                </button>
              </div>
              {(otpSent || timerActive) && (
                <div className="cws-timer">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  OTP will expire in <strong>{formatTimer(timer)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Note Section - Warning */}
          <div className="cws-notice cws-notice--warn">
            <div className="cws-notice__icon">
              <AlertIcon />
            </div>
            <div>
              <p className="cws-notice__title cws-notice__title--warn">Note:</p>
              <ul className="cws-notice__list">
                <li>Double-check wallet address before updating.</li>
                <li>
                  Minimum {getMinWithdraw(activeChain)} required for{" "}
                  {activeChain} withdrawals.
                </li>
                <li>Ensure you are using the {activeChain} network.</li>
                <li>OTP is valid for 3 minutes only.</li>
              </ul>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="cws-footer-btns">
            {/* <button className="cws-btn cws-btn--cancel" onClick={handleCancel}>
            Cancel
          </button> */}
            <button className="cws-btn cws-btn--primary" onClick={SaveWallet}>
              <WalletIcon />
              Update Wallet Address
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CryptoWalletSettings;
