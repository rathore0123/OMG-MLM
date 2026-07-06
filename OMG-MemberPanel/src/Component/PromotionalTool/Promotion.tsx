import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { ApiService } from "../../Service/UniversalService/ApiService";
import CustomPagination from "../../CommonElements/DataTableComponent/CommonFormElements/Pagination/CustomPagination";
import { customStyles } from "../../CommonElements/DataTableComponent/CustomStyle/CustomStyle";
import TableSkeleton from "../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/TableSkeleton";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { decryptData } from "@/utils/helper/Crypto";
import "./PromotionalTool.scss";
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaTelegram,
  FaShare,
} from "react-icons/fa";
import NoDataFound from "../../CommonElements/NodataFound/NoDataFound";
import {
  ActionCell,
  handleDownload,
} from "../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/ActionCellDownload";

const Template: React.FC = () => {
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
  const [stats, setStats] = useState<any>({});
  const [tableLoading, setTableLoading] = useState(true);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "documents" | "banners" | "videos"
  >("documents");
  const [copied, setCopied] = useState(false);

  // ── Left / Right referral link toggle ──
  const [referralSide, setReferralSide] = useState<"left" | "right">("left");

  const userName = localStorage.getItem("UserName");

  const procedureName = "ManageLibraries";
  const pageTitle = "Promotional Tools";

  const REGISTRATION_URL = window.location.origin + "/member/register";

  const safeDecrypt = (encryptedData: string | null): string => {
    if (!encryptedData) return "";
    try {
      const decrypted = decryptData(encryptedData);
      return decrypted || "";
    } catch (error) {
      console.error("Decryption error:", error);
      return "";
    }
  };

  // NOTE: Adjust these two URL patterns to match however your backend
  // actually differentiates left-leg vs right-leg placement
  // (query param, separate route, etc).
  const getSponsorId = () => {
    // Try multiple sources for the sponsor ID
    const username = localStorage.getItem("UserName");
    console.log(username);
    if (username) return username;

    // Try localStorage with safe decryption
    const encryptedClientId = localStorage.getItem("clientId");
    if (encryptedClientId) {
      const decrypted = safeDecrypt(encryptedClientId);
      if (decrypted) return decrypted;
    }

    const encryptedUsername = localStorage.getItem("username");
    if (encryptedUsername) {
      const decrypted = safeDecrypt(encryptedUsername);
      if (decrypted) return decrypted;
    }

    // Fallback to a default or empty string
    return "";
  };

  const leftReferralLink = getSponsorId()
    ? `${REGISTRATION_URL}?sponsor=${encodeURIComponent(getSponsorId())}&position=left`
    : `${REGISTRATION_URL}?position=left`;

  const rightReferralLink = getSponsorId()
    ? `${REGISTRATION_URL}?sponsor=${encodeURIComponent(getSponsorId())}&position=right`
    : `${REGISTRATION_URL}?position=right`;
  const referralLink =
    referralSide === "left" ? leftReferralLink : rightReferralLink;

  // --- Mock documents ---
  // const documents = [
  //   {
  //     icon: "📄",
  //     color: "#e53935",
  //     name: "Company Profile.pdf",
  //     desc: "Company Information & Plan Details",
  //     size: "2.4 MB",
  //     updated: "10 Jan 2024",
  //   },
  //   {
  //     icon: "📘",
  //     color: "#1565c0",
  //     name: "Marketing Plan.docx",
  //     desc: "Compensation & Benefits Plan",
  //     size: "1.8 MB",
  //     updated: "08 Jan 2024",
  //   },
  //   {
  //     icon: "📊",
  //     color: "#2e7d32",
  //     name: "Product Overview.xlsx",
  //     desc: "Investment Packages & Returns",
  //     size: "957 KB",
  //     updated: "05 Jan 2024",
  //   },
  //   {
  //     icon: "📑",
  //     color: "#e65100",
  //     name: "Business Presentation.pptx",
  //     desc: "MLM Business Presentation",
  //     size: "5.2 MB",
  //     updated: "01 Jan 2024",
  //   },
  // ];

  const [documents, setDocuments] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  const handleFetchData = (tab: "documents" | "banners" | "videos") => {
    setActiveTab(tab);
  };

  const quickShareTools = [
    {
      icon: "🔗",
      label: "Copy Referral Link",
      sub: "Copy & Share",
      bg: "#f0f4ff",
      color: "#2b6cff",
      action: "copy",
    },
    {
      icon: <FaWhatsapp />,
      label: "Share on WhatsApp",
      sub: "Share Now",
      bg: "#e8faf0",
      color: "#25d366",
      action: "whatsapp",
    },
    {
      icon: <FaFacebook />,
      label: "Share on Facebook",
      sub: "Share Now",
      bg: "#e8f0ff",
      color: "#1877f2",
      action: "facebook",
    },
    {
      icon: <FaTelegram />,
      label: "Share on Telegram",
      sub: "Share Now",
      bg: "#e8f6ff",
      color: "#0088cc",
      action: "telegram",
    },
    {
      icon: <FaTwitter />,
      label: "Share on Twitter",
      sub: "Share Now",
      bg: "#e8f8ff",
      color: "#1da1f2",
      action: "twitter",
    },
  ];

  // --- Stats from API or fallback ---
  const statsCards = [
    {
      icon: "👥",
      label: "Total Referrals",
      value: stats?.TotalReferrals ?? "125",
      change: "↑ 12.5% this month",
      changeColor: "#16c784",
    },
    {
      icon: "💰",
      label: "Total Earnings",
      value: stats?.TotalEarnings ? `$${stats.TotalEarnings}` : "$2,450.50",
      change: "↑ 8.3%  this month",
      changeColor: "#16c784",
    },
    {
      icon: "📈",
      label: "Conversion Rate",
      value: stats?.ConversionRate ?? "18.6%",
      change: "↑ 2.4%  this month",
      changeColor: "#16c784",
    },
    {
      icon: "⬇️",
      label: "Marketing Downloads",
      value: stats?.MarketingDownloads ?? "48",
      change: "This Week",
      changeColor: "#888",
    },
  ];

  // --- API ---
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
                    href={`${import.meta.env.VITE_IMAGE_PREVIEW_URL}/CompanyDocs/${value}`}
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

        const actionColumn = {
          name: "Action",
          cell: (row: any) => {
            if (row.__isTotal) return null; // ⭐ hide buttons on total row

            return <ActionCell row={row} onDownload={handleDownload} />;
          },
          ignoreRowClick: true,
          button: true,
        };
        setColumns([...reactCols, actionColumn]);
      } else {
        setColumns([]);
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

      const docs = rows.filter(
        (row: any) => row.LibraryType?.toLowerCase() === "document",
      );

      const bannersData = rows.filter(
        (row: any) => row.LibraryType?.toLowerCase() === "banner",
      );

      setDocuments(docs);
      setBanners(bannersData);

      setData(docs); // default for table
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

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSideToggle = (side: "left" | "right") => {
    setReferralSide(side);
    setCopied(false);
  };

  const handleShare = (platform: string) => {
    const encoded = encodeURIComponent(referralLink);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?url=${encoded}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
  };

  useEffect(() => {
    fetchGridColumns();
    GetStats();
  }, [refreshGrid]);
  useEffect(() => {
    fetchGridData();
  }, [page, perPage, sortIndex, sortDirection]);

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

  return (
    <div className="promo-page">
      {/* Breadcrumb + Header */}
      <Breadcrumbs
        mainTitle={pageTitle}
        parent="Home"
        ChildName="Promotional Tools"
      />

      {/* <div className="promo-top-header">
        <div>
          <p className="promo-main-sub">Share & Grow Your Network</p>
        </div>
        <button className="promo-guide-btn">Marketing Guide</button>
      </div> */}

      {/* ── HERO BANNER ── */}
      <div className="promo-hero">
        <div className="hero-left">
          <span className="hero-tag">Grow Your Business</span>
          <h2>Share. Invite. Earn.</h2>
          <p>
            Use our professional marketing tools to attract new members and
            boost your earnings.
          </p>
        </div>

        <div className="hero-center-icons">
          <div className="hero-icon-circle blue-dark">
            <span>🔗</span>
          </div>
          <div className="hero-icon-circle blue-mid">
            <span>📢</span>
          </div>
          <div className="hero-icon-circle blue-light">
            <span>👥</span>
          </div>
          <div className="hero-icon-circle share-circle">
            <span>📤</span>
          </div>
        </div>

        <div className="ref-card">
          <div className="ref-card-head">
            <p className="ref-label">Your Referral Link</p>
            <div className="ref-side-toggle">
              <button
                type="button"
                className={`ref-side-button ${referralSide === "left" ? "active" : ""}`}
                onClick={() => handleSideToggle("left")}
              >
                {referralSide === "left" && <span>←</span>}
                Left Leg
              </button>
              <button
                type="button"
                className={`ref-side-button ${referralSide === "right" ? "active" : ""}`}
                onClick={() => handleSideToggle("right")}
              >
                Right Leg
                {referralSide === "right" && <span>→</span>}
              </button>
            </div>
          </div>

          <div className="ref-input-row">
            <input className="ref-input" value={referralLink} readOnly />
            <button className="ref-copy-btn" onClick={handleCopy} title="Copy">
              {copied ? "✓" : "📋"}
            </button>
          </div>
          <div className="ref-share-row">
            <span>Share on:</span>
            <button
              className="soc-btn whatsapp"
              onClick={() => handleShare("whatsapp")}
            >
              <FaWhatsapp />
            </button>
            <button
              className="soc-btn facebook"
              onClick={() => handleShare("facebook")}
            >
              <FaFacebook />
            </button>
            <button
              className="soc-btn telegram"
              onClick={() => handleShare("telegram")}
            >
              <FaTelegram />
            </button>
            <button
              className="soc-btn twitter"
              onClick={() => handleShare("twitter")}
            >
              <FaTwitter />
            </button>
          </div>
        </div>
      </div>

      {/* ── QUICK SHARE TOOLS ── */}
      {/* <div className="promo-section-header">
        <h3>Quick Share Tools</h3>
        <p>Share instantly through social media or copy link</p>
      </div>
      <div className="quick-share-row">
        {quickShareTools.map((t, i) => (
          <button
            key={i}
            className="quick-share-card"
            style={{ background: t.bg }}
            onClick={() =>
              t.action === "copy" ? handleCopy() : handleShare(t.action)
            }
          >
            <span className="qs-icon" style={{ color: t.color }}>
              {t.icon}
            </span>
            <div>
              <p className="qs-label" style={{ color: t.color }}>
                {t.label}
              </p>
              <p className="qs-sub">{t.sub}</p>
            </div>
          </button>
        ))}
      </div> */}

      {/* ── MARKETING MATERIALS ── */}
      <div className="promo-section-header" style={{ marginTop: 28 }}>
        <div>
          <h3>Marketing Materials</h3>
          <p>Download ready-to-use promotional content</p>
        </div>
        <a href="#" className="view-all-link">
          View All Documents
        </a>
      </div>

      {/* Tabs */}
      <div className="materials-tabs mb-3">
        <button
          className={`mat-tab ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => handleFetchData("documents")}
        >
          Documents
        </button>

        <button
          className={`mat-tab ${activeTab === "banners" ? "active" : ""}`}
          onClick={() => handleFetchData("banners")}
        >
          Banners
        </button>
      </div>

      <div>
        {activeTab === "documents" ? (
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
              <TableSkeleton rows={perPage} columns={columns.length || 8} />
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
        ) : (
          <div className="promo-banners-grid">
            {banners.map((b, i) => (
              <div key={i} className="promo-banner-card">
                <img
                  src={`${import.meta.env.VITE_IMAGE_PREVIEW_URL}/CompanyDocs/${b.FileUrl}`}
                  alt={b.title}
                />
                <div className="promo-banner-footer">
                  <div>
                    <p className="banner-title">{b.title}</p>
                    <p className="banner-size">{"2.4 MB"}</p>
                  </div>
                  <button className="mat-download-btn">Download</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PROMOTIONAL BANNERS ── */}
      <div className="promo-section-header" style={{ marginTop: 32 }}>
        <div>
          <h3>Promotional Banners</h3>
          <p>Eye-catching banners to attract more members</p>
        </div>
        <a href="#" className="view-all-link">
          View All Banners
        </a>
      </div>

      <div className="promo-banners-grid">
        {banners.map((b, i) => (
          <div key={i} className="promo-banner-card">
            <img
              src={`${import.meta.env.VITE_IMAGE_PREVIEW_URL}/CompanyDocs/${b.FileUrl}`}
              alt={b.title}
            />
            <div className="promo-banner-footer">
              <div>
                <p className="banner-title">{b.title}</p>
                <p className="banner-size">{"2.4 MB"}</p>
              </div>
              <div className="download-file">
                <a
                  download
                  className="mat-download-btn"
                  href={`${import.meta.env.VITE_IMAGE_PREVIEW_URL}/CompanyDocs/${b.FileUrl}`}
                >
                  Download
                </a>
                <a className="mat-download-btn">Share</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Template;
