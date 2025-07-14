import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./ExpertAppointments.css";

const ExpertAppointments = () => {
  const { expertId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("https://eve-back.vercel.app/appointments");
        const allAppointments = res.data.appointments;

        // 🔍 Filtrar por experto y solo si el pago fue "paid" o "partial"
     const expertIdNum = Number(expertId);

// Relaciones cruzadas
const expertPairs = {
  3: [3, 6],
  6: [3, 6],
  2: [2, 7],
  7: [2, 7],
};

// Lista de IDs que puede ver este experto
const allowedExpertIds = expertPairs[expertIdNum] || [expertIdNum];

const now = new Date();
const twoDaysAgo = new Date();
twoDaysAgo.setDate(now.getDate() - 2);

const filtered = allAppointments.filter((appt) => {
  const appointmentDate = new Date(appt.date);
  return (
    allowedExpertIds.includes(appt.expertId) &&
    (appt.payStatus === "paid" || appt.payStatus === "partial") &&
    appointmentDate >= twoDaysAgo
  );
});



        setAppointments(filtered);
      } catch (error) {
        console.error("❌ Error al obtener los turnos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [expertId]);

  const formatDateTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="expert-appointments">
      <h2>📋 Turnos del Experto</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : appointments.length === 0 ? (
        <p>No hay turnos pagos o parcialmente pagos para este experto.</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt.id} className="appointment-card">
              <div className="appointment-date">
                📅 {formatDateTime(appt.date)}
              </div>
              <p><strong>Cliente:</strong> {appt.User?.name || "Desconocido"}</p>
              <p><strong>Servicio:</strong> {appt.Service?.name}</p>
              <p><strong>Duración:</strong> {appt.Service?.duration} min</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpertAppointments;
