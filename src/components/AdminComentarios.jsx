import { useEffect, useState } from "react";
import axios from "axios";

const AdminComentarios = () => {
  const [comentarios, setComentarios] = useState([]);
  const [comentarioAEliminar, setComentarioAEliminar] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const comentariosMostrados = mostrarTodos ? comentarios : comentarios.slice(0, 3);

  useEffect(() => {
    axios
      .get("https://eve-back.vercel.app/comments")
      .then((res) => setComentarios(res.data))
      .catch((err) => console.error("Error al cargar comentarios:", err));
  }, []);

  const eliminarComentario = async () => {
    if (!comentarioAEliminar) return;

    try {
      await axios.delete(`https://eve-back.vercel.app/comments/${comentarioAEliminar}`);
      setComentarios((prev) => prev.filter((c) => c.id !== comentarioAEliminar));
      setComentarioAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Comentarios</h2>

      {comentariosMostrados.map((c) => (
        <div key={c.id} style={styles.card}>
          <div style={styles.avatar}>
            <span style={styles.inicial}>{c.name?.[0]?.toUpperCase()}</span>
          </div>

          <div style={styles.content}>
            <div style={styles.header}>
              <strong>{c.name}</strong>
              <span style={styles.rating}>{c.rating} ⭐</span>
            </div>

            <p style={styles.comentario}>{c.content}</p>

            <div style={styles.footer}>
              <small style={styles.date}>
                {new Date(c.createdAt).toLocaleString("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </small>

              <button
                style={styles.eliminarBtn}
                onClick={() => setComentarioAEliminar(c.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}

      {comentarios.length > 2 && (
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button onClick={() => setMostrarTodos(!mostrarTodos)} style={styles.toggleBtn}>
            {mostrarTodos ? "Ver menos" : "Ver más"}
          </button>
        </div>
      )}

      {/* Popup de confirmación */}
      {comentarioAEliminar && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
              ¿Estás seguro que querés eliminar este comentario?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setComentarioAEliminar(null)}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button onClick={eliminarComentario} style={styles.confirmBtn}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "700px",
    margin: "0 auto",
  },
  titulo: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  card: {
    display: "flex",
    background: "#fff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    marginBottom: "1rem",
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "#c0a439",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "1rem",
    fontSize: "1.1rem",
    color: "#fff",
    fontWeight: "bold",
  },
  inicial: {
    fontSize: "1.2rem",
  },
  content: {
    flex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  rating: {
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "0.8rem",
  },
  comentario: {
    fontSize: "0.95rem",
    color: "#000",
    marginBottom: "0.5rem",
  },
  date: {
    fontSize: "0.75rem",
    color: "#666",
  },
  eliminarBtn: {
    padding: "4px 8px",
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    marginLeft: "auto",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleBtn: {
    padding: "6px 12px",
    fontSize: "0.9rem",
    backgroundColor: "#c0a439",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    cursor: "pointer",
  },
  popupOverlay: {
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
  },
  popup: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    animation: "fadeIn 0.3s ease",
    maxWidth: "400px",
    width: "90%",
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AdminComentarios;
