import axios from "axios";
import { applyTheme } from "./applyTheme";
import { flattenTheme } from "./themeConverter";

export async function loadTheme() {
  const themeURL = import.meta.env.VITE_THEME_URL;

  if (!themeURL) {
    console.error("VITE_THEME_URL is not defined");
    return;
  }

  try {
    const response = await axios.post(themeURL, {});
    const res = response?.data;

    if (!Array.isArray(res) || res.length === 0) {
      console.warn("Theme API returned empty data");
      return;
    }

    const row = res[0];

    let themeJson: any = {};
    try {
      const cleaned = row?.ThemeJson?.replace(/[\r\n]/g, "") || "{}";
      themeJson = JSON.parse(cleaned);
    } catch (err) {
      console.error("Theme JSON parse error:", row?.ThemeJson);
      console.error(err);
      return;
    }

    const colors = flattenTheme(themeJson);

    applyTheme({
      mode: themeJson?.darkModeDefault ? "dark" : "light",
      font: themeJson?.fontBody || "Arial, sans-serif",
      colors,
    });

  } catch (err) {
    console.warn("Theme load failed", err);
  }
}