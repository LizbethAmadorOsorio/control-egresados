import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard, MdPeople, MdPersonAdd, MdLogout, MdMenu, MdClose
} from "react-icons/md";
import "../styles/navbar.css";

const LOGO = "https://www.huauchinango.tecnm.mx/wp-content/uploads/2020/08/cropped-Logo_ITSH-300x300.png";

function Logo({ size = 44, radius = 12 }) {
  const [err, setErr] = useState(false);
  const style = {
    width: size, height: size, borderRadius: radius,
    background: "white", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,.2)", flexShrink: 0,
  };
  return (
    <div style={style}>
      {err
        ? <span className="sidebar-logo-fb">ITSH</span>
        : <img src={LOGO} alt="ITSH" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }}
               onError={() => setErr(true)} />}
    </div>
  );
}

const links = [
  { to: "/dashboard", label: "Inicio",       icon: <MdDashboard /> },
  { to: "/egresados", label: "Egresados",        icon: <MdPeople />    },
  { to: "/agregar",   label: "Agregar Egresado", icon: <MdPersonAdd /> },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  if (location.pathname === "/") return null;

  const logout = () => { sessionStorage.removeItem("sesion"); navigate("/"); };

  return (
    <>
      {/* ── SIDEBAR ESCRITORIO ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Logo />
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">Control de Egresados</div>
            <div className="sidebar-brand-sub">ITSH · TecNM</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-seccion">Menú principal</div>
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-btn-logout" onClick={logout}>
            <MdLogout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── TOPBAR MÓVIL ── */}
      <header className="topbar">
        <Logo size={36} radius={9} />
        <span className="topbar-title">Control de Egresados</span>
        <button className="topbar-menu-btn" onClick={() => setOpen(v => !v)}>
          {open ? <MdClose /> : <MdMenu />}
        </button>
      </header>

      {/* Menú desplegable móvil */}
      <div className={"mobile-nav" + (open ? " open" : "")}>
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            onClick={() => setOpen(false)}>
            {icon} {label}
          </NavLink>
        ))}
        <button className="sidebar-btn-logout" onClick={logout}>
          <MdLogout /> Cerrar sesión
        </button>
      </div>
    </>
  );
}