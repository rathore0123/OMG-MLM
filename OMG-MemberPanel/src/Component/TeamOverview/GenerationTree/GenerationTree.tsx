import React, { useState, useEffect } from "react";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Btn, Image } from "../../../AbstractElements";
import OrgChartComponent from "../GenerationTree/D3Chart";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import { useApiHelper } from "../../../utils/ApiHelper";
import { decryptData } from "../../../utils/helper/Crypto";
import Loader from "../../../CommonElements/Loader/Loader";
import {
  TreeFormPropsType,
  TreeForminitialValues,
} from "../../../Type/Forms/FormsType";
import { useProfile } from "../../../Context/ProfileContext";
import { useCurrency } from "@/Context/CurrencyContext";

// ── Scoped styles ────────────────────────────────────────────────────────────
const STYLE_ID = "gen-tree-container-styles";
function injectPageStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Exo+2:wght@300;400;500;600&display=swap');

    /* ── page shell ── */
    .gt-page {
      min-height: 100vh;
      padding-bottom: 48px;
    }

    /* ── header bar ── */
    .gt-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 28px;
      background: var(--card-bg);
      border-bottom: 1px solid #1a3048;
      margin-bottom: 24px;
    }
    .gt-brand {
      display: flex; align-items: center; gap: 10px;
    }
    .gt-diamond {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #29d4e0, #0a6b8a);
      clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
      display: flex; align-items: center; justify-content: center;
    }
    .gt-diamond::after {
      content: '';
      width: 13px; height: 13px;
      background: rgba(255,255,255,.2);
      clip-path: polygon(50% 0%,100% 50%,50% 100%,0% 50%);
    }
    .gt-brand-text {
      
      font-size: 18px; font-weight: 700; letter-spacing: 3px;
      color: #e8f4ff;
    }
    .gt-brand-text span { color: #29d4e0; }
    .gt-header-stats {
      display: flex; gap: 24px;
    }
    .gt-hstat-val {
      
      font-size: 20px; font-weight: 700; color: #f0b429; line-height: 1;
    }
    .gt-hstat-lbl {
      font-size: 9px; color: #3d6080;
      letter-spacing: 2px; text-transform: uppercase;
    }

    /* ── search card ── */
    .gt-search-card {
      background: var(--card-bg);
      // border: 1px solid var(--card-border-color);
          border-radius: 1px;
    padding: 10px 14px;
    margin-bottom: 20px;
        border-bottom: 1px solid #1a3048;
    }
    .gt-search-title {
      
      font-size: 13px; font-weight: 600;
      color: #3d6080; margin-bottom: 14px;
    }
    .gt-label {
      
          display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--card-text-color);
    margin-bottom: 7px;
    }
    .gt-input {
      font-family: 'Exo 2', sans-serif !important;
      background: #060d14 !important;
      border: 1px solid #1a3048 !important;
      border-radius: 8px !important;
      color: #e8f4ff !important;
      font-size: 13px !important;
      padding: 9px 14px !important;
      width: 100%;
      transition: border-color .2s, box-shadow .2s;
    }
    .gt-input:focus {
      outline: none !important;
      border-color: #1e7cd6 !important;
      box-shadow: 0 0 0 3px #1e7cd622 !important;
    }
    .gt-input::placeholder { color: #3d6080 !important; }
    .gt-search-btn {
      
      letter-spacing: 2px;
      font-weight: 700 !important;
      font-size: 13px !important;
      background: var(--btn-bg);
      border: none !important;
      border-radius: 8px !important;
      color: var(--btn-text-color) !important;
      padding: 9px 28px !important;
      cursor: pointer;
      transition: opacity .2s, transform .15s;
    }
    .gt-search-btn:hover { opacity: .9; transform: translateY(-1px); }
    .gt-search-btn:active { transform: translateY(0); }

    /* ── tree card ── */
    .gt-tree-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border-color);
      border-radius: 14px;
      overflow: hidden;
    }
    .gt-tree-card-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid var(--card-border-color);
      background: var(--card-bg);
    }
    .gt-tree-card-hdr-left {
      display: flex; align-items: center; gap: 10px;
    }
    .gt-accent-line {
      width: 3px; height: 18px;
      background:var(--primary-gradient);
      border-radius: 2px;
    }
    .gt-card-title {
      
      font-size: 15px; font-weight: 700; letter-spacing: 2px;
      color: var(--card-text-color);
      @media only screen and (max-width: 600px) {
        font-size: 9px;
      }
    }
    .gt-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 20px; gap: 16px; color: #3d6080;
    }
    .gt-empty-icon {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, #29d4e040, #1e7cd620);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    .gt-empty-icon svg { width: 28px; height: 28px; opacity: .4; }
    .gt-empty-text {
      
      font-size: 16px; letter-spacing: 3px; text-transform: uppercase;
    }

    /* ── legend ── */
    .gt-legend {
      display: flex; gap: 20px; align-items: center;
      @media only screen and (max-width: 600px) {
        gap: 5px;
      }
    }
    .gt-leg-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: rgba(var(--card-text-color-rgba), 0.8); letter-spacing: 1px; 
    @media only screen and (max-width: 600px) {
        gap: 3px;
      }}
    .gt-leg-dot { width: 7px; height: 7px; border-radius: 50%; }

    /* ── modal ──
       Fallback values on every var() are intentional: these custom
       properties are set at runtime by Theme/applyTheme.ts after an async
       theme-fetch. If this modal opens before that resolves, var(--x) with
       no fallback is invalid and the whole rule drops silently — the card
       renders as plain unstyled Bootstrap (white bg, black text, no radius).
    */
    .gt-modal .modal-content {
      background: var(--card-bg, #1a2130) !important;
      border: 1px solid var(--card-border-color, #263248) !important;
      border-radius: 16px !important;
      overflow: hidden !important; /* clip header/body to the rounded corners */
      box-shadow: 0 20px 60px rgba(0,0,0,.45) !important;
    }
    .gt-modal .modal-header {
      background: var(--body-bg, #0d1117) !important;
      border-bottom: 1px solid var(--card-border-color, #263248) !important;
      padding: 16px 20px !important;
    }
    .gt-modal .modal-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 18px !important; font-weight: 700 !important;
      letter-spacing: 2px !important;
      color: var(--card-text-color, #e8f4ff) !important;
    }
    .gt-modal .btn-close {
      filter: none;
      opacity: 1 !important;
      transition: opacity .2s;
    }
    .gt-modal .btn-close:hover { opacity: .7 !important; }
    .gt-modal .modal-body { padding: 20px !important; }

    /* detail table */
    .gt-detail-table { width: 100%; border-collapse: collapse; }
    .gt-detail-table tr { border-bottom: 1px solid var(--card-border-color, #263248); transition: background .15s; }
    .gt-detail-table tr:last-child { border-bottom: none; }
    .gt-detail-table tr:hover { background: var(--card-hover-bg, #1f2840); }
    .gt-detail-table td {
      padding: 10px 14px;
      font-size: 13px; color: #7fa8cc;
    }
    .gt-detail-table td:first-child {
      font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
      color: var(--card-text-color, #e8f4ff); width: 45%;
    }
    .gt-detail-table td:last-child { color: var(--card-text-color, #e8f4ff); font-weight: 500; }
    .gt-detail-table .val-gold { color: #f0b429 !important; font-size: 15px !important; font-weight: 700 !important; }
    .gt-modal-footer {
      display: flex; justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #1a3048;
      margin-top: 16px;
    }

  `;
  document.head.appendChild(s);
}

// ── Component ────────────────────────────────────────────────────────────────
const GenerationTreeContainer: React.FC = () => {
  const { post, loading } = useApiHelper();
  const { showAlert } = useSweetAlert();
  const [MemberName, setMemberName] = useState(
    localStorage.getItem("MemberName"),
  );
  const { avatarUrl, profile } = useProfile();
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [data, setData] = useState<any[] | null>(null);
  const [details, setDetails] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const { currency } = useCurrency();

  const TreeSchema = Yup.object().shape({
    Username: Yup.string().required("Enter Username"),
  });

  useEffect(() => {
    injectPageStyles();
    FetchData(localStorage.getItem("UserName") as string);
  }, []);

  const doAjaxCall = async (payload: any) => {
    return await post(
      `${import.meta.env.VITE_EXEC_PROC}/ExecuteProcedure`,
      payload,
    );
  };

  const parseNestedJsonStrings = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        try {
          obj[key] = JSON.parse(obj[key]);
        } catch {
          /* leave as-is */
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        parseNestedJsonStrings(obj[key]);
      }
    }
  };

  const FetchData = async (username: string) => {
    const res = await doAjaxCall({
      procName: "OrgTree",
      Para: JSON.stringify({
        LoggedClientId: ClientID,
        SearchUsername: username,
      }),
    });
    if (res[0]?.StatusCode === "0") {
      showAlert(res[0].Msg);
      return;
    }
    const parsed = JSON.parse(res[0].OrganizationTree);
    if (parsed.length > 1) {
      parseNestedJsonStrings(parsed);
      setData(parsed);
    }
  };

  const FetchNodeData = async (clientId: string) => {
    const res = await doAjaxCall({
      procName: "GetNodeDetail",
      Para: JSON.stringify({ ClientId: clientId }),
    });
    setDetails(res[0] ?? {});
    document.body.style.paddingRight = "";
    setModalOpen(true);
  };

  const handleNodeClick = (nodeId: string) => {
    FetchNodeData(nodeId.split("-")[1]);
  };

  const closeModal = () => {
    document.body.style.paddingRight = "";
    setModalOpen(false);
  };

  // Compute header stats from data
  const totalMembers = data?.length ?? 0;
  const activeMembers =
    data?.filter((n: any) => n.active !== false).length ?? 0;

  return (
    <div className="gt-page">
      <Breadcrumbs
        mainTitle="Generation Tree"
        parent="Team"
        ChildName="Generation Tree"
      />

      <Container fluid>
        {loading && <Loader />}
        {/* ── page header ── */}

        {/* ── search ── */}
        <Row>
          <Col xl="6">
            {" "}
            <div className="gt-header">
              <div className="gt-brand">
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "100px",
                  }}
                />
                {/* <div className="gt-diamond" /> */}
                <span className="gt-brand-text">{MemberName}</span>
              </div>
              <div className="gt-header-stats">
                {[
                  { val: totalMembers, lbl: "Members" },
                  { val: activeMembers, lbl: "Active" },
                ].map(({ val, lbl }) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div className="gt-hstat-val">{val}</div>
                    <div className="gt-hstat-lbl">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col xl="6">
            <div className="gt-search-card">
              <Formik
                initialValues={TreeForminitialValues}
                validationSchema={TreeSchema}
                onSubmit={(values, { setSubmitting }) => {
                  FetchData((values as TreeFormPropsType).Username);
                  setSubmitting(false);
                }}
              >
                {() => (
                  <Form>
                    <Row>
                      <Col md="8" className="col-8">
                        <Field
                          type="text"
                          name="Username"
                          placeholder="Enter username to search"
                          className="st-filter-input"
                        />
                        <ErrorMessage
                          name="Username"
                          component="div"
                          className="text-danger"
                          style={{ fontSize: 11, marginTop: 4 }}
                        />
                      </Col>
                      <Col md="4" className="mt-1 col-4">
                        <button type="submit" className="form-btn btn">
                          SEARCH
                        </button>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Formik>
            </div>
          </Col>
        </Row>

        {/* ── tree ── */}
        <Row>
          <Col xl="12">
            <div className="gt-tree-card">
              <div className="gt-tree-card-hdr">
                <div className="gt-tree-card-hdr-left">
                  <div className="gt-accent-line" />
                  <span className="gt-card-title">ORGANIZATION TREE</span>
                </div>
                <div className="gt-legend">
                  <div className="gt-leg-item">
                    <div
                      className="gt-leg-dot"
                      style={{
                        background: "#22c97b",
                        boxShadow: "0 0 5px #22c97b",
                      }}
                    />
                    Active
                  </div>
                  <div className="gt-leg-item">
                    <div
                      className="gt-leg-dot"
                      style={{ background: "#e05252" }}
                    />
                    Inactive
                  </div>
                  <div className="gt-leg-item">
                    <div
                      className="gt-leg-dot"
                      style={{ background: "#29d4e0" }}
                    />
                    Direct Sub.
                  </div>
                  <div className="gt-leg-item">
                    <div
                      className="gt-leg-dot"
                      style={{ background: "#f0b429" }}
                    />
                    Total Sub.
                  </div>
                </div>
              </div>

              {data == null ? (
                <div className="gt-empty">
                  <div className="gt-empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#29d4e0"
                      strokeWidth="1.5"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="gt-empty-text">No Team Found</div>
                </div>
              ) : (
                <OrgChartComponent data={data} onNodeClick={handleNodeClick} />
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* ── detail modal ── */}
      <Modal
        isOpen={modalOpen}
        toggle={closeModal}
        centered
        className="gt-modal"
      >
        <ModalHeader toggle={closeModal} className="modal-header">
          <span className="modal-title">
            {details.MemberName ?? "Member Details"}
          </span>
        </ModalHeader>
        <ModalBody>
          <table className="gt-detail-table">
            <tbody>
              {[
                {
                  lbl: "Top Up Amount",
                  val: `${currency.symbol}${details.TopUpAmount ?? "—"}`,
                  gold: true,
                },
                { lbl: "Designation", val: details.RankName ?? "—" },
                {
                  lbl: "ID Activation Date",
                  val: details.IDActivationDate ?? "—",
                },
                {
                  lbl: "Today Business",
                  val: `${currency.symbol}${details.TodayBusiness ?? "—"}`,
                  gold: true,
                },
                {
                  lbl: "Stronger Business",
                  val: `${currency.symbol}${details.LeftBusiness ?? "—"}`,
                },
                {
                  lbl: "Weaker Business",
                  val: `${currency.symbol}${details.RightBusiness ?? "—"}`,
                },
                {
                  lbl: "Total Business",
                  val: `${currency.symbol}${details.TotalBusiness ?? "—"}`,
                  gold: true,
                },
              ].map(({ lbl, val, gold }) => (
                <tr key={lbl}>
                  <td>{lbl}</td>
                  <td className={gold ? "val-gold" : ""}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <div className="gt-modal-footer">
            <button className="btn form-btn" onClick={closeModal}>
              CLOSE
            </button>
          </div> */}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default GenerationTreeContainer;
