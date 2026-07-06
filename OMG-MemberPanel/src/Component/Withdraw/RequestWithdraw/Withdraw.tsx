import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card } from "reactstrap";
import { WithdrawTitle, RequestWithdraw } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import Loader from "../../../CommonElements/Loader/Loader";
import { decryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { SendOTP_Service } from "../../../Service/Authentication/SendOTPService";
import { useWithdrawService } from "../../../Service/Withdraw/Withdraw";
import {
  WithdrawFormPropsType,
  WithdrawForminitialValues,
} from "../../../Type/Forms/FormsType";
import { useTransferFundService } from "../../../Service/TransferFundToDepositWallet/TransferFundToDepositWallet";
import { useCurrency } from "../../../Context/CurrencyContext";
import { useNavigate } from "react-router-dom";
import {
  FiCreditCard,
  FiDollarSign,
  FiExternalLink,
  FiLock,
  FiPocket,
  FiCheckCircle,
  FiCircle,
  FiUser,
  FiShield,
  FiInfo,
  FiAlertCircle,
  FiExternalLink as FiViewIcon,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "./Withdraw.scss";
import { ApiService } from "@/Service/UniversalService/ApiService";
import { FaIndianRupeeSign } from "react-icons/fa6";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (
  amount: number,
  currency: { symbol: string; code?: string },
) => {
  if (!amount && amount !== 0) return `${currency.symbol}0`;
  const value = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency.symbol.length === 1
    ? `${currency.symbol}${value}`
    : `${value} ${currency.symbol}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface WithdrawalWallet {
  WalletValue: string;
  WalletDisplayName: string;
  WalletId: number;
}

interface WithdrawalMode {
  Id: number;
  WithdrawalMode: string;
}

interface CryptoWallet {
  WalletTypeId: number;
  Chain: string;
  WalletAddress: string;
}

interface BankAccount {
  AccountHolderName: string;
  AccountNo: string;
  BankName: string;
  BranchName: string;
  IFSC: string;
}

interface WithdrawalCharges {
  MinimumWithdrawalAmount: number;
  MaximumWithdrawalAmount: number;
  WithdrawalAdminCharge: number;
  WithdrawalOtherCharges: number;
  WithdrawalTDS: number;
}

interface KYCStatus {
  isKYCDone: boolean;
  panDone: boolean;
  aadhaarDone: boolean;
}

interface TransactionReceipt {
  TransactionId: string;
  Amount: number;
  Date: string;
  Mode: string;
  Status: string;
  ReceiptUrl?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepHeader: React.FC<{ num: number; label: string }> = ({
  num,
  label,
}) => (
  <div className="wf-step-head">
    <span className="wf-step-num">{num}</span>
    <span className="wf-step-lbl">{label}</span>
  </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="wf-label">{children}</label>
);

const SelectWrap: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div className="wf-sel-wrap">
    <span className="wf-sel-prefix-icon">{icon}</span>
    {children}
  </div>
);

// ── Transaction Receipt Modal ──────────────────────────────────────────────────

const TransactionReceiptModal: React.FC<{
  receipt: TransactionReceipt;
  currency: { symbol: string; code?: string };
  onClose: () => void;
}> = ({ receipt, currency, onClose }) => {
  const isPdf = receipt.ReceiptUrl?.toLowerCase().endsWith(".pdf");

  const handleViewReceipt = () => {
    if (receipt.ReceiptUrl) {
      window.open(receipt.ReceiptUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="wf-receipt-overlay" onClick={onClose}>
      <div className="wf-receipt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wf-receipt-header">
          <div className="wf-receipt-success-icon">
            <FiCheckCircle size={32} />
          </div>
          <h4 className="wf-receipt-title">Withdrawal Successful</h4>
          <p className="wf-receipt-subtitle">
            Your transaction has been submitted
          </p>
        </div>

        {/* Details */}
        <div className="wf-receipt-body">
          {[
            { label: "Transaction ID", value: receipt.TransactionId },
            {
              label: "Amount",
              value: formatCurrency(receipt.Amount, currency),
            },
            { label: "Date & Time", value: receipt.Date },
            { label: "Mode", value: receipt.Mode },
            { label: "Status", value: receipt.Status },
          ].map((row, i) => (
            <div className="wf-receipt-row" key={i}>
              <span className="wf-receipt-label">{row.label}</span>
              <span
                className={`wf-receipt-value ${
                  row.label === "Status"
                    ? receipt.Status.toLowerCase() === "success"
                      ? "wf-receipt-value--success"
                      : "wf-receipt-value--pending"
                    : ""
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="wf-receipt-actions">
          {receipt.ReceiptUrl && (
            <button
              className="wf-receipt-btn wf-receipt-btn--primary"
              onClick={handleViewReceipt}
            >
              <FiViewIcon size={14} />
              {isPdf ? "View PDF Receipt" : "View Receipt"}
            </button>
          )}
          <button
            className="wf-receipt-btn wf-receipt-btn--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WalletTransferFxstPayPageContainer = () => {
  const { currency } = useCurrency();
  const { getWalletBalance, doWithdrawal, loading } = useWithdrawService();
  const { validateSponsor } = useTransferFundService();
  const { ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const { SendOTP, FormatTime } = SendOTP_Service();
  const { universalService } = ApiService();
  const navigate = useNavigate();

  // Formik reset ref
  const formikResetRef = useRef<(() => void) | null>(null);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );

  // ── OTP ────────────────────────────────────────────────────────────────────
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [disablebtn, setDisableBtn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Wallet & balance ───────────────────────────────────────────────────────
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedWalletId, setSelectedWalletId] = useState<number>(0);
  const [selectedWalletName, setSelectedWalletName] = useState<string>("");

  // ── Amount & token ─────────────────────────────────────────────────────────
  const [amount, setAmount] = useState<number>(0);
  const [tokenRate] = useState<number>(0);
  const [showmsg, setShowmsg] = useState(false);
  const [msgText, setMsgText] = useState("");

  // ── Mode & P2P ─────────────────────────────────────────────────────────────
  const [withdrawalModeType, setWithdrawalModeType] = useState<string>("");
  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);

  // ── Dynamic data ───────────────────────────────────────────────────────────
  const [withdrawalWallets, setWithdrawalWallets] = useState<
    WithdrawalWallet[]
  >([]);
  const [withdrawalModes, setWithdrawalModes] = useState<WithdrawalMode[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [groupedCryptoWallets, setGroupedCryptoWallets] = useState<
    Map<string, CryptoWallet[]>
  >(new Map());
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [withdrawalCharges, setWithdrawalCharges] =
    useState<WithdrawalCharges | null>(null);
  const [minimumWithdrawalAmount, setMinimumWithdrawalAmount] = useState(0);
  const [maximumWithdrawalAmount, setMaximumWithdrawalAmount] = useState(0);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [selectedCryptoWallet, setSelectedCryptoWallet] =
    useState<CryptoWallet | null>(null);

  // ── Computed charges ───────────────────────────────────────────────────────
  const [adminCharge, setAdminCharge] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [tdsAmount, setTdsAmount] = useState<number>(0);
  const [withdrawalFee, setWithdrawalFee] = useState<number>(0);

  // ── Receipt ────────────────────────────────────────────────────────────────
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadInitialData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadWithdrawalWallets(),
      loadWithdrawalModes(),
      loadCryptoWallets(),
      loadBankAccount(),
      loadWithdrawalCharges(),
      loadKYCStatus(),
    ]);
  };

  const apiCall = async (actionMode: string) => {
    return getWalletBalance({
      procName: "WithdrawFund",
      Para: JSON.stringify({ ClientId: ClientID, ActionMode: actionMode }),
    });
  };

  const loadWithdrawalWallets = async () => {
    const res = await apiCall("GetWithdrawalWallets");
    if (Array.isArray(res)) setWithdrawalWallets(res);
  };

  const loadWithdrawalModes = async () => {
    const res = await apiCall("GetWithdrawalMode");
    if (Array.isArray(res)) setWithdrawalModes(res);
  };

  const loadCryptoWallets = async () => {
    const res = await getWalletBalance({
      procName: "WithdrawFund",
      Para: JSON.stringify({
        ClientId: ClientID,
        ActionMode: "GetMemberCryptoWallet",
      }),
    });
    if (Array.isArray(res)) {
      setCryptoWallets(res);
      const groups = new Map<string, CryptoWallet[]>();
      res.forEach((w: CryptoWallet) => {
        const chain = w.Chain.split("(")[0].trim();
        if (!groups.has(chain)) groups.set(chain, []);
        groups.get(chain)!.push(w);
      });
      setGroupedCryptoWallets(groups);
      if (res.length > 0) setSelectedCryptoWallet(res[0]);
    }
  };

  const loadBankAccount = async () => {
    const res = await apiCall("GetMemberBankAccount");
    if (res?.length > 0) setBankAccount(res[0]);
  };

  const loadWithdrawalCharges = async () => {
    const res = await universalService({
      procName: "GetWithdrawalSettings",
      Para: JSON.stringify({}),
    });
    const data = Array.isArray(res) ? res : res?.data;
    if (Array.isArray(data) && data.length > 0) {
      const c: WithdrawalCharges = data[0];
      setWithdrawalCharges(c);
      setMinimumWithdrawalAmount(c.MinimumWithdrawalAmount || 0);
      setMaximumWithdrawalAmount(c.MaximumWithdrawalAmount || 0);
    }
  };

  const loadKYCStatus = async () => {
    try {
      const res = await universalService({
        procName: "MemberKYCCheck",
        Para: JSON.stringify({ ClientId: ClientID }),
      });
      const data = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(data) && data.length > 0) {
        const k = data[0];
        setKycStatus({
          isKYCDone: !!k.PanDone && !!k.AadhaarDone,
          panDone: !!k.PanDone,
          aadhaarDone: !!k.AadhaarDone,
        });
      } else {
        setKycStatus({ isKYCDone: false, panDone: false, aadhaarDone: false });
      }
    } catch {
      setKycStatus({ isKYCDone: false, panDone: false, aadhaarDone: false });
    } finally {
      setKycLoading(false);
    }
  };

  // ── Charge calculation ─────────────────────────────────────────────────────
  const calculateCharges = (
    withdrawAmount: number,
    charges?: WithdrawalCharges | null,
  ) => {
    const c = charges || withdrawalCharges;
    if (!c || !withdrawAmount) {
      setAdminCharge(0);
      setOtherCharges(0);
      setTdsAmount(0);
      setWithdrawalFee(0);
      return;
    }
    const admin = (withdrawAmount * (c.WithdrawalAdminCharge || 0)) / 100;
    const other = (withdrawAmount * (c.WithdrawalOtherCharges || 0)) / 100;
    const tds = (withdrawAmount * (c.WithdrawalTDS || 0)) / 100;
    setAdminCharge(admin);
    setOtherCharges(other);
    setTdsAmount(tds);
    setWithdrawalFee(admin + other + tds);
  };

  const youWillReceive = Math.max(0, amount - withdrawalFee);
  const totalDeductionPct =
    (withdrawalCharges?.WithdrawalAdminCharge || 0) +
    (withdrawalCharges?.WithdrawalOtherCharges || 0) +
    (withdrawalCharges?.WithdrawalTDS || 0);

  // ── Reset helpers ──────────────────────────────────────────────────────────

  const resetOtpState = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsOtpSent(false);
    setOtpTimer(0);
    setDisableBtn(false);
  };

  const resetFormState = () => {
    resetOtpState();
    setAmount(0);
    setAdminCharge(0);
    setOtherCharges(0);
    setTdsAmount(0);
    setWithdrawalFee(0);
    setShowmsg(false);
    setMsgText("");
    setWithdrawalModeType("");
    setUsernameValid(null);
    setUsername("");
    formikResetRef.current?.();
  };

  // ── Validation schema ──────────────────────────────────────────────────────
  const WithdrawSchema = Yup.object().shape({
    WalletType: Yup.string().required("Select a wallet"),
    WithdrawMode: Yup.string().required("Select a withdrawal mode"),
    WithdrawAmount: Yup.number()
      .typeError("Enter a valid amount")
      .min(
        minimumWithdrawalAmount || 10,
        `Minimum withdrawal is ${formatCurrency(minimumWithdrawalAmount || 10, currency)}`,
      )
      .max(
        maximumWithdrawalAmount > 0
          ? Math.min(maximumWithdrawalAmount, walletBalance)
          : walletBalance,
        `Maximum withdrawal is ${formatCurrency(
          maximumWithdrawalAmount > 0
            ? Math.min(maximumWithdrawalAmount, walletBalance)
            : walletBalance,
          currency,
        )}`,
      )
      .required("Enter an amount"),
    OTP: Yup.string().min(4, "Enter a valid OTP").required("Enter the OTP"),
    ...(withdrawalModeType === "p2p" && {
      ToUsername: Yup.string().required("Enter recipient username"),
    }),
  });

  // ── OTP gate — all Swal ────────────────────────────────────────────────────
  const isFormReadyForOTP = (values: any): boolean => {
    if (!values.WalletType) {
      Swal.fire({
        icon: "warning",
        title: "Select Wallet",
        text: "Please select a wallet before requesting OTP.",
      });
      return false;
    }
    if (!values.WithdrawMode) {
      Swal.fire({
        icon: "warning",
        title: "Select Withdrawal Mode",
        text: "Please select a withdrawal mode before requesting OTP.",
      });
      return false;
    }
    if (withdrawalModeType === "p2p") {
      if (!values.ToUsername?.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Recipient Required",
          text: "Please enter the recipient username before requesting OTP.",
        });
        return false;
      }
      if (usernameValid !== true) {
        Swal.fire({
          icon: "error",
          title: "Invalid Username",
          text: "The recipient username is not valid. Please check and try again.",
        });
        return false;
      }
    }
    const amt = Number(values.WithdrawAmount);
    if (!amt || amt <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Enter Amount",
        text: "Please enter a withdrawal amount before requesting OTP.",
      });
      return false;
    }
    const minAmt = minimumWithdrawalAmount || 10;
    if (amt < minAmt) {
      Swal.fire({
        icon: "warning",
        title: "Amount Too Low",
        text: `Minimum withdrawal amount is ${formatCurrency(
          minAmt,
          currency,
        )}. You entered ${formatCurrency(amt, currency)}.`,
      });
      return false;
    }
    if (amt > walletBalance) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `Your available balance is ${formatCurrency(
          walletBalance,
          currency,
        )}, but you requested ${formatCurrency(amt, currency)}.`,
      });
      return false;
    }
    return true;
  };

  // ── Reactive disable flag for Send OTP button ──────────────────────────────
  const isSendOtpDisabled = (values: any): boolean => {
    if (disablebtn) return true;
    if (!values.WalletType) return true;
    if (!values.WithdrawMode) return true;
    if (withdrawalModeType === "p2p" && usernameValid !== true) return true;
    const amt = Number(values.WithdrawAmount);
    if (!amt || amt <= 0) return true;
    if (amt < (minimumWithdrawalAmount || 10)) return true;
    if (amt > walletBalance) return true;
    if (maximumWithdrawalAmount > 0 && amt > maximumWithdrawalAmount)
      return true;
    return false;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleWalletChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (f: string, v: any) => void,
    resetForm: () => void,
  ) => {
    const val = Number(e.target.value);
    const wallet = withdrawalWallets.find((w) => w.WalletId === val);

    formikResetRef.current = resetForm;

    resetFormState();

    setSelectedWalletId(wallet?.WalletId || 0);
    setSelectedWalletName(wallet?.WalletDisplayName || "");

    // Re-apply newly selected wallet value after Formik reset
    setTimeout(() => setFieldValue("WalletType", val), 0);

    if (wallet?.WalletId) {
      const res = await getWalletBalance({
        procName: "WithdrawFund",
        Para: JSON.stringify({
          ClientId: ClientID,
          WithdrawWalletId: wallet.WalletId,
          ActionMode: "GetWalletBalanceById",
        }),
      });
      if (res?.length > 0) setWalletBalance(res[0].WalletAmount || 0);
    } else {
      setWalletBalance(0);
    }
  };

  const HandleWithdrawMode = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (f: string, v: any) => void,
  ) => {
    // Guard: wallet must be selected first
    if (!selectedWalletId) {
      Swal.fire({
        icon: "warning",
        title: "Select Wallet First",
        text: "Please select a wallet before choosing a withdrawal mode.",
      });
      setFieldValue("WithdrawMode", "");
      return;
    }

    const selectedId = Number(e.target.value);
    const selectedMode = withdrawalModes.find((m) => m.Id === selectedId);

    if (!selectedMode) {
      setWithdrawalModeType("");
      setFieldValue("WithdrawMode", "");
      return;
    }

    const modeName = selectedMode.WithdrawalMode.toLowerCase();
    if (modeName.includes("bank")) {
      setWithdrawalModeType("bank");
    } else if (modeName.includes("crypto") || modeName.includes("usdt")) {
      setWithdrawalModeType("crypto");
    } else if (modeName.includes("p2p")) {
      setWithdrawalModeType("p2p");
    } else {
      setWithdrawalModeType("");
    }

    // Reset P2P state when mode switches
    setUsernameValid(null);
    setUsername("");
    setFieldValue("WithdrawMode", selectedId);
    setFieldValue("ToUsername", "");
  };

  const handleAmountBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    values: { WithdrawMode: string },
  ) => {
    const amt = Number(e.target.value);
    setAmount(amt);
    calculateCharges(amt);

    const minAmt = minimumWithdrawalAmount || 10;

    // Swal validation on blur
    if (amt > 0 && amt < minAmt) {
      Swal.fire({
        icon: "warning",
        title: "Amount Too Low",
        text: `Minimum withdrawal is ${formatCurrency(
          minAmt,
          currency,
        )}. You entered ${formatCurrency(amt, currency)}.`,
      });
    } else if (maximumWithdrawalAmount > 0 && amt > maximumWithdrawalAmount) {
      Swal.fire({
        icon: "warning",
        title: "Amount Too High",
        text: `Maximum withdrawal amount is ${formatCurrency(maximumWithdrawalAmount, currency)}. You entered ${formatCurrency(amt, currency)}.`,
      });
    } else if (amt > walletBalance && walletBalance > 0) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `Your available balance is ${formatCurrency(walletBalance, currency)}, but you entered ${formatCurrency(amt, currency)}.`,
      });
    }

    if (values.WithdrawMode === "FXSTToken" && amt > 0 && tokenRate > 0) {
      setShowmsg(true);
      setMsgText(
        `${formatCurrency(amt, currency)} = ${Math.floor(
          amt / tokenRate,
        )} FXST [1 FXST = ${formatCurrency(tokenRate, currency)}]`,
      );
    } else {
      setShowmsg(false);
    }
  };

  const startTimer = (secondsLeft: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setOtpTimer(secondsLeft - 1);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setIsOtpSent(false);
          setDisableBtn(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (values: any) => {
    if (!isFormReadyForOTP(values)) return;

    setDisableBtn(true);
    try {
      const res = await universalService({
        procName: "SendOTP",
        Para: JSON.stringify({ ClientId: ClientID }),
      });
      if (res[0].StatusCode === 1) {
        setIsOtpSent(true);
        ShowSuccessAlert("OTP sent to your registered email Id");
        startTimer(res[0].SecondsLeft);
      } else {
        setDisableBtn(false);
        Swal.fire({
          icon: "error",
          title: "OTP Failed",
          text: res[0].Msg ?? "Failed to send OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setDisableBtn(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while sending OTP.",
      });
    }
  };

  const handleSponsorBlur = async (
    e: React.FocusEvent<HTMLInputElement>,
    values: WithdrawFormPropsType,
  ) => {
    if (!values.ToUsername) return;
    const res = await validateSponsor({
      procName: "CheckSponsor",
      Para: JSON.stringify({ UserName: values.ToUsername }),
    });
    if (res[0].StatusCode === "1") {
      setUsername(res[0].Name);
      setUsernameValid(true);
    } else {
      setUsername("Not Available");
      setUsernameValid(false);
      Swal.fire({
        icon: "error",
        title: "User Not Found",
        text: `The username "${values.ToUsername}" does not exist. Please check and try again.`,
      });
    }
  };

  const handleWithdrawal = async (
    values: WithdrawFormPropsType,
    resetForm: () => void,
  ) => {
    const confirmed = await ShowConfirmAlert(
      "Confirm Withdrawal",
      `Withdraw ${formatCurrency(
        values.WithdrawAmount,
        currency,
      )}?\nNet payout after charges: ${formatCurrency(
        youWillReceive,
        currency,
      )}.`,
    );
    if (!confirmed) return;

    const res = await doWithdrawal({
      procName: "WithdrawFund",
      Para: JSON.stringify({
        ClientId: ClientID,
        WithdrawWalletId: selectedWalletId,
        WithdrawAmount: values.WithdrawAmount,
        OTP: values.OTP,
        PaymentMode: withdrawalModeType,
        WithdrawModeId: values.WithdrawMode,
        ReceivingWalletTypeId: selectedCryptoWallet?.WalletTypeId || 0,
        ActionMode: "Withdraw",
      }),
    });

    if (res[0].StatusCode === 1) {
      // Stop OTP timer immediately
      resetOtpState();

      // Build receipt
      const txReceipt: TransactionReceipt = {
        TransactionId: res[0].TransactionId ?? res[0].TxnId ?? "—",
        Amount: values.WithdrawAmount,
        Date: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        Mode: withdrawalModeType.toUpperCase(),
        Status: res[0].Status ?? "Pending",
        ReceiptUrl: res[0].ReceiptUrl ?? res[0].PdfUrl ?? undefined,
      };

      setReceipt(txReceipt);
      setShowReceipt(true);

      // Reset full form
      formikResetRef.current = resetForm;
      resetFormState();
      setWalletBalance(0);
      setSelectedWalletId(0);
      setSelectedWalletName("");

      // Auto-navigate after 8s if receipt not closed manually
      setTimeout(() => navigate("/member/WithdrawHistory"), 8000);
    } else {
      Swal.fire({
        icon: "error",
        title: "Withdrawal Failed",
        text: res[0].Msg,
      });
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setReceipt(null);
    navigate("/portal/WithdrawHistory");
  };

  const truncateAddress = (address: string) => {
    if (!address || address.length <= 20) return address;
    return `${address.substring(0, 10)}...${address.substring(
      address.length - 8,
    )}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="wf-page">
      <Breadcrumbs
        mainTitle={RequestWithdraw}
        parent={WithdrawTitle}
        ChildName={"Withdraw Request"}
      />
      {loading && <Loader />}
      {/* 
      Transaction Receipt Modal */}
      {/* {showReceipt && receipt && (
        <TransactionReceiptModal
          receipt={receipt}
          currency={currency}
          onClose={handleReceiptClose}
        />
      )} */}

      <Container fluid className="wf-container">
        <Row className="g-3 align-items-start">
          {/* ── LEFT: Wallet Summary ──────────────────────────────────────── */}
          <Col xl="4" lg="4" md="12">
            <Card className="wf-left-card">
              <div className="wf-banner">
                <div className="wf-banner-content">
                  <span className="wf-banner-title">Withdrawal</span>
                  <span className="wf-banner-sub">Secure fund transfer</span>
                </div>
                <div className="wf-coin-badge">
                  {currency.symbol.length === 1 ? currency.symbol : "W"}
                </div>
              </div>

              <div className="wf-left-body">
                <div className="wf-bal-section">
                  <span className="wf-bal-label">Selected Wallet Balance</span>
                  <div className="wf-bal-value">
                    {walletBalance > 0
                      ? formatCurrency(walletBalance, currency)
                      : "—"}
                  </div>
                  <span className="wf-bal-sub">
                    {selectedWalletName || "No wallet selected"}
                  </span>
                  {walletBalance > 0 && (
                    <div className="wf-active-pill">
                      <FiCheckCircle size={10} />
                      Active &amp; Verified
                    </div>
                  )}
                </div>

                <div className="wf-divider" />

                <div className="wf-guide-block">
                  <div className="wf-guide-title">
                    <FiInfo size={11} />
                    Withdrawal Guidelines
                  </div>

                  <div className="wf-guide-row">
                    <span className="wf-guide-name">Minimum Amount</span>
                    <span className="wf-guide-val wf-guide-val--green">
                      {formatCurrency(minimumWithdrawalAmount || 10, currency)}
                    </span>
                  </div>

                  <div className="wf-guide-row">
                    <span className="wf-guide-name">Maximum Amount</span>
                    <span className="wf-guide-val wf-guide-val--green">
                      {maximumWithdrawalAmount > 0
                        ? formatCurrency(maximumWithdrawalAmount, currency)
                        : "—"}
                    </span>
                  </div>

                  {withdrawalCharges?.WithdrawalAdminCharge ? (
                    <div className="wf-guide-row">
                      <span className="wf-guide-name">Admin Charge</span>
                      <span className="wf-guide-val wf-guide-val--red">
                        {withdrawalCharges.WithdrawalAdminCharge}%
                      </span>
                    </div>
                  ) : null}

                  {withdrawalCharges?.WithdrawalOtherCharges ? (
                    <div className="wf-guide-row">
                      <span className="wf-guide-name">Other Charges</span>
                      <span className="wf-guide-val wf-guide-val--red">
                        {withdrawalCharges.WithdrawalOtherCharges}%
                      </span>
                    </div>
                  ) : null}

                  {withdrawalCharges?.WithdrawalTDS ? (
                    <div className="wf-guide-row">
                      <span className="wf-guide-name">TDS</span>
                      <span className="wf-guide-val wf-guide-val--red">
                        {withdrawalCharges.WithdrawalTDS}%
                      </span>
                    </div>
                  ) : null}

                  <div className="wf-guide-row wf-guide-row--total">
                    <span className="wf-guide-name">Total Deduction</span>
                    <span className="wf-guide-val wf-guide-val--red">
                      {totalDeductionPct}%
                    </span>
                  </div>

                  <div className="wf-guide-row">
                    <span className="wf-guide-name">Processing Time</span>
                    <span className="wf-guide-val">1–3 business days</span>
                  </div>
                </div>

                {/* <a href="#" className="wf-support-link">
                  <FiInfo size={12} />
                  Contact support for assistance
                </a> */}
              </div>
            </Card>
          </Col>

          {/* ── RIGHT: Form ───────────────────────────────────────────────── */}
          <Col xl="8" lg="8" md="12">
            {/* KYC Block */}
            {!kycLoading &&
              kycStatus &&
              (!kycStatus.panDone || !kycStatus.aadhaarDone) && (
                <Card className="wf-form-card">
                  <div style={{ padding: "32px 24px", textAlign: "center" }}>
                    <FiAlertCircle
                      size={48}
                      color="#ef4444"
                      style={{ marginBottom: 16 }}
                    />
                    <h5
                      style={{
                        fontWeight: 700,
                        color: "#ef4444",
                        marginBottom: 8,
                      }}
                    >
                      KYC Verification Required
                    </h5>
                    <p
                      style={{
                        color: "#6b7280",
                        marginBottom: 20,
                        fontSize: 14,
                      }}
                    >
                      Please complete your KYC before requesting a withdrawal.
                      Both PAN Card and Aadhaar are mandatory.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          background: kycStatus.panDone ? "#dcfce7" : "#fee2e2",
                          color: kycStatus.panDone ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {kycStatus.panDone ? (
                          <FiCheckCircle size={14} />
                        ) : (
                          <FiAlertCircle size={14} />
                        )}
                        PAN Card — {kycStatus.panDone ? "Submitted" : "Pending"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          background: kycStatus.aadhaarDone
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: kycStatus.aadhaarDone ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {kycStatus.aadhaarDone ? (
                          <FiCheckCircle size={14} />
                        ) : (
                          <FiAlertCircle size={14} />
                        )}
                        Aadhaar —{" "}
                        {kycStatus.aadhaarDone ? "Submitted" : "Pending"}
                      </div>
                    </div>
                    <button
                      className="form-btn btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onClick={() => navigate("/member/kyc")}
                    >
                      <FiExternalLink size={14} /> Complete KYC Now
                    </button>
                  </div>
                </Card>
              )}

            {/* Show form only if KYC done */}
            {!kycLoading && kycStatus?.panDone && kycStatus?.aadhaarDone && (
              <Formik
                initialValues={{
                  ...WithdrawForminitialValues,
                  OTP: "",
                  ToUsername: "",
                }}
                validationSchema={WithdrawSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  formikResetRef.current = resetForm;
                  handleWithdrawal(values as any, resetForm);
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, setFieldValue, values, resetForm }) => (
                  <Form>
                    <Card className="wf-form-card">
                      {/* ── Step 1: Select Wallet ── */}
                      <div className="wf-step">
                        <StepHeader num={1} label="Select Wallet" />
                        <div className="wf-step-body">
                          <div className="wf-wallet-row">
                            <div className="wf-fg wf-fg--grow">
                              <FieldLabel>Wallet</FieldLabel>
                              <SelectWrap icon={<FiPocket size={14} />}>
                                <Field
                                  as="select"
                                  name="WalletType"
                                  className="wf-sel st-filter-input"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>,
                                  ) =>
                                    handleWalletChange(
                                      e,
                                      setFieldValue,
                                      resetForm,
                                    )
                                  }
                                >
                                  <option value="">Select Wallet</option>
                                  {withdrawalWallets.map((w, i) => (
                                    <option key={i} value={w.WalletId}>
                                      {w.WalletDisplayName}
                                    </option>
                                  ))}
                                </Field>
                              </SelectWrap>
                              <ErrorMessage
                                name="WalletType"
                                component="div"
                                className="wf-err"
                              />
                            </div>

                            {values.WalletType && (
                              <div className="wf-bal-chip">
                                <span className="wf-bal-chip-label">
                                  Available
                                </span>
                                <span className="wf-bal-chip-value">
                                  {formatCurrency(walletBalance, currency)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="wf-step-divider" />

                      {/* ── Step 2: Withdraw Mode ── */}
                      <div className="wf-step">
                        <StepHeader num={2} label="Withdrawal Mode" />
                        <div className="wf-step-body">
                          <div className="wf-fg">
                            <FieldLabel>Mode</FieldLabel>
                            <SelectWrap icon={<FiExternalLink size={14} />}>
                              <Field
                                as="select"
                                name="WithdrawMode"
                                className="wf-sel st-filter-input"
                                onChange={(
                                  e: React.ChangeEvent<HTMLSelectElement>,
                                ) => HandleWithdrawMode(e, setFieldValue)}
                              >
                                <option value="">Select Mode</option>
                                {withdrawalModes.map((m, i) => (
                                  <option key={i} value={m.Id}>
                                    {m.WithdrawalMode}
                                  </option>
                                ))}
                              </Field>
                            </SelectWrap>
                            <ErrorMessage
                              name="WithdrawMode"
                              component="div"
                              className="wf-err"
                            />
                          </div>

                          {/* Bank Details */}
                          {withdrawalModeType === "bank" && bankAccount && (
                            <div className="wf-subsec wf-subsec--blue">
                              <div className="wf-subsec-head">
                                <FiCreditCard size={13} />
                                <span>Bank Account Details</span>
                              </div>
                              <div className="wf-two-col">
                                {[
                                  {
                                    label: "Account Holder",
                                    value: bankAccount.AccountHolderName,
                                  },
                                  {
                                    label: "Bank Name",
                                    value: bankAccount.BankName,
                                  },
                                  {
                                    label: "Account Number",
                                    value: bankAccount.AccountNo,
                                  },
                                  {
                                    label: "IFSC Code",
                                    value: `${bankAccount.IFSC} · ${bankAccount.BranchName}`,
                                  },
                                ].map((field, i) => (
                                  <div className="wf-fg" key={i}>
                                    <label className="wf-label">
                                      {field.label}
                                    </label>
                                    <input
                                      className="wf-inp st-filter-input wf-inp--readonly"
                                      value={field.value || ""}
                                      readOnly
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Crypto Wallets */}
                          {withdrawalModeType === "crypto" && (
                            <div className="wf-subsec wf-subsec--teal">
                              <div className="wf-subsec-head wf-subsec-head--teal">
                                <FaIndianRupeeSign size={13} />
                                <span>Select Destination Wallet</span>
                              </div>
                              {cryptoWallets.length === 0 ? (
                                <div className="wf-no-wallet">
                                  <FiAlertCircle size={16} />
                                  <span>
                                    No crypto wallets found. Please add one in
                                    your profile.
                                  </span>
                                </div>
                              ) : (
                                Array.from(groupedCryptoWallets.entries()).map(
                                  ([chain, wallets]) => (
                                    <div
                                      key={chain}
                                      className="wf-crypto-group"
                                    >
                                      <div className="wf-chain-header">
                                        <span className="wf-chain-name">
                                          {chain}
                                        </span>
                                        <span className="wf-chain-count">
                                          {wallets.length} wallet
                                          {wallets.length > 1 ? "s" : ""}
                                        </span>
                                      </div>
                                      <div className="wf-crypto-list">
                                        {wallets.map((wallet, idx) => {
                                          const isActive =
                                            selectedCryptoWallet?.WalletAddress ===
                                            wallet.WalletAddress;
                                          return (
                                            <div
                                              key={idx}
                                              className={`wf-crypto-item${
                                                isActive
                                                  ? " wf-crypto-item--active"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                setSelectedCryptoWallet(wallet)
                                              }
                                            >
                                              <div className="wf-radio-dot">
                                                {isActive ? (
                                                  <div className="wf-radio-inner" />
                                                ) : null}
                                              </div>
                                              <div className="wf-crypto-info">
                                                <span
                                                  className="wf-crypto-addr"
                                                  title={wallet.WalletAddress}
                                                >
                                                  {truncateAddress(
                                                    wallet.WalletAddress,
                                                  )}
                                                </span>
                                                <span className="wf-crypto-chain">
                                                  {wallet.Chain}
                                                </span>
                                              </div>
                                              <span className="wf-crypto-badge">
                                                USDT
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ),
                                )
                              )}
                            </div>
                          )}

                          {/* P2P */}
                          {withdrawalModeType === "p2p" && (
                            <div
                              className="wf-fg"
                              style={{ marginTop: "12px" }}
                            >
                              <FieldLabel>Recipient Username</FieldLabel>
                              <SelectWrap icon={<FiUser size={14} />}>
                                <Field
                                  type="text"
                                  name="ToUsername"
                                  placeholder="Enter username"
                                  className="wf-sel st-filter-input"
                                  onBlur={(
                                    e: React.FocusEvent<HTMLInputElement>,
                                  ) => handleSponsorBlur(e, values as any)}
                                />
                              </SelectWrap>
                              {usernameValid === true && (
                                <div className="wf-ok">
                                  <FiCheckCircle size={11} /> Valid user:{" "}
                                  {username}
                                </div>
                              )}
                              {usernameValid === false && (
                                <div className="wf-err">
                                  <FiCircle size={11} /> User not found
                                </div>
                              )}
                              <ErrorMessage
                                name="ToUsername"
                                component="div"
                                className="wf-err"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="wf-step-divider" />

                      {/* ── Step 3: Amount & OTP ── */}
                      <div className="wf-step">
                        <StepHeader num={3} label="Enter Amount & Verify" />
                        <div className="wf-step-body">
                          <div className="wf-amount-summary-row">
                            <div className="wf-fg wf-fg--grow">
                              <FieldLabel>
                                Amount ({currency.code || "USD"})
                              </FieldLabel>
                              <SelectWrap
                                icon={<FaIndianRupeeSign size={14} />}
                              >
                                <Field
                                  type="number"
                                  name="WithdrawAmount"
                                  placeholder={`Min: ${formatCurrency(
                                    minimumWithdrawalAmount,
                                    currency,
                                  )}`}
                                  className="wf-sel st-filter-input"
                                  onBlur={(
                                    e: React.FocusEvent<HTMLInputElement>,
                                  ) => handleAmountBlur(e, values as any)}
                                />
                              </SelectWrap>
                              <span className="wf-hint">
                                Min:{" "}
                                {formatCurrency(
                                  minimumWithdrawalAmount || 0,
                                  currency,
                                )}
                                {" · "}
                                Max:{" "}
                                {maximumWithdrawalAmount > 0
                                  ? formatCurrency(
                                      maximumWithdrawalAmount,
                                      currency,
                                    )
                                  : "—"}
                              </span>
                              {showmsg && (
                                <div className="wf-token-msg">{msgText}</div>
                              )}
                              <ErrorMessage
                                name="WithdrawAmount"
                                component="div"
                                className="wf-err"
                              />
                            </div>

                            {/* Summary box */}
                            <div className="wf-summary-box">
                              {amount > 0 ? (
                                <>
                                  <div className="wf-summary-row">
                                    <span>Withdrawal Amount</span>
                                    <span className="wf-summary-val">
                                      {formatCurrency(amount, currency)}
                                    </span>
                                  </div>
                                  {adminCharge > 0 && (
                                    <div className="wf-summary-row">
                                      <span>
                                        Admin Charge (
                                        {
                                          withdrawalCharges?.WithdrawalAdminCharge
                                        }
                                        %)
                                      </span>
                                      <span className="wf-summary-val wf-summary-val--red">
                                        -{formatCurrency(adminCharge, currency)}
                                      </span>
                                    </div>
                                  )}
                                  {otherCharges > 0 && (
                                    <div className="wf-summary-row">
                                      <span>
                                        Other Charges (
                                        {
                                          withdrawalCharges?.WithdrawalOtherCharges
                                        }
                                        %)
                                      </span>
                                      <span className="wf-summary-val wf-summary-val--red">
                                        -
                                        {formatCurrency(otherCharges, currency)}
                                      </span>
                                    </div>
                                  )}
                                  {tdsAmount > 0 && (
                                    <div className="wf-summary-row">
                                      <span>
                                        TDS ({withdrawalCharges?.WithdrawalTDS}
                                        %)
                                      </span>
                                      <span className="wf-summary-val wf-summary-val--red">
                                        -{formatCurrency(tdsAmount, currency)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="wf-summary-row wf-summary-row--total">
                                    <span>You Will Receive</span>
                                    <span className="wf-summary-val wf-summary-val--green">
                                      {formatCurrency(youWillReceive, currency)}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="wf-summary-placeholder">
                                  Enter an amount to see fee breakdown
                                </div>
                              )}
                            </div>
                          </div>

                          {/* OTP Notice */}
                          <div className="wf-otp-notice">
                            <FiShield
                              size={14}
                              className="wf-otp-notice-icon"
                            />
                            <div>
                              <div className="wf-otp-notice-title">
                                OTP Verification Required
                              </div>
                              <div className="wf-otp-notice-desc">
                                Complete all steps above, then request an OTP to
                                authorize this withdrawal.
                              </div>
                            </div>
                          </div>

                          {/* OTP Input */}
                          <div className="wf-fg">
                            <FieldLabel>One-Time Password</FieldLabel>
                            <div className="wf-otp-row">
                              <span className="wf-otp-lock">
                                <FiLock size={14} />
                              </span>
                              <Field
                                type="text"
                                name="OTP"
                                placeholder="Enter OTP"
                                className="st-filter-input"
                                maxLength={6}
                              />
                              <button
                                type="button"
                                className="wf-send-otp-btn"
                                disabled={isSendOtpDisabled(values)}
                                onClick={() => handleSendOTP(values)}
                              >
                                {isOtpSent ? FormatTime(otpTimer) : "Send OTP"}
                              </button>
                            </div>

                            {/* Single generic hint — Swal handles specifics */}
                            {isSendOtpDisabled(values) && !disablebtn && (
                              <div className="wf-otp-hint">
                                ⚠️ Complete all fields above to enable Send OTP.
                              </div>
                            )}

                            {isOtpSent && (
                              <div className="wf-otp-timer">
                                OTP expires in {FormatTime(otpTimer)}
                              </div>
                            )}
                            <ErrorMessage
                              name="OTP"
                              component="div"
                              className="wf-err"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ── Actions ── */}
                      <div className="wf-actions">
                        <div className="wf-secure-tag">
                          <FiShield size={12} />
                          SSL Secured
                        </div>
                        <button
                          type="submit"
                          className="wf-btn-submit"
                          disabled={
                            isSubmitting ||
                            !values.WalletType ||
                            !values.WithdrawMode ||
                            !values.WithdrawAmount ||
                            (withdrawalModeType === "crypto" &&
                              !selectedCryptoWallet)
                          }
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          Withdraw Now
                        </button>
                      </div>
                    </Card>
                  </Form>
                )}
              </Formik>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WalletTransferFxstPayPageContainer;
