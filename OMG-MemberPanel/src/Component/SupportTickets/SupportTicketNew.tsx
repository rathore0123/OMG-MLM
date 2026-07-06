import { useState, useRef, useEffect, useCallback } from "react";
import "./SupportTicket.scss";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { SupportTicket } from "../../utils/Constant";
import { ApiService } from "../../Service/UniversalService/ApiService";
import DataTable from "react-data-table-component";
import DateRangeFilter from "../../CommonElements/DateRangePicker/DateRange";
import { format } from "date-fns";
import TableSkeleton from "../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/TableSkeleton";
import NoDataFound from "../../CommonElements/NodataFound/NoDataFound";
import CustomPagination from "../../CommonElements/DataTableComponent/CommonFormElements/Pagination/CustomPagination";
import { customStyles } from "../../CommonElements/DataTableComponent/CustomStyle/CustomStyle";
import StatsCardsTrezo from "../../CommonElements/DataTableComponent/CommonFormElements/StatsCard/StatsCards";
import { PostService } from "../../Service/PostService/PostService";
import Swal from "sweetalert2";
import { Container } from "react-bootstrap";
import ExportButtons from "../../CommonElements/DataTableComponent/CommonFormElements/ExportButtons/ExportButtons";
import StatusBadge from "../../CommonElements/DataTableComponent/CommonFormElements/StatusBadge/StatusBadge";
import { decryptData } from "../../utils/helper/Crypto";

// ── Constants ──────────────────────────────────────────────────────────────
// 🔥 replace with dynamic value if needed

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  awaiting: "Awaiting",
  inprogress: "In Progress",
};

interface DateRange {
  from: string;
  to: string;
}

// ── Date helpers ────────────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const fromStr = format(firstDayOfMonth, "yyyy-MM-dd");
const toStr = format(today, "yyyy-MM-dd");

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const getEmployeeId = () => {
  try {
    const saved = localStorage.getItem("EmployeeDetails");
    return saved ? JSON.parse(saved).EmployeeId : 0;
  } catch {
    return 0;
  }
};

