import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import useServicioStore from "../store/servicioStore";
import "./Fecha.css";

const horariosDisponibles = Array.from({ length: 13 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const Fecha = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const { servicio, experto, setFecha } = useServicioStore();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`);
      setFecha(dateTime);
      navigate("/datos");
    }
  };

  return (
    <div className="fecha-container">
      <h2>Selecciona una fecha para {experto?.name}</h2>
      <p>Servicio: {servicio?.name}</p>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        fromDate={new Date()}
        modifiersClassNames={{
          selected: "selected-day",
          today: "today-day",
        }}
      />

      {selectedDate && (
        <>
          <label className="label">Selecciona un horario:</label>
          <div className="horarios-grid">
            {horariosDisponibles.map((hora) => (
              <button
                key={hora}
                className={`horario-btn ${selectedTime === hora ? "activo" : ""}`}
                onClick={() => setSelectedTime(hora)}
              >
                {hora}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        className="continue-button"
        onClick={handleContinue}
        disabled={!selectedDate || !selectedTime}
      >
        Continuar
      </button>
    </div>
  );
};

export default Fecha;
