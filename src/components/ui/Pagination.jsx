import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import IconButton from "./IconButton";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const pages = useMemo(() => {
    if (totalPages <= 1) return [];
    const max = 5;
    let start = Math.max(0, page - Math.floor(max / 2));
    let end = Math.min(totalPages - 1, start + max - 1);
    start = Math.max(0, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0} aria-label="Previous page">
        <ChevronLeftIcon size={15} />
      </IconButton>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={
            p === page
              ? "h-8 min-w-8 rounded-md bg-ink px-2.5 text-[13px] font-semibold text-ink-inverse"
              : "h-8 min-w-8 rounded-md border border-border px-2.5 text-[13px] font-medium text-ink-secondary hover:bg-surface-sunken"
          }
        >
          {p + 1}
        </button>
      ))}
      <IconButton
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
      >
        <ChevronRightIcon size={15} />
      </IconButton>
    </div>
  );
};

export default Pagination;
