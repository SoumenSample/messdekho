import { CITY_NETWORK, ALL_CITIES_EXPANDED } from "@/data/mockData";
import { MapPin, Home } from "lucide-react";
import { useState, useMemo } from "react";

export const CityNetworkSection = () => {
  const [hoveredCity, setHoveredCity] = useState(null);

  // Perfect circular positioning - center at 50%, 50%
  const generateCircularPositions = () => {
    const positions = {};
    const radius = 32; // % distance from center
    const centerX = 50;
    const centerY = 50;
    
    CITY_NETWORK.forEach((city, index) => {
      const angle = (index / CITY_NETWORK.length) * 2 * Math.PI - (Math.PI / 2);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      positions[city.name] = { 
        top: `${y}%`, 
        left: `${x}%`,
        angle: angle * (180 / Math.PI)
      };
    });
    
    return positions;
  };

  const cityPositions = useMemo(() => generateCircularPositions(), []);

  // Generate straight SVG path from center to city
  const generateCurvedLine = (cityName, index) => {
    const pos = cityPositions[cityName];
    if (!pos) return "";
    
    // Center point of the container
    const startX = 50;
    const startY = 50;
    
    // Calculate end point as percentage
    const endPercentX = parseFloat(pos.left);
    const endPercentY = parseFloat(pos.top);

    return `M ${startX} ${startY} L ${endPercentX} ${endPercentY}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* LEFT: Premium Infographic Map with Circular Network */}
          <div className="relative w-full h-auto lg:min-h-[650px] bg-gradient-to-br from-emerald-50/20 via-slate-50/30 to-blue-50/20 overflow-hidden">
            
            {/* High-quality dotted world map background pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(16, 185, 129, 0.4) 0.6px, transparent 0.6px)`,
                backgroundSize: "28px 28px",
                backgroundPosition: "0 0"
              }}
            />
            
            {/* Radial gradient for depth - simulates map curvature */}
            <div className="absolute inset-0 bg-radial-gradient" style={{
              backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)`
            }} />

            {/* Animated soft gradient orbs for modern SaaS feel */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-3xl opacity-8 animate-pulse" style={{ animationDuration: "6s" }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-6 animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />

            {/* SVG Container for connection lines - Full viewport coverage */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06))" }}
            >
              <defs>
                {/* Premium gradient for connection lines */}
                <linearGradient id="cityConnectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
                </linearGradient>

                {/* Animated glow filter */}
                <filter id="connectionGlow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
                </filter>

                {/* Inner glow for premium feel */}
                <filter id="innerGlow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                </filter>
              </defs>

              {/* Curved connection lines from center to each city */}
              {CITY_NETWORK.map((city, index) => (
                <g key={`line-${city.name}`}>
                  {/* Outer glow layer - wide and soft */}
                  <path
                    d={generateCurvedLine(city.name, index)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity="0.15"
                    filter="url(#connectionGlow)"
                    style={{
                      animation: `glowPulse ${4 + index * 0.2}s ease-in-out infinite`,
                    }}
                  />

                  {/* Main animated dashed line */}
                  <path
                    d={generateCurvedLine(city.name, index)}
                    fill="none"
                    stroke="url(#cityConnectionGrad)"
                    strokeWidth="0.6"
                    strokeDasharray="2 1.5"
                    strokeLinecap="round"
                    opacity="0.75"
                    style={{
                      animation: `dashAnimation 3.5s linear infinite`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  />

                  {/* Particle floating along line */}
                  <circle
                    cx="50"
                    cy="50"
                    r="0.6"
                    fill="#10b981"
                    opacity="0.8"
                    style={{
                      animation: `particleFlow 4s ease-in-out infinite`,
                      animationDelay: `${index * 0.15}s`,
                    }}
                  />
                </g>
              ))}

              <style>{`
                @keyframes dashAnimation {
                  0% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -3; }
                }
                @keyframes glowPulse {
                  0%, 100% { opacity: 0.1; }
                  50% { opacity: 0.25; }
                }
                @keyframes particleFlow {
                  0% { offset-distance: 0%; opacity: 0; }
                  15% { opacity: 1; }
                  85% { opacity: 1; }
                  100% { offset-distance: 100%; opacity: 0; }
                }
              `}</style>
            </svg>

            {/* Content Layer - Logo and Cities */}
            <div className="relative h-full w-full p-8 lg:p-12" style={{ minHeight: "650px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              
              {/* Central Mess Dekho Logo */}
              <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 50 }}>
                
                {/* Animated glow rings */}
                <div className="absolute -inset-8 rounded-full border-2 border-emerald-300 opacity-40" style={{ animation: "expandRing 2s ease-out infinite" }} />
                <div className="absolute -inset-4 rounded-full border border-emerald-200 opacity-30" style={{ animation: "expandRing 2s ease-out infinite 0.5s" }} />

                {/* Logo Container with enhanced styling */}
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-2xl border-2 border-emerald-400/60 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
                    <Home className="h-14 w-14 strokeWidth={1.5} text-emerald-50" />
                  </div>

                  {/* Logo Text */}
                  <div className="mt-4 text-center">
                    <div className="font-heading font-black text-xs text-gray-600 tracking-widest">MESS</div>
                    <div className="font-heading font-black text-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">DEKHO</div>
                  </div>
                </div>
              </div>

              {/* City Nodes - Perfect Circular Arrangement */}
              {CITY_NETWORK.map((city, index) => {
                const pos = cityPositions[city.name];
                if (!pos) return null;

                return (
                  <div
                    key={city.name}
                    className="absolute group cursor-pointer"
                    style={{
                      left: pos.left,
                      top: pos.top,
                      transform: "translate(-50%, -50%)",
                      zIndex: hoveredCity === city.name ? 50 : 30,
                    }}
                    onMouseEnter={() => setHoveredCity(city.name)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* Animated glow dot below image */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-none" style={{ top: "calc(100% + 6px)", zIndex: 10 }}>
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/70 animate-pulse" />
                    </div>

                    {/* City Image Container */}
                    <div className="relative">
                      {/* Hover glow effect - enhanced */}
                      <div
                        className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"
                        style={{ zIndex: 0 }}
                      />

                      {/* Circular Image - Larger for better visibility */}
                      <div
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-100 to-gray-50"
                        style={{
                          boxShadow: hoveredCity === city.name
                            ? "0 16px 48px rgba(16, 185, 129, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.08)"
                            : "0 6px 20px rgba(0, 0, 0, 0.12)",
                          transform: hoveredCity === city.name ? "scale(1.15) rotate(5deg)" : "scale(1) rotate(0deg)",
                          zIndex: 20,
                        }}
                      >
                        <img
                          src={city.image}
                          alt={city.name}
                          className="w-full h-full object-cover object-center transition-transform duration-300"
                          style={{ transform: hoveredCity === city.name ? "scale(1.1)" : "scale(1)" }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/200x200/10b981/ffffff?text=${city.name}`;
                          }}
                        />

                        {/* Enhanced overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent group-hover:from-black/20 transition-all duration-300" />
                      </div>
                    </div>

                    {/* City Label - Below image */}
                    <div className="absolute left-1/2 -translate-x-1/2 mt-3 text-center pointer-events-none" style={{ top: "calc(100% + 12px)", minWidth: "100px", zIndex: 10 }}>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors duration-200 whitespace-nowrap drop-shadow-sm">
                        {city.name}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Global animation styles */}
              <style>{`
                @keyframes expandRing {
                  0% {
                    transform: scale(1);
                    opacity: 0.6;
                  }
                  100% {
                    transform: scale(1.4);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          </div>

          {/* RIGHT: Premium Content Section */}
          <div className="flex flex-col justify-between gap-8 bg-white p-8 sm:p-10 lg:p-12">
            {/* Top Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
                <MapPin className="h-3.5 w-3.5" />
                Connecting Cities Nationwide
              </div>

              {/* Heading */}
              <h2 className="mt-4 font-heading text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
                Mess Dekho,
                <br />
                <span className="text-gray-800">Connecting Students</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent font-black">
                  Across India
                </span>
              </h2>

              {/* Description */}
              <p className="mt-5 text-gray-600 text-sm sm:text-base leading-relaxed">
                Discover premium mess accommodations in 25+ cities across India. Trusted by 10,000+ students and 500+ verified mess owners.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-gradient-to-b from-emerald-50/40 to-emerald-50/10 rounded-2xl p-6 border border-emerald-100/50">
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 group-hover:scale-110 transition-transform">25+</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Cities</p>
              </div>
              <div className="text-center border-l border-r border-emerald-200/50 group">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 group-hover:scale-110 transition-transform">10K+</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Students</p>
              </div>
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 group-hover:scale-110 transition-transform">500+</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">Listings</p>
              </div>
            </div>

            {/* Featured Cities */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-heading font-bold text-gray-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-700" />
                Find Your Perfect Mess
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_CITIES_EXPANDED.map((city) => (
                  <div
                    key={city}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors group cursor-pointer"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 group-hover:scale-150 transition-transform" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                      {city}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};