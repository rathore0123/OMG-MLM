export const customStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },

  headRow: {
    style: {
      backgroundColor: "var(--card-border-color)",
      borderBottom: "1px solid var(--card-border)",
      minHeight: "45px",
    },
  },

  headCells: {
    style: {
      color: "var(--card-text-color)",
      fontWeight: 600,
      fontSize: "13px",
    },
  },

  rows: {
    style: {
      backgroundColor: "var(--card-bg)",
      color: "var(--card-text-color)",
      borderBottom: "1px solid var(--card-border)",
      minHeight: "48px",
    },
    highlightOnHoverStyle: {
      backgroundColor: "var(--card-border-color)",
      transition: "all 0.2s ease",
    },
  },

  pagination: {
    style: {
      backgroundColor: "var(--card-border-color)",
      color: "var(--card-text-color)",
      borderTop: "1px solid var(--card-border-color)",
    },
  },
};
