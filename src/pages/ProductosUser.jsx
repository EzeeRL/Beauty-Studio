import { useState, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./ComprarProductos.css";

const ComprarProductos = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "549",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Cargar productos
  useEffect(() => {
    console.log("📦 Cargando productos...");
    axios
      .get("https://eve-back.vercel.app/products")
      .then((res) => {
        console.log("✅ Productos cargados:", res.data);
        setProductos(res.data);
        setFilteredProductos(res.data);
      })
      .catch((err) => console.error("❌ Error cargando productos:", err));
  }, []);

  // 🔹 Autocompletar si hay userId
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    console.log("👤 Usuario logueado detectado, ID:", userId);
    axios
      .get(`https://eve-back.vercel.app/users/${userId}`)
      .then((res) => {
        const { name, email, phone } = res.data;
        console.log("📋 Datos del usuario cargados:", res.data);
        setFormData({
          nombre: name || "",
          email: email || "",
          telefono: phone || "549",
        });
      })
      .catch((err) => console.error("❌ Error cargando usuario:", err));
  }, []);

  // 🔹 Filtro de productos
  const handleBusqueda = (e) => {
    const value = e.target.value.toLowerCase();
    setBusqueda(value);
    const filtrados = productos.filter((p) =>
      p.name.toLowerCase().includes(value)
    );
    setFilteredProductos(filtrados);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validarForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    if (!formData.telefono.trim())
      newErrors.telefono = "El teléfono es obligatorio.";
    else if (formData.telefono.replace(/\D/g, "").length < 10)
      newErrors.telefono = "El teléfono debe tener al menos 10 números.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompra = async (e) => {
    e.preventDefault();
    if (!validarForm()) return;
    setLoading(true);

    try {
      console.log("🧾 Iniciando compra de:", productoSeleccionado.name);

      // 1️⃣ Crear usuario (o reutilizar)
      const existingUserId = localStorage.getItem("userId");
      let userId = existingUserId;

      if (!existingUserId) {
        console.log("👤 Creando nuevo usuario...");
        const userRes = await axios.post("https://eve-back.vercel.app/users", {
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
        });
        userId = userRes.data.user.id;
        localStorage.setItem("userId", userId);
        console.log("✅ Usuario creado con ID:", userId);
      } else {
        console.log("♻️ Usando usuario existente con ID:", userId);
      }

      // 2️⃣ Crear preferencia de pago
      console.log("💳 Creando preferencia de pago...");
      const preferenceRes = await axios.post(
        "https://eve-back.vercel.app/products/preference",
        {
          productId: productoSeleccionado.id,
          quantity: 1, // o podrías dejar que el usuario elija
          buyerId: userId,
        }
      );
      const { init_point } = preferenceRes.data;
      console.log("🔗 Redirigiendo a MercadoPago:", init_point);
      window.location.href = init_point;
    } catch (error) {
      console.error("❌ Error al procesar la compra:", error);
      setModalError(
        error.response?.data?.error ||
          "Ocurrió un error al iniciar el pago. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Vista de productos
  if (!productoSeleccionado)
    return (
      <div className="comprar-container">
        <div className="comprar-buscador-wrap">
          <h2 className="comprar-title">Nuestros Productos</h2>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={handleBusqueda}
            className="comprar-buscador"
          />
        </div>

        <div className="comprar-lista">
          {filteredProductos.length > 0 ? (
            filteredProductos.map((p) => (
              <div
                key={p.id}
                className="comprar-card"
                onClick={() => {
                  console.log("🖱️ Producto seleccionado:", p);
                  setProductoSeleccionado(p);
                }}
              >
                <img src={p.imageUrl} alt={p.name} />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <span>${p.price}</span>
                <button className="detalle">Ver</button>
              </div>
            ))
          ) : (
            <p className="no-resultados">No se encontraron productos.</p>
          )}
        </div>
      </div>
    );

  // 🔹 Vista detalle
  return (
    <div className="comprar-detalle-container">
      <button
        className="volver-btn"
        onClick={() => setProductoSeleccionado(null)}
      >
        ← Volver
      </button>

      <div className="comprar-detalle-card">
        <img
          src={productoSeleccionado.imageUrl}
          alt={productoSeleccionado.name}
        />
        <div className="comprar-detalle-info">
          <h2>{productoSeleccionado.name}</h2>
          <p>{productoSeleccionado.description}</p>
          <h3>${productoSeleccionado.price}</h3>
          <div className="retiro-local">
            <span className="retiro-icon"></span>
            <p>📍 Este producto se retira en el local.</p>
          </div>
          <form onSubmit={handleCompra} className="comprar-form">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <p className="error">{errors.nombre}</p>}

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <PhoneInput
              country={"ar"}
              value={formData.telefono}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, telefono: value }))
              }
              inputProps={{ required: true }}
              masks={{ ar: "(...) ....-...." }}
              inputStyle={{
                width: "100%",
                height: "40px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "10px",
              }}
            />
            {errors.telefono && <p className="error">{errors.telefono}</p>}

            <button type="submit" disabled={loading} className="comprar-btn">
              {loading ? "Procesando..." : "Comprar ahora"}
            </button>
          </form>
        </div>
      </div>

      {modalError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error en la compra</h3>
            <p>{modalError}</p>
            <button onClick={() => setModalError(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprarProductos;
