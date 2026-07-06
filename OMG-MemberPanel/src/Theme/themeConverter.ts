// src/theme/themeConverter.ts

export const convertToThemeJson = (theme: any) => {
  return {
    primary: {
      start: theme.primaryGradientStart,
      end: theme.primaryGradientEnd,
    },
    sidebar: {
      bg: theme.sidebarBg,
      text: theme.sidebarTextColor,
      activeText: theme.sidebarActiveTextColor,
    },
    header: {
      bg: theme.headerBg,
      iconBg: theme.headerIconBg,
      iconColor: theme.headerIconColor,
    },
    body: {
      bg: theme.bodyBg,
      text: theme.bodyTextColor,
    },
    card: {
      bg: theme.cardBg,
      text: theme.cardTextColor,
      border: theme.cardBorderColor,
    },
    button: {
      start: theme.btnGradientStart,
      end: theme.btnGradientEnd,
      text: theme.btnTextColor,
      hoverBg: theme.btnHoverBg,
      hoverText: theme.btnHoverTextColor,
    },
    darkModeDefault: false,
    fontBody: "Inter",
  };
};

export const flattenTheme = (themeJson: any) => {
  const colors: Record<string, string> = {};

  Object.entries(themeJson).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([shade, color]) => {
        colors[`${key}-${shade}`] = color as string;
      });
    }
  });

  return colors;
};