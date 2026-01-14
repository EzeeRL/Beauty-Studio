import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, compareAsc, differenceInHours } from "date-fns";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./AdminPanel.css";
import ServiceManager from "../components/AdminEdit";
import ExpertManager from "../components/adminExpert";
import AdminComentarios from "../components/AdminComentarios";
import GroupedTurnosTable from "../components/GroupedTurnosTable";
import HorarioManager from "../components/HorarioManager";
import LiquidacionesExpertos from "../components/LiquidacionesExpertos";
import GraficoGananciasTiempo from "../components/GraficoGananciasTiempo";
import TurnosImageGenerator from "../components/imagenGenerador";
import AddProductForm from "../components/Products";

const AdminPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
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
  const [showToast, setShowToast] = useState(false);
  const [modoGrafico, setModoGrafico] = useState("servicio"); // servicio | experto

  useEffect(() => {
    axios
      .get("https://eve-back.vercel.app/experts")
      .then((res) => setExperts(res.data))
      .catch((err) => console.error("Error al cargar expertos:", err));
  }, []);

  useEffect(() => {
    axios
      .get("https://eve-back.vercel.app/appointments")
      .then((res) => {
        const onlyPaidOrPartial = res.data.appointments.filter(
          (app) => app.payStatus === "paid" || app.payStatus === "partial"
        );
        setAppointments(onlyPaidOrPartial);
      })
      .catch((err) => console.error("Error cargando turnos:", err));
  }, []);
  console.log(appointments);

  const COLORS = [
    "#0088FE", // azul
    "#00C49F", // verde aqua
    "#FFBB28", // amarillo mostaza
    "#FF8042", // naranja
    "#AA00FF", // morado
    "#FF4444", // rojo
    "#00BFFF", // azul cielo
    "#32CD32", // verde lima
    "#FFD700", // dorado
    "#FF69B4", // rosa fuerte
    "#8B4513", // marrón oscuro
    "#4B0082", // índigo
    "#FF4500", // rojo anaranjado
    "#2E8B57", // verde mar
    "#D2691E", // chocolate
  ];

  const calcularIngresos = useMemo(() => {
    const acumulador = {};

    appointments
      .filter(
        (app) =>
          (app.payStatus === "paid" || app.payStatus === "partial") &&
          app.Service &&
          app.Expert
      )
      .forEach((app) => {
        const key =
          modoGrafico === "servicio" ? app.Expert.specialty : app.Expert.name;

        const price = app.Service?.price ?? 0;
        acumulador[key] = (acumulador[key] || 0) + price;
      });

    return Object.entries(acumulador).map(([name, value]) => ({
      name,
      value,
    }));
  }, [appointments, modoGrafico]);

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
      });
      setWorkingHours((prev) => ({
        ...prev,
        [selectedDate]: { start: startHour, end: endHour },
      }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
    (app) =>
      format(new Date(app.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
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
      prev.map((app) =>
        app.id === id ? { ...app, payStatus: editingPayStatus } : app
      )
    );
    setEditingId(null);
    setEditingPayStatus("");
  };

  const sendWhatsApp = async (
    phone,
    userName,
    date,
    appointmentId,
    serviceName
  ) => {
    const dia = format(new Date(date), "dd/MM/yyyy");
    const hora = format(new Date(date), "HH:mm");

    // Mensajes personalizados por servicio
    const mensajesPorServicio = {
      manicuria: `
RECORDATORIO DE TURNO - MANICURÍA

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Confirmar asistencia.
Mandar diseño para darles un precio. No se aceptan cambios en el día si es más complejo. 

🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48hs antes.
•⁠  ⁠Llegan tarde (pasado +10 min).
•⁠  ⁠Si llegan pasado los 10min y quieren ser atendidas, si es posible. Deberán abonar $10.000 adicionales

Gracias 💕 ¡Nos vemos pronto ${userName}! ✨`,

      pestañas: `
RECORDATORIO DE TURNO - PESTAÑAS/CEJAS

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Confirmar asistencia.
Asistir sin maquillaje ni cremas. (Pierden garantía)

🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48 hs antes.
•⁠  ⁠Llegan tarde (+10min).
•⁠ Si llegan pasado los 10min y quieren ser atendidas, si es posible. Deberán abonar $10.000 adicionales
¡Gracias! 💕 Nos vemos pronto${userName} ✨`,

      cejas: `
RECORDATORIO DE TURNO - CEJAS

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. (Pierden garantía)
Confirmar asistencia 48hs antes.
🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48 hs antes.
•⁠  ⁠Llegan tarde (+10min).
•⁠ Si llegan pasado los 10min y quieren ser atendidas, si es posible. Deberán abonar el total del servicio. (La seña está PERDIDA)
¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,

      cosmetologia: `
RECORDATORIO DE TURNO - COSMETOLOGÍA

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. En lo posible evitar la depilación facial 48 horas antes.
Confirmar asistencia 48hs antes.
🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48 hs antes.
•⁠  ⁠Llegan tarde (+10min).
•⁠  ⁠Si llegan tarde y quieren ser atendidas (si hay disponibilidad), abonan el total.

¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,
    };

    const clave = serviceName.toLowerCase();
    const rawMessage =
      mensajesPorServicio[clave] ||
      `Hola ${userName}, te recordamos tu turno el ${dia} a las ${hora}.`;

    const msg = encodeURIComponent(rawMessage);
    let phoneClean = phone.replace(/\D/g, "");
    if (!phoneClean.startsWith("54")) {
      phoneClean = "549" + phoneClean;
    }
    const url = `https://wa.me/${phoneClean}?text=${msg}`;
    window.open(url, "_blank");

    try {
      await axios.put(
        `https://eve-back.vercel.app/appointments/${appointmentId}`,
        {
          reminderStatus: "enviado",
        }
      );

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
    const confirmDelete = window.confirm(
      "¿Estás seguro que querés eliminar este turno?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://eve-back.vercel.app/appointments/${appointmentId}`
      );
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
                              app.Expert.specialty
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

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>

      {/* Navegación tipo pestañas */}
      <nav className="admin-nav">
        <button
          onClick={() => setActiveTab("turnos")}
          className={activeTab === "turnos" ? "nav-btn active" : "nav-btn"}
          title="Turnos"
        >
          📅
        </button>
        <button
          onClick={() => setActiveTab("horarios")}
          className={activeTab === "horarios" ? "nav-btn active" : "nav-btn"}
          title="Horarios"
        >
          🕒
        </button>
        <button
          onClick={() => setActiveTab("ingresos")}
          className={activeTab === "ingresos" ? "nav-btn active" : "nav-btn"}
          title="Ingresos"
        >
          📊
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={activeTab === "admin" ? "nav-btn active" : "nav-btn"}
          title="Servicios"
        >
          🛠️
        </button>
        <button
          onClick={() => setActiveTab("coment")}
          className={activeTab === "coment" ? "nav-btn active" : "nav-btn"}
          title="Comentarios"
        >
          💬
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={activeTab === "products" ? "nav-btn active" : "nav-btn"}
          title="Productos"
        >
          💳
        </button>
      </nav>

      {/* Sección: Turnos */}
      {activeTab === "turnos" && (
        <>
          <section
            className="calendar-section"
            style={{ marginBottom: "3rem" }}
          >
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

          <section
            className="all-appointments"
            style={{ marginBottom: "3rem" }}
          >
            <h2>Todos los turnos (los próximos en amarillo)</h2>
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
          <TurnosImageGenerator></TurnosImageGenerator>
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
                value={format(new Date(selectedDate), "yyyy-MM-dd")}
                onChange={(e) => {
                  const parts = e.target.value.split("-");
                  const selected = new Date(parts[0], parts[1] - 1, parts[2]); // Año, Mes (0 index), Día
                  setSelectedDate(selected);
                }}
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
              <label className="input-label" htmlFor="expertId">
                Experto
              </label>
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
                <svg
                  className="select-arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <button className="btn-save" onClick={handleHorarioChange}>
              Guardar
            </button>
          </div>

          {(() => {
            const selectedKey = format(new Date(selectedDate), "yyyy-MM-dd");
            const horario = workingHours[selectedKey];

            return (
              <p className="horario-text">
                Horario para {format(new Date(selectedDate), "dd/MM/yyyy")}:{" "}
                {horario?.start || "No definido"} -{" "}
                {horario?.end || "No definido"}
              </p>
            );
          })()}
          <HorarioManager />
        </section>
      )}

      {/* Sección: Ingresos */}
      {activeTab === "ingresos" && (
        <section>
          <h2>Ingresos históricos</h2>

          <div style={{ margin: "16px 0" }}>
            <label style={{ marginRight: "10px" }}>Ver por:</label>
            <select
              value={modoGrafico}
              onChange={(e) => setModoGrafico(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            >
              <option value="servicio">Servicios</option>
              <option value="experto">Expertos</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "20px",
              maxWidth: "100%",
              margin: "0 auto",
              padding: "10px",
            }}
          >
            {/* Gráfico */}
            <div
              style={{
                flex: "1 1 300px",
                minWidth: "300px",
                maxWidth: "100%",
                height: 300,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={calcularIngresos}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={false}
                  >
                    {calcularIngresos.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda */}
            <div
              style={{
                flex: "1 1 200px",
                minWidth: "200px",
                maxHeight: "300px",
                overflowY: "auto",
                fontSize: "0.9rem",
              }}
            >
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {calcularIngresos.map((entry, index) => (
                  <li
                    key={`legend-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: COLORS[index % COLORS.length],
                        marginRight: 8,
                      }}
                    />
                    <span>{entry.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <LiquidacionesExpertos appointments={appointments} />
          <GraficoGananciasTiempo appointments={appointments} />
        </section>
      )}

      {/* Sección: Servicios y expertos */}
      {activeTab === "admin" && (
        <>
          <ServiceManager />
          <ExpertManager />
        </>
      )}
      {activeTab === "coment" && (
        <>
          <AdminComentarios></AdminComentarios>
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
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
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
                    await axios.delete(
                      `https://eve-back.vercel.app/appointments/${appointmentToDelete}`
                    );
                    setAppointments((prev) =>
                      prev.filter((a) => a.id !== appointmentToDelete)
                    );
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
      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px 20px",
            borderRadius: "6px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 9999,
            animation: "fadeInUp 0.3s ease",
          }}
        >
          ✅ Horario guardado correctamente
        </div>
      )}
      {activeTab === "products" && (
        <div>
          <AddProductForm></AddProductForm>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
