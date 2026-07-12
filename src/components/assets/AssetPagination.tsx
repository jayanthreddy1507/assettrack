export interface AssetPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function AssetPagination({
  page,
  totalPages,
  onChange,
}: AssetPaginationProps) {
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <nav className="asset-pagination" aria-label="Asset pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          data-active={pageNumber === page}
          onClick={() => onChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
