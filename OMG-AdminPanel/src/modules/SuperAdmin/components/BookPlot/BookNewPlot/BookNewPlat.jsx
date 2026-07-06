import React, { useState, useEffect, useRef } from "react";
import { ApiService } from "../../../../../services/ApiService";
import { useLocation } from "react-router-dom";
import { SmartActions } from "../../Security/SmartActionWithFormName";
import Loader from "../../../common/Loader";
import AccessRestricted from "../../../common/AccessRestricted";
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

const NOMINEE_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-teal-500 to-emerald-700",
  "from-rose-500 to-pink-700",
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = (disabled) =>
  `h-[34px] px-3 text-xs rounded-md border outline-none transition-all w-full ${
    disabled
      ? "bg-gray-50 dark:bg-[#0c1427] text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed"
      : "bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:border-primary-button-bg"
  }`;

const selectCls =
  "h-[34px] pl-3 pr-8 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg appearance-none transition-all";

const SectionHeader = ({ icon, title, right }) => (
  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-2">
      <i className="material-symbols-outlined text-[18px] text-primary-button-bg">
        {icon}
      </i>
      <h6 className="!mb-0 font-semibold text-sm text-gray-800 dark:text-gray-100">
        {title}
      </h6>
    </div>
    {right}
  </div>
);

// ── step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Customer", icon: "person_search" },
  { label: "Select Plot", icon: "map" },
  { label: "Payment", icon: "payments" },
];

