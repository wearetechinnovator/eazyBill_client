import { Icons } from "../helper/icons";
import PropTypes from "prop-types";

const Pagination = ({ activePage, totalData, dataLimit, setActivePage }) => {
  const totalPages = Math.ceil(totalData / dataLimit);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // number of visible page buttons (excluding first/last)

    if (totalPages <= maxVisible) {
      // Case: Small total pages → show all
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first and last
      pages.push(1);

      // Show "..." if current page > 3
      if (activePage > 3) pages.push("...");

      // Show neighbors around active page
      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Show "..." if current page is not near the end
      if (activePage < totalPages - 2) pages.push("...");

      // Last page
      pages.push(totalPages);
    }

    return pages;
  };

  
  if(dataLimit > totalData){
    return;
  }

  return (
    <div className="flex justify-end items-center space-x-2 pagination-custom">
      {/* Back button */}
      {activePage > 1 && (
        <div
          onClick={() => setActivePage(activePage - 1)}
          className="paginate__button__back"
        >
          <Icons.PREV_PAGE_ARROW />
        </div>
      )}

      {/* Page numbers */}
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <div key={`ellipsis-${idx}`} className="px-2">
            ...
          </div>
        ) : (
          <div
            key={page}
            onClick={() => setActivePage(page)}
            className={`paginate__button__number ${
              activePage === page ? "active__page" : ""
            }`}
          >
            {page}
          </div>
        )
      )}

      {/* Next button */}
      {activePage < totalPages && (
        <div
          onClick={() => setActivePage(activePage + 1)}
          className="paginate__button__next"
        >
          <Icons.NEXT_PAGE_ARROW />
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  activePage: PropTypes.number.isRequired,
  totalData: PropTypes.number.isRequired,
  dataLimit: PropTypes.number.isRequired,
  setActivePage: PropTypes.func.isRequired,
};

export default Pagination;