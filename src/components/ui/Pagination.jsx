import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  label = 'Pagination',
  itemLabel = 'records',
  summary,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  className = '',
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageNumbers = [
    ...new Set([1, page > 2 ? page - 1 : 2, page > 1 ? page : 3, pageCount]),
  ].filter((value) => value <= pageCount).sort((a, b) => a - b);
  const pageButton = 'flex h-7 min-w-7 items-center justify-center rounded border border-slate-200 bg-white px-1 text-xs text-slate-600 hover:bg-slate-50 disabled:cursor-default disabled:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

  return (
    <div className={`flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500 ${className}`}>
      <span role="status" aria-live="polite">
        {summary ?? <>Showing {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total} {itemLabel}</>}
      </span>
      <nav className="flex items-center gap-1" aria-label={label}>
        <button type="button" className={pageButton} onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} aria-label={previousLabel}>
          <ChevronLeft size={15} />
        </button>
        {pageNumbers.map((value, index) => (
          <span key={value} className="flex items-center gap-1">
            {index > 0 && value - pageNumbers[index - 1] > 1 && <span className="px-1">…</span>}
            <button type="button" className={`${pageButton} ${value === page ? 'border-slate-300 bg-slate-200 font-semibold text-slate-800' : ''}`} onClick={() => onPageChange(value)} aria-current={value === page ? 'page' : undefined}>
              {value}
            </button>
          </span>
        ))}
        <button type="button" className={pageButton} onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page === pageCount} aria-label={nextLabel}>
          <ChevronRight size={15} />
        </button>
      </nav>
    </div>
  );
}
