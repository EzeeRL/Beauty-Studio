import { useEffect, useState } from "react";
import axios from "axios";
import "./horarioManager.css";

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
          h.id === editId
            ? { ...h, ...editData, openTime: editData.open, closeTime: editData.close }
            : h,
        ),
      );
      setEditId(null);
      setEditData({});
      showToast("✅ Horario actualizado.");
    } catch (err) {
      console.error("Error actualizando:", err);
    }
  };

  const selectedExpertData = experts.find(
    (e) => String(e.id) === String(selectedExpert),
  );

  return (
    <div className="horario-manager">
      <h2>🕒 Ver, Editar o Eliminar Horarios</h2>

      <div className="filter-bar">
        <label htmlFor="filterExpert">Filtrar por experto:</label>
        <select
          id="filterExpert"
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

      {!selectedExpert ? (
        <p className="horario-empty">Seleccioná un experto para ver sus horarios.</p>
      ) : horarios.length === 0 ? (
        <p className="horario-empty">No hay horarios para mostrar.</p>
      ) : (
        <div className="horario-list">
          {selectedExpertData && (
            <h3 className="horario-list-title">
              {selectedExpertData.name} ({selectedExpertData.specialty})
            </h3>
          )}

          <div className="horario-cards">
            {horarios.map((h) => {
              const isEditing = editId === h.id;
              return (
                <div key={h.id} className="horario-card">
                  {isEditing ? (
                    <div className="horario-card-edit">
                      <label>
                        Fecha
                        <input
                          type="date"
                          value={editData.day}
                          onChange={(e) => handleEditChange("day", e.target.value)}
                        />
                      </label>
                      <label>
                        Inicio
                        <input
                          type="time"
                          value={editData.open}
                          onChange={(e) => handleEditChange("open", e.target.value)}
                        />
                      </label>
                      <label>
                        Cierre
                        <input
                          type="time"
                          value={editData.close}
                          onChange={(e) => handleEditChange("close", e.target.value)}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="horario-card-info">
                      <span className="horario-card-date">📅 {h.day}</span>
                      <span className="horario-card-range">
                        🕒 {h.openTime} - {h.closeTime}
                      </span>
                    </div>
                  )}

                  <div className="horario-card-actions">
                    {isEditing ? (
                      <>
                        <button className="btn save" onClick={saveEdit}>
                          💾 Guardar
                        </button>
                        <button className="btn cancel" onClick={() => setEditId(null)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn edit" onClick={() => handleEdit(h)}>
                          ✏️ Editar
                        </button>
                        <button className="btn delete" onClick={() => handleDelete(h.id)}>
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
};

export default HorarioManager;
