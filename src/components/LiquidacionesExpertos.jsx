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
        const nombre = appt.Expert.name;
        const precio = appt.Service.price;

        pagos[nombre] = (pagos[nombre] || 0) + precio;
      });

    return Object.entries(pagos).map(([nombre, total]) => {
      const esJefa = nombre.toLowerCase().includes("evelyn duarte");
      const aPagar = esJefa ? 0 : total * 0.5;

      return {
        experto: nombre,
        totalGenerado: total,
        aPagar,
        esJefa,
      };
    });
  }, [appointments]);

  const totalMes = pagosExpertos.reduce((acc, exp) => {
    // Si es jefa, la empresa gana todo
    // Si NO es jefa, la empresa gana el otro 50%
    const gananciaEmpresa = exp.esJefa
      ? exp.totalGenerado
      : exp.totalGenerado * 0.5;
    return acc + gananciaEmpresa;
  }, 0);

  return (
    <div className="liquidaciones-container">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        💼 Liquidación de expertos
      </h2>
      <table className="tabla-liquidaciones">
        <thead>
          <tr>
            <th>Experto</th>
            <th>Total generado</th>
            <th>A pagar</th>
          </tr>
        </thead>
        <tbody>
          {pagosExpertos.map(({ experto, totalGenerado, aPagar, esJefa }) => (
            <tr key={experto}>
              <td>{experto}</td>
              <td>${totalGenerado.toLocaleString()}</td>
              <td style={{ color: esJefa ? "gray" : "#C0A439" }}>
                {esJefa ? "Es jefa" : `$${aPagar.toLocaleString()}`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2" style={{ fontWeight: "bold", textAlign: "right" }}>
              Total de ganancias (mes):
            </td>
            <td style={{ fontWeight: "bold", color: "#C0A439" }}>
              ${totalMes.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default LiquidacionesExpertos;
