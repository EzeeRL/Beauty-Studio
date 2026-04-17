import { format } from "date-fns";

const TurnosTable = ({
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
  if (data.length === 0) return <p>No hay turnos para mostrar.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Servicio</th>
          <th>Experto</th>
          <th>Usuario</th>
          <th>Teléfono</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((app) => {
          const upcoming = isUpcoming(app.date);
          return (
            <tr key={app.id} className={upcoming ? "upcoming" : ""}>
              <td data-label="Fecha">
                {format(new Date(app.date), "dd/MM/yyyy")}
              </td>
              <td data-label="Hora">{format(new Date(app.date), "HH:mm")}</td>
              <td data-label="Servicio">{app.Service?.name ?? "—"}</td>
              <td data-label="Experto">{app.Expert.name}</td>
              <td data-label="Usuario">{app.User.name}</td>
              <td data-label="Teléfono">{app.User.phone}</td>
              <td data-label="Precio">${app.Service?.price ?? "—"}</td>

              <td data-label="Estado">
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
              </td>

              <td data-label="Acciones" className="container-actions">
                {editingId === app.id ? (
                  <>
                    <button className="save" onClick={() => saveEdit(app.id)}>
                      Guardar
                    </button>
                    <button className="cancel" onClick={cancelEdit}>
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

                    <button
                      className="btn delete"
                      onClick={() => {
                        setAppointmentToDelete(app.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️ Eliminar
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

                    {app.reminderStatus === "enviado" && (
                      <span className="status-sent">
                        📤 Recordatorio enviado
                      </span>
                    )}
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TurnosTable;
