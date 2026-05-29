import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdSearch, MdEdit, MdDelete, MdPersonAdd, MdFilterList,
  MdRefresh, MdClose, MdVisibility, MdWork, MdSchool,
  MdVerified, MdPending, MdCancel, MdPhone, MdBusiness
} from "react-icons/md";
import "../styles/egresados.css";

/* ══════════════════════════════
   AVATAR con iniciales + degradado
══════════════════════════════ */
const PALETAS = [
  ["#6366f1", "#818cf8"], ["#0ea5e9", "#38bdf8"], ["#f97316", "#fb923c"],
  ["#10b981", "#34d399"], ["#f43f5e", "#fb7185"], ["#8b5cf6", "#a78bfa"],
  ["#0891b2", "#22d3ee"], ["#d97706", "#fbbf24"],
];
function Avatar({ nombre, idx }) {
  const [a, b] = PALETAS[idx % PALETAS.length];
  const iniciales = nombre
    ? nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase()
    : "?";
  return (
    <div className="egr-avatar" style={{ background: `linear-gradient(135deg,${a},${b})` }}>
      {iniciales}
    </div>
  );
}

/* ══════════════════════════════
   BADGES
══════════════════════════════ */
function BadgeActividad({ value }) {
  const M = {
    "Trabaja": { cls: "ba-verde", icon: <MdWork size={11} />, txt: "Trabaja" },
    "Estudia y trabaja": { cls: "ba-azul", icon: <MdSchool size={11} />, txt: "Trabaja y estudia" },
    "No estudia ni trabaja": { cls: "ba-gris", icon: <MdCancel size={11} />, txt: "Sin actividad" },
    "No trabaja": { cls: "ba-naranja", icon: <MdPending size={11} />, txt: "Sin empleo" },
  };
  const { cls, icon, txt } = M[value] ?? { cls: "ba-gris", icon: null, txt: value ?? "—" };
  return <span className={`egr-badge ${cls}`}>{icon}{txt}</span>;
}

function BadgeTitulado({ value }) {
  const M = {
    "Si": { cls: "ba-verde", icon: <MdVerified size={11} />, txt: "Titulado" },
    "En proceso": { cls: "ba-amarillo", icon: <MdPending size={11} />, txt: "En proceso" },
    "No": { cls: "ba-rojo", icon: <MdCancel size={11} />, txt: "No titulado" },
  };
  const { cls, icon, txt } = M[value] ?? { cls: "ba-gris", icon: null, txt: value ?? "—" };
  return <span className={`egr-badge ${cls}`}>{icon}{txt}</span>;
}

