/* import { useEffect, useState } from "react";
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
 */

import { useEffect, useState, useRef } from "react";
import axios from "axios";

const ComentarioList = () => {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

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

  useEffect(() => {
    if (isPaused || comentarios.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const cardWidth = scrollRef.current.children[0].clientWidth;
          scrollRef.current.scrollBy({
            left: cardWidth + 16,
            behavior: "smooth",
          });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, comentarios]);

  if (loading) return <p className="text-center">Cargando comentarios...</p>;
  if (comentarios.length === 0) return null;

  return (
    <div className="comentarios-section">
      <h2 className="titulo">Sus Comentarios</h2>

      <div
        className="carousel-container"
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {comentarios.map((c) => (
          <div key={c.id} className="comentario-card">
            <div className="card-header">
              <div className="avatar">{c.name?.[0]?.toUpperCase()}</div>
              <div className="user-info">
                <strong>{c.name}</strong>
                <div className="rating">
                  {"⭐".repeat(Number(c.rating) || 5)}
                </div>
              </div>
            </div>

            {/* Contenedor del texto con límites claros */}
            <div className="comentario-body">
              <p className="comentario-texto">{c.content}</p>
            </div>

            <small className="date">
              {new Date(c.createdAt).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </small>
          </div>
        ))}
      </div>

      <style>{`
        .comentarios-section {
          width: 100%;
          max-width: 100vw;
          margin: 40px auto;
          overflow: hidden;
          font-family: inherit;
        }

        .titulo {
          font-size: 1.5rem;
          margin-bottom: 20px;
          text-align: center;
          color: #333;
          padding: 0 20px;
        }

        .carousel-container {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 16px;
          padding: 10px 20px 30px 20px; /* Padding lateral para que la primera card no pegue al borde */
          scroll-behavior: smooth;
          scrollbar-width: none; 
        }
        
        .carousel-container::-webkit-scrollbar { display: none; }

        .comentario-card {
          /* Definimos el ancho para que se vea una y un poco de la otra */
          min-width: 280px; 
          max-width: 280px; 
          width: 280px;
          
          scroll-snap-align: center;
          flex-shrink: 0;
          background: #fff;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #C0A439;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 12px;
        }

        .user-info strong {
          display: block;
          font-size: 0.95rem;
          color: #222;
        }

        .rating { font-size: 0.7rem; margin-top: 2px; }

        .comentario-body {
          width: 100%;
          margin-bottom: 15px;
        }

        .comentario-texto {
          font-size: 0.9rem;
          line-height: 1.4;
          color: #555;
          margin: 0;
          /* ESTO FUERZA EL SALTO DE LÍNEA */
          white-space: normal; 
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-align: left;
        }

        .date {
          font-size: 0.75rem;
          color: #bbb;
          margin-top: auto;
        }

        @media (min-width: 768px) {
          .comentario-card {
            min-width: 350px;
            max-width: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default ComentarioList;
