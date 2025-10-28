import { useNavigate } from "react-router-dom";
import useServicioStore from "../store/servicioStore";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Datos.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Datos = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState(null);

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

      // 3️⃣ Si userId NO es 3 => Redirigir a MercadoPago
      if (userId !== 3) {
        console.log("💰 Creando preferencia de pago en MercadoPago...");
        const preferenceRes = await axios.post(
          "https://eve-back.vercel.app/pay",
          {
            title: servicio.name,
            quantity: 1,
            unit_price: 10000,
            metadata: {
              appointmentId,
              appointmentId2,
              expertId: experto.id,
              appointmentDate: fecha.toISOString(), // objeto Date a string ISO
              tiempo: servicio.duration || 60,
            },
          }
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
      <h2>Ingresa tus datos</h2>

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

        {errors.telefono && <p className="error">{errors.telefono}</p>}
        <p className="info-form">
          Usaremos tus datos para comunicarnos un día antes de tu reserva.
        </p>
        <button type="submit" className="continue-button" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Continuar a pago"}
        </button>
      </form>

      <div className="container-info-turno">
        <h2>Información de tu turno</h2>
        <div className="info-turno">
          <p>Fecha: {fecha?.toLocaleString()}</p>
          <p>Servicio: {servicio?.name}</p>
          <p>Profesional: {experto?.name}</p>
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
