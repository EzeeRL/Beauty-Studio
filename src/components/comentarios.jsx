import { useState } from "react";
import axios from "axios";
import "./comentarioCreate.css";
const ComentarioForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    rating: 5,
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!formData.name || !formData.content) {
      setError("Nombre y comentario son obligatorios");
      return;
    }

    try {
      const res = await axios.post(
        "https://eve-back.vercel.app/comments",
        formData
      );
      setMensaje("✅ Comentario enviado con éxito");
      setFormData({ name: "", content: "", rating: 5 });
    } catch (err) {
      console.error("❌ Error al enviar comentario:", err);
      setError("Ocurrió un error al enviar el comentario");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Dejá tu comentario</h2>

      <input
        type="text"
        name="name"
        placeholder="Tu nombre"
        value={formData.name}
        onChange={handleChange}
        style={styles.input}
        className="input"
      />

      <textarea
        name="content"
        placeholder="Escribí tu comentario..."
        value={formData.content}
        onChange={handleChange}
        style={styles.textarea}
        className="input"
      />

      <label>Calificación:</label>
      <select
        name="rating"
        value={formData.rating}
        onChange={handleChange}
        style={styles.select}
      >
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>
            {r} ⭐
          </option>
        ))}
      </select>

      <button type="submit" style={styles.button}>
        Enviar comentario
      </button>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

const styles = {
  form: {
    minWidth: "300px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  textarea: {
    padding: "10px",
    fontSize: "16px",
    minHeight: "80px",
  },
  select: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    background: "linear-gradient(90deg, #C0A439, #E6C55A)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default ComentarioForm;
