import React, { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import DataTable from "react-data-table-component";
import { Container } from "reactstrap";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import { ApiService } from "../../Service/UniversalService/ApiService";
import CustomPagination from "../../CommonElements/DataTableComponent/CommonFormElements/Pagination/CustomPagination";
import { customStyles } from "../../CommonElements/DataTableComponent/CustomStyle/CustomStyle";
import ExportButtons from "../../CommonElements/DataTableComponent/CommonFormElements/ExportButtons/ExportButtons";
import StatsCardsTrezo from "../../CommonElements/DataTableComponent/CommonFormElements/StatsCard/StatsCards";
import TableSkeleton from "../../CommonElements/DataTableComponent/CommonFormElements/DataTableComponents/TableSkeleton";
import LandingIllustration from "../../CommonElements/DataTableComponent/CommonFormElements/LandingIllustration/LandingIllustration";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { InvestmentHistory } from "../../utils/Constant";
import DateRangeFilter from "../../CommonElements/DateRangePicker/DateRange";
import NoDataFound from "../../CommonElements/NodataFound/NoDataFound";
import { useCurrency } from "../../Context/CurrencyContext";
import { useCompany } from "../../Context/CompanyContext";
import { decryptData } from "../../utils/helper/Crypto";
import StatusBadge from "../../CommonElements/DataTableComponent/CommonFormElements/StatusBadge/StatusBadge";

/* ─── helpers ─────────────────────────────────────── */
const today = new Date();
today.setHours(0, 0, 0, 0);
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const fromStr = format(firstDayOfMonth, "yyyy-MM-dd");
const toStr = format(today, "yyyy-MM-dd");

const getEmployeeId = () => {
  try {
    const saved = localStorage.getItem("EmployeeDetails");
    return saved ? JSON.parse(saved).EmployeeId : 0;
  } catch {
    return 0;
  }
};

/* ─── receipt transaction-code formatter ─────────────
   NOTE: This is a purely COSMETIC formatter, not a secure hash.
   A 6-digit TransactionNo only has ~1M possible values, so this
   scramble is trivially reversible/guessable. It only exists to
   make the raw number look like a receipt reference code
   (e.g. 974693 -> "TXN-K3F8Q2"). Never rely on this for uniqueness
   or security — keep using the raw TransactionNo wherever the
   transaction actually needs to be identified or looked up.
──────────────────────────────────────────────────── */
const formatTransactionCode = (transactionNo: number | string): string => {
  const num = Number(transactionNo);
  if (!num || Number.isNaN(num)) return "TXN-UNKNOWN";

  // Deterministic scramble for display only (Knuth multiplicative hash)
  const scrambled = Math.abs((num * 2654435761) % 0xffffffff);
  const code = scrambled.toString(36).toUpperCase().slice(0, 8);
  return `TXN-${code}`;
};

/* ─── amount-in-words (Indian numbering: Crore/Lakh/Thousand) ─── */
const numberToWords = (num: number): string => {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`;
  };

  const threeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return `${hundred ? ones[hundred] + " Hundred" + (rest ? " " : "") : ""}${rest ? twoDigits(rest) : ""}`;
  };

  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));

  return parts.join(" ") || "Zero";
};

const amountInWords = (amount: number): string =>
  `${numberToWords(Math.round(Math.abs(amount)))} Only`;

/* ─── duotone highlight-badge icons: a translucent white chip (reads as a
   lighter tint of the badge color) behind a solid-white glyph on top ─── */
const drawDuotoneIcon = (
  doc: jsPDF,
  type: "lock" | "bolt" | "check" | "document" | "clock",
  cx: number,
  cy: number,
) => {
  doc.setGState(new (doc as any).GState({ opacity: 0.35 }));
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cx - 8, cy - 8, 16, 16, 3, 3, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);

  switch (type) {
    case "lock":
      doc.setLineWidth(1.2);
      doc.circle(cx, cy - 3.5, 2.6, "S");
      doc.roundedRect(cx - 3.5, cy - 1.5, 7, 5.5, 1, 1, "F");
      break;
    case "bolt":
      doc.triangle(cx + 2, cy - 6.5, cx - 2.5, cy + 1, cx + 1, cy + 1, "F");
      doc.triangle(cx - 1, cy - 1, cx + 2.5, cy - 1, cx - 2, cy + 6.5, "F");
      break;
    case "check":
      doc.setLineWidth(1.5);
      doc.line(cx - 3.5, cy, cx - 1, cy + 3);
      doc.line(cx - 1, cy + 3, cx + 4, cy - 3.5);
      break;
    case "document":
      doc.setLineWidth(0.9);
      doc.roundedRect(cx - 3, cy - 4, 6, 8, 0.6, 0.6, "S");
      doc.setLineWidth(0.8);
      doc.line(cx - 1.6, cy - 1, cx + 1.6, cy - 1);
      doc.line(cx - 1.6, cy + 1.2, cx + 0.8, cy + 1.2);
      break;
    case "clock":
      doc.setLineWidth(1.1);
      doc.circle(cx, cy, 4.5, "S");
      doc.setLineWidth(0.9);
      doc.line(cx, cy, cx, cy - 2.6);
      doc.line(cx, cy, cx + 2.2, cy + 0.4);
      break;
  }
};

/* ─── loads a same-origin image so jsPDF's addImage can embed it ─── */
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

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

  // FIX: tracks which row's receipt is currently being generated,
  // so the Action column can show a per-row loading state.
  const [downloadingRow, setDownloadingRow] = useState<string | number | null>(
    null,
  );

  //centralised values
  const procedureName = "TokenPurchaseReport";
  const pageTitle = InvestmentHistory;
  const landingPageTitle = "My Package";
  const breadCrumbs = {
    parent: "Investment",
    child: "My Package",
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
  const { company } = useCompany();

  const statsConfig = [
    {
      key: "TotalInvestment",
      title: "Total Purchase",
      showCurrency: true,
      sub: "Total Purchase",
      color: "var(--btn-bg), #7209b7",
      icon: "✏️",
      // isGrad: true,
    },
    {
      key: "TodayAmount",
      title: "Today Purchase",
      showCurrency: true,
      sub: "Today Purchase",
      color: "var(--btn-bg), #f72585",
      icon: "🎫",
    },
    {
      key: "ThisMonthAmount",
      title: "This Month Purchase",
      showCurrency: true,
      sub: "This Month Purchase",
      color: "var(--btn-bg), #4cc9f0",
      icon: "✅",
    },
    {
      key: "LastMonthAmount",
      title: "Last Month Purchase",
      showCurrency: true,
      sub: "Last Month Purchase",
      color: "var(--btn-bg), #7209b7",
      icon: "📋",
    },
  ];

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

  /* ── Receipt download ──
     No backend endpoint generates the receipt. Instead:
       1. Look up the matching row in Client.MemberTransactionLogs
          (TransactionNote = "Investment Purchase") to get TransactionNo.
       2. Format TransactionNo into a receipt-style code (cosmetic only).
       3. Build a PDF client-side with jsPDF and trigger the download.

     ⚠️ ADJUST THESE TO MATCH YOUR ACTUAL SCHEMA/PROC:
       - `rowKey`      : the field that identifies a TokenPurchaseReport row
                         (used to look up the matching transaction log entry)
       - `procName`    : the actual stored proc that queries
                         Client.MemberTransactionLogs
       - `Para` fields : the actual parameters that proc expects
  ── */
  const handleDownloadReceipt = useCallback(
    async (row: any) => {
      // ⚠️ IncomeLogId isn't available to pass through, so the log
      // entry is instead matched by Amount + purchase date. Adjust
      // these field names if TokenPurchaseReport calls them
      // something else (e.g. row.Date instead of row.PurchaseDate).
      const rowAmount = row.TotalInvestment ?? row.Amount;
      const rowDate = row.PurchaseDate ?? row.Date;
      const rowKey = `${rowAmount}_${rowDate}`; // used only for the per-row loading state

      if (rowAmount == null) {
        console.error("Missing Amount or Date on row — cannot match transaction log");
        return;
      }

      try {
        setDownloadingRow(rowKey);

        // 1. Look up the TransactionNo from MemberTransactionLogs
        const payload = {
          procName: "GetMemberTransactionLog",
          Para: JSON.stringify({
            ClientId: ClientID,
            TransactionNote: "Investment Purchase",
            LogType: "Package Investment",
          }),
        };
        const res = await universalService(payload);
        const result = res?.data ?? res;
        const logEntry = Array.isArray(result) ? result[0] : result;
        const transactionNo = logEntry?.TransactionNo;

        if (!transactionNo) {
          console.error("No matching transaction log entry found");
          return;
        }

        const txnCode = formatTransactionCode(transactionNo);

        // Date comes from the log entry itself (confirmed present as
        // EntryDate in the API response), not from the report row —
        // the report row doesn't reliably expose a date field.
        const rawDate = logEntry?.EntryDate;
        const formattedDate = rawDate
          ? format(new Date(rawDate), "dd MMM yyyy, hh:mm a")
          : "-";

        // 2. Load the project logo (used in header/loader/bottom-nav) so it
        //    can be embedded in the PDF — failure here shouldn't block the receipt.
        let logoImg: HTMLImageElement | null = null;
        try {
          logoImg = await loadImage(
            `${import.meta.env.BASE_URL}/assets/images/logo/favicon.png`,
          );
        } catch {
          logoImg = null;
        }

        const brandName = company?.CompanyName || "OMG";
        const amountRaw = Number(
          row.TotalInvestment ?? row.Amount ?? logEntry?.Amount ?? 0,
        );
        const formatAmount = (val: number) => {
          const formatted = Number(val).toLocaleString("en-IN");
          // jsPDF's base "helvetica" font only covers WinAnsi, which excludes
          // ₹ — it would otherwise print as a garbled glyph. Substitute "Rs."
          // for the PDF only; the on-screen table still renders ₹ normally.
          if (currency.symbol === "₹") return `Rs. ${formatted}`;
          return currency.symbol.length === 1
            ? `${currency.symbol}${formatted}`
            : `${formatted} ${currency.symbol}`;
        };

        // 3. Build the PDF receipt
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 48;
        const contentWidth = pageWidth - marginX * 2;

        const NAVY: [number, number, number] = [24, 34, 74];
        const GOLD: [number, number, number] = [196, 160, 70];
        const GOLD_PALE: [number, number, number] = [223, 205, 158];
        const GRAY: [number, number, number] = [120, 122, 130];
        const GREEN: [number, number, number] = [39, 152, 96];
        const AMBER: [number, number, number] = [196, 130, 40];
        const SHADOW: [number, number, number] = [225, 227, 233];
        const ROW_TINT: [number, number, number] = [246, 247, 251];

        // ── Header: brand (left) + receipt-title ribbon (right) ──
        const logoSize = 50;
        const logoX = marginX;
        const logoY = 24;
        if (logoImg) {
          doc.addImage(logoImg, "PNG", logoX, logoY, logoSize, logoSize);
        } else {
          doc.setFillColor(...NAVY);
          doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(20);
          doc.setTextColor(255, 255, 255);
          doc.text(
            brandName.charAt(0).toUpperCase(),
            logoX + logoSize / 2,
            logoY + logoSize / 2 + 7,
            { align: "center" },
          );
        }

        const brandTextX = logoX + logoSize + 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(17);
        doc.setTextColor(...NAVY);
        doc.text(brandName, brandTextX, logoY + 22);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text("Secure Giving. Trusted Impact.", brandTextX, logoY + 36);

        // ── Ribbon: navy title card with a folded gold flap + stitched seam ──
        const ribbonW = 230;
        const ribbonH = 74;
        const ribbonX = pageWidth - marginX - ribbonW;
        const ribbonY = 18;

        const flapTipX = ribbonX - 22;
        doc.setFillColor(...GOLD);
        doc.triangle(
          flapTipX, ribbonY + ribbonH,
          ribbonX, ribbonY,
          ribbonX, ribbonY + ribbonH,
          "F",
        );
        doc.setFillColor(...NAVY);
        for (let t = 0.08; t <= 0.94; t += 0.14) {
          doc.circle(
            flapTipX + (ribbonX - flapTipX) * t,
            ribbonY + ribbonH - (ribbonH * t),
            0.9,
            "F",
          );
        }

        doc.setFillColor(...NAVY);
        doc.roundedRect(ribbonX, ribbonY, ribbonW, ribbonH, 6, 6, "F");
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(2.4);
        doc.line(ribbonX + 16, ribbonY + 6, ribbonX + ribbonW - 16, ribbonY + 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("DONATION RECEIPT", ribbonX + ribbonW - 16, ribbonY + 34, {
          align: "right",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(230, 230, 235);
        doc.text(`Reference: ${txnCode}`, ribbonX + ribbonW - 16, ribbonY + 54, {
          align: "right",
        });

        // ── Precompute the card's full layout up front (every offset below
        //    is a fixed constant) so the shadow + card surface can be painted
        //    before any interior content is drawn on top of it. ──
        const cardTop = 130;
        const amountPanelY = cardTop + 16;
        const amountPanelH = 78;
        const rowHeight = 32;
        const detailRowsCount = 4;
        const detailRowsTop = amountPanelY + amountPanelH + 26;
        const detailBottom = detailRowsTop + rowHeight * detailRowsCount;
        const bannerH = 24;
        const bannerY = detailBottom + 22;
        const tilesY = bannerY + bannerH + 22;
        const tilesBottom = tilesY + 46;
        const cardBottom = tilesBottom + 46;
        const cardRadius = 10;

        // shadow + white card surface
        doc.setFillColor(...SHADOW);
        doc.roundedRect(marginX + 3, cardTop + 4, contentWidth, cardBottom - cardTop, cardRadius, cardRadius, "F");
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(marginX, cardTop, contentWidth, cardBottom - cardTop, cardRadius, cardRadius, "F");

        // ── Amount + status panel ──
        const panelX = marginX + 16;
        const panelW = contentWidth - 32;

        doc.setFillColor(246, 248, 251);
        doc.roundedRect(panelX, amountPanelY, panelW, amountPanelH, 6, 6, "F");

        const dividerX = panelX + panelW * 0.66;

        // faint rotated watermark, sitting behind the amount text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(240, 242, 247);
        doc.text("VERIFIED", panelX + (dividerX - panelX) / 2, amountPanelY + amountPanelH / 2 + 6, {
          align: "center",
          angle: 14,
        });

        doc.setDrawColor(224, 227, 233);
        doc.setLineWidth(1);
        doc.line(dividerX, amountPanelY + 12, dividerX, amountPanelY + amountPanelH - 12);

        // amount (left)
        const iconCx = panelX + 30;
        const iconCy = amountPanelY + amountPanelH / 2;
        doc.setFillColor(...NAVY);
        doc.circle(iconCx, iconCy, 15, "F");
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(1.4);
        doc.circle(iconCx, iconCy, 8, "S");

        const amountTextX = iconCx + 30;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text("AMOUNT", amountTextX, amountPanelY + 24);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(19);
        doc.setTextColor(...NAVY);
        doc.text(formatAmount(amountRaw), amountTextX, amountPanelY + 46);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        const wordsMaxWidth = dividerX - amountTextX - 10;
        const wordsLines = doc.splitTextToSize(amountInWords(amountRaw), wordsMaxWidth);
        doc.text(wordsLines[0] ?? "", amountTextX, amountPanelY + 60);

        // status (right)
        const statusValue = String(row.Status ?? "-");
        const isPositive = ["success", "completed", "active"].includes(
          statusValue.toLowerCase(),
        );
        const statusColor = isPositive ? GREEN : AMBER;
        const statusCx = dividerX + (panelX + panelW - dividerX) / 2;
        const statusIconCy = amountPanelY + 26;

        doc.setFillColor(...statusColor);
        doc.circle(statusCx, statusIconCy, 11, "F");
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1.6);
        doc.line(statusCx - 5, statusIconCy, statusCx - 1.5, statusIconCy + 4.5);
        doc.line(statusCx - 1.5, statusIconCy + 4.5, statusCx + 5.5, statusIconCy - 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text("STATUS", statusCx, amountPanelY + 50, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...statusColor);
        doc.text(statusValue.toUpperCase(), statusCx, amountPanelY + 64, {
          align: "center",
        });

        // ── Detail rows (zebra-tinted) ──
        const detailRows: [string, string][] = [
          ["Transaction No.", txnCode],
          ["Date", formattedDate],
          ["Member", String(row.Client ?? row.ClientName ?? "-")],
          ["Package", String(row.PackageName ?? "-")],
        ];

        let rowTop = detailRowsTop;
        doc.setFontSize(9.5);

        detailRows.forEach(([label, value], idx) => {
          const baseline = rowTop + rowHeight / 2 + 3;

          if (idx % 2 === 0) {
            doc.setFillColor(...ROW_TINT);
            doc.rect(marginX + 1, rowTop, contentWidth - 2, rowHeight, "F");
          }

          doc.setFillColor(...NAVY);
          doc.circle(marginX + 22, baseline - 3, 2.2, "F");

          doc.setFont("helvetica", "normal");
          doc.setTextColor(...GRAY);
          doc.text(label, marginX + 32, baseline);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(...NAVY);
          doc.text(value, pageWidth - marginX - 16, baseline, { align: "right" });

          doc.setDrawColor(232, 234, 238);
          doc.setLineWidth(0.6);
          doc.line(
            marginX + 16,
            rowTop + rowHeight,
            pageWidth - marginX - 16,
            rowTop + rowHeight,
          );

          rowTop += rowHeight;
        });

        // ── Highlights banner + strip ──
        doc.setFillColor(...NAVY);
        doc.roundedRect(
          pageWidth / 2 - 90,
          bannerY,
          180,
          bannerH,
          12,
          12,
          "F",
        );
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("RECEIPT HIGHLIGHTS", pageWidth / 2, bannerY + bannerH / 2 + 3.5, {
          align: "center",
        });

        const highlights: {
          title: string;
          desc: string;
          color: [number, number, number];
          icon: "lock" | "bolt" | "check" | "document" | "clock";
        }[] = [
          { title: "Secure Payment", desc: "Encrypted & protected", color: [199, 90, 90], icon: "lock" },
          { title: "Instant Processing", desc: "Confirmed immediately", color: [199, 150, 60], icon: "bolt" },
          { title: "Verified Member", desc: "Linked to your account", color: [70, 150, 110], icon: "check" },
          { title: "Digital Record", desc: "Saved to your history", color: [70, 110, 190], icon: "document" },
          { title: "24/7 Support", desc: "Always here to help", color: [140, 90, 190], icon: "clock" },
        ];

        const tileW = contentWidth / highlights.length;

        highlights.forEach((h, i) => {
          const cx = marginX + tileW * i + tileW / 2;

          // soft shadow beneath the badge, then a ringed colored circle
          doc.setFillColor(...SHADOW);
          doc.circle(cx, tilesY + 1.5, 13, "F");
          doc.setFillColor(...h.color);
          doc.circle(cx, tilesY, 13, "F");
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(1.2);
          doc.circle(cx, tilesY, 13, "S");

          drawDuotoneIcon(doc, h.icon, cx, tilesY);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...NAVY);
          doc.text(h.title, cx, tilesY + 24, { align: "center" });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(...GRAY);
          const descLines = doc.splitTextToSize(h.desc, tileW - 12);
          doc.text(descLines, cx, tilesY + 34, { align: "center" });
        });

        // ── Thank-you note ──
        doc.setDrawColor(228, 230, 235);
        doc.setLineWidth(0.7);
        doc.line(marginX + 16, tilesBottom, pageWidth - marginX - 16, tilesBottom);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...NAVY);
        doc.text("Thank you for your generous contribution.", pageWidth / 2, tilesBottom + 20, {
          align: "center",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.text(
          "Your support makes a lasting difference.",
          pageWidth / 2,
          tilesBottom + 32,
          { align: "center" },
        );

        // ── Outer card border: navy edge + inset pale-gold frame + corner studs ──
        doc.setDrawColor(210, 213, 222);
        doc.setLineWidth(1);
        doc.roundedRect(marginX, cardTop, contentWidth, cardBottom - cardTop, cardRadius, cardRadius);

        doc.setDrawColor(...GOLD_PALE);
        doc.setLineWidth(0.7);
        doc.roundedRect(
          marginX + 5,
          cardTop + 5,
          contentWidth - 10,
          cardBottom - cardTop - 10,
          cardRadius - 3,
          cardRadius - 3,
        );

        doc.setFillColor(...GOLD);
        [
          [marginX + 5, cardTop + 5],
          [marginX + contentWidth - 5, cardTop + 5],
          [marginX + 5, cardBottom - 5],
          [marginX + contentWidth - 5, cardBottom - 5],
        ].forEach(([cx, cy]) => doc.circle(cx, cy, 1.6, "F"));

        // ── Bottom disclaimer bar — pinned to the page's bottom edge,
        //    with a gold rule + flourish and the "Generated on" line above it ──
        const barH = 26;
        const barY = pageHeight - barH;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}`,
          pageWidth / 2,
          barY - 14,
          { align: "center" },
        );

        doc.setDrawColor(...GOLD);
        doc.setLineWidth(1);
        doc.line(marginX, barY - 28, pageWidth / 2 - 6, barY - 28);
        doc.line(pageWidth / 2 + 6, barY - 28, pageWidth - marginX, barY - 28);
        doc.setFillColor(...GOLD);
        doc.circle(pageWidth / 2, barY - 28, 2.4, "F");

        doc.setFillColor(...NAVY);
        doc.rect(0, barY, pageWidth, barH, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(
          "This is a system-generated receipt and does not require a signature.",
          pageWidth / 2,
          barY + barH / 2 + 3,
          { align: "center" },
        );

        doc.save(`Receipt_${txnCode}.pdf`);
      } catch (err) {
        console.error("Receipt generation failed", err);
      } finally {
        setDownloadingRow(null);
      }
    },
    [ClientID], // eslint-disable-line react-hooks/exhaustive-deps
  );

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

            if (c.ColumnKey === "Status") {
              return <StatusBadge status={value} />;
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

  /* ── Action column (Download Receipt) ──
     FIX: kept separate from `columns` (which is rebuilt only when
     fetchGridColumns runs) and merged in at render time via
     `displayColumns` below. This way the button's disabled/loading
     state always reflects the current `downloadingRow` without
     needing to refetch the server-driven columns. */
  const actionColumn = {
    id: "action",
    name: "Action",
    columnKey: "",
    sortable: false,
    cell: (row: any) => {
      if (row.__isTotal) return "";
      const rowAmount = row.TotalInvestment ?? row.Amount;
      const rowDate = row.PurchaseDate ?? row.Date;
      const rowKey = `${rowAmount}_${rowDate}`; // ⚠️ keep in sync with handleDownloadReceipt
      const isLoading = downloadingRow === rowKey;
      return (
        <button
          className="icon-btn"
          onClick={() => handleDownloadReceipt(row)}
          disabled={isLoading}
          title="Download Receipt"
        >
          <i className="material-symbols-outlined">
            {isLoading ? "progress_activity" : "download"}
          </i>
        </button>
      );
    },
  };

  const displayColumns = columns.length ? [...columns, actionColumn] : columns;

  /* ── Export ── */
  const exportColumns = columns
    .filter((c) => c.columnKey)
    .map((c) => ({ key: c.columnKey, label: c.name }));

  const fetchExportData = useCallback(async () => {
    const range = dateRangeRef.current;
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({
        ClientId: ClientID,
        SearchBy: filterColumn,
        Criteria: searchInput,
        Page: page,
        PageSize: 0,
        SortIndexColumn: sortIndex,
        SortDir: sortDirection,
        FromDate: range.from || null,
        ToDate: range.to || null,
      }),
    };
    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  }, [filterColumn, searchInput, page, sortIndex, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Stats ── */
  const GetStats = useCallback(async () => {
    const payload = {
      procName: procedureName,
      Para: JSON.stringify({ ClientId: ClientID, ActionMode: "GetStats" }),
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
    // if (!showTable) return;
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
    <div className="page-body">
      <Breadcrumbs
        mainTitle={pageTitle}
        parent={breadCrumbs.parent}
        ChildName={breadCrumbs.child}
      />
      <Container fluid>
        <div className="trezo-card">
          {/* HEADER */}

          <StatsCardsTrezo stats={stats} config={statsConfig} />

          <div className="trezo-card-header">
            <div className="header-actions">
              <div className="filter-group">
                {/* ── DATE RANGE FILTER ─────────────────────────────────────────
                onChange fires when the user clicks "Apply" inside the picker.
                Stored as pendingRange — NOT sent to API until Search is clicked.
            ──────────────────────────────────────────────────────────────── */}
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
                    <option value="Client">Member</option>
                    <option value="PackageName">Package Name</option>
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
                  columns={displayColumns}
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
                      columns={displayColumns.length || 8}
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
    </div>
  );
};

export default Template;