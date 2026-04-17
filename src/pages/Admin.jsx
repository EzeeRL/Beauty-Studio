import { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";

import "./AdminPanel.css";

// Hooks
import { useAppointments } from "../hooks/useAppointments";
import { useWhatsApp } from "../hooks/useWhatsApp";

// Componentes de sección
import AdminNavbar from "../components/AdminNavbar";
import TurnosSection from "../components/TurnosSection";
import HorariosSection from "../components/HorariosSection";
import IngresosSection from "../components/IngresosSection";
import DeleteModal from "../components/DeleteModal";
import ToastNotification from "../components/ToastNotification";

// Componentes externos ya existentes
import ServiceManager from "../components/AdminEdit";
import ExpertManager from "../components/adminExpert";
import AdminComentarios from "../components/AdminComentarios";
import AddProductForm from "../components/Products";
import CouponManager from "../components/CouponManager";

const API = "https://eve-back.vercel.app";

const AdminPanel = () => {
  // ── Estado de navegación ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("turnos");

  // ── Estado de turnos ──────────────────────────────────────────────────────
  const {
    appointments,
    setAppointments,
    sortedAppointments,
    isUpcoming,
    updatePayStatus,
    markReminderSent,
  } = useAppointments();

  // ── Estado de edición de pay status ──────────────────────────────────────
  const [editingId, setEditingId] = useState(null);
  const [editingPayStatus, setEditingPayStatus] = useState("");

  const startEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditingPayStatus(currentStatus);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingPayStatus("");
  };
  const saveEdit = (id) => {
    updatePayStatus(id, editingPayStatus);
    setEditingId(null);
    setEditingPayStatus("");
  };

  // ── Estado de modal de eliminación ────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // ── Estado de horarios ────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workingHours, setWorkingHours] = useState({});
  const [startHour, setStartHour] = useState("08:00");
  const [endHour, setEndHour] = useState("20:00");
  const [expertId, setExpertId] = useState("");
  const [experts, setExperts] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/experts`)
      .then((res) => setExperts(res.data))
      .catch((err) => console.error("Error al cargar expertos:", err));
  }, []);

  const handleHorarioChange = async () => {
    if (!expertId) {
      alert("Seleccioná un experto antes de guardar el horario.");
      return;
    }
    try {
      await axios.post(`${API}/hours`, {
        day: selectedDate,
        openTime: startHour,
        closeTime: endHour,
        expertId: Number(expertId),
      });
      setWorkingHours((prev) => ({
        ...prev,
        [format(new Date(selectedDate), "yyyy-MM-dd")]: {
          start: startHour,
          end: endHour,
        },
      }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("❌ Error al crear horario:", error);
      alert("Error al guardar el horario.");
    }
  };

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  const { sendWhatsApp } = useWhatsApp(markReminderSent);

  // ── Props compartidas para tablas de turnos ───────────────────────────────
  const turnosTableProps = {
    editingId,
    editingPayStatus,
    setEditingPayStatus,
    startEdit,
    cancelEdit,
    saveEdit,
    sendWhatsApp,
    isUpcoming,
    setAppointmentToDelete,
    setShowDeleteModal,
  };

  return (
    <div className="admin-panel-container">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="admin-main-content">
        {activeTab === "turnos" && (
          <TurnosSection
            appointments={appointments}
            sortedAppointments={sortedAppointments}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            {...turnosTableProps}
          />
        )}

        {activeTab === "horarios" && (
          <HorariosSection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            startHour={startHour}
            setStartHour={setStartHour}
            endHour={endHour}
            setEndHour={setEndHour}
            expertId={expertId}
            setExpertId={setExpertId}
            experts={experts}
            workingHours={workingHours}
            onSave={handleHorarioChange}
          />
        )}

        {activeTab === "ingresos" && (
          <IngresosSection appointments={appointments} />
        )}

        {activeTab === "admin" && (
          <>
            <ServiceManager />
            <ExpertManager />
          </>
        )}

        {activeTab === "coment" && <AdminComentarios />}

        {activeTab === "products" && <AddProductForm />}

        {activeTab === "cupones" && <CouponManager />}
      </main>

      {/* Modales y notificaciones globales */}
      {showDeleteModal && (
        <DeleteModal
          appointmentToDelete={appointmentToDelete}
          setAppointments={setAppointments}
          setShowDeleteModal={setShowDeleteModal}
          setAppointmentToDelete={setAppointmentToDelete}
        />
      )}

      {showToast && <ToastNotification />}
    </div>
  );
};

export default AdminPanel;
