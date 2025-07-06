import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./adminExpert.css"
const ExpertManager = () => {
  const [experts, setExperts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [newExpert, setNewExpert] = useState({
    name: "",
    specialty: "",
    email: "",
    description: "",
    imageUrl: "",
  });

  const formRef = useRef(null);
  const expertRefs = useRef({});

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const res = await axios.get("https://eve-back.vercel.app/experts");
      setExperts(res.data);
    } catch (err) {
      console.error("Error al obtener expertos", err);
    }
  };

  const handleChange = (e) => {
    setNewExpert({ ...newExpert, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`https://eve-back.vercel.app/experts/${editingId}`, newExpert);
        setEditingId(null);
      } else {
        await axios.post("https://eve-back.vercel.app/experts", newExpert);
      }

      setNewExpert({ name: "", specialty: "", email: "", description: "", imageUrl: "" });

      await fetchExperts();

      setTimeout(() => {
        const scrollToId = editingId || experts[experts.length - 1]?.id;
        if (expertRefs.current[scrollToId]) {
          expertRefs.current[scrollToId].scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    } catch (err) {
      console.error("Error al guardar experto", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp) => {
    setNewExpert(exp);
    setEditingId(exp.id);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const confirmDelete = (id) => {
    setToDeleteId(id);
    setShowModal(true);
  };

  const cancelDelete = () => {
    setToDeleteId(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://eve-back.vercel.app/experts/${toDeleteId}`);
      setToDeleteId(null);
      setShowModal(false);
      fetchExperts();
    } catch (err) {
      console.error("Error al eliminar experto", err);
    }
  };

  return (
    <section style={{ marginTop: "3rem", position: "relative" }}>
      <h2 ref={formRef}>Gestión de Expertos</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400 }}>
        <input name="name" placeholder="Nombre" value={newExpert.name} onChange={handleChange} />
        <input name="specialty" placeholder="Especialidad" value={newExpert.specialty} onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" value={newExpert.email} onChange={handleChange} />
        <input name="description" placeholder="Descripción" value={newExpert.description} onChange={handleChange} />
        <input name="imageUrl" placeholder="URL de imagen" value={newExpert.imageUrl} onChange={handleChange} />

        <button
          onClick={handleCreateOrUpdate}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3f51b5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          {loading ? (
            <span
              style={{ display: "inline-block", width: 20, height: 20, border: "3px solid #fff", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}
            ></span>
          ) : editingId ? "Guardar cambios" : "Agregar experto"}
        </button>
      </div>

      <table style={{ marginTop: "2rem", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
       <tbody>
  {experts.map((exp) => (
    <tr key={exp.id} ref={(el) => (expertRefs.current[exp.id] = el)}>
      <td data-label="Nombre">{exp.name}</td>
      <td data-label="Especialidad">{exp.specialty}</td>
      <td data-label="Email">{exp.email}</td>
      <td data-label="Acciones">
        <button onClick={() => handleEdit(exp)}>Editar</button>
        <button
          onClick={() => confirmDelete(exp.id)}
          style={{ marginLeft: "0.5rem", color: "red" }}
        >
          Eliminar
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      {showModal && (
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
            }}
          >
            <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
              ¿Estás seguro que querés eliminar este experto?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={cancelDelete} style={{ padding: "0.5rem 1rem" }}>
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#e53935", color: "#fff", border: "none", borderRadius: "4px" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default ExpertManager;