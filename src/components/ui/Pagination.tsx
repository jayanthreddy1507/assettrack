export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="row" aria-label="Pagination">
      <button className="ui-button ui-button--secondary ui-button--sm"
        disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="caption">Page {page} of {totalPages}</span>
      <button className="ui-button ui-button--secondary ui-button--sm"
        disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
