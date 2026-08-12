import { useState } from "react";
import { format } from "date-fns";
import "./grupedTurno.css";

const agruparPorEspecialidad = (appointments) => {
  return appointments.reduce((acc, app) => {
    const specialty = app.Expert.specialty || "Sin Especialidad";
    if (!acc[specialty]) acc[specialty] = [];
    acc[specialty].push(app);
    return acc;
  }, {});
};

const GroupedTurnosTable = ({
  data,
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
  const [expandedSpecialties, setExpandedSpecialties] = useState({});

  const toggleSpecialty = (specialty) => {
    setExpandedSpecialties((prev) => ({
      ...prev,
      [specialty]: !prev[specialty],
    }));
  };

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const recentAppointments = data.filter((app) => new Date(app.date) >= oneDayAgo);

  const grouped = agruparPorEspecialidad(recentAppointments);
  const specialties = Object.entries(grouped);

  if (specialties.length === 0) {
    return <p className="no-turnos">No hay próximos turnos.</p>;
  }

  return (
    <div className="grouped-turnos">
      {specialties.map(([specialty, appointments]) => {
        const isOpen = !!expandedSpecialties[specialty];
        return (
          <div key={specialty} className="specialty-group">
            <button
              onClick={() => toggleSpecialty(specialty)}
              className={`specialty-toggle ${isOpen ? "open" : ""}`}
            >
              <span className="specialty-toggle-chevron">▶</span>
              <span className="specialty-toggle-name">{specialty}</span>
              <span className="specialty-toggle-count">{appointments.length}</span>
            </button>

            {isOpen && (
              <div className="appointments-container">
                {appointments.map((app) => {
                  const upcoming = isUpcoming(app.date);
                  return (
                    <div
                      key={app.id}
                      className={`appointment-card ${upcoming ? "upcoming" : ""}`}
                    >
                      <div className="card-header">
                        <span className="card-date">
                          {format(new Date(app.date), "dd/MM/yyyy")}
                        </span>
                        <span className="card-time">
                          {format(new Date(app.date), "HH:mm")} hs
                        </span>
                      </div>

                      <div className="card-body">
                        <div className="card-row">
                          <span className="card-label">💅 Servicio</span>
                          <span className="card-value">{app.Service.name}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-label">👩‍🎓 Experto</span>
                          <span className="card-value">{app.Expert.name}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-label">🙍 Usuario</span>
                          <span className="card-value">{app.User.name}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-label">📞 Teléfono</span>
                          <span className="card-value">{app.User.phone}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-label">💵 Precio</span>
                          <span className="card-value">${app.Service.price}</span>
                        </div>
                        <div className="card-row">
                          <span className="card-label">📌 Estado</span>
                          <span className="card-value">
                            {editingId === app.id ? (
                              <select
                                value={editingPayStatus}
                                onChange={(e) => setEditingPayStatus(e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="pagado">Pagado</option>
                              </select>
                            ) : (
                              <span className={`pay-badge ${app.payStatus}`}>
                                {app.payStatus}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="appointment-actions">
                        {editingId === app.id ? (
                          <>
                            <button className="btn save" onClick={() => saveEdit(app.id)}>
                              Guardar
                            </button>
                            <button className="btn cancel" onClick={cancelEdit}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn edit"
                              onClick={() => startEdit(app.id, app.payStatus)}
                            >
                              ✏️ Editar
                            </button>

                            {upcoming && (
                              <button
                                className="btn whatsapp"
                                onClick={() =>
                                  sendWhatsApp(
                                    app.User.phone,
                                    app.User.name,
                                    app.date,
                                    app.id,
                                    app.Expert.specialty,
                                  )
                                }
                                disabled={app.reminderStatus === "enviado"}
                              >
                                📲 WhatsApp
                              </button>
                            )}

                            <button
                              className="btn delete"
                              onClick={() => {
                                setAppointmentToDelete(app.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              🗑️ Eliminar
                            </button>
                          </>
                        )}
                      </div>

                      {app.reminderStatus === "enviado" && (
                        <span className="status-sent">📤 Recordatorio enviado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupedTurnosTable;
