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

const recentAppointments = data.filter(app => new Date(app.date) >= oneDayAgo);

const grouped = agruparPorEspecialidad(recentAppointments);


  return (
    <div>
      {Object.entries(grouped).map(([specialty, appointments]) => (
        <div key={specialty} style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => toggleSpecialty(specialty)}
            className="specialty-toggle"
          >
            {expandedSpecialties[specialty] ? "▼" : "▶"} {specialty} ({appointments.length})
          </button>

          {expandedSpecialties[specialty] && (
            <div className="appointments-container">
              {appointments.map((app) => {
                const upcoming = isUpcoming(app.date);
                return (
                  <div key={app.id} className={`appointment-card ${upcoming ? "upcoming" : ""}`}>
                    <div><span>📅 Fecha:</span> {format(new Date(app.date), "dd/MM/yyyy")}</div>
                    <div><span>⏰ Hora:</span> {format(new Date(app.date), "HH:mm")}</div>
                    <div><span>💅 Servicio:</span> {app.Service.name}</div>
                    <div><span>👩‍🎓 Experto:</span> {app.Expert.name}</div>
                    <div><span>🙍 Usuario:</span> {app.User.name}</div>
                    <div><span>📞 Teléfono:</span> {app.User.phone}</div>
                    <div><span>💵 Precio:</span> ${app.Service.price}</div>
                    <div>
                      <span>📌 Estado:</span>{" "}
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
                        app.payStatus
                      )}
                    </div>

                    <div className="appointment-actions">
                      {editingId === app.id ? (
                        <>
                          <button className="btn save" onClick={() => saveEdit(app.id)}>Guardar</button>
                          <button className="btn cancel" onClick={cancelEdit}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button className="btn edit" onClick={() => startEdit(app.id, app.payStatus)}>✏️ Editar</button>

                          {upcoming && (
                            <button
                              className="btn whatsapp"
                              onClick={() =>
                                sendWhatsApp(app.User.phone, app.User.name, app.date, app.id, app.Expert.specialty)
                              }
                              disabled={app.reminderStatus === "enviado"}
                            >
                              📲 WhatsApp
                            </button>
                          )}

                          {app.reminderStatus === "enviado" && (
                            <span className="status-sent">📤 Recordatorio enviado</span>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedTurnosTable;
