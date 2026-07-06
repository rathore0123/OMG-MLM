import { Container } from "reactstrap";
import BgShape from "../../../public/assets/svg/auth-card-bg-3aYfrz1R.svg";

const NoInternet = () => {
  return (
    <Container fluid className="p-0">
      <div className="lp-page ni-page">

        {/* ══ BACKGROUND ══ */}
        <div className="lp-bg-dots" aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--left"  aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--right" aria-hidden="true" />

        {/* ══ CONTENT — no card, floats on the page background ══ */}
        <div className="ni-wrap">

          {/* SVG Illustration — mimics reference image */}
          <div className="ni-svg-wrap" aria-label="No internet connection illustration">
            <svg
              viewBox="0 0 260 220"
              xmlns="http://www.w3.org/2000/svg"
              className="ni-svg"
            >
              {/* ── Wifi dot ── */}
              <circle cx="108" cy="130" r="9" fill="#22d3ee" />

              {/* ── Wifi arcs (left-anchored like reference) ── */}
              <path
                d="M82 112 Q97 96 114 108"
                fill="none" stroke="#22d3ee" strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M64 96 Q92 66 122 90"
                fill="none" stroke="#22d3ee" strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M46 80 Q88 38 132 72"
                fill="none" stroke="#22d3ee" strokeWidth="8"
                strokeLinecap="round"
              />

              {/* ── Red diagonal slash ── */}
              <line
                x1="38" y1="38" x2="185" y2="175"
                stroke="#f87171" strokeWidth="8"
                strokeLinecap="round"
              />

              {/* ── Warning triangle ── */}
              <polygon
                points="178,48 218,118 138,118"
                fill="#f97316"
              />
              {/* exclamation mark */}
              <rect x="104" y="78" width="9" height="26" rx="4" fill="#fff" transform="translate(70,0)" />
              <circle cx="182" cy="112" r="5" fill="#fff" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="ni-title">No Internet Connection</h1>

      

          {/* Retry button */}
          <button
            type="button"
            className="form-btn btn ni-btn"
            onClick={() => window.location.reload()}
          >
            ↺&nbsp;&nbsp;Try Again
          </button>

        </div>

        <p className="lp-footer">© 2026 — Powered by Sysfo</p>
      </div>
    </Container>
  );
};

export default NoInternet;