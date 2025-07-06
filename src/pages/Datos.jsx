import { useNavigate } from "react-router-dom";
import useServicioStore from "../store/servicioStore";
import { useState,useEffect } from "react";
import axios from "axios";
import "./Datos.css";

const Datos = () => {
  const navigate = useNavigate();
  const { servicio, experto, fecha, setDatosCliente, datosCliente } = useServicioStore();

const [formData, setFormData] = useState({
  nombre: datosCliente?.nombre || "",
  email: datosCliente?.email || "",
  telefono: datosCliente?.telefono || "",
});

/*   useEffect(() => {
  setFormData({
    nombre: datosCliente.nombre || "",
    email: datosCliente.email || "",
    telefono: datosCliente.telefono || "",
  });
}, []); */

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      console.log("✅ Usuario creado con ID:", userId);
      localStorage.setItem("userId", userId);
      // 2️⃣ Crear turno
      console.log("📆 Creando turno...");
      const appointmentRes = await axios.post("https://eve-back.vercel.app/appointments", {
        userId,
        expertId: experto.id,
        serviceId: servicio.id,
        date: fecha,
      });

      const appointmentId = appointmentRes.data.appointment.id;
      console.log("✅ Turno creado con ID:", appointmentId);

      // 3️⃣ Crear preferencia de pago
      console.log("💰 Creando preferencia de pago en MercadoPago...");
      const preferenceRes = await axios.post("https://eve-back.vercel.app/pay", {
        title: servicio.name,
        quantity: 1,
        unit_price: servicio.price,
        metadata: {
          appointmentId,
        },
      });

      const { init_point } = preferenceRes.data;
      console.log("🧾 Preferencia creada. Redirigiendo a:", init_point);

      // 4️⃣ Redirigir al checkout de MercadoPago
      window.location.href = init_point;

    } catch (error) {
      console.error("❌ Error durante el proceso de reserva:", error);
      alert("Hubo un error al crear tu turno. Intentalo nuevamente.");
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
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          onChange={handleChange}
           value={formData.email}
           className="input"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          required
          value={formData.telefono}
          className="input"
          onChange={handleChange}
        />
        <p className="info-form">
          Usaremos tus datos para comunicarnos un día antes de tu reserva.
        </p>
        <button type="submit" className="continue-button">
          Continuar a pago
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
