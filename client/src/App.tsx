import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { LanguageProvider } from "./lib/i18n";
import Shell from "./components/Shell";
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ShopDashboard = lazy(() => import("./pages/ShopDashboard"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const ManagerDashboard = lazy(() => import("./pages/ManagerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function Protected({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <Suspense fallback={<div style={{ padding: 32 }} className="muted">Ładowanie…</div>}>
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
      </Suspense>
    </AuthProvider>
    </LanguageProvider>
  );
}
