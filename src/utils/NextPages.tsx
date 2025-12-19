import React, { useState, useEffect } from "react";

interface PaginationProps {
  dataTotal: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const NextPages: React.FC<PaginationProps> = ({
  dataTotal,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(dataTotal / itemsPerPage));
  const pageNumberLimit = 5;
  const [maxPageNumberLimit, setMaxPageNumberLimit] = useState<number>(5);
  const [minPageNumberLimit, setMinPageNumberLimit] = useState<number>(0);

  useEffect(() => {
    // Update limits based on currentPage
    if (currentPage > maxPageNumberLimit) {
      setMaxPageNumberLimit((prev) => prev + pageNumberLimit);
      setMinPageNumberLimit((prev) => prev + pageNumberLimit);
    } else if (currentPage <= minPageNumberLimit) {
      setMaxPageNumberLimit((prev) => prev - pageNumberLimit);
      setMinPageNumberLimit((prev) => prev - pageNumberLimit);
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderPageNumbers = pages
    .filter((page) => page > minPageNumberLimit && page <= maxPageNumberLimit)
    .map((page) => (
      <li  key={page} className={`page-item ${currentPage === page ? "active" : ""}`} >
        <button type="button" className="page-link" onClick={() => handlePageChange(page)} > {page} </button>
      </li>
    ));

  return (
    <div className="d-md-flex fs-5 align-items-center mt-n1">
      <div className="me-md-auto text-md-left text-center mb-2 mb-md-0">
        ສະແດງ {dataTotal > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
        ຫາ {Math.min(currentPage * itemsPerPage, dataTotal)}
        ຈາກທັງໝົດ {dataTotal} ລາຍການ
      </div>
      <ul className="pagination mb-0 justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => handlePageChange(1)}
          >
            <i className="fa-solid fa-angles-left"></i>
          </button>
        </li>
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => handlePageChange(currentPage - 1)}  >
          <i className="fa-solid fa-angle-left"></i>
          </button>
        </li>
        {minPageNumberLimit >= 1 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        {renderPageNumbers}
        {pages.length > maxPageNumberLimit && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => handlePageChange(currentPage + 1)} >
          <i className="fa-solid fa-angle-right"></i>
          </button>
        </li>

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => handlePageChange(totalPages)}>
          <i className="fa-solid fa-angles-right"></i>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default NextPages;
