import { useEffect, useState } from "react";
import axios from "axios";

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
    <div className="p-6 max-w-4xl mx-auto min-h-screen
      bg-white/30 backdrop-blur-md border border-yellow-400 rounded-xl shadow-lg
      text-gray-900 font-sans"
    >
      {/* Datos del usuario */}
      {userData && (
        <div className="mb-8 p-6 rounded-xl
          bg-white/40 backdrop-blur-sm border border-yellow-300
          shadow-md"
        >
          <h2 className="text-3xl font-extrabold mb-5 text-yellow-600 drop-shadow-md">
            Perfil de usuario
          </h2>
          <p className="mb-2 text-lg"><strong>Nombre:</strong> {userData.name}</p>
          <p className="mb-2 text-lg"><strong>Email:</strong> {userData.email}</p>
          <p className="mb-2 text-lg"><strong>Teléfono:</strong> {userData.phone || "No disponible"}</p>
        </div>
      )}

      {/* Turnos */}
      <h2 className="text-2xl font-semibold mb-6 text-yellow-600 drop-shadow-md">Mis turnos</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-700 italic">No tenés turnos reservados.</p>
      ) : (
        <div className="grid gap-6">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="border border-yellow-300 rounded-xl p-5
                bg-white/40 backdrop-blur-sm
                shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <p className="mb-1 text-lg"><strong>Servicio:</strong> {appt.Service.name}</p>
              <p className="mb-1 text-lg"><strong>Especialista:</strong> {appt.Expert.name}</p>
              <p className="mb-1 text-lg">
                <strong>Fecha:</strong>{" "}
                {new Date(appt.date).toLocaleString("es-AR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              <p className="mb-1 text-lg"><strong>Estado de pago:</strong> {appt.payStatus}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Perfil;
