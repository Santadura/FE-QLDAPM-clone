import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Classes from "./pages/Classes";
import AccountManagement from "./pages/AccountManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import PayrollPage from "./pages/PayrollPage";
import StatisticsPage from "./pages/StatisticsPage";

import AvailabilityRegister from "./pages/AvailabilityRegister";
import TeacherAssignment from "./pages/TeacherAssignment";
import StaffAssignment from "./pages/StaffAssignment";
import MySchedule from "./pages/MySchedule";
import ScheduleMonitor from "./features/scheduling/ScheduleMonitor";

import { AcademicDataProvider } from "./features/academic/AcademicDataContext";
import AccountDataProvider from "./features/accounts/AccountDataProvider";
import { useAccountData } from "./features/accounts/hooks/useAccountData";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ROLES } from "./config/roles";


/* =========================================================
   RESOLVE PAGE THEO META TRONG roles.js
========================================================= */

function resolveElement(item, roleKey) {
  switch (item.meta?.page) {
    /* =========================
       PAYROLL
    ========================= */

    case "payroll":
      return (
        <PayrollPage
          permission={item.meta.permission}
          scope={item.meta.scope}
          roleKey={roleKey}
          title={item.label}
        />
      );


    /* =========================
       STATISTICS
    ========================= */

    case "statistics":
      return <StatisticsPage />;


    /* =========================
       TC - PHÂN CÔNG TEACHER

       Dùng giao diện Figma cũ.
       TeacherAssignmentView bên trong
       sẽ gọi API.
    ========================= */

    case "teacher-assignment":
      return <TeacherAssignment />;


    /* =========================
       CM - PHÂN CÔNG SALE / CS

       staffRole:
       SALE
       CS
    ========================= */

    case "staff-assignment":
      return (
        <StaffAssignment
          key={item.meta.staffRole}
          staffRole={item.meta.staffRole}
        />
      );


    /* =========================
       TEACHER / SALE / CS
       XEM LỊCH CÁ NHÂN
    ========================= */

    case "my-schedule":
      return (
        <MySchedule
          key={item.meta.roleKey}
          roleKey={item.meta.roleKey}
        />
      );


    /* =========================
       CHƯA CÓ PAGE
    ========================= */

    default:
      return (
        <PlaceholderPage
          title={item.label}
        />
      );
  }
}


/* =========================================================
   APP ROUTES
========================================================= */

function AppRoutes() {
  const { authUser } = useAccountData();


  /* =======================================================
     ROLE HIỆN TẠI
  ======================================================= */

  const roleKey = authUser?.roleKey;

  const role =
    roleKey
      ? ROLES[roleKey]
      : null;


  /* =======================================================
     HOME URL THEO ROLE

     TEACHER -> /teacher
     TC      -> /tc
     CM      -> /cm
     SALE    -> /sale
     CS      -> /cs
     ADMIN   -> /admin
  ======================================================= */

  const home =
    roleKey && role
      ? `/${roleKey.toLowerCase()}`
      : "/login";


  /* =======================================================
     LẤY MENU ITEMS TỪ roles.js

     Loại bỏ path bị trùng.
  ======================================================= */

  const allItems = useMemo(() => {
    if (!role) {
      return [];
    }

    const seen = new Set();

    return role.sections.flatMap((section) =>
      section.items.filter((item) => {
        if (seen.has(item.path)) {
          return false;
        }

        seen.add(item.path);

        return true;
      }),
    );
  }, [role]);


  /* =======================================================
     ROUTES
  ======================================================= */

  return (
    <>
      {/* =================================================
          TOAST
      ================================================= */}

      <ToastContainer
        position="top-right"
        autoClose={2000}
      />


      {/* =================================================
          ROUTER
      ================================================= */}

      <Routes>

        {/* ===============================================
            LOGIN
        =============================================== */}

        <Route
          path="/login"
          element={
            authUser
              ? (
                <Navigate
                  to={home}
                  replace
                />
              )
              : (
                <LoginPage />
              )
          }
        />


        {/* ===============================================
            FORGOT PASSWORD
        =============================================== */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />


        {/* ===============================================
            ROOT
        =============================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to={home}
              replace
            />
          }
        />


        {/* ===============================================
            ROUTES SAU KHI LOGIN
        =============================================== */}

        {role && (
          <Route
            path={home}
            element={
              <ProtectedRoute
                allowedRoles={[roleKey]}
              >
                <AcademicDataProvider>
                  <Layout
                    role={role}
                  />
                </AcademicDataProvider>
              </ProtectedRoute>
            }
          >

            {/* ===========================================
                DASHBOARD
            =========================================== */}

            <Route
              index
              element={
                <Dashboard
                  role={role}
                />
              }
            />


            {/* ===========================================
                PROFILE
            =========================================== */}

            <Route
              path="profile"
              element={
                <ProfilePage />
              }
            />


            {/* ===========================================
                ROUTES TỪ roles.js
            =========================================== */}

            {allItems
              .filter(
                (item) =>
                  item.path !== "/",
              )
              .map((item) => {
                let element;


                /* =======================================
                   STUDENTS
                ======================================= */

                if (
                  item.path === "/students"
                ) {
                  element = (
                    <Students
                      role={role}
                    />
                  );
                }


                /* =======================================
                   CLASSES
                ======================================= */

                else if (
                  item.path.startsWith(
                    "/classes",
                  ) ||
                  item.path === "/my-classes"
                ) {
                  element = <Classes role={role} />;
                } else if (item.path === "/monitor/schedules") {
                  element = <ScheduleMonitor />;
                }

                else if (
                  item.path ===
                  "/availability/register"
                ) {
                  element = (
                    <AvailabilityRegister />
                  );
                }


                /* =======================================
                   ACCOUNT MANAGEMENT
                ======================================= */

                else if (["/employees", "/teachers", "/staff"].includes(item.path)) {
                  element = (
                    <ProtectedRoute allowedRoles={["ADMIN", "TC", "CM"]}>
                      <EmployeeManagement />
                    </ProtectedRoute>
                  );
                }
                else if (
                  item.path === "/accounts"
                ) {
                  element = (
                    <ProtectedRoute
                      allowedRoles={[
                        "ADMIN",
                      ]}
                    >
                      <AccountManagement />
                    </ProtectedRoute>
                  );
                }


                /* =======================================
                   PAGE THEO META

                   payroll
                   statistics
                   teacher-assignment
                   staff-assignment
                   my-schedule
                ======================================= */

                else {
                  element =
                    resolveElement(
                      item,
                      roleKey,
                    );
                }


                /* =======================================
                   ROUTE
                ======================================= */

                return (
                  <Route
                    key={item.path}
                    path={
                      item.path.slice(1)
                    }
                    element={element}
                  />
                );
              })}


            {/* ===========================================
                ROLE 404
            =========================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to={home}
                  replace
                />
              }
            />

          </Route>
        )}


        {/* ===============================================
            GLOBAL 404
        =============================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to={home}
              replace
            />
          }
        />

      </Routes>
    </>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <AccountDataProvider>
        <AppRoutes />
      </AccountDataProvider>
    </BrowserRouter>
  );
}
