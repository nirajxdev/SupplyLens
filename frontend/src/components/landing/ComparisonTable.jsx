import { Check, X } from 'lucide-react';

const features = ['Real-time stock ledger', 'Supplier performance scoring', 'Demand forecasting', 'Automated reorder alerts', 'Role-based access control', 'Setup in under a day'];
const columns = ['SupplyLens', 'Spreadsheets', 'Basic Tools', 'Legacy ERP'];
const data = [
  [true, false, true, true],
  [true, false, false, true],
  [true, false, false, true],
  [true, false, false, true],
  [true, false, false, true],
  [true, true, true, false],
];

const ComparisonTable = () => (
  <section id="compare" style={{ paddingTop: 64, paddingBottom: 64 }}>
    <div className="container-max">
      <p className="ent-section-label" style={{ marginBottom: 8, color: 'var(--accent-text)' }}>Why SupplyLens</p>
      <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 750, letterSpacing: '-0.6px' }}>
        ERP rigor without the ERP project.
      </h2>
      <div className="ent-table-wrap" style={{ marginTop: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ent-table" style={{ minWidth: 620 }}>
            <thead>
              <tr>
                <th scope="col" style={{ width: '34%' }}>Capability</th>
                {columns.map((col, ci) => (
                  <th key={col} scope="col" style={{ textAlign: 'center', ...(ci === 0 ? { color: 'var(--accent-text)', background: 'var(--accent-light)' } : {}) }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feat, ri) => (
                <tr key={feat}>
                  <td style={{ fontWeight: 600 }}>{feat}</td>
                  {data[ri].map((v, ci) => (
                    <td key={ci} style={{ textAlign: 'center', ...(ci === 0 ? { background: 'var(--accent-light)' } : {}) }}>
                      {v
                        ? <Check size={15} style={{ color: 'var(--green)', display: 'inline' }} aria-label="Included" />
                        : <X size={15} style={{ color: 'var(--red)', display: 'inline' }} aria-label="Not included" />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
);

export default ComparisonTable;
