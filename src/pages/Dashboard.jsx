import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { MdPeople, MdVerified, MdWork, MdWarning } from "react-icons/md";
import "../styles/dashboard.css";

Chart.register(...registerables);

const LOGO = "https://www.huauchinango.tecnm.mx/wp-content/uploads/2020/08/cropped-Logo_ITSH-300x300.png";
const CHART_HEIGHT = 260;

/* ═══════════════════════════════════════════════
   FÁBRICA DE DEGRADADOS PARA BARRAS
   Cada barra recibe su propio degradado vertical
═══════════════════════════════════════════════ */
function barGrads(ctx, paletas, count) {
  return paletas.slice(0, count).map(([top, bot]) => {
    const g = ctx.createLinearGradient(0, 0, 0, 320);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    return g;
  });
}

/* Degradados horizontales para barras horizontales */
function hBarGrads(ctx, paletas, count, w = 400) {
  return paletas.slice(0, count).map(([left, right]) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, left);
    g.addColorStop(1, right);
    return g;
  });
}

/* Degradados radiales para pie/doughnut */
function pieGrads(ctx, paletas, count) {
  return paletas.slice(0, count).map(([a, b]) => {
    const g = ctx.createRadialGradient(160, 160, 0, 160, 160, 160);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    return g;
  });
}

/* ═══════════════════════════════════════════════
   PALETAS POR GRÁFICA  (color vivo → tono oscuro)
═══════════════════════════════════════════════ */
const PAL_CARRERA   = [["#818cf8","#4f46e5"],["#38bdf8","#0284c7"],["#fb923c","#ea580c"],["#34d399","#059669"],["#f472b6","#db2777"],["#a78bfa","#7c3aed"]];
const PAL_TITULADO  = [["#34d399","#059669"],["#fbbf24","#d97706"],["#f87171","#dc2626"]];
const PAL_ACTIVIDAD = [["#34d399","#059669"],["#38bdf8","#0284c7"],["#fbbf24","#d97706"],["#f87171","#dc2626"],["#a78bfa","#7c3aed"]];
const PAL_MEDIO     = [["#818cf8","#4f46e5"],["#34d399","#059669"],["#fb923c","#ea580c"],["#38bdf8","#0284c7"]];
const PAL_SECTOR    = [["#f472b6","#db2777"],["#34d399","#059669"],["#fbbf24","#d97706"],["#a78bfa","#7c3aed"]];
const PAL_NIVEL     = [["#38bdf8","#0284c7"],["#34d399","#059669"],["#fbbf24","#d97706"],["#fb923c","#ea580c"],["#f87171","#dc2626"],["#a78bfa","#7c3aed"],["#818cf8","#4f46e5"]];
const PAL_CONDICION = [["#34d399","#059669"],["#fbbf24","#d97706"],["#fb923c","#ea580c"],["#a78bfa","#7c3aed"]];
const PAL_ESTADO    = [["#818cf8","#4f46e5"],["#38bdf8","#0284c7"],["#fb923c","#ea580c"],["#34d399","#059669"],["#f472b6","#db2777"],["#fbbf24","#d97706"]];
const PAL_POSGRADO  = [["#a78bfa","#7c3aed"],["#818cf8","#4f46e5"],["#38bdf8","#0284c7"],["#94a3b8","#475569"]];
const PAL_PERFIL    = [["#34d399","#059669"],["#f87171","#dc2626"],["#fbbf24","#d97706"]];
const PAL_ANTIG     = [["#34d399","#059669"],["#38bdf8","#0284c7"],["#fbbf24","#d97706"],["#fb923c","#ea580c"],["#f87171","#dc2626"],["#a78bfa","#7c3aed"]];
const PAL_SEXO      = [["#818cf8","#4f46e5"],["#f472b6","#db2777"]];

const FONT = { family: "Poppins" };

/* ═══════════════════════════════════════════════
   OPCIONES BASE REUTILIZABLES
═══════════════════════════════════════════════ */
function baseBar(horizontal = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { ...FONT, size: 12, weight: "600" },
        bodyFont:  { ...FONT, size: 12 },
        padding: 10, cornerRadius: 10,
        callbacks: { label: ctx => ` ${ctx.raw} egresados` },
      },
    },
    scales: {
      [horizontal ? "x" : "y"]: {
        beginAtZero: true,
        grid: { color: "rgba(148,163,184,.15)", drawTicks: false },
        ticks: { font: { ...FONT, size: 11 }, color: "#64748b" },
      },
      [horizontal ? "y" : "x"]: {
        grid: { display: false },
        ticks: { font: { ...FONT, size: 11 }, color: "#64748b", maxRotation: 30 },
      },
    },
    animation: { duration: 800, easing: "easeOutQuart" },
  };
}

