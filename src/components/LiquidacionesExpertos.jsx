import { useMemo, useState } from "react";
import { format } from "date-fns";
import "./LiquidacionesExpertos.css";
import {
  liquidacionMes,
  descargarCSV,
  filasLiquidacionCSV,
  ENCABEZADOS_LIQUIDACION,
  nombreMesLargo,
} from "../utils/metricas";

const LiquidacionesExpertos = ({ appointments }) => {
  const [mes, setMes] = useState(format(new Date(), "yyyy-MM"));
  const fechaMes = useMemo(() => new Date(`${mes}-01T00:00:00`), [mes]);

  const { filas, totalEstudio } = useMemo(
    () =>
      liquidacionMes(
        appointments.filter((a) => a.Expert && a.Service),
        fechaMes,
      ),
    [appointments, fechaMes],
  );

  const exportar = (turnos, sufijo) =>
    descargarCSV(
      `liquidacion-${mes}${sufijo ? `-${sufijo}` : ""}.csv`,
      ENCABEZADOS_LIQUIDACION,
      filasLiquidacionCSV(turnos),
    );

  return (
    <div className="liquidaciones-container">
      <div className="liquidaciones-header">
        <div>
          <h2>💼 Liquidación de expertos</h2>
          <span className="liquidacion-generado">{nombreMesLargo(fechaMes)}</span>
        </div>
        <input
          type="month"
          className="liquidaciones-mes"
          value={mes}
          onChange={(e) => e.target.value && setMes(e.target.value)}
        />
      </div>

      {filas.length === 0 ? (
        <p className="liquidaciones-vacio">No hay turnos pagos en este mes.</p>
      ) : (
        <div className="liquidaciones-list">
          {filas.map((f) => (
            <div className="liquidacion-row" key={f.id}>
              <div className="liquidacion-info">
                <span className="liquidacion-nombre">{f.experto}</span>
                <span className="liquidacion-generado">
                  {f.turnos.length} turnos · Generado: $
                  {f.totalGenerado.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="liquidacion-acciones">
                <span className={`liquidacion-pagar ${f.esJefa ? "es-jefa" : ""}`}>
                  {f.esJefa ? "Es jefa" : `$${f.aPagar.toLocaleString("es-AR")}`}
                </span>
                <button
                  type="button"
                  className="liquidacion-csv"
                  onClick={() =>
                    exportar(f.turnos, f.experto.toLowerCase().replace(/\s+/g, "-"))
                  }
                >
                  CSV
                </button>
              </div>
            </div>
          ))}

          <div className="liquidacion-row liquidacion-total">
            <span className="liquidacion-nombre">Ganancia del estudio</span>
            <span className="liquidacion-pagar">
              ${totalEstudio.toLocaleString("es-AR")}
            </span>
          </div>

          <button
            type="button"
            className="liquidacion-csv todo"
            onClick={() => exportar(filas.flatMap((f) => f.turnos))}
          >
            ⬇ Exportar mes completo (CSV)
          </button>
        </div>
      )}
    </div>
  );
};

export default LiquidacionesExpertos;
