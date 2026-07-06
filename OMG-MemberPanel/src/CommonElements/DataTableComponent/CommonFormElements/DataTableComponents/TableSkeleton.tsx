import React from "react";
import "./TableSkeleton.scss";

type Props = {
  rows?: number;
  columns?: number;
  showExportSkeleton?: boolean;
  showPageSizeSkeleton?: boolean;
};

const TableSkeleton: React.FC<Props> = ({
  rows = 5,
  columns = 5,
  showExportSkeleton = false,
  showPageSizeSkeleton = false,
}) => {
  return (
    <div className="skeleton-wrapper">

      {/* TOP BAR */}
      {(showExportSkeleton || showPageSizeSkeleton) && (
        <div className="skeleton-top">
          
          {showPageSizeSkeleton ? (
            <div className="skeleton-box page-size" />
          ) : (
            <div />
          )}

          {showExportSkeleton && (
            <div className="export-group">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="skeleton-box export-btn" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {[...Array(columns)].map((_, i) => (
                <th key={i}>
                  <div className="skeleton-text header-text" />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[...Array(columns)].map((_, colIdx) => (
                  <td key={colIdx}>
                    <div className="skeleton-text cell-text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TableSkeleton;