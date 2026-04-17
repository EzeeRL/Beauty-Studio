import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import TurnosTable from "./TurnosTable";
import GroupedTurnosTable from "./GroupedTurnosTable";
import TurnosImageGenerator from "./imagenGenerador";

const TurnosSection = ({
  appointments,
  sortedAppointments,
  selectedDate,
  setSelectedDate,
  editingId,
  editingPayStatus,
  setEditingPayStatus,
  startEdit,
  cancelEdit,
  saveEdit,
  sendWhatsApp,
  isUpcoming,
  setAppointmentToDelete,
  setShowDeleteModal,
}) => {
  const filteredAppointments = appointments.filter(
    (app) =>
      format(new Date(app.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd"),
  );

  return (
    <>
      <section className="calendar-section" style={{ marginBottom: "3rem" }}>
        <h2>Calendario y turnos por fecha</h2>
        <Calendar onChange={setSelectedDate} value={selectedDate} />
        <h3>Turnos para {format(selectedDate, "dd/MM/yyyy")}</h3>
        <TurnosTable
          data={filteredAppointments}
          editingId={editingId}
          editingPayStatus={editingPayStatus}
          setEditingPayStatus={setEditingPayStatus}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          sendWhatsApp={sendWhatsApp}
          isUpcoming={isUpcoming}
          setAppointmentToDelete={setAppointmentToDelete}
          setShowDeleteModal={setShowDeleteModal}
        />
      </section>

      <section className="all-appointments" style={{ marginBottom: "3rem" }}>
        <h2>Próximos Turnos</h2>
        <GroupedTurnosTable
          data={sortedAppointments}
          editingId={editingId}
          editingPayStatus={editingPayStatus}
          setEditingPayStatus={setEditingPayStatus}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          sendWhatsApp={sendWhatsApp}
          isUpcoming={isUpcoming}
          setAppointmentToDelete={setAppointmentToDelete}
          setShowDeleteModal={setShowDeleteModal}
        />
      </section>

      <TurnosImageGenerator />
    </>
  );
};

export default TurnosSection;
