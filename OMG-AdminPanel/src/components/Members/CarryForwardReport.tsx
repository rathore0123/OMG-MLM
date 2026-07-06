import React, { useState, useEffect, useCallback } from "react";
import { plainUniversalService } from "../../services/plainApi";

interface CarryRow {
  ClientId: number;
  ClientName: string;
  UserName: string;
  PaidStatus: string;
  IsBlocked: string;
  MemberStatus: string;
  LeftCurrentBV: number;
  LeftCarryForward: number;
  RightCurrentBV: number;
  RightCarryForward: number;
  TotalCurrentBV: number;
  TotalCarryForward: number;
  BinarySponsorIncome: number;
  LastUpdated: string | null;
  TotalRecords?: number;
}

const TD = "ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l text-gray-500 dark:text-gray-400 text-sm";
const TH = "font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-gray-50 dark:bg-[#15203c] whitespace-nowrap text-sm";

const CarryForwardReport: React.FC = () => {
  const [rows, setRows] = useState<CarryRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState("");
  const [onlyWithBalance, setOnlyWithBalance] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async (overridePage = page) => {
    setLoading(true);
    try {
      const res = await plainUniversalService({
        procName: "GetCarryForwardReport",
        Para: JSON.stringify({
          Criteria: search || null,
          OnlyWithBalance: onlyWithBalance ? 1 : 0,
          Page: overridePage,
          PageSize: perPage,
        }),
      });
      const result = (res?.data ?? res) as CarryRow[];
      if (Array.isArray(result) && result.length > 0) {
        setRows(result);
        setTotalRows(Number(result[0]?.TotalRecords ?? result.length));
      } else {
        setRows([]);
        setTotalRows(0);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, onlyWithBalance]);

  useEffect(() => { fetchReport(1); setPage(1); }, [onlyWithBalance]);

  const handleSearch = () => { setPage(1); fetchReport(1); };

  const totalPages = Math.ceil(totalRows / perPage);

  const fmt = (n: number) => Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statusBadge = (row: CarryRow) => {
    if (row.IsBlocked === "Y")
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Suspended</span>;
    if (row.PaidStatus === "Paid")
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Unpaid</span>;
  };

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      {/* Header */}
      <div className="trezo-card-header mb-[20px] md:mb-[25px] flex flex-wrap items-center gap-3">
        <h5 className="!mb-0">Carry-Forward BV Report</h5>

        <div className="flex flex-wrap gap-3 ml-auto items-center">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-primary-500"
              checked={onlyWithBalance}
              onChange={(e) => setOnlyWithBalance(e.target.checked)}
            />
            <span>With balance only</span>
          </label>

          <form
            className="relative sm:w-[220px]"
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          >
            <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
              <i className="material-symbols-outlined !text-[20px]">search</i>
            </label>
            <input
              type="text"
              placeholder="Search member…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c]"
            />
          </form>

          <button
            onClick={handleSearch}
            className="h-[36px] px-4 text-xs rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="trezo-card-content">
        <div className="table-responsive overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No data found.</div>
          ) : (
            <table className="w-full">
              <thead className="text-black dark:text-white">
                <tr>
                  {["#", "Member", "Status", "Left BV", "Left C/F", "Right BV", "Right C/F", "Total BV", "Total C/F", "Binary Earned", "Last Updated"].map((h, i) => (
                    <th key={i} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-black dark:text-white">
                {rows.map((row, i) => (
                  <tr key={row.ClientId}>
                    <td className={TD}>{(page - 1) * perPage + i + 1}</td>
                    <td className={TD}>
                      <div>
                        <span className="block font-medium text-black dark:text-white text-sm">{row.ClientName}</span>
                        <span className="text-xs text-gray-400">@{row.UserName}</span>
                      </div>
                    </td>
                    <td className={TD}>{statusBadge(row)}</td>
                    <td className={TD}>
                      <span className="text-indigo-500 font-medium">{fmt(row.LeftCurrentBV)}</span>
                    </td>
                    <td className={TD}>
                      <span className="text-amber-500 font-medium">{fmt(row.LeftCarryForward)}</span>
                    </td>
                    <td className={TD}>
                      <span className="text-indigo-500 font-medium">{fmt(row.RightCurrentBV)}</span>
                    </td>
                    <td className={TD}>
                      <span className="text-amber-500 font-medium">{fmt(row.RightCarryForward)}</span>
                    </td>
                    <td className={TD}>
                      <span className="text-green-500 font-semibold">{fmt(row.TotalCurrentBV)}</span>
                    </td>
                    <td className={TD}>
                      <span className="text-orange-500 font-semibold">{fmt(row.TotalCarryForward)}</span>
                    </td>
                    <td className={TD}>
                      <span className="text-blue-500 font-semibold">₹{fmt(row.BinarySponsorIncome)}</span>
                    </td>
                    <td className={TD}>
                      {row.LastUpdated
                        ? new Date(row.LastUpdated).toLocaleString("en-IN")
                        : "—"}
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
            {totalRows} records — Page {page} of {totalPages || 1}
          </p>
          <ol className="mt-[10px] sm:mt-0 flex gap-1">
            <li>
              <button
                onClick={() => { const p = page - 1; setPage(p); fetchReport(p); }}
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
                onClick={() => { const p = page + 1; setPage(p); fetchReport(p); }}
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
  );
};

export default CarryForwardReport;
