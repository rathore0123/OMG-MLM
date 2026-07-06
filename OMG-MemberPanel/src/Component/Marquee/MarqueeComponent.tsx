import { useState, useEffect, useRef, useMemo, ChangeEvent, KeyboardEvent } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { SearchSuggestionItem } from "../../Type/Layout/Sidebar";
import { useAppSelector } from "../../ReduxToolkit/Hooks";

const base = import.meta.env.BASE_URL;

// Pages that come from routes not in the backend menu
const EXTRA_PAGES: SearchSuggestionItem[] = [
  { icon: "Home",    title: "Mobile Recharge",   path: `${base}/recharge/mobile` },
  { icon: "Home",    title: "Recharge & Bills",  path: `${base}/recharge` },
  { icon: "Home",    title: "Electricity Bill",  path: `${base}/bills/ELECTRICITY` },
  { icon: "Home",    title: "Gas Bill",          path: `${base}/bills/GAS` },
  { icon: "Home",    title: "Water Bill",        path: `${base}/bills/WATER` },
  { icon: "Home",    title: "DTH / Cable TV",    path: `${base}/bills/DTH` },
  { icon: "Home",    title: "Broadband Bill",    path: `${base}/bills/BROADBAND` },
  { icon: "Home",    title: "Insurance",         path: `${base}/bills/INSURANCE` },
  { icon: "Home",    title: "FASTag Recharge",   path: `${base}/bills/FASTAG` },
  { icon: "Filter",  title: "Request Withdraw",  path: `${base}/RequestWithdraw` },
  { icon: "Filter",  title: "Withdraw History",  path: `${base}/WithdrawHistory` },
  { icon: "Paper",   title: "Account Statement", path: `${base}/accountstatement` },
  { icon: "Paper",   title: "Transaction Log",   path: `${base}/transaction-log` },
  { icon: "Paper",   title: "Make Investment",   path: `${base}/make-investment` },
  { icon: "Paper",   title: "My Investment",     path: `${base}/my-investment` },
  { icon: "Paper",   title: "Deposit History",   path: `${base}/deposit-history` },
  { icon: "Ticket",  title: "Support Ticket",    path: `${base}/supportticket` },
];

const MarqueeComponent = () => {
  const navigate   = useNavigate();
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);

  const menuPages = useAppSelector((state) => state.menu.pages);

  // Merge backend menu pages with extra pages, deduplicating by path and title
  const allPages = useMemo<SearchSuggestionItem[]>(() => {
    const base_pages = menuPages.length > 0 ? menuPages : [];
    const seenPaths  = new Set(base_pages.map((p) => p.path));
    const seenTitles = new Set(base_pages.map((p) => p.title.toLowerCase()));
    const extras = EXTRA_PAGES.filter(
      (p) => !seenPaths.has(p.path) && !seenTitles.has(p.title.toLowerCase())
    );
    return [...base_pages, ...extras];
  }, [menuPages]);

  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<SearchSuggestionItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open,        setOpen]        = useState(false);

  // ⌘K / Ctrl+K focuses the input
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Click outside closes dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => { setQuery(""); setResults([]); setActiveIndex(-1); setOpen(false); };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    const filtered = allPages.filter((p) =>
      p.title?.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered);
    setOpen(true);
  };

  const goTo = (path: string) => { navigate(path); close(); };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex >= 0 ? activeIndex : 0];
      if (target) goTo(target.path);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const highlight = (text: string) => {
    const q = query.trim();
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: "rgba(59,130,246,0.22)", color: "inherit", borderRadius: 3, padding: "0 2px" }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div
      ref={wrapRef}
      className="search-container d-flex align-items-center me-4 d-xl-flex d-none"
      style={{ position: "relative" }}
    >
      <form onSubmit={(e) => e.preventDefault()} className="w-100 position-relative">
        <FiSearch
          className="position-absolute"
          style={{ left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--body-text-color)", zIndex: 1 }}
        />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search pages..."
          className="form-control ps-5 pe-5"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query) setOpen(true); }}
          autoComplete="off"
          style={{
            borderRadius: 25,
            height:       40,
            background:   "var(--card-bg)",
            color:        "var(--card-text-color)",
            border:       "1px solid var(--card-border-color)",
          }}
        />

        {!query && (
          <span
            className="position-absolute"
            style={{
              right: 10, top: "50%", transform: "translateY(-50%)",
              fontSize: 12, background: "var(--body-bg)",
              padding: "2px 6px", borderRadius: 6, color: "var(--body-text-color)",
              pointerEvents: "none",
            }}
          >
            ⌘ K
          </span>
        )}
      </form>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:      "absolute",
          top:           "calc(100% + 6px)",
          left:          0,
          right:         0,
          background:    "var(--card-bg)",
          border:        "1px solid var(--card-border-color)",
          borderRadius:  12,
          boxShadow:     "0 12px 40px rgba(0,0,0,0.25)",
          zIndex:        99999,
          maxHeight:     360,
          overflowY:     "auto",
          padding:       "6px 0",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "16px 18px", fontSize: 13, color: "var(--light-font)", textAlign: "center" }}>
              No pages found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <div style={{ padding: "6px 18px 4px", fontSize: 11, fontWeight: 600, color: "var(--light-font)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {results.length} page{results.length !== 1 ? "s" : ""} found
              </div>

              {results.map((item, i) => (
                <button
                  key={item.path}
                  type="button"
                  onMouseDown={() => goTo(item.path)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    width:       "100%",
                    display:     "flex",
                    alignItems:  "center",
                    gap:         10,
                    padding:     "9px 18px",
                    background:  i === activeIndex ? "rgba(59,130,246,0.1)" : "transparent",
                    border:      "none",
                    borderLeft:  i === activeIndex ? "3px solid #3b82f6" : "3px solid transparent",
                    cursor:      "pointer",
                    textAlign:   "left",
                    transition:  "background 0.1s",
                  }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                    background: i === activeIndex ? "rgba(59,130,246,0.18)" : "var(--card-border-color)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FiSearch size={13} style={{ color: i === activeIndex ? "#3b82f6" : "var(--light-font)" }} />
                  </span>

                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--card-text-color)" }}>
                    {highlight(item.title)}
                  </span>

                  {i === activeIndex && (
                    <span style={{
                      fontSize: 11, color: "#3b82f6", fontWeight: 600,
                      background: "rgba(59,130,246,0.12)", padding: "2px 8px", borderRadius: 6,
                    }}>
                      ↵
                    </span>
                  )}
                </button>
              ))}

              <div style={{
                borderTop: "1px solid var(--card-border-color)",
                padding: "7px 18px", display: "flex", gap: 14,
                fontSize: 11, color: "var(--light-font)",
              }}>
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>Esc close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MarqueeComponent;
