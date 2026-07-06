import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Image } from "../../AbstractElements";

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const base = import.meta.env.BASE_URL;

  const isActive = (...paths: string[]) =>
    paths.some(
      (p) =>
        location.pathname === `${base}/${p}` ||
        location.pathname.startsWith(`${base}/${p}/`)
    );

  const go = (path: string) => navigate(`${base}/${path}`);

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-bar">

        {/* Home */}
        <div
          className={`nav-item ${isActive("dashboard") ? "active" : ""}`}
          onClick={() => go("dashboard")}
        >
          <Image
            src={`${base}/assets/images/nav-icon/house.svg`}
            alt="home"
          />
          <span>Home</span>
        </div>

        {/* My Team */}
        <div
          className={`nav-item ${isActive("tree", "mydirect", "level-wise-team", "teamdownline") ? "active" : ""}`}
          onClick={() => go("tree")}
        >
          <Image
            src={`${base}/assets/images/nav-icon/users-three.svg`}
            alt="team"
          />
          <span>My Team</span>
        </div>

        {/* Centre — Invest (primary CTA) */}
        <div
          className={`nav-item add-btn ${isActive("buy-package") ? "active" : ""}`}
          onClick={() => go("buy-package")}
        >
          <div className="add-btn-wrap">
            <div className="add-icon">
              <div className="brand-coinNav">
                <div className="coinNav-rotation-frame">
                  <img
                    src={`${base}/assets/images/logo/favicon.png`}
                    alt="invest"
                    className="media"
                  />
                </div>
              </div>
            </div>
          </div>
          <span>Packages</span>
        </div>

        {/* Withdraw */}
        <div
          className={`nav-item ${isActive("RequestWithdraw", "WithdrawHistory") ? "active" : ""}`}
          onClick={() => go("RequestWithdraw")}
        >
          <Image
            src={`${base}/assets/images/nav-icon/hand-withdraw.svg`}
            alt="withdraw"
          />
          <span>Withdraw</span>
        </div>

        {/* Profile */}
        <div
          className={`nav-item ${isActive("my-profile") ? "active" : ""}`}
          onClick={() => go("my-profile")}
        >
          <Image
            src={`${base}/assets/images/nav-icon/user.svg`}
            alt="profile"
          />
          <span>Profile</span>
        </div>

      </div>
    </div>
  );
};

export default BottomNavBar;
