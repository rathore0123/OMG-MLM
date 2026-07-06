import React, { useState, useEffect } from "react";

import Swal from "sweetalert2";
import { ApiService } from "../../../../services/ApiService";

const STATUS_META = {
  Pending:  { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "schedule" },
  Approved: { cls: "bg-green-100 text-green-700 border-green-200",   icon: "check_circle" },
  Rejected: { cls: "bg-red-100 text-red-700 border-red-200",         icon: "cancel" },
};

const inputCls = (disabled = false) =>
  `h-[34px] px-3 text-xs rounded-md border outline-none transition-all w-full ${
    disabled
      ? "bg-gray-50 dark:bg-[#0c1427] text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed"
      : "bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary-button-bg"
  }`;

const selectCls =
  "h-[34px] pl-3 pr-8 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg appearance-none transition-all";

export default function MemberPaymentVerification() {
  const { universalService } = ApiService();

  const [fromDate, setFromDate]       = useState("");
  const [toDate, setToDate]           = useState("");
  const [status, setStatus]           = useState("All");
  const [loading, setLoading]         = useState(false);
  const [records, setRecords]         = useState([]);

  const [modalOpen, setModalOpen]         = useState(false);
  const [modalLoading, setModalLoading]   = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedId, setSelectedId]       = useState(null);
  const [modalData, setModalData]         = useState(null);
  const [action, setAction]               = useState("Approved");
  const [remark, setRemark]               = useState("");

  useEffect(() => {
    handleSearch();
  }, []);

  async function handleSearch() {
    setLoading(true);
    try {
      const res = await universalService({
        procName: "MemberChequeVerification",
        Para: JSON.stringify({
          ActionMode:   "GetRecords",
          UserName:     "",
          FromDate:     fromDate,
          ToDate:       toDate,
          SearchValue:  status,
          SearchTerm:   "Status",
        }),
      });
      setRecords(Array.isArray(res) ? res : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  async function openModal(id) {
    setSelectedId(id);
    setModalData(null);
    setRemark("");
    setAction("Approved");
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await universalService({
        procName: "MemberChequeVerification",
        Para: JSON.stringify({
          ActionMode: "GetRecordById",
          PaymentId:  id,
        }),
      });
      if (Array.isArray(res) && res.length > 0) {
        const d = res[0];
        setModalData(d);
        setRemark(d.ApprovedRemark || "");
        setAction("Approved");
      }
    } catch {
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSubmit() {
    if (!remark.trim()) {
      Swal.fire({ icon: "warning", title: "Required", text: "Please enter a remark.", confirmButtonColor: "#2563eb" });
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await universalService({
        procName: "MemberChequeVerification",
        Para: JSON.stringify({
          ActionMode:      "Update",
          PaymentId:       selectedId,
          ChequeStatus:    action,
          ApprovedRemark:  remark,
        }),
      });
      const d = Array.isArray(res) && res[0];
      if (d && String(d.StatusCode) === "1") {
        Swal.fire({ icon: "success", title: "Success", text: d.msg || "Updated successfully.", confirmButtonColor: "#2563eb" });
        setModalOpen(false);
        handleSearch();
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: (d && d.msg) || "Something went wrong.", confirmButtonColor: "#2563eb" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Request failed.", confirmButtonColor: "#2563eb" });
    } finally {
      setSubmitLoading(false);
    }
  }

  const isReadOnly =
    modalData &&
    (modalData.ChequeStatus === "Approved" || modalData.ChequeStatus === "Rejected");

  const Spinner = ({ size = "h-3.5 w-3.5" }) => (
    <svg className={`animate-spin ${size}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
      {/* Page Header */}
      <div className="trezo-card-header mb-[20px] sm:flex items-center justify-between pb-5 border-b border-gray-200 dark:border-gray-700 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">Member Payment Verification</h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Verify member cheque payment requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <i className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-gray-400">
                expand_more
              </i>
            </div>
          </div>
          <div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="h-[34px] px-5 text-xs font-medium rounded-md text-white bg-primary-button-bg hover:bg-button-bg-hover disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {loading ? <Spinner /> : <i className="material-symbols-outlined text-[15px]">search</i>}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {["#", "Member", "Cheque No.", "Date", "Amount", "Status", "Remark", "Actions"].map(h => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide py-2 px-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                    <Spinner size="h-5 w-5" />
                    <span className="text-xs">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <i className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">inbox</i>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    No records found. Try changing filters.
                  </p>
                </td>
              </tr>
            ) : (
              records.map((row, i) => {
                const meta = STATUS_META[row.ChequeStatus] || STATUS_META["Pending"];
                return (
                  <tr
                    key={row.PaymentId ?? i}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111c34] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {row.UserName || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">{row.ChequeNo || "-"}</td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {row.EntryDate || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                      {row.Amount != null ? `₹${Number(row.Amount).toLocaleString("en-IN")}` : "-"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${meta.cls}`}
                      >
                        <i className="material-symbols-outlined text-[12px]">{meta.icon}</i>
                        {row.ChequeStatus || "Pending"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate">
                      {row.ApprovedRemark || "-"}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openModal(row.PaymentId)}
                        className="h-[28px] px-3 text-[11px] font-medium rounded border border-primary-button-bg text-primary-button-bg hover:bg-primary-button-bg hover:text-white transition-colors whitespace-nowrap"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Verify Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#0c1427] rounded-md shadow-xl overflow-hidden"
            style={{ animation: "fadeInScale .2s ease" }}
          >
            {/* Modal Header */}
            <div className="bg-primary-button-bg px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="material-symbols-outlined text-white text-[20px]">verified</i>
                <h6 className="!mb-0 text-white font-semibold text-sm">Verify Member Cheque Request</h6>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <i className="material-symbols-outlined text-[20px]">close</i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="h-6 w-6" />
                </div>
              ) : modalData ? (
                <div className="space-y-3">
                  {[
                    { label: "Member Name",        value: modalData.UserName,     badge: false },
                    { label: "Cheque Number",       value: modalData.ChequeNo,     badge: false },
                    { label: "Request Date",        value: modalData.EntryDate,    badge: false },
                    { label: "Verification Status", value: modalData.ChequeStatus, badge: true  },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-40 shrink-0">{label}:</span>
                      {badge ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                            (STATUS_META[value] || STATUS_META["Pending"]).cls
                          }`}
                        >
                          <i className="material-symbols-outlined text-[12px]">
                            {(STATUS_META[value] || STATUS_META["Pending"]).icon}
                          </i>
                          {value || "Pending"}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value || "-"}</span>
                      )}
                    </div>
                  ))}

                  {!isReadOnly && (
                    <>
                      <div className="pt-1">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Action</label>
                        <div className="relative">
                          <select value={action} onChange={e => setAction(e.target.value)} className={selectCls}>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <i className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-gray-400">
                            expand_more
                          </i>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Remark <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={remark}
                          onChange={e => setRemark(e.target.value)}
                          placeholder="Enter remark..."
                          className="w-full px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white outline-none focus:border-primary-button-bg resize-none transition-all"
                        />
                      </div>
                    </>
                  )}

                  {isReadOnly && modalData.ApprovedRemark && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Remark:</span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{modalData.ApprovedRemark}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">No data found.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="h-[34px] px-4 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111c34] transition-colors"
              >
                Close
              </button>
              {!isReadOnly && modalData && (
                <button
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="h-[34px] px-5 text-xs font-medium rounded-md text-white bg-primary-button-bg hover:bg-button-bg-hover disabled:opacity-60 transition-colors flex items-center gap-1.5"
                >
                  {submitLoading && <Spinner />}
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(.96); }
          to   { opacity: 1; transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}
