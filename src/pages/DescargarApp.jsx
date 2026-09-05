import "./DescargarApp.css";

const DescargarApp = () => (
  <div className="descargar-app-container">
    <div className="descargar-app-card">
      <img src="/logo.png" alt="Logo D´Art" className="descargar-app-logo" />
      <h1>Descargá nuestra app</h1>
      <p className="descargar-app-subtitle">
        Reservá tus turnos, recibí novedades y descuentos exclusivos directo
        desde tu celular.
      </p>

      <a href="/StudioDart.apk" download className="descargar-app-btn">
        📲 Descargar APK
      </a>

      <p className="descargar-app-meta">Android · APK · ~63 MB</p>

      <div className="descargar-app-help">
        <strong>¿Cómo instalarla?</strong>
        <ol>
          <li>Descargá el archivo APK con el botón de arriba.</li>
          <li>Abrilo desde tus notificaciones o desde "Archivos".</li>
          <li>
            Si tu celular te avisa que es de un "origen desconocido",
            aceptá la instalación desde ese mensaje.
          </li>
        </ol>
      </div>
    </div>
  </div>
);

export default DescargarApp;
