const DataTable = ({ columns, data, onRowClick, renderActions, emptyTitle = 'No records found', emptySub = '', emptyAction = null, minWidth = 640 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="ent-table-wrap">
        <div className="ent-empty">
          <p className="ent-empty-title">{emptyTitle}</p>
          {emptySub && <p className="ent-empty-sub">{emptySub}</p>}
          {emptyAction && <div style={{ marginTop: 12 }}>{emptyAction}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="ent-table-wrap">
      <table className="ent-table" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.numeric ? 'num' : ''} scope="col">
                {col.label}
              </th>
            ))}
            {renderActions && <th scope="col" style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || row.id || i}
              className={onRowClick ? 'clickable' : ''}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.numeric ? 'num' : ''}>
                  {col.mono ? (
                    <span className="ent-mono">{col.render ? col.render(row[col.key], row) : row[col.key]}</span>
                  ) : (
                    col.render ? col.render(row[col.key], row) : row[col.key]
                  )}
                </td>
              ))}
              {renderActions && (
                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
