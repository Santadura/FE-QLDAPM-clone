import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccountData } from "../../features/accounts/hooks/useAccountData";

export default function Topbar({
  role,
  pageTitle,
  pageSubtitle,
}) {
  const navigate = useNavigate();
  const { authUser, logout, loggingOut } = useAccountData();

  const handleLogout = async () => {
    const result = await logout();
    if (!result.ok) { toast.error(result.reason); return; }
    if (!result.sessionChanged) navigate("/login", { replace: true });
  };

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
        <button className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-medium text-slate-600">
          GMT+7 · EN
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
          <Bell size={16} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/${role.key.toLowerCase()}/profile`)
            }
            className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: role.color }}
          >
            {authUser?.avatar ? (
              <img
                src={authUser.avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              authUser?.initials || role.shortLabel
            )}
          </button>

          <div className="mr-2 leading-tight">
            <div className="text-xs font-semibold text-slate-800">
              {authUser?.user || "User"}
            </div>

            <div className="text-[11px] text-slate-400">
              {role.label}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
            title={loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
