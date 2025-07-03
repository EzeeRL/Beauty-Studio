import { useEffect, useState } from "react";
import axios from "axios";

const Perfil = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `https://eve-back.vercel.app/appointments/user/1`
        );
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error("Error al obtener turnos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  if (loading) return <p>Cargando turnos...</p>;
  if (!appointments.length) return <p>No tenés turnos reservados.</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Mis turnos</h2>
      <div className="grid gap-4">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="border rounded-xl p-4 shadow-sm bg-white"
          >
            <p>
              <strong>Servicio:</strong> {appt.Service.name}
            </p>
            <p>
              <strong>Especialista:</strong> {appt.Expert.name}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(appt.date).toLocaleString("es-AR")}
            </p>
            <p>
              <strong>Estado de pago:</strong> {appt.payStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Perfil ;
