/* import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Loguin.css";

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
      const response = await axios.post(
        "https://eve-back.vercel.app/users/login",
        formData
      );
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
      <h2 className="title-loguin">Iniciar Sesión</h2>
      <p className="subtitle">Inicia sesión para poder solicitar turnos</p>
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

export default Login;
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./Loguin.css";
import useServicioStore from "../store/servicioStore";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const { setDatosCliente } = useServicioStore(); // ← Usar setDatosCliente que SÍ existe

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
      const response = await axios.post(
        "https://eve-back.vercel.app/users/login",
        formData
      );
      const user = response.data.user;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      // GUARDAR EN STORE usando setDatosCliente
      setDatosCliente({
        nombre: user.name,
        email: user.email,
      });

      console.log("✅ Usuario logueado:", user);
      navigate("/Perfil");
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError("Hubo un problema al iniciar sesión. Revisá tus datos.");
    }
  };

  // Manejar login exitoso con Google - Mismo endpoint que formulario
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decodificar el token JWT para obtener name y email
      const token = credentialResponse.credential;

      // Decodificar el token manualmente (sin necesidad de backend intermedio)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const { name, email, given_name, family_name } = payload;

      // Usar el nombre completo o combinar given_name + family_name
      const userName = name || `${given_name} ${family_name}`;

      // Enviar al MISMO endpoint que el formulario manual
      const response = await axios.post(
        "https://eve-back.vercel.app/users/login",
        {
          name: userName,
          email: email,
        }
      );

      const user = response.data.user;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      // GUARDAR EN STORE usando setDatosCliente
      setDatosCliente({
        nombre: user.name,
        email: user.email,
      });

      // No necesitas authToken separado si tu backend no lo devuelve
      navigate("/Perfil");
    } catch (err) {
      console.error("❌ Error en login con Google:", err);
      setError("Error al iniciar sesión con Google");
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Error en Google Login");
    setError("Falló el inicio de sesión con Google");
  };

  return (
    <GoogleOAuthProvider clientId="769266762797-t57n1c4qeapv39e5s153unkcokjngh51.apps.googleusercontent.com">
      <div className="login-container">
        <h2 className="title-loguin">Iniciar Sesión</h2>
        <p className="subtitle">Inicia sesión para poder solicitar turnos</p>

        {/* Formulario tradicional */}
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

          <button type="submit" className="button-entrar">
            Entrar
          </button>
        </form>

        {/* Separador */}
        <div className="separator">
          <span>o</span>
        </div>

        {/* Botón de Google */}
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            text="signin_with"
            locale="es"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
