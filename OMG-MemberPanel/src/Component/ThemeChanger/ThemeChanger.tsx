import React, { useState, useEffect } from "react";

const ThemeChanger = () => {
  const [open, setOpen] = useState(false);

  const [theme, setTheme] = useState({
    primaryGradientStart: "#7b4fff",
    primaryGradientEnd: "#653086",

    sidebarBg: "#ffffff",
    sidebarTextColor: "#000000",
    sidebarActiveTextColor: "#ffffff",

    headerBg: "#ffffff",
    headerIconBg: "#f1f5f9",
    headerIconColor: "#061e51",

    bodyBg: "#f8fafc",
    bodyTextColor: "#1f2937",

    cardBg: "#ffffff",
    cardTextColor: "#1f2937",
    cardBorderColor: "#e5e7eb",

    btnGradientStart: "#1d3258",
    btnGradientEnd: "#032263",
    btnTextColor: "#ffffff",
    btnHoverBg: "#1e40af",
    btnHoverTextColor: "#ffffff",
  });

  useEffect(() => {
    const saved = localStorage.getItem("customTheme");

    if (saved) {
      const parsed = JSON.parse(saved);

      setTheme(parsed);

      applyVariables(parsed);
    }
  }, []);

  const handleChange = (e: any) => {
    setTheme({
      ...theme,
      [e.target.name]: e.target.value,
    });
  };

  const applyVariables = (data: any) => {
    const root = document.documentElement;

    root.style.setProperty(
      "--primary-gradient",
      `linear-gradient(180deg, ${data.primaryGradientStart} 0%, ${data.primaryGradientEnd} 100%)`,
    );

    root.style.setProperty("--sidebar-bg", data.sidebarBg);
    root.style.setProperty("--sidebar-text-color", data.sidebarTextColor);
    root.style.setProperty(
      "--sidebar-active-text-color",
      data.sidebarActiveTextColor,
    );

    root.style.setProperty("--header-bg", data.headerBg);
    root.style.setProperty("--header-icon-bg", data.headerIconBg);
    root.style.setProperty("--header-icon-color", data.headerIconColor);

    root.style.setProperty("--body-bg", data.bodyBg);
    root.style.setProperty("--body-text-color", data.bodyTextColor);

    root.style.setProperty("--card-bg", data.cardBg);
    root.style.setProperty("--card-text-color", data.cardTextColor);
    root.style.setProperty("--card-border-color", data.cardBorderColor);

    root.style.setProperty(
      "--btn-bg",
      `linear-gradient(90deg, ${data.btnGradientStart} 0%, ${data.btnGradientEnd} 100%)`,
    );

    root.style.setProperty("--btn-text-color", data.btnTextColor);
    root.style.setProperty("--btn-hover-bg", data.btnHoverBg);
    root.style.setProperty("--btn-hover-text-color", data.btnHoverTextColor);
  };

  const applyTheme = () => {
    applyVariables(theme);

    localStorage.setItem("customTheme", JSON.stringify(theme));

    setOpen(false);
  };

  return (
    <>
      {/* <button
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 14px",
          background: "var(--btn-bg)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Change Theme
      </button> */}

      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="theme-modal"
            style={{
              background: "var(--body-bg)",
              borderRadius: "10px",
              width: "600px",
              maxHeight: "70vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid var(--card-border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Theme Builder</h3>

              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "var(--body-text-color)",
                }}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div
              className="theme-builder"
              style={{
                padding: "20px",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              {/* Fields same rahenge */}
              <div className="field">
                <label>Primary Gradient Start</label>
                <input
                  type="color"
                  name="primaryGradientStart"
                  value={theme.primaryGradientStart}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Primary Gradient End</label>
                <input
                  type="color"
                  name="primaryGradientEnd"
                  value={theme.primaryGradientEnd}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Sidebar Background</label>
                <input
                  type="color"
                  name="sidebarBg"
                  value={theme.sidebarBg}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Sidebar Text</label>
                <input
                  type="color"
                  name="sidebarTextColor"
                  value={theme.sidebarTextColor}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Header Background</label>
                <input
                  type="color"
                  name="headerBg"
                  value={theme.headerBg}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Header Icon Background</label>
                <input
                  type="color"
                  name="headerIconBg"
                  value={theme.headerIconBg}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Header Icon Color</label>
                <input
                  type="color"
                  name="headerIconColor"
                  value={theme.headerIconColor}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Body Background</label>
                <input
                  type="color"
                  name="bodyBg"
                  value={theme.bodyBg}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Body Text Color</label>
                <input
                  type="color"
                  name="bodyTextColor"
                  value={theme.bodyTextColor}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Card Background</label>
                <input
                  type="color"
                  name="cardBg"
                  value={theme.cardBg}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Card Text Color</label>
                <input
                  type="color"
                  name="cardTextColor"
                  value={theme.cardTextColor}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Card Border Color</label>
                <input
                  type="color"
                  name="cardBorderColor"
                  value={theme.cardBorderColor}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Button Gradient Start</label>
                <input
                  type="color"
                  name="btnGradientStart"
                  value={theme.btnGradientStart}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Button Gradient End</label>
                <input
                  type="color"
                  name="btnGradientEnd"
                  value={theme.btnGradientEnd}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Button Text Color</label>
                <input
                  type="color"
                  name="btnTextColor"
                  value={theme.btnTextColor}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Button Hover Background</label>
                <input
                  type="color"
                  name="btnHoverBg"
                  value={theme.btnHoverBg}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Button Hover Text</label>
                <input
                  type="color"
                  name="btnHoverTextColor"
                  value={theme.btnHoverTextColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div
              style={{
                padding: "15px 20px",
                borderTop: "1px solid var(--card-border-color)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "8px 16px",
                  background: "#ddd",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Cancel
              </button>

              <button
                onClick={applyTheme}
                style={{
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeChanger;
