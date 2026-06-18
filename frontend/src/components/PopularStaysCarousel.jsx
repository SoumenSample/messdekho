import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PopularStaysCarousel({ items = [] }) {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [items]);

  const scroll = (dir = 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-stay-card]');
    const cardW = card ? card.clientWidth + 24 : el.clientWidth * 0.6;
    const amount = dir === 'left' ? -cardW : cardW;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading font-bold text-slate-900">Popular Stays Right Now</h3>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scroll('left')}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-800 transition-transform`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scroll('right')}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-800 transition-transform`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-2 touch-pan-x scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((it) => (
          <div
            key={it._id}
            data-stay-card
            className="flex-shrink-0 w-[min(340px,42vw)] sm:w-[360px] md:w-[380px] lg:w-[420px]"
          >
            <div className="rounded-[20px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(2,6,23,0.06)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <motion.img
                  src={(it.images && it.images[0]) || ''}
                  alt={it.title || it.city || 'Stay'}
                  className="h-full w-full object-cover object-center transition-transform duration-700"
                  whileHover={{ scale: 1.06 }}
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="text-lg font-semibold text-slate-900 truncate">{it.city || it.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
