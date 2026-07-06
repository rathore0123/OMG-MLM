import React, { useState, useEffect } from "react";
import { ApiService } from "../../../../../services/ApiService";
import DataTable from "react-data-table-component";
import ColumnSelector from "../../ColumnSelector/ColumnSelector";
import CustomPagination from "../../../../../components/CommonFormElements/Pagination/CustomPagination";
import ExportButtons from "../../../../../components/CommonFormElements/ExportButtons/ExportButtons";
import OopsNoData from "../../../../../components/CommonFormElements/DataNotFound/OopsNoData";
import TableSkeleton from "../../Forms/TableSkeleton";
import customStyles from "../../../../../components/CommonFormElements/DataTableComponents/CustomStyles";
import PermissionAwareTooltip from "../../Tooltip/PermissionAwareTooltip";
import { SmartActions } from "../../Security/SmartActionWithFormName";
import { useLocation } from "react-router-dom";
import Loader from "../../../common/Loader";
import AccessRestricted from "../../../common/AccessRestricted";
import ActionCell from "../../../../../components/CommonFormElements/DataTableComponents/ActionCell";
import LandingIllustration from "../../../../../components/CommonFormElements/LandingIllustration/LandingIllustration";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { PostService } from "../../../../../services/PostService";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { format } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_META = {
  Available: {
    cls: "bg-green-100 text-green-700 border-green-200",
    icon: "check_circle",
    badge: "success",
  },
  Booked: {
    cls: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "home",
    badge: "danger",
  },
  Alloted: {
    cls: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "key",
    badge: "info",
  },
  Hold: {
    cls: "bg-red-100 text-red-700 border-red-200",
    icon: "pause_circle",
    badge: "warning",
  },
  "Registry Done": {
    cls: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: "task_alt",
    badge: "success",
  },
};

const getStatusMeta = (s: string) =>
  STATUS_META[s as keyof typeof STATUS_META] ?? {
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "circle",
    badge: "secondary",
  };

const inputCls =
  "h-[34px] px-3 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg transition-all";

const selectCls =
  "h-[34px] pl-3 pr-8 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg appearance-none transition-all";

