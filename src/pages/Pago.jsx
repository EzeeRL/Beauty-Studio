import { useNavigate } from "react-router-dom";
import useServicioStore from "../store/servicioStore";

const Pago = () => {
  const navigate = useNavigate();
  const { servicio, experto, fecha, datosCliente, reset } = useServicioStore();

  const handlePayment = () => {
    // Aquí enviarías todos los datos al backend
    console.log("Datos del turno:", {
      servicio,
      experto,
      fecha,
      datosCliente,
    });

    alert("Pago completado exitosamente!");
    reset(); // Limpiar el store
    navigate("/");
  };

  return (
    <div className="pago-container">
      <h2>Resumen y pago</h2>

      <div className="resumen">
        <h3>Detalles del servicio</h3>
        <p>
          <strong>Servicio:</strong> {servicio?.name}
        </p>
        <p>
          <strong>Precio:</strong> ${servicio?.price}
        </p>
        <p>
          <strong>Profesional:</strong> {experto?.name}
        </p>
        <p>
          <strong>Fecha:</strong> {fecha?.toLocaleString()}
        </p>

        <h3>Tus datos</h3>
        <p>
          <strong>Nombre:</strong> {datosCliente?.nombre}
        </p>
        <p>
          <strong>Email:</strong> {datosCliente?.email}
        </p>
        <p>
          <strong>Teléfono:</strong> {datosCliente?.telefono}
        </p>
      </div>

      {/* Componente de pago aquí */}
      <button onClick={handlePayment} className="pay-button">
        Confirmar pago
      </button>
    </div>
  );
};

export default Pago;
