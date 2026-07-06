import { useState, useEffect, useMemo, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { MdCheckCircle, MdRefresh, MdSearch, MdClose } from "react-icons/md";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { decryptData } from "../../../utils/helper/Crypto";
import {
  getServices,
  fetchBill,
  payBill,
  isSuccess,
  ServiceType,
  BillService,
} from "../../../Service/Recharge/BillPayService";
import "./BillPayment.scss";

// ── Meta ────────────────────────────────────────────────────────────────────────

const SERVICE_META: Record<string, { label: string; gradient: string }> = {
  ELECTRICITY: { label: "Electricity Bill",  gradient: "linear-gradient(145deg,#f59e0b,#f97316)" },
  GAS:         { label: "Gas Bill",          gradient: "linear-gradient(145deg,#ef4444,#dc2626)" },
  FASTAG:      { label: "FASTag Recharge",   gradient: "linear-gradient(145deg,#0ea5e9,#0284c7)" },
  INSURANCE:   { label: "Insurance Premium", gradient: "linear-gradient(145deg,#ec4899,#be185d)" },
  MOBILE:      { label: "Mobile Postpaid",   gradient: "linear-gradient(145deg,#3b82f6,#6366f1)" },
  DTH:         { label: "DTH / Cable TV",    gradient: "linear-gradient(145deg,#8b5cf6,#6d28d9)" },
  BROADBAND:   { label: "Broadband Bill",    gradient: "linear-gradient(145deg,#22c55e,#16a34a)" },
  WATER:       { label: "Water Bill",        gradient: "linear-gradient(145deg,#06b6d4,#0891b2)" },
};

const STEP_LABELS = ["Select Provider", "Enter Details", "Confirm & Pay"];

// ── Helpers ─────────────────────────────────────────────────────────────────────

const extractAmount = (data: any): string => {
  if (!data || typeof data !== "object") return "";
  for (const k of ["amount", "bill_amount", "Amount", "AMOUNT", "billAmount",
                    "totalAmount", "total_amount", "payable_amount", "net_amount"]) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== "")
      return String(data[k]);
  }
  return "";
};

const SKIP_KEYS = new Set(["status", "code", "Resp_code", "Resp_desc", "requestid"]);

const formatKey = (k: string) =>
  k.replace(/_/g, " ")
   .replace(/([A-Z])/g, " $1")
   .trim()
   .split(" ")
   .filter(Boolean)
   .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
   .join(" ");

// ── Component ───────────────────────────────────────────────────────────────────

