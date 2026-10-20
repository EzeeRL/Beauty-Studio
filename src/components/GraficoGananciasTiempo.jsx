import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import {
  gananciaEstudio,
  formatoPesos,
  formatoPesosCorto,
} from "../utils/metricas";

const GraficoGananciasDiarias = ({ appointments }) => {
  const data = useMemo(() => {
    const hoy = new Date();
    const hace21Dias = startOfDay(subDays(hoy, 21));

    const agrupado = {};

    appointments
      .filter((appt) => {
        const fecha = new Date(appt.date);
        // Solo lo que ya pasó: los turnos futuros todavía no son ganancia
        return appt.Service && appt.Expert && fecha >= hace21Dias && fecha <= hoy;
      })
      .forEach((appt) => {
        const fecha = format(new Date(appt.date), "yyyy-MM-dd");
        agrupado[fecha] = (agrupado[fecha] || 0) + gananciaEstudio(appt);
      });

    // Ordenamos por la clave yyyy-MM-dd antes de formatear a dd/MM
    return Object.keys(agrupado)
      .sort()
      .map((clave) => ({
        fecha: format(new Date(`${clave}T00:00:00`), "dd/MM"),
        ganancia: agrupado[clave],
      }));
  }, [appointments]);

  if (data.length === 0) return null;

  return (
    <div style={{ width: "100%" }}>
      <h3 className="ing-card-title">Ganancia neta del estudio por día</h3>
      <p className="ing-card-sub" style={{ marginBottom: 12 }}>
        Últimos 21 días · descontado lo que se lleva cada experta
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGananciaDia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6C55A" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#C0A439" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ecebe6" />
          <XAxis
            dataKey="fecha"
            tickLine={false}
            axisLine={{ stroke: "#c3c2b7" }}
            tick={{ fontSize: 11, fill: "#898781" }}
            minTickGap={16}
          />
          <YAxis
            tickFormatter={formatoPesosCorto}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#898781" }}
            width={48}
          />
          <Tooltip formatter={(v) => [formatoPesos(v), "Ganancia"]} />
          <Area
            type="monotone"
            dataKey="ganancia"
            stroke="#C0A439"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGananciaDia)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoGananciasDiarias;
