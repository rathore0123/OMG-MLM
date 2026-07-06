import React, { useState, useEffect, useRef } from "react";
import { ApiService } from "../../../../../services/ApiService";
import { useLocation } from "react-router-dom";
import { SmartActions } from "../../Security/SmartActionWithFormName";
import Loader from "../../../common/Loader";
import AccessRestricted from "../../../common/AccessRestricted";
import DataTable from "react-data-table-component";
import ColumnSelector from "../../ColumnSelector/ColumnSelector";
import CustomPagination from "../../../../../components/CommonFormElements/Pagination/CustomPagination";
import ExportButtons from "../../../../../components/CommonFormElements/ExportButtons/ExportButtons";
import OopsNoData from "../../../../../components/CommonFormElements/DataNotFound/OopsNoData";
import TableSkeleton from "../../Forms/TableSkeleton";
import customStyles from "../../../../../components/CommonFormElements/DataTableComponents/CustomStyles";
import PermissionAwareTooltip from "../../Tooltip/PermissionAwareTooltip";
import LandingIllustration from "../../../../../components/CommonFormElements/LandingIllustration/LandingIllustration";
import Swal from "sweetalert2";

// ─── constants ────────────────────────────────────────────────────────────────
const BANKS = [
  "State Bank of India",
  "ICICI Bank",
  "HDFC Bank",
  "Bank of Baroda",
  "Central Bank of India",
  "Bharat Overseas Bank Ltd",
  "UCO Bank",
  "Corporation Bank",
  "Allahabad Bank",
  "IDBI Bank Ltd",
  "Indian Overseas Bank",
  "Punjab National Bank",
  "Union Bank of India",
  "Syndicate Bank",
  "Dena Bank",
  "Vijaya Bank",
  "Citibank",
  "Standard Chartered Bank",
  "Oriental Bank of Commerce",
  "United Bank of India",
  "Canara Bank",
  "Kotak Mahindra Bank",
  "Andhra Bank",
  "Bank of Maharashtra",
  "Indusind Bank",
  "Federal Bank",
  "Indian Bank",
  "Punjab & Sind Bank",
  "Yes Bank Ltd",
  "Bank Of India",
  "Bandhan Bank",
  "Baroda Uttar Pradesh Gramin Bank",
  "Axis Bank",
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const fmt = (val: any) => "₹" + Number(val ?? 0).toLocaleString("en-IN");

const stripHtml = (s: any) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "")
    .trim();

const inputCls = (disabled: boolean) =>
  `h-[34px] px-3 text-xs rounded-md border outline-none transition-all w-full ${
    disabled
      ? "bg-gray-50 dark:bg-[#0c1427] text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed"
      : "bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary-button-bg"
  }`;

const selectCls =
  "h-[34px] pl-3 pr-8 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg appearance-none transition-all";

