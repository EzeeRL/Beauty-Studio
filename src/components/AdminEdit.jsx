import { useEffect, useRef, useState } from "react";
import axios from "axios";

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    category: "",
  });

  const formRef = useRef(null);
  const serviceRefs = useRef({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("https://eve-back.vercel.app/services");
      setServices(res.data);
    } catch (err) {
      console.error("Error al obtener servicios", err);
    }
  };

  const handleChange = (e) => {
    setNewService({ ...newService, [e.target.name]: e.target.value });
  };

const handleCreateOrUpdate = async () => {
  setLoading(true);
  const isEdit = Boolean(editingId);
  try {
    if (isEdit) {
      await axios.put(`https://eve-back.vercel.app/services/${editingId}`, newService);
      setEditingId(null);
    } else {
      await axios.post("https://eve-back.vercel.app/services", newService);
    }

    setNewService({ name: "", price: "", duration: "", description: "", category: "" });

    await fetchServices();

    setTimeout(() => {
      const scrollToId = isEdit ? editingId : services[services.length - 1]?.id;
      if (scrollToId && serviceRefs.current[scrollToId]) {
        serviceRefs.current[scrollToId].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  } catch (err) {
    console.error("Error al guardar servicio", err);
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (srv) => {
    setNewService(srv);
    setEditingId(srv.id);
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
      await axios.delete(`https://eve-back.vercel.app/services/${toDeleteId}`);
      setToDeleteId(null);
      setShowModal(false);
      fetchServices();
    } catch (err) {
      console.error("Error al eliminar servicio", err);
    }
  };

  return (
    <section style={{ marginTop: "3rem", position: "relative" }}>
      <h2 ref={formRef}>Gestión de Servicios</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400 }}>
        <input name="name" placeholder="Nombre" value={newService.name} onChange={handleChange} />
        <input name="price" type="number" placeholder="Precio" value={newService.price} onChange={handleChange} />
        <input name="duration" type="number" placeholder="Duración (min)" value={newService.duration} onChange={handleChange} />
        <input name="description" placeholder="Descripción" value={newService.description} onChange={handleChange} />
        <input name="category" placeholder="Categoría" value={newService.category} onChange={handleChange} />

        <button
          onClick={handleCreateOrUpdate}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
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
            <span className="spinner" style={{ display: "inline-block", width: 20, height: 20, border: "3px solid #fff", borderTop: "3px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
          ) : editingId ? "Guardar cambios" : "Agregar servicio"}
        </button>
      </div>

      <table style={{ marginTop: "2rem", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
       <tbody>
  {services.map((srv) => (
    <tr key={srv.id} ref={(el) => (serviceRefs.current[srv.id] = el)}>
      <td data-label="Nombre">{srv.name}</td>
      <td data-label="Precio">${srv.price}</td>
      <td data-label="Duración">{srv.duration} min</td>
      <td data-label="Categoría">{srv.category}</td>
      <td data-label="Acciones">
        <button onClick={() => handleEdit(srv)}>Editar</button>
        <button
          onClick={() => confirmDelete(srv.id)}
          style={{ marginLeft: "0.5rem", color: "red" }}
        >
          Eliminar
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      {/* MODAL de confirmación */}
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
              ¿Estás seguro que querés eliminar este servicio?
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

export default ServiceManager;
