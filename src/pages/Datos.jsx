import { useNavigate } from "react-router-dom";
import useServicioStore from "../store/servicioStore";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Datos.css";

const Datos = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const { servicio, experto, fecha, setDatosCliente, datosCliente } =
    useServicioStore();

  const [formData, setFormData] = useState({
    nombre: datosCliente?.nombre || "",
    email: datosCliente?.email || "",
    telefono: datosCliente?.telefono || "",
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

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    if (!formData.telefono.trim())
      newErrors.telefono = "El teléfono es obligatorio.";

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
      alert("Hubo un error al crear tu turno. Intentalo nuevamente.");
    } finally {
      setLoading(false); // <- importante
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
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          required
          value={formData.telefono}
          className="input"
          onChange={handleChange}
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
    </div>
  );
};

export default Datos;
