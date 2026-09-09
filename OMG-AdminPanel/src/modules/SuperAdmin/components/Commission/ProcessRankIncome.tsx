import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { PlayCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ApiService } from "../../../../services/ApiService";
import ColumnSelector from "../ColumnSelector/ColumnSelector";
import CustomPagination from "../../../../components/CommonFormElements/Pagination/CustomPagination";
import ExportButtons from "../../../../components/CommonFormElements/ExportButtons/ExportButtons";
import StatsCards from "../../../../components/CommonFormElements/StatsCard/StatsCards";
import OopsNoData from "../../../../components/CommonFormElements/DataNotFound/OopsNoData";
import TableSkeleton from "../Forms/TableSkeleton";
import customStyles from "../../../../components/CommonFormElements/DataTableComponents/CustomStyles";
import PermissionAwareTooltip from "../Tooltip/PermissionAwareTooltip";
import { SmartActions } from "../Security/SmartActionWithFormName";
import Loader from "../../common/Loader";
import AccessRestricted from "../../common/AccessRestricted";
import { useCurrency } from "../../context/CurrencyContext";
import LandingIllustration from "../../../../components/CommonFormElements/LandingIllustration/LandingIllustration";

/* ── Process Rank Income ──────────────────────────────────────────────
   Admin-triggered, on-demand batch job — evaluates every member's binary
   leg counts against Setting.RankMaster (Bronze..Diamond, 5-per-side) and
   promotes/credits Commission Wallet via USP_ProcessRankIncome. No date
   range: rank status is a running total, not period-scoped. ── */
