import { useNavigate } from "react-router-dom";
import useServicioStore from "../store/servicioStore";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Datos.css";
import ReservaSteps from "../components/ReservaSteps";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { CalendarDays, Sparkles, UserRound } from "lucide-react";

const Datos = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState("");

  const BASE_PRICE = 10000; // Precio normal
  const { servicio, experto, fecha, setDatosCliente, datosCliente } =
    useServicioStore();
  console.log("💾 localStorage userId:", localStorage.getItem("userId"));
  const procesarTelefono = (tel) => {
    if (!tel) return "549";
    const limpio = tel.replace(/\D/g, ""); // solo dígitos

    if (limpio.length === 12) {
      return limpio.slice(3); // quitar primeros 3
    }

    return limpio.startsWith("549") ? limpio : `549${limpio}`;
  };

  const [formData, setFormData] = useState({
    nombre: datosCliente?.nombre || "",
    email: datosCliente?.email || "",
    telefono: procesarTelefono(datosCliente?.telefono),
  });

  const [loading, setLoading] = useState(false);

  // 🎁 Traer puntos y premios de fidelidad disponibles (solo si ya conocemos al usuario)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`https://eve-back.vercel.app/users/${userId}`)
      .then((res) => {
        setLoyaltyPoints(res.data.points || 0);
        setAvailableRewards(res.data.availableRewards || []);
      })
      .catch(() => {
        // Si falla, simplemente no mostramos opciones de canje
      });
  }, []);

  // 🟡 Función para verificar el cupón en el backend
  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifyingCoupon(true);
    setCouponStatus(null);

    try {
      const res = await axios.post(
        "https://eve-back.vercel.app/coupons/validate",
        {
          code: couponCode,
          serviceId: servicio?.id,
        },
      );

      if (res.data.valid) {
        setCouponStatus({
          valid: true,
          type: res.data.coupon.discountType,
          value: res.data.coupon.discountValue,
          message: "✅ ¡Cupón aplicado correctamente!",
        });
      }
    } catch (error) {
      setCouponStatus({
        valid: false,
        message:
          "❌ " + (error.response?.data?.error || "Cupón inválido o expirado"),
      });
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const selectedReward = availableRewards.find(
    (r) => String(r.id) === String(selectedRewardId),
  );

  // 🧮 Calcular el precio final en base al premio de fidelidad o al cupón
  // (son excluyentes entre sí; el premio de fidelidad tiene prioridad si hay uno seleccionado)
  let finalPrice = BASE_PRICE;
  if (selectedReward) {
    if (selectedReward.discountType === "percentage") {
      finalPrice = BASE_PRICE - BASE_PRICE * (selectedReward.discountValue / 100);
    } else if (selectedReward.discountType === "fixed") {
      finalPrice = BASE_PRICE - selectedReward.discountValue;
    }
  } else if (couponStatus?.valid) {
    if (couponStatus.type === "percentage") {
      finalPrice = BASE_PRICE - BASE_PRICE * (couponStatus.value / 100);
    } else if (couponStatus.type === "fixed") {
      finalPrice = BASE_PRICE - couponStatus.value;
    }
  }
  if (finalPrice < 0) finalPrice = 0;

  /*   useEffect(() => {
  setFormData({
    nombre: datosCliente.nombre || "",
    email: datosCliente.email || "",
    telefono: datosCliente.telefono || "",
  });
}, []); */

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const telefonoLimpio = formData.telefono.replace(/\D/g, "");
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    if (!formData.telefono.trim())
      newErrors.telefono = "El teléfono es obligatorio.";
    if (telefonoLimpio.length < 13) {
      newErrors.telefono = "El teléfono debe tener al menos 10 números.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      console.log("📤 Enviando formulario con datos:", formData);

      setDatosCliente(formData);

      // 1️⃣ Crear usuario
      console.log("👤 Creando usuario...");
      const userRes = await axios.post("https://eve-back.vercel.app/users", {
        name: formData.nombre,
        email: formData.email,
        phone: formData.telefono,
      });

      const userId = userRes.data.user.id;
      // console.log("✅ Usuario creado con ID:", userId);
      localStorage.setItem("userId", userId);

      // 2️⃣ Crear turno
      const appointmentEndpoint =
        userId === 3
          ? "https://eve-back.vercel.app/appointments/eve"
          : "https://eve-back.vercel.app/appointments";

      // console.log("📆 Creando turno en:", appointmentEndpoint);
      const appointmentRes = await axios.post(appointmentEndpoint, {
        userId,
        expertId: experto.id,
        serviceId: servicio.id,
        date: fecha,
      });

      const appointmentId = appointmentRes.data.appointment.id;
      const appointmentId2 = appointmentRes?.data?.mirroredAppointment?.id;

      // console.log("✅ Turno creado con ID:", appointmentId);

      // 2.5️⃣ Si hay un cupón válido, informamos al backend que se use (se incremente el contador)
      if (couponStatus?.valid) {
        try {
          await axios.post("https://eve-back.vercel.app/coupons/apply", {
            code: couponCode,
            serviceId: servicio.id,
          });
        } catch (couponErr) {
          // Si falla el cupón al intentar aplicarlo (ej: se agotó justo en ese segundo)
          // podés decidir si frenar el pago o dejarlo pasar.
        }
      }
      // 3️⃣ Si userId NO es 3 => Redirigir a MercadoPago
      if (userId !== 3) {
        console.log("💰 Creando preferencia de pago en MercadoPago...");
        const metadata = {
          appointmentId,
          appointmentId2,
          expertId: experto.id,
          appointmentDate: fecha.toISOString(), // objeto Date a string ISO
          tiempo: servicio.duration || 60,
        };
        // Solo mandamos loyaltyRewardId si el cliente eligió canjear un premio
        if (selectedReward) {
          metadata.loyaltyRewardId = selectedReward.id;
        }

        const preferenceRes = await axios.post(
          "https://eve-back.vercel.app/pay",
          {
            title: servicio.name,
            quantity: 1,
            unit_price: finalPrice,
            metadata,
          },
        );

        const { init_point } = preferenceRes.data;
        console.log("🧾 Preferencia creada. Redirigiendo a:", init_point);

        window.location.href = init_point;
      } else {
        // 4️⃣ Si es user 3, mostrar mensaje sin redirección
        alert("✅ Turno reservado correctamente (EVE)");
      }
    } catch (error) {
      console.error("❌ Error durante el proceso de reserva:", error);
      if (error.response?.status === 400) {
        // 🚨 Mostrar modal con mensaje de backend
        setModalError(error.response.data.error);
      } else {
        // Error genérico
        setModalError("Hubo un error al crear tu turno. Intentalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="datos-container">
      <ReservaSteps currentStep={3} />
      <h2 className="tituloDatos">Ingresa tus datos</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          required
          onChange={handleChange}
          value={formData.nombre}
          className="input"
        />
        {errors.nombre && <p className="error">{errors.nombre}</p>}
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          onChange={handleChange}
          value={formData.email}
          className="input"
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <PhoneInput
          country={"ar"}
          className="input"
          preferredCountries={["ar"]}
          value={formData.telefono}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              telefono: value,
            }))
          }
          inputProps={{
            name: "telefono",
            required: true,
            placeholder: "Ej: 54 (911) 6359-2430",
          }}
          masks={{ ar: "(...) ....-...." }}
          // 👈 esta línea fuerza (911) XXX-XXXX
          inputStyle={{
            width: "100%",
            height: "40px",
            fontSize: "16px",
            paddingLeft: "48px",
            letterSpacing: "1px",
            background: "transparent",
            border: "none",

            paddingBottom: "15px",
          }}
          buttonStyle={{
            border: "none",
            background: "transparent",
          }}
          containerStyle={{ marginBottom: "1rem" }}
        />
        {/* 🎁 SECCIÓN DE PUNTOS DE FIDELIDAD */}
        {availableRewards.length > 0 && (
          <div className="loyalty-container">
            <p className="loyalty-points">
              Tenés {loyaltyPoints} {loyaltyPoints === 1 ? "punto" : "puntos"}{" "}
              acumulados 🎉
            </p>
            <select
              className="input loyalty-select"
              value={selectedRewardId}
              disabled={!!couponStatus?.valid}
              onChange={(e) => setSelectedRewardId(e.target.value)}
            >
              <option value="">No canjear ningún premio</option>
              {availableRewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.description}
                </option>
              ))}
            </select>
            {couponStatus?.valid && (
              <p className="loyalty-hint">
                Ya tenés un cupón aplicado, no podés combinarlo con un premio.
              </p>
            )}
          </div>
        )}

        {/* 🎟️ SECCIÓN DE CUPONES */}
        <div className="coupon-container">
          <div className="coupon-input-group">
            <input
              type="text"
              placeholder="¿Tenés un código de descuento?"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="input coupon-input"
              disabled={!!selectedReward}
            />
            <button
              type="button"
              onClick={handleVerifyCoupon}
              disabled={verifyingCoupon || !couponCode.trim() || !!selectedReward}
              className="verify-button"
            >
              {verifyingCoupon ? "..." : "Aplicar"}
            </button>
          </div>
          {selectedReward && (
            <p className="coupon-error">
              Ya elegiste canjear un premio de fidelidad, no podés combinarlo con
              un cupón.
            </p>
          )}
          {couponStatus && !selectedReward && (
            <p
              className={couponStatus.valid ? "coupon-success" : "coupon-error"}
            >
              {couponStatus.message}
            </p>
          )}
        </div>

        {(selectedReward || couponStatus?.valid) && (
          <div className="payment-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${BASE_PRICE}</span>
            </div>
            <div className="summary-row discount-row">
              <span>Descuento aplicado:</span>
              <span>-${BASE_PRICE - finalPrice}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total a pagar:</span>
              <span>${finalPrice}</span>
            </div>
          </div>
        )}
        {/* 💰 RESUMEN DE PAGO */}

        {errors.telefono && <p className="error">{errors.telefono}</p>}
        <p className="info-form">
          Usaremos tus datos para comunicarnos un día antes de tu reserva.
        </p>
        <button type="submit" className="continue-button" disabled={loading}>
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <>
              Continuar a pago
              <img
                src="/mercado.png"
                alt="Mercado Pago"
                className="mercado-pago-icon"
              />
            </>
          )}
        </button>
      </form>

      <div className="container-info-turno">
        <h2 className="title-info-turno">Información de tu turno</h2>
        <div className="info-turno">
          <div className="info-turno-row">
            <span className="info-turno-icon">
              <CalendarDays size={18} />
            </span>
            <div className="info-turno-text">
              <span className="info-turno-label">Fecha</span>
              <span className="info-turno-value">
                {fecha?.toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
          <div className="info-turno-row">
            <span className="info-turno-icon">
              <Sparkles size={18} />
            </span>
            <div className="info-turno-text">
              <span className="info-turno-label">Servicio</span>
              <span className="info-turno-value">{servicio?.name}</span>
            </div>
          </div>
          <div className="info-turno-row">
            <span className="info-turno-icon">
              <UserRound size={18} />
            </span>
            <div className="info-turno-text">
              <span className="info-turno-label">Profesional</span>
              <span className="info-turno-value">
                {experto?.name?.trim()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* 🆕 Modal de error */}
      {modalError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error en la reserva</h3>
            <p>{modalError}</p>
            <button onClick={() => setModalError(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Datos;
