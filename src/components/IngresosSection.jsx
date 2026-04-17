import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import LiquidacionesExpertos from "./LiquidacionesExpertos";
import GraficoGananciasTiempo from "./GraficoGananciasTiempo";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA00FF",
  "#FF4444",
  "#00BFFF",
  "#32CD32",
  "#FFD700",
  "#FF69B4",
  "#8B4513",
  "#4B0082",
  "#FF4500",
  "#2E8B57",
  "#D2691E",
];

const IngresosSection = ({ appointments }) => {
  const [modo, setModo] = useState("servicio"); // "servicio" | "experto"

  const calcularIngresos = useMemo(() => {
    const acumulador = {};
    appointments
      .filter(
        (app) =>
          (app.payStatus === "paid" || app.payStatus === "partial") &&
          app.Service &&
          app.Expert,
      )
      .forEach((app) => {
        const key =
          modo === "servicio" ? app.Expert.specialty : app.Expert.name;
        const price = app.Service?.price ?? 0;
        acumulador[key] = (acumulador[key] || 0) + price;
      });

    return Object.entries(acumulador).map(([name, value]) => ({ name, value }));
  }, [appointments, modo]);

  return (
    <section>
      <h2>Ingresos históricos</h2>

      {/* Selector de modo */}
      <div style={{ margin: "16px 0" }}>
        <label style={{ marginRight: "10px" }}>Ver por:</label>
        <select
          value={modo}
          onChange={(e) => setModo(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="servicio">Servicios</option>
          <option value="experto">Expertos</option>
        </select>
      </div>

      {/* Gráfico + Leyenda */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20px",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "10px",
        }}
      >
        <div
          style={{
            flex: "1 1 300px",
            minWidth: "300px",
            maxWidth: "100%",
            height: 300,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={calcularIngresos}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={false}
              >
                {calcularIngresos.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda custom */}
        <div
          style={{
            flex: "1 1 200px",
            minWidth: "200px",
            maxHeight: "300px",
            overflowY: "auto",
            fontSize: "0.9rem",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {calcularIngresos.map((entry, index) => (
              <li
                key={`legend-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: COLORS[index % COLORS.length],
                    marginRight: 8,
                  }}
                />
                <span>{entry.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LiquidacionesExpertos appointments={appointments} />
      <GraficoGananciasTiempo appointments={appointments} />
    </section>
  );
};

export default IngresosSection;
