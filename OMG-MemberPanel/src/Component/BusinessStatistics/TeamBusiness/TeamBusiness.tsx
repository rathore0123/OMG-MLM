import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Container, Row, Col } from "reactstrap";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import "./TeamBusiness.scss";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import { decryptData } from "../../../utils/helper/Crypto";
import NoDataFound from "../../../CommonElements/NodataFound/NoDataFound";
import { useCurrency } from "@/Context/CurrencyContext";

const TeamBusiness = () => {
  const { currency } = useCurrency();
  const { universalService } = ApiService();
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ stronger: 0, weaker: 0 });

  const ClientId = decryptData(localStorage.getItem("clientId") as string);
  const IMAGE_PREVIEW_URL = import.meta.env.VITE_IMAGE_PREVIEW_URL;

  const fetchTeamBusiness = async () => {
    try {
      setLoading(true);
      const payload = {
        procName: "GetStrongerWeakerZone",
        Para: JSON.stringify({ ClientId, ActionMode: "GetStrongerWeakerZone" }),
      };
      const res = await universalService(payload);

      if (
        !res ||
        res === "NoRecord" ||
        res[0] === "NoRecord" ||
        res[0]?.Status === "NoRecord" ||
        res.length === 0
      ) {
        setTeamData([]);
        setSummary({ stronger: 0, weaker: 0 });
        return;
      }

      setTeamData(res);
      setSummary({
        stronger: Number(res[0]?.StrongerZoneBusiness || 0),
        weaker: Number(res[0]?.WeakerZoneBusiness || 0),
      });
    } catch (error) {
      console.log(error);
      setTeamData([]);
      setSummary({ stronger: 0, weaker: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamBusiness();
  }, []);

  return (
    <>
      <Breadcrumbs
        mainTitle="Team Business"
        parent="Business Statistics"
        ChildName="Team Business"
      />

      <Container fluid className="tb-page">
        {/* ── SUMMARY CARDS ─────────────────────── */}
        <div className="tb-summary">
          <div className="tb-summary-card tb-summary-card--power">
            <div className="tb-summary-icon">
              <FaArrowTrendUp />
            </div>
            <div className="tb-summary-body">
              <span className="tb-summary-label">Power Zone Business</span>
              {loading ? (
                <div className="tb-shimmer" />
              ) : (
                <strong className="tb-summary-val">
                  {currency.symbol}
                  {Number(summary.stronger).toLocaleString()}
                </strong>
              )}
            </div>
            <span className="tb-summary-pill">Stronger</span>
          </div>

          <div className="tb-summary-card tb-summary-card--other">
            <div className="tb-summary-icon">
              <FaUsers />
            </div>
            <div className="tb-summary-body">
              <span className="tb-summary-label">Other Zone Business</span>
              {loading ? (
                <div className="tb-shimmer" />
              ) : (
                <strong className="tb-summary-val">
                  {currency.symbol}
                  {Number(summary.weaker).toLocaleString()}
                </strong>
              )}
            </div>
            <span className="tb-summary-pill tb-summary-pill--other">
              Weaker
            </span>
          </div>
        </div>

        {/* ── MEMBER CARDS ──────────────────────── */}
        {loading ? (
          <Row className="g-3">
            {[...Array(8)].map((_, i) => (
              <Col xl="3" lg="4" md="6" sm="12" key={i}>
                <div className="tb-card-skeleton" />
              </Col>
            ))}
          </Row>
        ) : teamData.length === 0 ? (
          <NoDataFound />
        ) : (
          <Row className="g-3">
            {teamData.map((item: any, index: number) => {
              const splitName = item?.Username?.split("[")[0]?.trim() || "";
              const splitCode = item?.Username?.match(/\[(.*?)\]/)?.[1] || "";
              const isPower = item.ZoneType === "Stronger";

              return (
                <Col xl="3" lg="4" md="6" sm="12" key={index}>
                  <div
                    className={`tb-card ${isPower ? "tb-card--power" : "tb-card--other"}`}
                  >
                    <div className="tb-card-accent" />

                    <div className="tb-avatar">
                      <img
                        src={`${IMAGE_PREVIEW_URL}ClientImages/${item.ClientLogo}`}
                        alt={item.ClientName}
                        onError={(e: any) => {
                          e.target.src =
                            import.meta.env.VITE_IMAGE_PREVIEW_URL+"ClientImages/default_user_male.png";
                        }}
                      />
                    </div>

                    <h5 className="tb-name" title={splitName}>
                      {splitName}
                    </h5>
                    <p className="tb-code">[{splitCode}]</p>

                    <div className="tb-divider" />

                    <div className="tb-amount">
                      {currency.symbol}
                      {Number(item.Business).toLocaleString()}
                    </div>
                    <p className="tb-amount-label">Business Volume</p>

                    <div
                      className={`tb-zone-badge ${isPower ? "power" : "other"}`}
                    >
                      {isPower ? (
                        <FaArrowTrendUp size={10} />
                      ) : (
                        <FaUsers size={10} />
                      )}
                      {isPower ? "Power Zone" : "Other Zone"}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </>
  );
};

export default TeamBusiness;
