import { useEffect, useRef, useState } from 'react';
import './ConnectingCities.css';

export const ConnectingCities = () => {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [positions, setPositions] = useState(null);

  useEffect(() => {
    const drawWorldDots = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const W = 680;
      const H = 580;
      canvas.width = W;
      canvas.height = H;

      // Load D3 and TopoJSON from CDN if not already loaded
      if (typeof window.d3 === 'undefined' || typeof window.topojson === 'undefined') {
        // Load D3
        if (typeof window.d3 === 'undefined') {
          await loadScript('https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js');
        }
        // Load TopoJSON
        if (typeof window.topojson === 'undefined') {
          await loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js');
        }
      }

      const d3 = window.d3;
      const topojson = window.topojson;

      // Fetch world TopoJSON (110m = simplified, small file ~90 KB)
      let world;
      try {
        world = await fetch(
          'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
        ).then((r) => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        });
      } catch (e) {
        fallbackDots(ctx, W, H);
        return;
      }

      // NaturalEarth projection, rotated so India (78 °E) is centred
      const projection = d3
        .geoNaturalEarth1()
        .scale(115)
        .rotate([-78, 0]) // 78 °E → screen centre
        .translate([W * 0.5, H * 0.52]);

      // Render filled land to an offscreen canvas for pixel sampling
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const offCtx = off.getContext('2d');

      const countries = topojson.feature(world, world.objects.countries);
      const geoPath = d3.geoPath(projection, offCtx);

      offCtx.beginPath();
      geoPath(countries);
      offCtx.fillStyle = '#000';
      offCtx.fill();

      const pixels = offCtx.getImageData(0, 0, W, H).data;

      // Draw dots only where pixel is black (= land)
      const gap = 10;
      const r = 1.35;
      for (let x = gap / 2; x < W; x += gap) {
        for (let y = gap / 2; y < H; y += gap) {
          // Red channel of the offscreen pixel
          const idx = (Math.round(y) * W + Math.round(x)) * 4;
          if (pixels[idx] > 80) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(178, 188, 210, 0.62)';
            ctx.fill();
          }
        }
      }
    };

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const fallbackDots = (ctx, W, H) => {
      for (let x = 5; x < W; x += 10) {
        for (let y = 5; y < H; y += 10) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(178, 188, 210, 0.40)';
          ctx.fill();
        }
      }
    };

    drawWorldDots();
  }, []);

  const cities = [
    {
      name: 'Kolkata',
      left: '340px',
      top: '42px',
      photoCenter: { x: 340, y: 80 },
      lineX2: 340,
      lineY2: 80,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Victoria_Memorial_Kolkata_(37610124104).jpg',
      dotDelay: '0s',
      lineDelay: '0s',
    },
    {
      name: 'Delhi',
      left: '165px',
      top: '127px',
      photoCenter: { x: 165, y: 165 },
      lineX2: 165,
      lineY2: 165,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/India_Gate_from_Rajpath.jpg',
      dotDelay: '0.27s',
      lineDelay: '0.28s',
    },
    {
      name: 'Lucknow',
      left: '515px',
      top: '127px',
      photoCenter: { x: 515, y: 165 },
      lineX2: 515,
      lineY2: 165,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bada_Imambada(Outer_view).jpg',
      dotDelay: '0.54s',
      lineDelay: '0.56s',
    },
    {
      name: 'Mumbai',
      left: '108px',
      top: '250px',
      photoCenter: { x: 108, y: 288 },
      lineX2: 108,
      lineY2: 288,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gateway_of_India_2025.jpg',
      dotDelay: '0.81s',
      lineDelay: '0.84s',
    },
    {
      name: 'Pune',
      left: '572px',
      top: '250px',
      photoCenter: { x: 572, y: 288 },
      lineX2: 572,
      lineY2: 288,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaniwar_Wada_during_sunset.jpg',
      dotDelay: '1.08s',
      lineDelay: '1.12s',
    },
    {
      name: 'Bangalore',
      left: '150px',
      top: '360px', /* moved slightly up to avoid clipping */
      photoCenter: { x: 150, y: 398 },
      lineX2: 150,
      lineY2: 398,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vidhana_Soudha_-_June_2019_(4).jpg',
      dotDelay: '1.35s',
      lineDelay: '1.40s',
    },
    {
      name: 'Chennai',
      left: '560px',
      top: '392px', /* moved up slightly */
      photoCenter: { x: 560, y: 430 },
      lineX2: 560,
      lineY2: 430,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chennai_Marina_beach_panorama1.jpg',
      dotDelay: '1.62s',
      lineDelay: '1.68s',
    },
    {
      name: 'Hyderabad',
      left: '240px',
      top: '408px', /* moved up to prevent label clipping */
      photoCenter: { x: 240, y: 446 },
      lineX2: 240,
      lineY2: 446,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Charminar_in_Night.jpg',
      dotDelay: '1.89s',
      lineDelay: '1.96s',
    },
    {
      name: 'Ahmedabad',
      left: '470px',
      top: '402px', /* nudged up */
      photoCenter: { x: 470, y: 440 },
      lineX2: 470,
      lineY2: 440,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Adalaj_stepwell01.JPG',
      dotDelay: '2.16s',
      lineDelay: '2.24s',
    },
  ];

  // generate a straight path from center to city photo center
  const generatePath = (x2, y2) => {
    const startX = 340;
    const startY = 285;
    return `M ${startX} ${startY} L ${x2} ${y2}`;
  };

  // refined generatePath kept for compatibility, now returns a straight line
  const generatePathRefined = (x2, y2, index) => {
    return generatePath(x2, y2);
  };

  // compute city image centers relative to SVG viewBox and store in state
  useEffect(() => {
    const compute = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const svgRect = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal || { width: 680, height: 580 };

      const nodes = Array.from(document.querySelectorAll('.city-node'));
      if (!nodes.length) return;

      const found = nodes.map((node) => {
        const idx = Number(node.getAttribute('data-city-index'));
        const img = node.querySelector('.city-photo');
        const rect = img ? img.getBoundingClientRect() : node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const x = ((cx - svgRect.left) / svgRect.width) * vb.width;
        const y = ((cy - svgRect.top) / svgRect.height) * vb.height;
        return { idx, x, y };
      });

      const ordered = cities.map((c, i) => {
        const f = found.find((p) => p.idx === i);
        return f ? { x: f.x, y: f.y } : { x: c.lineX2, y: c.lineY2 };
      });

      setPositions(ordered);
    };

    // small timeout so images/layout settle
    const t = setTimeout(compute, 40);
    window.addEventListener('resize', compute);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', compute);
    };
  }, []);

  return (
    <div className="connecting-cities-wrapper">
      {/* LEFT SIDE: Premium Map Visualization */}
      <div className="map-wrapper">
        {/* ① WORLD-MAP DOT BACKGROUND (drawn by JS with D3) */}
        <canvas
          ref={canvasRef}
          id="dot-canvas"
          className="dot-canvas"
          width="680"
          height="580"
        />

        {/* ② ANIMATED DASHED LINES (logo centre → photo centre of each city) */}
        {/* Logo centre : (340, 285) */}
        {/* City photo centres used as endpoints */}
        <svg
          id="lines-svg"
          ref={svgRef}
          className="lines-svg"
          viewBox="0 0 680 580"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>
            <filter id="connGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {cities.map((city, index) => (
            <g key={`path-${index}`}>
              {/* outer glow path */}
              <path
                id={`path-${index}`}
                d={generatePathRefined(positions?.[index]?.x ?? city.lineX2, positions?.[index]?.y ?? city.lineY2, index)}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.18"
                filter="url(#connGlow)"
                style={{ animationDelay: city.lineDelay }}
              />

              {/* main dashed path */}
              <path
                id={`main-${index}`}
                d={generatePathRefined(positions?.[index]?.x ?? city.lineX2, positions?.[index]?.y ?? city.lineY2, index)}
                fill="none"
                stroke="url(#connGrad)"
                strokeWidth="1.8"
                strokeDasharray="6 9"
                strokeLinecap="round"
                opacity="0.95"
                className="conn-path"
                style={{ animationDelay: city.lineDelay }}
              />
              {/* moving particle along the main path */}
              <circle r="3" className="particle" style={{ opacity: 0.85 }}>
                <animateMotion dur="3.8s" repeatCount="indefinite">
                  <mpath xlinkHref={`#main-${index}`} />
                </animateMotion>
              </circle>
            </g>
          ))}
        </svg>

        {/* ③ GREEN RADIAL GLOW behind logo */}
        <div className="center-glow" />

        {/* ④ CENTER LOGO */}
        <div className="center-logo">
          <svg
            className="logo-icon"
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="18" cy="18" r="17" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="1" />
            {/* serving-dome icon */}
            <path
              d="M8.5 24C8.5 17.649 13.149 12.5 19 12.5S29.5 17.649 29.5 24"
              stroke="#15803d"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <line
              x1="7.5"
              y1="24.8"
              x2="30.5"
              y2="24.8"
              stroke="#15803d"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <line
              x1="19"
              y1="11.5"
              x2="19"
              y2="9.5"
              stroke="#15803d"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="19" cy="8.8" r="2.1" fill="#15803d" />
          </svg>
          <div className="logo-text">
            MESS
            <br />
            DEKHO
          </div>
        </div>

        {/* ⑤ CITY NODES */}
        {/* CSS: left = photo horizontal centre, top = photo top edge (= photo_centre_y − 38) */}
          {cities.map((city, index) => (
          <div
            key={`city-${index}`}
            className="city-node"
            data-city-index={index}
            style={{ left: city.left, top: city.top }}
          >
            <img
              className="city-photo"
              src={city.imageUrl}
              alt={city.name}
              width={76}
              height={76}
              loading="lazy"
              decoding="async"
              style={{ opacity: 0, transition: 'opacity 320ms ease' }}
              onLoad={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onError={(e) => {
                const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23111' font-size='24'>${city.name}</text></svg>`;
                e.currentTarget.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
                e.currentTarget.style.opacity = '1';
              }}
            />
            <div
              className="city-dot"
              style={{ animationDelay: city.dotDelay }}
            />
            <div className="city-label">{city.name}</div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE: Premium Content Section */}
      <div className="content-section">
        <div className="content-glow content-glow-a" aria-hidden="true" />
        <div className="content-glow content-glow-b" aria-hidden="true" />
        <div className="content-particles" aria-hidden="true">
          <span className="content-particle particle-a" />
          <span className="content-particle particle-b" />
          <span className="content-particle particle-c" />
          <span className="content-particle particle-d" />
        </div>

        <div className="content-inner">
          {/* Heading */}
          <h2 className="heading">
            Mess Dekho,
            <span className="heading-line">Connecting Students</span>
            <span className="heading-highlight">Across India</span>
          </h2>

          {/* Description */}
          <p className="description">
            Discover premium mess accommodations in 25+ cities across India. Trusted by 10,000+ students and 500+ verified mess owners.
          </p>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <p className="stat-label">Cities</p>
            </div>
            <div className="stat-item stat-divider">
              <div className="stat-number">10K+</div>
              <p className="stat-label">Students</p>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <p className="stat-label">Listings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
