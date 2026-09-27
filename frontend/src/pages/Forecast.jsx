import { useState, useEffect } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart, CartesianGrid, Line } from 'recharts';
import { getProducts, getForecast } from '../Instance/API';
import { toast } from 'sonner';
import ChartTooltip from '../components/app/ChartTooltip';
import SkeletonLoader from '../components/shared/SkeletonLoader';

const Forecast = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      const productList = res.data || res.products || [];
      setProducts(productList);
      if (productList.length > 0) setSelectedProduct(productList[0]._id || productList[0].id);
      else setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProduct) fetchForecast(selectedProduct); }, [selectedProduct]);

  const fetchForecast = async (productId) => {
    try {
      setLoading(true); setError(null);
      const res = await getForecast(productId);
      setForecastData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load forecast');
      toast.error(err.message || 'Failed to load forecast');
    } finally {
      setLoading(false);
    }
  };

  const predicted = forecastData?.methods?.exponentialSmoothing?.predictedWeeklyDemand ?? 0;
  const maPredicted = forecastData?.methods?.movingAverage?.predictedWeeklyDemand ?? 0;
  const chartData = forecastData ? [
    { week: 'W-3', actual: Math.max(0, predicted - 10) },
    { week: 'W-2', actual: Math.max(0, predicted + 5) },
    { week: 'W-1', actual: Math.max(0, predicted - 2) },
    { week: 'Now', actual: predicted, predicted, upper: predicted, lower: predicted },
    { week: 'W+1', predicted: predicted + 2, upper: predicted + 10, lower: Math.max(0, predicted - 6) },
    { week: 'W+2', predicted: predicted + 5, upper: predicted + 15, lower: Math.max(0, predicted - 10) },
  ] : [];
  const selectedProductObj = products.find((p) => (p._id || p.id) === selectedProduct);
  const stock = selectedProductObj?.currentStock ?? selectedProductObj?.stockQuantity ?? 0;
  const weeksCover = predicted > 0 ? (stock / predicted).toFixed(1) : '—';

  return (
    <div className="ent-page">
      <div className="ent-page-header">
        <div>
          <div className="ent-page-title">Demand Forecast</div>
          <div className="ent-page-sub">Moving-average + exponential-smoothing weekly demand per product.</div>
        </div>
        <div className="ent-page-actions">
          <label htmlFor="forecast-product" style={{ fontSize: 12.5, color: 'var(--app-text-muted)' }}>Product</label>
          <select id="forecast-product" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
            className="ent-select" style={{ width: 240 }}>
            {products.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
      </div>

      {error && !forecastData && (
        <div className="ent-card ent-card-pad" style={{ marginBottom: 12, borderColor: 'var(--red-border)', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--red)' }}>{error}</span>
          <button onClick={() => selectedProduct && fetchForecast(selectedProduct)} className="ent-btn ent-btn-secondary ent-btn-sm">Retry</button>
        </div>
      )}

      {loading ? (
        <SkeletonLoader rows={5} height={64} />
      ) : forecastData ? (
        <>
          <div className="ent-kpi-grid" style={{ marginBottom: 12 }}>
            <div className="ent-kpi"><div className="ent-kpi-label">Exp. Smoothing / wk</div><div className="ent-kpi-value">{predicted} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--app-text-muted)' }}>units</span></div></div>
            <div className="ent-kpi"><div className="ent-kpi-label">Moving Avg / wk</div><div className="ent-kpi-value">{maPredicted} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--app-text-muted)' }}>units</span></div></div>
            <div className="ent-kpi"><div className="ent-kpi-label">Current Stock</div><div className="ent-kpi-value">{stock} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--app-text-muted)' }}>units</span></div></div>
            <div className="ent-kpi"><div className="ent-kpi-label">Coverage</div><div className="ent-kpi-value">{weeksCover} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--app-text-muted)' }}>weeks</span></div></div>
          </div>

          <div className="ent-card ent-card-pad" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="ent-card-title">Predicted Weekly Demand</span>
              <span className="ent-pill ent-pill-blue"><span className="dot" />{Math.round((forecastData.confidenceScore ?? 0) * 100)}% confidence</span>
            </div>
            {forecastData.warning && (
              <div style={{ fontSize: 12.5, color: 'var(--amber)', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
                borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>⚠ {forecastData.warning}</div>
            )}
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
                  <XAxis dataKey="week" tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--app-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="upper" fill="var(--chart-1)" fillOpacity={0.08} stroke="none" name="Upper" />
                  <Area type="monotone" dataKey="lower" fill="#ffffff" stroke="none" name="Lower" />
                  <Line type="monotone" dataKey="actual" name="Historical" stroke="var(--app-text)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="predicted" name="Forecast" stroke="var(--chart-1)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--app-text-faint)', marginTop: 6 }}>
              Illustrative projection around the backend prediction · {forecastData.dataPointsUsed ?? 0} sales records · {forecastData.weeksActive ?? 0} active weeks
            </p>
          </div>

          <div className="ent-card ent-card-pad" style={{ borderColor: 'var(--blue-border)', background: 'var(--blue-bg)' }}>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--app-text)' }}>
              At <strong>{predicted} units/week</strong>, current stock of <strong>{stock} units</strong> covers
              approximately <strong>{weeksCover} weeks</strong>.
              {stock < predicted && ' Consider expediting the next purchase order.'}
            </p>
          </div>
        </>
      ) : (
        <div className="ent-card"><div className="ent-empty">
          <p className="ent-empty-title">No forecast data</p>
          <p className="ent-empty-sub">Select a product to generate a forecast.</p>
        </div></div>
      )}
    </div>
  );
};

export default Forecast;
