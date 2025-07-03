import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
/* import "./Login.css"; // Opcional si querés estilos */

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [error, setError] = useState("");

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
      const response = await axios.post("https://eve-back.vercel.app/users/login", formData);
      const user = response.data.user;
      localStorage.setItem("userId", user.id);
      navigate("/Perfil");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Hubo un problema al iniciar sesión. Revisá tus datos.");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
