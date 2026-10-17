// src/utils/RutaProtegida.jsx
import { useEffect, useState } from "react";
import AdminLogin from "../pages/AdminLogin";
import {
  ADMIN_LOGOUT_EVENT,
  getAdminToken,
  verifyAdmin,
} from "./adminApi";

// "checking" mientras se valida el token guardado, "ok" con sesión de admin
// activa y "login" cuando hay que pedir la contraseña
const RutaProtegida = ({ children }) => {
  const [status, setStatus] = useState(() =>
    getAdminToken() ? "checking" : "login",
  );

  useEffect(() => {
    if (status !== "checking") return;
    verifyAdmin()
      .then(() => setStatus("ok"))
      .catch((err) => {
        // 401: token vencido o inválido. Otro error (red, back caído):
        // dejamos pasar, el back igual rechaza cualquier acción sin token válido
        setStatus(err.response?.status === 401 ? "login" : "ok");
      });
  }, [status]);

  useEffect(() => {
    const onLogout = () => setStatus("login");
    window.addEventListener(ADMIN_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, onLogout);
  }, []);

  if (status === "checking") return null;
  if (status === "login") return <AdminLogin onSuccess={() => setStatus("ok")} />;

  return children;
};

export default RutaProtegida;
