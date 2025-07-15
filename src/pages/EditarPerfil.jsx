// src/pages/EditarPerfil.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EditarPerfil.css"; // ⬅️ asegúrate de tener el CSS abajo

// ─────────────────────────────────────────
// Modal interno para mostrar mensajes
// ─────────────────────────────────────────
const ModalMensaje = ({ mensaje, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <p>{mensaje}</p>
      <button onClick={onClose}>Cerrar</button>
    </div>
  </div>
);

// ─────────────────────────────────────────
// Componente principal de edición de perfil
// ─────────────────────────────────────────
const EditarPerfil = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [modalMensaje, setModalMensaje] = useState(null);

  // Traer datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `https://eve-back.vercel.app/users/${userId}`
        );
        const { name, email, phone } = res.data;
        setFormData({ name, email, phone });
      } catch {
        setModalMensaje("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // Handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGuardar = async () => {
    const { name, email, phone } = formData;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setModalMensaje("Todos los campos son obligatorios.");
      return;
    }

    try {
      await axios.put(`https://eve-back.vercel.app/users/${userId}`, {
        name,
        email,
        phone,
      });
      setModalMensaje("Perfil actualizado con éxito.");
    } catch {
      setModalMensaje("Error al actualizar perfil.");
    }
  };

  // Cargando…
  if (loading) return <p className="cargando">Cargando...</p>;

  return (
    <>
      <div className="editar-perfil">
        <h2>Editar perfil</h2>

        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Teléfono:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </label>

        <div className="botones">
          <button onClick={handleGuardar}>Guardar cambios</button>
          <button onClick={() => navigate("/perfil")}>Cancelar</button>
        </div>
      </div>

      {/* Modal */}
      {modalMensaje && (
        <ModalMensaje
          mensaje={modalMensaje}
          onClose={() => {
            setModalMensaje(null);
            if (modalMensaje === "Perfil actualizado con éxito.") {
              navigate("/perfil");
            }
          }}
        />
      )}
    </>
  );
};

export default EditarPerfil;
