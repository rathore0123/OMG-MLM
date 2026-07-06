import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import { useLocation } from "react-router-dom";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import CustomPagination from "../../../CommonElements/DataTableComponent/CommonFormElements/Pagination/CustomPagination";
import { customStyles } from "../../../CommonElements/DataTableComponent/CustomStyle/CustomStyle";
import ExportButtons from "../../../CommonElements/DataTableComponent/CommonFormElements/ExportButtons/ExportButtons";
import StatsCardsTrezo from "../../../CommonElements/DataTableComponent/CommonFormElements/StatsCard/StatsCards";
import TableSkeleton from "../../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/TableSkeleton";
import LandingIllustration from "../../../CommonElements/DataTableComponent/CommonFormElements/LandingIllustration/LandingIllustration";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { SponsorIncomeReport } from "../../../utils/Constant";
import DateRangeFilter from "../../../CommonElements/DateRangePicker/DateRange";
import NoDataFound from "../../../CommonElements/NodataFound/NoDataFound";
import { useCurrency } from "../../../Context/CurrencyContext";
import { decryptData } from "../../../utils/helper/Crypto";
import { Container } from "react-bootstrap";

/* ─── helpers ─────────────────────────────────────── */
const today = new Date();
today.setHours(0, 0, 0, 0);
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const fromStr = format(oneYearAgo, "yyyy-MM-dd");
const toStr = format(today, "yyyy-MM-dd");

const getEmployeeId = () => {
  try {
    const saved = localStorage.getItem("EmployeeDetails");
    return saved ? JSON.parse(saved).EmployeeId : 0;
  } catch {
    return 0;
  }
};

/* ─── types ───────────────────────────────────────── */
interface DateRange {
  from: string;
  to: string;
}

