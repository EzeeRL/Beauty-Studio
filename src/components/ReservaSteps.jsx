import "./ReservaSteps.css";

const PASOS = ["Experto", "Fecha", "Pago"];

const ReservaSteps = ({ currentStep }) => {
  const progreso = ((currentStep - 1) / (PASOS.length - 1)) * 100;

  return (
    <div className="reserva-steps">
      <div className="reserva-steps-track">
        <div
          className="reserva-steps-fill"
          style={{ width: `${progreso}%` }}
        />
        {PASOS.map((paso, index) => {
          const numeroPaso = index + 1;
          const completado = numeroPaso < currentStep;
          const activo = numeroPaso === currentStep;

          return (
            <div key={paso} className="reserva-step">
              <div
                className={`reserva-step-circle ${
                  completado ? "completado" : ""
                } ${activo ? "activo" : ""}`}
              >
                {completado ? "✓" : numeroPaso}
              </div>
              <span
                className={`reserva-step-label ${activo ? "activo" : ""}`}
              >
                {paso}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservaSteps;
