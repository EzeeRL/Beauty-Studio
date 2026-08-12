import { useMemo } from "react";
import "./LiquidacionesExpertos.css";

const LiquidacionesExpertos = ({ appointments }) => {
  const pagosExpertos = useMemo(() => {
    const pagos = {};
    const ahora = new Date();

    // Inicio del mes actual (ej: 2025-07-01 00:00:00)
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Fin del mes actual (ej: 2025-07-31 23:59:59)
    const finMes = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    appointments
      .filter((appt) => {
        const fecha = new Date(appt.date);
        return (
          (appt.payStatus === "paid" || appt.payStatus === "partial") &&
          fecha >= inicioMes &&
          fecha <= finMes
        );
      })
      .forEach((appt) => {
        // Si falta el Expert o el Service → ignoramos ese turno
        if (!appt.Expert || !appt.Service) return;

        const { id, name } = appt.Expert;

        // Evita error si price es null o undefined
        const precio = appt.Service?.price ?? 0;

        if (!pagos[id]) {
          pagos[id] = { nombre: name, total: 0 };
        }

        pagos[id].total += precio;
      });

    return Object.entries(pagos).map(([id, { nombre, total }]) => {
      const esJefa = nombre.toLowerCase().includes("evelyn duarte");
      let porcentaje = 0.8;

      if (esJefa) porcentaje = 0;
      else if (parseInt(id) === 4) porcentaje = 0.7;

      return {
        experto: nombre,
        totalGenerado: total,
        aPagar: total * porcentaje,
        esJefa,
      };
    });
  }, [appointments]);

  const totalMes = pagosExpertos.reduce((acc, exp) => {
    // Si es jefa, la empresa gana todo
    // Si NO es jefa, la empresa gana el otro 50%
    const gananciaEmpresa = exp.esJefa
      ? exp.totalGenerado
      : exp.totalGenerado * 0.2;
    return acc + gananciaEmpresa;
  }, 0);

  return (
    <div className="liquidaciones-container">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        💼 Liquidación de expertos
      </h2>
      <div className="liquidaciones-list">
        {pagosExpertos.map(({ experto, totalGenerado, aPagar, esJefa }) => (
          <div className="liquidacion-row" key={experto}>
            <div className="liquidacion-info">
              <span className="liquidacion-nombre">{experto}</span>
              <span className="liquidacion-generado">
                Generado: ${totalGenerado.toLocaleString()}
              </span>
            </div>
            <span className={`liquidacion-pagar ${esJefa ? "es-jefa" : ""}`}>
              {esJefa ? "Es jefa" : `$${aPagar.toLocaleString()}`}
            </span>
          </div>
        ))}

        <div className="liquidacion-row liquidacion-total">
          <span className="liquidacion-nombre">Total de ganancias (mes)</span>
          <span className="liquidacion-pagar">${totalMes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default LiquidacionesExpertos;
