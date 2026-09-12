import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { format, parseISO, isSameDay, addMinutes } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./perfil.css";
import ComentarioForm from "../components/comentarios";
import { useNavigate } from "react-router-dom";
import UserCompras from "../components/comprasUser";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { QrCode, X } from "lucide-react";

const Perfil = () => {
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // 🎁 Puntos de fidelidad y escaneo de QR
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [rewardTiers, setRewardTiers] = useState([]);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [celebrateTierId, setCelebrateTierId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const qrReaderRef = useRef(null);

  // Estado para edición de fecha/hora dentro del perfil
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [ocupados, setOcupados] = useState({});
  const [horariosExpert, setHorariosExpert] = useState([]);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  // Carga datos usuario y turnos
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const userRes = await axios.get(
          `https://eve-back.vercel.app/users/${userId}`,
        );
        setUserData(userRes.data);
        setLoyaltyPoints(userRes.data.points || 0);

        try {
          const rewardsRes = await axios.get(
            "https://eve-back.vercel.app/loyalty/rewards",
          );
          setRewardTiers(
            rewardsRes.data
              .filter((r) => r.isActive)
              .sort((a, b) => a.pointsRequired - b.pointsRequired),
          );
        } catch (rewardsError) {
          console.error("Error al obtener premios de fidelidad:", rewardsError);
        }

        const apptsRes = await axios.get(
          `https://eve-back.vercel.app/appointments/user/${userId}`,
        );
        console.log(apptsRes);
        setAppointments(apptsRes.data.appointments);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Cuando empieza edición, carga horarios del experto y ocupados para ese experto
  useEffect(() => {
    if (editingId === null) return;

    const appt = appointments.find((a) => a.id === editingId);
    if (!appt) return;
    console.log(appt);
    const expertId = appt.Expert.id;

    const fetchHorariosExpert = async () => {
      try {
        const res = await axios.get(
          `https://eve-back.vercel.app/hours/expert/${expertId}`,
        );
        console.log(res.data);
        setHorariosExpert(res.data);
      } catch (error) {
        console.error("Error al obtener horarios del experto:", error);
        setHorariosExpert([]);
      }
    };

    const fetchAppointmentsExpert = async () => {
      try {
        const res = await axios.get("https://eve-back.vercel.app/appointments");
        const allAppointments = res.data.appointments;

        const turnosDelExperto = allAppointments.filter(
          (appt) => appt.expertId === expertId && appt.id !== editingId, // excluye el turno que editas
        );

        const ocupadosPorFecha = {};

        turnosDelExperto.forEach((appt) => {
          const date = parseISO(appt.date);
          const fechaKey = format(date, "yyyy-MM-dd");

          const bloques = [];
          const duracion = appt.tiempo;
          const cantidadBloques = Math.ceil(duracion / 60);

          for (let i = 0; i < cantidadBloques; i++) {
            const bloque = addMinutes(date, i * 60);
            bloques.push(format(bloque, "HH:mm"));
          }

          if (!ocupadosPorFecha[fechaKey]) {
            ocupadosPorFecha[fechaKey] = [];
          }

          ocupadosPorFecha[fechaKey].push(...bloques);
        });

        setOcupados(ocupadosPorFecha);
      } catch (error) {
        console.error("Error al obtener turnos:", error);
        setOcupados({});
      }
    };

    fetchHorariosExpert();
    fetchAppointmentsExpert();

    // Inicializar selectedDate y selectedTime con la fecha actual del turno
    setSelectedDate(parseISO(appt.date));
    setSelectedTime(format(parseISO(appt.date), "HH:mm"));
  }, [editingId, appointments]);

  // Función para ver si se puede editar un turno (queda más de 48 hs)
  const canEditAppointment = (dateStr) => {
    const now = new Date();
    const apptDate = new Date(dateStr);
    const diffHours = (apptDate - now) / (1000 * 60 * 60);
    return diffHours > 48;
  };

  // Calcula horarios disponibles para el experto según su horario y lo ocupado
  /*   const getHorariosDisponiblesParaFecha = () => {
    if (!selectedDate) return [];

    const diaSeleccionado = format(selectedDate, "yyyy-MM-dd");
    const horario = horariosExpert.find((h) => h.day === diaSeleccionado);

    let disponibles = [];

    if (!horario) {
      // Horario por defecto 08:00 a 20:00 (13 hs)
      disponibles = Array.from({ length: 13 }, (_, i) => {
        const hour = 8 + i;
        return `${hour.toString().padStart(2, "0")}:00`;
      });
    } else {
      const start = parseInt(horario.openTime.split(":")[0], 10);
      const end = parseInt(horario.closeTime.split(":")[0], 10);
      const cantidad = end - start;

      disponibles = Array.from({ length: cantidad }, (_, i) => {
        const hour = start + i;
        return `${hour.toString().padStart(2, "0")}:00`;
      });
    }

    const ocupadosHoy = ocupados[diaSeleccionado] || [];

    // Filtrar los horarios ocupados
    return disponibles.filter((hora) => !ocupadosHoy.includes(hora));
  }; */

  const getHorariosDisponiblesParaFecha = () => {
    if (!selectedDate || !editingId) return [];

    const appt = appointments.find((a) => a.id === editingId);
    if (!appt) return [];

    const diaSeleccionado = format(selectedDate, "yyyy-MM-dd");
    const horario = horariosExpert.find((h) => h.day === diaSeleccionado);

    if (!horario) return [];

    const expertId = appt.Expert.id;
    const servicio = appt.Service;

    const expertoTurnoCorto = expertId === 3 || expertId === 6;
    const intervaloMinutos = expertoTurnoCorto
      ? 20
      : servicio?.category?.toLowerCase() === "manicuria"
        ? 90
        : servicio?.category?.toLowerCase() === "pestañas"
          ? 120
          : 60;

    const horaInicio = parseInt(horario.openTime.split(":")[0], 10);
    const horaFin = parseInt(horario.closeTime.split(":")[0], 10);

    const horarios = [];

    let actual = new Date();
    actual.setHours(horaInicio, 0, 0, 0);

    const fin = new Date();
    fin.setHours(horaFin, 0, 0, 0);

    const duracionServicio = servicio?.tiempo || intervaloMinutos;
    const horariosOcupadosHoy = ocupados[diaSeleccionado] || [];

    while (addMinutes(actual, duracionServicio) <= fin) {
      const horaInicioStr = format(actual, "HH:mm");

      let bloqueTemp = new Date(actual);
      const finTurno = addMinutes(bloqueTemp, duracionServicio);

      let bloqueLibre = true;
      while (bloqueTemp < finTurno) {
        const bloqueStr = format(bloqueTemp, "HH:mm");
        if (horariosOcupadosHoy.includes(bloqueStr)) {
          bloqueLibre = false;
          break;
        }
        bloqueTemp = addMinutes(bloqueTemp, 30);
      }

      if (bloqueLibre) {
        horarios.push(horaInicioStr);
        actual = addMinutes(actual, intervaloMinutos);
      } else {
        actual = addMinutes(actual, expertoTurnoCorto ? 20 : 30);
      }
    }

    return horarios;
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Debes seleccionar fecha y hora");
      return;
    }

    const fechaNueva = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`,
    );

    // Validar que la nueva fecha esté más de 48 hs en el futuro
    if (!canEditAppointment(fechaNueva.toISOString())) {
      alert("La nueva fecha debe ser al menos 48 horas en el futuro.");
      return;
    }

    try {
      await axios.put(`https://eve-back.vercel.app/appointments/${editingId}`, {
        date: fechaNueva.toISOString(),
      });

      // Actualizar localmente la lista de turnos
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === editingId
            ? { ...appt, date: fechaNueva.toISOString() }
            : appt,
        ),
      );

      setEditingId(null);
      setSelectedDate(null);
      setSelectedTime("");
      setHorariosExpert([]);
      setOcupados({});
      alert("Turno actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar turno:", error);
      alert("No se pudo actualizar el turno");
    }
  };

  // 🎁 Anima el relleno de la escalera de premios cuando cambian los puntos
  useEffect(() => {
    const t = setTimeout(() => setDisplayedPoints(loyaltyPoints), 80);
    return () => clearTimeout(t);
  }, [loyaltyPoints]);

  // 📷 Maneja el ciclo de vida de la cámara mientras el modal de escaneo está abierto
  useEffect(() => {
    if (!showScanner) return;

    let cancelled = false;
    const html5QrCode = new Html5Qrcode("qr-reader-perfil");
    qrReaderRef.current = html5QrCode;

    // Único punto que detiene la cámara: evita llamar a stop() dos veces
    // (una vez detenida, stop() vuelve a llamarse tira una excepción sincrónica
    // que no se puede atrapar con .catch, y eso rompe el render de React)
    const stopCamera = () => {
      try {
        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
          return html5QrCode.stop().then(() => html5QrCode.clear());
        }
      } catch {
        // Ignorar: puede pasar si la cámara ya se estaba deteniendo
      }
      return Promise.resolve();
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          if (cancelled) return;
          cancelled = true;
          setShowScanner(false); // dispara el cleanup de este efecto, que detiene la cámara
          handleScanQr(decodedText);
        },
        () => {
          // Se llama en cada frame sin QR detectado, lo ignoramos
        },
      )
      .catch((error) => {
        console.error("No se pudo iniciar la cámara:", error);
        setScanMessage({
          type: "error",
          text: "No se pudo acceder a la cámara. Revisá los permisos.",
        });
        setShowScanner(false);
      });

    return () => {
      cancelled = true;
      stopCamera().catch(() => {});
    };
  }, [showScanner]);

  const handleScanQr = async (code) => {
    setScanning(true);
    setScanMessage(null);
    const previousPoints = loyaltyPoints;
    try {
      const res = await axios.post("https://eve-back.vercel.app/loyalty/scan", {
        userId,
        code,
      });
      const newPoints = res.data.points;
      setLoyaltyPoints(newPoints);

      // Si con este punto nuevo se cruzó el umbral de un premio, festejamos ese nodo
      const unlockedTier = rewardTiers.find(
        (t) =>
          previousPoints < t.pointsRequired && newPoints >= t.pointsRequired,
      );
      if (unlockedTier) {
        setCelebrateTierId(unlockedTier.id);
        setTimeout(() => setCelebrateTierId(null), 2200);
      }

      setScanMessage({
        type: "success",
        text: "🎉 ¡Sumaste un punto de fidelidad!",
      });
    } catch (error) {
      setScanMessage({
        type: "error",
        text: error.response?.data?.error || "No se pudo escanear el QR.",
      });
    } finally {
      setScanning(false);
    }
  };

  if (loading)
    return <p className="p-4 text-center text-gray-600">Cargando datos...</p>;

  if (!userId)
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">No se encontró usuario logueado.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Ir al login
        </button>
      </div>
    );
  console.log(appointments.payStatus);
  const turnosParciales = appointments.filter(
    (appt) => appt.payStatus === "partial" || appt.payStatus === "paid",
  );
  const ultimos3Turnos = turnosParciales.slice(-3);

  // 🎁 Arma la escalera de puntos, de a uno: un nodo por cada punto entre 1 y
  // el premio más alto configurado. Los que coinciden con un premio se marcan
  // distinto (más grandes, con el descuento) que los puntos "de relleno".
  const maxPoints =
    rewardTiers.length > 0
      ? rewardTiers[rewardTiers.length - 1].pointsRequired
      : 0;
  const tierByPoints = new Map(rewardTiers.map((t) => [t.pointsRequired, t]));

  let nextAssigned = false;
  const pointSlots = [];
  for (let p = 1; p <= maxPoints; p++) {
    const tier = tierByPoints.get(p);
    const reached = displayedPoints >= p;
    const isNext = !reached && !nextAssigned;
    if (isNext) nextAssigned = true;

    pointSlots.push({
      points: p,
      isReward: !!tier,
      tier,
      reached,
      isNext,
      isCurrent: displayedPoints > 0 && p === displayedPoints,
      celebrate: !!tier && tier.id === celebrateTierId,
      stateClass: reached ? "reached" : isNext ? "next" : "locked",
      discountLabel: tier
        ? tier.discountType === "percentage"
          ? `${tier.discountValue}% OFF`
          : `$${tier.discountValue} OFF`
        : null,
    });
  }

  const rewardSegments = pointSlots.slice(1).map((slot) => ({
    fillPct: displayedPoints >= slot.points ? 100 : 0,
    widthPct: 100 / (pointSlots.length - 1),
  }));

  const reachedTiers = rewardTiers.filter(
    (t) => displayedPoints >= t.pointsRequired,
  );
  const rewardStatusMessage =
    reachedTiers.length === 0
      ? "Todavía no llegaste a tu primer premio. ¡Sumá puntos en cada visita para desbloquearlo!"
      : `¡Tenés ${
          reachedTiers[reachedTiers.length - 1].discountType === "percentage"
            ? `${reachedTiers[reachedTiers.length - 1].discountValue}%`
            : `$${reachedTiers[reachedTiers.length - 1].discountValue}`
        } de descuento disponible para tu próximo turno de manicuria!`;
  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h2>Perfil de usuario</h2>

        <div className="perfil-datos">
          <p>
            <span>Nombre:</span> {userData?.name}
          </p>
          <p>
            <span>Email:</span> {userData?.email}
          </p>
          <p>
            <span>Teléfono:</span> {userData?.phone}
          </p>
        </div>
      </div>

      <div className="perfil-card loyalty-card">
        <h2>Puntos de fidelidad</h2>

        {rewardTiers.length > 0 ? (
          <>
            <p className="loyalty-subtitle">
              Tenés {loyaltyPoints} {loyaltyPoints === 1 ? "punto" : "puntos"} —
              sumás 1 por cada turno de manicuria pagado.
            </p>

            <div className="reward-ladder">
              <div className="reward-track-base">
                {rewardSegments.map((seg, i) => (
                  <div
                    key={i}
                    className="reward-track-segment"
                    style={{ width: `${seg.widthPct}%` }}
                  >
                    <div
                      className="reward-track-fill"
                      style={{ width: `${seg.fillPct}%` }}
                    ></div>
                  </div>
                ))}
              </div>

              <div
                className="reward-nodes-row"
                style={{
                  justifyContent:
                    pointSlots.length === 1 ? "center" : "space-between",
                }}
              >
                {/* --node-i escalona las animaciones de los premios: el brillo
                    viaja de uno a otro como una ola a lo largo de la escalera */}
                {pointSlots.map((slot, idx) =>
                  slot.isReward ? (
                    <div
                      className="reward-node"
                      key={slot.points}
                      title={slot.tier.description}
                      style={{ "--node-i": idx }}
                    >
                      <div className="reward-node-top">
                        {slot.isCurrent && (
                          <div className="reward-here-arrow" />
                        )}
                        <div
                          className={`reward-circle ${slot.stateClass} ${
                            slot.celebrate ? "celebrate" : ""
                          }`}
                        >
                          {slot.reached ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="5"
                                y="11"
                                width="14"
                                height="9"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M8 11V7a4 4 0 0 1 8 0v4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className={`reward-points-label ${slot.stateClass}`}>
                        {slot.points} pt{slot.points === 1 ? "" : "s"}
                      </div>
                      <div
                        className={`reward-discount-label ${slot.stateClass}`}
                      >
                        {slot.discountLabel}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="reward-node reward-node-plain"
                      key={slot.points}
                    >
                      <div className="reward-node-top">
                        {slot.isCurrent && (
                          <div className="reward-here-arrow" />
                        )}
                        <div className={`reward-dot ${slot.stateClass}`}></div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <p className="loyalty-points">{rewardStatusMessage}</p>
          </>
        ) : (
          <div className="loyalty-card-body">
            <p className="loyalty-count">
              <span className="loyalty-count-number">{loyaltyPoints}</span>
              {loyaltyPoints === 1 ? " punto" : " puntos"}
            </p>
          </div>
        )}

        <div className="loyalty-scan-row">
          <button
            className="scan-qr-button"
            disabled={scanning}
            onClick={() => {
              setScanMessage(null);
              setShowScanner(true);
            }}
          >
            <QrCode size={18} />
            {scanning ? "Procesando..." : "Escanear QR"}
          </button>
        </div>
        {scanMessage && (
          <p
            className={
              scanMessage.type === "success"
                ? "loyalty-message success"
                : "loyalty-message error"
            }
          >
            {scanMessage.text}
          </p>
        )}
      </div>

      {showScanner && (
        <div className="qr-scanner-overlay">
          <div className="qr-scanner-modal">
            <div className="qr-scanner-header">
              <h3>Escaneá el QR del local</h3>
              <button
                className="qr-scanner-close"
                onClick={() => setShowScanner(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div id="qr-reader-perfil" className="qr-reader-box"></div>
            <p className="qr-scanner-hint">
              Apuntá la cámara al código QR que te muestren en el local.
            </p>
          </div>
        </div>
      )}

      <ComentarioForm></ComentarioForm>
      <h2 className="turnos-title">Mis turnos</h2>
      {ultimos3Turnos.length === 0 ? (
        <p className="mensaje-vacio">No tenés turnos reservados aún.</p>
      ) : (
        ultimos3Turnos.map((appt) => (
          <div key={appt.id} className="turno-card">
            <p>
              <span>Servicio:</span> {appt.Service.name}
            </p>
            <p>
              <span>Especialista:</span> {appt.Expert.name}
            </p>
            <p>
              <span>Fecha:</span>{" "}
              {editingId === appt.id ? (
                <>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    locale="es-ES"
                    tileClassName={({ date }) =>
                      isSameDay(date, new Date()) ? "today-day" : ""
                    }
                  />
                  <div className="horarios-grid" style={{ marginTop: "10px" }}>
                    {getHorariosDisponiblesParaFecha().map((hora) => (
                      <button
                        key={hora}
                        className={`horario-btn ${
                          selectedTime === hora ? "activo" : ""
                        }`}
                        onClick={() => setSelectedTime(hora)}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      gap: "16px",
                      justifyContent: "center", // 👉 centra los botones horizontalmente
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={handleSave}
                      disabled={!selectedTime}
                      style={{
                        background: selectedTime
                          ? "linear-gradient(90deg, #C0A439, #E6C55A)"
                          : "#ccc",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: selectedTime ? "pointer" : "not-allowed",
                        opacity: selectedTime ? 1 : 0.6,
                        transition: "all 0.3s ease",
                        fontWeight: "bold",
                        boxShadow: selectedTime
                          ? "0 3px 8px rgba(192, 164, 57, 0.4)"
                          : "none",
                      }}
                    >
                      Guardar
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setSelectedDate(null);
                        setSelectedTime("");
                        setHorariosExpert([]);
                        setOcupados({});
                      }}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "#333",
                        padding: "10px 20px",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        fontWeight: "bold",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                new Date(appt.date).toLocaleString("es-AR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })
              )}
            </p>
            <p>
              <span>Estado de pago:</span> {appt.payStatus}
            </p>

            {editingId !== appt.id && canEditAppointment(appt.date) && (
              <div className="container-editar">
                <button
                  onClick={() => setEditingId(appt.id)}
                  className="button-editar"
                >
                  Editar fecha
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => navigate("/editar-perfil")}
          style={{
            background: "linear-gradient(90deg, #C0A439, #E6C55A)",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 3px 8px rgba(192, 164, 57, 0.4)",
            transition: "all 0.3s ease",
          }}
        >
          Editar Perfil
        </button>
      </div>
      <UserCompras></UserCompras>
    </div>
  );
};

export default Perfil;
