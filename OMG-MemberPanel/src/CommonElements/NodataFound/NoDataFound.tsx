
import "./NoDataFound.scss";

const NoDataFound = () => {
  return (
    <div className="no-data-wrapper">

      {/* Icon with dashed ring */}
      <div className="nd-icon-ring">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#185FA5"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="9" y1="11" x2="13" y2="11" strokeWidth="1.5" />
          <line x1="11" y1="9" x2="11" y2="13" strokeWidth="1.5" />
        </svg>
      </div>

      <h5 className="nd-title">No records found</h5>
      <p className="nd-sub">
        There is no data available for the selected date range.
      </p>

      {/* Suggestion chips */}
      <div className="nd-chips">
        <span className="nd-chip">Try a wider date range</span>
        <span className="nd-chip">Check your filters</span>
      </div>

      <div className="nd-hint">
        Tip: Adjust the From / To date and search again to find your records.
      </div>
    </div>
  );
};

export default NoDataFound;