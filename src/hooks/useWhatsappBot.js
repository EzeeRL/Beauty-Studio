// Estado de la vinculación del bot de recordatorios de WhatsApp (eve-back:
// /whatsapp/status y /whatsapp/login). Mientras el bot está arrancando o
// esperando el código, consulta el estado cada pocos segundos para que el
// panel pase solo de un paso al siguiente.
import { useCallback, useEffect, useState } from "react";
import adminApi, { API } from "../utils/adminApi";

export const EN_CURSO = ["starting", "waiting_code"];
const CONSULTA_MS = 5000;

export const useWhatsappBot = () => {
  // { status, pairingCode, codeExpiresAt, message, startedAt, updatedAt }
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState("");
  const [iniciando, setIniciando] = useState(false);

  const consultar = useCallback(async () => {
    try {
      const res = await adminApi.get(`${API}/whatsapp/status`);
      setEstado(res.data);
      setError("");
    } catch (err) {
      console.error("Error consultando el estado de WhatsApp:", err);
      setError("No se pudo consultar el estado del bot.");
    }
  }, []);

  useEffect(() => {
    consultar();
  }, [consultar]);

  const status = estado?.status;

  useEffect(() => {
    if (!EN_CURSO.includes(status)) return;
    const id = setInterval(consultar, CONSULTA_MS);
    return () => clearInterval(id);
  }, [status, consultar]);

  const conectar = async () => {
    setIniciando(true);
    setError("");
    try {
      const res = await adminApi.post(`${API}/whatsapp/login`);
      setEstado(res.data);
    } catch (err) {
      // 409 (ya hay una vinculación en curso) y 502 traen el estado igual
      const data = err.response?.data;
      if (data?.status) setEstado(data);
      else setError(data?.error ?? "No se pudo iniciar la conexión.");
    } finally {
      setIniciando(false);
    }
  };

  return { estado, error, iniciando, conectar, reintentarConsulta: consultar };
};
