import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, startOfMonth } from "date-fns";
import { Card, Leyenda, BarrasLista } from "./ui";
import {
  agruparClientas,
  nuevasVsRecurrentes,
  mesesConDatos,
  frecuenciaPorServicio,
  clientasQueNoVuelven,
  ventasCruzadas,
  anticipacionReserva,
  formatoPesos,
} from "../../utils/metricas";

const COLOR_NUEVAS = "#2a78d6";
const COLOR_RECURRENTES = "#eb6834";

const ejes = {
  tickLine: false,
  tick: { fontSize: 11, fill: "#898781" },
};

const linkWhatsApp = (phone, texto) => {
  let tel = String(phone ?? "").replace(/\D/g, "");
  if (!tel.startsWith("54")) tel = "549" + tel;
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
};

const mensajeVolver = (nombre) =>
  `¡Hola ${nombre.split(" ")[0]}! 💕 Hace un tiempito que no te vemos por D´Art. ` +
  `¿Querés que te guardemos un turno esta semana? ✨`;

const mensajeCombo = (nombre, especialidad) =>
  `¡Hola ${nombre.split(" ")[0]}! ✨ Como sos clienta de ${especialidad}, ` +
  `te queremos ofrecer un combo con otro de nuestros servicios. ¿Te paso la info?`;

const fechaCorta = (f) => (f ? format(f, "dd/MM/yy") : "—");

