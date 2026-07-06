import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import { useLocation } from "react-router-dom";
import { ApiService } from "../../Service/UniversalService/ApiService";
import CustomPagination from "../../CommonElements/DataTableComponent/CommonFormElements/Pagination/CustomPagination";
import { customStyles } from "../../CommonElements/DataTableComponent/CustomStyle/CustomStyle";
import TableSkeleton from "../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/TableSkeleton";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import StatsCardsTrezo from "../../CommonElements/DataTableComponent/CommonFormElements/StatsCard/StatsCards";
import NoDataFound from "../../CommonElements/NodataFound/NoDataFound";

// Import Scss
import "./PromotionalTool.scss";

const Template: React.FC = () => {
  // --- State Management ---
  const [searchInput, setSearchInput] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const { universalService } = ApiService();
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortIndex, setSortIndex] = useState("");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [stats, setStats] = useState({});
  const [tableLoading, setTableLoading] = useState(true);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [hasPageAccess] = useState(true);

  const location = useLocation();

  // --- Centralized Constants ---
  const procedureName = "ManageLibraries";
  const pageTitle = "Promotional Tool";
  const breadCrumbs = { parent: "Home", child: "Promotional Tool" };

  // --- Mock Data ---
  const topCards = [
    {
      title: "Total Referrals",
      value: "125",
      change: "↑ 12.5% this month",
      icon: "👥",
    },
    { title: "Earnings", value: "$2,450", change: "↑ 8.3%", icon: "💰" },
    { title: "Click Rate", value: "18.2%", change: "↑ 4.1%", icon: "📈" },
    { title: "Active Subs", value: "89", change: "↑ 2.5%", icon: "⭐" },
  ];

  const bottomCards = [
    {
      title: "Facebook Banner",
      size: "1200x628",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/58/AcetoFive.JPG",
    },
    {
      title: "Instagram Story",
      size: "1080x1920",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/58/AcetoFive.JPG",
    },
    {
      title: "Twitter Post",
      size: "1024x512",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/58/AcetoFive.JPG",
    },
    {
      title: "LinkedIn Header",
      size: "1584x396",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/58/AcetoFive.JPG",
    },
  ];

  const statsConfig = [
    {
      key: "TodayIncome",
      title: "Today Income",
      showCurrency: true,
      sub: "Daily Earnings",
      color: "#7209b7",
      icon: "✏️",
    },
    {
      key: "LifetimeIncome",
      title: "Lifetime Income",
      showCurrency: true,
      sub: "Total Earnings",
      color: "#f72585",
      icon: "🎫",
    },
    {
      key: "LastMonthIncome",
      title: "Last Month Income",
      showCurrency: true,
      sub: "Previous Month",
      color: "#4cc9f0",
      icon: "✅",
    },
    {
      key: "ThisMonthIncome",
      title: "This Month Income",
      showCurrency: true,
      sub: "Current Progress",
      color: "#7209b7",
      icon: "📋",
    },
  ];

  // --- API Functions ---
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
      const resData = res?.data || res;
      if (Array.isArray(resData)) {
        const reactCols = resData
          .filter((c: any) => c.IsVisible)
          .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder)
          .map((c: any, index: number) => ({
            id: index + 1,
            name: c.DisplayName,
            sortable: true,
            columnKey: c.ColumnKey,
            selector: (row: any) => row[c.ColumnKey],
            cell: (row: any) => {
              if (row.__isTotal) {
                if (index === 0) return "Total";
                if (c.IsTotal) {
                  const val = row[c.ColumnKey] || 0;
                  return c.IsCurrency
                    ? `$${Number(val).toLocaleString()}`
                    : Number(val).toLocaleString();
                }
                return "";
              }
              const value = row[c.ColumnKey];
              if (c.ColumnKey === "FileUrl") {
                return (
                  <a
                    className="hover:text-blue-500"
                    target="_blank"
                    href={`${import.meta.env.VITE_IMAGE_PREVIEW_URL}${value}`}
                  >
                    View
                  </a>
                );
              }

              if (c.IsCurrency && value != null)
                return `$${Number(value).toLocaleString()}`;
              return value ?? "-";
            },
          }));
        setColumns(reactCols);
      }
    } catch (err) {
      console.error("Columns fetch failed", err);
    }
  };

  const fetchGridData = async () => {
    try {
      setTableLoading(true);
      const payload = {
        procName: procedureName,
        Para: JSON.stringify({
          SearchBy: filterColumn,
          Criteria: searchInput,
          Page: page,
          PageSize: perPage,
          SortIndexColumn: sortIndex,
          SortDir: sortDirection,
        }),
      };
      const res = await universalService(payload);
      const result = res?.data || res;
      const rows = Array.isArray(result) ? result : result?.rows || [];
      setData(rows);
      setTotalRows(rows[0]?.TotalRecords || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  const GetStats = async () => {
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({ ActionMode: "GetStats" }),
    };
    const res = await universalService(payload);
    const result = res?.data ?? res ?? [];
    setStats(result[0] || {});
  };

  // --- Handlers ---
  const handleSort = (column: any, direction: string) => {
    if (!column?.columnKey) return;
    setSortIndex(column.columnKey);
    setSortDirection(direction.toUpperCase());
  };

  const handlePageChange = (p: number) => setPage(p);
  const handlePerRowsChange = (newSize: number) => {
    setPerPage(newSize);
    setPage(1);
  };

  // --- Lifecycle ---
  useEffect(() => {
    fetchGridColumns();
    GetStats();
  }, [refreshGrid]);

  useEffect(() => {
    fetchGridData();
  }, [page, perPage, sortIndex, sortDirection]);

  // --- Table Data Prep ---
  const pageTotals: any = {};
  columns.forEach((col: any) => {
    if (col.isTotal && col.columnKey) {
      pageTotals[col.columnKey] = data.reduce(
        (sum, row) => sum + Number(row[col.columnKey] || 0),
        0,
      );
    }
  });

  const totalRow =
    Object.keys(pageTotals).length > 0
      ? { ...pageTotals, __isTotal: true }
      : null;
  const tableData = data.length > 0 && totalRow ? [...data, totalRow] : data;

  if (!hasPageAccess) return <div className="p-4">Access Restricted</div>;

  return (
    <div className="trezo-card promotional-tool-container">
      <Breadcrumbs
        mainTitle={pageTitle}
        parent={breadCrumbs.parent}
        ChildName={breadCrumbs.child}
      />

      {/* 1. HERO SECTION */}
      <div className="promo-hero">
        <div className="hero-left">
          <span className="hero-tag">Marketing Tool</span>
          <h2>Share. Invite. Earn.</h2>
          <p>
            Professional assets to help you expand your network and maximize
            your potential earnings.
          </p>
        </div>
        <div className="ref-card">
          <p className="st-filter-label" style={{ color: "#fff" }}>
            Referral Link
          </p>
          <div className="ref-input-group">
            <input
              className="st-filter-input input-field"
              value="https://mlm.com/ref/MLM824744"
              readOnly
            />
            <button
              className="st-search-btn copy-btn"
              onClick={() =>
                navigator.clipboard.writeText("https://mlm.com/ref/MLM824744")
              }
            >
              📋
            </button>
          </div>
          <div className="quick-share">
            <span>Quick Share:</span>
            {["📱", "📘", "✈️", "🐦"].map((icon, i) => (
              <button key={i} className="share-icon-btn">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. STATS SECTION */}
      <StatsCardsTrezo
        stats={stats}
        config={statsConfig}
        loading={tableLoading}
      />

      {/* 3. PERFORMANCE OVERVIEW */}
      {/* <div className="trezo-card-header section-header">
        <h3 className="header-title">Performance Overview</h3>
        <p className="header-sub">
          Analyze your promotional efficiency and referral traffic
        </p>
      </div>
      <div className="trezo-card-content grid-container">
        {topCards.map((card, index) => (
          <div key={index} className="performance-card">
            <div className="icon-box">{card.icon}</div>
            <div>
              <div className="st-filter-label" style={{ color: "#888" }}>
                {card.title}
              </div>
              <div className="card-value">{card.value}</div>
              <div className="card-change">{card.change}</div>
            </div>
          </div>
        ))}
      </div> */}

      {/* 4. DATA TABLE SECTION */}
      <div className="trezo-card-header section-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h3 className="header-title">Income Logs</h3>
            <p className="header-sub">
              Detailed breakdown of earnings generated through marketing
              materials
            </p>
          </div>
          <div className="filter-group">
            <div className="position-relative">
              <span className="st-filter-label">Search Income</span>
              <input
                type="text"
                className="st-filter-input"
                value={searchInput}
                placeholder="Enter Criteria..."
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

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
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          sortServer
          progressPending={tableLoading}
          progressComponent={
            <TableSkeleton rows={perPage} columns={columns.length || 6} />
          }
          conditionalRowStyles={[
            {
              when: (row: any) => row.__isTotal,
              style: {
                fontWeight: 700,
                backgroundColor: "var(--body-bg)",
                color: "var(--btn-bg)",
              },
            },
          ]}
          noDataComponent={!tableLoading && <NoDataFound />}
        />
      </div>

      {/* 5. PROMOTIONAL BANNERS */}
      <div className="trezo-card-header section-header">
        <h3 className="header-title">Marketing Assets</h3>
        <p className="header-sub">
          Download high-quality banners optimized for social media platforms
        </p>
      </div>
      <div className="trezo-card-content grid-container">
        {bottomCards.map((card, index) => (
          <div key={index} className="banner-card">
            <img src={card.image} alt={card.title} className="banner-image" />
            <div className="banner-footer">
              <div className="asset-info">
                <div
                  className="st-filter-label"
                  style={{ fontWeight: "600", color: "#333" }}
                >
                  {card.title}
                </div>
                <div className="asset-size">{card.size}</div>
              </div>
              <button className="st-search-btn download-btn">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Template;
