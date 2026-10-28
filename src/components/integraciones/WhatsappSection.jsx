import { useEffect, useMemo, useState } from "react";
import { addHours, format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Link2,
  LoaderCircle,
  Clock,
  Check,
  X,
  Copy,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  Info,
} from "lucide-react";

const DURACION_CODIGO_S = 3 * 60;

const ESTADOS = {
  idle: { label: "Sin conectar" },
  starting: { label: "Iniciando", icon: LoaderCircle, girando: true },
  waiting_code: { label: "Esperando código", icon: Clock },
  linked: { label: "Conectado", icon: Check },
  error: { label: "No se conectó", icon: X },
};

const PASOS = ["Prender bot", "Código", "Conectado"];

const fechaHora = (iso) =>
  iso ? format(new Date(iso), "dd/MM 'a las' HH:mm") : "—";

const cuandoTurno = (fecha) => {
  const hora = format(fecha, "HH:mm");
  if (isToday(fecha)) return `hoy ${hora}`;
  if (isTomorrow(fecha)) return `mañana ${hora}`;
  return `${format(fecha, "EEE", { locale: es })} ${hora}`;
};

const Estado = ({ status }) => {
  const { label, icon: Icon, girando } = ESTADOS[status] ?? ESTADOS.idle;
  return (
    <span className={`wsp-estado ${status}`}>
      {Icon ? (
        <Icon size={12} strokeWidth={3} className={girando ? "wsp-girando" : ""} />
      ) : (
        <span className="wsp-anillo" />
      )}
      {label}
    </span>
  );
};

// paso: índice de la etapa en curso (0 = prender bot, 1 = código)
const Stepper = ({ paso }) => (
  <ol className="wsp-stepper">
    {PASOS.map((nombre, i) => (
      <li
        key={nombre}
        className={`wsp-step ${i < paso ? "hecho" : ""} ${i === paso ? "actual" : ""}`}
      >
        <span className="wsp-step-dot">
          {i < paso ? <Check size={14} strokeWidth={3} /> : i + 1}
        </span>
        {nombre}
      </li>
    ))}
  </ol>
);

const SinConectar = ({ onConectar, iniciando }) => (
  <>
    <p className="int-txt">
      Conectá el WhatsApp del local para que el bot les mande el recordatorio
      automatico
    </p>
    <button type="button" className="wsp-btn" onClick={onConectar} disabled={iniciando}>
      <Link2 size={18} />
      {iniciando ? "Conectando…" : "Conectar WhatsApp"}
    </button>
  </>
);

const Iniciando = ({ estado }) => (
  <>
    <Stepper paso={0} />
    <div className="wsp-esperando">
      <LoaderCircle size={40} strokeWidth={2.5} className="wsp-girando" />
      <strong>Prendiendo el bot…</strong>
      <p className="int-txt" style={{ color: "var(--int-muted)" }}>
        Suele tardar alrededor de 1 minuto.
        <br />
        No hace falta que hagas nada todavía.
      </p>
    </div>
    <div className="wsp-barra">
      <div className="wsp-barra-indet" />
    </div>
    <button type="button" className="wsp-btn" disabled>
      Esperando el código…
    </button>
    <p className="int-card-sub" style={{ textAlign: "center", marginTop: -8 }}>
      Pedido a las {estado.startedAt ? format(new Date(estado.startedAt), "HH:mm") : "—"} · se
      actualiza solo
    </p>
  </>
);

