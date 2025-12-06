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
import { format, parseISO, isAfter, subDays } from "date-fns";

const GraficoGananciasDiarias = ({ appointments }) => {
  const data = useMemo(() => {
    const hoy = new Date();
    const hace21Dias = subDays(hoy, 21);

    const agrupado = {};

    appointments
      .filter(
        (appt) =>
          (appt.payStatus === "paid" || appt.payStatus === "partial") &&
          isAfter(new Date(appt.date), hace21Dias)
      )
      .forEach((appt) => {
        // --- VALIDACIONES PARA EVITAR ERRORES ---
        if (!appt.Service || !appt.Expert) return;

        const fecha = format(parseISO(appt.date), "yyyy-MM-dd");

        const precio = appt.Service?.price ?? 0;
        const nombreExpert = appt.Expert?.name?.toLowerCase() ?? "";

        const esJefa = nombreExpert.includes("evelyn duarte");
        const ganancia = esJefa ? precio : precio * 0.5;

        agrupado[fecha] = (agrupado[fecha] || 0) + ganancia;
      });

    const ordenado = Object.entries(agrupado)
      .map(([fecha, ganancia]) => ({
        fecha: format(parseISO(fecha), "dd/MM"),
        ganancia,
      }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return ordenado;
  }, [appointments]);

  if (data.length === 0) return null;

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "40px auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: 12 }}>
        📈 Ganancias netas por día (últimos 21 días)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorGananciaDia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6C55A" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#C0A439" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="fecha" />
          <YAxis tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
          <Area
            type="monotone"
            dataKey="ganancia"
            stroke="#C0A439"
            fillOpacity={1}
            fill="url(#colorGananciaDia)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoGananciasDiarias;
