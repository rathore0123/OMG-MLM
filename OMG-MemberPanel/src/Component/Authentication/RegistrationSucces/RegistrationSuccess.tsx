import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container } from "reactstrap";
import { FaUser, FaIdCard, FaLock, FaCopy, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCompany } from "../../../Context/CompanyContext";
import { Href } from "../../../utils/Constant";
import BgShape from "../../../../public/assets/svg/auth-card-bg-3aYfrz1R.svg";
import "./registration.scss"

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company } = useCompany();

  // Expect navigate state: { memberName, userName, userId, password }
  const { memberName, userName, userId, password } = location.state || {};

  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png";

  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const fields = [
    { label: "Member Name", icon: <FaUser size={14} />, value: memberName || "—" },
    { label: "User ID",     icon: <FaIdCard size={14} />, value: userName || userId || "—" },
    { label: "Password",   icon: <FaLock size={13} />,  value: password || "—", secret: true },
  ];

  return (
    <Container fluid className="p-0">
      <div className="lp-page">

        {/* ══ BACKGROUND ══ */}
        <div className="lp-bg-dots" aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--left"  aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--right" aria-hidden="true" />

        {/* ══ CARD ══ */}
        <div className="lp-card rs-card">

          {/* Logo */}
          <div className="lp-brand">
            <Link to={Href} className="lp-logo-link" aria-label="Home">
              <img src={logoUrl} alt="logo" className="lp-logo-img" />
            </Link>
          </div>

          {/* Success badge */}
          <div className="rs-badge">
            <FaCheckCircle className="rs-badge__icon" />
          </div>

          <h1 className="lp-title">Registration Successful! 🎉</h1>
          <p className="lp-subtitle">
            Welcome aboard! Your account has been created. Please save your credentials safely — your password will not be shown again.
          </p>

          {/* Divider */}
          <div className="lp-divider"><span /></div>

          {/* Credentials */}
          <div className="rs-creds">
            {fields.map(({ label, icon, value, secret }) => (
              <div key={label} className="rs-cred-row">
                <div className="rs-cred-label">
                  <span className="rs-cred-icon">{icon}</span>
                  {label}
                </div>
                <div className="rs-cred-value-wrap">
                  <span className="rs-cred-value">
                    {secret ? "••••••••" : value}
                  </span>
                  <button
                    type="button"
                    className={`rs-copy-btn${copied === label ? " rs-copy-btn--done" : ""}`}
                    onClick={() => handleCopy(label, value)}
                    aria-label={`Copy ${label}`}
                  >
                    {copied === label ? <FaCheckCircle size={13} /> : <FaCopy size={13} />}
                    {copied === label ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Warning note */}
          <div className="rs-warning">
            ⚠️ Please copy and save your credentials now. For security, your password will not be displayed again after you leave this page.
          </div>

          {/* Login button */}
          <Link
            to={`${import.meta.env.BASE_URL}/loginauth`}
            className="form-btn btn rs-login-btn"
          >
            Proceed to Login
          </Link>

        </div>
        {/* /card */}

        <p className="lp-footer">© 2026 — Powered by Sysfo</p>
      </div>
    </Container>
  );
};

export default RegistrationSuccess;