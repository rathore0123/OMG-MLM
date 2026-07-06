import React, { useState, useEffect } from "react";
import { ApiService } from "../../../../services/ApiService";
import DataTable from "react-data-table-component";
import ExportButtons from "../../../../components/CommonFormElements/ExportButtons/ExportButtons";
import StatsCards from "../../../../components/CommonFormElements/StatsCard/StatsCards";
import OopsNoData from "../../../../components/CommonFormElements/DataNotFound/OopsNoData";
import TableSkeleton from "../Forms/TableSkeleton";
import customStyles from "../../../../components/CommonFormElements/DataTableComponents/CustomStyles";
import { SmartActions } from "../Security/SmartActionWithFormName";
import { useLocation } from "react-router-dom";
import Loader from "../../common/Loader";
import AccessRestricted from "../../common/AccessRestricted";
import LandingIllustration from "../../../../components/CommonFormElements/LandingIllustration/LandingIllustration";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";

const IMAGE_BASE = import.meta.env.VITE_IMAGE_PREVIEW_URL_2 ?? "";
const FOLDER = "ClientKYC";

const KYCApproval: React.FC = () => {
  const { universalService } = ApiService();
  const location = useLocation();
  const path = location.pathname;
  const formName = path.split("/").pop();

  const [searchInput, setSearchInput] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [showTable, setShowTable] = useState(false);
  const [hasVisitedTable, setHasVisitedTable] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [tableLoading, setTableLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, any>>({});

  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);

  // image preview modal
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);

  // approve/reject remark modal
  const [remarkModal, setRemarkModal] = useState<{ row: any; action: "Approved" | "Rejected" } | null>(null);
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const statsConfig = [
    { key: "TotalKYC",  title: "Total KYC",  icon: "badge",          showCurrency: false },
    { key: "Pending",   title: "Pending",     icon: "hourglass_empty",showCurrency: false },
    { key: "Approved",  title: "Approved",    icon: "check_circle",   showCurrency: false },
    { key: "Rejected",  title: "Rejected",    icon: "cancel",         showCurrency: false },
  ];

  // ─────────────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────────────
  const fetchFormPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
      const response = await universalService({
        procName: "AssignForm",
        Para: JSON.stringify({
          ActionMode: "GetForms",
          FormName: formName,
          EmployeeId: employeeId,
        }),
      });
      const result = response?.data ?? response;
      const row = Array.isArray(result) ? result[0] : result;
      SmartActions.setPermissions(formName, row);
      setHasPageAccess(SmartActions.canView(formName));
    } catch {
      setHasPageAccess(true);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // TABLE DATA (all records, client-side search+pagination)
  // ─────────────────────────────────────────────
  const [allData, setAllData] = useState<any[]>([]);

  const fetchGridData = async () => {
    setTableLoading(true);
    try {
      const res = await universalService({
        procName: "ClientDocuments",
        Para: JSON.stringify({
          ActionMode: "AdminGetAll",
          Status:     filterStatus === "All" ? "" : filterStatus,
        }),
      });
      const raw: any[] = Array.isArray(res) ? res : res ? [res] : [];
      const list = raw.filter((r) => r && typeof r === "object" && !Array.isArray(r) && r.Id);
      setAllData(list);
      setStats({
        TotalKYC: list.length,
        Pending:  list.filter((r) => r.Status === "Pending").length,
        Approved: list.filter((r) => r.Status === "Approved").length,
        Rejected: list.filter((r) => r.Status === "Rejected").length,
      });
    } catch {
      Swal.fire("Error", "Failed to load KYC records.", "error");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchExportData = async () => {
    const res = await universalService({
      procName: "ClientDocuments",
      Para: JSON.stringify({
        ActionMode: "AdminGetAll",
        Status:     filterStatus === "All" ? "" : filterStatus,
      }),
    });
    const raw: any[] = Array.isArray(res) ? res : res ? [res] : [];
    return raw.filter((r) => r && typeof r === "object" && !Array.isArray(r) && r.Id);
  };

  // client-side search filter
  const filteredData = allData.filter((r) => {
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase();
    if (filterColumn === "Username")       return r.UserName?.toLowerCase().includes(q);
    if (filterColumn === "MemberName")     return r.ClientName?.toLowerCase().includes(q);
    if (filterColumn === "DocumentName")   return r.DocumentName?.toLowerCase().includes(q);
    if (filterColumn === "DocumentNumber") return r.DocumentNumber?.toLowerCase().includes(q);
    return (
      r.ClientName?.toLowerCase().includes(q) ||
      r.UserName?.toLowerCase().includes(q) ||
      r.DocumentName?.toLowerCase().includes(q) ||
      r.DocumentNumber?.toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────
  // APPROVE / REJECT
  // ─────────────────────────────────────────────
  const openApproveReject = (row: any, action: "Approved" | "Rejected") => {
    setRemark("");
    setRemarkModal({ row, action });
  };

  const submitApproveReject = async () => {
    if (!remarkModal) return;
    if (remarkModal.action === "Rejected" && !remark.trim()) {
      Swal.fire("Required", "Please enter a remark for rejection.", "warning");
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: remarkModal.action === "Approved" ? "Approve KYC?" : "Reject KYC?",
      text: `${remarkModal.row.ClientName} (${remarkModal.row.UserName}) — ${remarkModal.row.DocumentName}`,
      icon: remarkModal.action === "Approved" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: remarkModal.action === "Approved" ? "Yes, Approve" : "Yes, Reject",
      confirmButtonColor: remarkModal.action === "Approved" ? "#22c55e" : "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!isConfirmed) return;

    setSaving(true);
    try {
      const res = await universalService({
        procName: "ClientDocuments",
        Para: JSON.stringify({
          ActionMode:  "ApproveReject",
          KYCId:       remarkModal.row.Id,
          Status:      remarkModal.action,
          AdminRemark: remark.trim(),
        }),
      });
      const row = Array.isArray(res) ? res[0] : res;
      if (row?.StatusCode == 1) {
        Swal.fire("Done!", row.Msg ?? "Status updated successfully.", "success");
        setRemarkModal(null);
        fetchGridData();
      } else {
        Swal.fire("Error", row?.Msg ?? "Update failed.", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  const applySearch = () => {
    setShowTable(true);
    setHasVisitedTable(true);
    setSearchTrigger((p) => p + 1);
  };

  // ─────────────────────────────────────────────
  // COLUMNS
  // ─────────────────────────────────────────────
  const buildColumns = (): any[] => [
    {
      name: "#",
      width: "55px",
      cell: (_: any, idx: number) => idx + 1,
    },
    {
      name: "Member",
      style: { minWidth: "160px" },
      cell: (row: any) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-white text-xs">{row.ClientName}</div>
          <div className="text-[11px] text-gray-400">{row.UserName}</div>
        </div>
      ),
    },
    {
      name: "Document",
      style: { minWidth: "130px" },
      selector: (row: any) => row.DocumentName,
      cell: (row: any) => <span className="font-medium text-xs">{row.DocumentName}</span>,
    },
    {
      name: "Doc Number",
      style: { minWidth: "140px" },
      selector: (row: any) => row.DocumentNumber,
      cell: (row: any) => <span className="text-xs text-gray-600">{row.DocumentNumber || "—"}</span>,
    },
    {
      name: "Front",
      width: "90px",
      style: { justifyContent: "center" },
      cell: (row: any) =>
        row.FrontImage ? (
          <button
            onClick={() =>
              setPreview({
                url: `${IMAGE_BASE}${FOLDER}/${row.FrontImage}`,
                label: `${row.DocumentName} — Front`,
              })
            }
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
          >
            <FaEye size={10} />
            View
          </button>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      name: "Back",
      width: "90px",
      style: { justifyContent: "center" },
      cell: (row: any) =>
        row.BackImage ? (
          <button
            onClick={() =>
              setPreview({
                url: `${IMAGE_BASE}${FOLDER}/${row.BackImage}`,
                label: `${row.DocumentName} — Back`,
              })
            }
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
          >
            <FaEye size={10} />
            View
          </button>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      name: "Status",
      width: "110px",
      style: { justifyContent: "center" },
      cell: (row: any) => {
        const map: Record<string, string> = {
          Pending:  "bg-yellow-100 text-yellow-700",
          Approved: "bg-green-100 text-green-700",
          Rejected: "bg-red-100 text-red-700",
        };
        return (
          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${map[row.Status] ?? "bg-gray-100 text-gray-600"}`}>
            {row.Status}
          </span>
        );
      },
    },
    {
      name: "Remark",
      style: { minWidth: "130px" },
      cell: (row: any) => (
        <span className="text-[11px] text-gray-500">{row.AdminRemark || "—"}</span>
      ),
    },
    {
      name: "Submitted",
      style: { minWidth: "110px" },
      cell: (row: any) => <span className="text-[11px] text-gray-500">{row.SubmittedOn}</span>,
    },
    {
      name: "Action",
      width: "200px",
      style: { justifyContent: "center" },
      cell: (row: any) =>
        row.Status === "Pending" ? (
          <div className="flex items-center gap-2 flex-nowrap">
            <button
              onClick={() => openApproveReject(row, "Approved")}
              className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-[11px] font-medium rounded-md bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm"
            >
              <i className="material-symbols-outlined !text-[13px]">check_circle</i>
              Approve
            </button>
            <button
              onClick={() => openApproveReject(row, "Rejected")}
              className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-[11px] font-medium rounded-md bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm"
            >
              <i className="material-symbols-outlined !text-[13px]">cancel</i>
              Reject
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              openApproveReject(
                row,
                row.Status === "Approved" ? "Rejected" : "Approved",
              )
            }
            className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-all"
          >
            <i className="material-symbols-outlined !text-[13px]">edit</i>
            Change Status
          </button>
        ),
    },
  ];

  // ─────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchFormPermissions();
  }, []);

  useEffect(() => {
    if (!showTable || !hasVisitedTable) return;
    fetchGridData();
  }, [searchTrigger, filterStatus]);

  const exportColumns = buildColumns()
    .filter((c) => c.name !== "Front" && c.name !== "Back" && c.name !== "Action")
    .map((c) => ({ label: c.name as string, key: c.name as string }));

  if (permissionsLoading) return <Loader />;
  if (!hasPageAccess) return <AccessRestricted />;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">

      {/* ── HEADER ── */}
      <div className="trezo-card-header mb-[10px] md:mb-[10px] sm:flex items-center justify-between pb-5 border-b border-gray-200 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h6 className="!mb-0 font-bold text-xl text-black dark:text-white">
            KYC Approval
          </h6>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:w-auto w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-end">

            {/* SEARCH BY COLUMN */}
            <div className="relative w-full sm:w-[180px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-500">
                <i className="material-symbols-outlined !text-[18px]">filter_list</i>
              </span>
              <select
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
                className="w-full h-[34px] pl-8 pr-8 text-xs rounded-md appearance-none outline-none border transition-all bg-white text-black border-gray-300 focus:border-primary-button-bg"
              >
                <option value="">Select Filter Option</option>
                <option value="Username">Username</option>
                <option value="MemberName">Member Name</option>
                <option value="DocumentName">Document Name</option>
                <option value="DocumentNumber">Document Number</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                <i className="material-symbols-outlined !text-[18px]">expand_more</i>
              </span>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-500">
                <i className="material-symbols-outlined !text-[18px]">search</i>
              </span>
              <input
                type="text"
                value={searchInput}
                placeholder="Enter Criteria..."
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                className="h-[34px] w-full pl-8 pr-3 text-xs rounded-md outline-none border transition-all bg-white text-black border-gray-300 focus:border-primary-button-bg"
              />
            </div>

            {/* STATUS FILTER */}
            <div className="relative w-full sm:w-[160px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                <i className="material-symbols-outlined !text-[18px] mt-2">pending_actions</i>
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-[34px] pl-8 pr-8 text-xs rounded-md appearance-none outline-none border transition-all
                           bg-white text-black border-gray-300 focus:border-primary-button-bg"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                <i className="material-symbols-outlined !text-[18px]">expand_more</i>
              </span>
            </div>

            {/* BUTTONS GROUP */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applySearch}
                className="w-[34px] h-[34px] flex items-center justify-center rounded-md border border-primary-button-bg text-primary-button-bg hover:bg-primary-button-bg hover:text-white transition-all shadow-sm"
              >
                <i className="material-symbols-outlined text-[20px]">search</i>
              </button>

              {(filterColumn || searchInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterColumn("");
                    setSearchInput("");
                    setPage(1);
                    setSearchTrigger((p) => p + 1);
                  }}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-md border border-gray-400 text-gray-600 hover:bg-gray-200"
                >
                  <i className="material-symbols-outlined text-[20px]">refresh</i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LANDING ── */}
      {!showTable && (
        <LandingIllustration
          title="KYC Approval"
          formName={formName}
          description={
            <>
              Search KYC submissions using filters above.
              <br />
              Review, approve or reject member identity documents.
            </>
          }
        />
      )}

      {/* ── TABLE SECTION ── */}
      {showTable && (
        <div>
          <StatsCards stats={stats} config={statsConfig} loading={tableLoading} />

          {/* TOOLBAR ROW */}
          {tableLoading ? (
            <div className="flex justify-between items-center py-2 animate-pulse">
              <div className="h-8 w-[120px] bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="flex gap-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                ))}
              </div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="flex justify-end items-center py-2 mb-[10px]">
              {/* RIGHT — export */}
              <ExportButtons
                title="KYC Approval Report"
                columns={exportColumns}
                fetchData={fetchExportData}
              />
            </div>
          ) : null}

          {/* DATA TABLE */}
          <div className="trezo-card-content bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <DataTable
              title=""
              columns={buildColumns()}
              data={filteredData}
              customStyles={customStyles}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              progressPending={tableLoading}
              progressComponent={<TableSkeleton rows={10} columns={10} />}
              noDataComponent={!tableLoading && <OopsNoData />}
            />
          </div>
        </div>
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white dark:bg-[#0c1427] rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#15203c]">
              <h6 className="font-semibold !mb-0">{preview.label}</h6>
              <button
                onClick={() => setPreview(null)}
                className="text-[22px] text-gray-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[300px] bg-gray-50 dark:bg-[#111827]">
              <img
                src={preview.url}
                alt={preview.label}
                className="max-h-[500px] max-w-full object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).alt = "Image not found";
                }}
              />
            </div>
            <div className="px-5 py-4 flex justify-end border-t dark:border-gray-700">
              <a
                href={preview.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-primary-button-bg text-white hover:opacity-90 transition-all"
              >
                <i className="material-symbols-outlined !text-[16px]">open_in_new</i>
                Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── APPROVE / REJECT REMARK MODAL ── */}
      {remarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[0.5px]">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-[#0c1427] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Modal header */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-[#15203c] px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h5 className={`text-base font-semibold !mb-0 ${remarkModal.action === "Approved" ? "text-green-600" : "text-red-500"}`}>
                {remarkModal.action === "Approved" ? "Approve KYC Document" : "Reject KYC Document"}
              </h5>
              <button
                onClick={() => setRemarkModal(null)}
                className="text-[22px] text-gray-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-md bg-gray-50 dark:bg-[#0f172a] border dark:border-gray-700 text-sm">
                <div className="font-medium text-gray-800 dark:text-white">
                  {remarkModal.row.ClientName}{" "}
                  <span className="text-gray-400 font-normal">({remarkModal.row.UserName})</span>
                </div>
                <div className="text-gray-500 mt-0.5 text-xs">
                  {remarkModal.row.DocumentName} — {remarkModal.row.DocumentNumber}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Admin Remark{" "}
                  {remarkModal.action === "Rejected" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder={
                    remarkModal.action === "Rejected"
                      ? "Enter reason for rejection..."
                      : "Optional remark..."
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none
                    bg-white dark:bg-[#0f172a] border-gray-300 dark:border-gray-600
                    text-gray-800 dark:text-gray-200 focus:outline-none focus:border-primary-button-bg"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setRemarkModal(null)}
                className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitApproveReject}
                disabled={saving}
                className={`px-4 py-2 text-sm rounded-md text-white font-medium transition-all flex items-center gap-2 disabled:opacity-60
                  ${remarkModal.action === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"}`}
              >
                {saving && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {remarkModal.action === "Approved" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCApproval;
