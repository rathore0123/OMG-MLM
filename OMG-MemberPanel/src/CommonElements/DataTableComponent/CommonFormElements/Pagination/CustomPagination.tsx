"use client";

import React, { useEffect, useState } from "react";
import "./custom-pagination.scss";

type CustomPaginationProps = {
  currentPage: number;
  rowsPerPage: number;
  rowCount: number;
  onChangePage: (page: number, totalRows?: number) => void;
  onChangeRowsPerPage: (size: number, page: number) => void;
};

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  rowsPerPage,
  rowCount,
  onChangePage,
}) => {
  const [maxVisiblePages, setMaxVisiblePages] = useState(7);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setMaxVisiblePages(3);
      else if (window.innerWidth < 1024) setMaxVisiblePages(5);
      else setMaxVisiblePages(7);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalPages = Math.ceil(rowCount / rowsPerPage);
  const safeTotalPages = Math.max(1, totalPages);

  const startRow = rowCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow =
    rowCount === 0 ? 0 : Math.min(currentPage * rowsPerPage, rowCount);

  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(safeTotalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return { start, end };
  };

  const { start, end } = getVisiblePages();

  if (rowCount === 0) return null;

  return (
    <div className="pagination-container">

      {/* LEFT */}
      <div className="pagination-info">
        Showing <b>{startRow}</b> – <b>{endRow}</b> of <b>{rowCount}</b> results
      </div>

      {/* RIGHT */}
      <div className="pagination-controls">

        <ol className="pagination-list">

          {/* Prev */}
          <li>
            <button
              disabled={currentPage === 1}
              onClick={() => onChangePage(currentPage - 1)}
              className="page-btn"
            >
              ‹
            </button>
          </li>

          {/* First */}
          {start > 1 && (
            <>
              <li>
                <button onClick={() => onChangePage(1)} className="page-btn">
                  1
                </button>
              </li>
              {start > 2 && <li className="ellipsis">…</li>}
            </>
          )}

          {/* Numbers */}
          {Array.from({ length: end - start + 1 }, (_, i) => {
            const page = start + i;
            return (
              <li key={page}>
                <button
                  onClick={() => onChangePage(page)}
                  className={`page-btn ${
                    page === currentPage ? "active" : ""
                  }`}
                >
                  {page}
                </button>
              </li>
            );
          })}

          {/* Last */}
          {end < safeTotalPages && (
            <>
              {end < safeTotalPages - 1 && (
                <li className="ellipsis">…</li>
              )}
              <li>
                <button
                  onClick={() => onChangePage(safeTotalPages)}
                  className="page-btn"
                >
                  {safeTotalPages}
                </button>
              </li>
            </>
          )}

          {/* Next */}
          <li>
            <button
              disabled={currentPage === safeTotalPages}
              onClick={() => onChangePage(currentPage + 1)}
              className="page-btn"
            >
              ›
            </button>
          </li>

        </ol>
      </div>
    </div>
  );
};

export default CustomPagination;