import { format } from "date-fns";
import axios from "axios";

const API = "https://eve-back.vercel.app";

const buildMessage = (serviceName, userName, dia, hora) => {
  const mensajesPorServicio = {
    manicuria: `
RECORDATORIO DE TURNO - MANICURÍA

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Confirmar asistencia.
Mandar diseño para darles un precio. No se aceptan cambios en el día si es más complejo. 

🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48hs antes.
•⁠  ⁠Llegan tarde (pasado +10 min).
•⁠  ⁠Si llegan pasado los 10min y quieren ser atendidas, si es posible. Deberán abonar $10.000 adicionales

Gracias 💕 ¡Nos vemos pronto ${userName}! ✨`,

    pestañas: `
RECORDATORIO DE TURNO - PESTAÑAS/CEJAS

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Confirmar asistencia.
Asistir sin maquillaje ni cremas. (Pierden garantía)

🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48 hs antes.
•⁠  ⁠Llegan tarde (+10min).
•⁠ Si llegan pasado los 10min y quieren ser atendidas, si es posible. Deberán abonar $10.000 adicionales
¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,

    cejas: `
RECORDATORIO DE TURNO - CEJAS

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. (Pierden garantía)
Confirmar asistencia 48hs antes.
🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48 hs antes.
•⁠  ⁠Llegan tarde (+10min).
•⁠ Si llegan pasado los 10min y quieren ser atendidas, si es posible. Deberán abonar el total del servicio. (La seña está PERDIDA)
¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,

    cosmetologia: `
RECORDATORIO DE TURNO - COSMETOLOGÍA

📅 Día: ${dia}
🕒 Hora: ${hora}

⚠️ Asistir sin maquillaje ni cremas. En lo posible evitar la depilación facial 48 horas antes.
Confirmar asistencia 48hs antes.
🚫 Sin acompañantes.

💵 Se pierde la seña si:
•⁠  ⁠No se avisa la inasistencia 48 hs antes.
•⁠  ⁠Llegan tarde (+10min).
•⁠  ⁠Si llegan tarde y quieren ser atendidas (si hay disponibilidad), abonan el total.

¡Gracias! 💕 Nos vemos pronto ${userName} ✨`,
  };

  const clave = serviceName.toLowerCase();
  return (
    mensajesPorServicio[clave] ||
    `Hola ${userName}, te recordamos tu turno el ${dia} a las ${hora}.`
  );
};

export const useWhatsApp = (markReminderSent) => {
  const sendWhatsApp = async (
    phone,
    userName,
    date,
    appointmentId,
    serviceName,
  ) => {
    const dia = format(new Date(date), "dd/MM/yyyy");
    const hora = format(new Date(date), "HH:mm");

    const rawMessage = buildMessage(serviceName, userName, dia, hora);
    const msg = encodeURIComponent(rawMessage);

    let phoneClean = phone.replace(/\D/g, "");
    if (!phoneClean.startsWith("54")) {
      phoneClean = "549" + phoneClean;
    }

    const url = `https://wa.me/${phoneClean}?text=${msg}`;
    window.open(url, "_blank");

    try {
      await axios.put(`${API}/appointments/${appointmentId}`, {
        reminderStatus: "enviado",
      });
      markReminderSent(appointmentId);
    } catch (err) {
      console.error("❌ Error al actualizar reminderStatus:", err);
    }
  };

  return { sendWhatsApp };
};
