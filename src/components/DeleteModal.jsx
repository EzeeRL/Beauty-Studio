import axios from "axios";

const API = "https://eve-back.vercel.app";

const DeleteModal = ({
  appointmentToDelete,
  setAppointments,
  setShowDeleteModal,
  setAppointmentToDelete,
}) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/appointments/${appointmentToDelete}`);
      setAppointments((prev) =>
        prev.filter((a) => a.id !== appointmentToDelete),
      );
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    } catch (err) {
      console.error("❌ Error al eliminar el turno:", err);
      alert("Hubo un error al eliminar el turno.");
    }
  };

  return (
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
            onClick={handleDelete}
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
  );
};

export default DeleteModal;
