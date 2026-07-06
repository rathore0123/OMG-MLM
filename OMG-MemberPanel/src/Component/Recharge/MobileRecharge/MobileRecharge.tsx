import React, { useState, useRef } from "react";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { decryptData } from "../../../utils/helper/Crypto";
import { payBill, isSuccess } from "../../../Service/Recharge/BillPayService";
import {
  MdPhoneAndroid,
  MdCheckCircle,
  MdSignalCellularAlt,
  MdWifi,
  MdLocalPhone,
  MdSms,
  MdFlashOn,
  MdLock,
} from "react-icons/md";
import { FaCheck, FaStar } from "react-icons/fa";
import "./MobileRecharge.scss";

// ── Data ──────────────────────────────────────────────────────────────────────

const OPERATORS = [
  { id: "jio",    name: "Jio",   color: "#0070c0", light: "#e8f4ff", letter: "J" },
  { id: "airtel", name: "Airtel",color: "#e40000", light: "#ffe8e8", letter: "A" },
  { id: "vi",     name: "Vi",    color: "#5c0fa8", light: "#f0e8ff", letter: "V" },
  { id: "bsnl",   name: "BSNL",  color: "#1a7a3c", light: "#e8f7ee", letter: "B" },
  { id: "mtnl",   name: "MTNL",  color: "#1a3a7a", light: "#e8eeff", letter: "M" },
];

const CIRCLES = [
  "Andhra Pradesh","Assam","Bihar & Jharkhand","Chennai",
  "Delhi & NCR","Gujarat","Haryana","Himachal Pradesh",
  "Jammu & Kashmir","Karnataka","Kerala","Kolkata",
  "Madhya Pradesh","Maharashtra & Goa","Mumbai","North East",
  "Odisha","Punjab","Rajasthan","Tamil Nadu",
  "Uttar Pradesh East","Uttar Pradesh West","West Bengal",
];

type PlanTab = "popular" | "data" | "unlimited" | "sms";

interface Plan {
  id: string;
  price: number;
  data: string;
  validity: string;
  description: string;
  tag?: string;
}

const PLANS: Record<PlanTab, Plan[]> = {
  popular: [
    { id: "p1", price: 179,  data: "2 GB/day",   validity: "28 days",  description: "Unlimited calls + 100 SMS/day",                          tag: "POPULAR"    },
    { id: "p2", price: 299,  data: "2 GB/day",   validity: "28 days",  description: "Unlimited calls + 100 SMS/day + Disney+ Hotstar",         tag: "BEST VALUE" },
    { id: "p3", price: 479,  data: "2 GB/day",   validity: "56 days",  description: "Unlimited calls + 100 SMS/day"                                              },
    { id: "p4", price: 599,  data: "2 GB/day",   validity: "84 days",  description: "Unlimited calls + 100 SMS/day + Disney+ Hotstar"                            },
    { id: "p5", price: 666,  data: "1.5 GB/day", validity: "84 days",  description: "Unlimited calls + 100 SMS/day",                          tag: "NEW"        },
    { id: "p6", price: 999,  data: "3 GB/day",   validity: "84 days",  description: "Unlimited calls + 100 SMS/day + Disney+ Hotstar"                            },
  ],
  data: [
    { id: "d1", price: 19,   data: "1 GB",       validity: "1 day",    description: "Data add-on only"                                                           },
    { id: "d2", price: 51,   data: "6 GB",       validity: "30 days",  description: "Data add-on only"                                                           },
    { id: "d3", price: 61,   data: "12 GB",      validity: "30 days",  description: "Data add-on only",                                       tag: "BEST"       },
    { id: "d4", price: 91,   data: "20 GB",      validity: "30 days",  description: "Data add-on only"                                                           },
    { id: "d5", price: 151,  data: "50 GB",      validity: "30 days",  description: "Data add-on only"                                                           },
  ],
  unlimited: [
    { id: "u1", price: 155,  data: "2 GB/day",   validity: "24 days",  description: "Unlimited calls + 100 SMS/day"                                              },
    { id: "u2", price: 209,  data: "1.5 GB/day", validity: "28 days",  description: "Unlimited calls + 100 SMS/day"                                              },
    { id: "u3", price: 395,  data: "2 GB/day",   validity: "56 days",  description: "Unlimited calls + 100 SMS/day"                                              },
    { id: "u4", price: 719,  data: "2.5 GB/day", validity: "84 days",  description: "Unlimited calls + 100 SMS/day",                         tag: "POPULAR"    },
  ],
  sms: [
    { id: "s1", price: 17,   data: "No data",    validity: "28 days",  description: "500 SMS/day"                                                                },
    { id: "s2", price: 47,   data: "No data",    validity: "90 days",  description: "100 SMS/day"                                                                },
    { id: "s3", price: 99,   data: "No data",    validity: "365 days", description: "50 SMS/day",                                             tag: "YEARLY"     },
  ],
};