function baseRound(cutout = "0%") {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { ...FONT, size: 11 },
          color: "#475569", padding: 14,
          boxWidth: 12, usePointStyle: true, pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { ...FONT, size: 12, weight: "600" },
        bodyFont:  { ...FONT, size: 12 },
        padding: 10, cornerRadius: 10,
        callbacks: { label: ctx => ` ${ctx.raw} egresados (${Math.round(ctx.parsed / ctx.dataset.data.reduce((a,b)=>a+b,0)*100)}%)` },
      },
    },
    animation: { duration: 800, easing: "easeOutQuart" },
  };
}

/* ═══════════════════════════════════════════════
   TARJETA GRÁFICA REUTILIZABLE
═══════════════════════════════════════════════ */
function ChartCard({ title, icon, children, style = {} }) {
  return (
    <div className="chart-card" style={style}>
      <div className="chart-card-header">
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span className="chart-card-titulo">{title}</span>
      </div>
      <div className="chart-card-body">
        <div style={{ position: "relative", width: "100%", height: CHART_HEIGHT }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [cargando, setCargando] = useState(true);
  const [logoErr, setLogoErr]   = useState(false);

  /* — refs canvas — */
  const rCarrera    = useRef(null); const iCarrera    = useRef(null);
  const rTitulado   = useRef(null); const iTitulado   = useRef(null);
  const rActividad  = useRef(null); const iActividad  = useRef(null);
  const rMedio      = useRef(null); const iMedio      = useRef(null);
  const rSector     = useRef(null); const iSector     = useRef(null);
  const rNivel      = useRef(null); const iNivel      = useRef(null);
  const rCondicion  = useRef(null); const iCondicion  = useRef(null);
  const rEstado     = useRef(null); const iEstado     = useRef(null);
  const rPosgrado   = useRef(null); const iPosgrado   = useRef(null);
  const rPerfil     = useRef(null); const iPerfil     = useRef(null);
  const rAntiguedad = useRef(null); const iAntiguedad = useRef(null);
  const rSexo       = useRef(null); const iSexo       = useRef(null);

  useEffect(() => {
     fetch("https://api-egresado.onrender.com/api/egresados")
    .then(r => r.json())
      .then(d => { setData(d); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const contar = campo => data.reduce((acc, e) => {
      const v = e[campo]?.trim() || "Sin datos";
      acc[v] = (acc[v] || 0) + 1; return acc;
    }, {});

    /* — destruir instancias previas — */
    [iCarrera,iTitulado,iActividad,iMedio,iSector,iNivel,
     iCondicion,iEstado,iPosgrado,iPerfil,iAntiguedad,iSexo]
      .forEach(r => r.current?.destroy());

    /* ── helpers ── */
    const mkBar = (ref, labels, values, pal, horizontal = false) => {
      const ctx = ref.current.getContext("2d");
      const grads = horizontal
        ? hBarGrads(ctx, pal, values.length, ref.current.parentElement?.offsetWidth || 400)
        : barGrads(ctx, pal, values.length);
      return new Chart(ctx, {
        type: "bar",
        data: { labels, datasets: [{ data: values, backgroundColor: grads, borderRadius: 8, borderSkipped: false }] },
        options: { ...baseBar(horizontal), ...(horizontal ? { indexAxis: "y" } : {}) },
      });
    };

    const mkRound = (ref, labels, values, pal, type = "doughnut") => {
      const ctx = ref.current.getContext("2d");
      const grads = pieGrads(ctx, pal, values.length);
      return new Chart(ctx, {
        type,
        data: { labels, datasets: [{ data: values, backgroundColor: grads, borderWidth: 0, hoverOffset: 10 }] },
        options: baseRound(type === "doughnut" ? "60%" : "0%"),
      });
    };

    /* ── 1. Carrera (barras verticales) ── */
    const c1 = contar("carrera");
    iCarrera.current = mkBar(rCarrera, Object.keys(c1), Object.values(c1), PAL_CARRERA);

    /* ── 2. Titulación (doughnut) ── */
    const c2 = contar("titulado");
    iTitulado.current = mkRound(rTitulado, Object.keys(c2), Object.values(c2), PAL_TITULADO, "doughnut");

    /* ── 3. Actividad actual (pie) — con etiquetas mejoradas ── */
    const mapaActiv = {
      "Trabaja": "Trabajando", "Estudia y trabaja": "Trabaja y estudia",
      "No trabaja": "Desempleado", "No estudia ni trabaja": "Sin actividad",
    };
    const c3raw = contar("actividad_actual");
    const c3 = Object.entries(c3raw).reduce((acc, [k, v]) => {
      const label = mapaActiv[k] || k; acc[label] = (acc[label] || 0) + v; return acc;
    }, {});
    iActividad.current = mkRound(rActividad, Object.keys(c3), Object.values(c3), PAL_ACTIVIDAD, "pie");

    /* ── 4. Medio de obtención (doughnut) ── */
    const c4 = contar("medio_obtencion");
    iMedio.current = mkRound(rMedio, Object.keys(c4), Object.values(c4), PAL_MEDIO, "doughnut");

    /* ── 5. Sector (pie) ── */
    const c5 = contar("sector");
    iSector.current = mkRound(rSector, Object.keys(c5), Object.values(c5), PAL_SECTOR, "pie");

    /* ── 6. Nivel jerárquico (barras horizontales) ── */
    const c6 = contar("nivel_jerarquico");
    iNivel.current = mkBar(rNivel, Object.keys(c6), Object.values(c6), PAL_NIVEL, true);

    /* ── 7. Condición de trabajo (doughnut) ── */
    const c7 = contar("condicion_trabajo");
    iCondicion.current = mkRound(rCondicion, Object.keys(c7), Object.values(c7), PAL_CONDICION, "doughnut");

    /* ── 8. Estado donde trabajan (barras horizontales) ── */
    const c8 = contar("estado_empresa");
    iEstado.current = mkBar(rEstado, Object.keys(c8), Object.values(c8), PAL_ESTADO, true);

    /* ── 9. Posgrado (pie) ── */
    const c9 = contar("posgrado");
    iPosgrado.current = mkRound(rPosgrado, Object.keys(c9), Object.values(c9), PAL_POSGRADO, "pie");

    /* ── 10. Perfil acorde a carrera (doughnut) ── */
    const c10 = contar("perfil");
    iPerfil.current = mkRound(rPerfil, Object.keys(c10), Object.values(c10), PAL_PERFIL, "doughnut");

    /* ── 11. Antigüedad laboral (barras verticales) ── */
    const ordenAntig = ["Menos de 1 año","1 año","2 años","3 años","Más de 3 años","Operativo"];
    const c11raw = contar("antiguedad");
    const c11labels = [...new Set([...ordenAntig, ...Object.keys(c11raw)])].filter(k => c11raw[k]);
    iAntiguedad.current = mkBar(rAntiguedad, c11labels, c11labels.map(k => c11raw[k] || 0), PAL_ANTIG);

    /* ── 12. Distribución por sexo (doughnut) ── */
    const c12 = contar("sexo");
    iSexo.current = mkRound(rSexo, Object.keys(c12), Object.values(c12), PAL_SEXO, "doughnut");

  }, [data]);

  /* — stats resumen — */
  const total      = data.length;
  const titulados  = data.filter(e => e.titulado === "Si").length;
  const trabajando = data.filter(e => ["Trabaja","Estudia y trabaja"].includes(e.actividad_actual)).length;
  const sinActiv   = data.filter(e => ["No estudia ni trabaja","No trabaja"].includes(e.actividad_actual)).length;

  const stats = [
    { label:"Total Egresados", value:total,      color:"#4f46e5", bg:"#ede9fe", icon:<MdPeople size={24}/> },
    { label:"Titulados",        value:titulados,  color:"#059669", bg:"#d1fae5", icon:<MdVerified size={24}/> },
    { label:"Laborando",        value:trabajando, color:"#ea580c", bg:"#ffedd5", icon:<MdWork size={24}/> },
    { label:"Sin Actividad",    value:sinActiv,   color:"#dc2626", bg:"#fee2e2", icon:<MdWarning size={24}/> },
  ];

  return (
    <>
      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>

          {/* Logo: círculo blanco, sin fondo azul, con anillo naranja */}
          <div style={{
            width: 58, height: 58,
            borderRadius: "50%",
            background: "white",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 0 3px #f97316, 0 4px 20px rgba(249,115,22,.25)",
          }}>
            {logoErr
              ? <span style={{ color:"#0a1f44", fontWeight:800, fontSize:13 }}>ITSH</span>
              : <img src={LOGO} alt="ITSH" onError={() => setLogoErr(true)}
                     style={{ width:"90%", height:"90%", objectFit:"contain" }} />}
          </div>

          <div>
            <div className="page-title">Panel de Control</div>
            <div className="page-sub">Sistema de Seguimiento de Egresados — ITSH · TecNM</div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        {stats.map(({ label, value, color, bg, icon }) => (
          <div className="stat-card" key={label}
            style={{ borderTop: `3px solid ${color}` }}>
            <div className="stat-icon" style={{ background: bg, color }}>{icon}</div>
            <div>
              <div className="stat-info-label">{label}</div>
              <div className="stat-info-value" style={{ color }}>{cargando ? "—" : value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Acciones rápidas ── */}
      <div className="quick-grid">
        {[
          { icon:"👥", titulo:"Ver Egresados",      desc:"Busca, edita o elimina registros", ruta:"/egresados" },
          { icon:"➕", titulo:"Registrar Egresado", desc:"Nuevo registro completo",           ruta:"/agregar"   },
        ].map(({ icon, titulo, desc, ruta }) => (
          <div className="quick-card" key={ruta} onClick={() => navigate(ruta)}>
            <div className="quick-icon">{icon}</div>
            <div>
              <div className="quick-titulo">{titulo}</div>
              <div className="quick-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráficas ── */}
      {cargando ? (
        <div className="spinner-centro">
          <div className="spinner-border text-primary" />
          <span>Cargando estadísticas...</span>
        </div>
      ) : !data.length ? (
        <div style={{ textAlign:"center", padding:"50px 0", color:"#64748b" }}>
          No hay datos. Agrega egresados para ver estadísticas.
        </div>
      ) : (
        <>
          {/* FILA 1 — Carrera (amplia), Titulación, Actividad */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:20, marginBottom:20 }}>
            <ChartCard title="Egresados por Carrera"  icon="🎓"><canvas ref={rCarrera}   /></ChartCard>
            <ChartCard title="Estado de Titulación"   icon="📜"><canvas ref={rTitulado}  /></ChartCard>
            <ChartCard title="Actividad Actual"        icon="💼"><canvas ref={rActividad} /></ChartCard>
          </div>

          {/* FILA 2 — ¿Cómo obtuvieron empleo?, Sector, Nivel jerárquico */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20, marginBottom:20 }}>
            <ChartCard title="¿Cómo obtuvieron su Empleo?" icon="🔎"><canvas ref={rMedio}    /></ChartCard>
            <ChartCard title="Sector Laboral"               icon="🏭"><canvas ref={rSector}   /></ChartCard>
            <ChartCard title="Nivel Jerárquico"             icon="📊"><canvas ref={rNivel}    /></ChartCard>
          </div>

          {/* FILA 3 — Condición trabajo, Estado empresa (amplia), Posgrado */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:20, marginBottom:20 }}>
            <ChartCard title="Condición de Trabajo"        icon="📋"><canvas ref={rCondicion} /></ChartCard>
            <ChartCard title="Estado donde Trabajan"       icon="📍"><canvas ref={rEstado}    /></ChartCard>
            <ChartCard title="Posgrado"                    icon="🏆"><canvas ref={rPosgrado}  /></ChartCard>
          </div>

          {/* FILA 4 — Perfil, Antigüedad (amplia), Sexo */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:20, marginBottom:20 }}>
            <ChartCard title="Trabajo acorde al Perfil" icon="✅"><canvas ref={rPerfil}    /></ChartCard>
            <ChartCard title="Antigüedad Laboral"        icon="⏱️"><canvas ref={rAntiguedad}/></ChartCard>
            <ChartCard title="Distribución por Sexo"    icon="👥"><canvas ref={rSexo}      /></ChartCard>
          </div>
        </>
      )}
    </>
  );
}