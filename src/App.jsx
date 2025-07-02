import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Header from "./components/Header";
import ServiceSection from "./components/ServiceSection";
import SearchAndFilter from "./components/SearchAndFilter";
import Expertos from "./pages/Expertos";
import Fecha from "./pages/Fecha";
import Datos from "./pages/Datos";
import Pago from "./pages/Pago";
import Layout from "./components/Layout";

function App() {
  const [services, setServices] = useState({});
  const [filteredServices, setFilteredServices] = useState({});
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [openedSection, setOpenedSection] = useState(null);

  // ✅ Usar Axios para traer los servicios
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("https://eve-back.vercel.app/services");
        const data = response.data;

        // Agrupar los servicios en una categoría genérica (por ahora)
        const grouped = {
          Servicios: data,
        };

        setServices(grouped);
        setFilteredServices(grouped);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      }
    };

    fetchServices();
  }, []);

  const handleSearch = (term) => {
    if (term === "") {
      setFilteredServices(services);
      return;
    }

    const filtered = {};
    Object.entries(services).forEach(([section, items]) => {
      const filteredItems = items.filter((service) =>
        service.name.toLowerCase().includes(term.toLowerCase())
      );
      if (filteredItems.length > 0) {
        filtered[section] = filteredItems;
      }
    });

    setFilteredServices(filtered);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    setOpenedSection(filter === "Todos" ? null : filter);

    if (filter === "Todos") {
      setFilteredServices(services);
    } else {
      const filtered = { [filter]: services[filter] };
      setFilteredServices(filtered);

      setTimeout(() => {
        const sectionElement = document.getElementById(filter);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const Home = () => (
    <>
      <SearchAndFilter
        servicesData={services}
        onSearch={handleSearch}
        onFilter={handleFilter}
        activeFilter={activeFilter}
      />

      {Object.entries(filteredServices).map(([section, items]) => (
        <div key={section} id={section}>
          <ServiceSection
            title={section}
            services={items}
            isOpen={openedSection === section || activeFilter === "Todos"}
          />
        </div>
      ))}
    </>
  );

  return (
    <Router>
      <div className="app">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Expertos/:serviceId" element={<Expertos />} />
            <Route path="/Fecha/:expertId" element={<Fecha />} />
            <Route path="/Datos" element={<Datos />} />
            <Route path="/Pago" element={<Pago />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
