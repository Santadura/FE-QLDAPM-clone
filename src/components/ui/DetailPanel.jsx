import { X } from "lucide-react";

export default function DetailPanel({
  title,
  tabs = [],
  activeTab,
  onTabChange,
  onClose,
  footer,
  children,
}) {
  return (
    <aside
      className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100dvh-2rem)]"
      aria-label={title}
    >
      <div className="flex min-h-12 items-center justify-between border-b border-slate-200 px-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {onClose && (
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {tabs.length > 0 && (
        <div
          className="scrollbar-hidden flex min-w-0 shrink-0 flex-nowrap items-center gap-x-4 overflow-x-auto border-b border-slate-200 px-4 py-1"
          role="tablist"
          aria-label={`${title} sections`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              tabIndex={activeTab === tab.key ? 0 : -1}
              className={`min-h-9 shrink-0 border-b-2 text-xs font-medium ${activeTab === tab.key ? "border-[#173557] text-[#173557]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              onClick={() => onTabChange(tab.key)}
              onKeyDown={(event) => {
                const index = tabs.findIndex((item) => item.key === tab.key);
                const nextIndex = event.key === 'ArrowRight' ? (index + 1) % tabs.length
                  : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
                    : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
                if (nextIndex !== null) {
                  event.preventDefault();
                  onTabChange(tabs[nextIndex].key);
                  event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>

      {footer && (
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/70 p-3">
          {footer}
        </div>
      )}
    </aside>
  );
}
