import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, isSameDay, addMinutes } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./perfil.css";
import ComentarioForm from "../components/comentarios";

const Perfil = () => {
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Estado para edición de fecha/hora dentro del perfil
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [ocupados, setOcupados] = useState({});
  const [horariosExpert, setHorariosExpert] = useState([]);

  const userId = localStorage.getItem("userId");

  // Carga datos usuario y turnos
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userRes = await axios.get(`https://eve-back.vercel.app/users/${userId}`);
        setUserData(userRes.data);

        const apptsRes = await axios.get(`https://eve-back.vercel.app/appointments/user/${userId}`);
        console.log(apptsRes)
        setAppointments(apptsRes.data.appointments);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Cuando empieza edición, carga horarios del experto y ocupados para ese experto
  useEffect(() => {
    if (editingId === null) return;

    const appt = appointments.find((a) => a.id === editingId);
    if (!appt) return;
console.log(appt)
    const expertId = appt.Expert.id;

    const fetchHorariosExpert = async () => {
      try {
        const res = await axios.get(`https://eve-back.vercel.app/hours/expert/${expertId}`);
        console.log(res.data )
        setHorariosExpert(res.data);
      } catch (error) {
        console.error("Error al obtener horarios del experto:", error);
        setHorariosExpert([]);
      }
    };

    const fetchAppointmentsExpert = async () => {
      try {
        const res = await axios.get("https://eve-back.vercel.app/appointments");
        const allAppointments = res.data.appointments;

        const turnosDelExperto = allAppointments.filter(
          (appt) => appt.expertId === expertId && appt.id !== editingId // excluye el turno que editas
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
        console.error("Error al obtener turnos:", error);
        setOcupados({});
      }
    };

    fetchHorariosExpert();
    fetchAppointmentsExpert();

    // Inicializar selectedDate y selectedTime con la fecha actual del turno
    setSelectedDate(parseISO(appt.date));
    setSelectedTime(format(parseISO(appt.date), "HH:mm"));

  }, [editingId, appointments]);

  // Función para ver si se puede editar un turno (queda más de 48 hs)
  const canEditAppointment = (dateStr) => {
    const now = new Date();
    const apptDate = new Date(dateStr);
    const diffHours = (apptDate - now) / (1000 * 60 * 60);
    return diffHours > 48;
  };

  // Calcula horarios disponibles para el experto según su horario y lo ocupado
  const getHorariosDisponiblesParaFecha = () => {
    if (!selectedDate) return [];

    const diaSeleccionado = format(selectedDate, "yyyy-MM-dd");
    const horario = horariosExpert.find((h) => h.day === diaSeleccionado);

    let disponibles = [];

    if (!horario) {
      // Horario por defecto 08:00 a 20:00 (13 hs)
      disponibles = Array.from({ length: 13 }, (_, i) => {
        const hour = 8 + i;
        return `${hour.toString().padStart(2, "0")}:00`;
      });
    } else {
      const start = parseInt(horario.openTime.split(":")[0], 10);
      const end = parseInt(horario.closeTime.split(":")[0], 10);
      const cantidad = end - start;

      disponibles = Array.from({ length: cantidad }, (_, i) => {
        const hour = start + i;
        return `${hour.toString().padStart(2, "0")}:00`;
      });
    }

    const ocupadosHoy = ocupados[diaSeleccionado] || [];

    // Filtrar los horarios ocupados
    return disponibles.filter((hora) => !ocupadosHoy.includes(hora));
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Debes seleccionar fecha y hora");
      return;
    }

    const fechaNueva = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`
    );

    // Validar que la nueva fecha esté más de 48 hs en el futuro
    if (!canEditAppointment(fechaNueva.toISOString())) {
      alert("La nueva fecha debe ser al menos 48 horas en el futuro.");
      return;
    }

    try {
      await axios.put(`https://eve-back.vercel.app/appointments/${editingId}`, {
        date: fechaNueva.toISOString(),
      });

      // Actualizar localmente la lista de turnos
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === editingId ? { ...appt, date: fechaNueva.toISOString() } : appt
        )
      );

      setEditingId(null);
      setSelectedDate(null);
      setSelectedTime("");
      setHorariosExpert([]);
      setOcupados({});
      alert("Turno actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar turno:", error);
      alert("No se pudo actualizar el turno");
    }
  };

  if (loading) return <p className="p-4 text-center text-gray-600">Cargando datos...</p>;

  if (!userId) return <p className="p-4 text-center text-red-500">No se encontró usuario logueado.</p>;
console.log(appointments.payStatus)
const turnosParciales = appointments.filter(
  (appt) => appt.payStatus === "partial"
);
  return (
    <div className="perfil-container" style={{marginLeft:"-10px"}}>
      <div className="perfil-card">
        <h2>Perfil de usuario</h2>
        <div className="perfil-datos">
          <p><span>Nombre:</span> {userData?.name}</p>
          <p><span>Email:</span> {userData?.email}</p>
          <p><span>Teléfono:</span> {userData?.phone}</p>
        </div>
      </div>

      <h2 className="turnos-title">Mis turnos</h2>

    {turnosParciales.length === 0 ? (
  <p className="mensaje-vacio">No tenés turnos reservados aun.</p>
) : (
  turnosParciales.map((appt) => (
          <div key={appt.id} className="turno-card">
            <p><span>Servicio:</span> {appt.Service.name}</p>
            <p><span>Especialista:</span> {appt.Expert.name}</p>
            <p>
              <span>Fecha:</span>{" "}
              {editingId === appt.id ? (
                <>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    locale="es-ES"
                    tileClassName={({ date }) =>
                      isSameDay(date, new Date()) ? "today-day" : ""
                    }
                  />
                  <div className="horarios-grid" style={{ marginTop: "10px" }}>
                    {getHorariosDisponiblesParaFecha().map((hora) => (
                      <button
                        key={hora}
                        className={`horario-btn ${selectedTime === hora ? "activo" : ""}`}
                        onClick={() => setSelectedTime(hora)}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
<div
  style={{
    marginTop: "20px",
    display: "flex",
    gap: "16px",
    justifyContent: "center", // 👉 centra los botones horizontalmente
    alignItems: "center",
  }}
>
  <button
    onClick={handleSave}
    disabled={!selectedTime}
    style={{
      background: selectedTime
        ? "linear-gradient(90deg, #C0A439, #E6C55A)"
        : "#ccc",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "8px",
      cursor: selectedTime ? "pointer" : "not-allowed",
      opacity: selectedTime ? 1 : 0.6,
      transition: "all 0.3s ease",
      fontWeight: "bold",
      boxShadow: selectedTime
        ? "0 3px 8px rgba(192, 164, 57, 0.4)"
        : "none",
    }}
  >
    Guardar
  </button>

  <button
    onClick={() => {
      setEditingId(null);
      setSelectedDate(null);
      setSelectedTime("");
      setHorariosExpert([]);
      setOcupados({});
    }}
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      color: "#333",
      padding: "10px 20px",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: "bold",
      backdropFilter: "blur(4px)",
      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    Cancelar
  </button>
</div>


                </>
              ) : (
                new Date(appt.date).toLocaleString("es-AR", { dateStyle: "full", timeStyle: "short" })
              )}
            </p>
            <p><span>Estado de pago:</span> {appt.payStatus}</p>

            {editingId !== appt.id && canEditAppointment(appt.date) && (
              <button onClick={() => setEditingId(appt.id)}>Editar fecha</button>
            )}
          </div>
        ))
      )}
      <ComentarioForm></ComentarioForm>
    </div>
  );
};

export default Perfil;
