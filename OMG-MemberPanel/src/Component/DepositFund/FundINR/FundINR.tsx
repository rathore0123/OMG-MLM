import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row, FormGroup, Label } from "reactstrap";
import {
  DepositFundTitle,
  ScrollingModalHeading,
} from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import Loader from "../../../CommonElements/Loader/Loader";
import { decryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useApiHelper } from "../../../utils/ApiHelper";
import { useDepositFundService } from "../../../Service/DepositFund/DepositFundINRAED";
import CommonModal from "./CommonModal";
import "./DepositFund.scss";
import { useCurrency } from "@/Context/CurrencyContext";
import {
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiHash,
  FiHome,
  FiLock,
  FiMessageSquare,
  FiEye,
  FiExternalLink,
} from "react-icons/fi";
import { PostService } from "../../../Service/PostService/PostService";
import Swal from "sweetalert2";

/* ─────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────── */
interface Bank {
  BankAccountId: number;
  BankName: string;
  AccountName: string;
  AccountType: string;
  AccountNo: string;
  Branch: string;
  IFSCCode: string;
  UPIID: string;
  QrCodeImage: string;
}

interface PaymentMode {
  PaymentModeId: number;
  PaymentMode: string;
}

interface FormValues {
  RequestAmount: string;
  USDTAmount: string;
  PaymentModeId: string;
  BankAccountId: string;
  UploadReceipt: string;
  UTRNo: string;
  Description: string;
}

const initialValues: FormValues = {
  RequestAmount: "",
  USDTAmount: "",
  PaymentModeId: "",
  BankAccountId: "",
  UploadReceipt: "",
  UTRNo: "",
  Description: "",
};

