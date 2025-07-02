import { create } from "zustand";
import { persist } from "zustand/middleware";

const useServicioStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      servicio: null,
      experto: null,
      fecha: null,
      datosCliente: {
        nombre: "",
        email: "",
        telefono: "",
        notas: "",
      },
      pasoActual: "servicio", // servicio -> experto -> fecha -> datos -> pago

      // Actions
      setServicio: (servicio) =>
        set({
          servicio,
          pasoActual: "experto",
          experto: null, // Reset experto al cambiar servicio
          fecha: null, // Reset fecha al cambiar servicio
        }),

      setExperto: (experto) =>
        set({
          experto,
          pasoActual: "fecha",
          fecha: null, // Reset fecha al cambiar experto
        }),

      setFecha: (fecha) =>
        set({
          fecha,
          pasoActual: "datos",
        }),

      setDatosCliente: (datos) =>
        set({
          datosCliente: {
            ...get().datosCliente,
            ...datos,
          },
          pasoActual: "pago",
        }),

      // Validaciones
      puedeAvanzar: () => {
        const { pasoActual, servicio, experto, fecha, datosCliente } = get();

        switch (pasoActual) {
          case "servicio":
            return !!servicio;
          case "experto":
            return !!experto;
          case "fecha":
            return !!fecha;
          case "datos":
            return (
              datosCliente.nombre.trim() !== "" &&
              datosCliente.email.includes("@") &&
              datosCliente.telefono.trim() !== ""
            );
          default:
            return true;
        }
      },

      // Reset completo
      reset: () =>
        set({
          servicio: null,
          experto: null,
          fecha: null,
          datosCliente: {
            nombre: "",
            email: "",
            telefono: "",
            notas: "",
          },
          pasoActual: "servicio",
        }),

      // Obtener resumen
      getResumen: () => {
        const { servicio, experto, fecha, datosCliente } = get();
        return {
          servicio: servicio?.name || "No seleccionado",
          precio: servicio?.price || 0,
          experto: experto?.name || "No seleccionado",
          fecha: fecha?.toLocaleString() || "No seleccionada",
          cliente: datosCliente.nombre || "No especificado",
        };
      },
    }),
    {
      name: "servicio-storage", // nombre para localStorage
      partialize: (state) => ({
        servicio: state.servicio,
        experto: state.experto,
        fecha: state.fecha,
        datosCliente: state.datosCliente,
      }), // qué persistir
    }
  )
);

export default useServicioStore;
