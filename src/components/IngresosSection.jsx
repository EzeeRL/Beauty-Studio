import { useMemo, useState } from "react";
import LiquidacionesExpertos from "./LiquidacionesExpertos";
import ResumenTab from "./ingresos/ResumenTab";
import ServiciosTab from "./ingresos/ServiciosTab";
import ExpertasTab from "./ingresos/ExpertasTab";
import ClientasTab from "./ingresos/ClientasTab";
import { turnosValidos, expertasConColor } from "../utils/metricas";
import "./ingresos/ingresos.css";

const TABS = [
  { id: "resumen", label: "📊 Resumen" },
  { id: "servicios", label: "💅 Servicios" },
  { id: "expertas", label: "👩 Expertas" },
  { id: "clientas", label: "💕 Clientas" },
  { id: "liquidaciones", label: "💼 Liquidaciones" },
];

const IngresosSection = ({ appointments }) => {
  const [tab, setTab] = useState("resumen");

  // Turnos con servicio y experta (los que no tienen no se pueden medir)
  const turnos = useMemo(() => turnosValidos(appointments), [appointments]);
  const expertas = useMemo(() => expertasConColor(turnos), [turnos]);

  return (
    <section className="ing">
      <h2>Ingresos</h2>

      <nav className="ing-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ing-tab ${tab === t.id ? "activo" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "resumen" && <ResumenTab appointments={turnos} expertas={expertas} />}
      {tab === "servicios" && <ServiciosTab appointments={turnos} />}
      {tab === "expertas" && <ExpertasTab appointments={turnos} expertas={expertas} />}
      {tab === "clientas" && <ClientasTab appointments={turnos} />}
      {tab === "liquidaciones" && <LiquidacionesExpertos appointments={turnos} />}
    </section>
  );
};

export default IngresosSection;
