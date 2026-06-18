import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CityExploreCarousel.css';
import { DEFAULT_HOMEPAGE_CITIES } from '@/data/homepageCities';
import { homepageCityService } from '@/services/homepageCityService';

const mapHomepageCity = (city) => ({
  name: city.cityName || city.name || '',
  img: city.image || city.img || '',
  slug: city.slug || (city.cityName || city.name || '').toLowerCase(),
  isActive: city.isActive !== false,
  order: Number(city.order || 0)
});

export default function CityExploreCarousel() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const manualLayerRef = useRef(null);
  const loopWidthRef = useRef(0);
  const shiftRef = useRef(0);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startShift: 0,
    moved: false,
    pointerId: null,
  });
  const suppressClickRef = useRef(false);
  const nav = useNavigate();

  const [cities, setCities] = React.useState(DEFAULT_HOMEPAGE_CITIES.map(mapHomepageCity));
  const loopCities = [...cities, ...cities];

  useEffect(() => {
    let mounted = true;

    const fetchCities = async () => {
      try {
        const response = await homepageCityService.getHomepageCities();
        const apiCities = response?.data?.data?.cities || response?.data?.cities || [];
        const mapped = (Array.isArray(apiCities) ? apiCities : []).map(mapHomepageCity).filter((city) => city.isActive !== false);

        if (mounted && mapped.length > 0) {
          setCities(mapped);
        }
      } catch (error) {
        // Keep the current hardcoded fallback when the API is unavailable.
        if (mounted) {
          setCities(DEFAULT_HOMEPAGE_CITIES.map(mapHomepageCity));
        }
      }
    };

    fetchCities();

    return () => {
      mounted = false;
    };
  }, []);

  const getCardStep = () => {
    const card = viewportRef.current?.querySelector('[data-city-card]');
    return card ? card.clientWidth + 16 : 210;
  };

  const normalizeShift = (shift) => {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return shift;
    let nextShift = shift % loopWidth;
    if (nextShift < 0) nextShift += loopWidth;
    return nextShift;
  };

  const applyShift = (shift, useTransition = true) => {
    const layer = manualLayerRef.current;
    if (!layer) return;

    const normalized = normalizeShift(shift);
    shiftRef.current = normalized;
    layer.style.transition = useTransition ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    layer.style.transform = `translate3d(${normalized}px, 0, 0)`;
  };

  const nudgeShift = (delta) => {
    applyShift(shiftRef.current + delta, true);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      loopWidthRef.current = track.scrollWidth / 2;
      applyShift(shiftRef.current, false);
    };

    measure();

    let resizeObserver = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(track);
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', measure);
      }
    };
  }, []);

  const scrollByCard = (dir = 'right') => {
    nudgeShift(dir === 'left' ? -getCardStep() : getCardStep());
  };

  const handleClick = (city, event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    nav(`/listings?city=${encodeURIComponent(city)}`);
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startShift: shiftRef.current,
      moved: false,
      pointerId: event.pointerId,
    };

    suppressClickRef.current = false;
    manualLayerRef.current && (manualLayerRef.current.style.transition = 'none');
  };

  const onPointerMove = (event) => {
    if (!dragRef.current.active) return;

    const deltaX = event.clientX - dragRef.current.startX;
    if (Math.abs(deltaX) > 6) {
      dragRef.current.moved = true;
      suppressClickRef.current = true;
    }

    applyShift(dragRef.current.startShift + deltaX, false);
  };

  const endPointerDrag = (event) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    dragRef.current.pointerId = null;

    if (manualLayerRef.current) {
      manualLayerRef.current.style.transition = 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)';
    }

    if (dragRef.current.moved) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);
    } else {
      suppressClickRef.current = false;
    }

  };

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-semibold text-slate-900">Explore Top Cities</h3>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => scrollByCard('left')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-slate-800"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={() => scrollByCard('right')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-slate-800"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="city-marquee overflow-hidden pb-2 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onPointerLeave={endPointerDrag}
      >
        <div ref={trackRef} className="city-marquee__track flex w-max gap-4">
          <div ref={manualLayerRef} className="city-marquee__manual flex w-max gap-4">
            {loopCities.map((c, idx) => (
              <div
                key={`${c.name}-${idx}`}
                data-city-card
                className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[190px] lg:w-[210px]"
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-[20px] overflow-hidden shadow-[0_10px_30px_rgba(2,6,23,0.06)] bg-white cursor-pointer"
                    onClick={(event) => handleClick(c.name, event)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <motion.img
                      src={c.img}
                      alt={c.name}
                      className="h-full w-full object-cover object-center transition-transform duration-700"
                      whileHover={{ scale: 1.06 }}
                      loading="lazy"
                    />
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-sm font-medium text-slate-900 truncate">{c.name}</div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
