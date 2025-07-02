import { useState, useRef, useEffect } from "react";
import "./SearchAndFilter.css";

const SearchAndFilter = ({ servicesData, onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const filtersContainerRef = useRef(null);

  // Extraer las categorías únicas de los servicios
  const categories = ["Todos", ...Object.keys(servicesData)];

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    onFilter(filter);
  };

  useEffect(() => {
    if (filtersContainerRef.current) {
      const selectedElement = filtersContainerRef.current.querySelector(
        ".filter-card.selected"
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedFilter]);

  return (
    <div className="search-and-filter-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="filters-container" ref={filtersContainerRef}>
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-card ${
              selectedFilter === category ? "selected" : ""
            }`}
            onClick={() => handleFilterClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter;
