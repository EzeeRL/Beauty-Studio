// Cálculos de la sección Ingresos. Son funciones puras: reciben los turnos
// (ya filtrados a paid/partial por useAppointments) y devuelven datos listos
// para mostrar. Los componentes solo las llaman dentro de un useMemo.
import {
  startOfMonth,
  endOfMonth,
  endOfDay,
  subMonths,
  addMonths,
  eachMonthOfInterval,
  differenceInCalendarDays,
  format,
  getDay,
  getHours,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

// ── Reglas del negocio ──────────────────────────────────────────────────────

// Usuario con el que Evelyn carga turnos a mano desde el panel: no es una
// clienta real, así que no entra en las métricas de clientas.
export const USER_ID_ADMIN = 3;

export const esJefa = (expert) =>
  (expert?.name ?? "").toLowerCase().includes("evelyn duarte");

// Parte del precio que le corresponde a la experta (el resto queda en el estudio)
export const porcentajeExperta = (expert) => {
  if (esJefa(expert)) return 0;
  if (Number(expert?.id) === 4) return 0.7;
  return 0.8;
};

export const precioTurno = (appt) => appt.Service?.price ?? 0;

export const gananciaEstudio = (appt) =>
  precioTurno(appt) * (1 - porcentajeExperta(appt.Expert));

// Minutos que ocupa el turno en la agenda
export const duracionTurno = (appt) =>
  Number(appt.tiempo) || Number(appt.Service?.duration) || 60;

// ── Formato ─────────────────────────────────────────────────────────────────

export const formatoPesos = (n) =>
  `$${Math.round(n || 0).toLocaleString("es-AR")}`;

// $1.250.000 → $1,3M · $85.000 → $85k (para ejes y celdas chicas)
export const formatoPesosCorto = (n) => {
  const v = Math.round(n || 0);
  if (Math.abs(v) >= 1_000_000)
    return `$${(v / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}M`;
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${v}`;
};

export const nombreMes = (fecha) => {
  const txt = format(fecha, "MMM", { locale: es }).replace(".", "");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

export const nombreMesLargo = (fecha) => {
  const txt = format(fecha, "MMMM yyyy", { locale: es });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

// ── Helpers ─────────────────────────────────────────────────────────────────

export const turnosValidos = (appts) =>
  appts.filter((a) => a.Service && a.Expert && a.date);

export const fechaTurno = (appt) => new Date(appt.date);

export const enRango = (appts, desde, hasta) =>
  appts.filter((a) => {
    const f = fechaTurno(a);
    return f >= desde && f <= hasta;
  });

const sumar = (appts, fn = precioTurno) =>
  appts.reduce((acc, a) => acc + fn(a), 0);

const mediana = (nums) => {
  if (nums.length === 0) return null;
  const orden = [...nums].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
};

const promedio = (nums) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;

// % de cambio; null si no hay base para comparar
export const variacion = (actual, anterior) =>
  anterior > 0 ? ((actual - anterior) / anterior) * 100 : null;

const resumenDe = (appts) => {
  const ingresos = sumar(appts);
  return {
    ingresos,
    turnos: appts.length,
    ticket: appts.length ? ingresos / appts.length : 0,
  };
};

// ── Colores por experta ─────────────────────────────────────────────────────

// Paleta categórica validada (orden fijo: no reordenar ni ciclar)
const PALETA = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#6250d6",
  "#e34948",
];
export const COLOR_OTRAS = "#898781";

// Lista de expertas (ordenadas por id) con un color fijo cada una, para que
// Naomi tenga el mismo color en todos los gráficos.
export const expertasConColor = (appts) => {
  const mapa = {};
  appts.forEach((a) => {
    if (a.Expert) mapa[a.Expert.id] = a.Expert;
  });
  return Object.values(mapa)
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((e, i) => ({
      id: e.id,
      nombre: e.name,
      especialidad: e.specialty,
      color: PALETA[i] ?? COLOR_OTRAS,
    }));
};

// ── 1. Resumen del mes ──────────────────────────────────────────────────────

// Compara el mes en curso hasta hoy contra el mes anterior hasta el mismo día,
// así la variación no da negativa solo porque el mes todavía no terminó.
export const resumenMes = (appts, hoy = new Date()) => {
  const inicio = startOfMonth(hoy);
  const fin = endOfMonth(hoy);
  const inicioAnt = startOfMonth(subMonths(hoy, 1));
  const corteAnt = endOfDay(subMonths(hoy, 1));

  const realizados = enRango(appts, inicio, hoy);
  const reservados = enRango(appts, new Date(hoy.getTime() + 1), fin);
  const anteriores = enRango(appts, inicioAnt, corteAnt);

  const proxInicio = startOfMonth(addMonths(hoy, 1));
  const proximo = enRango(appts, proxInicio, endOfMonth(proxInicio));

  const actual = resumenDe(realizados);
  const anterior = resumenDe(anteriores);

  return {
    actual,
    anterior,
    var: {
      ingresos: variacion(actual.ingresos, anterior.ingresos),
      turnos: variacion(actual.turnos, anterior.turnos),
      ticket: variacion(actual.ticket, anterior.ticket),
    },
    reservado: resumenDe(reservados),
    proyectado: resumenDe([...realizados, ...reservados]),
    proximoMes: { ...resumenDe(proximo), fecha: proxInicio },
  };
};

// ── 2. Ingresos por mes, apilado por experta ────────────────────────────────

// Meses desde el primer turno hasta el mes actual (sin huecos)
export const mesesConDatos = (appts, hoy = new Date()) => {
  if (appts.length === 0) return [];
  const primero = appts.reduce(
    (min, a) => (fechaTurno(a) < min ? fechaTurno(a) : min),
    fechaTurno(appts[0]),
  );
  if (primero > hoy) return [startOfMonth(hoy)];
  return eachMonthOfInterval({ start: startOfMonth(primero), end: hoy });
};

export const ingresosPorMesYExperta = (appts, expertas, hoy = new Date()) =>
  mesesConDatos(appts, hoy).map((mes) => {
    const fila = { mes: nombreMes(mes), clave: format(mes, "yyyy-MM"), total: 0 };
    expertas.forEach((e) => (fila[e.nombre] = 0));
    enRango(appts, mes, endOfMonth(mes)).forEach((a) => {
      fila[a.Expert.name] = (fila[a.Expert.name] || 0) + precioTurno(a);
      fila.total += precioTurno(a);
    });
    return fila;
  });

// ── 3. Servicios: ranking e ingreso por hora ────────────────────────────────

export const porHora = (price, duration) =>
  duration > 0 ? (price || 0) / (duration / 60) : 0;

export const estadisticasServicios = (appts) => {
  const mapa = {};
  appts.forEach((a) => {
    const s = a.Service;
    if (!mapa[s.id]) {
      mapa[s.id] = {
        id: s.id,
        nombre: s.name,
        especialidad: a.Expert.specialty,
        price: s.price ?? 0,
        duration: s.duration ?? 0,
        cantidad: 0,
        total: 0,
      };
    }
    mapa[s.id].cantidad += 1;
    mapa[s.id].total += precioTurno(a);
  });
  return Object.values(mapa).map((s) => ({
    ...s,
    porHora: porHora(s.price, s.duration),
  }));
};

// Ingresos históricos agrupados por especialidad o por experta
export const ingresosAgrupados = (appts, modo) => {
  const mapa = {};
  appts.forEach((a) => {
    const clave = modo === "especialidad" ? a.Expert.specialty : a.Expert.name;
    mapa[clave] = (mapa[clave] || 0) + precioTurno(a);
  });
  return Object.entries(mapa)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);
};

// ── 4. Ocupación por experta ────────────────────────────────────────────────

const minutosDeHora = (hhmm) => {
  const [h, m] = String(hhmm ?? "").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// horarios: [{ day: "2026-10-20", openTime: "09:00", closeTime: "18:00" }]
export const ocupacionExperta = (appts, horarios, desde, hasta) => {
  const minutosDisponibles = horarios
    .filter((h) => {
      const dia = parseISO(String(h.day).slice(0, 10));
      return dia >= desde && dia <= hasta;
    })
    .reduce(
      (acc, h) =>
        acc + Math.max(0, minutosDeHora(h.closeTime) - minutosDeHora(h.openTime)),
      0,
    );
  const minutosVendidos = sumar(enRango(appts, desde, hasta), duracionTurno);
  return {
    horasDisponibles: minutosDisponibles / 60,
    horasVendidas: minutosVendidos / 60,
    ocupacion: minutosDisponibles > 0 ? minutosVendidos / minutosDisponibles : null,
  };
};

// ── 5. Mapa de calor día/hora ───────────────────────────────────────────────

// Columnas de lunes a domingo (getDay devuelve 0 = domingo)
export const DIAS_SEMANA = [
  { dia: 1, label: "Lun" },
  { dia: 2, label: "Mar" },
  { dia: 3, label: "Mié" },
  { dia: 4, label: "Jue" },
  { dia: 5, label: "Vie" },
  { dia: 6, label: "Sáb" },
  { dia: 0, label: "Dom" },
];

export const mapaDeCalor = (appts) => {
  const celdas = {};
  let horaMin = 24;
  let horaMax = -1;
  const diasUsados = new Set();
  appts.forEach((a) => {
    const f = fechaTurno(a);
    const dia = getDay(f);
    const hora = getHours(f);
    const clave = `${dia}-${hora}`;
    celdas[clave] = (celdas[clave] || 0) + 1;
    horaMin = Math.min(horaMin, hora);
    horaMax = Math.max(horaMax, hora);
    diasUsados.add(dia);
  });
  const horas = [];
  for (let h = horaMin; h <= horaMax; h++) horas.push(h);
  // Domingo solo aparece si alguna vez se trabajó ese día
  const dias = DIAS_SEMANA.filter((d) => d.dia !== 0 || diasUsados.has(0));
  const max = Math.max(0, ...Object.values(celdas));
  return { celdas, horas, dias, max };
};

// ── 6. Clientas ─────────────────────────────────────────────────────────────

const claveClienta = (a) => a.userId ?? a.User?.id ?? a.User?.phone;

export const agruparClientas = (appts, hoy = new Date()) => {
  const mapa = {};
  appts
    .filter((a) => a.User && Number(claveClienta(a)) !== USER_ID_ADMIN)
    .sort((a, b) => fechaTurno(a) - fechaTurno(b))
    .forEach((a) => {
      const id = claveClienta(a);
      if (id == null) return;
      if (!mapa[id]) {
        mapa[id] = {
          id,
          nombre: a.User.name,
          phone: a.User.phone,
          turnos: [],
          total: 0,
          especialidades: new Set(),
        };
      }
      const c = mapa[id];
      c.turnos.push(a);
      c.total += precioTurno(a);
      c.especialidades.add(a.Expert.specialty);
    });

  return Object.values(mapa).map((c) => {
    const pasados = c.turnos.filter((a) => fechaTurno(a) <= hoy);
    const ultimo = pasados.length ? fechaTurno(pasados[pasados.length - 1]) : null;
    return {
      ...c,
      primera: fechaTurno(c.turnos[0]),
      ultimo,
      cantidadPasados: pasados.length,
      tieneFuturo: pasados.length < c.turnos.length,
      diasSinVenir: ultimo ? differenceInCalendarDays(hoy, ultimo) : null,
    };
  });
};

// Por mes: clientas que vinieron por primera vez vs las que ya habían venido
export const nuevasVsRecurrentes = (clientas, meses) =>
  meses.map((mes) => {
    const fin = endOfMonth(mes);
    let nuevas = 0;
    let recurrentes = 0;
    clientas.forEach((c) => {
      const vinoEseMes = c.turnos.some((a) => {
        const f = fechaTurno(a);
        return f >= mes && f <= fin;
      });
      if (!vinoEseMes) return;
      if (c.primera >= mes) nuevas += 1;
      else recurrentes += 1;
    });
    return { mes: nombreMes(mes), nuevas, recurrentes };
  });

// Días promedio entre dos turnos del mismo servicio de la misma clienta
export const frecuenciaPorServicio = (clientas) => {
  const gaps = {};
  clientas.forEach((c) => {
    const porServicio = {};
    c.turnos.forEach((a) => {
      const nombre = a.Service.name;
      (porServicio[nombre] ||= []).push(fechaTurno(a));
    });
    Object.entries(porServicio).forEach(([nombre, fechas]) => {
      for (let i = 1; i < fechas.length; i++) {
        const dias = differenceInCalendarDays(fechas[i], fechas[i - 1]);
        // 0 días = turno duplicado del mismo día, no es una repetición real
        if (dias > 0) (gaps[nombre] ||= []).push(dias);
      }
    });
  });
  return Object.entries(gaps)
    .map(([nombre, dias]) => ({
      nombre,
      repeticiones: dias.length,
      promedio: promedio(dias),
      mediana: mediana(dias),
    }))
    .filter((s) => s.repeticiones >= 2)
    .sort((a, b) => b.repeticiones - a.repeticiones);
};

// Venían seguido y hace más de `dias` que no reservan (ni tienen turno futuro)
export const clientasQueNoVuelven = (clientas, { dias, minTurnos }) =>
  clientas
    .filter(
      (c) =>
        !c.tieneFuturo &&
        c.cantidadPasados >= minTurnos &&
        c.diasSinVenir != null &&
        c.diasSinVenir > dias,
    )
    .sort((a, b) => b.total - a.total);

export const ventasCruzadas = (clientas) => {
  const multi = clientas.filter((c) => c.especialidades.size > 1);
  const una = clientas.filter((c) => c.especialidades.size === 1);
  const combos = {};
  multi.forEach((c) => {
    const clave = [...c.especialidades].sort().join(" + ");
    combos[clave] = (combos[clave] || 0) + 1;
  });
  return {
    multi,
    una,
    combos: Object.entries(combos)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad),
  };
};

// ── 7. Anticipación de reserva ──────────────────────────────────────────────

const TRAMOS_ANTICIPACION = [
  { label: "Mismo día", max: 0 },
  { label: "1 día", max: 1 },
  { label: "2-3 días", max: 3 },
  { label: "4-7 días", max: 7 },
  { label: "8-14 días", max: 14 },
  { label: "15-30 días", max: 30 },
  { label: "+30 días", max: Infinity },
];

export const anticipacionReserva = (appts) => {
  const dias = appts
    .filter((a) => a.createdAt)
    .map((a) => differenceInCalendarDays(fechaTurno(a), new Date(a.createdAt)))
    .filter((d) => d >= 0);
  const tramos = TRAMOS_ANTICIPACION.map((t) => ({ tramo: t.label, cantidad: 0 }));
  dias.forEach((d) => {
    const i = TRAMOS_ANTICIPACION.findIndex((t) => d <= t.max);
    tramos[i].cantidad += 1;
  });
  const hasta7 = dias.filter((d) => d <= 7).length;
  return {
    tramos,
    total: dias.length,
    mediana: mediana(dias),
    porcentajeHasta7: dias.length ? hasta7 / dias.length : null,
  };
};

// ── 8. Liquidaciones ────────────────────────────────────────────────────────

export const liquidacionMes = (appts, mes) => {
  const turnos = enRango(appts, startOfMonth(mes), endOfMonth(mes)).sort(
    (a, b) => fechaTurno(a) - fechaTurno(b),
  );
  const mapa = {};
  turnos.forEach((a) => {
    const e = a.Expert;
    if (!mapa[e.id]) {
      mapa[e.id] = {
        id: e.id,
        experto: e.name,
        esJefa: esJefa(e),
        porcentaje: porcentajeExperta(e),
        turnos: [],
        totalGenerado: 0,
      };
    }
    mapa[e.id].turnos.push(a);
    mapa[e.id].totalGenerado += precioTurno(a);
  });
  const filas = Object.values(mapa).map((f) => ({
    ...f,
    aPagar: f.totalGenerado * f.porcentaje,
    gananciaEstudio: f.totalGenerado * (1 - f.porcentaje),
  }));
  return {
    filas,
    totalGenerado: filas.reduce((acc, f) => acc + f.totalGenerado, 0),
    totalEstudio: filas.reduce((acc, f) => acc + f.gananciaEstudio, 0),
  };
};

// ── CSV ─────────────────────────────────────────────────────────────────────

const celdaCSV = (valor) => {
  const txt = String(valor ?? "");
  return /[";\n]/.test(txt) ? `"${txt.replace(/"/g, '""')}"` : txt;
};

// Usa ";" y BOM para que Excel en español lo abra con columnas y acentos bien
export const descargarCSV = (nombreArchivo, encabezados, filas) => {
  const contenido = [encabezados, ...filas]
    .map((fila) => fila.map(celdaCSV).join(";"))
    .join("\n");
  const blob = new Blob(["﻿" + contenido], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(url);
};

export const filasLiquidacionCSV = (turnos) =>
  turnos.map((a) => {
    const f = fechaTurno(a);
    const pct = porcentajeExperta(a.Expert);
    return [
      format(f, "dd/MM/yyyy"),
      format(f, "HH:mm"),
      a.Expert.name,
      a.Service.name,
      a.User?.name ?? "",
      a.payStatus === "paid" ? "Pagado" : "Seña",
      precioTurno(a),
      `${Math.round(pct * 100)}%`,
      Math.round(precioTurno(a) * pct),
    ];
  });

export const ENCABEZADOS_LIQUIDACION = [
  "Fecha",
  "Hora",
  "Experta",
  "Servicio",
  "Clienta",
  "Pago",
  "Precio",
  "% experta",
  "A pagar",
];
