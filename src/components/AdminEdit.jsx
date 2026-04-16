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
        await axios.put(
          `https://eve-back.vercel.app/services/${editingId}`,
          newService,
        );
        setEditingId(null);
      } else {
        await axios.post("https://eve-back.vercel.app/services", newService);
      }

      setNewService({
        name: "",
        price: "",
        duration: "",
        description: "",
        category: "",
      });
      await fetchServices();

      setTimeout(() => {
        const scrollToId = isEdit
          ? editingId
          : services[services.length - 1]?.id;
        if (scrollToId && serviceRefs.current[scrollToId]) {
          serviceRefs.current[scrollToId].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
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
    <section className="admin-section">
      <div className="admin-container">
        {/* FORMULARIO */}
        <div ref={formRef} className="form-card">
          <h2 className="form-title">
            {editingId ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <div className="form-grid">
            <div className="input-group full-width">
              <label>Nombre del servicio</label>
              <input
                name="name"
                placeholder="Ej. Capping mega 6D"
                value={newService.name}
                onChange={handleChange}
                className="modern-input"
              />
            </div>
            <div className="input-group">
              <label>Precio ($)</label>
              <input
                name="price"
                type="number"
                placeholder="000"
                value={newService.price}
                onChange={handleChange}
                className="modern-input price-input"
              />
            </div>
            <div className="input-group">
              <label>Duración (min)</label>
              <input
                name="duration"
                type="number"
                placeholder="Ej. 120"
                value={newService.duration}
                onChange={handleChange}
                className="modern-input"
              />
            </div>
            <div className="input-group full-width">
              <label>Categoría</label>
              <input
                name="category"
                placeholder="Ej. Pestañas"
                value={newService.category}
                onChange={handleChange}
                className="modern-input"
              />
            </div>
          </div>
          <button
            onClick={handleCreateOrUpdate}
            disabled={loading}
            className="modern-button primary-btn"
          >
            {loading ? (
              <span className="spinner"></span>
            ) : editingId ? (
              "Guardar cambios"
            ) : (
              "Agregar servicio"
            )}
          </button>
        </div>

        {/* LISTADO DE CARDS (TRANSPARENTE ENTRE ELLAS) */}
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr
                  key={srv.id}
                  ref={(el) => (serviceRefs.current[srv.id] = el)}
                  className="service-row-card"
                >
                  <td data-label="Servicio" className="name-cell">
                    <strong>{srv.name}</strong>
                  </td>
                  <td data-label="Precio" className="price-cell">
                    ${srv.price.toLocaleString("es-AR")}
                  </td>
                  <td data-label="Duración">{srv.duration} min</td>
                  <td data-label="Categoría">
                    <span className="badge">{srv.category}</span>
                  </td>
                  <td data-label="Acciones">
                    <div className="actions-div">
                      <button
                        className="modern-button edit-btn"
                        onClick={() => handleEdit(srv)}
                      >
                        Editar
                      </button>
                      <button
                        className="modern-button delete-btn"
                        onClick={() => confirmDelete(srv.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Eliminar servicio?</h3>
            <div className="modal-actions">
              <button
                onClick={cancelDelete}
                className="modern-button cancel-btn"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="modern-button delete-btn-solid"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-section {
          padding: 2rem 1rem;
          background-color: #f6f8fa; /* COLOR DE FONDO GENERAL */
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .admin-container {
          max-width: 1400px; /* MÁS ANCHO */
          width: 95%;
          margin: 0 auto;
        }

        .form-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 2.5rem;
          border: 1px solid #eef0f2;
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
        .full-width { grid-column: 1 / -1; }
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group label { font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; }
        
        .modern-input {
          padding: 0.8rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: #f9fafb;
          outline: none;
        }

        .modern-input:focus { border-color: #4f46e5; background: white; }

        .modern-button {
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }

        .primary-btn { background: #4f46e5; color: white; width: 100%; margin-top: 1rem; }

        /* ESTILOS DE LA TABLA Y CARDS */
        .table-wrapper {
          background: transparent; /* TRANSPARENTE PARA QUE SE VEA EL FONDO */
          border: none;
          box-shadow: none;
        }

        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 15px; } /* ESPACIO ENTRE CARDS */

        .modern-table thead th {
          padding: 0 1rem 0.5rem;
          text-align: left;
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
        }

        /* CADA FILA ES UNA CARD */
        .service-row-card {
          background: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
          border-radius: 20px;
        }

        .service-row-card td {
          padding: 1.2rem 1rem;
          border-top: 1px solid #f9fafb;
          border-bottom: 1px solid #f9fafb;
        }

        .service-row-card td:first-child { border-left: 1px solid #f9fafb; border-radius: 20px 0 0 20px; }
        .service-row-card td:last-child { border-right: 1px solid #f9fafb; border-radius: 0 20px 20px 0; }

        .price-cell { font-weight: 700; font-size: 1.1rem; color: #111827; }
        .badge { background: #f3f4f6; padding: 0.3rem 0.7rem; border-radius: 10px; color: #6b7280; font-size: 0.8rem; }
        .actions-div { display: flex; gap: 0.5rem; }
        
        .edit-btn { background: #eef2ff; color: #4f46e5;margin-left: 20px; }
        .delete-btn { background: #fff1f2; color: #e11d48; }

        /* MOBILE OPTIMIZATION */
        @media (max-width: 600px) {
          .admin-container { width: 100%; padding: 0; }
          .form-grid { grid-template-columns: 1fr; }
          
          .modern-table thead { display: none; }
          .modern-table { border-spacing: 0 20px; } /* MÁS ESPACIO EN MÓVIL */

          .service-row-card {
            display: block;
            margin-bottom: 20px;
            padding: 1rem;
            border: 1px solid #eef0f2;
          }

          .service-row-card td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 0;
            border: none !important;
          }

          .service-row-card td::before {
            content: attr(data-label);
            font-size: 0.7rem;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
          }

          .actions-div { width: 100%; margin-top: 0.5rem; }
          .edit-btn, .delete-btn { flex: 1; justify-content: center; }
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .modal-content { background: white; padding: 2rem; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; }
        .modal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
        .delete-btn-solid { background: #e11d48; color: white; flex: 1; }
        .cancel-btn { background: #f3f4f6; color: #4b5563; flex: 1; }
      `}</style>
    </section>
  );
};

export default ServiceManager;
