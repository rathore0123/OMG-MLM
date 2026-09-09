import React from "react";

const statusStyles = {
  Active: {
    background: "#008000",
    color: "#fff",
  },
  Completed: {
    background: "#008000",
    color: "#fff",
  },
   Paid: {
    background: "#008000",
    color: "#fff",
  },
  Achieved: {
    background: "#008000",
    color: "#fff",
  },
  Unachieved: {
    background: "#e5e7eb",
    color: "#555",
  },
  New: {
    background: "#008000",
    color: "#fff",
  },
   Unpaid: {
    background: "#ff0000",
    color: "#fff",
  },
  Closed: {
    background: "#ff0000",
    color: "#fff",
  },
  Pending: {
    background: "#facc15",
    color: "#000",
  },
  Default: {
    background: "#e5e7eb",
    color: "#111",
  },
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || statusStyles.Default;

  return (
    <span
      style={{
        ...style,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 500,
        display: "inline-block",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;