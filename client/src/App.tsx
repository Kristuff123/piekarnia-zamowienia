import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import Shell from "./components/Shell";
import ShopDashboard from "./pages/ShopDashboard";
import OrderPage from "./pages/OrderPage";
import ArchivePage from "./pages/ArchivePage";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Protected({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <Protected>
              <Shell />
            </Protected>
          }
        >
          <Route index element={<ShopDashboard />} />
          <Route path="zamowienie" element={<OrderPage />} />
          <Route path="archiwum" element={<ArchivePage />} />
          <Route path="manager" element={<Protected roles={["manager", "admin"]}><ManagerDashboard /></Protected>} />
          <Route path="admin" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
