import { useRef, useEffect, useState } from "react";
import "./SearchAndFilter.css";

const SearchAndFilter = ({
  servicesData,
  onFilter,
  activeFilter,
  onSearchChange
}) => {
  const filtersContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["Todos", ...Object.keys(servicesData)];

  const handleFilterClick = (filter) => {
    onFilter(filter);
    setSearchTerm(""); // opcional
  };

  const handleSearchClick = () => {
    if (onSearchChange) onSearchChange(searchTerm);
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
  }, [activeFilter]);

  return (
    <div className="search-and-filter-container">
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar servicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button" onClick={handleSearchClick}>
          Buscar
        </button>
      </div>

      <div className="filters-container" ref={filtersContainerRef}>
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-card ${activeFilter === category ? "selected" : ""}`}
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
