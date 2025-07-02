import { useNavigate } from "react-router-dom";
import useServicioStore from "../store/servicioStore";
import { useState } from "react";

const Datos = () => {
  const navigate = useNavigate();
  const { servicio, experto, fecha, setDatosCliente } = useServicioStore();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setDatosCliente(formData);
    navigate("/pago");
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
      <p>Servicio: {servicio?.name}</p>
      <p>Profesional: {experto?.name}</p>
      <p>Fecha: {fecha?.toLocaleString()}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          required
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          required
          onChange={handleChange}
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          required
          onChange={handleChange}
        />
        <button type="submit" className="continue-button">
          Continuar a pago
        </button>
      </form>
    </div>
  );
};

export default Datos;
