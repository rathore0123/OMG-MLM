// src/index.tsx

import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./ReduxToolkit/Store";
import "./i18n";
import { SweetAlertProvider } from "./Context/SweetAlertContext";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
// import "bootstrap-daterangepicker/daterangepicker.css";
import { plainUniversalService } from "./Service/Theme/plainApi";
import { flattenTheme } from "./Theme/themeConverter";
import { applyTheme } from "./Theme/applyTheme";
import { CurrencyProvider } from "./Context/CurrencyContext";
import { CompanyProvider } from "./Context/CompanyContext";
import { ProfileProvider } from "./Context/ProfileContext";

/* ================= THEME BOOTSTRAP ================= */

async function bootstrapTheme() {
  try {
    const payload = {
      procName: "MemberTheme", // ✅ using your procedure
      Para: JSON.stringify({
        ActionMode: "GetActive",
      }),
    };

    const response = await plainUniversalService(payload);
    const res = response?.data;

    if (!Array.isArray(res) || res.length === 0) return;

    const row = res[0];

    // ✅ SAFE JSON PARSE (handles \r\n issue)
    let themeJson: any = {};
    try {
      const cleaned = row.ThemeJson?.replace(/[\r\n]/g, "");
      themeJson = JSON.parse(cleaned || "{}");
    } catch (err) {
      console.error("Theme parse error", err);
      return;
    }

    const colors = flattenTheme(themeJson);

    // ✅ APPLY BEFORE REACT LOAD
    applyTheme({
      mode: themeJson.darkModeDefault ? "dark" : "light",
      font: themeJson.fontBody,
      colors,
    });
  } catch (err) {
    console.warn("Theme load failed, using default theme.");
  }
}

/* ================= APP START ================= */

async function startApp() {
  // 🚀 WAIT FOR THEME FIRST
  await bootstrapTheme();

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );

  root.render(
    <Provider store={Store}>
      <ProfileProvider>
      <CurrencyProvider>
        <SweetAlertProvider>
          <CompanyProvider>
            <App />
          </CompanyProvider>
        </SweetAlertProvider>
      </CurrencyProvider>
      </ProfileProvider>
    </Provider>,
  );
}

startApp();

/* ================= WEB VITALS ================= */

reportWebVitals();
