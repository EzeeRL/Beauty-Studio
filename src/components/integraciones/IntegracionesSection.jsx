import { useState } from "react";
import { MessageCircle, Bell } from "lucide-react";
import WhatsappSection from "./WhatsappSection";
import NotificationsSection from "../NotificationsSection";
import { useWhatsappBot } from "../../hooks/useWhatsappBot";
import "./integraciones.css";

const IntegracionesSection = ({ appointments, onVerTurnos }) => {
  const [subTab, setSubTab] = useState("whatsapp");
  // Vive acá (y no en WhatsappSection) para que la pestaña muestre si está
  // conectado aunque estés viendo Notificaciones
  const bot = useWhatsappBot();
  const conectado = bot.estado?.status === "linked";

  return (
    <div className="int">
      <h2>Integraciones</h2>

      <div className="int-tabs">
        <button
          type="button"
          className={`int-tab ${subTab === "whatsapp" ? "activo" : ""}`}
          onClick={() => setSubTab("whatsapp")}
        >
          <MessageCircle size={18} strokeWidth={2} />
          WhatsApp
          {conectado && subTab !== "whatsapp" && (
            <span className="int-tab-punto" aria-label="Conectado" />
          )}
        </button>
        <button
          type="button"
          className={`int-tab ${subTab === "notificaciones" ? "activo" : ""}`}
          onClick={() => setSubTab("notificaciones")}
        >
          <Bell size={18} strokeWidth={2} />
          Notificaciones
        </button>
      </div>

      {subTab === "whatsapp" && (
        <WhatsappSection bot={bot} appointments={appointments} onVerTurnos={onVerTurnos} />
      )}
      {subTab === "notificaciones" && <NotificationsSection />}
    </div>
  );
};

export default IntegracionesSection;
