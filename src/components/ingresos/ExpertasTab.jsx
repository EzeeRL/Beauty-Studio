import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import adminApi, { API } from "../../utils/adminApi";
import { Card, Segmentado } from "./ui";
import {
  ocupacionExperta,
  mapaDeCalor,
  enRango,
  nombreMesLargo,
} from "../../utils/metricas";

const fmtHoras = (h) => `${Math.round(h)} h`;

const Ocupacion = ({ appointments, expertas }) => {
  const [mes, setMes] = useState(format(new Date(), "yyyy-MM"));
  const [horarios, setHorarios] = useState(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all(
      expertas.map((e) =>
        adminApi
          .get(`${API}/hours/expert/${e.id}`)
          .then((res) => [e.id, res.data])
          .catch(() => [e.id, []]),
      ),
    ).then((pares) => {
      if (!cancelado) setHorarios(Object.fromEntries(pares));
    });
    return () => {
      cancelado = true;
    };
  }, [expertas]);

  const filas = useMemo(() => {
    if (!horarios) return [];
    const desde = startOfMonth(new Date(`${mes}-01T00:00:00`));
    const hasta = endOfMonth(desde);
    return expertas.map((e) => ({
      ...e,
      ...ocupacionExperta(
        appointments.filter((a) => a.Expert.id === e.id),
        horarios[e.id] ?? [],
        desde,
        hasta,
      ),
    }));
  }, [appointments, expertas, horarios, mes]);

  return (
    <Card
      titulo="Ocupación de agenda"
      sub={`Horas vendidas ÷ horas cargadas en Horarios · ${nombreMesLargo(
        new Date(`${mes}-01T00:00:00`),
      )}`}
      accion={
        <input
          type="month"
          className="ing-input"
          value={mes}
          onChange={(e) => e.target.value && setMes(e.target.value)}
        />
      }
    >
      {!horarios ? (
        <p className="ing-vacio">Cargando horarios…</p>
      ) : (
        <ul className="ing-ocupacion">
          {filas.map((f) => {
            const pct = f.ocupacion == null ? null : Math.round(f.ocupacion * 100);
            return (
              <li key={f.id}>
                <div className="ing-ocu-top">
                  <span className="ing-ocu-nombre">
                    <span className="ing-punto" style={{ background: f.color }} />
                    {f.nombre}
                  </span>
                  <span className="ing-ocu-pct">{pct == null ? "—" : `${pct}%`}</span>
                </div>
                <div className="ing-ocu-track">
                  <div
                    className="ing-ocu-fill"
                    style={{
                      width: `${Math.min(pct ?? 0, 100)}%`,
                      background: f.color,
                    }}
                  />
                </div>
                <div className="ing-ocu-sub">
                  {pct == null
                    ? `${fmtHoras(f.horasVendidas)} vendidas · sin horarios cargados este mes`
                    : `${fmtHoras(f.horasVendidas)} vendidas de ${fmtHoras(
                        f.horasDisponibles,
                      )} disponibles`}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

const colorCelda = (t) =>
  t === 0 ? "#f6f5f1" : `rgba(192, 164, 57, ${0.15 + 0.85 * t})`;

const MapaCalor = ({ appointments, expertas }) => {
  const [experta, setExperta] = useState("todas");
  const [periodo, setPeriodo] = useState("90");

  const mapa = useMemo(() => {
    let turnos = appointments;
    if (experta !== "todas")
      turnos = turnos.filter((a) => String(a.Expert.id) === experta);
    if (periodo === "90") {
      const hoy = new Date();
      turnos = enRango(turnos, subDays(hoy, 90), hoy);
    }
    return mapaDeCalor(turnos);
  }, [appointments, experta, periodo]);

  return (
    <Card
      titulo="¿Cuándo se llena la agenda?"
      sub="Turnos por día y hora de inicio"
    >
      <div className="ing-filtro">
        <select
          className="ing-select"
          value={experta}
          onChange={(e) => setExperta(e.target.value)}
        >
          <option value="todas">Todas las expertas</option>
          {expertas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        <Segmentado
          opciones={[
            { id: "90", label: "90 días" },
            { id: "todo", label: "Todo" },
          ]}
          valor={periodo}
          onChange={setPeriodo}
        />
      </div>

      {mapa.horas.length === 0 ? (
        <p className="ing-vacio">Sin turnos en el período.</p>
      ) : (
        <>
          <div
            className="ing-calor"
            style={{ gridTemplateColumns: `34px repeat(${mapa.dias.length}, 1fr)` }}
          >
            <span />
            {mapa.dias.map((d) => (
              <span key={d.dia} className="ing-calor-head">
                {d.label}
              </span>
            ))}
            {mapa.horas.map((h) => (
              <Fila key={h} hora={h} mapa={mapa} />
            ))}
          </div>
          <div className="ing-calor-escala">
            Menos <span className="grad" /> Más
          </div>
          <p className="ing-nota">
            Las franjas claras son las que conviene promocionar (ej. “martes a la
            mañana 10% off”).
          </p>
        </>
      )}
    </Card>
  );
};

const Fila = ({ hora, mapa }) => (
  <>
    <span className="ing-calor-hora">{String(hora).padStart(2, "0")}h</span>
    {mapa.dias.map((d) => {
      const n = mapa.celdas[`${d.dia}-${hora}`] || 0;
      const t = mapa.max ? n / mapa.max : 0;
      return (
        <span
          key={d.dia}
          className="ing-calor-celda"
          title={`${d.label} ${hora}h: ${n} turnos`}
          style={{ background: colorCelda(t), color: t > 0.55 ? "#fff" : "#52514e" }}
        >
          {n || ""}
        </span>
      );
    })}
  </>
);

const ExpertasTab = ({ appointments, expertas }) => (
  <div className="ing-grid dos">
    <Ocupacion appointments={appointments} expertas={expertas} />
    <MapaCalor appointments={appointments} expertas={expertas} />
  </div>
);

export default ExpertasTab;
