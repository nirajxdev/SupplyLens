import { useRef, useState, useEffect } from 'react';

export function useAnimatedCounter(end, { duration = 1.5, decimals = 0, prefix = '', suffix = '' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [value, setValue] = useState(0);

  // Coerce strings like "$1,234.00" / "98.2%" / "" to numbers. Falls back to 0.
  const numericEnd = (() => {
    if (typeof end === 'number' && Number.isFinite(end)) return end;
    if (typeof end === 'string') {
      const cleaned = end.replace(/[^0-9.\-]/g, '');
      const parsed = parseFloat(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  })();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const startTime = performance.now();
    const startVal = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (numericEnd - startVal) * eased;
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, numericEnd, duration]);

  const displayValue = `${prefix}${decimals > 0 ? value.toFixed(decimals) : Math.round(value)}${suffix}`;

  return { ref, displayValue, inView };
}