const FieldLabel = ({ label, required, children }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const PlotDetails = () => {
  const { universalService } = ApiService();
  const { postDocument } = PostService();
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const isId = !isNaN(Number(last));
  const formName = isId ? segments[segments.length - 2] : last;

  // ── State ─────────────────────────────────────────────────────────────────────
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [hasVisitedTable, setHasVisitedTable] = useState(false);

  // Filter dropdowns
  const [projects, setProjects] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Available");

  // Table state
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortColumnKey, setSortColumnKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [columns, setColumns] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<any[]>([]);
  const [columnsReady, setColumnsReady] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [initialSortReady, setInitialSortReady] = useState(false);

  // Hold modal
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdPlotId, setHoldPlotId] = useState(null);
  const [holdPlotNo, setHoldPlotNo] = useState("");
  const [holdDescription, setHoldDescription] = useState("");
  const [holdSaving, setHoldSaving] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelPlotId, setCancelPlotId] = useState(null);
  const [cancelPlotNo, setCancelPlotNo] = useState("");
  const [cancelRemark, setCancelRemark] = useState("");
  const [cancelSaving, setCancelSaving] = useState(false);

  const canExport = SmartActions.canExport(formName);
  const procedure = "PlotReport";
  const pageTitle = "Plot Details";
  const title = "Plot Details";
  const hasData = data.length > 0;

  // ── Permissions ──────────────────────────────────────────────────────────────
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
        (p) =>
          String(p.FormNameWithExt).trim().toLowerCase() ===
          formName?.trim().toLowerCase(),
      );
      if (
        !pagePermission ||
        !pagePermission.Action ||
        pagePermission.Action.trim() === ""
      ) {
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

  // ── Load Projects ────────────────────────────────────────────────────────────
  const loadProjects = async () => {
    try {
      const res = await universalService({
        procName: "PlotMaster",
        Para: JSON.stringify({ ActionMode: "Autocomplete" }),
      });
      const data = res?.data ?? res;
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
  };

  // ── Load Sectors ─────────────────────────────────────────────────────────────
  const loadSectors = async (projectId: string) => {
    setSectors([]);
    setBlocks([]);
    setSelectedSector("");
    setSelectedBlock("");
    if (!projectId) return;
    try {
      const res = await universalService({
        procName: "PlotMaster",
        Para: JSON.stringify({
          ProjectId: projectId,
          ActionMode: "AutoCompleteSectors",
        }),
      });
      const data = res?.data ?? res;
      setSectors(Array.isArray(data) ? data : []);
    } catch {
      setSectors([]);
    }
  };

  // ── Load Blocks ──────────────────────────────────────────────────────────────
  const loadBlocks = async (sectorId: string) => {
    setBlocks([]);
    setSelectedBlock("");
    if (!sectorId) return;
    try {
      const res = await universalService({
        procName: "PlotMaster",
        Para: JSON.stringify({
          SectorId: sectorId,
          ActionMode: "AutoCompleteBlockList",
        }),
      });
      const data = res?.data ?? res;
      setBlocks(Array.isArray(data) ? data : []);
    } catch {
      setBlocks([]);
    }
  };

  // ── Handle Filter Changes ────────────────────────────────────────────────────
  const handleProjectChange = (val: string) => {
    setSelectedProject(val);
    loadSectors(val);
    setData([]);
    setShowTable(false);
    setHasVisitedTable(false);
  };

  const handleSectorChange = (val: string) => {
    setSelectedSector(val);
    loadBlocks(val);
  };

  // ── Fetch Grid Columns ───────────────────────────────────────────────────────
  const fetchGridColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    try {
      const payload = {
        procName: "GetUserGridColumns",
        Para: JSON.stringify({
          UserId: employeeId,
          GridName: "USP_" + procedure,
        }),
      };
      const res = await universalService(payload);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        const visibleSorted = data
          .filter((c: any) => c.IsVisible)
          .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder);
        const defaultSortCol = visibleSorted.find((c: any) => c.isSort);
        if (defaultSortCol) {
          setSortColumnKey(defaultSortCol.ColumnKey);
          setSortDirection(
            (defaultSortCol.SortDir || "ASC").toUpperCase() === "DESC"
              ? "DESC"
              : "ASC",
          );
        }
        setInitialSortReady(true);
      }
      setInitialSortReady(true);
      if (Array.isArray(data)) {
        const reactCols = data
          .filter((c: any) => c.IsVisible === true)
          .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder)
          .map((c: any, colIndex: number) => ({
            id: c.ColumnOrder,
            name: c.DisplayName,
            sortable: true,
            columnKey: c.ColumnKey,
            columnIndex: c.ColumnOrder,
            isCurrency: c.IsCurrency,
            isTotal: c.IsTotal,
            selector: (row: any) => row[c.ColumnKey],
            cell: (row: any) => {
              if (row.__isTotal) {
                if (colIndex === 0) return "Total";
                if (c.IsTotal) {
                  const value = row[c.ColumnKey] || 0;
                  return c.IsCurrency
                    ? `₹${Number(value).toLocaleString()}`
                    : Number(value).toLocaleString();
                }
                return "";
              }
              const value = row[c.ColumnKey];

              // Handle PlotStatus with HTML badges
              if (c.ColumnKey === "PlotStatus") {
                if (typeof value === "string" && value.includes("<")) {
                  return <span dangerouslySetInnerHTML={{ __html: value }} />;
                }
                const meta = getStatusMeta(value);
                return (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.cls}`}
                  >
                    <i className="material-symbols-outlined text-[10px]">
                      {meta.icon}
                    </i>
                    {value || "Available"}
                  </span>
                );
              }

              // Handle Actions column
              // if (c.ColumnKey === "Actions") {
              //   if (typeof value === "string" && value.includes("<")) {
              //     console.log(value);

              //     return (
              //       <div
              //         dangerouslySetInnerHTML={{ __html: value }}
              //         onClick={(e) => {
              //           e.stopPropagation();
              //           // Extract plot data and open cancel modal
              //           const match = value.match(
              //             /onclick="CancelPlot\(this\)"/,
              //           );
              //           if (match && row.PlotId) {
              //             openCancelModal(row);
              //           }
              //         }}
              //       />
              //     );
              //   }
              //   // Custom action buttons
              //   const statusKey = row.PlotStatus ?? row.Status ?? "Available";
              //   const isAvailable = statusKey === "Available";
              //   const isHold = statusKey === "Hold";
              //   const isBooked =
              //     statusKey === "Booked" || statusKey === "Alloted";

              //   return (
              //     <div className="flex items-center gap-1.5">
              //       {isAvailable && (
              //         <button
              //           type="button"
              //           onClick={() => openHoldModal(row)}
              //           className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-all whitespace-nowrap"
              //         >
              //           <i className="material-symbols-outlined text-[12px]">
              //             pause_circle
              //           </i>
              //           Hold
              //         </button>
              //       )}
              //       {(isHold || isBooked) && (
              //         <button
              //           type="button"
              //           onClick={() => openCancelModal(row)}
              //           className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-all whitespace-nowrap"
              //         >
              //           <i className="material-symbols-outlined text-[12px]">
              //             cancel
              //           </i>
              //           Cancel
              //         </button>
              //       )}
              //     </div>
              //   );
              // }

              if (c.IsCurrency && value != null) {
                return `₹${Number(value).toLocaleString()}`;
              }
              return value ?? "-";
            },
          }));

        setColumns(reactCols);
      } else {
        setColumns([]);
      }
    } catch (err) {
      console.error("Grid columns fetch failed", err);
      setColumns([]);
    }
  };

  // ── Fetch Grid Data (with pagination, sorting, filters) ────────────────────
  const fetchGridData = async (options?: any) => {
    const pageToUse = options?.pageOverride ?? page;
    const perPageToUse = options?.perPageOverride ?? perPage;

    if (!selectedProject) return;

    try {
      setTableLoading(true);
      const payload = {
        procName: "PlotReport",
        Para: JSON.stringify({
          ActionMode: "GetReport",
          ProjectId: selectedProject,
          SectorId: selectedSector || "",
          BlockId: selectedBlock || "",
          PlotStatus: selectedStatus,
          SearchBy: options?.searchBy ?? filterColumn ?? "",
          Criteria: options?.criteria ?? searchInput ?? "",
          Page: pageToUse,
          PageSize: perPageToUse,
          SortIndexColumn: sortColumnKey || "",
          SortDir: sortDirection,
        }),
      };
      const res = await universalService(payload);
      const result = res?.data || res;

      if (result?.rows && Array.isArray(result.rows)) {
        setData(result.rows);
        setTotalRows(result?.TotalRecords || result.rows[0]?.TotalRecords || 0);
      } else if (Array.isArray(result)) {
        setData(result);
        setTotalRows(result[0]?.TotalRecords || 0);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalRows(0);
    } finally {
      setTableLoading(false);
    }
  };

  // ── Fetch Visible Columns ────────────────────────────────────────────────────
  const fetchVisibleColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    const payload = {
      procName: "UniversalColumnSelector",
      Para: JSON.stringify({
        EmployeeId: employeeId,
        USPName: "USP_" + procedure,
        ActionMode: "List",
        Mode: "Get",
      }),
    };
    const response = await universalService(payload);
    const cols = response?.data ?? response;
    if (Array.isArray(cols)) {
      setVisibleColumns(
        cols
          .map((c) => ({
            ...c,
            IsVisible:
              c.IsVisible === true || c.IsVisible === 1 || c.IsVisible === "1",
            IsHidden:
              c.IsHidden === false || c.IsHidden === 0 || c.IsHidden === "0",
          }))
          .sort((a, b) => a.DisplayOrder - b.DisplayOrder),
      );
      setColumnsReady(true);
      setRefreshGrid((prev) => prev + 1);
    }
  };

  // ── Apply Search ────────────────────────────────────────────────────────────
  const applySearch = () => {
    if (!SmartActions.canSearch(formName)) return;
    if (!selectedProject) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please select a Project first.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    setShowTable(true);
    setHasVisitedTable(true);
    setPage(1);
    setSearchTrigger((p) => p + 1);
    fetchGridData({ pageOverride: 1 });
  };

  // ── Reset Filters ───────────────────────────────────────────────────────────
  const resetFilters = () => {
    setFilterColumn("");
    setSearchInput("");
    setSelectedProject("");
    setSelectedSector("");
    setSelectedBlock("");
    setSelectedStatus("Available");
    setPage(1);
    setShowTable(false);
    setHasVisitedTable(false);
    setData([]);
  };

  // ── Handle Sort ─────────────────────────────────────────────────────────────
  const handleSort = (column: any, direction: string) => {
    setSortColumnKey(column.columnKey);
    setSortDirection(direction.toUpperCase());
    setInitialSortReady(true);
  };

  // ── Handle Page Change ──────────────────────────────────────────────────────
  const handlePageChange = (p: number) => {
    setPage(p);
    fetchGridData({ pageOverride: p });
  };

  // ── Handle Per Rows Change ──────────────────────────────────────────────────
  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setPage(page);
    fetchGridData({ pageOverride: page, perPageOverride: newPerPage });
  };

  // ── Export Columns & Data ───────────────────────────────────────────────────
  const exportColumns = columns
    .filter((c) => c.columnKey && c.columnKey !== "Actions")
    .map((c) => ({
      key: c.columnKey,
      label: c.name,
    }));

  const fetchExportData = async () => {
    const payload = {
      procName: "PlotReport",
      Para: JSON.stringify({
        ActionMode: "GetReport",
        ProjectId: selectedProject,
        SectorId: selectedSector || "",
        BlockId: selectedBlock || "",
        SearchValue: selectedStatus,
        SearchBy: filterColumn,
        Criteria: searchInput,
        Page: 1,
        PageSize: 0,
        SortIndexColumn: sortColumnKey || "",
        SortDir: sortDirection,
      }),
    };
    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  };

  // ── Hold Plot ───────────────────────────────────────────────────────────────
  const openHoldModal = (plot: any) => {
    setHoldPlotId(plot.PlotId);
    setHoldPlotNo(plot.PlotNumber ?? plot.PlotNo ?? "");
    setHoldDescription("");
    setShowHoldModal(true);
  };

  const submitHoldPlot = async () => {
    if (!holdDescription.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter a Description.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to hold this plot?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Hold",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    setHoldSaving(true);
    try {
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
      const res = await universalService({
        procName: "PlotHold",
        Para: JSON.stringify({
          ActionMode: "HoldPlot",
          PlotId: holdPlotId,
          Description: holdDescription,
          EntryBy: employeeId,
        }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row?.StatusCode === "1" || row?.StatusCode === 1) {
        await Swal.fire({
          icon: "success",
          title: "Plot Held!",
          text: row.Msg || row.msg || "Plot has been put on hold.",
          confirmButtonColor: "#22c55e",
        });
        setShowHoldModal(false);
        fetchGridData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: row?.Msg || row?.msg || "Could not hold the plot.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setHoldSaving(false);
    }
  };

  // ── Cancel Plot ─────────────────────────────────────────────────────────────
  const openCancelModal = (plot: any) => {
    setCancelPlotId(plot.PlotId ?? plot.PlotHoldId);
    setCancelPlotNo(plot.PlotNumber ?? plot.PlotNo ?? "");
    setCancelRemark("");
    setShowCancelModal(true);
  };

  const submitCancelPlot = async () => {
    if (!cancelRemark.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter a Remark.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to cancel this plot?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "Go Back",
    });
    if (!confirm.isConfirmed) return;

    setCancelSaving(true);
    try {
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
      const res = await universalService({
        procName: "PlotCancle",
        Para: JSON.stringify({
          ActionMode: "CanclePlot",
          PlotHoldId: cancelPlotId,
          Description: cancelRemark,
          EntryBy: employeeId,
        }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row?.StatusCode === "1" || row?.StatusCode === 1) {
        await Swal.fire({
          icon: "success",
          title: "Plot Cancelled!",
          text: row.Msg || row.msg || "Plot has been cancelled successfully.",
          confirmButtonColor: "#22c55e",
        });
        setShowCancelModal(false);
        fetchGridData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: row?.Msg || row?.msg || "Could not cancel the plot.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setCancelSaving(false);
    }
  };

  // ── Page Totals for Footer ──────────────────────────────────────────────────
  const pageTotals: any = {};
  columns.forEach((col: any) => {
    if (!col.isTotal || !col.columnKey) return;
    pageTotals[col.columnKey] = data.reduce((sum: number, row: any) => {
      return sum + Number(row[col.columnKey] || 0);
    }, 0);
  });

  const totalRow =
    Object.keys(pageTotals).length > 0
      ? columns.reduce((acc: any, col: any) => {
          if (!col.columnKey) {
            acc.__label = "Page Total";
            return acc;
          }
          if (col.isTotal) {
            acc[col.columnKey] = pageTotals[col.columnKey];
          } else {
            acc[col.columnKey] = "";
          }
          return acc;
        }, {})
      : null;

  const tableData =
    data.length > 0 && totalRow
      ? [...data, { ...totalRow, __isTotal: true }]
      : data;

  // ── useEffect Hooks ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchFormPermissions();
    loadProjects();
  }, []);

  useEffect(() => {
    fetchGridColumns();
  }, [refreshGrid]);

  useEffect(() => {
    if (!showTable || !hasVisitedTable) return;
    if (!sortColumnKey && initialSortReady) {
      fetchGridData();
      return;
    }
    if (sortColumnKey) {
      fetchGridData();
    }
  }, [
    page,
    perPage,
    sortColumnKey,
    sortDirection,
    searchTrigger,
    initialSortReady,
  ]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (permissionsLoading) return <Loader />;
  if (!hasPageAccess) return <AccessRestricted />;

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      {/* ── Page Header ── */}
      <div className="trezo-card-header mb-[20px] sm:flex items-center justify-between pb-5 border-b border-gray-200 dark:border-gray-700 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">
            {pageTitle}
          </h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Search and manage plot availability by project, sector and block
          </p>
        </div>
      </div>

      {/* ══ Search Filters Section ══ */}
      <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
          <i className="material-symbols-outlined text-[18px] text-primary-button-bg">
            manage_search
          </i>
          <h6 className="!mb-0 font-semibold text-sm text-gray-800 dark:text-gray-100">
            Search Plots
          </h6>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <FieldLabel label="Project" required>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className={selectCls}
            >
              <option value="">-- Select Project --</option>
              {projects.map((p: any) => (
                <option key={p.ProjectId} value={p.ProjectId}>
                  {p.ProjectName}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Sector">
            <select
              value={selectedSector}
              onChange={(e) => handleSectorChange(e.target.value)}
              disabled={!selectedProject}
              className={selectCls}
            >
              <option value="">-- Select Sector --</option>
              {sectors.map((s: any) => (
                <option key={s.SectorId} value={s.SectorId}>
                  {s.SectorName}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Block">
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedSector}
              className={selectCls}
            >
              <option value="">All Blocks</option>
              {blocks.map((b: any) => (
                <option key={b.BlockId} value={b.BlockId}>
                  {b.BlockName}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Status">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={selectCls}
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Hold">On Hold</option>
              <option value="Alloted">Alloted</option>
              <option value="Registry Done">Registry Done</option>
            </select>
          </FieldLabel>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applySearch}
              disabled={!selectedProject || !SmartActions.canSearch(formName)}
              className="h-[34px] px-4 text-xs font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <i className="material-symbols-outlined text-[13px]">search</i>
              Search
            </button>
            {(filterColumn || searchInput || selectedProject) && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-[34px] px-4 text-xs font-semibold rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5"
              >
                <i className="material-symbols-outlined text-[13px]">refresh</i>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Search Input (visible when Search By is selected) */}
        {filterColumn && (
          <div className="mt-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder={`Enter ${filterColumn} to search...`}
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* ══ Results Section with DataTable ══ */}
      {!showTable ? (
        <LandingIllustration
          title={pageTitle}
          addLabel="Search Plots"
          formName={formName}
          description={
            <>
              Select a project and filters above to search plots.
              <br />
              View plot details, manage availability, and track bookings.
            </>
          }
        />
      ) : (
        <div>
          {/* Export and Column Selector Bar */}
          <div className="flex justify-between items-center py-2 mb-[10px]">
            <div className="flex gap-2">
              {canExport && (
                <ExportButtons
                  exportData={fetchExportData}
                  columns={exportColumns}
                  fileName={`${pageTitle}_Report`}
                />
              )}
              {SmartActions.canManageColumns(formName) && (
                <ColumnSelector
                  procName={"USP_" + procedure}
                  onApply={fetchVisibleColumns}
                />
              )}
            </div>
          </div>

          {showTable && (
            <div>
              {tableLoading ? (
                <div className="flex justify-between items-center py-2 animate-pulse">
                  <div className="h-8 w-[120px] bg-gray-200 dark:bg-gray-700 rounded-md" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                  </div>
                </div>
              ) : hasData ? (
                <div className="flex justify-between items-center py-2 mb-[10px]">
                  <div className="relative">
                    <select
                      value={perPage}
                      onChange={(e) => {
                        const size = Number(e.target.value);
                        setPerPage(size);
                        setPage(1);
                        fetchGridData({
                          pageOverride: 1,
                          perPageOverride: size,
                        });
                      }}
                      className="h-8 w-[120px] px-3 pr-7 text-xs font-semibold
                  text-gray-600 dark:text-gray-300
                  bg-transparent border border-gray-300 dark:border-gray-600
                  rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-all appearance-none"
                    >
                      <option value="10">10 / page</option>
                      <option value="25">25 / page</option>
                      <option value="50">50 / page</option>
                      <option value="100">100 / page</option>
                    </select>
                    <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <i className="material-symbols-outlined text-[18px] text-gray-500">
                        expand_more
                      </i>
                    </span>
                  </div>
                  <PermissionAwareTooltip allowed={canExport}>
                    <div
                      className={
                        !canExport ? "pointer-events-none opacity-50" : ""
                      }
                    >
                      <ExportButtons
                        title={title}
                        columns={exportColumns}
                        fetchData={fetchExportData}
                        disabled={!canExport}
                      />
                    </div>
                  </PermissionAwareTooltip>
                </div>
              ) : null}

              <div
                className="trezo-card-content 
            bg-white dark:bg-[#0f172a]
            text-gray-800 dark:text-gray-200
            border border-gray-200 dark:border-gray-700
            rounded-lg overflow-hidden"
              >
                <DataTable
                  columns={columns}
                  data={tableData}
                  customStyles={customStyles}
                  pagination
                  paginationServer
                  paginationTotalRows={totalRows}
                  paginationComponent={(props) => (
                    <CustomPagination
                      {...props}
                      currentPage={page}
                      rowsPerPage={perPage}
                    />
                  )}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  onSort={handleSort}
                  sortServer
                  defaultSortFieldId={
                    columns.find((col) => col.columnKey === sortColumnKey)?.id
                  }
                  defaultSortAsc={sortDirection === "ASC"}
                  progressPending={tableLoading}
                  progressComponent={
                    <TableSkeleton
                      rows={perPage}
                      columns={columns.length || 8}
                    />
                  }
                  conditionalRowStyles={[
                    {
                      when: (row) => row.__isTotal,
                      style: {
                        fontWeight: 700,
                        backgroundColor: "var(--color-primary-table-bg)",
                      },
                    },
                  ]}
                  noDataComponent={!tableLoading && <OopsNoData />}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ Hold Plot Modal ══ */}
      {showHoldModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHoldModal(false)}
        >
          <div
            className="bg-white dark:bg-[#0c1427] rounded-md shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeInScale 0.18s ease-out" }}
          >
            <div className="bg-orange-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <i className="material-symbols-outlined text-white text-[16px]">
                    pause_circle
                  </i>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base leading-tight !mb-0">
                    Hold Plot
                  </h4>
                  {holdPlotNo && (
                    <p className="text-white/70 text-[11px] mt-0.5">
                      Plot No: {holdPlotNo}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowHoldModal(false)}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                <i className="material-symbols-outlined text-white text-[16px]">
                  close
                </i>
              </button>
            </div>

            <div className="p-5">
              <FieldLabel label="Description" required>
                <textarea
                  rows={4}
                  value={holdDescription}
                  onChange={(e) => setHoldDescription(e.target.value)}
                  placeholder="Enter reason for holding this plot…"
                  className="px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg resize-none transition-all"
                />
              </FieldLabel>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(false)}
                  className="h-[34px] px-5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={submitHoldPlot}
                  disabled={holdSaving}
                  className="h-[34px] px-6 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {holdSaving ? (
                    <>
                      <i className="material-symbols-outlined text-[13px] animate-spin">
                        refresh
                      </i>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined text-[13px]">
                        check_circle
                      </i>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Cancel Plot Modal ══ */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white dark:bg-[#0c1427] rounded-md shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeInScale 0.18s ease-out" }}
          >
            <div className="bg-red-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <i className="material-symbols-outlined text-white text-[16px]">
                    cancel
                  </i>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base leading-tight !mb-0">
                    Cancel Plot
                  </h4>
                  {cancelPlotNo && (
                    <p className="text-white/70 text-[11px] mt-0.5">
                      Plot No: {cancelPlotNo}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                <i className="material-symbols-outlined text-white text-[16px]">
                  close
                </i>
              </button>
            </div>

            <div className="p-5">
              <FieldLabel label="Remark" required>
                <textarea
                  rows={4}
                  value={cancelRemark}
                  onChange={(e) => setCancelRemark(e.target.value)}
                  placeholder="Enter reason for cancelling this plot…"
                  className="px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg resize-none transition-all"
                />
              </FieldLabel>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="h-[34px] px-5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={submitCancelPlot}
                  disabled={cancelSaving}
                  className="h-[34px] px-6 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {cancelSaving ? (
                    <>
                      <i className="material-symbols-outlined text-[13px] animate-spin">
                        refresh
                      </i>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined text-[13px]">
                        check_circle
                      </i>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.93); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PlotDetails;
