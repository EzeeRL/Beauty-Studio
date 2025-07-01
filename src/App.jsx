// src/App.jsx
import "./App.css";
import Header from "./components/Header";
import ServiceSection from "./components/ServiceSection";
import { services } from "./data/services";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <h1 className="app-title">Servicios del Salón</h1>
        {Object.entries(services).map(([section, items]) => (
          <ServiceSection key={section} title={section} services={items} />
        ))}
      </main>
    </div>
  );
}

export default App;
