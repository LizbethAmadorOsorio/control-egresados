import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import Egresados      from "./pages/Egresados";
import AgregarEgresado from "./pages/AgregarEgresado";
import EditarEgresado from "./pages/EditarEgresado";
import Sidebar        from "./components/Navbar";

function RutaProtegida({ children }) {
  return sessionStorage.getItem("sesion")
    ? children
    : <Navigate to="/" replace />;
}

function Shell({ children }) {
  const { pathname } = useLocation();
  const esLogin = pathname === "/";
  if (esLogin) return <>{children}</>;
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="page-wrap">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/"           element={<Login />} />
          <Route path="/dashboard"  element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/egresados"  element={<RutaProtegida><Egresados /></RutaProtegida>} />
          <Route path="/agregar"    element={<RutaProtegida><AgregarEgresado /></RutaProtegida>} />
          <Route path="/editar/:id" element={<RutaProtegida><EditarEgresado /></RutaProtegida>} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
