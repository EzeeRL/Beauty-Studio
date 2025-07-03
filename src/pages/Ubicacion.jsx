import "./Ubicacion.css";

const Ubicacion = () => (
  <div className="ubicacion-container">
    <h2>¿Dónde estamos?</h2>

    <div className="mapa-wrapper">
      <iframe
        title="Ubicación - Local"
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d205.11164002497563!2d-58.34567926948398!3d-34.66010097370142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sar!4v1751582226279!5m2!1ses!2sar"
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>

    <div className="abrir-maps">
      <a
        href="https://maps.app.goo.gl/2x1BzZC9vq3a9ndp8"
        target="_blank"
        rel="noopener noreferrer"
        className="abrir-maps-boton"
      >
        Abrir en Google Maps
      </a>
    </div>
  </div>
);

export default Ubicacion;
