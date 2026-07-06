import React, { useEffect, useState } from "react";
import "./Package.scss";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Col, Container, Row } from "reactstrap";
import { decryptData } from "../../utils/helper/Crypto";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { useBotService } from "../../Service/ActivateBot/ActivateBot";
import { FaWallet } from "react-icons/fa";
import { ApiService } from "../../Service/UniversalService/ApiService";
import { useCurrency } from "@/Context/CurrencyContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PackageContainer = () => {
  const ClientID = decryptData(localStorage.getItem("clientId") as string);
  const [packageData, setPackageData] = useState<any[]>([]);
  const { showAlert, ShowSuccessAlert } = useSweetAlert();
  const { getFXSTWalletBalance } = useBotService();
  const IMAGE_PREVIEW_URL = import.meta.env.VITE_IMAGE_PREVIEW_URL;
  const { universalService } = ApiService();
  const { currency } = useCurrency();
  const navigate = useNavigate();

  const [usdtBalance, setUsdtBalance] = useState("0");
  const [pageloading, setPageLoading] = useState(false);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);

  useEffect(() => {
    fetchPackages();
    getwallet();
    checkPurchaseStatus();
  }, []);

  useEffect(() => {
    const container = document.getElementById("walletParticles");
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.bottom = "0";
      s.style.animationDuration = 2 + Math.random() * 3 + "s";
      s.style.animationDelay = Math.random() * 4 + "s";
      const size = 2 + Math.random() * 3 + "px";
      s.style.width = s.style.height = size;
      s.style.background =
        Math.random() > 0.5 ? "rgba(0,212,255,0.6)" : "rgba(0,255,160,0.5)";
      container.appendChild(s);
    }
  }, []);

  const fetchPackages = async () => {
    setPageLoading(true);
    try {
      const result = await universalService({
        procName: "CreatePackage",
        Para: JSON.stringify({ ActionMode: "MemberGetAllPackage" }),
      });
      const list: any[] = Array.isArray(result)
        ? result
        : result
          ? [result]
          : [];
      setPackageData(list);
    } catch {
      toast.error("Failed to load packages.");
    } finally {
      setPageLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const res = await universalService({
        procName: "MemberInvestment",
        Para: JSON.stringify({
          ClientId: ClientID,
          ActionMode: "GetMyInvestment",
        }),
      });
      if (res[0]?.StatusCode == 1) setAlreadyPurchased(true);
      // const list: any[] = Array.isArray(res) ? res : res ? [res] : [];
    } catch {
      // non-critical
    }
  };

  const getwallet = async () => {
    try {
      const res = await getFXSTWalletBalance({
        procName: "MemberInvestment",
        Para: JSON.stringify({
          ClientId: ClientID,
          ActionMode: "GetWalletAmount",
        }),
      });
      setUsdtBalance(res?.[0]?.ProductWallet ?? "0");
    } catch {
      // non-critical
    }
  };

  const handleBuyNow = async (plan: any) => {
    if (alreadyPurchased || pageloading) return;
    setPageLoading(true);
    try {
      const res = await universalService({
        procName: "MemberInvestment",
        Para: JSON.stringify({
          ClientId: ClientID,
          PackageId: plan.ProductId,
          Amount: plan.MinAmount,
          ActionMode: "CreateInvestment",
        }),
      });
      const row = Array.isArray(res) ? res[0] : res;
      if (row?.StatusCode == 1 || row?.StatusCode === "1") {
        setAlreadyPurchased(true);
        await ShowSuccessAlert(row?.Msg || "Package purchased successfully!");
        navigate(`${import.meta.env.BASE_URL}/my-package`);
      } else {
        showAlert(row?.Msg || "Purchase failed. Please try again.");
      }
    } catch {
      showAlert("Transaction failed. Please contact support.");
    } finally {
      setPageLoading(false);
    }
  };

  const fmtAmt = (n: number) => {
    const v = Number(n || 0).toLocaleString();
    return currency.symbol.length === 1
      ? `${currency.symbol}${v}`
      : `${v} ${currency.symbol}`;
  };

  return (
    <>
      <Breadcrumbs
        mainTitle="Buy Package"
        parent="Package"
        ChildName="Buy Package"
      />

      <Container fluid>
        {pageloading && (
          <div className="overlay-loader">
            <div className="spinner-border text-primary" role="status" />
          </div>
        )}

        {/* Wallet Banner */}
        <Row className="justify-content-center">
          <Col md="12" className="mb-3">
            <div className="wallet-pro-card">
              <div className="wallet-glow" />
              <div className="wallet-glow wallet-glow--2" />
              <div className="wallet-particles" id="walletParticles" />
              <div className="wallet-left">
                <div className="wallet-icon-ring">
                  <svg className="ring-svg" viewBox="0 0 54 54" fill="none">
                    <circle
                      cx="27"
                      cy="27"
                      r="25"
                      stroke="rgba(0,212,255,0.3)"
                      strokeWidth="1"
                      strokeDasharray="6 4"
                    />
                    <circle
                      cx="27"
                      cy="2"
                      r="2.5"
                      fill="#00d4ff"
                      opacity="0.8"
                    />
                  </svg>
                  <div className="wallet-icon">
                    <FaWallet />
                  </div>
                </div>
                <div className="wallet-info">
                  <p>Wallet Balance</p>
                  <h3>{fmtAmt(Number(usdtBalance))}</h3>
                  <span className="wallet-active-badge">
                    <span className="dot" /> Active
                  </span>
                </div>
              </div>
              <div className="wallet-right">
                <div className="wallet-divider" />
                <div className="wallet-tagline">
                  <strong>Secure &amp; Instant</strong>
                  Amount will be deducted from your wallet.
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Package Cards */}
        <Row className="justify-content-start">
          {packageData.map((plan: any) => (
            <Col sm="6" md="4" lg="4" xl="4" xxl="3" key={plan.ProductId}>
              <div className="modern-card">
                {/* TOP */}
                <div className="card-top">
                  <div className="card-icon">
                    <img
                      src={`${IMAGE_PREVIEW_URL}employeedocuments/${plan.DefaultImageURL || "DefaultPackageImage.png"}`}
                      alt={plan.ProductName}
                      onError={(e) => {
                        e.currentTarget.src = `${IMAGE_PREVIEW_URL}employeedocuments/DefaultPackageImage.png`;
                      }}
                    />
                  </div>
                  <div className="card-info">
                    <h4>{plan.ProductName}</h4>
                    <p>
                      {plan.Validity > 9999
                        ? "Lifetime"
                        : `Validity: ${plan.Validity} Days`}
                    </p>
                  </div>
                </div>

                {/* PRICE */}
                <div className="card-amount">{fmtAmt(plan.MinAmount)}</div>

                <div className="divider" />

                {/* FEATURES */}
                <ul className="card-features">
                  <li>
                    💰 Per Pair: <strong>₹150</strong>
                  </li>
                  <li>
                    📦 BV: <strong>1</strong>
                  </li>
                </ul>

                <div className="card-form">
                  {alreadyPurchased ? (
                    <button
                      className="card-btn"
                      disabled
                      style={{
                        background: "#22c55e",
                        cursor: "not-allowed",
                        opacity: 0.8,
                      }}
                    >
                      ✅ Already Purchased
                    </button>
                  ) : (
                    <button
                      className="card-btn"
                      onClick={() => handleBuyNow(plan)}
                    >
                      Buy Now — {fmtAmt(plan.MinAmount)}
                    </button>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default PackageContainer;
