
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
      <img src="https://instagram.faep8-1.fna.fbcdn.net/v/t51.2885-15/503542041_18058586270257765_1015939736854955890_n.jpg?stp=dst-jpg_e35_p640x640_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IlNUT1JZLmltYWdlX3VybGdlbi4xMjg0eDIyODIuc2RyLmY3NTc2MS5kZWZhdWx0X2ltYWdlIn0&_nc_ht=instagram.faep8-1.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2QG8BHr4dhtzOkUnB8OZSIGWBJ5JsjFsIWKH-GwSkPyQBtSiGNncL-VB4HhOD2z9MqDztEftoTvLx3BvHZQiH9JQ&_nc_ohc=V2AFE5IBjFQQ7kNvwHRPPWn&_nc_gid=4EFwmzAWXo2mOiOgeMzjWQ&edm=AGFyKLkBAAAA&ccb=7-5&ig_cache_key=MzY1OTIwMzkwNTYyODcyODE3OQ%3D%3D.3-ccb7-5&oh=00_AfRFxjicVlzRunUvP5afMQgO4eSVLr2-VVP4TZQsxRQvHQ&oe=687B5C35&_nc_sid=5a0a6d" alt="" />
    </div>
   
  </div>
);

export default Ubicacion;
