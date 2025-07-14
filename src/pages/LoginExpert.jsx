import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Loguin.css";

const LoginE = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisar si ya hay expertId guardado y redirigir si existe
    const savedExpertId = localStorage.getItem("expertId");
    if (savedExpertId) {
      navigate(`/expertos/${savedExpertId}/turnos`);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.get("https://eve-back.vercel.app/experts");
      const expertos = response.data;

      const expertoEncontrado = expertos.find(
        (exp) =>
          exp.name.toLowerCase() === formData.name.toLowerCase() &&
          exp.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (expertoEncontrado) {
        localStorage.setItem("expertId", expertoEncontrado.id);
        navigate(`/expertos/${expertoEncontrado.id}/turnos`);
      } else {
        setError("No se encontró ningún experto con esos datos.");
      }
    } catch (err) {
      console.error("❌ Error al consultar expertos:", err);
      setError("Hubo un problema al iniciar sesión. Revisá tus datos.");
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="login-container">
      <h2 className="title-loguin">Iniciar Sesión</h2>
      <p className="subtitle">Inicia sesión para poder ver tus turnos</p>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-form"
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="input-form"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="button-entrar">Entrar</button>
      </form>
    </div>
  );
};

export default LoginE;