const TABS: { key: PlanTab; label: string; icon: React.ReactNode }[] = [
  { key: "popular",   label: "Popular",   icon: <FaStar size={11}/>           },
  { key: "data",      label: "Data",      icon: <MdWifi size={13}/>           },
  { key: "unlimited", label: "Unlimited", icon: <MdSignalCellularAlt size={13}/> },
  { key: "sms",       label: "SMS",       icon: <MdSms size={13}/>            },
];

const OP_MAP: Record<string, { serviceId: string; billerName: string }> = {
  jio:    { serviceId: "JIO", billerName: "Jio Prepaid" },
  airtel: { serviceId: "AIR", billerName: "Airtel Prepaid" },
  vi:     { serviceId: "VI",  billerName: "Vi Prepaid" },
  bsnl:   { serviceId: "BSL", billerName: "BSNL Prepaid" },
  mtnl:   { serviceId: "MTL", billerName: "MTNL Prepaid" },
};

// ── Component ─────────────────────────────────────────────────────────────────

const MobileRecharge: React.FC = () => {
  const navigate  = useNavigate();
  const ClientId  = decryptData(localStorage.getItem("clientId") as string);

  const [mobile,        setMobile]        = useState("");
  const [operator,      setOperator]      = useState("");
  const [circle,        setCircle]        = useState("");
  const [tab,           setTab]           = useState<PlanTab>("popular");
  const [selected,      setSelected]      = useState<Plan | null>(null);
  const [pin,           setPin]           = useState("");
  const [success,       setSuccess]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [txnId,    setTxnId]    = useState("");
  const [txnError, setTxnError] = useState("");

  const plansRef = useRef<HTMLDivElement>(null);

  // auto-detect operator from number prefix (dummy)
  const handleMobileChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setMobile(digits);
    if (digits.length >= 1) {
      const prefix = digits[0];
      if (["6","7"].includes(prefix)) setOperator("vi");
      else if (["8"].includes(prefix)) setOperator("airtel");
      else if (["9"].includes(prefix)) setOperator("jio");
    }
    setErrors((e) => ({ ...e, mobile: "" }));
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelected(plan);
    setErrors((e) => ({ ...e, plan: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mobile.length !== 10) e.mobile   = "Enter a valid 10-digit mobile number.";
    if (!operator)             e.operator = "Please select an operator.";
    if (!circle)               e.circle   = "Please select your circle.";
    if (!selected)             e.plan     = "Please select a recharge plan.";
    if (pin.length < 4)        e.pin      = "Enter your wallet PIN.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setTxnError("");

    const op = OP_MAP[operator];

    try {
      const res = await payBill({
        clientId:        ClientId,
        mobileNo: mobile,
        pin,
        amount:          String(selected!.price),
        billerName:      op.billerName,
        serviceTypeId:   "MOBILE",
        serviceId:       op.serviceId,
      });

      const ok = res?.StatusCode === "1" || isSuccess(res);
      if (ok) {
        setTxnId(res?.TransactionNumber ?? res.data?.txnid ?? "");
        setSuccess(true);
      } else {
        setTxnError(res?.Msg || res.Resp_desc || "Recharge failed. Please try again.");
      }
    } catch {
      setTxnError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    navigate(`${import.meta.env.BASE_URL}/dashboard`);
  };

  const opObj = OPERATORS.find((o) => o.id === operator);

  return (
    <>
      <Breadcrumbs mainTitle="Mobile Recharge" parent="Recharge & Bills" ChildName="Mobile" />

      <Container fluid className="mr-page">

        {/* ═══ RECHARGE BAR — top of page ═══════════════════════════ */}
        <div className="mr-footer">
          <div className="mr-footer-info">
            {selected ? (
              <>
                <span className="mr-footer-amount">₹{selected.price}</span>
                <span className="mr-footer-detail">
                  {selected.data}&nbsp;·&nbsp;{selected.validity}
                </span>
              </>
            ) : (
              <span className="mr-footer-hint">Select a plan below to recharge</span>
            )}
          </div>
          <button
            type="button"
            className={`mr-pay-btn ${loading ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <span className="mr-spinner" /> : <>Recharge Now</>}
          </button>
        </div>

        {/* ═══ API ERROR ═══════════════════════════════════════════ */}
        {txnError && (
          <div className="mr-txn-error">
            <span>⚠ {txnError}</span>
            <button type="button" onClick={() => setTxnError("")}>✕</button>
          </div>
        )}

        {/* ═══ FORM CARD ═══════════════════════════════════════════ */}
        <div className="mr-card">

          {/* ── 1. Mobile Number ── */}
          <div className="mr-section">
            <label className="mr-label">
              <MdPhoneAndroid size={15} /> Mobile Number
            </label>
            <div className={`mr-input-wrap ${errors.mobile ? "has-error" : ""}`}>
              {opObj && (
                <span
                  className="mr-input-prefix"
                  style={{ background: opObj.color }}
                >
                  {opObj.letter}
                </span>
              )}
              <input
                type="tel"
                className="mr-input"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                maxLength={10}
              />
              {mobile.length === 10 && (
                <span className="mr-input-ok">
                  <MdCheckCircle size={18} color="#22c55e" />
                </span>
              )}
            </div>
            {errors.mobile && <p className="mr-error">{errors.mobile}</p>}
          </div>

          {/* ── 2. Operator ── */}
          <div className="mr-section">
            <label className="mr-label">
              <MdSignalCellularAlt size={15} /> Select Operator
            </label>
            <div className="mr-operator-row">
              {OPERATORS.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  className={`mr-op-btn ${operator === op.id ? "active" : ""}`}
                  style={operator === op.id
                    ? { borderColor: op.color, background: op.light, color: op.color }
                    : {}
                  }
                  onClick={() => { setOperator(op.id); setErrors((e) => ({ ...e, operator: "" })); }}
                >
                  <span
                    className="mr-op-letter"
                    style={{ background: op.color }}
                  >
                    {op.letter}
                  </span>
                  {op.name}
                  {operator === op.id && <FaCheck size={9} className="mr-op-check" />}
                </button>
              ))}
            </div>
            {errors.operator && <p className="mr-error">{errors.operator}</p>}
          </div>

          {/* ── 3. Circle ── */}
          <div className="mr-section">
            <label className="mr-label">
              <MdLocalPhone size={15} /> Select Circle / State
            </label>
            <select
              className={`mr-select ${errors.circle ? "has-error" : ""}`}
              value={circle}
              onChange={(e) => { setCircle(e.target.value); setErrors((c) => ({ ...c, circle: "" })); }}
            >
              <option value="">-- Choose your circle --</option>
              {CIRCLES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.circle && <p className="mr-error">{errors.circle}</p>}
          </div>

          {/* ── 4. Wallet PIN ── */}
          <div className="mr-section">
            <label className="mr-label">
              <MdLock size={15} /> Wallet PIN
            </label>
            <div className={`mr-input-wrap ${errors.pin ? "has-error" : ""}`}>
              <input
                type="password"
                inputMode="numeric"
                className="mr-input mr-pin-input"
                placeholder="Enter wallet PIN"
                value={pin}
                maxLength={6}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setErrors((ev) => ({ ...ev, pin: "" }));
                }}
              />
            </div>
            {errors.pin && <p className="mr-error">{errors.pin}</p>}
          </div>
        </div>

        {/* ═══ PLAN SECTION ════════════════════════════════════════ */}
        <div className="mr-card mr-plans-card" ref={plansRef}>
          <div className="mr-plans-header">
            <h6 className="mr-plans-title">Choose a Plan</h6>
            {selected && (
              <span className="mr-selected-pill">
                ₹{selected.price} selected
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="mr-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`mr-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {errors.plan && <p className="mr-error mr-error--plan">{errors.plan}</p>}

          {/* Plan grid */}
          <div className="mr-plan-grid">
            {PLANS[tab].map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`mr-plan-card ${selected?.id === plan.id ? "active" : ""}`}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.tag && (
                  <span className="mr-plan-tag">{plan.tag}</span>
                )}
                {selected?.id === plan.id && (
                  <span className="mr-plan-check">
                    <FaCheck size={9} />
                  </span>
                )}

                <div className="mr-plan-price">₹{plan.price}</div>

                <div className="mr-plan-meta">
                  <span className="mr-plan-data">
                    <MdWifi size={12} /> {plan.data}
                  </span>
                  <span className="mr-plan-validity">
                    <MdFlashOn size={11} /> {plan.validity}
                  </span>
                </div>

                <p className="mr-plan-desc">{plan.description}</p>
              </button>
            ))}
          </div>
        </div>


      </Container>

      {/* ═══ SUCCESS OVERLAY ═════════════════════════════════════════ */}
      {success && (
        <div className="mr-success-overlay">
          <div className="mr-success-box">
            <div className="mr-success-icon">
              <div className="mr-success-ring" />
              <MdCheckCircle size={56} color="#22c55e" />
            </div>

            <h4 className="mr-success-title">Recharge Successful!</h4>
            <p className="mr-success-sub">
              Your mobile has been recharged successfully.
            </p>

            <div className="mr-success-details">
              <div className="mr-success-row">
                <span>Mobile Number</span>
                <strong>{mobile}</strong>
              </div>
              <div className="mr-success-row">
                <span>Operator</span>
                <strong>{opObj?.name || operator}</strong>
              </div>
              <div className="mr-success-row">
                <span>Circle</span>
                <strong>{circle}</strong>
              </div>
              <div className="mr-success-row">
                <span>Plan</span>
                <strong>{selected?.data} · {selected?.validity}</strong>
              </div>
              <div className="mr-success-row mr-success-row--amount">
                <span>Amount Paid</span>
                <strong>₹{selected?.price}</strong>
              </div>
              {txnId && (
                <div className="mr-success-row">
                  <span>Transaction ID</span>
                  <strong className="mr-txn-id">{txnId}</strong>
                </div>
              )}
            </div>

            <div className="mr-success-actions">
              <button
                type="button"
                className="mr-success-new"
                onClick={() => {
                  setSuccess(false);
                  setMobile(""); setOperator(""); setCircle(""); setSelected(null); setTxnId(""); setPin("");
                }}
              >
                New Recharge
              </button>
              <button
                type="button"
                className="mr-success-done"
                onClick={handleDone}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileRecharge;
