import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function findPageMeta(role, pathname) {
  const items = role.sections.flatMap((section) => section.items);

  const exact = items.find((item) => item.path === pathname);
  if (exact) return exact;

  const nested = items
    .filter(
      (item) =>
        item.path !== "/" && pathname.startsWith(`${item.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];

  return nested ?? { label: "Dashboard" };
}

export default function Layout({ role, session, onLogout }) {
  const { pathname } = useLocation();
  const page = findPageMeta(role, pathname);

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          session={session}
          onLogout={onLogout}
          pageTitle={page.label}
          pageSubtitle={
            page.label === "Dashboard"
              ? "Authenticated staff workspace"
              : undefined
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
