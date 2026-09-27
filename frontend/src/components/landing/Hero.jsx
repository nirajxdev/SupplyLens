import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* Pulsing dot keyframes */
const pulseKeyframes = `
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}
`;

/* Node diagram — scaled to 420×320, center r=45 */
const NodeDiagram = () => {
  const nodes = [
    { label: 'Inventory', x: 88, y: 33 },
    { label: 'Suppliers', x: 288, y: 11 },
    { label: 'Orders', x: 320, y: 176 },
    { label: 'Alerts', x: 221, y: 254 },
    { label: 'Forecasts', x: 66, y: 221 },
  ];
  const cx = 199, cy = 137, r = 45;

  return (
    <svg width="100%" height="auto" viewBox="0 0 420 320" style={{ maxWidth: '420px' }} fill="none">
      {/* Connection lines */}
      {nodes.map((n, i) => (
        <motion.line
          key={i} x1={cx} y1={cy} x2={n.x} y2={n.y}
          stroke="#e5e5e5" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
        />
      ))}
      {/* Flowing data dots */}
      {nodes.map((n, i) => (
        <motion.circle
          key={`dot-${i}`}
          r="2.5"
          fill="#10b981"
          initial={{ cx: cx, cy: cy, opacity: 0 }}
          animate={{ cx: [cx, n.x], cy: [cy, n.y], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}
      {/* Center node — black circle */}
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
        <circle cx={cx} cy={cy} r={r} fill="#111" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui">Supply</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" fontFamily="Inter, system-ui">Lens</text>
      </motion.g>
      {/* Satellite labels with pill bg */}
      {nodes.map((n, i) => (
        <motion.g key={`sat-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.08 }}>
          <rect x={n.x - 38} y={n.y - 12} width="76" height="24" rx="12" fill="#fff" stroke="#e5e5e5" strokeWidth="1" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#333" fontSize="11" fontWeight="500" fontFamily="Inter, system-ui">
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
};

const Hero = () => {
  return (
    <section style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <style>{pulseKeyframes}</style>
      <div className="mx-auto px-8" style={{ maxWidth: '1200px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', boxShadow: '0 2px 10px rgba(34,197,94,0.05)' }}
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}
            >
              {/* <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#22c55e', animation: 'pulse-dot 2s ease-in-out infinite' }}
              /> */}
              {/* <span style={{ fontSize: '14px', fontWeight: 500, color: '#166534' }}>Now in public beta</span> */}
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}
              style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 500, letterSpacing: '-2px', lineHeight: 1.08 }}
            >
              Full visibility.
              <br />
              <span style={{ color: '#a3a3a3' }}>Zero guesswork.</span>
            </motion.h1>

            <motion.p
              className="mt-6"
              style={{ fontSize: '17px', lineHeight: 1.65, color: '#64748b', maxWidth: '440px' }}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}
            >
              SupplyLens gives SMEs real-time inventory tracking,
              supplier analytics, and demand forecasting from a single
              dashboard.
            </motion.p>

            <motion.div
              className="flex items-center gap-4 mt-10"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}
            >
              <Link to="/signup">
                <button className="px-6 py-3 rounded-[12px] cursor-pointer border-0"
                  style={{ background: '#111', color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                  Start for free
                </button>
              </Link>
              <a href="#features">
                <button className="flex items-center gap-1.5 px-5 py-3 rounded-[12px] cursor-pointer"
                  style={{ background: 'transparent', border: '1px solid #e5e5e5', color: '#555', fontSize: '16px', fontWeight: 450 }}>
                  See a demo <span style={{ fontSize: '16px' }}>→</span>
                </button>
              </a>
            </motion.div>
          </motion.div>

          {/* Right — Node diagram */}
          <motion.div
            className="hidden lg:flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            <NodeDiagram />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
