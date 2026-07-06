import React, { useState, useEffect, useCallback } from "react";
import { plainUniversalService } from "../../services/plainApi";

interface Member {
  ClientId: number;
  UserName: string;
  ClientName: string;
  EmailId: string;
  ContactNo: string;
  PaidStatus: string;
  MemberStatus: string;
  IsBlocked: string;
  RegistrationDate: string;
  ActivatedOn: string | null;
  SponsorUsername: string;
  TotalRecords?: number;
}

interface BVStats {
  ClientName: string;
  UserName: string;
  PaidStatus: string;
  MemberStatus: string;
  ActiveCurrentBV: number;
  ActiveCarryForward: number;
  TotalActiveBV: number;
  TotalCurrentBV: number;
  TotalCarryForward: number;
  BinaryIncomeEarned: number;
  TotalDirectReferrals: number;
  ActiveDirectReferrals: number;
  DirectLeftCount: number;
  DirectRightCount: number;
}

const TD = "ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l text-gray-500 dark:text-gray-400 text-sm";
const TH = "font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap text-sm";

const MembersTable: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [bvModal, setBvModal] = useState(false);
  const [bvStats, setBvStats] = useState<BVStats | null>(null);
  const [bvLoading, setBvLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    type: "activate" | "suspend";
    member: Member;
    remarks: string;
  } | null>(null);

  const adminId = parseInt(localStorage.getItem("EmployeeId") || "1");

  const fetchMembers = useCallback(async (overridePage = page) => {
    setLoading(true);
    try {
      const res = await plainUniversalService({
        procName: "ActiveInactiveMembers",
        Para: JSON.stringify({
          ActionMode: "GetReport",
          Criteria: search,
          PaidStatus: statusFilter === "All" ? null : statusFilter,
          Page: overridePage,
          PageSize: perPage,
        }),
      });
      const result = (res?.data ?? res) as Member[];
      if (Array.isArray(result) && result.length > 0) {
        setMembers(result);
        setTotalRows(Number(result[0]?.TotalRecords ?? result.length));
      } else {
        setMembers([]);
        setTotalRows(0);
      }
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter]);

  useEffect(() => { fetchMembers(1); setPage(1); }, [statusFilter]);

  const handleSearch = () => { setPage(1); fetchMembers(1); };

  const handleActivate = async () => {
    if (!confirmModal) return;
    setActionLoading(confirmModal.member.ClientId);
    try {
      const res = await plainUniversalService({
        procName: "AdminActivateMember",
        Para: JSON.stringify({
          ClientId: confirmModal.member.ClientId,
          AdminId: adminId,
          MembershipFee: 1699,
          Remarks: confirmModal.remarks,
        }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row?.StatusCode == 1 || row?.StatusCode === "1") {
        alert(`✅ ${row?.Msg || "Member activated successfully!"}`);
        fetchMembers(page);
      } else {
        alert(`❌ ${row?.Msg || "Activation failed."}`);
      }
    } catch {
      alert("❌ Error activating member.");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleSuspend = async () => {
    if (!confirmModal) return;
    setActionLoading(confirmModal.member.ClientId);
    try {
      const res = await plainUniversalService({
        procName: "AdminSuspendMember",
        Para: JSON.stringify({
          ClientId: confirmModal.member.ClientId,
          AdminId: adminId,
          Remarks: confirmModal.remarks,
        }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row?.StatusCode == 1 || row?.StatusCode === "1") {
        alert(`✅ ${row?.Msg || "Member suspended."}`);
        fetchMembers(page);
      } else {
        alert(`❌ ${row?.Msg || "Suspend failed."}`);
      }
    } catch {
      alert("❌ Error suspending member.");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const openBvModal = async (clientId: number) => {
    setBvModal(true);
    setBvStats(null);
    setBvLoading(true);
    try {
      const res = await plainUniversalService({
        procName: "GetMemberBVStats",
        Para: JSON.stringify({ ClientId: clientId }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      setBvStats(row || null);
    } catch {
      setBvStats(null);
    } finally {
      setBvLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRows / perPage);

  const statusBadge = (m: Member) => {
    if (m.IsBlocked === "Y")
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Suspended</span>;
    if (m.PaidStatus === "Paid")
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Unpaid</span>;
  };

  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        {/* Header */}
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex flex-wrap items-center gap-3">
          <form
            className="relative sm:w-[265px]"
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          >
            <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
              <i className="material-symbols-outlined !text-[20px]">search</i>
            </label>
            <input
              type="text"
              placeholder="Search by name / username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c]"
            />
          </form>

          <select
            className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md px-3 text-black dark:bg-[#15203c] dark:text-white dark:border-[#15203c] outline-0"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Paid">Active</option>
            <option value="UnPaid">Unpaid</option>
          </select>

          <button
            onClick={handleSearch}
            className="h-[36px] px-4 text-xs rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-all"
          >
            Search
          </button>

          <span className="text-xs text-gray-400 ml-auto">
            {totalRows} members found
          </span>
        </div>

        {/* Table */}
        <div className="trezo-card-content">
          <div className="table-responsive overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
            ) : members.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No members found.</div>
            ) : (
              <table className="w-full">
                <thead className="text-black dark:text-white">
                  <tr>
                    {["#", "Member", "Username", "Contact", "Sponsor", "Reg. Date", "Status", "Action"].map((h, i) => (
                      <th key={i} className={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-black dark:text-white">
                  {members.map((m, i) => (
                    <tr key={m.ClientId}>
                      <td className={TD}>{(page - 1) * perPage + i + 1}</td>
                      <td className={TD}>
                        <div>
                          <span className="block font-medium text-black dark:text-white text-sm">{m.ClientName}</span>
                          <span className="text-xs text-gray-400">{m.EmailId}</span>
                        </div>
                      </td>
                      <td className={TD}>{m.UserName}</td>
                      <td className={TD}>{m.ContactNo || "—"}</td>
                      <td className={TD}>{m.SponsorUsername || "—"}</td>
                      <td className={TD}>
                        {m.RegistrationDate
                          ? new Date(m.RegistrationDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      <td className={TD}>{statusBadge(m)}</td>
                      <td className={TD}>
                        <div className="flex items-center gap-[8px]">
                          {/* BV Stats */}
                          <button
                            type="button"
                            title="View BV Stats"
                            className="text-primary-500 leading-none"
                            onClick={() => openBvModal(m.ClientId)}
                          >
                            <i className="material-symbols-outlined !text-[18px]">bar_chart</i>
                          </button>

                          {/* Activate — only for Unpaid non-blocked */}
                          {m.PaidStatus !== "Paid" && m.IsBlocked !== "Y" && (
                            <button
                              type="button"
                              title="Activate Member"
                              className="text-green-500 leading-none disabled:opacity-40"
                              disabled={actionLoading === m.ClientId}
                              onClick={() => setConfirmModal({ type: "activate", member: m, remarks: "" })}
                            >
                              <i className="material-symbols-outlined !text-[18px]">verified</i>
                            </button>
                          )}

                          {/* Suspend — only for Active */}
                          {m.PaidStatus === "Paid" && m.IsBlocked !== "Y" && (
                            <button
                              type="button"
                              title="Suspend Member"
                              className="text-red-500 leading-none disabled:opacity-40"
                              disabled={actionLoading === m.ClientId}
                              onClick={() => setConfirmModal({ type: "suspend", member: m, remarks: "" })}
                            >
                              <i className="material-symbols-outlined !text-[18px]">block</i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="px-[20px] py-[12px] rounded-b-md border-l border-r border-b border-gray-100 dark:border-[#172036] sm:flex sm:items-center justify-between">
            <p className="!mb-0 !text-sm">
              Page {page} of {totalPages || 1}
            </p>
            <ol className="mt-[10px] sm:mt-0 flex gap-1">
              <li>
                <button
                  onClick={() => { const p = page - 1; setPage(p); fetchMembers(p); }}
                  disabled={page === 1}
                  className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2 !text-sm">chevron_left</i>
                </button>
              </li>
              <li>
                <span className="w-[31px] h-[31px] flex items-center justify-center rounded-md border border-primary-500 bg-primary-500 text-white text-sm">
                  {page}
                </span>
              </li>
              <li>
                <button
                  onClick={() => { const p = page + 1; setPage(p); fetchMembers(p); }}
                  disabled={page >= totalPages}
                  className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2 !text-sm">chevron_right</i>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── Confirm Modal (Activate / Suspend) ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 w-[400px] max-w-[90vw] shadow-2xl">
            <h5 className="text-lg font-semibold mb-1">
              {confirmModal.type === "activate" ? "✅ Activate Member" : "🚫 Suspend Member"}
            </h5>
            <p className="text-sm text-gray-500 mb-4">
              {confirmModal.type === "activate"
                ? `Activate ${confirmModal.member.ClientName}? Membership fee of ₹1,699 will be recorded.`
                : `Suspend ${confirmModal.member.ClientName}? Their active BV will be removed from ancestor trees.`}
            </p>

            <label className="text-xs text-gray-500 block mb-1">Remarks (optional)</label>
            <textarea
              rows={2}
              className="w-full text-sm border border-gray-200 dark:border-[#172036] rounded p-2 bg-gray-50 dark:bg-[#15203c] dark:text-white outline-0 resize-none mb-4"
              placeholder="Enter reason…"
              value={confirmModal.remarks}
              onChange={(e) => setConfirmModal((prev) => prev ? { ...prev, remarks: e.target.value } : prev)}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm rounded-md border border-gray-200 dark:border-[#172036] hover:bg-gray-50 dark:hover:bg-[#15203c] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.type === "activate" ? handleActivate : handleSuspend}
                disabled={actionLoading !== null}
                className={`px-4 py-2 text-sm rounded-md text-white transition-all disabled:opacity-50 ${
                  confirmModal.type === "activate"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading !== null
                  ? "Processing…"
                  : confirmModal.type === "activate"
                  ? "Activate"
                  : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BV Stats Modal ── */}
      {bvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 w-[520px] max-w-[95vw] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold">📊 Member BV Stats</h5>
              <button onClick={() => setBvModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="material-symbols-outlined">close</i>
              </button>
            </div>

            {bvLoading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Loading stats…</div>
            ) : !bvStats ? (
              <div className="py-8 text-center text-gray-400 text-sm">No data available.</div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-[#172036]">
                  <div>
                    <p className="font-semibold text-sm">{bvStats.ClientName}</p>
                    <p className="text-xs text-gray-400">@{bvStats.UserName}</p>
                  </div>
                  <span
                    className="ml-auto px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: bvStats.PaidStatus === "Paid" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: bvStats.PaidStatus === "Paid" ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {bvStats.MemberStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Active BV (Current)", value: Number(bvStats.ActiveCurrentBV ?? 0).toLocaleString(), color: "#6366f1" },
                    { label: "Active Carry-Forward", value: Number(bvStats.ActiveCarryForward ?? 0).toLocaleString(), color: "#f59e0b" },
                    { label: "Total Active BV", value: Number(bvStats.TotalActiveBV ?? 0).toLocaleString(), color: "#22c55e" },
                    { label: "Total BV (incl. unpaid)", value: Number(bvStats.TotalCurrentBV ?? 0).toLocaleString(), color: "#94a3b8" },
                    { label: "Binary Income Earned", value: `₹${Number(bvStats.BinaryIncomeEarned ?? 0).toLocaleString()}`, color: "#3b82f6" },
                    { label: "Direct Referrals", value: `${bvStats.ActiveDirectReferrals ?? 0} / ${bvStats.TotalDirectReferrals ?? 0}`, color: "#8b5cf6" },
                    { label: "Left Direct Children", value: String(bvStats.DirectLeftCount ?? 0), color: "#0ea5e9" },
                    { label: "Right Direct Children", value: String(bvStats.DirectRightCount ?? 0), color: "#10b981" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg"
                      style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
                    >
                      <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                      <div className="text-base font-bold" style={{ color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setBvModal(false)}
                  className="w-full py-2 text-sm rounded-md border border-gray-200 dark:border-[#172036] hover:bg-gray-50 dark:hover:bg-[#15203c] transition-all"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MembersTable;