const BillPayment = () => {
  const { serviceType: rawType } = useParams<{ serviceType: string }>();
  const serviceType = (rawType?.toUpperCase() ?? "ELECTRICITY") as ServiceType;
  const navigate    = useNavigate();
  const ClientId    = decryptData(localStorage.getItem("clientId") as string);
  const base        = import.meta.env.BASE_URL;

  const meta = SERVICE_META[serviceType] ?? {
    label: serviceType,
    gradient: "linear-gradient(145deg,#64748b,#475569)",
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]         = useState<1 | 2 | 3>(1);

  // Step 1
  const [operators,    setOperators]    = useState<BillService[]>([]);
  const [opsLoading,   setOpsLoading]   = useState(true);
  const [opsError,     setOpsError]     = useState("");
  const [selectedOp,   setSelectedOp]   = useState<BillService | null>(null);
  const [opSearch,     setOpSearch]     = useState("");
  const [opPage,       setOpPage]       = useState(1);
  const OPS_PER_PAGE = 9;

  // Step 2
  const [mobile,       setMobile]       = useState("");
  const [formValues,   setFormValues]   = useState<Record<string, string>>({});
  const [formErrors,   setFormErrors]   = useState<Record<string, string>>({});
  const [billLoading,  setBillLoading]  = useState(false);
  const [billData,     setBillData]     = useState<any>(null);

  // Step 3
  const [pin,          setPin]          = useState("");
  const [payLoading,   setPayLoading]   = useState(false);
  const [txnResult,    setTxnResult]    = useState<any>(null);
  const [apiError,     setApiError]     = useState("");

  // ── Load operators ──────────────────────────────────────────────────────────
  const loadOperators = () => {
    setOpsLoading(true);
    setOpsError("");
    getServices(serviceType)
      .then((res) => {
        if (isSuccess(res) && Array.isArray(res.data) && res.data.length > 0) {
          setOperators(res.data.filter((s) => s.status === "ACTIVE"));
        } else {
          setOpsError(res.Resp_desc || "No providers found for this service.");
        }
      })
      .catch(() => setOpsError("Failed to load providers. Please try again."))
      .finally(() => setOpsLoading(false));
  };

  useEffect(() => { loadOperators(); }, [serviceType]);

  // ── Provider search + pagination ────────────────────────────────────────────
  const filteredOps = useMemo(() => {
    const q = opSearch.trim().toLowerCase();
    return q
      ? operators.filter((o) => o.service_name.toLowerCase().includes(q))
      : operators;
  }, [operators, opSearch]);

  const totalPages  = Math.max(1, Math.ceil(filteredOps.length / OPS_PER_PAGE));
  const currentPage = Math.min(opPage, totalPages);
  const pagedOps    = filteredOps.slice(
    (currentPage - 1) * OPS_PER_PAGE,
    currentPage * OPS_PER_PAGE
  );

  const handleOpSearch = (val: string) => {
    setOpSearch(val);
    setOpPage(1);
  };

  // ── Ordered params from selected operator ───────────────────────────────────
  const orderedParams = useMemo(
    () =>
      selectedOp
        ? Object.values(selectedOp.params).sort(
            (a, b) => Number(a.param_order) - Number(b.param_order)
          )
        : [],
    [selectedOp]
  );

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile))
      errs.mobile = "Enter a valid 10-digit mobile number.";

    orderedParams.forEach((p) => {
      const val = (formValues[p.param_code] ?? "").trim();
      if (!val) {
        errs[p.param_code] = `${p.param_name} is required.`;
      } else if (p.full_regex) {
        try {
          if (!new RegExp(p.full_regex).test(val))
            errs[p.param_code] = `Invalid ${p.param_name} format.`;
        } catch { /* ignore malformed regex */ }
      }
    });

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Fetch Bill ──────────────────────────────────────────────────────────────
  const handleFetchBill = async () => {
    if (!validateStep2()) return;
    setBillLoading(true);
    setApiError("");

    const [firstParam, ...rest] = orderedParams;
    const accountNo     = formValues[firstParam.param_code] ?? "";
    const policyParams  = rest.length
      ? Object.fromEntries(rest.map((p) => [p.param_code, formValues[p.param_code] ?? ""]))
      : null;

    try {
      const res = await fetchBill({
        serviceType,
        operatorCode: selectedOp!.service_code,
        accountNo,
        mobileNo: mobile,
        clientId: ClientId,
        policyParams,
      });

      if (isSuccess(res)) {
        setBillData(res.data);
        setStep(3);
      } else {
        setApiError(res.Resp_desc || "Failed to fetch bill details.");
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setBillLoading(false);
    }
  };

  // ── Pay ─────────────────────────────────────────────────────────────────────
  const handlePay = async () => {
    const amount = extractAmount(billData);
    if (!pin || pin.length < 4) { setApiError("Enter your wallet PIN."); return; }
    if (!amount)                 { setApiError("Bill amount not available. Please go back and retry."); return; }

    setPayLoading(true);
    setApiError("");

    const [firstParam] = orderedParams;
    const accountNo = formValues[firstParam.param_code] ?? "";

    try {
      const res = await payBill({
        clientId:      ClientId,
        mobileNo: mobile,
        pin,
        amount,
        billerName:    selectedOp!.service_name,
        serviceTypeId: serviceType,
        serviceId:     selectedOp!.service_code,
      });

      const ok = res?.StatusCode === "1" || isSuccess(res);
      if (ok) {
        setTxnResult(res);
      } else {
        setApiError(res?.Msg || res.Resp_desc || "Payment failed. Please try again.");
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setPayLoading(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetAll = () => {
    setStep(1); setSelectedOp(null);
    setFormValues({}); setMobile(""); setBillData(null);
    setPin(""); setTxnResult(null); setApiError(""); setFormErrors({});
  };

  const billAmount  = extractAmount(billData);
  const billDetails = billData
    ? Object.entries(billData).filter(
        ([k, v]) =>
          !SKIP_KEYS.has(k) &&
          v !== null && v !== "" && v !== undefined &&
          typeof v !== "object"
      )
    : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Breadcrumbs
        mainTitle={meta.label}
        parent="Recharge & Bills"
        ChildName={meta.label}
      />

      <Container fluid className="bp-page">

        {/* ── Step indicator ── */}
        <div className="bp-steps">
          {STEP_LABELS.map((label, i) => (
            <Fragment key={label}>
              <div
                className={`bp-step ${
                  step === i + 1 ? "bp-step--active" : step > i + 1 ? "bp-step--done" : ""
                }`}
              >
                <div className="bp-step-circle">
                  {step > i + 1 ? <FaCheck size={9} /> : i + 1}
                </div>
                <span className="bp-step-label">{label}</span>
              </div>
              {i < 2 && (
                <div className={`bp-step-line${step > i + 1 ? " bp-step-line--done" : ""}`} />
              )}
            </Fragment>
          ))}
        </div>

        {/* ── Error banner ── */}
        {apiError && (
          <div className="bp-error-banner">
            <span>⚠ {apiError}</span>
            <button type="button" onClick={() => setApiError("")}>✕</button>
          </div>
        )}

        {/* ════════ STEP 1 — Select Provider ════════ */}
        {step === 1 && (
          <div className="bp-card">
            <div className="bp-card-header">
              <h6 className="bp-card-title">Choose Provider</h6>
              <button
                type="button"
                className="bp-primary-btn bp-primary-btn--sm"
                disabled={!selectedOp}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>

            {opsLoading && (
              <div className="bp-ops-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bp-op-skeleton" />
                ))}
              </div>
            )}

            {!opsLoading && opsError && (
              <div className="bp-empty-state">
                <p>{opsError}</p>
                <button type="button" className="bp-retry-btn" onClick={loadOperators}>
                  <MdRefresh size={14} /> Try Again
                </button>
              </div>
            )}

            {!opsLoading && !opsError && (
              <>
                {/* Search bar */}
                <div className="bp-search-wrap">
                  <MdSearch className="bp-search-icon" size={17} />
                  <input
                    className="bp-search-input"
                    type="text"
                    placeholder="Search provider..."
                    value={opSearch}
                    onChange={(e) => handleOpSearch(e.target.value)}
                  />
                  {opSearch && (
                    <button
                      type="button"
                      className="bp-search-clear"
                      onClick={() => handleOpSearch("")}
                    >
                      <MdClose size={14} />
                    </button>
                  )}
                </div>

                {/* Result count */}
                <p className="bp-ops-count">
                  {opSearch
                    ? `${filteredOps.length} result${filteredOps.length !== 1 ? "s" : ""} for "${opSearch}"`
                    : `${filteredOps.length} provider${filteredOps.length !== 1 ? "s" : ""} available`}
                </p>

                {/* Provider grid */}
                {pagedOps.length > 0 ? (
                  <div className="bp-ops-grid">
                    {pagedOps.map((op) => (
                      <button
                        key={op.service_code}
                        type="button"
                        className={`bp-op-card ${selectedOp?.service_code === op.service_code ? "active" : ""}`}
                        onClick={() => setSelectedOp(op)}
                      >
                        {selectedOp?.service_code === op.service_code && (
                          <span className="bp-op-check"><FaCheck size={8} /></span>
                        )}
                        <div className="bp-op-icon" style={{ background: meta.gradient }}>
                          {op.service_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="bp-op-name">{op.service_name}</span>
                        <span className="bp-op-code">{op.service_code}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="bp-no-result">No providers match your search.</p>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bp-pagination">
                    <button
                      type="button"
                      className="bp-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => setOpPage(currentPage - 1)}
                    >
                      <FaChevronLeft size={11} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                      )
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "…" ? (
                          <span key={`ellipsis-${i}`} className="bp-page-ellipsis">…</span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            className={`bp-page-btn${currentPage === p ? " active" : ""}`}
                            onClick={() => setOpPage(p as number)}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      className="bp-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => setOpPage(currentPage + 1)}
                    >
                      <FaChevronRight size={11} />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ════════ STEP 2 — Consumer Details ════════ */}
        {step === 2 && selectedOp && (
          <div className="bp-card">

            {/* Header with Proceed button */}
            <div className="bp-card-header">
              <div className="bp-selected-op" style={{ border: "none", padding: 0, background: "none", flex: 1 }}>
                <div className="bp-op-icon bp-op-icon--sm" style={{ background: meta.gradient }}>
                  {selectedOp.service_name.charAt(0).toUpperCase()}
                </div>
                <div className="bp-selected-op-info">
                  <span className="bp-selected-op-name">{selectedOp.service_name}</span>
                  <button
                    type="button"
                    className="bp-change-btn"
                    onClick={() => { setStep(1); setBillData(null); setFormErrors({}); setApiError(""); }}
                  >
                    Change
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={`bp-primary-btn bp-primary-btn--sm${billLoading ? " loading" : ""}`}
                disabled={billLoading}
                onClick={handleFetchBill}
              >
                {billLoading ? <span className="bp-spinner" /> : "Proceed"}
              </button>
            </div>

            <h6 className="bp-card-title" style={{ marginTop: 22 }}>Enter Details</h6>

            {/* Dynamic fields from API params */}
            {orderedParams.map((p) => (
              <div key={p.param_code} className="bp-field">
                <label className="bp-label">{p.param_name}</label>
                <input
                  type={p.param_type === "tel" ? "tel" : "text"}
                  className={`bp-input${formErrors[p.param_code] ? " has-error" : ""}`}
                  placeholder={`Enter ${p.param_name}`}
                  value={formValues[p.param_code] ?? ""}
                  onChange={(e) => {
                    setFormValues((prev) => ({ ...prev, [p.param_code]: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, [p.param_code]: "" }));
                  }}
                />
                {formErrors[p.param_code] && (
                  <p className="bp-field-err">{formErrors[p.param_code]}</p>
                )}
              </div>
            ))}

            {/* Mobile number (always required) */}
            <div className="bp-field">
              <label className="bp-label">Mobile Number</label>
              <input
                type="tel"
                className={`bp-input${formErrors.mobile ? " has-error" : ""}`}
                placeholder="10-digit mobile number"
                value={mobile}
                maxLength={10}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setFormErrors((prev) => ({ ...prev, mobile: "" }));
                }}
              />
              {formErrors.mobile && <p className="bp-field-err">{formErrors.mobile}</p>}
            </div>

            <button
              type="button"
              className={`bp-primary-btn${billLoading ? " loading" : ""}`}
              disabled={billLoading}
              onClick={handleFetchBill}
            >
              {billLoading ? <span className="bp-spinner" /> : "Fetch Bill"}
            </button>
          </div>
        )}

        {/* ════════ STEP 3 — Confirm & Pay ════════ */}
        {step === 3 && billData && !txnResult && (
          <div className="bp-card">

            {/* Header with Pay button */}
            <div className="bp-card-header">
              <h6 className="bp-card-title" style={{ margin: 0 }}>Bill Summary</h6>
              <div className="bp-action-row" style={{ margin: 0 }}>
                <button
                  type="button"
                  className="bp-back-btn"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                  onClick={() => { setStep(2); setBillData(null); setPin(""); setApiError(""); }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={`bp-primary-btn bp-primary-btn--sm${payLoading ? " loading" : ""}`}
                  disabled={payLoading || !pin || !billAmount}
                  onClick={handlePay}
                >
                  {payLoading ? <span className="bp-spinner" /> : `Pay ₹${billAmount}`}
                </button>
              </div>
            </div>

            {/* Amount highlight */}
            <div className="bp-amount-box" style={{ marginTop: 20 }}>
              <span className="bp-amount-label">Amount Due</span>
              <span className="bp-amount-value">₹{billAmount || "—"}</span>
            </div>

            {/* Bill key-value details */}
            {billDetails.length > 0 && (
              <div className="bp-details-table">
                {billDetails.map(([k, v]) => (
                  <div key={k} className="bp-details-row">
                    <span>{formatKey(k)}</span>
                    <strong>{String(v)}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* PIN */}
            <div className="bp-field" style={{ marginTop: 20 }}>
              <label className="bp-label">Wallet PIN</label>
              <input
                type="password"
                inputMode="numeric"
                className="bp-input bp-pin-input"
                placeholder="• • • • • •"
                value={pin}
                maxLength={6}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setApiError("");
                }}
              />
            </div>

            <div className="bp-action-row">
              <button
                type="button"
                className="bp-back-btn"
                onClick={() => { setStep(2); setBillData(null); setPin(""); setApiError(""); }}
              >
                Back
              </button>
              <button
                type="button"
                className={`bp-primary-btn bp-primary-btn--grow${payLoading ? " loading" : ""}`}
                disabled={payLoading || !pin || !billAmount}
                onClick={handlePay}
              >
                {payLoading ? <span className="bp-spinner" /> : `Pay ₹${billAmount}`}
              </button>
            </div>
          </div>
        )}

      </Container>

      {/* ════════ SUCCESS OVERLAY ════════ */}
      {txnResult && (
        <div className="bp-success-overlay">
          <div className="bp-success-box">
            <div className="bp-success-icon-wrap">
              <div className="bp-success-ring" />
              <MdCheckCircle size={56} color="#22c55e" />
            </div>

            <h4 className="bp-success-title">Payment Successful!</h4>
            <p className="bp-success-sub">
              Your {meta.label} has been paid successfully.
            </p>

            <div className="bp-details-table">
              <div className="bp-details-row">
                <span>Provider</span>
                <strong>{selectedOp?.service_name}</strong>
              </div>
              <div className="bp-details-row">
                <span>Amount Paid</span>
                <strong style={{ color: "#16a34a" }}>₹{billAmount}</strong>
              </div>
              {(txnResult?.TransactionNumber || txnResult?.txnid) && (
                <div className="bp-details-row">
                  <span>Transaction ID</span>
                  <strong className="bp-mono">
                    {txnResult.TransactionNumber ?? txnResult.txnid}
                  </strong>
                </div>
              )}
              {txnResult?.PayId && (
                <div className="bp-details-row">
                  <span>Pay ID</span>
                  <strong>{txnResult.PayId}</strong>
                </div>
              )}
            </div>

            <div className="bp-success-actions">
              <button type="button" className="bp-btn-outline" onClick={resetAll}>
                New Payment
              </button>
              <button
                type="button"
                className="bp-btn-green"
                onClick={() => navigate(`${base}/dashboard`)}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BillPayment;