/* ─── Copy button ─────────────────────────────── */
const copyToClipboard = (text: string, label: string) =>
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied!`, { autoClose: 1500 }));

const CopyBtn = ({ text, label }: { text: string; label: string }) => (
  <button
    type="button"
    className="df-copy-btn"
    onClick={() => copyToClipboard(text, label)}
    title={`Copy ${label}`}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
    Copy
  </button>
);

/* ═══════════════════════════════════════════════
   Component
═══════════════════════════════════════════════ */
const USDTTRC20PageContainer = () => {
  /* state */
  const [scrollingModal, setScrollingModal] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [imageUploaderLoading, setImageUploaderLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState("NA");
  const [usdtLoading, setUsdtLoading] = useState(false);
  const { currency } = useCurrency();
  const { postDocument } = PostService();
  const [showPreview, setShowPreview] = useState(false);

  /* services */
  const {
    getDepositWalletBalance,
    getBankByCurrency,
    getCurrencyValue,
    doDeposit,
    loading,
  } = useDepositFundService();
  const { ShowSuccessAlert } = useSweetAlert();
  const { post } = useApiHelper();
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );

  /* ── Derived receipt URL ── */
  const receiptUrl =
    selectedFile !== "NA"
      ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}ClientReceipts/${selectedFile}`
      : null;
  const receiptIsPdf = receiptUrl?.toLowerCase().endsWith(".pdf") ?? false;

  /* validation */
  const DepositFundSchema = Yup.object().shape({
    RequestAmount: Yup.number()
      .typeError("Enter a valid amount")
      .required("Enter Request Amount")
      .min(1, "Amount must be greater than 0"),
    USDTAmount: Yup.string().optional(),
    PaymentModeId: Yup.string().required("Select Payment Mode"),
    BankAccountId: Yup.string().required("Select Bank"),
    UploadReceipt: Yup.string().optional(),
    UTRNo: Yup.string().required("Enter UTR / Transaction No."),
    Description: Yup.string().optional(),
  });

  /* ══════════════════════════════════════════════
     API
  ══════════════════════════════════════════════ */

  const GetWalletBalance = async () => {
    try {
      const res = await getDepositWalletBalance({
        procName: "RequestFund",
        Para: JSON.stringify({
          ClientId: ClientID,
          ActionMode: "GetWalletBalance",
        }),
      });
      setWalletBalance(res[0]?.ProductWallet ?? 0);
    } catch {}
  };

  const GetPaymentModes = async () => {
    try {
      const res = await getBankByCurrency({
        procName: "RequestFund",
        Para: JSON.stringify({ ActionMode: "GetPaymentMode" }),
      });
      setPaymentModes(res || []);
    } catch {}
  };

  const GetAllBanks = async () => {
    try {
      const res = await getBankByCurrency({
        procName: "RequestFund",
        Para: JSON.stringify({ ActionMode: "GetBanks" }),
      });
      setBanks(res || []);
    } catch {}
  };

  const GetUSDTAmount = async (
    amount: number,
    setFieldValue: (f: string, v: any) => void,
  ) => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    setUsdtLoading(true);
    setFieldValue("USDTAmount", "");
    try {
      const res = await getCurrencyValue({
        procName: "RequestFund",
        Para: JSON.stringify({ ActionMode: "GetUSDTAmount", Amount: amount }),
      });
      const usdt = res?.[0]?.USDTAmount ?? "";
      setFieldValue("USDTAmount", usdt !== "" ? String(usdt) : "");
    } catch {
      setFieldValue("USDTAmount", "");
      Swal.fire({
        icon: "error",
        title: "Rate Error",
        text: "Could not fetch USDT conversion rate. Please try again.",
      });
    } finally {
      setUsdtLoading(false);
    }
  };

  const uploadReceiptImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (f: string, v: any) => void,
  ) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File Type",
        text: "Only JPG, PNG, and PDF files are allowed.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "File Too Large",
        text: "File size must be less than 5MB.",
      });
      return;
    }

    setImageUploaderLoading(true);
    const formData = new FormData();
    formData.append("UploadedImage", file);
    formData.append("pagename", "ClientReceipts");
    try {
      const res = await postDocument(formData);
      const fileName = res?.fileName || res?.Message;
      if (!fileName) {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Could not upload receipt. Please try again.",
        });
        return;
      }
      setSelectedFile(fileName);
      toast.success("Receipt uploaded successfully!", { autoClose: 2000 });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: "Something went wrong during upload. Please try again.",
      });
    } finally {
      setImageUploaderLoading(false);
    }
  };

  const handleDeposit = async (values: FormValues, resetForm: () => void) => {
    // Validate receipt
    if (selectedFile === "NA") {
      Swal.fire({
        icon: "warning",
        title: "Receipt Required",
        text: "Please upload your transaction receipt before submitting.",
      });
      return;
    }

    // Confirm before submit
    const confirmed = await Swal.fire({
      icon: "question",
      title: "Confirm Deposit Request",
      html: `
        <div style="text-align:left; font-size:14px; line-height:1.8">
          <b>Amount:</b> ${currency.symbol}${parseFloat(values.RequestAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}<br/>
          ${values.USDTAmount ? `<b>USDT Equivalent:</b> ${values.USDTAmount} USDT<br/>` : ""}
          <b>UTR No:</b> ${values.UTRNo}<br/>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (!confirmed.isConfirmed) return;

    try {
      const res = await getDepositWalletBalance({
        procName: "RequestFund",
        Para: JSON.stringify({
          ActionMode: "CreateRequest",
          ClientId: Number(ClientID),
          BankAccountId: Number(values.BankAccountId),
          Amount: parseFloat(values.RequestAmount),
          PaymentModeId: Number(values.PaymentModeId),
          TransactionReference: values.UTRNo,
          ReceiptUrl: selectedFile,
          UserRemarks: values.Description,
        }),
      });
      const code = res?.[0]?.StatusCode;
      if (code === 1 || code === "1") {
        ShowSuccessAlert(res[0]?.Msg ?? "Request Raised Successfully");
        resetForm();
        setSelectedBank(null);
        setSelectedFile("NA");
        GetWalletBalance();
      } else {
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: res?.[0]?.Msg ?? "Something went wrong. Please try again.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Failed to submit request. Please check your connection.",
      });
    }
  };

  /* ── bank dropdown change ── */
  const handleBankChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (f: string, v: any) => void,
  ) => {
    const val = e.target.value;
    setFieldValue("BankAccountId", val);
    const bank = banks.find((b) => String(b.BankAccountId) === String(val));
    setSelectedBank(bank ?? null);
  };

  /* ── amount blur → validate + GetUSDTAmount ── */
  const handleAmountBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    setFieldValue: (f: string, v: any) => void,
  ) => {
    const amt = parseFloat(e.target.value);
    if (!amt || amt <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Amount",
        text: "Please enter a valid amount greater than 0.",
      });
      return;
    }
    GetUSDTAmount(amt, setFieldValue);
  };

  /* ── view receipt ── */
  const handleViewReceipt = () => {
    if (!receiptUrl) return;
    if (receiptIsPdf) {
      // PDF → open in new tab
      window.open(receiptUrl, "_blank", "noopener,noreferrer");
    } else {
      // Image → open preview modal
      setShowPreview(true);
    }
  };

  useEffect(() => {
    GetWalletBalance();
    GetPaymentModes();
    GetAllBanks();
  }, []);

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="deposit-fund-page">
      <Breadcrumbs
        mainTitle="Add Fund INR"
        parent={DepositFundTitle}
        ChildName="Add Fund (INR)"
      />

      <Container fluid>
        {(imageUploaderLoading || loading) && <Loader />}

        <Row>
          {/* ════ LEFT: Wallet Summary ════ */}
          <Col xl="4" lg="4">
            <Card className="wallet-summary-card">
              <div className="wallet-summary-header">
                <span className="wallet-summary-label">Wallet Summary</span>
                <span className="wallet-summary-sub">Top-up your wallet</span>
              </div>
              <div className="wallet-summary-visual">
                <img
                  src="assets/images/image.png"
                  alt="Wallet"
                  className="wallet-icon-large"
                />
              </div>

              <div className="wallet-info-section">
                <div className="wallet-name-row">
                  <span className="wallet-name">Top-Up Wallet</span>
                </div>
                <div className="wallet-balance-main">
                  {currency.symbol.length === 1
                    ? `${currency.symbol}${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : `${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ${currency.symbol}`}
                </div>
                <div className="wallet-meta">
                  <div className="wallet-meta-item">
                    <i className="fa fa-arrow-up text-success" />
                    <div>
                      <div className="meta-label">Available Balance</div>
                      <div className="meta-value">
                        {currency.symbol.length === 1
                          ? `${currency.symbol}${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                          : `${walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ${currency.symbol}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="wallet-help-box">
                <i className="fa fa-question-circle" />
                <div>
                  <div className="help-title">Need Help?</div>
                  <div className="help-desc">
                    Scan QR, pay and enter your transaction ID. Balance updates
                    after verification.
                  </div>
                </div>
              </div>

              {/* All-banks modal */}
              <CommonModal
                size="lg"
                isOpen={scrollingModal}
                toggle={() => setScrollingModal(false)}
                title={ScrollingModalHeading}
              >
                {banks.map((bank, i) => (
                  <div className="bank-card" key={i}>
                    <div className="bank-card-header">
                      <span className="bank-holder-name">
                        {bank.AccountName}
                      </span>
                      <span className="bank-name-badge">{bank.BankName}</span>
                    </div>
                    <hr className="bank-divider" />
                    <div className="bank-details-grid">
                      <div className="bank-detail-item">
                        <small className="detail-label">ACCOUNT NUMBER</small>
                        <div className="detail-value">{bank.AccountNo}</div>
                      </div>
                      <div className="bank-detail-item">
                        <small className="detail-label">IFSC CODE</small>
                        <div className="detail-value">{bank.IFSCCode}</div>
                      </div>
                      <div className="bank-detail-item">
                        <small className="detail-label">UPI ID</small>
                        <div className="detail-value">{bank.UPIID}</div>
                      </div>
                      <div className="bank-qr">
                        <img
                          src={
                            import.meta.env.VITE_APP_QR_URL + bank.QrCodeImage
                          }
                          alt="QR"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CommonModal>
            </Card>
          </Col>

          {/* ════ RIGHT: Form ════ */}
          <Col xl="8" lg="8">
            <Card className="deposit-form-card">
              <Formik
                initialValues={initialValues}
                validationSchema={DepositFundSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  handleDeposit(values, resetForm);
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, setFieldValue, values }) => (
                  <Form>
                    {/* ── Step 1: Request Amount ── */}
                    <div className="form-step-section">
                      <div className="step-header">
                        <span className="step-number">1</span>
                        <span className="step-title">Request Amount</span>
                      </div>
                      <Row>
                        <Col md="6">
                          <FormGroup className="deposit-form-group">
                            <Label>Request Amount (INR)</Label>
                            <div className="deposit-input-wrap">
                              <span className="wf-sel-prefix-icon">₹</span>
                              <Field
                                type="number"
                                name="RequestAmount"
                                placeholder="Enter Amount in ₹"
                                className="deposit-input"
                                min="1"
                                onBlur={(
                                  e: React.FocusEvent<HTMLInputElement>,
                                ) => handleAmountBlur(e, setFieldValue)}
                              />
                            </div>
                            <ErrorMessage
                              name="RequestAmount"
                              component="div"
                              className="field-error"
                            />
                          </FormGroup>
                        </Col>

                        {/* USDT — auto-filled */}
                        <Col md="6">
                          <FormGroup className="deposit-form-group">
                            <Label>
                              Equivalent USDT
                              {usdtLoading && (
                                <span className="df-usdt-loader">
                                  <i className="fa fa-circle-o-notch fa-spin" />{" "}
                                  calculating…
                                </span>
                              )}
                            </Label>
                            <div className="deposit-input-wrap">
                              <span className="wf-sel-prefix-icon">
                                <FiDollarSign />
                              </span>
                              <div className="df-usdt-wrap">
                                <Field
                                  type="text"
                                  name="USDTAmount"
                                  placeholder={
                                    usdtLoading
                                      ? "Calculating…"
                                      : "Auto-calculated on blur"
                                  }
                                  className="deposit-input"
                                  disabled
                                />
                                <span className="df-usdt-badge">USDT</span>
                              </div>
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>

                    <div className="step-divider" />

                    {/* ── Step 2: Payment Mode + Bank ── */}
                    <div className="form-step-section">
                      <div className="step-header">
                        <span className="step-number">2</span>
                        <span className="step-title">
                          Payment Mode &amp; Bank
                        </span>
                      </div>
                      <Row>
                        {/* Payment Mode */}
                        <Col md="6">
                          <FormGroup className="deposit-form-group">
                            <Label>Select Payment Mode</Label>
                            <div className="deposit-input-wrap">
                              <span className="wf-sel-prefix-icon">
                                <FiCreditCard />
                              </span>
                              <Field
                                as="select"
                                name="PaymentModeId"
                                className="deposit-select"
                              >
                                <option value="">Select Payment Mode</option>
                                {paymentModes.map((mode) => (
                                  <option
                                    key={mode.PaymentModeId}
                                    value={mode.PaymentModeId}
                                  >
                                    {mode.PaymentMode}
                                  </option>
                                ))}
                              </Field>
                            </div>
                            <ErrorMessage
                              name="PaymentModeId"
                              component="div"
                              className="field-error"
                            />
                          </FormGroup>
                        </Col>

                        {/* Bank */}
                        <Col md="6">
                          <FormGroup className="deposit-form-group">
                            <Label>Bank Where You Deposited</Label>
                            <div className="deposit-input-wrap">
                              <span className="wf-sel-prefix-icon">
                                <FiHome />
                              </span>
                              <Field
                                as="select"
                                name="BankAccountId"
                                className="deposit-select"
                                onChange={(
                                  e: React.ChangeEvent<HTMLSelectElement>,
                                ) => handleBankChange(e, setFieldValue)}
                              >
                                <option value="">Select Bank</option>
                                {banks.map((bank) => (
                                  <option
                                    key={bank.BankAccountId}
                                    value={bank.BankAccountId}
                                  >
                                    {bank.BankName} — {bank.AccountNo}
                                  </option>
                                ))}
                              </Field>
                            </div>
                            <ErrorMessage
                              name="BankAccountId"
                              component="div"
                              className="field-error"
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Bank Detail Panel */}
                      {selectedBank && (
                        <div className="df-bank-panel">
                          {/* Header */}
                          <div className="df-bp-header">
                            <div className="df-bp-header-left">
                              <div className="df-bp-bank-avatar">
                                <i className="fa fa-university" />
                              </div>
                              <div>
                                <div className="df-bp-bank-name">
                                  {selectedBank.BankName}
                                </div>
                                <div className="df-bp-holder">
                                  {selectedBank.AccountName}
                                </div>
                              </div>
                            </div>
                            <span className="df-bp-verified">
                              <i className="fa fa-check-circle" /> Verified
                            </span>
                          </div>

                          <div className="df-bp-body">
                            <div className="df-bp-rows">
                              {/* Account Number */}
                              <div className="df-bp-row">
                                <div className="df-bp-row-left">
                                  <div className="df-bp-icon df-bp-icon--blue">
                                    <i className="fa fa-credit-card" />
                                  </div>
                                  <div className="df-bp-text">
                                    <span className="df-bp-key">
                                      Account Number
                                    </span>
                                    <span className="df-bp-val">
                                      {selectedBank.AccountNo}
                                    </span>
                                  </div>
                                </div>
                                <CopyBtn
                                  text={selectedBank.AccountNo}
                                  label="Account Number"
                                />
                              </div>

                              {/* IFSC Code */}
                              <div className="df-bp-row">
                                <div className="df-bp-row-left">
                                  <div className="df-bp-icon df-bp-icon--purple">
                                    <i className="fa fa-barcode" />
                                  </div>
                                  <div className="df-bp-text">
                                    <span className="df-bp-key">IFSC Code</span>
                                    <span className="df-bp-val">
                                      {selectedBank.IFSCCode}
                                    </span>
                                  </div>
                                </div>
                                <CopyBtn
                                  text={selectedBank.IFSCCode}
                                  label="IFSC Code"
                                />
                              </div>

                              {/* Branch */}
                              {selectedBank.Branch && (
                                <div className="df-bp-row">
                                  <div className="df-bp-row-left">
                                    <div className="df-bp-icon df-bp-icon--teal">
                                      <i className="fa fa-map-marker" />
                                    </div>
                                    <div className="df-bp-text">
                                      <span className="df-bp-key">Branch</span>
                                      <span className="df-bp-val">
                                        {selectedBank.Branch}
                                      </span>
                                    </div>
                                  </div>
                                  <CopyBtn
                                    text={selectedBank.Branch}
                                    label="Branch"
                                  />
                                </div>
                              )}

                              {/* UPI ID */}
                              {selectedBank.UPIID && (
                                <div className="df-bp-row df-bp-row--upi">
                                  <div className="df-bp-row-left">
                                    <div className="df-bp-icon df-bp-icon--green">
                                      <i className="fa fa-mobile" />
                                    </div>
                                    <div className="df-bp-text">
                                      <span className="df-bp-key">UPI ID</span>
                                      <span className="df-bp-val df-bp-upi-id">
                                        {selectedBank.UPIID}
                                      </span>
                                    </div>
                                  </div>
                                  <CopyBtn
                                    text={selectedBank.UPIID}
                                    label="UPI ID"
                                  />
                                </div>
                              )}

                              <div className="df-bp-tip">
                                <i className="fa fa-info-circle" />
                                <span>
                                  Pay exactly to these details then upload your
                                  receipt in Step 3.
                                </span>
                              </div>
                            </div>

                            {/* QR Code */}
                            {selectedBank.QrCodeImage && (
                              <div className="df-bp-qr">
                                <div className="df-bp-qr-label">
                                  Scan &amp; Pay
                                </div>
                                <div className="df-bp-qr-frame">
                                  <img
                                    src={
                                      import.meta.env.VITE_IMAGE_PREVIEW_URL +
                                      "CompanyDocs/" +
                                      selectedBank.QrCodeImage
                                    }
                                    alt="Payment QR"
                                  />
                                </div>
                                <div className="df-bp-qr-hint">Any UPI app</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="step-divider" />

                    {/* ── Step 3: Transaction Details ── */}
                    <div className="form-step-section">
                      <div className="step-header">
                        <span className="step-number">3</span>
                        <span className="step-title">Transaction Details</span>
                      </div>
                      <Row>
                        <Col md="6">
                          <FormGroup className="deposit-form-group">
                            <Label>Transaction Receipt</Label>
                            <div className="modern-file-input">
                              <span className="wf-sel-prefix-icon">
                                <FiFileText />
                              </span>

                              {/* File Name display */}
                              <input
                                type="text"
                                readOnly
                                value={
                                  selectedFile !== "NA"
                                    ? selectedFile
                                    : "Choose file..."
                                }
                                className="file-name-input"
                              />

                              {/* Thumbnail — only for images */}
                              {selectedFile !== "NA" && !receiptIsPdf && (
                                <img
                                  src={receiptUrl!}
                                  alt="preview"
                                  className="file-thumb"
                                />
                              )}

                              {/* PDF icon indicator */}
                              {selectedFile !== "NA" && receiptIsPdf && (
                                <div className="df-pdf-indicator">
                                  <i className="fa fa-file-pdf-o" />
                                  <span>PDF</span>
                                </div>
                              )}

                              {/* Upload Button */}
                              <div className="upload-btn">
                                Upload
                                <input
                                  type="file"
                                  name="UploadReceipt"
                                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => uploadReceiptImage(e, setFieldValue)}
                                />
                              </div>
                            </div>
                            <ErrorMessage
                              name="UploadReceipt"
                              component="div"
                              className="field-error"
                            />

                            {/* View Receipt button */}
                            {selectedFile !== "NA" && (
                              <div className="file-actions">
                                <button
                                  type="button"
                                  className="view-btn"
                                  onClick={handleViewReceipt}
                                >
                                  {receiptIsPdf ? (
                                    <>
                                      <FiExternalLink size={13} />
                                      View PDF Receipt
                                    </>
                                  ) : (
                                    <>
                                      <FiEye size={13} />
                                      View Receipt
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Image Preview Modal — only for non-PDF */}
                            {showPreview && !receiptIsPdf && receiptUrl && (
                              <div
                                className="preview-modal"
                                onClick={(e) => {
                                  if (e.target === e.currentTarget)
                                    setShowPreview(false);
                                }}
                              >
                                <div className="preview-content">
                                  <button
                                    type="button"
                                    className="preview-close-btn"
                                    onClick={() => setShowPreview(false)}
                                  >
                                    ✕
                                  </button>
                                  <img src={receiptUrl} alt="Receipt Preview" />
                                </div>
                              </div>
                            )}
                          </FormGroup>
                        </Col>

                        <Col md="6">
                          <FormGroup className="deposit-form-group">
                            <Label>UTR / Transaction Number</Label>
                            <div className="deposit-input-wrap">
                              <span className="wf-sel-prefix-icon">
                                <FiHash />
                              </span>
                              <Field
                                type="text"
                                name="UTRNo"
                                placeholder="Enter UTR / Transaction No."
                                className="deposit-input"
                              />
                            </div>
                            <ErrorMessage
                              name="UTRNo"
                              component="div"
                              className="field-error"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="12">
                          <FormGroup className="deposit-form-group">
                            <Label>Remarks (Optional)</Label>
                            <div className="deposit-input-wrap">
                              <span className="wf-sel-prefix-icon">
                                <FiMessageSquare />
                              </span>
                              <Field
                                type="text"
                                name="Description"
                                className="deposit-input"
                                placeholder="Any additional details..."
                              />
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>

                      <div className="info-notice">
                        <i className="fa fa-info-circle" />
                        <span>
                          Please ensure you select the correct bank where you
                          made the deposit. Selecting the wrong bank may delay
                          processing.
                        </span>
                      </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting || usdtLoading}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa fa-circle-o-notch fa-spin" />{" "}
                            Submitting…
                          </>
                        ) : (
                          <>
                            <i className="fa fa-paper-plane" /> Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card>

            <div className="secure-footer">
              <FiLock />
              <div>
                <strong>Secure &amp; Safe</strong>
                <span>
                  Your request is encrypted and secure. We never share your
                  financial information.
                </span>
              </div>
              <i className="fa fa-check-circle text-success" />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default USDTTRC20PageContainer;