const NuevasVsRecurrentes = ({ clientas, appointments }) => {
  const data = useMemo(
    () => nuevasVsRecurrentes(clientas, mesesConDatos(appointments)),
    [clientas, appointments],
  );
  return (
    <Card titulo="Nuevas vs. recurrentes" sub="Clientas distintas atendidas por mes">
      <Leyenda
        items={[
          { nombre: "Nuevas", color: COLOR_NUEVAS },
          { nombre: "Recurrentes", color: COLOR_RECURRENTES },
        ]}
      />
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#ecebe6" />
          <XAxis dataKey="mes" {...ejes} axisLine={{ stroke: "#c3c2b7" }} interval={0} />
          <YAxis {...ejes} axisLine={false} allowDecimals={false} width={40} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar
            dataKey="recurrentes"
            name="Recurrentes"
            stackId="c"
            fill={COLOR_RECURRENTES}
            stroke="#fff"
            strokeWidth={1}
            maxBarSize={36}
          />
          <Bar
            dataKey="nuevas"
            name="Nuevas"
            stackId="c"
            fill={COLOR_NUEVAS}
            stroke="#fff"
            strokeWidth={1}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const NoVuelven = ({ clientas }) => {
  const [dias, setDias] = useState(45);
  const [minTurnos, setMinTurnos] = useState(3);
  const lista = useMemo(
    () => clientasQueNoVuelven(clientas, { dias, minTurnos }),
    [clientas, dias, minTurnos],
  );
  return (
    <Card
      titulo="Clientas que no vuelven"
      sub={`${lista.length} clientas para contactar`}
    >
      <div className="ing-filtro">
        Con
        <input
          type="number"
          min={1}
          className="ing-input num"
          value={minTurnos}
          onChange={(e) => setMinTurnos(Math.max(1, Number(e.target.value) || 1))}
        />
        turnos o más, y hace más de
        <input
          type="number"
          min={1}
          className="ing-input num"
          value={dias}
          onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))}
        />
        días que no vienen
      </div>
      {lista.length === 0 ? (
        <p className="ing-vacio">Nadie para contactar con este criterio 🎉</p>
      ) : (
        <ul className="ing-clientas">
          {lista.slice(0, 30).map((c) => (
            <li key={c.id} className="ing-clienta">
              <div className="ing-clienta-info">
                <div className="ing-clienta-nombre">{c.nombre}</div>
                <div className="ing-clienta-sub">
                  {c.cantidadPasados} turnos · {formatoPesos(c.total)} · última vez
                  hace {c.diasSinVenir} días
                </div>
              </div>
              {c.phone && (
                <a
                  className="ing-btn wsp"
                  href={linkWhatsApp(c.phone, mensajeVolver(c.nombre))}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const Frecuencia = ({ clientas }) => {
  const filas = useMemo(() => frecuenciaPorServicio(clientas), [clientas]);
  return (
    <Card
      titulo="¿Cada cuánto vuelven?"
      sub="Días entre dos turnos del mismo servicio (mediana)"
    >
      {filas.length === 0 ? (
        <p className="ing-vacio">Todavía no hay repeticiones suficientes.</p>
      ) : (
        <div className="ing-tabla-wrap">
          <table className="ing-tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Vuelven cada</th>
                <th>Casos</th>
              </tr>
            </thead>
            <tbody>
              {filas.slice(0, 12).map((f) => (
                <tr key={f.nombre}>
                  <td>{f.nombre}</td>
                  <td>
                    <strong>{Math.round(f.mediana)} días</strong>
                    <span className="chico">≈ {Math.max(1, Math.round(f.mediana / 7))} sem.</span>
                  </td>
                  <td>{f.repeticiones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="ing-nota">
        Usalo para avisarle a la clienta cuando le toca: si el capping se repite
        cada 3 semanas, un recordatorio a los 18 días llena la agenda sola.
      </p>
    </Card>
  );
};

const Cruzadas = ({ clientas }) => {
  const v = useMemo(() => ventasCruzadas(clientas), [clientas]);
  const total = v.multi.length + v.una.length;
  const pct = total ? Math.round((v.multi.length / total) * 100) : 0;
  const candidatas = [...v.una].sort((a, b) => b.total - a.total).slice(0, 8);
  return (
    <Card titulo="Ventas cruzadas" sub="Clientas que usan más de una especialidad">
      <div className="ing-mini">
        <div>
          <strong>{v.multi.length}</strong>
          <span>2+ áreas</span>
        </div>
        <div>
          <strong>{v.una.length}</strong>
          <span>una sola</span>
        </div>
        <div>
          <strong>{pct}%</strong>
          <span>cruzan</span>
        </div>
      </div>
      {v.combos.length > 0 && (
        <BarrasLista
          items={v.combos.map((c) => ({ nombre: c.nombre, valor: c.cantidad }))}
          formato={(n) => `${n} clientas`}
          limite={5}
        />
      )}
      {candidatas.length > 0 && (
        <>
          <p className="ing-nota" style={{ fontWeight: 600 }}>
            Mejores clientas de una sola área (ofrecerles un combo):
          </p>
          <ul className="ing-clientas">
            {candidatas.map((c) => {
              const area = [...c.especialidades][0];
              return (
                <li key={c.id} className="ing-clienta">
                  <div className="ing-clienta-info">
                    <div className="ing-clienta-nombre">{c.nombre}</div>
                    <div className="ing-clienta-sub">
                      Solo {area} · {formatoPesos(c.total)}
                    </div>
                  </div>
                  {c.phone && (
                    <a
                      className="ing-btn"
                      href={linkWhatsApp(c.phone, mensajeCombo(c.nombre, area))}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ofrecer
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
};

const Anticipacion = ({ appointments }) => {
  const a = useMemo(() => anticipacionReserva(appointments), [appointments]);
  return (
    <Card
      titulo="¿Con cuánta anticipación reservan?"
      sub={
        a.mediana == null
          ? "Sin datos"
          : `La mitad reserva con ${Math.round(a.mediana)} días o menos · ${Math.round(
              a.porcentajeHasta7 * 100,
            )}% dentro de la semana`
      }
    >
      {a.total === 0 ? (
        <p className="ing-vacio">Sin datos de creación de turnos.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={a.tramos}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="#ecebe6" />
            <XAxis type="number" {...ejes} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="tramo"
              {...ejes}
              axisLine={{ stroke: "#c3c2b7" }}
              width={78}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              formatter={(v) => [`${v} turnos`, "Reservas"]}
            />
            <Bar dataKey="cantidad" fill="#c0a439" radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <p className="ing-nota">
        Si casi todo se reserva con pocos días, no hace falta abrir la agenda con
        meses de anticipación.
      </p>
    </Card>
  );
};

const ClientasTab = ({ appointments }) => {
  const clientas = useMemo(() => agruparClientas(appointments), [appointments]);

  const stats = useMemo(() => {
    const inicioMes = startOfMonth(new Date());
    const vinieronEsteMes = clientas.filter((c) =>
      c.turnos.some((t) => new Date(t.date) >= inicioMes),
    );
    return {
      total: clientas.length,
      activas: vinieronEsteMes.length,
      nuevas: vinieronEsteMes.filter((c) => c.primera >= inicioMes).length,
    };
  }, [clientas]);

  const top = useMemo(
    () =>
      [...clientas]
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((c) => ({
          clave: c.id,
          nombre: c.nombre,
          valor: c.total,
          sub: `${c.turnos.length} turnos · última ${fechaCorta(c.ultimo)}`,
        })),
    [clientas],
  );

  return (
    <div className="ing-grid dos">
      <div className="ing-kpis ing-ancho" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="ing-kpi">
          <div className="ing-kpi-label">Clientas</div>
          <div className="ing-kpi-valor">{stats.total}</div>
          <span className="ing-kpi-extra">históricas</span>
        </div>
        <div className="ing-kpi">
          <div className="ing-kpi-label">Este mes</div>
          <div className="ing-kpi-valor">{stats.activas}</div>
          <span className="ing-kpi-extra">con turno</span>
        </div>
        <div className="ing-kpi">
          <div className="ing-kpi-label">Nuevas</div>
          <div className="ing-kpi-valor">{stats.nuevas}</div>
          <span className="ing-kpi-extra">este mes</span>
        </div>
      </div>

      <NoVuelven clientas={clientas} />
      <Card titulo="Top clientas" sub="Por gasto total">
        {top.length === 0 ? (
          <p className="ing-vacio">Sin clientas todavía.</p>
        ) : (
          <BarrasLista items={top} formato={formatoPesos} />
        )}
      </Card>
      <NuevasVsRecurrentes clientas={clientas} appointments={appointments} />
      <Frecuencia clientas={clientas} />
      <Cruzadas clientas={clientas} />
      <Anticipacion appointments={appointments} />
    </div>
  );
};

export default ClientasTab;
