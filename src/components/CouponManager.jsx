import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { Ticket, QrCode, Gift } from "lucide-react";
import "./CouponManager.css";

const API_URL = "https://eve-back.vercel.app";

const CouponManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("cupon");
  const [qrData, setQrData] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrError, setQrError] = useState(null);

  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initialFormState = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxUses: 1,
    validFrom: "",
    validUntil: "",
    applicableServiceIds: [],
    isActive: true,
  };

  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const initialRewardFormState = {
    pointsRequired: "",
    discountType: "percentage",
    discountValue: "",
    description: "",
    isActive: true,
  };

  const [rewards, setRewards] = useState([]);
  const [rewardForm, setRewardForm] = useState(initialRewardFormState);
  const [editingRewardId, setEditingRewardId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchServices();
    fetchRewards();
  }, []);

  useEffect(() => {
    if (activeSubTab === "qr" && !qrData) {
      fetchTodayQr();
    }
  }, [activeSubTab]);

  const fetchTodayQr = async () => {
    setLoadingQr(true);
    setQrError(null);
    try {
      const res = await axios.get(`${API_URL}/loyalty/qr`);
      setQrData(res.data);
    } catch (err) {
      console.error("Error al obtener el QR del día", err);
      setQrError("No se pudo obtener el QR de hoy.");
    } finally {
      setLoadingQr(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons`);
      setCoupons(res.data);
    } catch (err) {
      console.error("Error al obtener cupones", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services`);
      setServices(res.data);
    } catch (err) {
      console.error("Error al obtener servicios", err);
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await axios.get(`${API_URL}/loyalty/rewards`);
      setRewards(res.data);
    } catch (err) {
      console.error("Error al obtener premios", err);
    }
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRewardId) {
        await axios.put(`${API_URL}/loyalty/rewards/${editingRewardId}`, rewardForm);
        alert("¡Premio actualizado con éxito!");
      } else {
        await axios.post(`${API_URL}/loyalty/rewards`, rewardForm);
        alert("¡Premio creado exitosamente!");
      }
      setRewardForm(initialRewardFormState);
      setEditingRewardId(null);
      fetchRewards();
    } catch (err) {
      alert("Error al procesar el premio");
    }
  };

  const handleDeleteReward = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este premio?")) {
      try {
        await axios.delete(`${API_URL}/loyalty/rewards/${id}`);
        fetchRewards();
      } catch (err) {
        alert("Error al eliminar el premio");
      }
    }
  };

  const handleEditReward = (reward) => {
    setEditingRewardId(reward.id);
    setRewardForm({
      pointsRequired: reward.pointsRequired,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      description: reward.description || "",
      isActive: reward.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/coupons/${editingId}`, form);
        alert("¡Cupón actualizado con éxito!");
      } else {
        await axios.post(`${API_URL}/coupons`, form);
        alert("¡Cupón creado exitosamente!");
      }
      setForm(initialFormState);
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      alert("Error al procesar el cupón");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cupón?")) {
      try {
        await axios.delete(`${API_URL}/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert("Error al eliminar el cupón");
      }
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom ? coupon.validFrom.split("T")[0] : "",
      validUntil: coupon.validUntil ? coupon.validUntil.split("T")[0] : "",
      applicableServiceIds: coupon.applicableServiceIds || [],
      isActive: coupon.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleService = (serviceId) => {
    setForm((prev) => {
      const alreadySelected = prev.applicableServiceIds.includes(serviceId);
      if (alreadySelected) {
        return {
          ...prev,
          applicableServiceIds: prev.applicableServiceIds.filter(
            (id) => id !== serviceId,
          ),
        };
      } else {
        return {
          ...prev,
          applicableServiceIds: [...prev.applicableServiceIds, serviceId],
        };
      }
    });
  };

  return (
    <div className="coupon-manager-container">
      <div className="sub-tab-selector">
        <button
          type="button"
          className={activeSubTab === "cupon" ? "sub-tab-btn active" : "sub-tab-btn"}
          onClick={() => setActiveSubTab("cupon")}
        >
          <Ticket size={18} strokeWidth={2} />
          <span>Cupón</span>
        </button>
        <button
          type="button"
          className={activeSubTab === "qr" ? "sub-tab-btn active" : "sub-tab-btn"}
          onClick={() => setActiveSubTab("qr")}
        >
          <QrCode size={18} strokeWidth={2} />
          <span>QR</span>
        </button>
        <button
          type="button"
          className={activeSubTab === "premios" ? "sub-tab-btn active" : "sub-tab-btn"}
          onClick={() => setActiveSubTab("premios")}
        >
          <Gift size={18} strokeWidth={2} />
          <span>Premios</span>
        </button>
      </div>

      {activeSubTab === "qr" && (
        <div className="qr-card">
          <h2 className="section-title">QR de fidelidad del día</h2>
          {loadingQr && <p className="empty-state">Cargando QR...</p>}
          {qrError && <p className="coupon-error">{qrError}</p>}
          {!loadingQr && !qrError && qrData && (
            <div className="qr-content">
              <div className="qr-code-box">
                <QRCode value={qrData.code} size={220} />
              </div>
              <p className="qr-date">
                Válido para hoy: {new Date(qrData.date).toLocaleDateString()}
              </p>
              <p className="qr-code-text">{qrData.code}</p>
              <button
                type="button"
                className="btn-submit"
                onClick={fetchTodayQr}
              >
                Refrescar QR
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "cupon" && (
      <>
      <div className="coupon-form-card">
        <h2 className="section-title">
          {editingId ? "Editar Cupón" : "Crear Nuevo Cupón"}
        </h2>
        <form onSubmit={handleSubmit} className="coupon-form">
          <div className="form-row">
            <div className="form-group">
              <label>Código del Cupón</label>
              <input
                type="text"
                placeholder="EJ: VERANO2024"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Valor de Descuento</label>
              <input
                type="number"
                placeholder="Monto o %"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Descuento</label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value })
                }
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Uso Máximo</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Válido Desde</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Válido Hasta</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Solo para masajes faciales"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="form-group" ref={dropdownRef}>
            <label>Servicios Aplicables</label>
            <div className="custom-multiselect">
              <div
                className={`multiselect-header ${isDropdownOpen ? "active" : ""}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {form.applicableServiceIds.length === 0
                    ? "Todos los servicios"
                    : `${form.applicableServiceIds.length} seleccionados`}
                </span>
                <span className="arrow">{isDropdownOpen ? "▲" : "▼"}</span>
              </div>

              {isDropdownOpen && (
                <div className="multiselect-dropdown">
                  {services.map((s) => {
                    const isSelected = form.applicableServiceIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        className={`multiselect-item ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleService(s.id)}
                      >
                        <div className="checkbox-custom">
                          {isSelected && "✓"}
                        </div>
                        {s.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <span className="slider"></span>
            </label>
            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
              {form.isActive ? "Cupón Activo" : "Cupón Inactivo"}
            </span>
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? "Actualizar Cupón" : "Crear Cupón"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingId(null);
                setForm(initialFormState);
              }}
              style={{
                marginTop: "10px",
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Cancelar Edición
            </button>
          )}
        </form>
      </div>

      <div className="coupon-list-container">
        <h2 className="section-title">Cupones Existentes</h2>
        <div className="coupons-grid">
          {coupons.length === 0 ? (
            <p className="empty-state">No hay cupones creados aún.</p>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`coupon-card ${!coupon.isActive ? "is-inactive" : ""}`}
              >
                <div className="coupon-card-left">
                  <div className="discount-badge">
                    {coupon.discountType === "percentage" ? (
                      <>
                        <span>{coupon.discountValue}</span>%
                      </>
                    ) : (
                      <>
                        <span>${coupon.discountValue}</span>
                      </>
                    )}
                  </div>
                  <p>OFF</p>
                </div>

                <div className="coupon-card-right">
                  <div className="coupon-header">
                    <span className="coupon-code">{coupon.code}</span>
                    <span
                      className={`status-dot ${coupon.isActive ? "active" : "inactive"}`}
                      title={coupon.isActive ? "Activo" : "Inactivo"}
                    ></span>
                  </div>

                  <p className="coupon-description">
                    {coupon.description || "Sin descripción"}
                  </p>

                  <div className="coupon-details">
                    <div className="detail-item">
                      <span className="detail-label">Usos:</span>
                      <span className="detail-value">
                        {coupon.usedCount} / {coupon.maxUses}
                      </span>
                    </div>
                    {coupon.validUntil && (
                      <div className="detail-item">
                        <span className="detail-label">Vence:</span>
                        <span className="detail-value">
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="coupon-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(coupon)}
                    >
                      ✏️ <span>Editar</span>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      🗑️ <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                <div className="ticket-cut-top"></div>
                <div className="ticket-cut-bottom"></div>
              </div>
            ))
          )}
        </div>
      </div>
      </>
      )}

      {activeSubTab === "premios" && (
        <>
          <div className="coupon-form-card">
            <h2 className="section-title">
              {editingRewardId ? "Editar Premio" : "Crear Nuevo Premio"}
            </h2>
            <form onSubmit={handleRewardSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Puntos Requeridos</label>
                  <input
                    type="number"
                    placeholder="Ej: 3"
                    min="1"
                    value={rewardForm.pointsRequired}
                    onChange={(e) =>
                      setRewardForm({
                        ...rewardForm,
                        pointsRequired: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Valor de Descuento</label>
                  <input
                    type="number"
                    placeholder="Monto o %"
                    value={rewardForm.discountValue}
                    onChange={(e) =>
                      setRewardForm({
                        ...rewardForm,
                        discountValue: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Descuento</label>
                  <select
                    value={rewardForm.discountType}
                    onChange={(e) =>
                      setRewardForm({
                        ...rewardForm,
                        discountType: e.target.value,
                      })
                    }
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: 3 turnos = 10% off"
                    value={rewardForm.description}
                    onChange={(e) =>
                      setRewardForm({
                        ...rewardForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="switch-container">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={rewardForm.isActive}
                    onChange={(e) =>
                      setRewardForm({
                        ...rewardForm,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                  {rewardForm.isActive ? "Premio Activo" : "Premio Inactivo"}
                </span>
              </div>

              <button type="submit" className="btn-submit">
                {editingRewardId ? "Actualizar Premio" : "Crear Premio"}
              </button>
              {editingRewardId && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setEditingRewardId(null);
                    setRewardForm(initialRewardFormState);
                  }}
                  style={{
                    marginTop: "10px",
                    background: "transparent",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Cancelar Edición
                </button>
              )}
            </form>
          </div>

          <div className="coupon-list-container">
            <h2 className="section-title">Premios Existentes</h2>
            <div className="coupons-grid">
              {rewards.length === 0 ? (
                <p className="empty-state">No hay premios creados aún.</p>
              ) : (
                rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`coupon-card ${!reward.isActive ? "is-inactive" : ""}`}
                  >
                    <div className="coupon-card-left">
                      <div className="discount-badge">
                        {reward.discountType === "percentage" ? (
                          <>
                            <span>{reward.discountValue}</span>%
                          </>
                        ) : (
                          <>
                            <span>${reward.discountValue}</span>
                          </>
                        )}
                      </div>
                      <p>OFF</p>
                    </div>

                    <div className="coupon-card-right">
                      <div className="coupon-header">
                        <span className="coupon-code">
                          {reward.pointsRequired} pts
                        </span>
                        <span
                          className={`status-dot ${reward.isActive ? "active" : "inactive"}`}
                          title={reward.isActive ? "Activo" : "Inactivo"}
                        ></span>
                      </div>

                      <p className="coupon-description">
                        {reward.description || "Sin descripción"}
                      </p>

                      <div className="coupon-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditReward(reward)}
                        >
                          ✏️ <span>Editar</span>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteReward(reward.id)}
                        >
                          🗑️ <span>Eliminar</span>
                        </button>
                      </div>
                    </div>

                    <div className="ticket-cut-top"></div>
                    <div className="ticket-cut-bottom"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CouponManager;
