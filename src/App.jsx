import { useMemo } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import AvailabilityRegister from "./pages/AvailabilityRegister";
import PlaceholderPage from "./pages/PlaceholderPage";
import PayrollPage from "./pages/PayrollPage";
import StatisticsPage from "./pages/StatisticsPage";
import Login from "./pages/Login";

import { AcademicDataProvider } from "./features/academic/AcademicDataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ROLES } from "./config/roles";

function resolveElement(item, roleKey) {
  if (item.meta?.page === "payroll") {
    return (
      <PayrollPage
        permission={item.meta.permission}
        scope={item.meta.scope}
        roleKey={roleKey}
        title={item.label}
      />
    );
  }

  if (item.meta?.page === "statistics") {
    return <StatisticsPage />;
  }

  return <PlaceholderPage title={item.label} />;
}

function AuthenticatedRoutes() {
  const { session, isAuthenticated, logout } = useAuth();

  const roleKey = session?.role;
  const role = roleKey ? ROLES[roleKey] : null;

  const allItems = useMemo(() => {
    if (!role) return [];

    const items = [];
    const seen = new Set();

    role.sections.forEach((section) =>
      section.items.forEach((item) => {
        if (!seen.has(item.path)) {
          seen.add(item.path);
          items.push(item);
        }
      }),
    );

    return items;
  }, [role]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!role) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <div className="p-8 text-sm text-red-700">
              This account has an unsupported role: {roleKey || "unknown"}.
              Sign out and use a configured staff account.
              <button
                type="button"
                className="ml-3 underline"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          }
        />
      </Routes>
    );
  }

  return (
    <AcademicDataProvider>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={<Layout role={role} session={session} onLogout={logout} />}
        >
          {allItems.map((item) =>
            item.path === "/" ? (
              <Route
                key={item.path}
                index
                element={<Dashboard role={role} />}
              />
            ) : item.path === "/students" ? (
              <Route
                key={item.path}
                path="students"
                element={<Students role={role} />}
              />
            ) : item.path.startsWith("/classes") ||
              item.path === "/my-classes" ? (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={<Classes role={role} />}
              />
            ) : item.path === "/availability/register" ? (
              <Route
                key={item.path}
                path="availability/register"
                element={<AvailabilityRegister />}
              />
            ) : (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={resolveElement(item, roleKey)}
              />
            ),
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AcademicDataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthenticatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
