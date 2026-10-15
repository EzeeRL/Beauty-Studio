// Datos de presentación de servicios para el inicio de escritorio.
// Copia del orden, las fotos y las descripciones que usa ServiceSection.jsx
// (la vista mobile). Si cambiás algo allá, actualizalo también acá.

const ORDEN_MANICURIA = [
  "Semipermanente con nivelación",
  "Capping ",
  "Esculpidas en acrílico N1 o 2",
  "Esculpidas en acrílico N3",
  "Esculpidas en acrílico N4",
  "Soft gel",
  "Soft gel XL",
  "Semipermanente en pies",
  "Set nuevo + retiro.",
];

const ORDEN_PESTANAS = [
  "Clasicas",
  "Efecto rímel",
  "V. Brasilero (2D)",
  "V. Hawaiano (3D)",
  "V. Hollywood (4D)",
  "V. Argentino (5D)",
  "Capping mega 6D",
  "Volumen tech marrones",
  "V. Ef foxy (2D/3D)",
  "Spire Lashes",
];

const IMAGENES = {
  "V. Brasilero (2D)": "/pestañas/2d.jpeg",
  "Spire Lashes": "/pestañas/sprieLashes.jpeg",
  "V. Hawaiano (3D)": "/pestañas/3d.jpeg",
  "V. Hollywood (4D)": "/pestañas/4d.jpeg",
  "Efecto rímel": "/pestañas/rimel.jpeg",
  "Capping mega 6D": "/pestañas/6d.jpeg",
  "Volumen mega 6D": "/pestañas/mega6d.jpeg",
  Clasicas: "/pestañas/clasicas.jpeg",
  "V. Argentino (5D)": "/pestañas/5d.jpeg",
  "Volumen foxy": "/pestañas/vfoxy.jpeg",
  "Laminado + perfilado": "/pestañas/perf.jpeg",
  "Volumen tech marrones": "/pestañas/VolumenTechMarrones.jpeg",
  "Lifting con tinte y nutricion": "/lifting/lifting.jpeg",
  "Diseño, perfilado y henna": "/lifting/perfilado.jpeg",
  "Diseño y perfilado de cejas con hilo": "/lifting/lamyperf.jpeg",
  "Full cejas: Diseño + perfilado + laminado + henna": "/lifting/fullcejas.jpeg",
  "Diseño, perfilado y laminado": "/lifting/diseñoperfilado.jpeg",
};

const DESCRIPCIONES = {
  "Lifting con tinte y nutricion":
    "El Lash Lifting es una técnica que trabaja sobre tus pestañas naturales, arqueándolas desde la raíz. Además, les aportamos color para que luzcan más intensas y definidas, sin necesidad de máscara de pestañas.",
  "Diseño, perfilado y henna":
    "En el perfilado de cejas combinamos la técnica con hilo y pinza. La henna es un tinte que aporta color y rellena visualmente las áreas despobladas. Su duración aprox es de hasta 10 días en la piel, dependiendo de los cuidados posteriores.",
  "Dieño y perfilado de cejas":
    "Combinamos la técnica con hilo y pinza para retirar hasta los vellos más pequeños y lograr un diseño limpio, preciso y súper definido.",
  "Diseño, perfilado y laminado":
    "En el perfilado de cejas combinamos la técnica con hilo y pinza. El laminado alisa y estira los vellos para mantenerlos en su lugar, logra un efecto prolijo, ordenado y con mayor volumen. Su duración aprox es de 21 días.",
};

// Foto de portada de cada categoría en el mosaico
const IMAGENES_CATEGORIA = {
  Manicuria: "/curso3.jpeg",
  Cosmetologia: "/lifting/perfilado.jpeg",
  Pestañas: "/pestañas/2d.jpeg",
  "Lash lifting y cejas": "/lifting/lifting.jpeg",
  "Lifting y cejas": "/lifting/lifting.jpeg",
};

export const ordenarServicios = (categoria, servicios) => {
  const orden =
    categoria === "Manicuria"
      ? ORDEN_MANICURIA
      : categoria === "Pestañas"
        ? ORDEN_PESTANAS
        : null;
  if (!orden) return servicios;
  const enOrden = orden
    .map((nombre) => servicios.find((s) => s.name === nombre))
    .filter(Boolean);
  const resto = servicios.filter((s) => !orden.includes(s.name));
  return [...enOrden, ...resto];
};

export const imagenServicio = (servicio) =>
  IMAGENES[servicio.name] || servicio.image || null;

export const descripcionServicio = (servicio) =>
  DESCRIPCIONES[servicio.name] || servicio.description || "";

export const imagenCategoria = (categoria, servicios = []) =>
  IMAGENES_CATEGORIA[categoria] ||
  servicios.map(imagenServicio).find(Boolean) ||
  null;
