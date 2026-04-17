import { useEffect, useState } from "react";
import { compareAsc, differenceInHours } from "date-fns";
import axios from "axios";

const API = "https://eve-back.vercel.app";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/appointments`)
      .then((res) => {
        const onlyPaidOrPartial = res.data.appointments.filter(
          (app) => app.payStatus === "paid" || app.payStatus === "partial",
        );
        setAppointments(onlyPaidOrPartial);
      })
      .catch((err) => console.error("Error cargando turnos:", err));
  }, []);

  const isUpcoming = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffHours = differenceInHours(date, now);
    return diffHours >= 0 && diffHours <= 48;
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const aUpcoming = isUpcoming(a.date);
    const bUpcoming = isUpcoming(b.date);
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    return compareAsc(new Date(a.date), new Date(b.date));
  });

  const deleteAppointment = async (appointmentId) => {
    try {
      await axios.delete(`${API}/appointments/${appointmentId}`);
      setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
    } catch (err) {
      console.error("❌ Error al eliminar el turno:", err);
      alert("Hubo un error al eliminar el turno.");
    }
  };

  const updatePayStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, payStatus: newStatus } : app,
      ),
    );
  };

  const markReminderSent = (appointmentId) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, reminderStatus: "enviado" } : app,
      ),
    );
  };

  return {
    appointments,
    setAppointments,
    sortedAppointments,
    isUpcoming,
    deleteAppointment,
    updatePayStatus,
    markReminderSent,
  };
};
