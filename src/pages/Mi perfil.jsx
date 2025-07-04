import { useEffect, useState } from "react";
import axios from "axios";
import "./perfil.css"

const Perfil = () => {
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

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
        setAppointments(apptsRes.data.appointments);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <p className="p-4 text-center text-gray-600">Cargando datos...</p>;

  if (!userId) return <p className="p-4 text-center text-red-500">No se encontró usuario logueado.</p>;

  return (
<div className="perfil-container">

  <div className="perfil-card">
    <h2>Perfil de usuario</h2>
    <div className="perfil-datos">
      <p><span>Nombre:</span> {userData.name}</p>
      <p><span>Email:</span> {userData.email}</p>
      <p><span>Teléfono:</span> {userData.phone}</p>
    </div>
  </div>

  <h2 className="turnos-title">Mis turnos</h2>

  {appointments.length === 0 ? (
    <p className="mensaje-vacio">No tenés turnos reservados.</p>
  ) : (
    appointments.map((appt) => (
      <div key={appt.id} className="turno-card">
        <p><span>Servicio:</span> {appt.Service.name}</p>
        <p><span>Especialista:</span> {appt.Expert.name}</p>
        <p><span>Fecha:</span> {new Date(appt.date).toLocaleString("es-AR", { dateStyle: "full", timeStyle: "short" })}</p>
        <p><span>Estado de pago:</span> {appt.payStatus}</p>
      </div>
    ))
  )}
</div>

  );
};

export default Perfil;
