import { useEffect, useState ,useMemo} from "react";
import axios from "axios";
import { format, compareAsc, differenceInHours } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './AdminPanel.css';
import ServiceManager from "../components/AdminEdit";
import ExpertManager from "../components/adminExpert";

const AdminPanel = () => {
  const [appointments, setAppointments] = useState([]);
const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
const [activeTab, setActiveTab] = useState("turnos");
  const [workingHours, setWorkingHours] = useState({});
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("20:00");
  const [editingId, setEditingId] = useState(null);
  const [editingPayStatus, setEditingPayStatus] = useState("");
  const [expertId, setExpertId] = useState(""); // ID del experto
  const [experts, setExperts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [appointmentToDelete, setAppointmentToDelete] = useState(null);


useEffect(() => {
  axios
    .get("https://eve-back.vercel.app/experts")
    .then((res) => setExperts(res.data))
    .catch((err) => console.error("Error al cargar expertos:", err));
}, []);

  useEffect(() => {
    axios
      .get("https://eve-back.vercel.app/appointments")
      .then((res) => setAppointments(res.data.appointments))
      .catch((err) => console.error("Error cargando turnos:", err));
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

  const calcularIngresosPorServicio = useMemo(() => {
    const acumulador = {};

    appointments.forEach((app) => {
      const name = app.Service.name;
      const price = app.Service.price;
      acumulador[name] = (acumulador[name] || 0) + price;
    });

    return Object.entries(acumulador).map(([name, value]) => ({ name, value }));
  }, [appointments]);

const handleHorarioChange = async () => {
  if (!expertId) {
    alert("Seleccioná un experto antes de guardar el horario.");
    return;
  }

  try {
    const response = await axios.post("https://eve-back.vercel.app/hours", {
      day: selectedDate,
      openTime: startHour,
      closeTime: endHour,
      expertId: Number(expertId),
    });
console.log({
      day: selectedDate,
      openTime: startHour,
      closeTime: endHour,
      expertId: Number(expertId),
    })
    setWorkingHours((prev) => ({
      ...prev,
      [selectedDate]: { start: startHour, end: endHour },
    }));

    alert("Horario guardado exitosamente.");
  } catch (error) {
    console.error("❌ Error al crear horario:", error);
    alert("Error al guardar el horario.");
  }
};


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

  const filteredAppointments = appointments.filter(
    (app) => format(new Date(app.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const startEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditingPayStatus(currentStatus);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingPayStatus("");
  };

  const saveEdit = (id) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, payStatus: editingPayStatus } : app))
    );
    setEditingId(null);
    setEditingPayStatus("");
  };

const sendWhatsApp = async (phone, userName, date, appointmentId, serviceName) => {
  const dia = format(new Date(date), "dd/MM/yyyy");
  const hora = format(new Date(date), "HH:mm");

  // Mensajes personalizados por servicio
  const mensajesPorServicio = {
    manicuria: `
RECORDATORIO DE TURNO - MANICURÍA

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Confirmar asistencia 72hs antes o se cancela el turno.
Indicar qué se hacen y el diseño para darles el precio. No se aceptan cambios el mismo día si es más complejo

🚫 Sin acompañantes.

💵 Se pierde la seña si:
* No se confirma el turno o la inasistencia con 72hs de antelación.
* Llegan tarde (+10 min).
* Si llegan tarde y quieren ser atendidas (solo si es posible), deberán abonar el total del servicio.

Gracias 💕 ¡Nos vemos pronto ${userName}! ✨`,

    pestañas: `
RECORDATORIO DE TURNO - PESTAÑAS

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. (Pierden garantía)
Confirmar asistencia 72hs antes o se cancela.
Indicar qué se hacen. No se aceptan cambios ese día.

🚫 Sin acompañantes.

💵 Se pierde la seña si:
* No se confirma o se avisa con menos de 72hs.
* Llegan tarde (+10min).
* Si llegan tarde y quieren ser atendidas (si hay disponibilidad), abonan el total.

¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,

    cejas: `
RECORDATORIO DE TURNO - CEJAS

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. (Pierden garantía)
Confirmar asistencia 72hs antes o se cancela.
Indicar qué se hacen. No se aceptan cambios ese día.

🚫 Sin acompañantes.

💵 Se pierde la seña si:
* No se confirma o se avisa con menos de 72hs.
* Llegan tarde (+10min).
* Si llegan tarde y quieren ser atendidas (si hay disponibilidad), abonan el total.

¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,

    cosmetologia: `
RECORDATORIO DE TURNO - COSMETOLOGÍA

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. En lo posible evitar la depilación facial 48 horas antes.
Confirmar asistencia 72hs antes o se cancela.
Indicar qué se hacen. No se aceptan cambios ese día.

🚫 Sin acompañantes.

💵 Se pierde la seña si:
* No se confirma o se avisa con menos de 72hs.
* Llegan tarde (+10min).
* Si llegan tarde y quieren ser atendidas (si hay disponibilidad), abonan el total.

¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,
  };

  const clave = serviceName.toLowerCase();
  const rawMessage = mensajesPorServicio[clave] || `Hola ${userName}, te recordamos tu turno el ${dia} a las ${hora}.`;

  const msg = encodeURIComponent(rawMessage);
  const phoneClean = phone.replace(/\D/g, "");
  const url = `https://wa.me/${phoneClean}?text=${msg}`;
  window.open(url, "_blank");

  try {
    await axios.put(`https://eve-back.vercel.app/appointments/${appointmentId}`, {
      reminderStatus: "enviado",
    });

    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, reminderStatus: "enviado" } : app
      )
    );
  } catch (err) {
    console.error("❌ Error al actualizar reminderStatus:", err);
  }
};


