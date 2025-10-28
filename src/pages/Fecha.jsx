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
  const [horariosExpert, setHorariosExpert] = useState([]);

  useEffect(() => {
    const fetchHorariosExpert = async () => {
      try {
        const res = await axios.get(
          `https://eve-back.vercel.app/hours/expert/${expertId}`
        );
        console.log("🕒 Horarios del experto:", res.data);
        setHorariosExpert(res.data);
      } catch (error) {
        console.error("❌ Error al obtener horarios del experto:", error);
      }
    };

    if (expertId) {
      fetchHorariosExpert();
    }
  }, [expertId]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("https://eve-back.vercel.app/appointments");
        const allAppointments = res.data.appointments;

        const turnosDelExperto = allAppointments.filter(
          (appt) =>
            appt.expertId === parseInt(expertId) &&
            (appt.payStatus === "paid" || appt.payStatus === "partial")
        );

        const ocupadosPorFecha = {};

        turnosDelExperto.forEach((appt) => {
          const date = parseISO(appt.date);
          const fechaKey = format(date, "yyyy-MM-dd");

          const bloques = [];
          const duracion = appt.tiempo;

          let bloqueInicio = new Date(date);
          const bloqueFin = addMinutes(bloqueInicio, duracion);

          while (bloqueInicio < bloqueFin) {
            bloques.push(format(bloqueInicio, "HH:mm"));
            bloqueInicio = addMinutes(bloqueInicio, 30); // Paso de 30 mins para marcar ocupación parcial
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

  /* const getHorariosDisponiblesParaFecha = () => {
  if (!selectedDate) return [];

  const diaSeleccionado = format(selectedDate, "yyyy-MM-dd");
  const horario = horariosExpert.find((h) => h.day === diaSeleccionado);

const expertoTurnoCorto = expertId === "3" || expertId === "6";
const intervaloMinutos = expertoTurnoCorto
  ? 20
  : servicio?.category?.toLowerCase() === "manicuria"
  ? 90
  : servicio?.category?.toLowerCase() === "pestañas"
  ? 120
  : 60;

  const horaInicio = horario
    ? parseInt(horario.openTime.split(":")[0], 10)
    : 8;
  const horaFin = horario
    ? parseInt(horario.closeTime.split(":")[0], 10)
    : 20;

  const horarios = [];

  let actual = new Date();
  actual.setHours(horaInicio, 0, 0, 0);

  const fin = new Date();
  fin.setHours(horaFin, 0, 0, 0);

  // Duración real del servicio
  const duracionServicio = servicio?.tiempo || intervaloMinutos;

  while (addMinutes(actual, duracionServicio) <= fin) {
    const horaInicioStr = format(actual, "HH:mm");
    const bloquesNecesarios = [];

    let bloqueTemp = new Date(actual);
    const finTurno = addMinutes(bloqueTemp, duracionServicio);

    let bloqueLibre = true;
    while (bloqueTemp < finTurno) {
      const bloqueStr = format(bloqueTemp, "HH:mm");
      bloquesNecesarios.push(bloqueStr);
      if (horariosOcupadosHoy.includes(bloqueStr)) {
        bloqueLibre = false;
        break;
      }
      bloqueTemp = addMinutes(bloqueTemp, 30);
    }

    if (bloqueLibre) {
      horarios.push(horaInicioStr);
      // Solo avanzo al siguiente bloque si este fue posible
      actual = addMinutes(actual, intervaloMinutos);
    } else {
      // Si no entra, avanzá 30 min (así no queda espacio muerto)
      actual = addMinutes(actual, expertoTurnoCorto ? 20 : 30);
    }
  }

  return horarios;
}; */

  const getHorariosDisponiblesParaFecha = () => {
    if (!selectedDate) return [];

    const diaSeleccionado = format(selectedDate, "yyyy-MM-dd");
    const horario = horariosExpert.find((h) => h.day === diaSeleccionado);

    // Si no hay horario definido para ese día → no mostrar nada
    if (!horario) return [];

    const expertoTurnoCorto = expertId === "3" || expertId === "6";
    const intervaloMinutos = expertoTurnoCorto
      ? 20
      : servicio?.category?.toLowerCase() === "manicuria"
      ? 90
      : servicio?.category?.toLowerCase() === "pestañas"
      ? 120
      : 60;

    //const horaInicio = parseInt(horario.openTime.split(":")[0], 10);
    const [horaInicio, minutosInicio] = horario.openTime
      .split(":")
      .map((v) => parseInt(v, 10));

    const horaFin = parseInt(horario.closeTime.split(":")[0], 10);

    const horarios = [];

    let actual = new Date();
    //actual.setHours(horaInicio, 0, 0, 0);
    actual.setHours(horaInicio, minutosInicio, 0, 0);

    const fin = new Date();
    fin.setHours(horaFin, 0, 0, 0);

    const duracionServicio = servicio?.tiempo || intervaloMinutos;

    while (addMinutes(actual, duracionServicio) <= fin) {
      const horaInicioStr = format(actual, "HH:mm");

      let bloqueTemp = new Date(actual);
      const finTurno = addMinutes(bloqueTemp, duracionServicio);

      let bloqueLibre = true;
      while (bloqueTemp < finTurno) {
        const bloqueStr = format(bloqueTemp, "HH:mm");
        if (horariosOcupadosHoy.includes(bloqueStr)) {
          bloqueLibre = false;
          break;
        }
        bloqueTemp = addMinutes(bloqueTemp, 30);
      }

      if (bloqueLibre) {
        horarios.push(horaInicioStr);
        actual = addMinutes(actual, intervaloMinutos);
      } else {
        actual = addMinutes(actual, expertoTurnoCorto ? 20 : 30);
      }
    }

    return horarios;
  };

  const userId = Number(localStorage.getItem("userId"));
  const esAutorizado = [
    1, 2, 3, 4, 5, 7, 10, 45, 47, 82, 84, 85, 89, 124, 125, 126, 128, 90, 162,
    163, 164, 165, 166, 168, 169, 170, 49, 173, 167, 3, 178, 180, 11, 104, 185,
    191, 192, 195, 196, 197, 198, 201, 205, 207, 208, 211, 210, 212, 214, 217,
    221, 223, 226, 227, 228, 229, 44, 187, 232,
  ].includes(userId);
  console.log("🔑 Usuario autorizado para diciembre:", esAutorizado);
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
        tileDisabled={({ date }) => {
          const mes = date.getMonth(); // enero=0 ... diciembre=11
          return mes === 11 && !esAutorizado;
        }}
      />

      {selectedDate && (
        <>
          <label className="label">Selecciona un horario:</label>
          <div className="horarios-grid">
            {getHorariosDisponiblesParaFecha().length === 0 ? (
              <p>
                Ya no hay turnos disponibles en esta fecha con {experto?.name}.
              </p>
            ) : (
              getHorariosDisponiblesParaFecha().map((hora) => {
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
              })
            )}
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