const Codigo = ({ estado }) => {
  const [ahora, setAhora] = useState(() => Date.now());
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const restante = estado.codeExpiresAt
    ? Math.max(0, Math.round((new Date(estado.codeExpiresAt) - ahora) / 1000))
    : 0;
  const vigente = estado.pairingCode && restante > 0;
  const urgente = restante <= 30;
  const minutos = Math.floor(restante / 60);
  const segundos = String(restante % 60).padStart(2, "0");

  const copiar = async () => {
    try {
      // WhatsApp acepta el código sin el guion
      await navigator.clipboard.writeText(estado.pairingCode.replace("-", ""));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el código igual se puede seleccionar a mano
    }
  };

  return (
    <>
      <Stepper paso={1} />
      {vigente ? (
        <div className="wsp-codigo">
          <div className="wsp-codigo-label">Código de vinculación</div>
          <div className="wsp-codigo-valor">{estado.pairingCode}</div>
          <button type="button" className="wsp-copiar" onClick={copiar}>
            {copiado ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} />}
            {copiado ? "Copiado" : "Copiar código"}
          </button>
          <div className="wsp-vence">
            <span>Vence en</span>
            <strong className={urgente ? "urgente" : ""}>
              {minutos}:{segundos}
            </strong>
          </div>
          <div className="wsp-vence-barra">
            <div
              className={urgente ? "urgente" : ""}
              style={{ width: `${(restante / DURACION_CODIGO_S) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="wsp-codigo">
          <strong>El código venció</strong>
          <p className="int-card-sub" style={{ marginTop: 6 }}>
            Esperando que el bot cierre este intento para poder pedir uno nuevo…
          </p>
        </div>
      )}
    </>
  );
};

const PasosCelular = () => (
  <section className="int-card">
    <h3 className="int-card-title">En el celular del local</h3>
    <ol className="wsp-pasos">
      <li>
        <span className="wsp-num">1</span>
        <span>
          Abrí <strong>WhatsApp</strong>.
        </span>
      </li>
      <li>
        <span className="wsp-num">2</span>
        <span>
          Andá a <strong>Más opciones ⋮</strong> (en iPhone, <strong>Configuración</strong>) ›{" "}
          <strong>Dispositivos vinculados</strong>.
        </span>
      </li>
      <li>
        <span className="wsp-num">3</span>
        <span>
          Tocá <strong>Vincular un dispositivo</strong> y después{" "}
          <strong>Vincular con el número de teléfono</strong>.
        </span>
      </li>
      <li>
        <span className="wsp-num">4</span>
        <span>
          Escribí el código de arriba. Esta pantalla pasa sola a <strong>Conectado</strong>.
        </span>
      </li>
    </ol>
  </section>
);

const ComoFunciona = () => (
  <section className="int-card">
    <h3 className="int-card-title">Cómo funciona</h3>
    <ol className="wsp-pasos">
      <li>
        <span className="wsp-num">1</span>
        <span>
          Tocás <strong>Conectar WhatsApp</strong> y se prende el bot. Tarda
          alrededor de 1 minuto.
        </span>
      </li>
      <li>
        <span className="wsp-num">2</span>
        <span>
          Aparece un <strong>código de 8 caracteres</strong>, que dura 3 minutos.
        </span>
      </li>
      <li>
        <span className="wsp-num">3</span>
        <span>
          En el celular del local abrís WhatsApp › <strong>Dispositivos vinculados</strong> ›
          Vincular con número de teléfono, y escribís el código.
        </span>
      </li>
    </ol>
  </section>
);

const Conectado = ({ estado, onConectar, iniciando }) => (
  <>
    <div className="wsp-ok">
      <ShieldCheck size={20} />
      <div>
        El bot está listo para mandar recordatorios
        <p className="int-card-sub">Conectado desde el {fechaHora(estado.updatedAt)}</p>
      </div>
    </div>
    <button
      type="button"
      className="wsp-btn secundario"
      onClick={onConectar}
      disabled={iniciando}
    >
      <RefreshCw size={16} />
      {iniciando ? "Iniciando…" : "Volver a vincular"}
    </button>
    <p className="int-card-sub" style={{ marginTop: -8 }}>
      Usalo si cambiaste de celular o si en WhatsApp cerraste la sesión del bot.
    </p>
  </>
);

const ConError = ({ estado, onConectar, iniciando }) => (
  <>
    <div className="wsp-error">
      <TriangleAlert size={20} />
      <div>
        {estado.message || "El bot no pudo terminar la vinculación"}
        <p className="int-card-sub">Último intento: {fechaHora(estado.updatedAt)}</p>
      </div>
    </div>
    <div>
      <p className="int-card-sub" style={{ fontWeight: 600, marginBottom: 10 }}>
        Antes de reintentar
      </p>
      <ul className="wsp-checks">
        <li>
          <Check size={16} strokeWidth={2.5} />
          Tené a mano el celular del local con WhatsApp abierto.
        </li>
        <li>
          <Check size={16} strokeWidth={2.5} />
          El código dura 3 minutos: escribilo apenas aparezca.
        </li>
        <li>
          <Check size={16} strokeWidth={2.5} />
          Si vuelve a fallar, avisale a Juanma
        </li>
      </ul>
    </div>
    <button type="button" className="wsp-btn" onClick={onConectar} disabled={iniciando}>
      <RefreshCw size={18} />
      {iniciando ? "Iniciando…" : "Reintentar"}
    </button>
  </>
);

const Recordatorios = ({ appointments, onVerTurnos }) => {
  const proximos = useMemo(() => {
    const ahora = new Date();
    const limite = addHours(ahora, 48);
    return appointments
      .filter((a) => {
        const f = new Date(a.date);
        return f >= ahora && f <= limite;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments]);

  const enviados = proximos.filter((a) => a.reminderStatus === "enviado").length;
  const pendientes = proximos.length - enviados;
  // Primero los pendientes, que son los que hay que mirar
  const lista = [...proximos]
    .sort(
      (a, b) =>
        (a.reminderStatus === "enviado") - (b.reminderStatus === "enviado"),
    )
    .slice(0, 5);

  return (
    <section className="int-card">
      <div>
        <h3 className="int-card-title">Recordatorios</h3>
        <p className="int-card-sub">Turnos de las próximas 48 h</p>
      </div>
      {proximos.length === 0 ? (
        <p className="int-txt" style={{ color: "var(--int-muted)" }}>
          No hay turnos en las próximas 48 horas.
        </p>
      ) : (
        <>
          <div className="wsp-mini">
            <div>
              <strong>{proximos.length}</strong>turnos
            </div>
            <div>
              <strong className="enviados">{enviados}</strong>enviados
            </div>
            <div>
              <strong className="pendientes">{pendientes}</strong>pendientes
            </div>
          </div>
          <div className="wsp-split" aria-hidden="true">
            <div className="enviados" style={{ width: `${(enviados / proximos.length) * 100}%` }} />
            {pendientes > 0 && <div className="pendientes" />}
          </div>
          <ul className="wsp-lista">
            {lista.map((a) => {
              const enviado = a.reminderStatus === "enviado";
              return (
                <li key={a.id}>
                  <div style={{ minWidth: 0 }}>
                    <div className="wsp-lista-nombre">{a.User?.name ?? "Sin nombre"}</div>
                    <div className="int-card-sub">
                      {a.Service?.name ?? "Servicio"} · {cuandoTurno(new Date(a.date))}
                    </div>
                  </div>
                  <span className={`wsp-tag ${enviado ? "enviado" : "pendiente"}`}>
                    {enviado ? <Check size={11} strokeWidth={3} /> : <Clock size={11} />}
                    {enviado ? "Enviado" : "Pendiente"}
                  </span>
                </li>
              );
            })}
          </ul>
          <button type="button" className="wsp-link" onClick={onVerTurnos}>
            Ver todos en Turnos
          </button>
        </>
      )}
    </section>
  );
};

const AvisoManual = () => (
  <div className="int-aviso">
    <Info size={20} />
    <span>
      Mientras no esté conectado, los recordatorios se siguen mandando a mano
      con el botón de WhatsApp de cada turno.
    </span>
  </div>
);

const WhatsappSection = ({ bot, appointments, onVerTurnos }) => {
  const { estado, error, iniciando, conectar, reintentarConsulta } = bot;
  const status = estado?.status ?? "idle";

  if (!estado && !error) {
    return (
      <section className="int-card">
        <p className="int-txt" style={{ color: "var(--int-muted)" }}>
          Consultando el estado del bot…
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="int-card">
        <div className="wsp-head">
          <img className="wsp-logo" src="/WhatsApp1.svg.webp" alt="" />

          <div className="wsp-head-txt">
            <h3 className="int-card-title">WhatsApp</h3>
            <p className="int-card-sub">Bot de recordatorios de turnos</p>
            {estado && <Estado status={status} />}
          </div>
        </div>

        {error && (
          <div className="wsp-error">
            <TriangleAlert size={20} />
            <div>
              {error}
              {!estado && (
                <button type="button" className="wsp-link" onClick={reintentarConsulta}>
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}

        {estado && status === "idle" && (
          <SinConectar onConectar={conectar} iniciando={iniciando} />
        )}
        {status === "starting" && <Iniciando estado={estado} />}
        {status === "waiting_code" && <Codigo estado={estado} />}
        {status === "linked" && (
          <Conectado estado={estado} onConectar={conectar} iniciando={iniciando} />
        )}
        {status === "error" && (
          <ConError estado={estado} onConectar={conectar} iniciando={iniciando} />
        )}
      </section>

      {status === "idle" && <ComoFunciona />}
      {status === "waiting_code" && <PasosCelular />}
      {status === "starting" && (
        <div className="int-aviso">
          <Info size={20} />
          <span>
            Andá agarrando el celular del local: en cuanto aparezca el código vas
            a tener 3 minutos para escribirlo.
          </span>
        </div>
      )}
      {status === "linked" && (
        <Recordatorios appointments={appointments} onVerTurnos={onVerTurnos} />
      )}
      {(status === "idle" || status === "error") && <AvisoManual />}
    </>
  );
};

export default WhatsappSection;
