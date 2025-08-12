import "./Cursos.css";

const cursos = [
  {
    id: "manicuria",
    titulo: "Curso Presencial de Manicuría",
    descripcion:
      "Una experiencia completa con clases presenciales y acceso a material digital. Aprendé desde cero o perfeccionate con acompañamiento constante.",
    imagen: "/curso2.jpeg",
    whatsappMsg:
      "Hola, estoy interesada en el curso presencial de manicura. ¿Podrías darme más información?",
    features: [
      ["📆 Duración", "Clases intensivas semanales"],
      [
        "🏫 Modalidad",
        "Clases presenciales + Material digital online y fisico",
      ],
      ["📄 Certificado", "Certificación profesional al finalizar"],
      ["📚 Material", "Apuntes descargables por módulo y acceso continuo"],
      [
        "💬 Comunidad",
        "Atencion personalizada para resolver dudas y compartir avances",
      ],
    ],
  },
  {
    id: "pestanas",
    titulo: "Curso de Extensión de Pestañas",
    descripcion:
      "Aprendé desde cero cómo aplicar extensiones de pestañas con técnicas modernas y seguras. Incluye material digital.",
    imagen: "/curso3.jpeg",
    whatsappMsg:
      "Hola, estoy interesada en el curso de extensión de pestañas. ¿Me podrías brindar más info?",
    features: [
      ["📆 Duración", "6 semanas con prácticas supervisadas"],
      ["🏫 Modalidad", "Clases presenciales + acceso a videos tutoriales"],
      ["📄 Certificado", "Certificación incluida"],
      ["🛠️ Kit inicial", "Incluye materiales básicos para prácticas"],
      ["💬 Soporte", "Acompañamiento personalizado post curso"],
    ],
  },
];

const Cursos = () => {
  return (
    <div className="cursos-container">
      {cursos.map((curso) => {
        const whatsappLink = `https://wa.me/5491159763452?text=${encodeURIComponent(
          curso.whatsappMsg
        )}`;

        return (
          <div className="curso-header" key={curso.id}>
            <img
              src={curso.imagen}
              alt={curso.titulo}
              className="curso-image"
            />
            <div className="curso-header-content">
              <h1>{curso.titulo}</h1>
              <p>{curso.descripcion}</p>

              <div className="curso-buttons">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn whatsapp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.52 3.48A11.82 11.82 0 0012 0C5.37 0 0 5.37 0 12a11.9 11.9 0 001.65 6.1L0 24l6.28-1.65A11.86 11.86 0 0012 24c6.63 0 12-5.37 12-12a11.82 11.82 0 00-3.48-8.52zM12 22a9.77 9.77 0 01-5-1.35l-.36-.21-3.73.99.99-3.63-.24-.39A9.77 9.77 0 1122 12c0 5.52-4.48 10-10 10zm5.06-7.58l-2.4-.69a.74.74 0 00-.7.19l-.9.93a7.3 7.3 0 01-3.42-3.42l.93-.9a.74.74 0 00.19-.7l-.69-2.4a.75.75 0 00-.72-.53H9.2a1.61 1.61 0 00-1.6 1.86 9.59 9.59 0 008.35 8.35 1.61 1.61 0 001.86-1.6v-1.14a.75.75 0 00-.53-.72z" />
                  </svg>
                  Consultanos por WhatsApp
                </a>

                <a href="#material-del-curso" className="btn material">
                  Acceder al material (próximamente)
                </a>
              </div>
            </div>

            <div className="curso-features">
              {curso.features.map(([titulo, detalle], i) => (
                <div className="feature-card" key={i}>
                  <h3>{titulo}</h3>
                  <p>{detalle}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Cursos;
