import { useEffect, useState } from "react";
import axios from "axios";

const ComentarioList = () => {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const res = await axios.get("https://eve-back.vercel.app/comments");
        setComentarios(res.data);
      } catch (error) {
        console.error("❌ Error al obtener comentarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComentarios();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando comentarios...</p>;
  if (comentarios.length === 0) return <p style={{ textAlign: "center" }}>No hay comentarios aún.</p>;

  const comentariosMostrados = mostrarTodos ? comentarios : comentarios.slice(0, 2);

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
            <small style={styles.date}>
              {new Date(c.createdAt).toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </small>
          </div>
        </div>
      ))}

      {comentarios.length > 2 && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button onClick={() => setMostrarTodos(!mostrarTodos)} style={styles.toggleBtn}>
            {mostrarTodos ? "Ver menos" : "Ver más"}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "700px",
    margin: "60px auto",
    padding: "0 16px",
  },
  titulo: {
    fontSize: "1.6rem",
    marginBottom: "12px",
    borderBottom: "2px solid #ccc",
    paddingBottom: "6px",
  },
  card: {
    display: "flex",
    background: "#fff",
    borderRadius: "6px",
    padding: "5px 9px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    marginBottom: "8px",
    alignItems: "flex-start",
    width:"310px"
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#C0A439",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "14px",
    marginRight: "10px",
    flexShrink: 0,
  },
  inicial: {
    margin: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2px",
    fontSize: "14px",
  },
  comentario: {
    margin: "2px 0 4px",
    fontSize: "13px",
    lineHeight: "1.3",
    color: "#333",
    textAlign: "left",
  },
  rating: {
    color: "#FFC107",
    fontSize: "13px",
  },
  date: {
    fontSize: "11px",
    color: "#999",
  },
  toggleBtn: {
    backgroundColor: "#C0A439",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "5px 12px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
    transition: "background 0.3s",
  },
};

export default ComentarioList;
