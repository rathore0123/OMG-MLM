"use client";

import React from "react";
import "./LandingIllustration.scss";

type Props = {
  title: string;
  description?: React.ReactNode;
  formName?: string;
  addLabel?: string;
  onAdd?: () => void;
};

const LandingIllustration: React.FC<Props> = ({
  title,
  description,
  formName,
  addLabel = "Add New",
  onAdd,
}) => {
  return (
    <div className="landing">
      {/* LEFT */}
      <div className="landing__left">
        <h1 className="landing__title">{title}</h1>

        <div className="landing__desc">
          {description ? (
            description
          ) : (
            <>
              <p>Use the filters above to search, edit or manage records.</p>
              <p className="or-text">OR</p>
              <p>Create a new record using the button below.</p>
            </>
          )}
        </div>

        {onAdd && formName && (
          <button className="landing__btn" onClick={onAdd}>
            {addLabel}
          </button>
        )}
      </div>

      {/* RIGHT SVG */}
      <div className="landing__right">
        <svg viewBox="0 0 512 512">
          <rect x="40" y="80" width="432" height="340" rx="30" />
          <path d="M70 80H442C458.569 80 472 93.4315 472 110V130H40V110C40 93.4315 53.4315 80 70 80Z" />
          <g>
            <rect x="90" y="210" width="25" height="25" rx="6" />
            <rect x="140" y="210" width="240" height="15" rx="7.5" />

            <rect x="90" y="265" width="25" height="25" rx="6" />
            <rect x="140" y="265" width="240" height="15" rx="7.5" />

            <rect x="90" y="320" width="25" height="25" rx="6" />
            <rect x="140" y="320" width="240" height="15" rx="7.5" />
          </g>

          <rect
            x="430"
            y="420"
            width="20"
            height="80"
            rx="5"
            transform="rotate(-45 430 420)"
          />

          <circle cx="380" cy="380" r="90" strokeWidth="8" />
        </svg>
      </div>
    </div>
  );
};

export default LandingIllustration;