const Template: React.FC = () => {
  const { universalService } = ApiService();
  const { currency } = useCurrency();
  const location = useLocation();
  const formName = location.pathname.split("/").pop();

  const [searchInput, setSearchInput] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [hasVisitedTable, setHasVisitedTable] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [columns, setColumns] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<any[]>([]);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [stats, setStats] = useState<any>({});
  const [tableLoading, setTableLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pending, setPending] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);

  const canExport = SmartActions.canExport(formName);

  const statsConfig = [
    { key: "TotalAchievers", title: "Total Achievers", icon: "military_tech" },
    { key: "TodayPromotions", title: "Today's Promotions", icon: "trending_up" },
    { key: "TotalRewardPaid", title: "Total Reward Paid", icon: "account_balance_wallet", showCurrency: true },
    { key: "ThisMonthReward", title: "This Month Reward", icon: "calendar_month", showCurrency: true },
  ];

  /* ── Permissions ── */
  const fetchFormPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;

      const payload = {
        procName: "AssignForm",
        Para: JSON.stringify({
          ActionMode: "GetForms",
          FormName: formName,
          EmployeeId: employeeId,
        }),
      };
      const response = await universalService(payload);
      const data = response?.data ?? response;

      if (!Array.isArray(data)) {
        setHasPageAccess(false);
        return;
      }

      const pagePermission = data.find(
        (p: any) =>
          String(p.FormNameWithExt).trim().toLowerCase() ===
          formName?.trim().toLowerCase(),
      );

      if (!pagePermission || !pagePermission.Action || pagePermission.Action.trim() === "") {
        setHasPageAccess(false);
        return;
      }

      SmartActions.load(data);
      setHasPageAccess(true);
    } catch (error) {
      console.error("Form permission fetch failed:", error);
      setHasPageAccess(false);
    } finally {
      setPermissionsLoading(false);
    }
  };

  /* ── Dynamic grid columns ── */
  const fetchGridColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    try {
      const payload = {
        procName: "GetUserGridColumns",
        Para: JSON.stringify({
          UserId: employeeId,
          GridName: "USP_ProcessRankIncome",
        }),
      };
      const res = await universalService(payload);
      const data = res?.data || res;

      if (!Array.isArray(data)) {
        setColumns([]);
        return;
      }

      const reactCols = data
        .filter((c: any) => c.IsVisible === true)
        .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder)
        .map((c: any, index: number) => ({
          id: index + 1,
          name: c.DisplayName,
          sortable: false,
          columnKey: c.ColumnKey,
          isCurrency: c.IsCurrency,
          isTotal: c.IsTotal,
          selector: (row: any) => row[c.ColumnKey],
          cell: (row: any) => {
            const value = row[c.ColumnKey];
            if (c.ColumnKey === "EntryDate" && value) {
              return format(new Date(value), "dd MMM yyyy, hh:mm a");
            }
            if (c.IsCurrency && value != null) {
              return `${currency.symbol}${Number(value).toLocaleString()}`;
            }
            return value ?? "-";
          },
        }));

      setColumns(reactCols);
    } catch (err) {
      console.error("Grid columns fetch failed", err);
      setColumns([]);
    }
  };

  const fetchVisibleColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    const payload = {
      procName: "UniversalColumnSelector",
      Para: JSON.stringify({
        EmployeeId: employeeId,
        USPName: "USP_ProcessRankIncome",
        ActionMode: "List",
        Mode: "Get",
      }),
    };
    const response = await universalService(payload);
    const cols = response?.data ?? response;
    if (Array.isArray(cols)) {
      setVisibleColumns(
        cols
          .map((c: any) => ({
            ...c,
            IsVisible: c.IsVisible === true || c.IsVisible === 1 || c.IsVisible === "1",
            IsHidden: c.IsHidden === false || c.IsHidden === 0 || c.IsHidden === "0",
          }))
          .sort((a: any, b: any) => a.DisplayOrder - b.DisplayOrder),
      );
      setRefreshGrid((prev) => prev + 1);
    }
  };

  const exportColumns = columns
    .filter((c) => c.columnKey)
    .map((c) => ({ key: c.columnKey, label: c.name }));

  /* ── Data ── */
  const fetchStats = async () => {
    const payload = {
      procName: "ProcessRankIncome",
      Para: JSON.stringify({ ActionMode: "GetStats" }),
    };
    const res = await universalService(payload);
    const result = res?.data ?? res ?? [];
    setStats(Array.isArray(result) ? result[0] || {} : result);
  };

  const fetchGridData = async (options?: {
    pageOverride?: number;
    perPageOverride?: number;
    criteria?: string;
  }) => {
    const pageToUse = options?.pageOverride ?? page;
    const perPageToUse = options?.perPageOverride ?? perPage;

    try {
      setTableLoading(true);
      const payload = {
        procName: "ProcessRankIncome",
        Para: JSON.stringify({
          ActionMode: "GetReport",
          Criteria: options?.criteria ?? searchInput ?? "",
          Page: pageToUse,
          PageSize: perPageToUse,
        }),
      };
      const res = await universalService(payload);
      const result = res?.data ?? res;

      if (Array.isArray(result)) {
        setData(result);
        setTotalRows(result[0]?.TotalRecords || 0);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchExportData = async () => {
    const payload = {
      procName: "ProcessRankIncome",
      Para: JSON.stringify({
        ActionMode: "GetReport",
        Criteria: searchInput,
        Page: 1,
        PageSize: 0,
      }),
    };
    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  };

  /* ── Eligible-but-not-yet-processed members: a read-only preview of who
     the next "Process Rank Income" run would promote. ── */
  const fetchPending = async () => {
    try {
      setPendingLoading(true);
      const payload = {
        procName: "ProcessRankIncome",
        Para: JSON.stringify({ ActionMode: "GetPending" }),
      };
      const res = await universalService(payload);
      const result = res?.data ?? res;
      setPending(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Pending fetch failed", err);
      setPending([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchFormPermissions();
  }, []);

  useEffect(() => {
    fetchGridColumns();
    fetchStats();
    fetchPending();
  }, [refreshGrid]);

  useEffect(() => {
    if (!showTable || !hasVisitedTable) return;
    fetchGridData();
  }, [page, perPage, searchTrigger]);

  const applySearch = () => {
    if (!SmartActions.canSearch(formName)) return;
    setShowTable(true);
    setHasVisitedTable(true);
    setPage(1);
    setSearchTrigger((p) => p + 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchGridData({ pageOverride: p });
  };

  const handlePerRowsChange = (newPerPage: number, p: number) => {
    setPerPage(newPerPage);
    setPage(p);
    fetchGridData({ pageOverride: p, perPageOverride: newPerPage });
  };

  const handleProcessRankIncome = async () => {
    const confirmResult = await Swal.fire({
      title: "Process Rank Income?",
      html: `Ye har member ke binary leg counts check karega aur jo Bronze/Silver/Gold/Platinum/Diamond ke <b>5+5</b> criteria pura karte hain unhe promote karke Commission Wallet mein reward credit karega. Continue?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Process it!",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setProcessing(true);
      const payload = {
        procName: "ProcessRankIncome",
        Para: JSON.stringify({
          ActionMode: "ProcessIncome",
          ProcessBy: localStorage.getItem("CompanyId"),
        }),
      };
      const response = await universalService(payload);
      const res = Array.isArray(response) ? response[0] : response;

      if (res?.StatusCode === 1) {
        await Swal.fire({
          title: "Success!",
          text: res?.Msg || "Rank Income processed successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        fetchStats();
        fetchPending();
        setShowTable(true);
        setHasVisitedTable(true);
        setPage(1);
        fetchGridData({ pageOverride: 1 });
      } else {
        Swal.fire({ title: "Error", text: res?.Msg || "Something went wrong", icon: "error" });
      }
    } catch (error) {
      console.error("Process Rank Income Error:", error);
      Swal.fire({ title: "Error", text: "Server error while processing Rank Income.", icon: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const hasData = data.length > 0;

  if (permissionsLoading) {
    return <Loader />;
  }

  if (!hasPageAccess) {
    return <AccessRestricted />;
  }

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[10px] md:mb-[10px] sm:flex items-center justify-between pb-5 border-b border-gray-200 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">
            Process Rank Income
          </h5>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:w-auto w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-end">
            {/* SEARCH */}
            <div className="relative">
              <PermissionAwareTooltip
                allowed={SmartActions.canSearch(formName)}
                allowedText="Enter Criteria"
              >
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-500">
                  <i className="material-symbols-outlined !text-[18px]">search</i>
                </span>
                <input
                  type="text"
                  value={searchInput}
                  placeholder="Search Username / Name..."
                  disabled={!SmartActions.canSearch(formName)}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  className={`h-[34px] w-full pl-8 pr-3 text-xs rounded-md outline-none border transition-all
                           ${
                             SmartActions.canSearch(formName)
                               ? "bg-white text-black border-gray-300 focus:border-primary-button-bg"
                               : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                           }`}
                />
              </PermissionAwareTooltip>
            </div>

            <div className="flex items-center gap-2">
              <PermissionAwareTooltip allowed={SmartActions.canSearch(formName)} allowedText="Search">
                <button
                  type="button"
                  onClick={applySearch}
                  disabled={!SmartActions.canSearch(formName)}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-md border border-primary-button-bg text-primary-button-bg hover:bg-primary-button-bg hover:text-white transition-all shadow-sm disabled:opacity-50"
                >
                  <i className="material-symbols-outlined text-[20px]">search</i>
                </button>
              </PermissionAwareTooltip>

              <PermissionAwareTooltip
                allowed={SmartActions.canManageColumns(formName)}
                allowedText="Manage Columns"
              >
                <div
                  className={`h-[34px] flex items-center ${
                    !SmartActions.canManageColumns(formName) ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <ColumnSelector procName="USP_ProcessRankIncome" onApply={fetchVisibleColumns} />
                </div>
              </PermissionAwareTooltip>
            </div>

            {searchInput && (
              <PermissionAwareTooltip allowed={SmartActions.canSearch(formName)} allowedText="Reset filter">
                <button
                  type="button"
                  disabled={!SmartActions.canSearch(formName)}
                  onClick={() => {
                    setSearchInput("");
                    setPage(1);
                    setSearchTrigger((p) => p + 1);
                  }}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-md border border-gray-400 text-gray-600 hover:bg-gray-200"
                >
                  <i className="material-symbols-outlined text-[20px]">refresh</i>
                </button>
              </PermissionAwareTooltip>
            )}

            <PermissionAwareTooltip allowed={SmartActions.canAdd(formName)} allowedText="Process Rank Income">
              <button
                type="button"
                onClick={handleProcessRankIncome}
                disabled={processing || !SmartActions.canAdd(formName)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-button-bg text-white text-sm font-semibold shadow-sm hover:bg-white hover:text-primary-button-bg border border-primary-button-bg hover:border-primary-button-bg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-button-bg/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="theme-loader"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Process Rank Income</span>
                  </>
                )}
              </button>
            </PermissionAwareTooltip>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} config={statsConfig} loading={tableLoading} />

      {/* ── Eligible for Promotion (read-only preview, not yet processed) ── */}
      <div className="trezo-card-content bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-[20px]">
        <div className="px-[20px] py-[14px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h6 className="!mb-0 font-semibold text-black dark:text-white">
            Eligible for Promotion
          </h6>
          {!pendingLoading && pending.length > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
              {pending.length} waiting
            </span>
          )}
        </div>

        {pendingLoading ? (
          <div className="px-[20px] py-[20px] text-sm text-gray-500">Checking eligibility...</div>
        ) : pending.length === 0 ? (
          <div className="px-[20px] py-[20px] text-sm text-gray-500">
            No members currently qualify for a new rank.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#15203c]">
                  <th className="px-[20px] py-[10px] font-medium">Member</th>
                  <th className="px-[20px] py-[10px] font-medium">Rank</th>
                  <th className="px-[20px] py-[10px] font-medium">Left Team</th>
                  <th className="px-[20px] py-[10px] font-medium">Right Team</th>
                  <th className="px-[20px] py-[10px] font-medium">Reward</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row: any, idx: number) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-[20px] py-[10px]">
                      {row.ClientName} <span className="text-gray-400">| {row.UserName}</span>
                    </td>
                    <td className="px-[20px] py-[10px] font-semibold">{row.RankName}</td>
                    <td className="px-[20px] py-[10px] text-green-600 font-semibold">{row.LeftCount}</td>
                    <td className="px-[20px] py-[10px] text-green-600 font-semibold">{row.RightCount}</td>
                    <td className="px-[20px] py-[10px]">
                      {currency.symbol}{Number(row.RewardAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!showTable && (
        <LandingIllustration
          title="Process Rank Income"
          formName={formName}
          addLabel="Process Rank Income"
          description={
            <>
              Search rank promotion history using filters above.
              <br />
              Or click "Process Rank Income" to run the promotion job.
            </>
          }
        />
      )}

      {showTable && (
        <div>
          {!tableLoading && hasData && (
            <div className="flex justify-between items-center py-2 mb-[10px]">
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setPerPage(size);
                    setPage(1);
                    fetchGridData({ pageOverride: 1, perPageOverride: size });
                  }}
                  className="h-8 w-[120px] px-3 pr-7 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all appearance-none"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>
              </div>

              <PermissionAwareTooltip allowed={canExport}>
                <div className={!canExport ? "pointer-events-none opacity-50" : ""}>
                  <ExportButtons
                    title="Rank Income Report"
                    columns={exportColumns}
                    fetchData={fetchExportData}
                    disabled={!canExport}
                  />
                </div>
              </PermissionAwareTooltip>
            </div>
          )}

          <div className="trezo-card-content bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <DataTable
              title=""
              columns={columns}
              data={data}
              customStyles={customStyles}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationComponent={(props: any) => (
                <CustomPagination {...props} currentPage={page} rowsPerPage={perPage} />
              )}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              progressPending={tableLoading}
              progressComponent={<TableSkeleton rows={perPage} columns={columns.length || 8} />}
              noDataComponent={!tableLoading && <OopsNoData />}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Template;
