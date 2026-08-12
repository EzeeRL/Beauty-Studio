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
    <div className="turnos-section-stack">
      <section className="calendar-section section-card">
        <h2>Calendario</h2>
        <Calendar onChange={setSelectedDate} value={selectedDate} />
      </section>

      <section className="day-appointments section-card">
        <h2>Turnos para {format(selectedDate, "dd/MM/yyyy")}</h2>
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

      <section className="all-appointments section-card">
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
    </div>
  );
};

export default TurnosSection;
