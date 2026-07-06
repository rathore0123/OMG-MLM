import React, { useEffect, useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane, Row, Col } from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import { decryptData } from "../../../utils/helper/Crypto";

const IMAGE_BASE = import.meta.env.VITE_IMAGE_PREVIEW_URL ?? "";
const FOLDER     = "ClientKYC";

const statusColor: Record<string, string> = {
  Approved: "#22c55e",
  Rejected: "#ef4444",
  Pending:  "#f59e0b",
};

const KYCDocumentPage = () => {
  const { universalService, postDocumentService } = ApiService();
  const clientId = decryptData(localStorage.getItem("clientId") as string);

  const [docTypes,   setDocTypes]   = useState<any[]>([]);
  const [activeTab,  setActiveTab]  = useState("");
  const [formData,   setFormData]   = useState<Record<number, any>>({});
  const [uploaded,   setUploaded]   = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [dupError,   setDupError]   = useState<Record<number, string>>({});
  const [dupChecking, setDupChecking] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchDocTypes();
    fetchUploaded();
  }, []);

  const fetchDocTypes = async () => {
    try {
      const res  = await universalService({ procName: "ClientDocuments", Para: JSON.stringify({ ActionMode: "Select" }) });
      const list = Array.isArray(res) ? res : res ? [res] : [];
      setDocTypes(list);
      if (list.length > 0) setActiveTab(list[0].DocumentId.toString());
    } catch { toast.error("Failed to load document types."); }
  };

  const fetchUploaded = async () => {
    try {
      const res  = await universalService({ procName: "ClientDocuments", Para: JSON.stringify({ ActionMode: "GetByClient", ClientId: clientId }) });
      const list = Array.isArray(res) ? res : res ? [res] : [];
      setUploaded(list.filter((r: any) => r?.DocumentId));
    } catch { /* non-critical */ }
  };

  const setField = (docId: number, field: string, value: any) =>
    setFormData(prev => ({ ...prev, [docId]: { ...prev[docId], [field]: value } }));

  const checkDuplicate = async (docId: number, docNo: string) => {
    const num = docNo.trim();
    if (!num) return;
    setDupChecking(prev => ({ ...prev, [docId]: true }));
    setDupError(prev => ({ ...prev, [docId]: "" }));
    try {
      const res: any = await universalService({
        procName: "ClientDocuments",
        Para: JSON.stringify({ ActionMode: "CheckDuplicate", ClientId: clientId, DocumentId: docId, DocumentNo: num }),
      });
      const row = Array.isArray(res) ? res[0] : res;
      if (row?.IsDuplicate == 1) {
        setDupError(prev => ({ ...prev, [docId]: row.Msg ?? "This document number is already registered." }));
      }
    } catch { /* non-critical */ }
    finally { setDupChecking(prev => ({ ...prev, [docId]: false })); }
  };

  const handleFile = (docId: number, field: string, file: File) => {
    const preview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [docId]: { ...prev[docId], [field]: file, [`${field}Preview`]: preview } }));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("UploadedImage", file);
    fd.append("pagename", FOLDER);
    const res: any = await postDocumentService(fd, (pct: number) => setUploadPct(pct));
    return res?.FileName ?? res?.fileName ?? res?.data?.FileName ?? "";
  };

  const handleSubmit = async (doc: any) => {
    const data = formData[doc.DocumentId] ?? {};

    if (!data.number?.trim()) {
      toast.warning(`Please enter ${doc.DocumentName} number.`);
      return;
    }
    if (dupError[doc.DocumentId]) {
      toast.error(dupError[doc.DocumentId]);
      return;
    }
    if (!data.front) {
      toast.warning("Please select the front image of the document.");
      return;
    }
    if (!data.back) {
      toast.warning("Please select the back image of the document.");
      return;
    }

    setSubmitting(true);
    setUploadPct(0);
    try {
      const frontName = await uploadFile(data.front);
      const backName  = await uploadFile(data.back);

      const res: any = await universalService({
        procName: "ClientDocuments",
        Para: JSON.stringify({
          ActionMode: "Insert",
          ClientId:   clientId,
          DocumentId: doc.DocumentId,
          DocumentNo: data.number.trim(),
          FrontImage: frontName,
          BackImage:  backName,
        }),
      });

      const row = Array.isArray(res) ? res[0] : res;
      if (row?.StatusCode == 1) {
        toast.success(row.Msg ?? "Document submitted successfully!");
        setFormData(prev => ({ ...prev, [doc.DocumentId]: {} }));
        fetchUploaded();
      } else {
        toast.error(row?.Msg ?? "Submission failed.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadPct(0);
    }
  };

  const uploadedFor = (docId: number) =>
    uploaded.filter((u: any) => Number(u.DocumentId) === Number(docId));

  return (
    <>
      <Nav tabs className="kyc-tabs mb-0">
        {docTypes.map(doc => {
          const active = activeTab === doc.DocumentId.toString();
          const done   = uploadedFor(doc.DocumentId).length > 0;
          return (
            <NavItem key={doc.DocumentId}>
              <NavLink
                className={classnames({ active })}
                onClick={() => setActiveTab(doc.DocumentId.toString())}
                style={{
                  cursor: "pointer",
                  background: active ? "var(--btn-bg, #6366f1)" : "transparent",
                  color: active ? "#fff" : "#555",
                  borderRadius: "6px 6px 0 0",
                  padding: "8px 18px",
                  marginRight: 4,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.2s",
                  border: active ? "none" : "1px solid #dee2e6",
                }}
              >
                {doc.DocumentName}
                {done && (
                  <span style={{ marginLeft: 6, fontSize: 11, padding: "1px 6px", borderRadius: 20, background: "#22c55e", color: "#fff" }}>
                    ✓
                  </span>
                )}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>

      <TabContent activeTab={activeTab}>
        {docTypes.map(doc => {
          const data = formData[doc.DocumentId] ?? {};
          const rows = uploadedFor(doc.DocumentId);

          const latestRow  = rows[0];
          const docStatus  = latestRow?.Status ?? null;
          const showForm   = !docStatus || docStatus === "Rejected";

          return (
            <TabPane tabId={doc.DocumentId.toString()} key={doc.DocumentId}>

              {/* ── Approved banner ── */}
              {docStatus === "Approved" && (
                <div className="p-4 rounded border mb-4 mt-3 d-flex align-items-center gap-2"
                     style={{ background: "rgba(34,197,94,0.06)", borderColor: "#22c55e" }}>
                  <span style={{ fontSize: 22 }}>✅</span>
                  <div>
                    <div className="fw-semibold" style={{ color: "#16a34a", fontSize: 14 }}>
                      {doc.DocumentName} Verified
                    </div>
                    <small className="text-muted">Your document has been approved. No further action needed.</small>
                  </div>
                </div>
              )}

              {/* ── Pending banner ── */}
              {docStatus === "Pending" && (
                <div className="p-4 rounded border mb-4 mt-3 d-flex align-items-center gap-2"
                     style={{ background: "rgba(245,158,11,0.06)", borderColor: "#f59e0b" }}>
                  <span style={{ fontSize: 22 }}>⏳</span>
                  <div>
                    <div className="fw-semibold" style={{ color: "#d97706", fontSize: 14 }}>
                      Verification Pending
                    </div>
                    <small className="text-muted">Your {doc.DocumentName} is under review. Please wait for admin approval.</small>
                  </div>
                </div>
              )}

              {/* ── Rejected banner ── */}
              {docStatus === "Rejected" && latestRow?.AdminRemark && (
                <div className="p-3 rounded border mb-3 mt-3"
                     style={{ background: "rgba(239,68,68,0.05)", borderColor: "#ef4444" }}>
                  <div className="fw-semibold mb-1" style={{ color: "#dc2626", fontSize: 13 }}>
                    ❌ Rejected — Please re-upload
                  </div>
                  <small className="text-muted">Reason: {latestRow.AdminRemark}</small>
                </div>
              )}

              {/* ── Upload Form ── */}
              {showForm && (
              <div className="p-4 rounded border mb-4 mt-3" style={{ background: "rgba(99,102,241,0.04)" }}>
                <h6 className="mb-3 fw-semibold" style={{ color: "#6366f1" }}>
                  Upload {doc.DocumentName}
                </h6>

                <Row className="g-3 mb-3">
                  <Col md="12">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                      {doc.DocumentName} Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${dupError[doc.DocumentId] ? "is-invalid" : ""}`}
                      placeholder={`Enter ${doc.DocumentName} Number`}
                      value={data.number ?? ""}
                      onChange={e => {
                        setField(doc.DocumentId, "number", e.target.value);
                        if (dupError[doc.DocumentId]) setDupError(prev => ({ ...prev, [doc.DocumentId]: "" }));
                      }}
                      onBlur={e => checkDuplicate(doc.DocumentId, e.target.value)}
                    />
                    {dupChecking[doc.DocumentId] && (
                      <small className="text-muted">
                        <span className="spinner-border spinner-border-sm me-1" style={{ width: 10, height: 10 }} />
                        Checking…
                      </small>
                    )}
                    {dupError[doc.DocumentId] && (
                      <div className="invalid-feedback d-block" style={{ fontSize: 12 }}>
                        ⚠ {dupError[doc.DocumentId]}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row className="g-3">
                  {/* Front Image */}
                  <Col md="6">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                      Front Image <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={e => e.target.files?.[0] && handleFile(doc.DocumentId, "front", e.target.files[0])}
                    />
                    {data.frontPreview && (
                      <img
                        src={data.frontPreview}
                        alt="front preview"
                        className="mt-2 rounded border w-100"
                        style={{ maxHeight: 150, objectFit: "cover" }}
                      />
                    )}
                  </Col>

                  {/* Back Image */}
                  <Col md="6">
                    <label className="form-label fw-medium" style={{ fontSize: 13 }}>
                      Back Image <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={e => e.target.files?.[0] && handleFile(doc.DocumentId, "back", e.target.files[0])}
                    />
                    {data.backPreview && (
                      <img
                        src={data.backPreview}
                        alt="back preview"
                        className="mt-2 rounded border w-100"
                        style={{ maxHeight: 150, objectFit: "cover" }}
                      />
                    )}
                  </Col>
                </Row>

                {/* Progress bar */}
                {submitting && uploadPct > 0 && (
                  <div className="mt-3">
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${uploadPct}%`, background: "#6366f1", transition: "width 0.3s" }}
                      />
                    </div>
                    <small className="text-muted">{uploadPct}% uploaded</small>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    className="btn px-4"
                    style={{ background: "#6366f1", color: "#fff", fontWeight: 600 }}
                    onClick={() => handleSubmit(doc)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Uploading…
                      </>
                    ) : "Submit Document"}
                  </button>
                </div>
              </div>
              )}

              {/* ── Uploaded Documents Table ── */}
              <div>
                <h6 className="fw-semibold mb-3">Submitted Documents</h6>
                {rows.length === 0 ? (
                  <div className="text-center py-4 text-muted" style={{ fontSize: 13, border: "1px dashed #dee2e6", borderRadius: 8 }}>
                    No {doc.DocumentName} submitted yet.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle" style={{ fontSize: 13 }}>
                      <thead style={{ background: "#f8fafc" }}>
                        <tr>
                          <th>#</th>
                          <th>Document</th>
                          <th>Number</th>
                          <th>Front</th>
                          <th>Back</th>
                          <th>Status</th>
                          <th>Submitted On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row: any, idx: number) => (
                          <tr key={row.Id ?? idx}>
                            <td>{idx + 1}</td>
                            <td>{row.DocumentName}</td>
                            <td>{row.DocumentNumber ?? "—"}</td>
                            <td>
                              {row.FrontImage ? (
                                <a
                                  href={`${IMAGE_BASE}${FOLDER}/${row.FrontImage}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm"
                                  style={{ background: "#6366f1", color: "#fff", fontSize: 11, padding: "2px 10px" }}
                                >
                                  View
                                </a>
                              ) : "—"}
                            </td>
                            <td>
                              {row.BackImage ? (
                                <a
                                  href={`${IMAGE_BASE}${FOLDER}/${row.BackImage}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm"
                                  style={{ background: "#8b5cf6", color: "#fff", fontSize: 11, padding: "2px 10px" }}
                                >
                                  View
                                </a>
                              ) : "—"}
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  background: statusColor[row.Status] ?? "#f59e0b",
                                  color: "#fff",
                                  padding: "4px 10px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                }}
                              >
                                {row.Status}
                              </span>
                            </td>
                            <td>{row.UploadDate ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </TabPane>
          );
        })}
      </TabContent>
    </>
  );
};

export default KYCDocumentPage;
