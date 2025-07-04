import { useEffect, useState ,useMemo} from "react";
import axios from "axios";
import { format, compareAsc, differenceInHours } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './AdminPanel.css';

const AdminPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workingHours, setWorkingHours] = useState({});
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("20:00");
  const [editingId, setEditingId] = useState(null);
  const [editingPayStatus, setEditingPayStatus] = useState("");

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

  const handleHorarioChange = () => {
    const key = format(selectedDate, "yyyy-MM-dd");
    setWorkingHours({
      ...workingHours,
      [key]: { start: startHour, end: endHour },
    });
  };

  const isUpcoming = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffHours = differenceInHours(date, now);
    return diffHours >= 0 && diffHours <= 448;
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

const sendWhatsApp = async (phone, userName, date, appointmentId) => {
  const msg = encodeURIComponent(
    `Hola ${userName}, te recordamos tu turno el día ${format(
      new Date(date),
      "dd/MM/yyyy 'a las' HH:mm"
    )}. ¡Gracias!`
  );
  const phoneClean = phone.replace(/\D/g, "");
  const url = `https://wa.me/${phoneClean}?text=${msg}`;
  window.open(url, "_blank");

  // Actualizar estado de recordatorio
  try {
    await axios.put(`https://eve-back.vercel.app/appointments/${appointmentId}`, {
      reminderStatus: "enviado",
    });

    // Refrescar turnos
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId
          ? { ...app, reminderStatus: "enviado" }
          : app
      )
    );
  } catch (err) {
    console.error("❌ Error al actualizar reminderStatus:", err);
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
                    <button className="edit" onClick={() => startEdit(app.id, app.payStatus)}>
                      Editar
                    </button>
                    {upcoming && (
                      <button
                        className="whatsapp"
                        onClick={() => sendWhatsApp(app.User.phone, app.User.name, app.date, app.id)}
                        disabled={app.reminderStatus === "enviado"}
                        style={{
                          opacity: app.reminderStatus === "enviado" ? 0.5 : 1,
                          cursor: app.reminderStatus === "enviado" ? "not-allowed" : "pointer",
                        }}
                      >
                        WhatsApp
                      </button>
                    )}
                    {app.reminderStatus === "enviado" && (
                      <span className="status-sent">📤 Recordatorio enviado</span>
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
        />
      </section>

      <section className="schedule-config">
        <h2>Configurar horario de atención</h2>
        <div className="inputs-row">
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
    </div>
  );
};

export default AdminPanel;