const deleteAppointment = async (appointmentId) => {
  const confirmDelete = window.confirm("¿Estás seguro que querés eliminar este turno?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`https://eve-back.vercel.app/appointments/${appointmentId}`);
    setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
    alert("Turno eliminado correctamente.");
  } catch (err) {
    console.error("❌ Error al eliminar el turno:", err);
    alert("Hubo un error al eliminar el turno.");
  }
};


const TurnosTable = ({ data }) =>
  data.length === 0 ? (
    <p>No hay turnos para mostrar.</p>
  ) : (
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
            <tr
              key={app.id}
              className={upcoming ? "upcoming" : ""}
            >
              <td data-label="Fecha">{format(new Date(app.date), "dd/MM/yyyy")}</td>
              <td data-label="Hora">{format(new Date(app.date), "HH:mm")}</td>
              <td data-label="Servicio">{app.Service.name}</td>
              <td data-label="Experto">{app.Expert.name}</td>
              <td data-label="Usuario">{app.User.name}</td>
              <td data-label="Teléfono">{app.User.phone}</td>
              <td data-label="Precio">${app.Service.price}</td>
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
              <td data-label="Acciones">
                {editingId === app.id ? (
                  <>
                    <button className="save" onClick={() => saveEdit(app.id)}>Guardar</button>
                    <button className="cancel" onClick={cancelEdit}>Cancelar</button>
                  </>
                ) : (
                  <>
<button className="btn edit" onClick={() => startEdit(app.id, app.payStatus)}>
  ✏️ Editar
</button>

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
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

 return (
  <div className="admin-panel">
    <h1>Panel de Administración</h1>

    {/* Navegación tipo pestañas */}
    <div className="tab-nav">
      <button onClick={() => setActiveTab("turnos")} className={activeTab === "turnos" ? "active" : ""}>📅 Turnos</button>
      <button onClick={() => setActiveTab("horarios")} className={activeTab === "horarios" ? "active" : ""}>🕒 Horarios</button>
      <button onClick={() => setActiveTab("ingresos")} className={activeTab === "ingresos" ? "active" : ""}>📊 Ingresos</button>
      <button onClick={() => setActiveTab("admin")} className={activeTab === "admin" ? "active" : ""}>🛠️ Servicios y Expertos</button>
    </div>

    {/* Sección: Turnos */}
    {activeTab === "turnos" && (
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
            deleteAppointment={deleteAppointment}
          />
        </section>

        <section className="all-appointments" style={{ marginBottom: "3rem" }}>
          <h2>Todos los turnos (los próximos en amarillo)</h2>
          <TurnosTable
            data={sortedAppointments}
            editingId={editingId}
            editingPayStatus={editingPayStatus}
            setEditingPayStatus={setEditingPayStatus}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            saveEdit={saveEdit}
            sendWhatsApp={sendWhatsApp}
            isUpcoming={isUpcoming}
            deleteAppointment={deleteAppointment}
          />
        </section>
      </>
    )}

    {/* Sección: Horarios */}
    {activeTab === "horarios" && (
      <section className="schedule-config">
        <h2>Configurar horario de atención</h2>
        <div className="inputs-row">
          <div className="input-group">
            <label htmlFor="date">Fecha</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="start">Inicio</label>
            <input
              id="start"
              type="time"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="end">Cierre</label>
            <input
              id="end"
              type="time"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="expertId">Experto</label>
            <div className="select-wrapper">
              <select
                id="expertId"
                className="custom-select"
                value={expertId}
                onChange={(e) => setExpertId(e.target.value)}
              >
                <option value="">Seleccionar experto</option>
                {experts.map((expert) => (
                  <option key={expert.id} value={expert.id}>
                    {expert.name} ({expert.specialty})
                  </option>
                ))}
              </select>
              <svg className="select-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <button className="btn-save" onClick={handleHorarioChange}>
            Guardar
          </button>
        </div>

        <p className="horario-text">
          Horario para {format(selectedDate, "dd/MM/yyyy")}:{" "}
          {workingHours[format(selectedDate, "yyyy-MM-dd")]?.start || "No definido"} -{" "}
          {workingHours[format(selectedDate, "yyyy-MM-dd")]?.end || "No definido"}
        </p>
      </section>
    )}

    {/* Sección: Ingresos */}
    {activeTab === "ingresos" && (
      <section>
        <h2>Ingresos históricos por servicio</h2>
        <div style={{ width: "100%", maxWidth: "600px", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={calcularIngresosPorServicio}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {calcularIngresosPorServicio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    )}

    {/* Sección: Servicios y expertos */}
    {activeTab === "admin" && (
      <>
        <ServiceManager />
        <ExpertManager />
      </>
    )}

    {/* Modal de eliminación */}
    {showDeleteModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            animation: "fadeIn 0.3s ease",
            maxWidth: "400px",
            width: "90%",
          }}
        >
          <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
            ¿Estás seguro que querés eliminar este turno?
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                try {
                  await axios.delete(`https://eve-back.vercel.app/appointments/${appointmentToDelete}`);
                  setAppointments((prev) => prev.filter((a) => a.id !== appointmentToDelete));
                  setShowDeleteModal(false);
                  setAppointmentToDelete(null);
                } catch (err) {
                  console.error("❌ Error al eliminar el turno:", err);
                  alert("Hubo un error al eliminar el turno.");
                }
              }}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default AdminPanel;
