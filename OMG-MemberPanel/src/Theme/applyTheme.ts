// src/theme/applyTheme.ts

type ThemeConfig = {
  mode?: "light" | "dark";
  colors?: Record<string, string>;
  font?: string;
};

/* ✅ ADD THIS HELPER */
const hexToRgb = (hex: string): string => {
  let cleanHex = hex.replace("#", "");

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
};

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;

  /* ================= DARK MODE ================= */
  if (theme.mode) {
    root.classList.toggle("dark", theme.mode === "dark");
  }

  if (theme.colors) {
    /* ================= PRIMARY ================= */
    const primaryStart = theme.colors?.["primary-start"] || "#6366f1";
    const primaryEnd = theme.colors?.["primary-end"] || "#8b5cf6";

    // console.log("Applying primary colors:", { primaryStart, primaryEnd });

    // existing variables (unchanged)
    root.style.setProperty("--primary-start", primaryStart);
    root.style.setProperty("--primary-end", primaryEnd);

    /* ✅ NEW RGBA VARIABLES (AUTO GENERATED) */
    root.style.setProperty("--primary-start-rgba", hexToRgb(primaryStart));

    root.style.setProperty("--primary-end-rgba", hexToRgb(primaryEnd));

    root.style.setProperty(
      "--primary-gradient",
      `linear-gradient(180deg, ${primaryStart} 0%, ${primaryEnd} 100%)`,
    );
    root.style.setProperty(
      "--sidebar-active-bg",
      `linear-gradient(180deg, ${primaryStart} 0%, ${primaryEnd} 100%)`,
    );
    /* ================= SIDEBAR ================= */
    root.style.setProperty("--sidebar-bg", theme.colors["sidebar-bg"]);
    root.style.setProperty(
      "--sidebar-text-color",
      theme.colors["sidebar-text"],
    );
    root.style.setProperty(
      "--sidebar-active-text-color",
      theme.colors["sidebar-activeText"],
    );

    /* ================= HEADER ================= */
    root.style.setProperty("--header-bg", theme.colors["header-bg"]);
    root.style.setProperty("--header-icon-bg", theme.colors["header-iconBg"]);
    root.style.setProperty(
      "--header-icon-color",
      theme.colors["header-iconColor"],
    );

    /* ================= BODY ================= */
    root.style.setProperty("--body-bg", theme.colors["body-bg"]);
    root.style.setProperty("--body-text-color", theme.colors["body-text"]);

    /* ================= CARD ================= */
    root.style.setProperty("--card-bg", theme.colors["card-bg"]);
    root.style.setProperty("--card-text-color", theme.colors["card-text"]);

    const cardtextcolorrgb = theme.colors["card-text"] || "#061e51";
    root.style.setProperty("--card-text-color-rgba", hexToRgb(cardtextcolorrgb));
    console.log("rgb" + cardtextcolorrgb);
    console.log("text color" + theme.colors["card-text"]);

    root.style.setProperty("--card-border-color", theme.colors["card-border"]);

    /* ================= BUTTON ================= */
    root.style.setProperty(
      "--btn-bg",
      `linear-gradient(90deg, ${theme.colors["button-start"]} 0%, ${theme.colors["button-end"]} 100%)`,
    );

    root.style.setProperty("--btn-text-color", theme.colors["button-text"]);
    root.style.setProperty("--btn-hover-bg", theme.colors["button-hoverBg"]);
    root.style.setProperty(
      "--btn-hover-text-color",
      theme.colors["button-hoverText"],
    );
  }

  /* ================= FONT ================= */
  if (theme.font) {
    root.style.setProperty("--font-body", theme.font);
    document.body.style.fontFamily = theme.font;
  }

  console.log("✅ Theme applied:", theme);
}
