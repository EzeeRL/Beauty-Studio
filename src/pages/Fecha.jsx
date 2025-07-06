import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { format, parseISO, isSameDay, addMinutes } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import useServicioStore from "../store/servicioStore";
import axios from "axios";
import "./Fecha.css"; // mantendremos el estilo, lo ajustamos abajo

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
  const [ocupados, setOcupados] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("https://eve-back.vercel.app/appointments");
        const allAppointments = res.data.appointments;

        const turnosDelExperto = allAppointments.filter(
          (appt) => appt.expertId === parseInt(expertId)
        );

        const ocupadosPorFecha = {};

        turnosDelExperto.forEach((appt) => {
          const date = parseISO(appt.date);
          const fechaKey = format(date, "yyyy-MM-dd");

          const bloques = [];
          const duracion = appt.tiempo;
          const cantidadBloques = Math.ceil(duracion / 60);

          for (let i = 0; i < cantidadBloques; i++) {
            const bloque = addMinutes(date, i * 60);
            bloques.push(format(bloque, "HH:mm"));
          }

          if (!ocupadosPorFecha[fechaKey]) {
            ocupadosPorFecha[fechaKey] = [];
          }

          ocupadosPorFecha[fechaKey].push(...bloques);
        });

        setOcupados(ocupadosPorFecha);
      } catch (error) {
        console.error("❌ Error al obtener turnos:", error);
      }
    };

    fetchAppointments();
  }, [expertId]);

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(
        `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`
      );
      setFecha(dateTime);
      navigate("/datos");
    }
  };

  const horariosOcupadosHoy =
    (selectedDate && ocupados[format(selectedDate, "yyyy-MM-dd")]) || [];

  return (
    <div className="fecha-container">
      <h2>Selecciona una fecha para {experto?.name}</h2>
      <p>Servicio: {servicio?.name}</p>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        minDate={new Date()}
        locale="es-ES"
        tileClassName={({ date }) =>
          isSameDay(date, new Date()) ? "today-day" : ""
        }
      />

      {selectedDate && (
        <>
          <label className="label">Selecciona un horario:</label>
          <div className="horarios-grid">
            {horariosDisponibles.map((hora) => {
              const ocupado = horariosOcupadosHoy.includes(hora);
              return (
                <button
                  key={hora}
                  className={`horario-btn ${
                    selectedTime === hora ? "activo" : ""
                  }`}
                  onClick={() => setSelectedTime(hora)}
                  disabled={ocupado}
                >
                  {hora} {ocupado ? "⛔" : ""}
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="container-continue-button">
        <button
          className="continue-button"
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default Fecha;
