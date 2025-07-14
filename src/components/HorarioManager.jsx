import { useEffect, useState } from "react";
import axios from "axios";
import "./horarioManager.css"


const HorarioManager = () => {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    axios
      .get("https://eve-back.vercel.app/experts")
      .then((res) => setExperts(res.data))
      .catch((err) => console.error("Error cargando expertos:", err));
  }, []);

  useEffect(() => {
    if (selectedExpert) {
      axios
        .get(`https://eve-back.vercel.app/hours/expert/${selectedExpert}`)
        .then((res) => setHorarios(res.data))
        .catch((err) => {
          console.error("Error cargando horarios:", err);
          setHorarios([]);
        });
    } else {
      setHorarios([]);
    }
  }, [selectedExpert]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Eliminar este horario?");
    if (!confirm) return;

    try {
      await axios.delete(`https://eve-back.vercel.app/hours/${id}`);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      showToast("✅ Horario eliminado.");
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleEdit = (h) => {
    setEditId(h.id);
    setEditData({
      day: h.day,
      open: h.openTime,
      close: h.closeTime,
      expertId: h.expertId,
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    try {
      await axios.put(`https://eve-back.vercel.app/hours/${editId}`, editData);
      setHorarios((prev) =>
        prev.map((h) =>
          h.id === editId ? { ...h, ...editData, openTime: editData.open, closeTime: editData.close } : h
        )
      );
      setEditId(null);
      setEditData({});
      showToast("✅ Horario actualizado.");
    } catch (err) {
      console.error("Error actualizando:", err);
    }
  };

  return (
    <div className="horario-manager">
      <h2>🕒 Ver, Editar o Eliminar Horarios</h2>

      <div className="filter-bar">
        <label>Filtrar por experto:</label>
        <select
        className="input-estilizado"
          value={selectedExpert}
          onChange={(e) => setSelectedExpert(e.target.value)}
        >
          <option value="">Seleccionar experto</option>
          {experts.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.specialty})
            </option>
          ))}
        </select>
      </div>

      {horarios.length === 0 ? (
        <p>No hay horarios para mostrar.</p>
      ) : (
        <table className="horario-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Inicio</th>
              <th>Cierre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map((h) => (
              <tr key={h.id}>
                <td>
                  {editId === h.id ? (
                    <input
                      type="date"
                      value={editData.day}
                      onChange={(e) => handleEditChange("day", e.target.value)}
                    />
                  ) : (
                    h.day
                  )}
                </td>
                <td>
                  {editId === h.id ? (
                    <input
                      type="time"
                      value={editData.open}
                      onChange={(e) => handleEditChange("open", e.target.value)}
                    />
                  ) : (
                    h.openTime
                  )}
                </td>
                <td>
                  {editId === h.id ? (
                    <input
                      type="time"
                      value={editData.close}
                      onChange={(e) => handleEditChange("close", e.target.value)}
                    />
                  ) : (
                    h.closeTime
                  )}
                </td>
                <td>
                  {editId === h.id ? (
                    <>
                      <button onClick={saveEdit}>💾 Guardar</button>
                      <button onClick={() => setEditId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(h)}>✏️ Editar</button>
                      <button onClick={() => handleDelete(h.id)}>🗑️ Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toastMsg && (
        <div className="toast">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default HorarioManager;
