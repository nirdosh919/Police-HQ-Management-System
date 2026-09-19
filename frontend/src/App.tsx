import AdministratorProfile from "./pages/AdministratorProfile";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Officers from "./pages/Officers";
import Departments from "./pages/Departments";
import PoliceStations from "./pages/PoliceStations";
import Reports from "./pages/Reports";
import HRManagement from "./pages/HRManagement";
import TransfersPromotions from "./pages/TransfersPromotions";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/officers" element={<Officers />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/police-stations" element={<PoliceStations />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/hr" element={<HRManagement />} />
            <Route
              path="/transfers"
              element={<TransfersPromotions />}
            />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              path="/administrator-profile"
              element={<AdministratorProfile />}
            />

          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
