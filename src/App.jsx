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
import Perfil from "./pages/Mi perfil";
import Login from "./pages/loguin";
import Ubicacion from "./pages/Ubicacion";
import AdminPanel from "./pages/Admin";
import Footer from "./pages/Footer";
import ComentarioList from "./components/ComentarioList";
import { Suspense } from "react";
import LoadingSkeleton from "./pages/LoadingSkeleton";
import ExpertAppointments from "./components/ExpertAppointments";
import LoginE from "./pages/LoginExpert";

function App() {
  const [services, setServices] = useState({});
  const [filteredServices, setFilteredServices] = useState({});
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [openedSections, setOpenedSections] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

 
const handleSearchChange = (term) => {
  setSearchTerm(term);
  console.log("Buscando:", term);

  if (term.trim() === "") {
    handleFilter(activeFilter);
    return;
  }

  const filtered = {};

  Object.entries(services).forEach(([category, items]) => {
    const matched = items.filter((service) =>
      service.name.toLowerCase().includes(term.toLowerCase())
    );
    if (matched.length > 0) {
      filtered[category] = matched;
    }
  });

  setFilteredServices(filtered);
  setOpenedSections(new Set(Object.keys(filtered)));
};



  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://eve-back.vercel.app/services");
        const data = response.data;

        const grouped = {};
        data.forEach((service) => {
          const cat = service.category || "Sin categoría";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(service);
        });

        setServices(grouped);
        setFilteredServices(grouped);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
      }
      finally {
      setLoading(false);
    }
    };

    fetchServices();
  }, []);

  const toggleSection = (section) => {
    setOpenedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);

    if (filter === "Todos") {
      setFilteredServices(services);
      setOpenedSections(new Set());
    } else {
      const filtered = { [filter]: services[filter] };
      setFilteredServices(filtered);
      setOpenedSections(new Set([filter]));

      setTimeout(() => {
        const sectionElement = document.getElementById(filter);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  
  const Home = () => {
  if (loading) return <LoadingSkeleton />;

  return (
    <>
      <SearchAndFilter
        servicesData={services}
        onFilter={handleFilter}
        activeFilter={activeFilter}
        onSearchChange={handleSearchChange}
      />

      <div className="servicion-container">
        {Object.entries(filteredServices).map(([section, items]) => (
          <div key={section} id={section}>
            <ServiceSection
              title={section}
              services={items}
              isOpen={openedSections.has(section) || activeFilter !== "Todos"}
              onToggle={() => toggleSection(section)}
            />
          </div>
        ))}
      </div>
      <ComentarioList />
    </>
  );
};


  return (
    <Router>
      <div className="app">
        <div class="fixed-circle"></div>
        <Header />
        <main className="main-content">
          <Routes>
           <Route path="/" element={<Home />} />

            <Route path="/Expertos/:serviceId" element={<Expertos />} />
            <Route path="/Fecha/:expertId" element={<Fecha />} />
            <Route path="/Datos" element={<Datos />} />
            <Route path="/Pago" element={<Pago />} />
            <Route path="/Perfil" element={<Perfil />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/expertos/:expertId/turnos" element={<ExpertAppointments />} />
<Route path="/login/expert" element={<LoginE />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 