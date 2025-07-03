import { useEffect, useState } from "react";
import axios from "axios";
import { format, compareAsc, differenceInHours } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

  const ingresosPorServicio = [
    { name: "Manicura Completa", value: 4000 },
    { name: "Masaje Relajante", value: 7000 },
    { name: "Corte Clásico", value: 5500 },
    { name: "Depilación", value: 3000 },
  ];

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

  const sendWhatsApp = (phone, userName, date) => {
    const msg = encodeURIComponent(
      `Hola ${userName}, te recordamos tu turno el día ${format(
        new Date(date),
        "dd/MM/yyyy 'a las' HH:mm"
      )}. ¡Gracias!`
    );
    const phoneClean = phone.replace(/\D/g, "");
    const url = `https://wa.me/${phoneClean}?text=${msg}`;
    window.open(url, "_blank");
    
  };

  const TurnosTable = ({ data }) =>
    data.length === 0 ? (
      <p>No hay turnos para mostrar.</p>
    ) : (
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
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
                style={{
                  backgroundColor: upcoming ? "#fff7e6" : "transparent",
                  fontWeight: upcoming ? "700" : "normal",
                }}
              >
                <td>{format(new Date(app.date), "dd/MM/yyyy")}</td>
                <td>{format(new Date(app.date), "HH:mm")}</td>
                <td>{app.Service.name}</td>
                <td>{app.Expert.name}</td>
                <td>{app.User.name}</td>
                <td>{app.User.phone}</td>
                <td>${app.Service.price}</td>
                <td>
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
                <td>
                  {editingId === app.id ? (
                    <>
                      <button onClick={() => saveEdit(app.id)}>Guardar</button>
                      <button onClick={cancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(app.id, app.payStatus)}>Editar</button>
                      {upcoming && (
                        <button
                          onClick={() => sendWhatsApp(app.User.phone, app.User.name, app.date)}
                          style={{ marginLeft: 8, backgroundColor: "#25D366", color: "white" }}
                        >
                          WhatsApp
                        </button>
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
    <div style={{ padding: "2rem" }}>
      <h1>Panel de Administración</h1>

      <section style={{ marginBottom: "3rem" }}>
        <h2>Calendario y turnos por fecha</h2>
        <Calendar onChange={setSelectedDate} value={selectedDate} />
        <h3>Turnos para {format(selectedDate, "dd/MM/yyyy")}</h3>
        <TurnosTable data={filteredAppointments} />
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <h2>Todos los turnos (los próximos en amarillo)</h2>
        <TurnosTable data={sortedAppointments} />
      </section>

      <section>
        <h2>Configurar horario de atención</h2>
        <div>
          <label>Hora de inicio: </label>
          <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} />
          <label style={{ marginLeft: "1rem" }}>Hora de cierre: </label>
          <input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} />
          <button onClick={handleHorarioChange} style={{ marginLeft: "1rem" }}>
            Guardar horario
          </button>
        </div>
        <p>
          Horario para {format(selectedDate, "dd/MM/yyyy")}: {workingHours[format(selectedDate, "yyyy-MM-dd")]?.start || "No definido"} - {workingHours[format(selectedDate, "yyyy-MM-dd")]?.end || "No definido"}
        </p>
      </section>

      <section>
        <h2>Ingresos históricos por servicio</h2>
        <div style={{ width: "100%", maxWidth: "600px", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={ingresosPorServicio}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {ingresosPorServicio.map((entry, index) => (
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
