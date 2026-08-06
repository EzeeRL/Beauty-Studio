import { UserRound, CalendarDays, CreditCard, Check } from "lucide-react";
import "./ReservaSteps.css";

const PASOS = [
  { label: "Experto", Icono: UserRound },
  { label: "Fecha", Icono: CalendarDays },
  { label: "Pago", Icono: CreditCard },
];

const ReservaSteps = ({ currentStep }) => {
  const progreso = ((currentStep - 1) / (PASOS.length - 1)) * 100;

  return (
    <div className="reserva-steps">
      <div className="reserva-steps-track">
        <div
          className="reserva-steps-fill"
          style={{ width: `${progreso}%` }}
        />
        {PASOS.map(({ label, Icono }, index) => {
          const numeroPaso = index + 1;
          const completado = numeroPaso < currentStep;
          const activo = numeroPaso === currentStep;

          return (
            <div key={label} className="reserva-step">
              <div
                className={`reserva-step-circle ${
                  completado ? "completado" : ""
                } ${activo ? "activo" : ""}`}
              >
                {completado ? <Check size={18} /> : <Icono size={18} />}
              </div>
              <span
                className={`reserva-step-label ${activo ? "activo" : ""}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservaSteps;
