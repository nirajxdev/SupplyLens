const SkeletonLoader = ({ rows = 5, height = 36 }) => (
  <div className="ent-table-wrap" aria-busy="true" aria-label="Loading">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ent-skeleton" style={{ height }} />
      ))}
    </div>
  </div>
);

export default SkeletonLoader;