const Field = ({ label, required, children }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const STATUS_BADGE: Record<string, { cls: string; icon: string }> = {
  Booked: {
    cls: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "home",
  },
  Alloted: { cls: "bg-blue-100 text-blue-700 border-blue-200", icon: "key" },
  Hold: { cls: "bg-red-100 text-red-700 border-red-200", icon: "pause_circle" },
  Registry: {
    cls: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: "task_alt",
  },
};

const getBadge = (s: string) =>
  STATUS_BADGE[s] ?? {
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "circle",
  };

const getStatusText = (status: any) => stripHtml(status) || "—";

// ═══════════════════════════════════════════════════════════════════════════════
const PayEMI = () => {
  const { universalService } = ApiService();
  const location = useLocation();
  const formName = location.pathname.split("/").pop() || "";

  // Permissions
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);

  // Search state
  const [userName, setUserName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [hasVisitedTable, setHasVisitedTable] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Table state
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortColumnKey, setSortColumnKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [tableLoading, setTableLoading] = useState(true);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [initialSortReady, setInitialSortReady] = useState(false);
  const [filterColumn, setFilterColumn] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Autocomplete
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<any>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Pay EMI Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [lateFees, setLateFees] = useState("0");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  // History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyBooking, setHistoryBooking] = useState<any>(null);
  const [emiHistory, setEmiHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const canExport = SmartActions.canExport(formName);
  const procedure = "PayEMI";
  const pageTitle = "Pay EMI";
  const title = "EMI Payment";

  // Derived
  const isCDEMI = modalData?.tyPE === "CDEMI";
  const showLateFeesField = parseInt(modalData?.LateDay ?? 0) > 0;
  const showTxnField = paymentMode !== "" && paymentMode !== "Cash";
  const showBankFields = paymentMode === "Cheque" || paymentMode === "NEFT";
  const txLabel =
    paymentMode === "Cheque" ? "Cheque Number" : "Transaction Number";
  const chqDateLabel =
    paymentMode === "Cheque" ? "Cheque Date" : "Transaction Date";

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch permissions
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
      if (!Array.isArray(result)) {
        setHasPageAccess(false);
        return;
      }
      const pagePermission = result.find(
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
      SmartActions.load(result);
      setHasPageAccess(true);
    } catch {
      setHasPageAccess(false);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Load projects
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

  useEffect(() => {
    fetchFormPermissions();
    loadProjects();
  }, []);

  // Handle user input with debounce
  const handleUserInput = (val: string) => {
    setUserName(val);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await universalService({
          procName: "GetPlotDetails",
          Para: JSON.stringify({
            ActionMode: "MemberDetails",
            UserName: val.trim(),
          }),
        });
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data && data !== "NoRecord"
            ? [data]
            : [];
        if (list.length > 0) {
          setSuggestions(list.slice(0, 8));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestLoading(false);
      }
    }, 400);
  };

  // Fetch grid columns
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

              if (c.ColumnKey === "PlotStatus") {
                if (typeof value === "string" && value.includes("<")) {
                  return <span dangerouslySetInnerHTML={{ __html: value }} />;
                }
                const badge = getBadge(value);
                return (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}
                  >
                    <i className="material-symbols-outlined text-[10px]">
                      {badge.icon}
                    </i>
                    {value || "Available"}
                  </span>
                );
              }

              if (c.IsCurrency && value != null) {
                return `₹${Number(value).toLocaleString()}`;
              }
              return value ?? "-";
            },
          }));

        // Action column
        const actionColumn = {
          name: "Actions",
          sortable: false,
          ignoreRowClick: true,
          button: true,
          minWidth: "170px",
          cell: (row: any) => {
            const balance = parseFloat(row.Balance ?? 0);
            const canPay = row.Status !== "Alloted" && balance > 0;
            return (
              <div className="flex items-center gap-1.5">
                {canPay && (
                  <button
                    type="button"
                    onClick={() => openPayEmi(row)}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all whitespace-nowrap"
                  >
                    <i className="material-symbols-outlined text-[12px]">
                      payments
                    </i>
                    Pay EMI
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openHistory(row)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-primary-button-bg border border-primary-button-bg hover:bg-primary-button-bg hover:text-white rounded-md transition-all whitespace-nowrap"
                >
                  <i className="material-symbols-outlined text-[12px]">
                    history
                  </i>
                  View
                </button>
              </div>
            );
          },
        };

        setColumns([...reactCols, actionColumn]);
      } else {
        setColumns([]);
      }
    } catch (err) {
      console.error("Grid columns fetch failed", err);
      setColumns([]);
    }
  };

  // Fetch grid data
  const fetchGridData = async (options?: any) => {
    const pageToUse = options?.pageOverride ?? page;
    const perPageToUse = options?.perPageOverride ?? perPage;

    if (!userName.trim()) return;

    try {
      setTableLoading(true);
      const payload = {
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "Select",
          UserName: userName.trim(),
          ProjectId: selectedProject || "",
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

  // Search bookings
  const searchBookings = async () => {
    if (!userName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter a Username.",
        confirmButtonColor: "#3b82f6",
        customClass: { popup: "rounded-2xl" },
      });
      return;
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setShowTable(true);
    setHasVisitedTable(true);
    setPage(1);
    setSearchTrigger((prev) => prev + 1);
    fetchGridData({ pageOverride: 1 });
  };

  const applySearch = () => {
    if (!SmartActions.canSearch(formName)) return;
    searchBookings();
  };

  // Handle sort
  const handleSort = (column: any, direction: string) => {
    setSortColumnKey(column.columnKey);
    setSortDirection(direction.toUpperCase());
    setInitialSortReady(true);
  };

  // Handle pagination
  const handlePageChange = (p: number) => {
    setPage(p);
    fetchGridData({ pageOverride: p });
  };

  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setPerPage(newPerPage);
    setPage(page);
    fetchGridData({ pageOverride: page, perPageOverride: newPerPage });
  };

  // Export data
  const exportColumns = columns
    .filter((c) => c.columnKey && c.name !== "Actions")
    .map((c) => ({
      key: c.columnKey,
      label: c.name,
    }));

  const fetchExportData = async () => {
    const payload = {
      procName: procedure,
      Para: JSON.stringify({
        ActionMode: "Select",
        UserName: userName.trim(),
        ProjectId: selectedProject || "",
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

  // Open Pay EMI Modal
  const openPayEmi = async (booking: any) => {
    setDetailLoading(true);
    try {
      const res = await universalService({
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "SelectById",
          BookingId: booking.BookingId,
        }),
      });
      const data = res?.data ?? res;
      if (
        !data ||
        data === "NoRecord" ||
        (Array.isArray(data) && data.length === 0)
      ) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not load booking details.",
          confirmButtonColor: "#ef4444",
        });
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (row.StatusCode !== "1" && row.StatusCode !== 1) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: row.Msg || "Could not load booking details.",
          confirmButtonColor: "#ef4444",
        });
        return;
      }
      setModalData({ ...booking, ...row });
      setPaidAmount(String(row.EMIAmount ?? ""));
      setPaymentMode("");
      setTransactionNo("");
      setPaymentDate(row.PaymentDate ?? "");
      setChequeDate("");
      setBankName("");
      setBranchName("");
      setLateFees("0");
      setRemark("");
      setShowPayModal(true);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load booking details.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const closePayModal = () => {
    setShowPayModal(false);
    setModalData(null);
  };

  const handlePaidAmountChange = (val: string) => {
    const amount = parseFloat(val) || 0;
    const balance = parseFloat(modalData?.Balance ?? 0);
    if (amount > balance) {
      setPaidAmount("0");
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Amount exceeded from remaining balance.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    setPaidAmount(val);
  };

  // Submit Pay EMI
  const submitPayEmi = async () => {
    const showErr = (msg: string) =>
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: msg,
        confirmButtonColor: "#3b82f6",
      });

    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      showErr("Please enter a valid Pay Amount.");
      return;
    }
    if (!paymentMode) {
      showErr("Please select Payment Mode.");
      return;
    }
    if (showTxnField && !transactionNo) {
      showErr(`Please enter ${txLabel}.`);
      return;
    }
    if (showBankFields) {
      if (!chequeDate) {
        showErr(`Please enter ${chqDateLabel}.`);
        return;
      }
      if (!bankName) {
        showErr("Please choose Bank Name.");
        return;
      }
      if (!branchName) {
        showErr("Please enter Branch Name.");
        return;
      }
    }
    if (!paymentDate) {
      showErr("Please enter Payment Date.");
      return;
    }
    if (showLateFeesField && (!lateFees || parseFloat(lateFees) < 0)) {
      showErr("Please enter Late Fees.");
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to submit this payment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const saved = localStorage.getItem("EmployeeDetails");
      const empId = saved ? JSON.parse(saved).EmployeeId : 0;
      const res = await universalService({
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "PayEMIInsert",
          PaidBy: empId,
          RemainingAmount: 0,
          PaidAmount: paidAmount,
          Remark: remark || "",
          PaymentMode: paymentMode,
          BookingId: modalData?.BookingId ?? "",
          PaymentDate: paymentDate,
          TransactionNumber: transactionNo || "",
          TransactionDate: chequeDate || "",
          BankName: bankName || "",
          BranchName: branchName || "",
          EMIAmount: modalData?.EMIAmount ?? "",
          EMIMode: modalData?.EMITYPE ?? "",
          EMILateFees: lateFees || "0",
        }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;

      if (row?.StatusCode === "1" || row?.StatusCode === 1) {
        await Swal.fire({
          icon: "success",
          title: "EMI Paid!",
          text: row.Msg || "EMI payment recorded successfully.",
          confirmButtonColor: "#22c55e",
        });
        closePayModal();
        searchBookings();
      } else {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: row?.Msg || "Something went wrong.",
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
      setSaving(false);
    }
  };

  // Open History Modal
  const openHistory = async (booking: any) => {
    setHistoryBooking(booking);
    setEmiHistory([]);
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      const res = await universalService({
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "SelectByIdView",
          BookingId: booking.BookingId,
        }),
      });
      const data = res?.data ?? res;
      setEmiHistory(
        !data ||
          data === "NoRecord" ||
          (Array.isArray(data) && data.length === 0)
          ? []
          : Array.isArray(data)
            ? data
            : [data],
      );
    } catch {
      setEmiHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch columns on refresh
  useEffect(() => {
    fetchGridColumns();
  }, [refreshGrid]);

  // Fetch data when table is shown
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

  // Reset function
  const resetFilters = () => {
    setFilterColumn("");
    setSearchInput("");
    setUserName("");
    setSelectedProject("");
    setPage(1);
    setShowTable(false);
    setHasVisitedTable(false);
    setData([]);
  };

  if (permissionsLoading) return <Loader />;
  if (!hasPageAccess) return <AccessRestricted />;

  const hasData = data.length > 0;

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      {/* Header */}
      <div className="trezo-card-header mb-[10px] md:mb-[10px] sm:flex items-center justify-between pb-5 border-b border-gray-200 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">
            {pageTitle}
          </h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Search a member to view and pay plot EMI installments
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
          <i className="material-symbols-outlined text-[18px] text-primary-button-bg">
            manage_search
          </i>
          <h6 className="!mb-0 font-semibold text-sm text-gray-800 dark:text-gray-100">
            Search Booking
          </h6>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          {/* Username with autocomplete */}
          <Field label="Username / Customer ID" required>
            <div className="relative" ref={searchBoxRef}>
              <div className="relative">
                <i className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-gray-400 pointer-events-none">
                  person_search
                </i>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => handleUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder="Type username or name…"
                  className={`${inputCls(false)} pl-9 pr-8`}
                />
                {suggestLoading && (
                  <i className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[14px] text-primary-button-bg animate-spin pointer-events-none">
                    refresh
                  </i>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#0c1427] rounded-md shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {suggestions.length} suggestion
                      {suggestions.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setUserName(s.UserName ?? s.Name ?? userName);
                        setShowSuggestions(false);
                        setSuggestions([]);
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50 last:border-0 group"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary-button-bg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-[10px]">
                          {getInitials(s.Name)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-button-bg truncate">
                          {s.Name ?? "—"}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          @{s.UserName ?? "—"}
                          {s.MobileNo ? ` · ${s.MobileNo}` : ""}
                        </div>
                      </div>
                      <i className="material-symbols-outlined text-[14px] text-gray-300 group-hover:text-primary-button-bg">
                        chevron_right
                      </i>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Field label="Project (optional)">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className={selectCls}
            >
              <option value="">-- All Projects --</option>
              {projects.map((p: any) => (
                <option key={p.ProjectId} value={p.ProjectId}>
                  {p.ProjectName}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex items-end">
            <button
              type="button"
              onClick={applySearch}
              disabled={!selectedProject || !SmartActions.canSearch(formName)}
              className="h-[34px] px-4 text-xs font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <i className="material-symbols-outlined text-[13px]">search</i>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {!showTable ? (
        <LandingIllustration
          title={pageTitle}
          addLabel="Search Bookings"
          formName={formName}
          description={
            <>
              Enter a username above to view plot bookings.
              <br />
              Manage EMI payments, view payment history, and track balances.
            </>
          }
        />
      ) : (
        <div>
          {tableLoading ? (
            <div className="flex justify-between items-center py-2 animate-pulse">
              <div className="h-8 w-[120px] bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="flex gap-2">
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
                    fetchGridData({ pageOverride: 1, perPageOverride: size });
                  }}
                  className="h-8 w-[120px] px-3 pr-7 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all appearance-none"
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
                  className={!canExport ? "pointer-events-none opacity-50" : ""}
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

          <div className="trezo-card-content bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={data.map((item, idx) => ({ ...item, rowIndex: idx + 1 }))}
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
                <TableSkeleton rows={perPage} columns={columns.length || 8} />
              }
              noDataComponent={!tableLoading && <OopsNoData />}
            />
          </div>
        </div>
      )}

      {/* Pay EMI Modal */}
      {showPayModal && modalData && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closePayModal}
        >
          <div
            className="bg-white dark:bg-[#0c1427] rounded-md shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeInScale 0.18s ease-out" }}
          >
            <div className="bg-primary-button-bg px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <i className="material-symbols-outlined text-white text-[16px]">
                    payments
                  </i>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base leading-tight !mb-0">
                    Pay EMI
                  </h4>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    Plot: {modalData.PlotNumber ?? "—"} &nbsp;·&nbsp;{" "}
                    {modalData.ProjectName ?? ""}
                  </p>
                </div>
              </div>
              <button
                onClick={closePayModal}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                <i className="material-symbols-outlined text-white text-[16px]">
                  close
                </i>
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[78vh]">
              {/* Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="material-symbols-outlined text-[12px] text-primary-button-bg">
                      person
                    </i>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Member Name
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {modalData.UserName ?? "—"}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="material-symbols-outlined text-[12px] text-green-600">
                      call
                    </i>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Mobile No.
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {modalData.MobileNo ?? "—"}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="material-symbols-outlined text-[12px] text-blue-500">
                      receipt_long
                    </i>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Total Amount
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {fmt(modalData.TotalPlotCost)}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="material-symbols-outlined text-[12px] text-orange-500">
                      account_balance
                    </i>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Balance
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {fmt(modalData.Balance)}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="material-symbols-outlined text-[12px] text-teal-600">
                      calendar_month
                    </i>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      EMI Plan
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {modalData.EMITYPE ?? "—"}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className="material-symbols-outlined text-[12px] text-rose-500">
                      payments
                    </i>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      EMI Amount
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {fmt(modalData.EMIAmount)}
                  </span>
                </div>
              </div>

              {isCDEMI && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-md px-3 py-2 mb-3">
                  <i className="material-symbols-outlined text-[14px] text-amber-500">
                    info
                  </i>{" "}
                  This is a CDP EMI plan — the payment amount is fixed.
                </div>
              )}

              {showLateFeesField && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md px-3 py-2 mb-3">
                  <i className="material-symbols-outlined text-[14px] text-red-500">
                    warning
                  </i>{" "}
                  {modalData.LateDay} day
                  {parseInt(modalData.LateDay) !== 1 ? "s" : ""} late — Late
                  fees required.
                </div>
              )}

              <div className="h-px bg-gray-100 dark:bg-gray-700 mb-4" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Pay Amount (₹)" required>
                  <input
                    type="number"
                    value={paidAmount}
                    min={1}
                    disabled={isCDEMI}
                    onChange={(e) => handlePaidAmountChange(e.target.value)}
                    placeholder="Enter amount"
                    className={inputCls(isCDEMI)}
                  />
                </Field>

                <Field label="Payment Mode" required>
                  <select
                    value={paymentMode}
                    onChange={(e) => {
                      setPaymentMode(e.target.value);
                      setTransactionNo("");
                      setChequeDate("");
                      setBankName("");
                      setBranchName("");
                    }}
                    className={selectCls}
                  >
                    <option value="">-- Select Mode --</option>
                    <option value="NEFT">NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="OnlineTransaction">
                      Online Transaction
                    </option>
                    <option value="RTGS">RTGS</option>
                    <option value="IMPS">IMPS</option>
                  </select>
                </Field>

                {showTxnField && (
                  <Field label={txLabel} required>
                    <input
                      type="text"
                      value={transactionNo}
                      onChange={(e) => setTransactionNo(e.target.value)}
                      placeholder={`Enter ${txLabel}`}
                      className={inputCls(false)}
                    />
                  </Field>
                )}

                {showBankFields && (
                  <>
                    <Field label={chqDateLabel} required>
                      <input
                        type="date"
                        value={chequeDate}
                        onChange={(e) => setChequeDate(e.target.value)}
                        className={inputCls(false)}
                      />
                    </Field>
                    <Field label="Bank Name" required>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={selectCls}
                      >
                        <option value="">--- Select Bank ---</option>
                        {BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Branch Name" required>
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="Enter Branch Name"
                        className={inputCls(false)}
                      />
                    </Field>
                  </>
                )}

                <Field label="Payment Date" required>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>

                {showLateFeesField && (
                  <Field label="Late Fees (₹)" required>
                    <input
                      type="number"
                      value={lateFees}
                      min={0}
                      onChange={(e) => setLateFees(e.target.value)}
                      placeholder="0"
                      className={inputCls(false)}
                    />
                  </Field>
                )}

                <Field label="Description / Remark">
                  <input
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Optional remark"
                    className={inputCls(false)}
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closePayModal}
                  className="h-[34px] px-5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitPayEmi}
                  disabled={saving}
                  className="h-[34px] px-6 text-xs font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <i className="material-symbols-outlined text-[13px] animate-spin">
                        refresh
                      </i>{" "}
                      Processing…
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined text-[13px]">
                        check_circle
                      </i>{" "}
                      Submit Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="bg-white dark:bg-[#0c1427] rounded-md shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeInScale 0.18s ease-out" }}
          >
            <div className="bg-primary-button-bg px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <i className="material-symbols-outlined text-white text-[16px]">
                    history
                  </i>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base leading-tight !mb-0">
                    EMI Payment History
                  </h4>
                  {historyBooking && (
                    <p className="text-white/60 text-[11px] mt-0.5">
                      {historyBooking.UserName ?? "—"} · Plot:{" "}
                      {historyBooking.PlotNumber ?? "—"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
              >
                <i className="material-symbols-outlined text-white text-[16px]">
                  close
                </i>
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-3 py-12">
                  <i className="material-symbols-outlined text-[24px] text-primary-button-bg animate-spin">
                    refresh
                  </i>
                  <span className="text-sm text-gray-500">
                    Loading payment history…
                  </span>
                </div>
              ) : emiHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a]">
                        {[
                          "#",
                          "Payment Date",
                          "Paid Amount",
                          "Late Fees",
                          "Mode",
                          "Transaction No.",
                          "Balance",
                          "Remark",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                      {emiHistory.map((e, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50/60 dark:hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="px-3 py-3 text-xs text-gray-400 font-medium">
                            {i + 1}
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {e.PaymentDate ?? e.TransactionDate ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-xs font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                            {fmt(e.PaidAmount)}
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold text-orange-500 whitespace-nowrap">
                            {fmt(e.EMILateFees ?? e.LateFees ?? 0)}
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-primary-button-bg border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 rounded-full">
                              {e.PaymentMode ?? "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                            {e.TransactionNumber ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-xs font-bold whitespace-nowrap">
                            <span
                              className={
                                parseFloat(e.Balance ?? 0) > 0
                                  ? "text-red-500"
                                  : "text-green-600"
                              }
                            >
                              {fmt(e.Balance ?? 0)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-500 max-w-[150px] truncate">
                            {e.Remark ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <i className="material-symbols-outlined text-[24px] text-gray-300">
                      receipt_long
                    </i>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                    No payment history found
                  </p>
                  <p className="text-gray-400 text-xs">
                    No EMI payments have been recorded yet
                  </p>
                </div>
              )}
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

export default PayEMI;