// ── Component ────────────────────────────────────────────────────────────────
export default function SupportTicketNew() {
  const { postDocument } = PostService();
  const { universalService } = ApiService();
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const procedureName = "ClientTask";

  // ── Attachment ──
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // ── Stats ──
  const [stats, setStats] = useState({
    TotalTickets: 0,
    NewTickets: 0,
    ClosedTickets: 0,
    TodayTickets: 0,
  });

  // ── Table state ──
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortIndex, setSortIndex] = useState("");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // ── Filter state ──
  const [filterColumn, setFilterColumn] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ── Date range ──
  const [pendingRange, setPendingRange] = useState<DateRange>({
    from: fromStr,
    to: toStr,
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: fromStr,
    to: toStr,
  });
  const dateRangeRef = useRef<DateRange>(dateRange);

  // Keep ref in sync whenever dateRange state changes
  useEffect(() => {
    dateRangeRef.current = dateRange;
  }, [dateRange]);

  // ── Modals ──
  const [showCreate, setShowCreate] = useState(false);
  const [chatTicket, setChatTicket] = useState<any>(null);

  // ── Form ──
  const [selType, setSelType] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });
  const [taskTypes, setTaskTypes] = useState<any[]>([]);

  // ── Chat ──
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chats, setChats] = useState<Record<string, any[]>>({});
  const endRef = useRef<HTMLDivElement>(null);

  // ── Stats card config ──
  const statsConfig = [
    {
      key: "+",
      title: "New Tickets",
      sub: "Open issues",
      color: "#f72585",
      icon: "🎫",
      isGrad: true,
      click: () => setShowCreate(true),
    },
    {
      key: "ClosedTickets",
      title: "Closed Tickets",
      sub: "Resolved",
      color: "#4cc9f0",
      icon: "✅",
    },
    {
      key: "TodayTickets",
      title: "Today Tickets",
      sub: "Today's activity",
      color: "#7209b7",
      icon: "📅",
    },
    {
      key: "TotalTickets",
      title: "Total Tickets",
      sub: "All time",
      color: "#3a0ca3",
      icon: "📋",
    },
  ];

  // ── Derived ──
  const hasData = data.length > 0;
  const canExport = hasData;

  // ── Export columns ──
  const exportColumns = columns
    .filter((c) => c.columnKey)
    .map((c) => ({ key: c.columnKey, label: c.name }));

  // ─────────────────────────────────────────────────────────────────────────
  // SCROLL LOCK — prevent parent/body scroll when any modal is open
  // Uses a ref-counted approach so both modals can coexist safely
  // ─────────────────────────────────────────────────────────────────────────
  const isAnyModalOpen = showCreate || !!chatTicket;

  useEffect(() => {
    if (isAnyModalOpen) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }

    // Cleanup on unmount — ensure body scroll is always restored
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH COLUMNS
  // ─────────────────────────────────────────────────────────────────────────
  const fetchGridColumns = useCallback(async () => {
    try {
      const payload = {
        procName: "GetUserGridColumns",
        Para: JSON.stringify({
          UserId: getEmployeeId(),
          GridName: "USP_ClientTask",
        }),
      };

      const res = await universalService(payload);
      const result = res?.data ?? res;

      if (!Array.isArray(result)) {
        setColumns([]);
        return;
      }

      const visibleSorted = result
        .filter((c: any) => c.IsVisible)
        .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder);

      const reactCols = visibleSorted.map((c: any, index: number) => ({
        id: index + 1,
        name: c.DisplayName,
        sortable: true,
        columnKey: c.ColumnKey,
        isTotal: c.IsTotal,
        isCurrency: c.IsCurrency,
        selector: (row: any) => row[c.ColumnKey],
        cell: (row: any) => {
          // Total row
          if (row.__isTotal) {
            if (index === 0) return "Total";
            if (c.IsTotal) {
              const value = row[c.ColumnKey] || 0;

              return c.IsCurrency
                ? `$${Number(value).toLocaleString()}`
                : Number(value).toLocaleString();
            }
            return "";
          }

          // Normal row
          const value = row[c.ColumnKey];

          if (c.ColumnKey === "Status") {
            return <StatusBadge status={value} />;
          }
          if (typeof value === "string" && value.includes("<")) {
            return <span dangerouslySetInnerHTML={{ __html: value }} />;
          }
          if (c.IsCurrency && value != null) {
            return `$${Number(value).toLocaleString()}`;
          }
          return value ?? "-";
        },
      }));

      // Action column
      const actionColumn = {
        name: "Action",
        cell: (row: any) => (
          <button
            className="st-view-btn"
            onClick={() =>
              openChat({
                id: row.TaskId,
                taskNumber: row.TaskNumber,
                title: row.Subject,
                type: row.TaskType,
                statusHtml: row.Status,
                createdAt: row.TaskDate,
                priority: row.Priority,
              })
            }
          >
            Chat
          </button>
        ),
        ignoreRowClick: true,
        button: true,
      };

      setColumns([...reactCols, actionColumn]);
    } catch (err) {
      console.error("Column fetch error:", err);
      setColumns([]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH EXPORT DATA
  // ─────────────────────────────────────────────────────────────────────────
  const fetchExportData = useCallback(async () => {
    const range = dateRangeRef.current;
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({
        ActionMode: "GetReport",
        SearchBy: filterColumn,
        Criteria: searchInput,
        Page: page,
        PageSize: 0,
        SortIndexColumn: sortIndex,
        SortDir: sortDirection,
        FromDate: range.from || null,
        ToDate: range.to || null,
        ClientId: ClientID,
      }),
    };
    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  }, [filterColumn, searchInput, page, sortIndex, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH STATS
  // ─────────────────────────────────────────────────────────────────────────
  const getStats = useCallback(async () => {
    try {
      const payload = {
        procName: procedureName,
        Para: JSON.stringify({
          ActionMode: "GetStats",
          ClientId: ClientID,
        }),
      };
      const res = await universalService(payload);
      const result = res?.data ?? res ?? [];
      if (Array.isArray(result) && result.length > 0) {
        setStats(result[0]);
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH GRID DATA — reads dateRange from ref (avoids stale closure)
  // ─────────────────────────────────────────────────────────────────────────
  const fetchGridData = useCallback(
    async (options?: {
      pageOverride?: number;
      perPageOverride?: number;
      rangeOverride?: DateRange;
      searchBy?: string;
      criteria?: string;
    }) => {
      const pageToUse = options?.pageOverride ?? page;
      const perPageToUse = options?.perPageOverride ?? perPage;
      const rangeToUse = options?.rangeOverride ?? dateRangeRef.current;

      try {
        setTableLoading(true);
        const payload = {
          procName: procedureName,
          Para: JSON.stringify({
            ActionMode: "GetReport",
            ClientId: ClientID,
            SearchBy: options?.searchBy ?? filterColumn ?? "",
            Criteria: options?.criteria ?? searchInput ?? "",
            Page: pageToUse,
            PageSize: perPageToUse,
            SortIndexColumn: sortIndex,
            SortDir: sortDirection,
            FromDate: rangeToUse.from || null,
            ToDate: rangeToUse.to || null,
          }),
        };

        const res = await universalService(payload);
        const result = res?.data ?? res;

        if (Array.isArray(result)) {
          setData(result);
          setTotalRows(result[0]?.TotalRecords ?? 0);
        } else {
          setData([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Grid fetch error:", err);
      } finally {
        setTableLoading(false);
      }
    },
    [page, perPage, sortIndex, sortDirection, filterColumn, searchInput], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH TASK TYPES
  // ─────────────────────────────────────────────────────────────────────────
  const fetchTaskTypes = useCallback(async () => {
    try {
      const CompanyIdLocalSTG = localStorage.getItem("CompanyId") || "1";
      const payload = {
        procName: "GetDDLData",
        Para: JSON.stringify({
          tbl: "master.TaskType",
          searchField: "tasktype",
          filterCTL: "",
          filterData: JSON.stringify({ CompanyId: CompanyIdLocalSTG }),
        }),
      };
      const res = await universalService(payload);
      const result = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      setTaskTypes(result.map((x: any) => ({ value: x.id, label: x.name })));
    } catch (err) {
      console.error("TaskType error:", err);
      setTaskTypes([]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchGridColumns();
    fetchTaskTypes();
    getStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when sort changes
  useEffect(() => {
    fetchGridData({ pageOverride: 1 });
    setPage(1);
  }, [sortIndex, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom in chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, chatTicket, typing]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleSort = (column: any, direction: string) => {
    if (!column?.columnKey) return;
    setSortIndex(column.columnKey);
    setSortDirection(direction.toUpperCase());
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

  // FIX: applySearch no longer expects an event parameter — safe to call from
  // both button onClick and onKeyDown without passing synthetic event
  const applySearch = () => {
    const committedRange: DateRange = {
      from: pendingRange.from,
      to: pendingRange.to,
    };

    setDateRange(committedRange);
    dateRangeRef.current = committedRange; // update ref immediately (setState is async)
    setPage(1);
    setSearchTrigger((p) => p + 1);

    fetchGridData({
      pageOverride: 1,
      rangeOverride: committedRange,
      searchBy: filterColumn,
      criteria: searchInput,
    });
  };

  const resetSearch = () => {
    setFilterColumn("");
    setSearchInput("");
    setPage(1);
    fetchGridData({ pageOverride: 1, searchBy: "", criteria: "" });
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("UploadedImage", file);
    fd.append("pagename", "Ticket");

    try {
      const res = await postDocument(fd);
      const fileName = res?.fileName || res?.Message;
      if (!fileName) {
        alert("Upload failed");
        return;
      }
      setAttachment(file);
      setUploadedFileName(fileName);
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !selType) return;

    try {
      const payload = {
        procName: procedureName,
        Para: JSON.stringify({
          ActionMode: "Insert",
          ClientId: ClientID,
          Subject: form.title,
          TaskContent: form.description,
          TaskTypeId: selType,
          Priority: "Normal",
          Attachments: uploadedFileName
            ? JSON.stringify([
                {
                  DocumentId: 0,
                  DocumentName: attachment?.name || "Attachment",
                  File: uploadedFileName,
                },
              ])
            : "",
        }),
      };

      const res = await universalService(payload);
      const raw = res?.data ?? res;
      const result = Array.isArray(raw) ? raw[0] : raw;

      if (result?.StatusCode === "1") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: result?.Msg || "Ticket created successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        setShowCreate(false);
        setForm({ title: "", description: "" });
        setSelType("");
        setAttachment(null);
        setUploadedFileName("");
        fetchGridData();
        getStats();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result?.Msg || "Something went wrong!",
        });
      }
    } catch (err) {
      console.error("Create error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while creating ticket!",
      });
    }
  };

  const openChat = async (ticket: any) => {
    setChatTicket(ticket);

    try {
      const payload = {
        procName: procedureName,
        Para: JSON.stringify({ ActionMode: "LoadMessages", TaskId: ticket.id }),
      };
      const res = await universalService(payload);
      const result = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const formatted = result
        .map((m: any) => ({
          id: Math.random(),
          role: m.ReplyType === "C" ? "user" : "support",
          text: m.Message,
          time: m.EntryDate,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.time).getTime() - new Date(b.time).getTime(),
        );

      setChats((p) => ({ ...p, [ticket.id]: formatted }));
    } catch (err) {
      console.error("Chat load error:", err);
    }
  };

  const sendMsg = async () => {
    const txt = chatInput.trim();
    if (!txt || !chatTicket) return;

    try {
      const payload = {
        procName: procedureName,
        Para: JSON.stringify({
          ActionMode: "SendMessage",
          TaskId: chatTicket.id,
          ClientId: ClientID,
          Message: txt,
        }),
      };
      await universalService(payload);
      setChatInput("");
      openChat(chatTicket);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PAGE TOTALS (from Binary Income pattern)
  // ─────────────────────────────────────────────────────────────────────────
  const pageTotals: Record<string, number> = {};
  columns.forEach((col: any) => {
    if (!col.isTotal || !col.columnKey) return;
    pageTotals[col.columnKey] = data.reduce(
      (sum: number, row: any) => sum + Number(row[col.columnKey] || 0),
      0,
    );
  });

  const totalRow =
    Object.keys(pageTotals).length > 0
      ? columns.reduce((acc: any, col: any) => {
          if (!col.columnKey) {
            acc.__label = "Page Total";
            return acc;
          }
          acc[col.columnKey] = col.isTotal ? pageTotals[col.columnKey] : "";
          return acc;
        }, {})
      : null;

  const tableData =
    hasData && totalRow ? [...data, { ...totalRow, __isTotal: true }] : data;

  // ── Derived chat state ──
  const msgs = chatTicket ? chats[chatTicket.id] || [] : [];
  const isClosed = chatTicket?.statusHtml?.toLowerCase().includes("closed");

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Breadcrumbs
        mainTitle={SupportTicket}
        parent={"Home"}
        ChildName={SupportTicket}
      />

      <Container fluid>
        <div className="st-wrapper">
          {/* Stats cards */}
          <StatsCardsTrezo stats={stats} config={statsConfig} />

          {/* Filters */}
          <div className="trezo-card-header">
            <div className="header-actions">
              <div className="filter-group">
                {/* Date range */}
                <div className="date-filter-placeholder">
                  <DateRangeFilter
                    initialRange={{ start: firstDayOfMonth, end: today }}
                    onChange={(range) => {
                      setPendingRange({
                        from: format(range.start, "yyyy-MM-dd"),
                        to: format(range.end, "yyyy-MM-dd"),
                      });
                    }}
                  />
                </div>

                {/* Filter column */}
                <div className="filter-dropdown">
                  <div className="st-filter-label">Filter By</div>
                  <select
                    className="st-filter-select"
                    value={filterColumn}
                    onChange={(e) => setFilterColumn(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="TaskNumber">Ticket No</option>
                    <option value="Subject">Subject</option>
                    <option value="Status">Status</option>
                  </select>
                </div>

                {/* Search input */}
                <div className="position-relative">
                  <div className="st-filter-label">Search</div>
                  <input
                    type="text"
                    className="st-filter-input"
                    placeholder="Enter search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  />
                </div>

                {/* Buttons */}
                <div className="button-group">
                  <button className="st-search-btn" onClick={applySearch}>
                    Search
                  </button>
                  {(filterColumn || searchInput) && (
                    <button className="icon-btn reset" onClick={resetSearch}>
                      <i className="material-symbols-outlined">refresh</i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          {/* Toolbar: page size + export */}
          {!tableLoading && hasData && (
            <div className="table-toolbar">
              <div className="page-size">
                <select
                  value={perPage}
                  className="st-filter-select"
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setPerPage(size);
                    setPage(1);
                    fetchGridData({ pageOverride: 1, perPageOverride: size });
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>
              </div>
              <div className={`export-wrapper ${!canExport ? "disabled" : ""}`}>
                <ExportButtons
                  title="Support Ticket Report"
                  columns={exportColumns}
                  fetchData={fetchExportData}
                  disabled={!canExport}
                />
              </div>
            </div>
          )}
          <div className="trezo-card-content">
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
                  rowCount={totalRows}
                  onChangePage={handlePageChange}
                />
              )}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSort={handleSort}
              sortServer
              progressPending={tableLoading}
              progressComponent={
                <TableSkeleton rows={perPage} columns={columns.length || 8} />
              }
              conditionalRowStyles={[
                {
                  when: (row: any) => row.__isTotal,
                  style: {
                    fontWeight: 700,
                    backgroundColor: "var(--color-primary-table-bg)",
                  },
                },
              ]}
              noDataComponent={!tableLoading && <NoDataFound />}
              defaultSortFieldId={sortIndex}
            />
          </div>
        </div>

        {/* ── CREATE TICKET MODAL ───────────────────────────────────────────── */}
        {showCreate && (
          <div
            className="st-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreate(false);
            }}
          >
            <div className="st-modal">
              <div className="st-modal-header">
                <div className="st-modal-title">Create New Ticket</div>
                <button
                  className="st-modal-close"
                  onClick={() => setShowCreate(false)}
                >
                  ✕
                </button>
              </div>

              {/* TYPE */}
              <div className="st-form-group">
                <label className="st-form-label">Select Type</label>
                <select
                  className="st-form-control"
                  value={selType}
                  onChange={(e) => setSelType(e.target.value)}
                >
                  <option value="">Select Ticket Type</option>
                  {taskTypes.map((tp) => (
                    <option key={tp.value} value={tp.value}>
                      {tp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}
              <div className="st-form-group">
                <label className="st-form-label">Query Title</label>
                <input
                  className="st-form-control"
                  placeholder="Enter your query title..."
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div className="st-form-group">
                <label className="st-form-label">Query Description</label>
                <textarea
                  className="st-form-control"
                  placeholder="Describe your issue in detail..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              {/* ATTACHMENT */}
              <div className="st-form-group">
                <label className="st-form-label">Attachment</label>
                <label className="st-file-upload">
                  <input type="file" onChange={handleAttachmentUpload} />
                  <div className="upload-ui">
                    <span className="upload-icon">📎</span>
                    <span className="upload-text">
                      {attachment ? attachment.name : "Choose file"}
                    </span>
                    <span className="upload-btn">Browse</span>
                  </div>
                </label>
              </div>

              {/* ACTIONS */}
              <div className="st-modal-actions">
                <button
                  className="st-btn-secondary"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  className="st-btn-primary"
                  onClick={handleCreate}
                  disabled={!form.title.trim() || !selType}
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CHAT MODAL ────────────────────────────────────────────────────── */}
        {chatTicket && (
          <div
            className="chat-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setChatTicket(null);
            }}
          >
            <div className="chat-box">
              {/* Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-av">S</div>
                  <div>
                    <div className="chat-title">
                      {chatTicket.title}
                      <span className="ticket-no">
                        #{chatTicket.taskNumber}
                      </span>
                    </div>
                    <div className="chat-meta">
                      <span className="chat-online-dot" />
                      Support Team
                      <span className={`chat-status ${chatTicket.status}`}>
                        ● {STATUS_LABEL[chatTicket.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="chat-close-btn"
                  onClick={() => setChatTicket(null)}
                >
                  ✕
                </button>
              </div>

              {/* Info bar */}
              <div className="chat-infobar">
                <div className="chat-info-chip">
                  🎫 Ticket{" "}
                  <strong>#{String(chatTicket.taskNumber).slice(-5)}</strong>
                </div>
                <div className="chat-info-chip">
                  📂 <strong>{chatTicket.type}</strong>
                </div>
                <div className="chat-info-chip">
                  📅 <strong>{fmtDate(chatTicket.createdAt)}</strong>
                </div>
                <div className="chat-info-chip">
                  <span
                    dangerouslySetInnerHTML={{ __html: chatTicket.statusHtml }}
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="chat-msgs">
                {msgs.map((m: any, idx: number) => {
                  const isUser = m.role === "user";
                  const prev = msgs[idx - 1];
                  const showDay =
                    !prev || fmtDate(prev.time) !== fmtDate(m.time);
                  return (
                    <div key={m.id}>
                      {showDay && (
                        <div className="day-sep">── {fmtDate(m.time)} ──</div>
                      )}
                      <div className={`msg-row${isUser ? " from-user" : ""}`}>
                        <div className={`msg-icon ${isUser ? "usr" : "sup"}`}>
                          {isUser ? "Y" : "S"}
                        </div>
                        <div
                          className={`msg-wrap${isUser ? " from-user" : ""}`}
                        >
                          <div className={`bubble ${isUser ? "usr" : "sup"}`}>
                            {m.text.split("\n").map((l: string, i: number) => (
                              <span key={i}>
                                {l}
                                {i < m.text.split("\n").length - 1 && <br />}
                              </span>
                            ))}
                          </div>
                          <div className="msg-time">{fmtTime(m.time)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div className="msg-row">
                    <div className="msg-icon sup">S</div>
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className={`chat-input-area ${isClosed ? "disabled" : ""}`}>
                <textarea
                  className="chat-input"
                  placeholder={
                    isClosed
                      ? "This ticket is closed. You can no longer reply."
                      : "Type your message… (Enter to send)"
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={onKey}
                  rows={1}
                  disabled={isClosed}
                />
                <button
                  className="chat-send"
                  onClick={sendMsg}
                  disabled={!chatInput.trim() || isClosed}
                  title="Send"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
