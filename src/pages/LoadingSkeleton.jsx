const LoadingSkeleton = () => {
  return (
    <div className="skeleton-container">
      <div className="search-skeleton" />
      <div className="filters-skeleton">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="filter-pill-skeleton" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="service-section-skeleton" />
      ))}
      <div className="comentario-title-skeleton" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="comentario-card-skeleton" />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