/* ─────────────────────────────────────────────────── */
const Template: React.FC = () => {
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [searchInput, setSearchInput] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [showTable, setShowTable] = useState(true);
  const { universalService } = ApiService();
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortIndex, setSortIndex] = useState("");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [visibleColumns, setVisibleColumns] = useState<any[]>([]);
  const [stats, setStats] = useState({});
  const [columnsReady, setColumnsReady] = useState(false);
  const [tableLoading, setTableLoading] = useState(false); // FIX: start false — no flicker before first search
  const [refreshGrid, setRefreshGrid] = useState(0);
  //centralised values
  const procedureName = "FetchSponsorIncome";
  const pageTitle = SponsorIncomeReport;
  const landingPageTitle = "Sponsor Income";
  const breadCrumbs = {
    parent: "Payout Income",
    child: "Sponsor Income",
  };

  // ── Date range ──────────────────────────────────────────────────────────
  // `pendingRange` — staged in the picker, NOT sent to API until Search pressed
  // `dateRange`    — committed range that actually drives API calls
  const [pendingRange, setPendingRange] = useState<DateRange>({
    from: fromStr,
    to: toStr,
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: fromStr,
    to: toStr,
  });

  // FIX: ref so fetchGridData always reads the latest dateRange without
  // needing it in its dependency array (avoids infinite loop)
  const dateRangeRef = useRef<DateRange>(dateRange);
  useEffect(() => {
    dateRangeRef.current = dateRange;
  }, [dateRange]);
  // ────────────────────────────────────────────────────────────────────────

  const location = useLocation();
  const formName = location.pathname.split("/").pop();
  const canExport = true;
  const { currency } = useCurrency();

  const statsConfig = [
    {
      key: "TodayIncome",
      title: "Today Income",
      showCurrency: true,
      sub: "Today Income",
      color: "var(--btn-bg), #7209b7",
      icon: "✏️",
    },
    {
      key: "ThisMonthIncome",
      title: "This Month Income",
      showCurrency: true,
      sub: "This Month Income",
      color: "var(--btn-bg), #7209b7",
      icon: "📋",
    },
    {
      key: "LastMonthIncome",
      title: "Last Month Income",
      showCurrency: true,
      sub: "Last Month Income",
      color: "var(--btn-bg), #4cc9f0",
      icon: "✅",
    },
    {
      key: "LifetimeIncome",
      title: "Lifetime Income",
      showCurrency: true,
      sub: "Life Time Income",
      color: "var(--btn-bg), #f72585",
      icon: "🎫",
    },
  ];

  // Daily cap info banner (static — driven by BinaryIncomeSetting values)
  const dailyCapInfo = { pairRate: 150, dailyCap: 50, maxDaily: 7500 };

  /* ── Handlers ── */
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

  /* ── Fetch columns ── */
  const fetchGridColumns = useCallback(async () => {
    try {
      const payload = {
        procName: "GetUserGridColumns",
        Para: JSON.stringify({
          UserId: getEmployeeId(),
          GridName: "USP_" + procedureName,
        }),
      };
      const res = await universalService(payload);
      const data = res?.data ?? res;

      if (!Array.isArray(data)) {
        setColumns([]);
        return;
      }

      const visibleSorted = data
        .filter((c: any) => c.IsVisible)
        .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder);

      const defaultSortCol = visibleSorted.find((c: any) => c.isSort);
      if (defaultSortCol) {
        setSortIndex("");
        setSortDirection(
          (defaultSortCol.SortDir || "ASC").toUpperCase() === "DESC"
            ? "DESC"
            : "ASC",
        );
      }

      const reactCols = visibleSorted.map((c: any, index: number) => {
        const formatCurrency = (val: number) => {
          const formatted = Number(val).toLocaleString();

          return currency.symbol.length === 1
            ? `${currency.symbol}${formatted}` // $1
            : `${formatted} ${currency.symbol}`; // 1USDT
        };

        return {
          id: index + 1,
          name: c.DisplayName,
          sortable: true,
          columnKey: c.ColumnKey,
          columnIndex: c.ColumnKey,
          isCurrency: c.IsCurrency,
          isTotal: c.IsTotal,
          selector: (row: any) => row[c.ColumnKey],

          cell: (row: any) => {
            if (row.__isTotal) {
              if (index === 0) return "Total";

              if (c.IsTotal) {
                const value = row[c.ColumnKey] || 0;

                return c.IsCurrency
                  ? formatCurrency(value)
                  : Number(value).toLocaleString();
              }

              return "";
            }

            const value = row[c.ColumnKey];

            // ✅ render HTML if string contains tags
            if (typeof value === "string" && value.includes("<")) {
              return <span dangerouslySetInnerHTML={{ __html: value }} />;
            }

            if (c.IsCurrency && value != null) {
              return formatCurrency(value);
            }

            return value ?? "-";
          },
        };
      });

      setColumns([...reactCols]);
    } catch (err) {
      console.error("Grid columns fetch failed", err);
      setColumns([]);
    }
  }, [refreshGrid]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Export ── */
  const exportColumns = columns
    .filter((c) => c.columnKey)
    .map((c) => ({ key: c.columnKey, label: c.name }));

  const fetchExportData = useCallback(async () => {
    const range = dateRangeRef.current;
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({
        SearchBy: filterColumn,
        Criteria: searchInput,
        Page: page,
        PageSize: 0,
        SortIndexColumn: sortIndex,
        SortDir: sortDirection,
        FromDate: range.from || null,
        ToDate: range.to || null,
        // ClientId: ClientID,
      }),
    };
    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  }, [filterColumn, searchInput, page, sortIndex, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Stats ── */
  const GetStats = useCallback(async () => {
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({
        ActionMode: "GetStats",
        // ClientId: ClientID,
      }),
    };
    const res = await universalService(payload);
    const result = res?.data ?? res ?? [];
    setStats(result[0] || {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Grid data ──
     FIX: reads dateRange from ref so this function stays stable and
     doesn't need dateRange in its closure (avoids double-fetch on apply). */
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
            SearchBy: options?.searchBy ?? filterColumn ?? "",
            Criteria: options?.criteria ?? searchInput ?? "",
            Page: pageToUse,
            PageSize: perPageToUse,
            SortIndexColumn: sortIndex,
            SortDir: sortDirection,
            FromDate: rangeToUse.from || null,
            ToDate: rangeToUse.to || null,
            // ClientId: ClientID,
          }),
        };

        const res = await universalService(payload);
        const result = res?.data ?? res;

        if (result?.rows && Array.isArray(result.rows)) {
          setData(result.rows);
          setTotalRows(result[0]?.TotalRecords ?? 0);
        } else if (Array.isArray(result)) {
          setData(result);
          setTotalRows(result[0]?.TotalRecords ?? 0);
        } else {
          setData([]);
          setTotalRows(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTableLoading(false);
      }
    },
    [page, perPage, sortIndex, sortDirection, filterColumn, searchInput],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Effects ── */
  useEffect(() => {
    fetchGridColumns();
    GetStats();
  }, [refreshGrid]); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX: removed bare fetchGridData() call on mount — data only loads after Search
  // (matches the LandingIllustration pattern). If you want data on mount, uncomment:
  // useEffect(() => { fetchGridData(); }, []);

  // FIX: sortIndex/sortDirection changes re-fetch only when table is already visible
  useEffect(() => {
    if (!showTable) return;
    fetchGridData({ pageOverride: 1 });
    setPage(1);
  }, [sortIndex, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Search / Apply ──
     1. Commits pendingRange → dateRange  (updates ref immediately via the useEffect above)
     2. Calls fetchGridData with the new range passed explicitly (avoids stale-closure read)
     3. Bumps searchTrigger only for other consumers that might need it
  ── */
  const applySearch = () => {
    const committedRange: DateRange = {
      from: pendingRange.from,
      to: pendingRange.to,
    };

    setShowTable(true);
    setDateRange(committedRange); // for display / export
    dateRangeRef.current = committedRange; // update ref immediately before async call
    setPage(1);
    setSearchTrigger((p) => p + 1);

    fetchGridData({
      pageOverride: 1,
      rangeOverride: committedRange, // pass explicitly — ref update is sync but setState is not
      searchBy: filterColumn,
      criteria: searchInput,
    });
  };

  /* ── Reset search ── */
  const resetSearch = () => {
    setFilterColumn("");
    setSearchInput("");
    setPage(1);
    setSearchTrigger((p) => p + 1);
    fetchGridData({ pageOverride: 1, searchBy: "", criteria: "" });
  };

  /* ── Page totals ── */
  const hasData = data.length > 0;

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

  return (
    <>
      {/* HEADER */}
      <Breadcrumbs
        mainTitle={pageTitle}
        parent={breadCrumbs.parent}
        ChildName={breadCrumbs.child}
      />
      <Container fluid>
        <div className="trezo-card">
          <StatsCardsTrezo stats={stats} config={statsConfig} />

          {/* Daily cap info strip */}
          {/* <div
            className="d-flex align-items-center gap-3 flex-wrap px-3 py-2 mb-2 rounded"
            style={{
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.15)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#6366f1", fontWeight: 600 }}>
              Binary Income Rules (Active BV only):
            </span>
            <span>
              💰 <strong>₹{dailyCapInfo.pairRate}</strong>/pair
            </span>
            <span>
              🔒 Max <strong>{dailyCapInfo.dailyCap} pairs</strong>/day
            </span>
            <span>
              📈 Daily cap:{" "}
              <strong>₹{dailyCapInfo.maxDaily.toLocaleString()}</strong>
            </span>
            <span style={{ color: "#94a3b8" }}>
              Carry-forward applies when one leg is stronger
            </span>
          </div> */}

          <div className="trezo-card-header">
            <div className="header-actions">
              <div className="filter-group">
                {/* ── DATE RANGE FILTER ─────────────────────────────────────────
                onChange fires when the user clicks "Apply" inside the picker.
                Stored as pendingRange — NOT sent to API until Search is clicked.
            ──────────────────────────────────────────────────────────────── */}
                <div className="date-filter-placeholder">
                  <DateRangeFilter
                    initialRange={{ start: oneYearAgo, end: today }}
                    onChange={(range) => {
                      setPendingRange({
                        from: format(range.start, "yyyy-MM-dd"),
                        to: format(range.end, "yyyy-MM-dd"),
                      });
                    }}
                  />
                </div>

                {/* FILTER BY NAME */}
                <div className="filter-dropdown">
                  <div className="st-filter-label">Filter by Name</div>
                  <span className="icon-left">
                    <i className="material-symbols-outlined">filter_list</i>
                  </span>
                  <select
                    className="st-filter-select"
                    value={filterColumn}
                    onChange={(e) => setFilterColumn(e.target.value)}
                  >
                    <option value="">Select Filter Option</option>
                    <option value="BinaryIncome">Binary Income</option>
                  </select>
                </div>

                {/* SEARCH BY */}
                <div className="position-relative">
                  <div className="st-filter-label">Search By</div>
                  <input
                    type="text"
                    className="st-filter-input"
                    value={searchInput}
                    placeholder="Enter Criteria..."
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  />
                </div>

                {/* BUTTONS */}
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

          {/* LANDING */}
          {/* {!showTable && (
            <LandingIllustration
              title={pageTitle}
              formName={formName}
              addLabel="Add Income"
              description={
                <>
                  {`Search ${landingPageTitle} using filters above.`}
                  <br />
                  Manage records, export reports and analyse performance.
                </>
              }
            />
          )} */}

          {/* TABLE */}
          {showTable && (
            <div>
              {/* toolbar — only when data exists */}
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
                        fetchGridData({
                          pageOverride: 1,
                          perPageOverride: size,
                        });
                      }}
                    >
                      <option value="10">10 / page</option>
                      <option value="25">25 / page</option>
                      <option value="50">50 / page</option>
                      <option value="100">100 / page</option>
                    </select>
                  </div>
                  <div
                    className={`export-wrapper ${!canExport ? "disabled" : ""}`}
                  >
                    <ExportButtons
                      title={pageTitle}
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
                    <TableSkeleton
                      rows={perPage}
                      columns={columns.length || 8}
                    />
                  }
                  conditionalRowStyles={[
                    {
                      when: (row: any) => row.__isTotal,
                      style: {
                        fontWeight: 700,
                        backgroundColor: "var(--body-bg)",
                      },
                    },
                  ]}
                  noDataComponent={!tableLoading && <NoDataFound />}
                  defaultSortFieldId={sortIndex}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default Template;
