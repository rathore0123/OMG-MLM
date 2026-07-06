import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { ApiService } from "../../Service/UniversalService/ApiService";
import { decryptData } from "../../utils/helper/Crypto";
import Loader from "../../CommonElements/Loader/Loader";

interface MemberInfo {
  ClientName: string;
  UserName: string;
  PaidStatus: string;
  MemberStatus: string;
  ActivatedOn: string | null;
  JoiningAmount: number;
}

interface PackageInfo {
  ProductId: number;
  ProductName: string;
  Type: string;
  MinAmount: number;
  MaxAmount: number;
  DailyROIPercentage: number;
  MonthlyROIPercentage: number;
  Validity: number;
  ShortDescription: string;
  IsActive: number;
  DefaultImageURL: string | null;
}

const ActivateMembership: React.FC = () => {
  const { universalService, loading } = ApiService();
  const clientId = decryptData(localStorage.getItem("clientId") as string);

  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [pkg, setPkg] = useState<PackageInfo | null>(null);

  useEffect(() => {
    fetchMemberInfo();
    fetchPackage();
  }, []);

  const fetchMemberInfo = async () => {
    try {
      const res = await universalService({
        procName: "MemberProfile",
        Para: JSON.stringify({ ClientId: clientId, ActionMode: "GetProfile" }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row) setMemberInfo(row);
    } catch {
      toast.error("Failed to load member info.");
    }
  };

  const fetchPackage = async () => {
    try {
      const res = await universalService({
        procName: "CreatePackage",
        Para: JSON.stringify({ ActionMode: "MemberGetAllPackage" }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row) setPkg(row);
    } catch {
      // silently fallback — fee still usable from memberInfo.JoiningAmount
    }
  };

  const membershipFee = pkg?.MinAmount ?? memberInfo?.JoiningAmount ?? 1699;

  const isActive = memberInfo?.PaidStatus === "Paid";

  return (
    <>
      <Breadcrumbs mainTitle="Activate Membership" parent="Account" />
      <Container fluid>
        {loading && <Loader />}

        <Row className="justify-content-center">
          <Col xl="6" lg="8" md="10">

            {/* Package Card */}
            {pkg && (
              <div
                className="mb-4 p-4 rounded"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* decorative circle */}
                <div
                  style={{
                    position: "absolute",
                    right: -30,
                    top: -30,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 20,
                    bottom: -40,
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                  }}
                />

                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: 1, textTransform: "uppercase" }}>
                      Investment Plan
                    </div>
                    <h5 className="mb-0 mt-1" style={{ color: "#fff", fontWeight: 700 }}>
                      {pkg.ProductName}
                    </h5>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>Amount</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>
                      ₹{pkg.MinAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 16 }}>
                  {pkg.ShortDescription}
                </p>

                <div className="d-flex gap-4">
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{pkg.DailyROIPercentage}%</div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>Daily ROI</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{pkg.MonthlyROIPercentage}%</div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>Monthly ROI</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {pkg.Validity > 9999 ? "Lifetime" : `${pkg.Validity}d`}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>Validity</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{pkg.Type}</div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>Type</div>
                  </div>
                </div>
              </div>
            )}

            <div className="trezo-card p-4">

              {/* Status Banner */}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded mb-4"
                style={{
                  background: isActive
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.1)",
                  border: `1px solid ${isActive ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                }}
              >
                <span style={{ fontSize: 32 }}>{isActive ? "✅" : "🔒"}</span>
                <div>
                  <h6 className="mb-1" style={{ color: isActive ? "#22c55e" : "#ef4444" }}>
                    {isActive ? "Membership Active" : "Membership Inactive"}
                  </h6>
                  <small className="text-muted">
                    {isActive
                      ? `Activated on: ${memberInfo?.ActivatedOn ? new Date(memberInfo.ActivatedOn).toLocaleDateString("en-IN") : "—"}`
                      : "Activate to start earning binary income and BV benefits"}
                  </small>
                </div>
              </div>

              {/* Member Info */}
              {memberInfo && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Name</span>
                    <span className="fw-medium">{memberInfo.ClientName}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Username</span>
                    <span className="fw-medium">{memberInfo.UserName}</span>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">Status</span>
                    <span
                      className="badge"
                      style={{
                        background: isActive ? "#22c55e" : "#f59e0b",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {memberInfo.MemberStatus}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted small">Membership Fee</span>
                    <span className="fw-bold" style={{ color: "#6366f1" }}>
                      ₹{membershipFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA for inactive members */}
              {!isActive && (
                <div className="text-center pt-2">
                  <Link
                    to={`${import.meta.env.BASE_URL}/buy-package`}
                    className="btn w-100 fw-semibold"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      color: "#fff",
                      border: "none",
                      padding: "11px",
                      borderRadius: 8,
                      fontSize: 15,
                    }}
                  >
                    Buy Package — ₹{membershipFee.toLocaleString("en-IN")}
                  </Link>
                  <p className="text-center text-muted mt-3" style={{ fontSize: 12 }}>
                    Purchase activates binary income matching and adds your BV to your sponsor's tree.
                  </p>
                </div>
              )}

              {isActive && (
                <div className="text-center py-3">
                  <p className="text-muted small">
                    Your membership is active. Binary income will be credited daily based on pair matching.
                  </p>
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <div className="text-center">
                      <div style={{ fontSize: 24, color: "#6366f1" }}>₹150</div>
                      <small className="text-muted">Per Pair</small>
                    </div>
                    <div className="text-center">
                      <div style={{ fontSize: 24, color: "#22c55e" }}>50</div>
                      <small className="text-muted">Max Pairs/Day</small>
                    </div>
                    <div className="text-center">
                      <div style={{ fontSize: 24, color: "#f59e0b" }}>₹7,500</div>
                      <small className="text-muted">Daily Cap</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ActivateMembership;
