import Pagination from './Pagination';

export default function EntityTable({
  label,
  columns,
  rows,
  getRowId,
  selectedId,
  onRowClick,
  checkedIds = [],
  onToggleRow,
  onTogglePage,
  page = 1,
  pageSize = rows.length || 1,
  total = rows.length,
  onPageChange,
  itemLabel = "records",
  emptyMessage = "No records found.",
}) {
  const allChecked =
    rows.length > 0 && rows.every((row) => checkedIds.includes(getRowId(row)));

  return (
    <section
      className="flex h-[570px] min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      aria-label={label}
    >
      <div
        className="flex-1 overflow-auto
    [scrollbar-width:none]
    [-ms-overflow-style:none]
    [&::-webkit-scrollbar]:hidden"
      >
        <table className="w-full min-w-[660px] table-fixed border-collapse text-left">
          <colgroup>
            {onToggleRow && <col className="w-11" />}
            {columns.map((column) => (
              <col key={column.key} className={column.width || ""} />
            ))}
          </colgroup>
          <thead className="bg-slate-50">
            <tr>
              {onToggleRow && (
                <th className="h-11 pl-4 pr-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#173557]"
                    checked={allChecked}
                    onChange={onTogglePage}
                    aria-label="Select all records on this page"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`h-11 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${column.headerClassName || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowId = getRowId(row);
              return (
                <tr
                  key={rowId}
                  className={`border-t border-slate-100 transition-colors ${onRowClick ? "cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue-600" : ""} ${selectedId === rowId ? "bg-blue-50/60 shadow-[inset_2px_0_#1c4777]" : ""}`}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(event) => {
                    if (
                      onRowClick &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-selected={onRowClick ? selectedId === rowId : undefined}
                >
                  {onToggleRow && (
                    <td className="h-[68px] pl-4 pr-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer accent-[#173557]"
                        checked={checkedIds.includes(rowId)}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        onChange={() => onToggleRow(rowId)}
                        aria-label={`Select ${rowId}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`h-[68px] px-3 py-2.5 align-middle text-[13px] leading-5 text-slate-700 ${column.cellClassName || ""}`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onToggleRow ? 1 : 0)}
                  className="h-24 text-center text-[13px] text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {onPageChange && (
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} label={`${label} pages`} itemLabel={itemLabel} />
      )}
    </section>
  );
}
