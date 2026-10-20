import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { Card, Delta, Leyenda } from "./ui";
import GraficoGananciasTiempo from "../GraficoGananciasTiempo";
import {
  resumenMes,
  ingresosPorMesYExperta,
  formatoPesos,
  formatoPesosCorto,
  nombreMesLargo,
} from "../../utils/metricas";

const TooltipMes = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const filas = payload.filter((p) => p.value > 0).reverse();
  const total = filas.reduce((acc, p) => acc + p.value, 0);
  return (
    <div className="ing-card" style={{ padding: 10, fontSize: "0.8rem" }}>
      <strong>
        {label}: {formatoPesos(total)}
      </strong>
      {filas.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="ing-punto" style={{ background: p.fill }} />
          {p.dataKey}: {formatoPesos(p.value)}
        </div>
      ))}
    </div>
  );
};

const ResumenTab = ({ appointments, expertas }) => {
  const hoy = useMemo(() => new Date(), []);
  const r = useMemo(() => resumenMes(appointments, hoy), [appointments, hoy]);
  const porMes = useMemo(
    () => ingresosPorMesYExperta(appointments, expertas, hoy),
    [appointments, expertas, hoy],
  );

  const pctRealizado =
    r.proyectado.ingresos > 0 ? (r.actual.ingresos / r.proyectado.ingresos) * 100 : 0;

  return (
    <div className="ing-grid dos">
      <div className="ing-kpis ing-ancho">
        <div className="ing-kpi destacado">
          <div className="ing-kpi-label">Ingresos al {format(hoy, "d/M")}</div>
          <div className="ing-kpi-valor">{formatoPesos(r.actual.ingresos)}</div>
          <Delta valor={r.var.ingresos} sufijo="vs. mismo día del mes pasado" />
        </div>
        <div className="ing-kpi">
          <div className="ing-kpi-label">Turnos</div>
          <div className="ing-kpi-valor">{r.actual.turnos}</div>
          <Delta valor={r.var.turnos} />
        </div>
        <div className="ing-kpi">
          <div className="ing-kpi-label">Ticket promedio</div>
          <div className="ing-kpi-valor">{formatoPesos(r.actual.ticket)}</div>
          <Delta valor={r.var.ticket} />
        </div>
        <div className="ing-kpi">
          <div className="ing-kpi-label">Ya reservado</div>
          <div className="ing-kpi-valor">{formatoPesos(r.reservado.ingresos)}</div>
          <span className="ing-kpi-extra">{r.reservado.turnos} turnos por venir</span>
        </div>
      </div>

      <Card
        titulo="Realizado vs. proyectado"
        sub={`${nombreMesLargo(hoy)} · turnos pasados + señados`}
      >
        <div className="ing-split" aria-hidden="true">
          <span className="ing-split-realizado" style={{ width: `${pctRealizado}%` }} />
          <span className="ing-split-reservado" style={{ flex: 1 }} />
        </div>
        <div className="ing-split-leyenda">
          <div>
            Realizado
            <strong>{formatoPesos(r.actual.ingresos)}</strong>
          </div>
          <div>
            Reservado
            <strong>{formatoPesos(r.reservado.ingresos)}</strong>
          </div>
          <div className="derecha">
            Proyectado
            <strong>{formatoPesos(r.proyectado.ingresos)}</strong>
          </div>
        </div>
        <div className="ing-proximo">
          📅 <strong>{nombreMesLargo(r.proximoMes.fecha)}</strong>: ya hay{" "}
          <strong>{r.proximoMes.turnos} turnos</strong> señados por{" "}
          <strong>{formatoPesos(r.proximoMes.ingresos)}</strong>
        </div>
      </Card>

      <Card titulo="Ingresos por mes" sub="Apilado por experta · precio de lista">
        {porMes.length === 0 ? (
          <p className="ing-vacio">Todavía no hay turnos.</p>
        ) : (
          <>
            <Leyenda items={expertas} />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porMes} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#ecebe6" />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={{ stroke: "#c3c2b7" }}
                  tick={{ fontSize: 11, fill: "#898781" }}
                  interval={0}
                />
                <YAxis
                  tickFormatter={formatoPesosCorto}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#898781" }}
                  width={48}
                />
                <Tooltip content={<TooltipMes />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                {expertas.map((e) => (
                  <Bar
                    key={e.id}
                    dataKey={e.nombre}
                    stackId="mes"
                    fill={e.color}
                    stroke="#fff"
                    strokeWidth={1}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </Card>

      <div className="ing-card ing-ancho">
        <GraficoGananciasTiempo appointments={appointments} />
      </div>
    </div>
  );
};

export default ResumenTab;
