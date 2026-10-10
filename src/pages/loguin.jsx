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

import { useEffect, useRef, useState } from "react";
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

  // El botón de Google solo acepta un ancho fijo en px: lo ajustamos al
  // ancho disponible para que no se corte en celulares
  const googleRef = useRef(null);
  const [googleWidth, setGoogleWidth] = useState(300);

  useEffect(() => {
    const el = googleRef.current;
    if (!el) return;
    const ajustar = () => {
      const ancho = Math.floor(el.clientWidth);
      if (ancho > 0) setGoogleWidth(Math.max(200, Math.min(ancho, 360)));
    };
    ajustar();
    const observer = new ResizeObserver(ajustar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      <div className="lg-page">
        <div className="lg-card">
          {/* Panel de marca */}
          <div className="lg-side">
            <span className="lg-ring lg-r1"></span>
            <span className="lg-ring lg-r2"></span>
            <span className="lg-ring lg-r3"></span>
            <div className="lg-brand">
              <img src="/logo.png" alt="Logo D´Art" className="lg-logo" />
              <span>D´Art</span>
            </div>
            <h4 className="lg-tagline">
              Tu momento
              <br />
              de brillar.
            </h4>
            <p className="lg-side-text">
              Reservá tu turno en segundos y sumá puntos con cada visita.
            </p>
          </div>

          {/* Formulario tradicional */}
          <form onSubmit={handleSubmit} className="lg-form">
            <h2 className="lg-title">¡Hola de nuevo!</h2>
            <p className="lg-sub">Iniciá sesión para poder solicitar turnos</p>

            <div className="lg-field">
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>

            <div className="lg-field">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>

            {error && <p className="lg-error">{error}</p>}

            <button type="submit" className="lg-btn">
              Entrar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            {/* Separador */}
            <div className="lg-sep">o</div>

            {/* Botón de Google */}
            <div className="lg-google" ref={googleRef}>
              <GoogleLogin
                key={googleWidth}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                locale="es"
                width={String(googleWidth)}
              />
            </div>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
