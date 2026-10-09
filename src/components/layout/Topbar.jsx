import { Bell, LogOut } from "lucide-react";

export default function Topbar({
  role,
  session,
  onLogout,
  pageTitle,
  pageSubtitle,
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-[15px] font-semibold leading-tight text-slate-900">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-xs leading-tight text-slate-400">
            {pageSubtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          {role.label}
        </div>

        <button className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600">
          GMT+7 · EN
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
          <Bell size={16} />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: role.color }}
          >
            {role.shortLabel}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-slate-800">
              {session?.username}
            </div>
            <div className="text-[11px] text-slate-400">{role.label}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
