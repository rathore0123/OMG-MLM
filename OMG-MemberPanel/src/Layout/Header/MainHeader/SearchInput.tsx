import { Form, Input, InputGroup, InputGroupText } from "reactstrap";
import { SVG } from "../../../AbstractElements";
import { SearchAnything } from "../../../utils/Constant";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { MenuItem, SearchSuggestionItem } from "../../../Type/Layout/Sidebar";
import { MenuList } from "../../../Data/Layout/Sidebar";
import { useNavigate } from "react-router-dom";

const base = import.meta.env.BASE_URL;

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
  { icon: "Paper",   title: "Business Report",   path: `${base}/business-report` },
  { icon: "Paper",   title: "Team Business",     path: `${base}/team-business` },
  { icon: "Profile", title: "My Profile",        path: `${base}/my-profile` },
  { icon: "Profile", title: "KYC",               path: `${base}/kyc` },
  { icon: "Filter",  title: "Request Withdraw",  path: `${base}/RequestWithdraw` },
  { icon: "Filter",  title: "Withdraw History",  path: `${base}/WithdrawHistory` },
  { icon: "Paper",   title: "Account Statement", path: `${base}/accountstatement` },
  { icon: "Paper",   title: "Transaction Log",   path: `${base}/transaction-log` },
  { icon: "Paper",   title: "Make Investment",   path: `${base}/make-investment` },
  { icon: "Paper",   title: "My Investment",     path: `${base}/my-investment` },
  { icon: "Paper",   title: "Deposit History",   path: `${base}/deposit-history` },
  { icon: "Ticket",  title: "Support Ticket",    path: `${base}/supportticket` },
];

const SearchInput = () => {
  const navigate = useNavigate();
  const wrapRef  = useRef<HTMLDivElement>(null);

  const [allPages,      setAllPages]      = useState<SearchSuggestionItem[]>([]);
  const [query,         setQuery]         = useState("");
  const [results,       setResults]       = useState<SearchSuggestionItem[]>([]);
  const [activeIndex,   setActiveIndex]   = useState(-1);

  useEffect(() => {
    const pages: SearchSuggestionItem[] = [];
    const collect = (item: MenuItem, icon: string | undefined) => {
      if (item.children) {
        item.children.forEach((c) => collect(c, icon));
      } else if (item.path && !item.path.startsWith("http")) {
        pages.push({ icon, title: item.title, path: item.path });
      }
    };
    MenuList?.forEach((g) => g.Items?.forEach((item) => collect(item, item.icon)));
    const seen = new Set(pages.map((p) => p.path));
    EXTRA_PAGES.forEach((p) => { if (!seen.has(p.path)) pages.push(p); });
    setAllPages(pages);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => { setQuery(""); setResults([]); setActiveIndex(-1); };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    if (!val.trim()) { setResults([]); return; }
    setResults(allPages.filter((p) => p.title?.toLowerCase().includes(val.toLowerCase())));
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
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: "rgba(59,130,246,0.18)", color: "inherit", borderRadius: 3, padding: "0 2px" }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const isOpen = query.length > 0;

  return (
    <div className="header-left d-xl-block d-none" ref={wrapRef} style={{ position: "relative" }}>
      <Form className="search-form mb-0">
        <InputGroup>
          <InputGroupText className="pe-0">
            <SVG className="search-bg svg-color" iconId="Search" />
          </InputGroupText>
          <Input
            type="text"
            placeholder={SearchAnything}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </InputGroup>
      </Form>

      {isOpen && (
        <div style={{
          position:        "absolute",
          top:             "calc(100% + 6px)",
          left:            0,
          right:           0,
          background:      "var(--card-color, #fff)",
          border:          "1px solid var(--border-table, #e2e8f0)",
          borderRadius:    12,
          boxShadow:       "0 8px 32px rgba(0,0,0,0.13)",
          zIndex:          9999,
          maxHeight:       360,
          overflowY:       "auto",
          padding:         "6px 0",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "18px 20px", color: "var(--dark-gray)", fontSize: 13, textAlign: "center" }}>
              No pages found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.path}
                type="button"
                onMouseDown={() => goTo(item.path)}
                onMouseEnter={() => setActiveIndex(i)}
                style={{
                  width:           "100%",
                  display:         "flex",
                  alignItems:      "center",
                  gap:             12,
                  padding:         "10px 18px",
                  background:      i === activeIndex ? "var(--light-background, rgba(59,130,246,0.07))" : "transparent",
                  border:          "none",
                  cursor:          "pointer",
                  textAlign:       "left",
                  transition:      "background 0.12s",
                  borderLeft:      i === activeIndex ? "3px solid #3b82f6" : "3px solid transparent",
                }}
              >
                <span style={{
                  width:        32,
                  height:       32,
                  borderRadius: 8,
                  background:   i === activeIndex ? "rgba(59,130,246,0.12)" : "var(--border-table, #f1f5f9)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  flexShrink:   0,
                  transition:   "background 0.12s",
                }}>
                  <SVG className="stroke-icon" iconId={item.icon} style={{ width: 16, height: 16 }} />
                </span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "var(--dark-gray)" }}>
                  {highlight(item.title)}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
                  {i === activeIndex ? "↵ open" : ""}
                </span>
              </button>
            ))
          )}

          {results.length > 0 && (
            <div style={{
              borderTop:  "1px solid var(--border-table, #e2e8f0)",
              padding:    "8px 18px",
              display:    "flex",
              gap:        16,
              fontSize:   11,
              color:      "#94a3b8",
            }}>
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>Esc close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
