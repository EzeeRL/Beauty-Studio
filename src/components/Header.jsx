import { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // En tu Header.jsx
  // const { servicio, experto, fecha, datosCliente } = useServicioStore();
  const userId = localStorage.getItem("userId");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [admin, setAdmin] = useState(false);
  const userId2 = localStorage.getItem("userId");

  useEffect(() => {
    if (userId2 == "3" || userId2 == "1") {
      setAdmin(true);
    }
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <img
            src="/logo.png"
            alt="Logo del salón"
            className="logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/public/logo.png"; // Ruta alternativa en caso de error
            }}
          />
        </div>

        <button
          className={`menu-button ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú"
        >
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>

      {/* Overlay y menú lateral */}
      <div
        className={`menu-overlay ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <nav className={`side-menu ${isMenuOpen ? "open" : ""}`}>
        <button
          className="close-menu-button"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="menu-content">
          <a
            href="/"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Inicio
          </a>
          {/*        <a
            href="#payment-methods"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Métodos de Pago
          </a> */}
          <a
            href="/ubicacion"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Dónde nos ubicamos
          </a>
          <a
            href="/Cursos"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Cursos
          </a>
          {admin == true ? (
            <a
              href="/admin"
              className="menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Administración
            </a>
          ) : null}
          {userId ? (
            <a
              href="/Perfil"
              className="menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Mi perfil
            </a>
          ) : (
            <a
              href="/login"
              className="menu-item"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar sesión
            </a>
          )}
        </div>
        {/* Botón fijo abajo */}
        {userId && (
          <div className="logout-container">
            <button
              className="logout-btn"
              onClick={() => {
                setShowLogoutModal(true);
                setIsMenuOpen(false); // <-- cerramos el menú
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
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
              maxWidth: "400px",
              width: "90%",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
              Al cerrar sesion ya no podras ver tus turnos ¿Estás segura que
              querés cerrar sesión?
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                zIndex: "2000",
              }}
            >
              <button
                onClick={() => setShowLogoutModal(false)}
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
                onClick={handleLogout}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
