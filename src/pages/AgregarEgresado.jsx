import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdArrowForward, MdSave } from "react-icons/md";
import "../styles/formulario.css";

/* ─────────────────────────────────────────────────────────────────────
   IMPORTANTE: Input y Select definidos FUERA del componente principal.
   Si están adentro React los destruye en cada render y se pierde el foco.
───────────────────────────────────────────────────────────────────── */
function Input({ label, name, type = "text", req = true, form, errores, onChange, ...rest }) {
  return (
    <div className="campo">
      <label>
        {label}
        {req && <span className="req">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        className={errores[name] ? "err" : ""}
        autoComplete="off"
        {...rest}
      />
      {errores[name] && <div className="campo-error">Este campo es obligatorio</div>}
    </div>
  );
}

function Select({ label, name, opts, req = true, form, errores, onChange }) {
  return (
    <div className="campo">
      <label>
        {label}
        {req && <span className="req">*</span>}
      </label>
      <select
        name={name}
        value={form[name]}
        onChange={onChange}
        className={errores[name] ? "err" : ""}
      >
        <option value="Seleccionar">-- Seleccionar --</option>
        {opts.map((o) =>
          typeof o === "object" ? (
            <option key={o.value} value={o.value}>{o.label}</option>
          ) : (
            <option key={o} value={o}>{o}</option>
          )
        )}
      </select>
      {errores[name] && <div className="campo-error">Selecciona una opción</div>}
    </div>
  );
}

/* ─── Catálogo de meses (valor numérico, etiqueta legible) ─────────── */
const MESES = [
  { value: "1",  label: "Enero" },   { value: "2",  label: "Febrero" },
  { value: "3",  label: "Marzo" },   { value: "4",  label: "Abril" },
  { value: "5",  label: "Mayo" },    { value: "6",  label: "Junio" },
  { value: "7",  label: "Julio" },   { value: "8",  label: "Agosto" },
  { value: "9",  label: "Septiembre" }, { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
];

const INIT = {
  nombre_completo: "", fecha_nacimiento: "", curp: "",
  estado_civil: "Seleccionar", sexo: "Seleccionar",
  colonia: "", codigo_postal: "", ciudad: "", estado: "", municipio: "",
  telefono_casa: "", telefono: "", telefono_fam1: "", telefono_fam2: "",
  correo_personal: "",
  no_control: "", carrera: "Seleccionar", generacion: "",
  mes_egreso: "Seleccionar",   // se enviará como número (1-12)
  anio_egreso: "",              // campo correcto que espera la BD
  titulado: "Seleccionar", fecha_titulacion: "", posgrado: "Seleccionar",
  actividad_actual: "Seleccionar",
  nombre_empresa: "", direccion_empresa: "", estado_empresa: "",
  municipio_empresa: "", cp_empresa: "", nombre_jefe: "",
  tel_empresa: "", correo_empresa: "", puesto_jefe: "",
  puesto: "", antiguedad: "Seleccionar", condicion_trabajo: "Seleccionar",
  sector: "Seleccionar", institucion: "Seleccionar", perfil: "Seleccionar",
  nivel_jerarquico: "Seleccionar", medio_obtencion: "Seleccionar", salario: "",
  alumnos_actualizados: "Seleccionar",
};

const PASOS = ["Personal y\nDomicilio", "Contacto y\nAcadémico", "Situación\nActual", "Datos\nLaborales"];
const OPCIONALES = new Set(["cp_empresa", "fecha_titulacion", "codigo_postal", "puesto_jefe"]);

export default function AgregarEgresado() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INIT);
  const [errores, setErrores] = useState({});
  const [paso, setPaso]       = useState(0);
  const [toast, setToast]     = useState("");

  const trabajaActualmente =
    form.actividad_actual === "Trabaja" || form.actividad_actual === "Estudia y trabaja";

  /* ── Manejador de cambios ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (value && value !== "Seleccionar")
      setErrores((prev) => ({ ...prev, [name]: false }));
  };

  /* ── Campos requeridos por paso ── */
  const requeridosPorPaso = [
    ["nombre_completo", "fecha_nacimiento", "curp", "estado_civil", "sexo", "colonia", "ciudad", "estado", "municipio"],
    ["telefono_casa", "telefono", "telefono_fam1", "telefono_fam2", "correo_personal",
     "no_control", "carrera", "generacion", "mes_egreso", "anio_egreso", "titulado", "posgrado"],
    ["actividad_actual"],
    trabajaActualmente
      ? ["nombre_empresa", "direccion_empresa", "estado_empresa", "municipio_empresa",
         "nombre_jefe", "tel_empresa", "correo_empresa", "puesto",
         "antiguedad", "condicion_trabajo", "sector", "institucion", "perfil",
         "nivel_jerarquico", "medio_obtencion", "salario", "alumnos_actualizados"]
      : ["alumnos_actualizados"],
  ];

  const validarPaso = () => {
    const campos = requeridosPorPaso[paso];
    const nuevos = {};
    let hay = false;
    campos.forEach((k) => {
      if (OPCIONALES.has(k)) return;
      const v = String(form[k] ?? "").trim();
      if (!v || v === "Seleccionar") { nuevos[k] = true; hay = true; }
    });
    setErrores((prev) => ({ ...prev, ...nuevos }));
    return !hay;
  };

  const siguiente = () => { if (validarPaso() && paso < 3) setPaso((p) => p + 1); };
  const anterior  = () => setPaso((p) => p - 1);

  const mostrarToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  /* ── Guardar ── */
  const guardar = async () => {
    if (!validarPaso()) return;
    try {
      const payload = { ...form };
      // Convertir mes_egreso a número si vino como string numérico
      if (payload.mes_egreso && payload.mes_egreso !== "Seleccionar") {
        payload.mes_egreso = parseInt(payload.mes_egreso, 10);
      }
      // anio_egreso debe ser número
      if (payload.anio_egreso) {
        payload.anio_egreso = parseInt(payload.anio_egreso, 10);
      }

      const res = await fetch("http://localhost:3000/api/egresados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setToast("✅ Egresado guardado con éxito");
        setTimeout(() => navigate("/egresados"), 1600);
      } else {
        mostrarToast("❌ Error: " + (data.message || "No se pudo guardar"));
      }
    } catch {
      mostrarToast("❌ No se pudo conectar con el servidor");
    }
  };

  /* ── Props comunes para los subcomponentes ── */
  const fieldProps = { form, errores, onChange: handleChange };

  const pct = ((paso + 1) / 4) * 100;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Registrar Egresado</div>
          <div className="page-sub">Paso {paso + 1} de 4 — {PASOS[paso].replace("\n", " ")}</div>
        </div>
        <button className="btn-borde" onClick={() => navigate("/egresados")}>
          ← Volver
        </button>
      </div>

      <div className="form-shell">
        {/* Barra de pasos */}
        <div className="pasos-bar">
          {PASOS.map((label, i) => (
            <div
              key={i}
              className={`paso${i === paso ? " activo" : ""}${i < paso ? " listo" : ""}`}
              onClick={() => i < paso && setPaso(i)}
            >
              <div className="paso-num">{i < paso ? "✓" : i + 1}</div>
              <div className="paso-label" style={{ whiteSpace: "pre" }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="progreso-bar">
          <div className="progreso-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="form-body">

          {/* ══ PASO 0: Personal y Domicilio ══ */}
          {paso === 0 && (
            <>
              <div className="seccion-titulo">
                <span className="seccion-icono">👤</span> Datos Personales
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <Input label="Nombre completo" name="nombre_completo" {...fieldProps} />
                </div>
                <div className="col-md-6">
                  <Input label="Fecha de nacimiento" name="fecha_nacimiento" type="date" {...fieldProps} />
                </div>
                <div className="col-md-6">
                  <Input label="CURP" name="curp" style={{ textTransform: "uppercase" }} {...fieldProps} />
                </div>
                <div className="col-md-3">
                  <Select label="Estado civil" name="estado_civil"
                    opts={["Soltero", "Casado", "Divorciado", "Viudo", "Unión libre"]}
                    {...fieldProps} />
                </div>
                <div className="col-md-3">
                  <Select label="Sexo" name="sexo" opts={["Masculino", "Femenino"]} {...fieldProps} />
                </div>
              </div>

              <div className="seccion-titulo mt-4">
                <span className="seccion-icono">🏠</span> Domicilio
              </div>
              <div className="row g-3">
                <div className="col-md-5">
                  <Input label="Colonia" name="colonia" {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Ciudad" name="ciudad" {...fieldProps} />
                </div>
                <div className="col-md-3">
                  <Input label="Código Postal" name="codigo_postal" req={false} {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Estado" name="estado" {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Municipio" name="municipio" {...fieldProps} />
                </div>
              </div>
            </>
          )}

          {/* ══ PASO 1: Contacto y Académico ══ */}
          {paso === 1 && (
            <>
              <div className="seccion-titulo">
                <span className="seccion-icono">📞</span> Contacto
              </div>
              <div className="row g-3">
                <div className="col-md-4">
                  <Input label="Teléfono de casa" name="telefono_casa" {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Teléfono personal" name="telefono" {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Correo electrónico" name="correo_personal" type="email" {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Teléfono familiar 1 (mamá/papá/hermano)" name="telefono_fam1" {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Teléfono familiar 2" name="telefono_fam2" {...fieldProps} />
                </div>
              </div>

              <div className="seccion-titulo mt-4">
                <span className="seccion-icono">🎓</span> Información Académica
              </div>
              <div className="row g-3">
                <div className="col-md-3">
                  <Input label="N. Control" name="no_control" {...fieldProps} />
                </div>
                <div className="col-md-5">
                  <Select label="Carrera" name="carrera" opts={[
                    "Ingeniería en Sistemas Computacionales",
                    "Ingeniería Eléctrica",
                    "Ingeniería en Administración",
                    "Ingeniería Industrial",
                    "Ingeniería Informática",
                    "Ingeniería Mecatrónica",
                  ]} {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Input label="Generación (ej. 2020-2024)" name="generacion" {...fieldProps} />
                </div>
                {/* MES como número con etiqueta legible */}
                <div className="col-md-3">
                  <Select label="Mes de egreso" name="mes_egreso" opts={MESES} {...fieldProps} />
                </div>
                {/* AÑO — nombre correcto para la BD: anio_egreso */}
                <div className="col-md-3">
                  <Input
                    label="Año de egreso"
                    name="anio_egreso"
                    type="number"
                    min="2000"
                    max="2099"
                    placeholder="2024"
                    {...fieldProps}
                  />
                </div>
                <div className="col-md-3">
                  <Select label="Titulado" name="titulado" opts={["Si", "No", "En proceso"]} {...fieldProps} />
                </div>
                <div className="col-md-3">
                  <Input label="Fecha de titulación" name="fecha_titulacion" type="date" req={false} {...fieldProps} />
                </div>
                <div className="col-md-4">
                  <Select label="Posgrado" name="posgrado"
                    opts={["Ninguno", "Especialidad", "Diplomado", "Maestría", "Doctorado"]}
                    {...fieldProps} />
                </div>
              </div>
            </>
          )}

          {/* ══ PASO 2: Situación Actual ══ */}
          {paso === 2 && (
            <>
              <div className="seccion-titulo">
                <span className="seccion-icono">💼</span> Situación Actual
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <Select label="Actividad actual" name="actividad_actual"
                    opts={["Trabaja", "No trabaja", "Estudia y trabaja", "No estudia ni trabaja"]}
                    {...fieldProps} />
                </div>
              </div>

              {trabajaActualmente ? (
                <div className="alerta-verde">
                  ✅ El siguiente paso te pedirá los datos de la empresa e información laboral.
                </div>
              ) : (
                <div className="alerta-info">
                  💡 Si el egresado trabaja, en el siguiente paso podrás ingresar los datos de su empresa.
                </div>
              )}
            </>
          )}

          {/* ══ PASO 3: Datos Laborales ══ */}
          {paso === 3 && (
            <>
              {trabajaActualmente && (
                <>
                  <div className="seccion-titulo">
                    <span className="seccion-icono">🏢</span> Información Empresarial
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Input label="Nombre de la empresa / institución" name="nombre_empresa" {...fieldProps} />
                    </div>
                    <div className="col-md-6">
                      <Input label="Dirección (calle)" name="direccion_empresa" {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="Estado" name="estado_empresa" {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="Municipio" name="municipio_empresa" {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="CP empresa" name="cp_empresa" req={false} {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="Nombre del jefe inmediato" name="nombre_jefe" {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="Puesto del jefe" name="puesto_jefe" req={false} {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="Teléfono empresa (RH / ext.)" name="tel_empresa" {...fieldProps} />
                    </div>
                    <div className="col-md-6">
                      <Input label="Correo empresa (Recursos Humanos)" name="correo_empresa" type="email" {...fieldProps} />
                    </div>
                  </div>

                  <div className="seccion-titulo mt-4">
                    <span className="seccion-icono">📊</span> Información Laboral
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <Input label="Puesto / Actividad del egresado" name="puesto" {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Input label="Ingreso / Salario mensual" name="salario" type="number" placeholder="0.00" {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Antigüedad" name="antiguedad"
                        opts={["Menos de 1 año", "1 año", "2 años", "3 años", "Más de 3 años", "Operativo"]}
                        {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Nivel jerárquico" name="nivel_jerarquico"
                        opts={["Técnico", "Administrativo", "Supervisor", "Jefe de área", "Funcionario", "Directivo", "Empresario"]}
                        {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Condición de trabajo" name="condicion_trabajo"
                        opts={["Base", "Eventual", "Contrato", "Otro"]}
                        {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Sector" name="sector"
                        opts={["Educativo", "Primario", "Secundario", "Terciario"]}
                        {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Institución" name="institucion"
                        opts={["Público", "Privado", "Social"]}
                        {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Perfil acorde a carrera" name="perfil"
                        opts={["Si", "No", "Parcial"]}
                        {...fieldProps} />
                    </div>
                    <div className="col-md-4">
                      <Select label="Trabajo obtenido de" name="medio_obtencion"
                        opts={["Bolsa de trabajo ITSH", "Contactos personales", "Residencia", "Otro"]}
                        {...fieldProps} />
                    </div>
                  </div>
                </>
              )}

              <div className="seccion-titulo mt-4">
                <span className="seccion-icono">🔄</span> Estado de Actualización
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <Select label="Estado del alumno" name="alumnos_actualizados"
                    opts={["Contactado laborando", "Actualizado", "No contactado ni actualizado"]}
                    {...fieldProps} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navegación del wizard */}
        <div className="form-nav">
          <div className="form-nav-info">Paso {paso + 1} de 4</div>
          <div style={{ display: "flex", gap: 10 }}>
            {paso > 0 && (
              <button className="btn-borde" onClick={anterior}>
                <MdArrowBack /> Anterior
              </button>
            )}
            {paso < 3 ? (
              <button className="btn-naranja" onClick={siguiente}>
                Siguiente <MdArrowForward />
              </button>
            ) : (
              <button className="btn-azul" onClick={guardar}>
                <MdSave /> Guardar Egresado
              </button>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="toast-ok">{toast}</div>}
    </>
  );
}