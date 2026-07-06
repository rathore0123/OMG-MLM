import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DataTable from "react-data-table-component";

import { useLocation } from "react-router-dom";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import CustomPagination from "../../../CommonElements/DataTableComponent/CommonFormElements/Pagination/CustomPagination";
import ActionCell from "../../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/ActionCell";
import { customStyles } from "../../../CommonElements/DataTableComponent/CustomStyle/CustomStyle";
import ExportButtons from "../../../CommonElements/DataTableComponent/CommonFormElements/ExportButtons/ExportButtons";
import StatsCardsTrezo from "../../../CommonElements/DataTableComponent/CommonFormElements/StatsCard/StatsCards";
import TableSkeleton from "../../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/TableSkeleton";
import LandingIllustration from "../../../CommonElements/DataTableComponent/CommonFormElements/LandingIllustration/LandingIllustration";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import DateRangeFilter from "../../../CommonElements/DateRangePicker/DateRange";
import NoDataFound from "../../../CommonElements/NodataFound/NoDataFound";
import { P2PReport } from "../../../utils/Constant";
import { Container } from "react-bootstrap";
const Template: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [showTable, setShowTable] = useState(false); // Toggle to show 'Oops' or 'Welcome'
  const { universalService } = ApiService();
  const [hasVisitedTable, setHasVisitedTable] = useState(false);
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
  const [tableLoading, setTableLoading] = useState(true);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);
  const [initialSortReady, setInitialSortReady] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const formName = path.split("/").pop();
  const canExport = true;
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const fromStr = format(firstDayOfMonth, "yyyy-MM-dd");
  const toStr = format(today, "yyyy-MM-dd");
  const [dateRange, setDateRange] = useState({
    from: fromStr,
    to: toStr,
    preset: "thisMonth",
  });

  const pageTitle = P2PReport;
  const title = "P2P Report";
  const procedureName = "GetMemberToMemberTransferAmount";

  const statsConfig = [
    {
      key: "TotalTransfers",
      title: "Total Transfers",
      showCurrency: false,
      sub: "Total Transfers",
      color: "var(--btn-bg), #7209b7",
      icon: "✏️",
      // isGrad: true,
    },
    {
      key: "TotalAmount",
      title: "Total Amount",
      showCurrency: true,
      sub: "Total Amount",
      color: "var(--btn-bg), #f72585",
      icon: "🎫",
    },
    {
      key: "TotalFinalAmount",
      title: "Total Final Amount",
      showCurrency: true,
      sub: "Total Final Amount",
      color: "var(--btn-bg), #4cc9f0",
      icon: "✅",
    },
    {
      key: "TodayTransfer",
      title: "Today Transfer",
      showCurrency: true,
      sub: "Today Transfer",
      color: "var(--btn-bg), #7209b7",
      icon: "📋",
    },
  ];

  const handleSort = (column: any, direction: string) => {
    if (!column?.columnKey) return;
    setSortIndex(column.columnKey);
    setSortDirection(direction.toUpperCase());
  };
  const handlePageChange = (p: any) => {
    setPage(p);

    fetchGridData({
      ...dateRange,
      pageOverride: p,
    });
  };
  const handlePerRowsChange = (newPerPage: any, page: any) => {
    setPerPage(newPerPage);
    setPage(page);
  };
  const fetchGridColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    try {
      const payload = {
        procName: "GetUserGridColumns",
        Para: JSON.stringify({
          UserId: employeeId,
          GridName: "USP_" + procedureName,
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
          const index =
            visibleSorted.findIndex(
              (c: any) => c.ColumnKey === defaultSortCol.ColumnKey,
            ) + 1;

          setSortIndex("");
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
          .map((c: any, index: number) => ({
            id: index + 1,
            name: c.DisplayName,
            sortable: true,
            columnKey: c.ColumnKey,
            columnIndex: c.ColumnKey,
            isCurrency: c.IsCurrency,
            isTotal: c.IsTotal,

            selector: (row: any) => row[c.ColumnKey],

            cell: (row: any) => {
              // ⭐ TOTAL ROW
              if (row.__isTotal) {
                // 👉 show TOTAL text in first column
                if (index === 0) return "Total";

                if (c.IsTotal) {
                  const value = row[c.ColumnKey] || 0;

                  return c.IsCurrency
                    ? `$${Number(value).toLocaleString()}`
                    : Number(value).toLocaleString();
                }

                return "";
              }

              // ⭐ NORMAL ROW
              const value = row[c.ColumnKey];

              if (c.IsCurrency && value != null) {
                return `$${Number(value).toLocaleString()}`;
              }

              return value ?? "-";
            },
          }));
        const actionColumn = {
          name: "Action",
          cell: (row: any) => {
            if (row.__isTotal) return null;

            return (
              <ActionCell
                row={row}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          },
          ignoreRowClick: true,
          button: true,
        };

        setColumns([...reactCols]);
      } else {
        setColumns([]);
      }
    } catch (err) {
      console.error("Grid columns fetch failed", err);
      setColumns([]);
    }
  };
  const handleEdit = (row: any) => {
    console.log("Edit Row:", row.TotalRecords);
    // open modal or navigate
  };
  const exportColumns = columns
    .filter((c) => c.columnKey)
    .map((c) => ({
      key: c.columnKey,
      label: c.name,
    }));
  const fetchExportData = async () => {
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({
        SearchBy: filterColumn,
        Criteria: searchInput,
        Page: page,
        PageSize: 0,
        SortIndexColumn: sortIndex,
        SortDir: sortDirection,

        /* ⭐ DATE FILTER */
        FromDate: dateRange.from || null,
        ToDate: dateRange.to || null,
      }),
    };

    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  };
  const GetStats = async () => {
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({
        ActionMode: "GetStats",
      }),
    };

    const res = await universalService(payload);

    const result = res?.data ?? res ?? [];

    setStats(result[0] || {});

    return result;
  };

  const handleDelete = (row: any) => {
    if (confirm(`Delete ${row.UserName}?`)) {
      console.log("Delete Row:", row);
    }
  };

  const fetchGridData = async (options?: any) => {
    const range = options || dateRange;

    const pageToUse = options?.pageOverride ?? page;
    const perPageToUse = options?.perPageOverride ?? perPage;

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

          FromDate: range.from || null,
          ToDate: range.to || null,
        }),
      };

      const res = await universalService(payload);
      const result = res?.data || res;

      if (result?.rows && Array.isArray(result.rows)) {
        setData(result.rows);
        setTotalRows(result[0]?.TotalRecords || 0);
      } else if (Array.isArray(result)) {
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
  const fetchVisibleColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    const payload = {
      procName: "UniversalColumnSelector",
      Para: JSON.stringify({
        EmployeeId: employeeId,
        USPName: "USP_" + procedureName,
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
  useEffect(() => {
    fetchGridColumns();
    GetStats();
  }, [refreshGrid]);
  useEffect(() => {
    fetchGridData();
  }, []);
  useEffect(() => {
    fetchGridData();
  }, [page, perPage, sortIndex, sortDirection, searchTrigger, dateRange]);
  const applySearch = () => {
    setShowTable(true);
    setHasVisitedTable(true);
    setPage(1);
    setSearchTrigger((p) => p + 1);
  };

  const hasData = data.length > 0;

  const pageTotals: any = {};
  columns.forEach((col: any) => {
    if (!col.isTotal || !col.columnKey) return;

    pageTotals[col.columnKey] = data.reduce((sum: number, row: any) => {
      return sum + Number(row[col.columnKey] || 0);
    }, 0);
  });
  const totalRow =
    Object.keys(pageTotals).length > 0
      ? columns.reduce((acc: any, col: any, index: number) => {
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
    hasData && totalRow ? [...data, { ...totalRow, __isTotal: true }] : data;
  //   if (permissionsLoading) {
  //     return <Loader />;
  //   }

  if (!hasPageAccess) {
    return <div>Access Restrictd</div>;
  }

  return (
    <>
      {/* HEADER */}
      <Breadcrumbs mainTitle={pageTitle} parent={"P2P"} ChildName={pageTitle} />

      <Container fluid>
        <div className="trezo-card">
          <StatsCardsTrezo
            stats={stats}
            config={statsConfig}
            loading={tableLoading}
          />
          <div className="trezo-card-header">
            <div className="header-actions">
              <div className="filter-group">
                <div className="date-filter-placeholder">
                  <DateRangeFilter
                    initialRange={{
                      start: new Date(firstDayOfMonth),
                      end: new Date(today),
                    }}
                    onApply={(range) => {
                      const from = format(range.start, "yyyy-MM-dd");
                      const to = format(range.end, "yyyy-MM-dd");

                      setDateRange({ from, to, preset: "last30" });

                      setPage(1);
                      setSearchTrigger((p) => p + 1);
                    }}
                  />
                </div>

                {/* FILTER */}
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
                    <option value="Amount">Amount</option>
                    <option value="FromMember">From Member</option>
                    <option value="ToMember">To Member</option>
                  </select>
                </div>

                {/* SEARCH */}
                <div className="position-relative">
                  {/* <span className="icon-left">
                <i className="material-symbols-outlined">search</i>
              </span> */}
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
                    <button
                      className="icon-btn reset"
                      onClick={() => {
                        setFilterColumn("");
                        setSearchInput("");
                        setPage(1);
                        setSearchTrigger((p) => p + 1);
                      }}
                    >
                      <i className="material-symbols-outlined">refresh</i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* LANDING */}
          {!showTable && (
            <LandingIllustration
              title={title}
              formName={formName}
              addLabel="Add Income"
              description={
                <>
                  <p>{`Search ${title} using filters above.`}</p>
                  <p>{`Manage records, export reports and analyse performance.`}</p>
                </>
              }
            />
          )}

          {/* TABLE */}
          {showTable && (
            <div>
              {/* LOADING */}
              {tableLoading ? (
                <div className="table-loader">
                  <div className="loader-left"></div>
                  <div className="loader-right">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : hasData ? (
                <div className="table-toolbar">
                  {/* PAGE SIZE */}
                  <div className="page-size">
                    <select
                      value={perPage}
                      className="st-filter-select"
                      onChange={(e) => {
                        const size = Number(e.target.value);
                        setPerPage(size);
                        setPage(1);

                        fetchGridData({
                          ...dateRange,
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

                  {/* EXPORT */}
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
              ) : null}

              {/* TABLE */}
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
                      rowCount={perPage}
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
                      when: (row) => row.__isTotal,
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