const StepBar = ({ active }) => (
  <div className="flex items-center gap-0 mb-6">
    {STEPS.map((s, i) => {
      const done = i < active;
      const cur = i === active;
      return (
        <React.Fragment key={s.label}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${
                done
                  ? "bg-primary-button-bg border-primary-button-bg"
                  : cur
                    ? "bg-primary-button-bg border-primary-button-bg"
                    : "bg-white dark:bg-[#0c1427] border-gray-300 dark:border-gray-600"
              }`}
            >
              {done ? (
                <i className="material-symbols-outlined text-white text-[14px]">
                  check
                </i>
              ) : (
                <i
                  className={`material-symbols-outlined text-[14px] ${cur ? "text-white" : "text-gray-400"}`}
                >
                  {s.icon}
                </i>
              )}
            </div>
            <span
              className={`text-[10px] font-semibold whitespace-nowrap ${
                cur || done ? "text-primary-button-bg" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${done ? "bg-primary-button-bg" : "bg-gray-200 dark:bg-gray-700"}`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const BookNewPlat = () => {
  const { universalService } = ApiService();
  const location = useLocation();
  const formName = location.pathname.split("/").pop();

  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);

  // ── customer search ──────────────────────────────────────────────────────
  const [customerId, setCustomerId] = useState("");
  const [memberData, setMemberData] = useState("");
  const [nomineeData, setNomineeData] = useState([]);
  const [customerSearched, setCustomerSearched] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");

  // ── autocomplete ──────────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);

  // ── dropdowns ────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [plotTypes, setPlotTypes] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");

  // ── plot grid + selected plot ────────────────────────────────────────────
  const [plotGrid, setPlotGrid] = useState([]);
  const [plotFilter, setPlotFilter] = useState("all");
  const [selectedPlot, setSelectedPlot] = useState("");
  const [plotSearched, setPlotSearched] = useState(false);
  const [plotLoading, setPlotLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [popupPlot, setPopupPlot] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredPlot, setHoveredPlot] = useState("");
  const [tooltipPos, setTooltipPos] = useState({
    top: 0,
    left: 0,
    below: false,
  });

  // ── EMI plan ─────────────────────────────────────────────────────────────
  const [emiPlans, setEmiPlans] = useState([]);
  const [selectedEmi, setSelectedEmi] = useState("");
  const [emiDuration, setEmiDuration] = useState(1);
  const [emiType, setEmiType] = useState("");
  const [emiDiscountUnit, setEmiDiscountUnit] = useState(0);

  // ── pricing ──────────────────────────────────────────────────────────────
  const [plotRateAmount, setPlotRateAmount] = useState("0");
  const [emiDiscount, setEmiDiscount] = useState("0");
  const [isDiscountApplicable, setIsDiscountApplicable] = useState(false);
  const [isPLCApplicable, setIsPLCApplicable] = useState(false);
  const [plotRateDisplay, setPlotRateDisplay] = useState("0");
  const [plotAmount, setPlotAmount] = useState("0");
  const [totalAmount, setTotalAmount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [balanceAmount, setBalanceAmount] = useState("0");
  const [emiAmount, setEmiAmount] = useState("0");

  // ── payment ──────────────────────────────────────────────────────────────
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [allotmentDate, setAllotmentDate] = useState("");
  const [installmentDate, setInstallmentDate] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [saving, setSaving] = useState(false);

  // ── derived ───────────────────────────────────────────────────────────────
  const showTransactionFields = paymentMode !== "" && paymentMode !== "Cash";
  const showBankBranchFields =
    paymentMode === "Cheque" || paymentMode === "NEFT";
  const txLabel =
    paymentMode === "Cheque" ? "Cheque Number" : "Transaction Number";
  const txDateLabel =
    paymentMode === "Cheque" ? "Cheque Date" : "Transaction Date";

  const activeStep = !customerSearched ? 0 : !selectedPlot ? 1 : 2;

  // ── click-outside for suggestions ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── permissions ──────────────────────────────────────────────────────────
  const fetchFormPermissions = async () => {
    try {
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
      const res = await universalService({
        procName: "AssignForm",
        Para: JSON.stringify({
          ActionMode: "GetForms",
          FormName: formName,
          EmployeeId: employeeId,
        }),
      });
      const result = res?.data ?? res;
      if (!Array.isArray(result)) {
        setHasPageAccess(false);
        return;
      }
      const perm = result.find(
        (p) =>
          String(p.FormNameWithExt).trim().toLowerCase() ===
          formName?.trim().toLowerCase(),
      );
      if (!perm || !perm.Action || perm.Action.trim() === "") {
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

  const loadSegments = async () => {
    try {
      const res = await universalService({
        procName: "PlotMaster",
        Para: JSON.stringify({ ActionMode: "AutoFillSegment" }),
      });
      const data = res?.data ?? res;
      setSegments(Array.isArray(data) ? data : []);
    } catch {
      setSegments([]);
    }
  };

  const loadPlotTypes = async () => {
    try {
      const res = await universalService({
        procName: "PlotMaster",
        Para: JSON.stringify({ ActionMode: "AutoFillType" }),
      });
      const data = res?.data ?? res;
      setPlotTypes(Array.isArray(data) ? data : []);
    } catch {
      setPlotTypes([]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchFormPermissions();
    loadProjects();
    loadSegments();
    loadPlotTypes();
  }, []);

  const loadSectors = async (projectId) => {
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

  const loadBlocks = async (sectorId) => {
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

  const loadEMI = async (projectId) => {
    setEmiPlans([]);
    setSelectedEmi("");
    if (!projectId) return;
    try {
      const res = await universalService({
        procName: "EMIMaster",
        Para: JSON.stringify({ ActionMode: "Get", ProjectId: projectId }),
      });
      const data = res?.data ?? res;
      setEmiPlans(Array.isArray(data) ? data : []);
    } catch {
      setEmiPlans([]);
    }
  };

  // ── autocomplete search (debounced) ──────────────────────────────────────
  const handleSearchInput = (val) => {
    setCustomerId(val);
    setMemberError("");
    if (customerSearched) return;

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

  const applyMemberRow = (row, uid) => {
    setCustomerId(uid ?? customerId);
    setMemberData(row);
    if (row.NomineeDetails) {
      try {
        setNomineeData(JSON.parse(row.NomineeDetails));
      } catch {
        setNomineeData([]);
      }
    } else {
      setNomineeData([]);
    }
    setCustomerSearched(true);
    setShowSuggestions(false);
    setSuggestions([]);
    resetPlotSection();
  };

  const selectSuggestion = (item) => {
    const uid = item.UserName ?? item.Name ?? customerId;
    applyMemberRow(item, uid);
  };

  // ── search member ────────────────────────────────────────────────────────
  const searchMember = async (overrideId) => {
    const uid = (overrideId ?? customerId).trim();
    if (!uid) {
      setMemberError("Please enter Customer ID and click Search");
      return;
    }
    setMemberError("");
    setMemberLoading(true);
    setShowSuggestions(false);
    try {
      const res = await universalService({
        procName: "GetPlotDetails",
        Para: JSON.stringify({ ActionMode: "MemberDetails", UserName: uid }),
      });
      const data = res?.data ?? res;

      if (
        !data ||
        data === "NoRecord" ||
        (Array.isArray(data) && data.length === 0)
      ) {
        setMemberError("Customer ID not found.");
        setMemberData("");
        setNomineeData([]);
        setCustomerSearched(false);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (row.StatusCode && String(row.StatusCode) !== "1") {
        setMemberError(row.Msg || "Member not found.");
        setMemberData("");
        setNomineeData([]);
        setCustomerSearched(false);
        return;
      }

      applyMemberRow(row, uid);
    } catch {
      setMemberError("Failed to fetch member details.");
      setMemberData("");
      setCustomerSearched(false);
    } finally {
      setMemberLoading(false);
    }
  };

  // ── search plots ──────────────────────────────────────────────────────────
  const searchPlotsWithValues = async ({ block, type } = {}) => {
    const bId = block ?? selectedBlock;
    const tId = type ?? selectedType;
    if (!selectedProject) return;
    setHoveredPlot(null);
    setPlotFilter("all");
    setPlotGrid([]);
    setSelectedPlot("");
    setPlotSearched(false);
    setPlotLoading(true);
    try {
      const res = await universalService({
        procName: "GetPlotDetails",
        Para: JSON.stringify({
          ActionMode: "GetPlot",
          ProjectId: selectedProject,
          SectorId: selectedSector || "",
          BlockId: bId || "",
          SegmentId: selectedSegment || "",
          TypeId: tId || "",
        }),
      });
      const data = res?.data ?? res;
      setPlotGrid(Array.isArray(data) && data !== "NoRecord" ? data : []);
      setPlotSearched(true);
    } catch {
      setPlotGrid([]);
    } finally {
      setPlotLoading(false);
    }
  };

  const selectPlotFromGrid = async (plotId) => {
    setHoveredPlot(null);
    setDetailLoading(true);
    try {
      const res = await universalService({
        procName: "GetPlotDetails",
        Para: JSON.stringify({ ActionMode: "GetPlotDetails", PlotId: plotId }),
      });
      const data = res?.data ?? res;
      if (
        !data ||
        data === "NoRecord" ||
        (Array.isArray(data) && data.length === 0)
      )
        return;

      const row = Array.isArray(data) ? data[0] : data;
      setSelectedPlot(row);
      if (row.TypeId) setSelectedType(String(row.TypeId));

      setPlotRateAmount("0");
      setEmiDiscount("0");
      setPlotRateDisplay("0");
      setPlotAmount("0");
      setTotalAmount("0");
      setPaidAmount("0");
      setBalanceAmount("0");
      setEmiAmount("0");
      setIsDiscountApplicable(false);
      setIsPLCApplicable(false);
      setSelectedEmi("");
      setPlotGrid([]);
      loadEMI(selectedProject);
    } catch {
      console.error("Failed to load plot details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEmiChange = async (emiId) => {
    setSelectedEmi(emiId);
    if (!emiId || !selectedPlot) return;
    try {
      const res = await universalService({
        procName: "EMIMaster",
        Para: JSON.stringify({ ActionMode: "Get", EMIId: emiId }),
      });
      const data = res?.data ?? res;
      if (
        !data ||
        data === "NoRecord" ||
        !Array.isArray(data) ||
        data.length === 0
      )
        return;

      const plan = data[0];
      const rate = parseFloat(plan.SalePrice) || 0;
      const disc = parseFloat(plan.Discount) || 0;
      const size = parseFloat(selectedPlot.GenralSize) || 1;
      let dur = parseFloat(plan.Duration) || 1;
      const type = plan.Type ?? "";
      if (type === "CDP") dur = 1;

      setEmiDuration(dur);
      setEmiType(type);
      setEmiDiscountUnit(disc);
      const plotTotal = rate * size;
      const emiPr = Math.round(plotTotal / dur);

      setEmiDiscount(String(disc));
      setPlotRateAmount(String(rate));
      setPlotRateDisplay(String(rate));
      setPlotAmount(String(plotTotal));
      setTotalAmount(String(plotTotal));
      setPaidAmount("0");
      setBalanceAmount(String(plotTotal));
      setEmiAmount(String(emiPr));
      setIsDiscountApplicable(false);
      setIsPLCApplicable(false);
    } catch {
      console.error("Failed to load EMI details");
    }
  };

  // AFTER
  const handleRateKeyUp = (val) => {
    setPlotRateAmount(val);
    if (!selectedPlot || !selectedEmi) return;
    const rate = parseFloat(val) || 0;
    const disc = parseFloat(emiDiscount) || 0;
    const plc = parseFloat(selectedPlot.PLCPercentage) || 0;
    const size = parseFloat(selectedPlot.GenralSize) || 1;
    let dur = emiDuration;
    if (emiType === "CDP") dur = 1;

    const plotTotal = rate * size;

    // Recompute effective display rate honoring active toggles
    let displayRate = rate;
    if (isPLCApplicable)
      displayRate = Math.round(displayRate + (displayRate * plc) / 100);
    if (isDiscountApplicable)
      displayRate = disc <= displayRate ? displayRate - disc : displayRate;

    const totalAmt = displayRate * size;
    const emiPr = Math.round(totalAmt / dur);

    setPlotRateDisplay(String(displayRate));
    setPlotAmount(String(plotTotal));
    setTotalAmount(String(totalAmt));
    setPaidAmount("0");
    setBalanceAmount(String(totalAmt));
    setEmiAmount(String(emiPr));
    setIsDiscountApplicable(false);
    setIsPLCApplicable(false);
  };

  const handlePaidAmountChange = (val) => {
    setPaidAmount(val);
    const total = parseFloat(totalAmount) || 0;
    const paid = parseFloat(val) || 0;
    const balance = total - paid;
    let dur = emiDuration;
    if (emiType === "CDP") dur = 1;
    setBalanceAmount(String(balance));
    setEmiAmount(String(Math.round(balance / dur)));
  };

  // AFTER
  const handlePLCToggle = (checked) => {
    setIsPLCApplicable(checked);
    if (!selectedPlot) return;
    const plc = parseFloat(selectedPlot.PLCPercentage) || 0;
    const rawRate = parseFloat(plotRateAmount) || 0;
    const disc = parseFloat(emiDiscount) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const size = parseFloat(selectedPlot.GenralSize) || 1;
    let dur = emiDuration;
    if (emiType === "CDP") dur = 1;

    // Base rate after PLC toggle
    let displayRate = checked
      ? Math.round(rawRate + (rawRate * plc) / 100)
      : rawRate;

    // Then apply discount on top if discount checkbox is still on
    if (isDiscountApplicable) {
      displayRate = disc <= displayRate ? displayRate - disc : displayRate;
    }

    const amtAfterDisc = displayRate * size;
    const balance = amtAfterDisc - paid;

    setPlotRateDisplay(String(displayRate));
    setTotalAmount(String(amtAfterDisc));
    setBalanceAmount(String(balance));
    setEmiAmount(String(Math.round(balance / dur)));
  };

  // AFTER
  const handleDiscountToggle = (checked) => {
    setIsDiscountApplicable(checked);
    if (!selectedPlot) return;
    const disc = parseFloat(emiDiscount) || 0;
    const rawRate = parseFloat(plotRateAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const size = parseFloat(selectedPlot.GenralSize) || 1;
    const plc = parseFloat(selectedPlot.PLCPercentage) || 0;
    let dur = emiDuration;
    if (emiType === "CDP") dur = 1;

    // Base rate: PLC-adjusted if PLC is on, otherwise raw
    const baseRate = isPLCApplicable
      ? Math.round(rawRate + (rawRate * plc) / 100)
      : rawRate;

    let displayRate, amtAfterDisc, balance;
    if (checked) {
      displayRate = disc <= baseRate ? baseRate - disc : baseRate;
      amtAfterDisc = displayRate * size;
      balance = amtAfterDisc - paid;
    } else {
      displayRate = baseRate; // ← restore to PLC rate if PLC is on
      amtAfterDisc = baseRate * size;
      balance = amtAfterDisc - paid;
    }

    setPlotRateDisplay(String(displayRate));
    setTotalAmount(String(amtAfterDisc));
    setBalanceAmount(String(balance));
    setEmiAmount(String(Math.round(balance / dur)));
  };

  const handleProjectChange = (val) => {
    setSelectedProject(val);
    loadSectors(val);
    loadEMI(val);
    setSelectedPlot("");
    setPlotGrid([]);
    setPlotSearched(false);
    clearPricingFields();
  };
  const handleSectorChange = (val) => {
    setSelectedSector(val);
    loadBlocks(val);
    setSelectedPlot("");
    setPlotGrid([]);
    setPlotSearched(false);
  };
  const handleBlockChange = (val) => {
    setSelectedBlock(val);
  };
  const handleTypeChange = (val) => {
    setSelectedType(val);
  };

  const clearPricingFields = () => {
    setEmiDiscount("0");
    setPlotRateAmount("0");
    setPlotRateDisplay("0");
    setPlotAmount("0");
    setTotalAmount("0");
    setPaidAmount("0");
    setBalanceAmount("0");
    setEmiAmount("0");
    setIsDiscountApplicable(false);
    setIsPLCApplicable(false);
    setSelectedEmi("");
  };

  const resetPlotSection = () => {
    setHoveredPlot(null);
    setPlotFilter("all");
    setSelectedPlot("");
    setPlotGrid([]);
    setPlotSearched(false);
    setSelectedProject("");
    setSelectedSector("");
    setSelectedBlock("");
    setSelectedType("");
    setSelectedSegment("");
    setEmiPlans([]);
    clearPricingFields();
    setPaymentMode("");
    setTransactionNo("");
    setTransactionDate("");
    setBankName("");
    setBranchName("");
    setDescriptions("");
    setAllotmentDate("");
    setInstallmentDate("");
    setBookingDate(new Date().toISOString().split("T")[0]);
  };

  const clearAll = () => {
    setCustomerId("");
    setMemberData("");
    setNomineeData([]);
    setCustomerSearched(false);
    setMemberError("");
    setSuggestions([]);
    setShowSuggestions(false);
    resetPlotSection();
  };

  const showValidationError = (msg) =>
    Swal.fire({
      icon: "warning",
      title: "Required",
      text: msg,
      confirmButtonColor: "#3b82f6",
      customClass: { popup: "rounded-2xl" },
    });

  const saveBooking = async () => {
    if (!memberData) {
      showValidationError("Please search a member first.");
      return;
    }
    if (!selectedPlot) {
      showValidationError("Please select a plot.");
      return;
    }
    if (parseFloat(plotRateAmount) <= 0) {
      showValidationError("Please enter Plot Rate.");
      return;
    }
    if ((parseFloat(paidAmount) || 0) < 500) {
      showValidationError("Please enter Pay Amount (Minimum ₹500).");
      return;
    }
    if (!paymentMode) {
      showValidationError("Please select Payment Mode.");
      return;
    }
    if (showTransactionFields && !transactionNo) {
      showValidationError(`Please enter ${txLabel}.`);
      return;
    }
    if (showBankBranchFields) {
      if (!bankName) {
        showValidationError("Please choose Bank Name.");
        return;
      }
      if (!branchName) {
        showValidationError("Please enter Branch Name.");
        return;
      }
    }
    if (!bookingDate) {
      showValidationError("Please enter Booking Date.");
      return;
    }

    setSaving(true);
    try {
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;

      const res = await universalService({
        procName: "PlotBooking",
        Para: JSON.stringify({
          ActionMode: "Insert",
          EntryBy: employeeId,
          UserName: customerId.trim(),
          ProjectId: selectedProject,
          PlotId: selectedPlot.PlotId,
          PaidAmount: paidAmount,
          Balance: balanceAmount,
          TransactionDate: transactionDate || "",
          Transactionnumber: transactionNo || "",
          BankName: bankName || "",
          BranchName: branchName || "",
          EMIId: selectedEmi || "",
          DiscountAplied: isDiscountApplicable,
          IsPlCAplicable: isPLCApplicable,
          PlotAmount: plotAmount,
          PlotRate: plotRateAmount,
          TotalAmount: totalAmount,
          PaymentMode: paymentMode,
          PlotType: "Plot",
          EMIAmount: emiAmount,
          BookingDate: bookingDate,
          AllotmentDate: allotmentDate || "",
          InstallmentDate: installmentDate || "",
          Descriptions: descriptions || "",
          EMIDiscount: emiDiscount,
        }),
      });
      const result = res?.data ?? res;
      const row = Array.isArray(result) ? result[0] : result;
      if (row?.StatusCode === "1" || row?.StatusCode === 1) {
        await Swal.fire({
          icon: "success",
          title: "Plot Booked!",
          text: row.Msg || "The plot has been booked successfully.",
          confirmButtonColor: "#22c55e",
          confirmButtonText: "Great!",
          customClass: { popup: "rounded-2xl" },
        });
        clearAll();
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: row?.Msg || "Something went wrong. Please try again.",
          confirmButtonColor: "#ef4444",
          customClass: { popup: "rounded-2xl" },
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "rounded-2xl" },
      });
    } finally {
      setSaving(false);
    }
  };

  const getPlotStatus = (status) => {
    if (status === "Booked" || status === "Alloted") return "booked";
    if (status === "Hold") return "hold";
    if (
      status === "Registry" ||
      status === "RegistryDone" ||
      status === "Registry Done"
    )
      return "registry";
    return "available";
  };

  const PLOT_STYLES = {
    available: {
      block:
        "bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 cursor-pointer hover:scale-105 hover:shadow-lg active:scale-100",
      badge: "bg-green-100 text-green-700 border-green-200",
      header: "bg-gradient-to-r from-green-500 to-green-700",
      icon: "check_circle",
      iconColor: "text-green-500",
      label: "Available",
    },
    booked: {
      block:
        "bg-gradient-to-br from-orange-400 to-orange-600 cursor-not-allowed opacity-90",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      header: "bg-gradient-to-r from-orange-400 to-orange-600",
      icon: "block",
      iconColor: "text-orange-500",
      label: "Booked",
    },
    hold: {
      block:
        "bg-gradient-to-br from-red-400 to-red-500 cursor-not-allowed opacity-90",
      badge: "bg-red-100 text-red-700 border-red-200",
      header: "bg-gradient-to-r from-red-400 to-red-500",
      icon: "pause_circle",
      iconColor: "text-red-500",
      label: "On Hold",
    },
    registry: {
      block:
        "bg-gradient-to-br from-indigo-500 to-violet-700 cursor-not-allowed opacity-90",
      badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
      header: "bg-gradient-to-r from-indigo-500 to-violet-700",
      icon: "task_alt",
      iconColor: "text-indigo-500",
      label: "Registry Done",
    },
  };

  if (permissionsLoading) return <Loader />;
  if (!hasPageAccess) return <AccessRestricted />;

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      {/* ── Page Header ── */}
      <div className="trezo-card-header mb-[20px] sm:flex items-center justify-between pb-5 border-b border-gray-200 dark:border-gray-700 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">
            Book New Plot
          </h5>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Complete all steps to book a plot
          </p>
        </div>
      </div>

      {/* ── Step Bar ── */}
      <StepBar active={activeStep} />

      {/* ══ STEP 1 — Customer Search ══ */}
      <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
        <SectionHeader
          icon="person_search"
          title="Customer Search"
          right={
            customerSearched && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-2.5 py-0.5 rounded-full">
                <i className="material-symbols-outlined text-[12px]">
                  check_circle
                </i>{" "}
                Found
              </span>
            )
          }
        />

        {!customerSearched ? (
          /* ── search form ── */
          <div className="max-w-xl">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
              Customer ID / Username <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={searchBoxRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <i className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-gray-400 pointer-events-none">
                    manage_accounts
                  </i>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchMember()}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                    placeholder="Start typing Customer ID or Name..."
                    className={`${inputCls(false)} pl-9 pr-8`}
                  />
                  {suggestLoading && (
                    <i className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[14px] text-primary-button-bg animate-spin pointer-events-none">
                      refresh
                    </i>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => searchMember()}
                  disabled={memberLoading}
                  className="h-[34px] px-4 text-xs font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {memberLoading ? (
                    <>
                      <i className="material-symbols-outlined text-[13px] animate-spin">
                        refresh
                      </i>{" "}
                      Searching
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined text-[13px]">
                        search
                      </i>{" "}
                      Search
                    </>
                  )}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-[82px] z-50 mt-1 bg-white dark:bg-[#0c1427] rounded-md shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {suggestions.length} suggestion
                      {suggestions.length > 1 ? "s" : ""} found
                    </span>
                  </div>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(s);
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50 last:border-0 group"
                    >
                      <div className="w-8 h-8 rounded-md bg-primary-button-bg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {getInitials(s.Name)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-button-bg truncate">
                          {s.Name ?? "—"}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          @{s.UserName ?? "—"}{" "}
                          {s.MobileNo ? `· ${s.MobileNo}` : ""}
                        </div>
                      </div>
                      <i className="material-symbols-outlined text-[14px] text-gray-300 group-hover:text-primary-button-bg flex-shrink-0">
                        chevron_right
                      </i>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {memberError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <i className="material-symbols-outlined text-[13px]">error</i>{" "}
                {memberError}
              </p>
            )}
            <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
              <i className="material-symbols-outlined text-[12px]">info</i>
              Type at least 2 characters to see suggestions, or press Enter to
              search directly
            </p>
          </div>
        ) : (
          /* ── compact member card ── */
          <div>
            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* header row */}
              <div className="bg-primary-button-bg px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-black text-white">
                  {getInitials(memberData.Name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm leading-tight">
                      {memberData.Name ?? "—"}
                    </span>
                    <span className="text-white/60 text-[11px]">
                      @{customerId}
                    </span>
                    {memberData.SponsorName && (
                      <span className="text-white/50 text-[11px] hidden sm:inline">
                        · Sponsor: {memberData.SponsorName}
                      </span>
                    )}
                  </div>
                </div>
                <span className="bg-green-400/20 border border-green-300/30 text-green-100 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                  <i className="material-symbols-outlined text-[11px]">
                    verified
                  </i>{" "}
                  Active
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all flex-shrink-0"
                  title="Change Customer"
                >
                  <i className="material-symbols-outlined text-white text-[14px]">
                    close
                  </i>
                </button>
              </div>
              {/* info pills row */}
              <div className="bg-gray-50 dark:bg-[#0f172a] px-4 py-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {[
                  {
                    icon: "wc",
                    label: "Gender",
                    value: memberData.Gender,
                    icolor: "text-blue-500",
                  },
                  {
                    icon: "cake",
                    label: "DOB",
                    value: memberData.DOB,
                    icolor: "text-purple-500",
                  },
                  {
                    icon: "call",
                    label: "Mobile",
                    value: memberData.MobileNo,
                    icolor: "text-green-600",
                  },
                  {
                    icon: "badge",
                    label: "PAN",
                    value: memberData.PANCardNo,
                    icolor: "text-orange-500",
                  },
                  {
                    icon: "credit_card",
                    label: "Aadhaar",
                    value: memberData.Aadhar,
                    icolor: "text-teal-600",
                  },
                ].map(({ icon, label, value, icolor }) =>
                  value ? (
                    <div key={label} className="flex items-center gap-1">
                      <i
                        className={`material-symbols-outlined text-[12px] ${icolor}`}
                      >
                        {icon}
                      </i>
                      <span className="text-[10px] font-bold text-gray-400">
                        {label}:
                      </span>
                      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                        {value}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </div>

            {/* Compact Nominee Chips */}
            {nomineeData.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <i className="material-symbols-outlined text-[12px]">
                    family_restroom
                  </i>
                  Nominees ({nomineeData.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {nomineeData.map((n, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                      style={{ minWidth: "170px" }}
                    >
                      <div
                        className={`bg-gradient-to-r ${NOMINEE_GRADIENTS[i % NOMINEE_GRADIENTS.length]} px-3 py-2 flex items-center gap-2`}
                      >
                        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                          {getInitials(n.NomineeName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-[11px] truncate">
                            {n.NomineeName ?? "—"}
                          </div>
                          <div className="text-white/70 text-[10px] truncate">
                            {n.NomineeRelation ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-white dark:bg-[#0c1427] grid grid-cols-2 gap-x-3 gap-y-1">
                        {[
                          { l: "Mobile", v: n.MobileNumber },
                          { l: "Age", v: n.Age },
                          { l: "PAN", v: n.PanCard },
                        ].map(({ l, v }) => (
                          <div key={l}>
                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">
                              {l}
                            </div>
                            <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">
                              {v ?? "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ STEP 2 — Plot Search (visible after customer found) ══ */}
      {customerSearched && memberData && (
        <>
          {/* ── Plot Filter Card ── */}
          <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
            <SectionHeader icon="map" title="Search Plot" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
              <Field label="Project" required>
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className={selectCls}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.ProjectId} value={p.ProjectId}>
                      {p.ProjectName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Segment">
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className={selectCls}
                  disabled={!selectedProject}
                >
                  <option value="">-- Segment --</option>
                  {segments.map((s) => (
                    <option key={s.SegmentId} value={s.SegmentId}>
                      {s.SegmentName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Sector">
                <select
                  value={selectedSector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                  className={selectCls}
                  disabled={!selectedProject}
                >
                  <option value="">-- Sector --</option>
                  {sectors.map((s) => (
                    <option key={s.SectorId} value={s.SectorId}>
                      {s.SectorName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Block">
                <select
                  value={selectedBlock}
                  onChange={(e) => handleBlockChange(e.target.value)}
                  className={selectCls}
                  disabled={!selectedSector}
                >
                  <option value="">-- Block --</option>
                  {blocks.map((b) => (
                    <option key={b.BlockId} value={b.BlockId}>
                      {b.BlockName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Type">
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className={selectCls}
                  disabled={!selectedProject}
                >
                  <option value="">-- All Types --</option>
                  {plotTypes.map((t) => (
                    <option key={t.TypeId} value={t.TypeId}>
                      {t.TypeName}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => searchPlotsWithValues()}
                  disabled={!selectedProject || plotLoading}
                  className="h-[34px] px-4 text-xs font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all disabled:opacity-50 flex items-center gap-1.5 w-full justify-center"
                >
                  {plotLoading ? (
                    <>
                      <i className="material-symbols-outlined text-[13px] animate-spin">
                        refresh
                      </i>{" "}
                      Searching
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined text-[13px]">
                        search
                      </i>{" "}
                      Search Plot
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Selected Plot Banner ── */}
          {selectedPlot && (
            <div className="mb-5">
              <div className="rounded-md overflow-hidden border border-green-200 dark:border-green-800">
                <div className="bg-green-600 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <i className="material-symbols-outlined text-white text-[18px]">
                        location_on
                      </i>
                    </div>
                    <div>
                      <span className="text-white/70 text-[11px] font-medium">
                        Selected Plot
                      </span>
                      <h5 className="text-white font-black text-lg leading-tight !mb-0">
                        {selectedPlot.PlotNumber}
                      </h5>
                    </div>
                  </div>
                  <span className="bg-white/15 border border-white/20 rounded-full px-2.5 py-1 text-white text-[11px] font-semibold flex items-center gap-1">
                    <i className="material-symbols-outlined text-[12px]">
                      check_circle
                    </i>{" "}
                    Available
                  </span>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        icon: "apartment",
                        label: "Project",
                        value: selectedPlot.ProjectName,
                      },
                      {
                        icon: "grid_view",
                        label: "Sector",
                        value: selectedPlot.SectorName ?? "—",
                      },
                      {
                        icon: "table_rows",
                        label: "Block",
                        value: selectedPlot.BlockName ?? "—",
                      },
                      {
                        icon: "straighten",
                        label: "Size",
                        value: `${selectedPlot.GenralSize} sqft`,
                      },
                      {
                        icon: "percent",
                        label: "PLC",
                        value: `${selectedPlot.PLCPercentage ?? 0}%`,
                      },
                      {
                        icon: "sell",
                        label: "Segment",
                        value: selectedPlot.SegmentName ?? "—",
                      },
                      {
                        icon: "category",
                        label: "Type",
                        value: selectedPlot.Type ?? "—",
                      },
                    ].map(({ icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-md px-2.5 py-1.5 border border-green-100 dark:border-gray-700"
                      >
                        <i className="material-symbols-outlined text-[13px] text-green-600">
                          {icon}
                        </i>
                        <div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                            {label}
                          </div>
                          <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-100">
                            {value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlot("");
                  setPlotGrid([]);
                  setPlotSearched(false);
                  clearPricingFields();
                }}
                className="mt-2 text-xs text-primary-button-bg hover:underline flex items-center gap-1 font-semibold"
              >
                <i className="material-symbols-outlined text-[13px]">
                  arrow_back
                </i>
                Change plot selection
              </button>
            </div>
          )}

          {/* ── Plot Visual Grid ── */}
          {!selectedPlot &&
            plotSearched &&
            (() => {
              const counts = {
                all: plotGrid.length,
                available: plotGrid.filter(
                  (p) => getPlotStatus(p.PlotStatus) === "available",
                ).length,
                booked: plotGrid.filter(
                  (p) => getPlotStatus(p.PlotStatus) === "booked",
                ).length,
                hold: plotGrid.filter(
                  (p) => getPlotStatus(p.PlotStatus) === "hold",
                ).length,
                registry: plotGrid.filter(
                  (p) => getPlotStatus(p.PlotStatus) === "registry",
                ).length,
              };
              const filteredPlots =
                plotFilter === "all"
                  ? plotGrid
                  : plotGrid.filter(
                      (p) => getPlotStatus(p.PlotStatus) === plotFilter,
                    );

              const TABS = [
                {
                  key: "all",
                  label: "All",
                  count: counts.all,
                  activeCls:
                    "bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-800",
                  inactiveCls:
                    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                },
                {
                  key: "available",
                  label: "Available",
                  count: counts.available,
                  activeCls: "bg-green-600 text-white",
                  inactiveCls:
                    "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100",
                },
                {
                  key: "booked",
                  label: "Booked",
                  count: counts.booked,
                  activeCls: "bg-orange-500 text-white",
                  inactiveCls:
                    "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100",
                },
                {
                  key: "hold",
                  label: "On Hold",
                  count: counts.hold,
                  activeCls: "bg-red-500 text-white",
                  inactiveCls:
                    "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100",
                },
                {
                  key: "registry",
                  label: "Registry Done",
                  count: counts.registry,
                  activeCls: "bg-indigo-600 text-white",
                  inactiveCls:
                    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100",
                },
              ];

              return (
                <>
                  {plotGrid.length > 0 ? (
                    <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      {/* header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a] flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h6 className="font-semibold text-sm text-gray-800 dark:text-white !mb-0">
                            Plot Map
                          </h6>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Click on an available plot to view &amp; book
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1">
                          {plotGrid.length} total
                        </span>
                      </div>

                      {/* filter tabs */}
                      <div className="px-4 pt-2.5 pb-2 bg-white dark:bg-[#0c1427] flex gap-1.5 flex-wrap border-b border-gray-100 dark:border-gray-700">
                        {TABS.map(
                          ({ key, label, count, activeCls, inactiveCls }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setPlotFilter(key)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                plotFilter === key ? activeCls : inactiveCls
                              }`}
                            >
                              {label}
                              <span
                                className={`rounded-full px-1.5 text-[10px] font-bold ${
                                  plotFilter === key
                                    ? "bg-white/20 text-white"
                                    : "bg-white/60 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          ),
                        )}
                      </div>

                      {detailLoading && (
                        <div className="flex items-center gap-2 text-xs text-primary-button-bg bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-900/30">
                          <i className="material-symbols-outlined text-[14px] animate-spin">
                            refresh
                          </i>
                          Loading plot details…
                        </div>
                      )}

                      <div className="p-3 bg-white dark:bg-[#0c1427] max-h-[300px] overflow-y-auto">
                        {filteredPlots.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {filteredPlots.map((p) => {
                              const statusKey = getPlotStatus(p.PlotStatus);
                              const style = PLOT_STYLES[statusKey];
                              return (
                                <div
                                  key={p.PlotId}
                                  onClick={() => {
                                    setHoveredPlot(null);
                                    setPopupPlot(p);
                                    setShowPopup(true);
                                  }}
                                  onMouseEnter={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();
                                    const below = rect.top < 120;
                                    setHoveredPlot({
                                      ...p,
                                      _statusKey: statusKey,
                                      _style: style,
                                    });
                                    setTooltipPos({
                                      top: below
                                        ? rect.bottom + 8
                                        : rect.top - 8,
                                      left: rect.left + rect.width / 2,
                                      below,
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredPlot("")}
                                  className={`rounded-md shadow-sm transition-all duration-200 select-none ${style.block}`}
                                  style={{ width: "76px", minHeight: "64px" }}
                                >
                                  <div className="flex flex-col items-center justify-center h-full py-2 px-1">
                                    <span className="text-white font-bold text-[11px] text-center leading-tight break-words w-full px-1">
                                      {p.PlotNumber}
                                    </span>
                                    {p.GenralSize && (
                                      <span className="text-white/70 text-[9px] mt-1">
                                        {p.GenralSize} sqft
                                      </span>
                                    )}
                                    <span className="text-white/50 text-[8px] mt-0.5 uppercase tracking-wide">
                                      Plot No.
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <i className="material-symbols-outlined text-[28px] text-gray-300">
                              filter_list_off
                            </i>
                            <p className="text-gray-400 text-xs font-medium">
                              No plots match the selected filter
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-10 rounded-md border border-dashed border-gray-200 dark:border-gray-700 mb-5 bg-gray-50 dark:bg-[#0f172a]">
                      <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <i className="material-symbols-outlined text-[24px] text-gray-300">
                          search_off
                        </i>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                          No plots found
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Try adjusting your filter selections
                        </p>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

          {/* ══ STEP 3 — EMI + Payment (visible after plot selected) ══ */}
          {selectedPlot && (
            <>
              {/* ── EMI Plan Card ── */}
              <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
                <SectionHeader icon="calendar_month" title="EMI Plan Details" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                  <Field label="Select Plan">
                    <select
                      value={selectedEmi}
                      onChange={(e) => handleEmiChange(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">-- Select EMI --</option>
                      {emiPlans.map((e) => (
                        <option key={e.EMIId} value={e.EMIId}>
                          {e.EMI}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Plot Rate (₹)" required>
                    <input
                      type="number"
                      value={plotRateAmount}
                      onChange={(e) => handleRateKeyUp(e.target.value)}
                      className={inputCls(false)}
                      placeholder="0"
                    />
                  </Field>

                  <Field label="Rate Discount (₹)">
                    <input
                      type="number"
                      value={emiDiscount}
                      disabled
                      className={inputCls(true)}
                    />
                  </Field>

                  <Field label="Rate After Discount (₹)">
                    <input
                      type="number"
                      value={plotRateDisplay}
                      disabled
                      className={inputCls(true)}
                    />
                  </Field>

                  <Field label="Discount">
                    <div className="flex items-center gap-2 h-[34px] px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0c1427]">
                      <input
                        type="checkbox"
                        id="chkDiscount"
                        checked={isDiscountApplicable}
                        onChange={(e) => handleDiscountToggle(e.target.checked)}
                        className="w-3.5 h-3.5 cursor-pointer rounded"
                      />
                      <label
                        htmlFor="chkDiscount"
                        className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                      >
                        If Applied
                      </label>
                    </div>
                  </Field>

                  <Field label="PLC">
                    <div className="flex items-center gap-2 h-[34px] px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0c1427]">
                      <input
                        type="checkbox"
                        id="chkPLC"
                        checked={isPLCApplicable}
                        onChange={(e) => handlePLCToggle(e.target.checked)}
                        className="w-3.5 h-3.5 cursor-pointer rounded"
                      />
                      <label
                        htmlFor="chkPLC"
                        className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                      >
                        PLC Applied
                      </label>
                    </div>
                  </Field>
                </div>
              </div>

              {/* ── Payment Details Card ── */}
              <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
                <SectionHeader icon="payments" title="Payment Details" />

                {/* Amount summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      label: "Plot Amount",
                      value: plotAmount,
                      icon: "home",
                      bg: "bg-blue-50 dark:bg-blue-900/10",
                      border: "border-blue-100 dark:border-blue-900/20",
                      text: "text-blue-700 dark:text-blue-300",
                      icolor: "text-blue-500",
                    },
                    {
                      label: "Payable Amount",
                      value: totalAmount,
                      icon: "receipt_long",
                      bg: "bg-violet-50 dark:bg-violet-900/10",
                      border: "border-violet-100 dark:border-violet-900/20",
                      text: "text-violet-700 dark:text-violet-300",
                      icolor: "text-violet-500",
                    },
                    {
                      label: "Balance",
                      value: balanceAmount,
                      icon: "account_balance",
                      bg: "bg-orange-50 dark:bg-orange-900/10",
                      border: "border-orange-100 dark:border-orange-900/20",
                      text: "text-orange-700 dark:text-orange-300",
                      icolor: "text-orange-500",
                    },
                    {
                      label: "EMI Amount",
                      value: emiAmount,
                      icon: "calendar_month",
                      bg: "bg-teal-50 dark:bg-teal-900/10",
                      border: "border-teal-100 dark:border-teal-900/20",
                      text: "text-teal-700 dark:text-teal-300",
                      icolor: "text-teal-500",
                    },
                  ].map(({ label, value, icon, bg, border, text, icolor }) => (
                    <div
                      key={label}
                      className={`rounded-md p-3 ${bg} border ${border}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <i
                          className={`material-symbols-outlined text-[12px] ${icolor}`}
                        >
                          {icon}
                        </i>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          {label}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${text}`}>
                        ₹{Number(value || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Field label="Paid Amount (₹)" required>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => handlePaidAmountChange(e.target.value)}
                      className={inputCls(false)}
                      placeholder="0"
                    />
                  </Field>

                  <Field label="Payment Mode" required>
                    <select
                      value={paymentMode}
                      onChange={(e) => {
                        setPaymentMode(e.target.value);
                        setTransactionNo("");
                        setTransactionDate("");
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

                  {showTransactionFields && (
                    <>
                      <Field label={txLabel} required>
                        <input
                          type="text"
                          value={transactionNo}
                          onChange={(e) => setTransactionNo(e.target.value)}
                          className={inputCls(false)}
                          placeholder={`Enter ${txLabel}`}
                        />
                      </Field>
                      <Field label={txDateLabel} required>
                        <input
                          type="date"
                          value={transactionDate}
                          onChange={(e) => setTransactionDate(e.target.value)}
                          className={inputCls(false)}
                        />
                      </Field>
                    </>
                  )}

                  {showBankBranchFields && (
                    <>
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
                          className={inputCls(false)}
                          placeholder="Enter Branch Name"
                        />
                      </Field>
                    </>
                  )}

                  <Field label="Booking Date" required>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="Allotment Date">
                    <input
                      type="date"
                      value={allotmentDate}
                      onChange={(e) => setAllotmentDate(e.target.value)}
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="Installment Date">
                    <input
                      type="date"
                      value={installmentDate}
                      onChange={(e) => setInstallmentDate(e.target.value)}
                      className={inputCls(false)}
                    />
                  </Field>
                </div>
              </div>

              {/* ── Remarks ── */}
              <div className="mb-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 md:p-5">
                <SectionHeader icon="notes" title="Remarks / Descriptions" />
                <textarea
                  rows={3}
                  value={descriptions}
                  onChange={(e) => setDescriptions(e.target.value)}
                  placeholder="Enter any remarks or additional notes…"
                  className="px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 outline-none w-full bg-white dark:bg-[#0c1427] text-gray-800 dark:text-white focus:border-primary-button-bg resize-none transition-all"
                />
              </div>

              {/* ── Submit ── */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-[34px] px-5 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveBooking}
                  disabled={saving}
                  className="h-[34px] px-6 text-xs font-semibold text-white bg-primary-button-bg hover:bg-button-bg-hover rounded-md transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <i className="material-symbols-outlined text-[14px] animate-spin">
                        refresh
                      </i>{" "}
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined text-[14px]">
                        real_estate_agent
                      </i>{" "}
                      Book Plot
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ══ Hover Tooltip (fixed-position, escapes overflow container) ══ */}
      {hoveredPlot &&
        plotGrid.length > 0 &&
        !selectedPlot &&
        (() => {
          const s = hoveredPlot._style;
          const sk = hoveredPlot._statusKey;
          return (
            <div
              className="pointer-events-none"
              style={{
                position: "fixed",
                top: tooltipPos.below ? tooltipPos.top : undefined,
                bottom: tooltipPos.below
                  ? undefined
                  : `calc(100vh - ${tooltipPos.top}px)`,
                left: tooltipPos.left,
                transform: "translateX(-50%)",
                zIndex: 99999,
              }}
            >
              <div className="bg-gray-900 text-white rounded-md p-3 shadow-2xl text-[11px] min-w-[140px] max-w-[190px]">
                <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                  <div
                    className={`w-5 h-5 rounded-md ${s.header} flex items-center justify-center flex-shrink-0`}
                  >
                    <i className="material-symbols-outlined text-white text-[11px]">
                      {s.icon}
                    </i>
                  </div>
                  <span className="font-bold text-sm text-white">
                    {hoveredPlot.PlotNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {hoveredPlot.GenralSize && (
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <i className="material-symbols-outlined text-[11px] text-blue-400">
                        straighten
                      </i>
                      <span>{hoveredPlot.GenralSize} sqft</span>
                    </div>
                  )}
                  {hoveredPlot.Type && (
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <i className="material-symbols-outlined text-[11px] text-purple-400">
                        category
                      </i>
                      <span>{hoveredPlot.Type}</span>
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-1.5 font-semibold mt-1 ${
                      sk === "available"
                        ? "text-green-400"
                        : sk === "booked"
                          ? "text-orange-400"
                          : "text-red-400"
                    }`}
                  >
                    <i className="material-symbols-outlined text-[11px]">
                      {s.icon}
                    </i>
                    <span>{s.label}</span>
                  </div>
                  {sk === "available" && (
                    <div className="text-blue-400 text-[10px] mt-0.5 border-t border-white/10 pt-1">
                      Click to view details &amp; select
                    </div>
                  )}
                </div>
              </div>
              {tooltipPos.below ? (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-900" />
              ) : (
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900" />
              )}
            </div>
          );
        })()}

      {/* ══ Plot Detail Click Popup ══ */}
      {showPopup &&
        popupPlot &&
        (() => {
          const statusKey = getPlotStatus(popupPlot.PlotStatus);
          const style = PLOT_STYLES[statusKey];
          const isAvail = statusKey === "available";

          return (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPopup(false)}
            >
              <div
                className="bg-white dark:bg-[#0c1427] rounded-md shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: "fadeInScale 0.18s ease-out" }}
              >
                <div className={`${style.header} px-5 py-4 relative`}>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md bg-white/20 hover:bg-white/30 transition-all text-white"
                  >
                    <i className="material-symbols-outlined text-[16px]">
                      close
                    </i>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-sm text-center leading-tight px-1">
                        {popupPlot.PlotNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight !mb-0">
                        {popupPlot.PlotNumber}
                      </h3>
                      <p className="text-white/70 text-[11px] mt-0.5">
                        Plot Number
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 bg-white/20 rounded-full px-2 py-0.5 text-white text-[11px] font-semibold">
                        <i className="material-symbols-outlined text-[11px]">
                          {style.icon}
                        </i>
                        {style.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {[
                      {
                        icon: "straighten",
                        label: "Size",
                        value: popupPlot.GenralSize
                          ? `${popupPlot.GenralSize} sqft`
                          : "—",
                      },
                      {
                        icon: "category",
                        label: "Type",
                        value: popupPlot.Type ?? "—",
                      },
                      {
                        icon: "apartment",
                        label: "Project",
                        value:
                          projects.find(
                            (p) =>
                              String(p.ProjectId) === String(selectedProject),
                          )?.ProjectName ?? "—",
                      },
                      {
                        icon: "grid_view",
                        label: "Sector",
                        value:
                          sectors.find(
                            (s) =>
                              String(s.SectorId) === String(selectedSector),
                          )?.SectorName ?? "—",
                      },
                      {
                        icon: "table_rows",
                        label: "Block",
                        value:
                          blocks.find(
                            (b) => String(b.BlockId) === String(selectedBlock),
                          )?.BlockName ?? "—",
                      },
                      {
                        icon: "pin_drop",
                        label: "Status",
                        value: style.label,
                        valueClass: `font-semibold ${statusKey === "available" ? "text-green-600" : statusKey === "booked" ? "text-orange-600" : "text-red-600"}`,
                      },
                    ].map(({ icon, label, value, valueClass }) => (
                      <div
                        key={label}
                        className="bg-gray-50 dark:bg-gray-800/60 rounded-md p-2.5"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <i
                            className={`material-symbols-outlined text-[13px] ${style.iconColor}`}
                          >
                            {icon}
                          </i>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                            {label}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold text-gray-800 dark:text-gray-100 ${valueClass ?? ""}`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="flex-1 h-[34px] text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                      Close
                    </button>
                    {isAvail && (
                      <button
                        onClick={() => {
                          setShowPopup(false);
                          selectPlotFromGrid(popupPlot.PlotId);
                        }}
                        disabled={detailLoading}
                        className="flex-1 h-[34px] text-xs font-semibold rounded-md bg-primary-button-bg hover:bg-button-bg-hover text-white transition-all disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {detailLoading ? (
                          <>
                            <i className="material-symbols-outlined text-[13px] animate-spin">
                              refresh
                            </i>{" "}
                            Loading…
                          </>
                        ) : (
                          <>
                            <i className="material-symbols-outlined text-[13px]">
                              check_circle
                            </i>{" "}
                            Select This Plot
                          </>
                        )}
                      </button>
                    )}
                    {!isAvail && (
                      <div className="flex-1 h-[34px] flex items-center justify-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md">
                        Not available for booking
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <style>{`
              @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.93); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>
            </div>
          );
        })()}
    </div>
  );
};

export default BookNewPlat;