/* ══════════════════════════════
   MODAL DETALLE
══════════════════════════════ */
function ModalDetalle({ eg, idx, onClose, onEdit }) {
  if (!eg) return null;
  const campo = (label, val, icon) =>
    val && val !== "Seleccionar"
      ? <div className="md-campo" key={label}>
        <span className="md-label">{icon && <span className="md-ico">{icon}</span>}{label}</span>
        <span className="md-val">{val}</span>
      </div>
      : null;

  return (
    <div className="md-overlay" onClick={onClose}>
      <div className="md-box" onClick={e => e.stopPropagation()}>

        {/* Encabezado */}
        <div className="md-head">
          <Avatar nombre={eg.nombre_completo} idx={idx} />
          <div className="md-head-info">
            <div className="md-nombre">{eg.nombre_completo}</div>
            <div className="md-carrera">{eg.carrera}</div>
            <div className="md-badges">
              <BadgeActividad value={eg.actividad_actual} />
              <BadgeTitulado value={eg.titulado} />
            </div>
          </div>
          <button className="md-close" onClick={onClose}><MdClose size={20} /></button>
        </div>

        {/* Cuerpo */}
        <div className="md-body">
          <div className="md-seccion">Información General</div>
          <div className="md-grid">
            {campo("N. Control", eg.no_control, "🆔")}
            {campo("Generación", eg.generacion, "📅")}
            {campo("Sexo", eg.sexo, "👤")}
            {campo("Estado civil", eg.estado_civil, "💍")}
            {campo("Teléfono", eg.telefono, "📱")}
            {campo("Correo", eg.correo_personal, "✉️")}
            {campo("Municipio", eg.municipio, "📍")}
            {campo("Estado", eg.estado, "🗺️")}
          </div>

          <div className="md-seccion">Información Académica</div>
          <div className="md-grid">
            {campo("Titulado", eg.titulado, "🎓")}
            {campo("Posgrado", eg.posgrado, "🏆")}
            {campo("Mes egreso", eg.mes_egreso, "📆")}
            {campo("Año egreso", eg.año_egreso, "📆")}
          </div>

          {(eg.actividad_actual === "Trabaja" || eg.actividad_actual === "Estudia y trabaja") && (
            <>
              <div className="md-seccion">Información Laboral</div>
              <div className="md-grid">
                {campo("Empresa", eg.nombre_empresa, "🏢")}
                {campo("Puesto", eg.puesto, "💼")}
                {campo("Antigüedad", eg.antiguedad, "⏱️")}
                {campo("Salario", eg.salario, "💰")}
                {campo("Sector", eg.sector, "🏭")}
                {campo("Nivel", eg.nivel_jerarquico, "📊")}
                {campo("Perfil", eg.perfil, "✅")}
                {campo("Condición", eg.condicion_trabajo, "📋")}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="md-foot">
          <button className="md-btn-edit" onClick={() => onEdit(eg.no_control)}>
            <MdEdit size={15} /> Editar registro
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════ */
export default function Egresados() {
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrera, setCarrera] = useState("");
  const [actividad, setActividad] = useState("");
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [detalleIdx, setDetalleIdx] = useState(0);
  const [confirmDel, setConfirmDel] = useState(null); // { id, nombre }

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setCargando(true);
      const r = await fetch("http://localhost:3000/api/egresados");
      setLista(await r.json());
    } catch { alert("No se pudo conectar con el servidor."); }
    finally { setCargando(false); }
  };

  const confirmarEliminar = async () => {
    if (!confirmDel) return;
    await fetch(`http://localhost:3000/api/egresados/${confirmDel.id}`, { method: "DELETE" });
    setLista(p => p.filter(e => e.no_control !== confirmDel.id));
    setConfirmDel(null);
  };

  const carreras = [...new Set(lista.map(e => e.carrera).filter(Boolean))];
  const actividades = [...new Set(lista.map(e => e.actividad_actual).filter(Boolean))];

  const filtrados = lista.filter(e => {
    const nb = e.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase())
      || e.no_control?.toLowerCase().includes(busqueda.toLowerCase());
    const cr = !carrera || e.carrera === carrera;
    const ac = !actividad || e.actividad_actual === actividad;
    return nb && cr && ac;
  });

  const limpiar = () => { setBusqueda(""); setCarrera(""); setActividad(""); };
  const hayFiltros = busqueda || carrera || actividad;

  return (
    <>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Egresados</div>
          <div className="page-sub">
            {lista.length} registros · {filtrados.length} mostrados
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="egr-btn-refresh" onClick={cargar} title="Actualizar">
            <MdRefresh size={17} />
          </button>
          <button className="btn-naranja" onClick={() => navigate("/agregar")}>
            <MdPersonAdd size={18} /> Agregar Egresado
          </button>
        </div>
      </div>

      {/* ── BARRA DE FILTROS ── */}
      <div className="egr-filtros">
        {/* Buscador */}
        <div className="egr-search-wrap">
          <MdSearch className="egr-search-icon" size={17} />
          <input
            className="egr-search"
            placeholder="Buscar por nombre o N. control..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="egr-search-clear" onClick={() => setBusqueda("")}>
              <MdClose size={15} />
            </button>
          )}
        </div>

        {/* Filtro carrera */}
        <div className="egr-filtro-wrap">
          <MdSchool className="egr-filtro-icon" size={15} />
          <select className="egr-select" value={carrera} onChange={e => setCarrera(e.target.value)}>
            <option value="">Todas las carreras</option>
            {carreras.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Filtro actividad */}
        <div className="egr-filtro-wrap">
          <MdWork className="egr-filtro-icon" size={15} />
          <select className="egr-select" value={actividad} onChange={e => setActividad(e.target.value)}>
            <option value="">Toda actividad</option>
            {actividades.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {hayFiltros && (
          <button className="egr-btn-limpiar" onClick={limpiar}>
            <MdFilterList size={15} /> Limpiar
          </button>
        )}
      </div>

      {/* ── TABLA ── */}
      {cargando ? (
        <div className="spinner-centro">
          <div className="spinner-border" style={{ color: "#6366f1" }} />
          <span>Cargando egresados...</span>
        </div>
      ) : (
        <div className="egr-tabla-shell">

          {/* Info bar */}
          <div className="egr-tabla-info">
            <span>
              Mostrando <strong>{filtrados.length}</strong> de <strong>{lista.length}</strong> egresados
            </span>
            {hayFiltros && (
              <span className="egr-filtro-activo">
                <MdFilterList size={13} /> Filtros activos
              </span>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <div className="table-responsive">
              <table className="egr-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>#</th>
                    <th>Egresado</th>
                    <th>N. Control</th>
                    <th>Carrera</th>
                    <th>Generación</th>
                    <th>Titulación</th>
                    <th>Actividad</th>
                    <th style={{ textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length > 0 ? filtrados.map((e, i) => (
                    <tr key={e.no_control} className="egr-row">

                      {/* Número */}
                      <td className="egr-td-num">{i + 1}</td>

                      {/* Egresado — avatar + nombre + teléfono */}
                      <td className="egr-td-egresado">
                        <div className="egr-persona">
                          <Avatar nombre={e.nombre_completo} idx={i} />
                          <div>
                            <div className="egr-nombre">{e.nombre_completo}</div>
                            {e.telefono && (
                              <div className="egr-tel">
                                <MdPhone size={11} /> {e.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* N. Control */}
                      <td>
                        <span className="egr-nc">{e.no_control}</span>
                      </td>

                      {/* Carrera */}
                      <td className="egr-td-carrera">
                        <div className="egr-carrera-txt">{e.carrera}</div>
                      </td>

                      {/* Generación */}
                      <td className="egr-td-gen">
                        <span className="egr-gen">{e.generacion ?? "—"}</span>
                      </td>

                      {/* Titulado */}
                      <td><BadgeTitulado value={e.titulado} /></td>

                      {/* Actividad */}
                      <td><BadgeActividad value={e.actividad_actual} /></td>

                      {/* Acciones */}
                      <td className="egr-td-acciones">
                        <button
                          className="egr-btn-ver"
                          title="Ver detalle"
                          onClick={() => { setDetalle(e); setDetalleIdx(i); }}
                        >
                          <MdVisibility size={15} />
                        </button>
                        <button
                          className="egr-btn-edit"
                          title="Editar"
                          onClick={() => navigate(`/editar/${e.no_control}`)}
                        >
                          <MdEdit size={15} />
                        </button>
                        <button
                          className="egr-btn-del"
                          title="Eliminar"
                          onClick={() => setConfirmDel({ id: e.no_control, nombre: e.nombre_completo })}
                        >
                          <MdDelete size={15} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="egr-vacio">
                          <div className="egr-vacio-ico">🔍</div>
                          <div className="egr-vacio-tit">Sin resultados</div>
                          <div className="egr-vacio-sub">Intenta con otros filtros o términos de búsqueda</div>
                          {hayFiltros && (
                            <button className="egr-btn-limpiar mt-2" onClick={limpiar}>
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE ── */}
      <ModalDetalle
        eg={detalle}
        idx={detalleIdx}
        onClose={() => setDetalle(null)}
        onEdit={id => { setDetalle(null); navigate(`/editar/${id}`); }}
      />

      {/* ── MODAL CONFIRMAR ELIMINACIÓN ── */}
      {confirmDel && (
        <div className="md-overlay" onClick={() => setConfirmDel(null)}>
          <div className="egr-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="egr-confirm-ico">🗑️</div>
            <div className="egr-confirm-tit">¿Eliminar egresado?</div>
            <div className="egr-confirm-sub">
              Se eliminará permanentemente el registro de<br />
              <strong>{confirmDel.nombre}</strong>.<br />
              Esta acción no se puede deshacer.
            </div>
            <div className="egr-confirm-btns">
              <button className="egr-confirm-cancel" onClick={() => setConfirmDel(null)}>
                Cancelar
              </button>
              <button className="egr-confirm-ok" onClick={confirmarEliminar}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}