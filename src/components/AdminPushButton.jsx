import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  enableAdminPush,
  getPushStatus,
  refreshAdminPush,
} from "../utils/adminPush";
import "./AdminPushButton.css";

const MESSAGES = {
  "ios-install":
    "Para recibir avisos de pagos en iPhone: tocá Compartir → \"Agregar a pantalla de inicio\" y abrí el panel desde ese ícono.",
  unsupported: "Este navegador no permite notificaciones.",
  denied:
    "Las notificaciones están bloqueadas. Activalas desde la configuración del navegador.",
};

const AdminPushButton = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPushStatus().then(setStatus);
    refreshAdminPush();
  }, []);

  const handleEnable = async () => {
    setError("");
    setLoading(true);
    try {
      setStatus(await enableAdminPush());
    } catch (err) {
      console.error("❌ Error activando notificaciones:", err);
      setError("No se pudieron activar las notificaciones. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  if (status === "granted") {
    return (
      <div className="admin-push admin-push--on">
        <BellRing size={16} strokeWidth={2} />
        <span>Notificaciones de pagos activadas</span>
      </div>
    );
  }

  if (status === "default") {
    return (
      <div className="admin-push">
        <button
          type="button"
          className="admin-push-btn"
          onClick={handleEnable}
          disabled={loading}
        >
          <Bell size={16} strokeWidth={2} />
          {loading ? "Activando..." : "Activar notificaciones de pagos"}
        </button>
        {error && <span className="admin-push-error">{error}</span>}
      </div>
    );
  }

  return (
    <div className="admin-push">
      <Bell size={16} strokeWidth={2} />
      <span>{MESSAGES[status]}</span>
    </div>
  );
};

export default AdminPushButton;
