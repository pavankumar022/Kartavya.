import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Generate gentle rain particles
  useEffect(() => {
    const generateRaindrops = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -Math.random() * window.innerHeight,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1
        });
      }
      setParticles(newParticles);
    };

    generateRaindrops();
    
    const animateRain = () => {
      setParticles(prev => prev.map(particle => {
        const newY = particle.y + particle.speed;
        
        return {
          ...particle,
          y: newY > window.innerHeight ? -20 : newY
        };
      }));
    };

    const interval = setInterval(animateRain, 100);
    return () => clearInterval(interval);
  }, []);

  const handleExploreMore = () => {
    navigate('/login');
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 relative overflow-hidden cursor-none"
    >
      {/* Gentle Rain Animation */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/40 pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size * 3}px`,
            opacity: particle.opacity,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 100%)'
          }}
        />
      ))}

      {/* Cursor Following Light Effect */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
          borderRadius: '50%',
          transition: 'all 0.1s ease-out'
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Main Title with Glow Effect */}
        <div className="text-center mb-12">
          {/* Main Title */}
          <h1 
            className="landing-title text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tight"
            style={{
              fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
              fontWeight: '900',
              textShadow: '0 0 60px rgba(168, 85, 247, 0.6), 0 0 120px rgba(168, 85, 247, 0.4)',
              transform: `
                perspective(1000px) 
                rotateX(${(mousePosition.y - window.innerHeight/2) / 50}deg) 
                rotateY(${(mousePosition.x - window.innerWidth/2) / 50}deg)
              `,
              transition: 'transform 0.1s ease-out'
            }}
          >
            KARTAVYA
          </h1>
          
          {/* Subtitle with Floating Animation */}
          <p 
            className="landing-subtitle text-xl md:text-2xl lg:text-3xl text-gray-200 font-medium tracking-wide animate-breathe max-w-4xl mx-auto"
            style={{
              fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
              textShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
            }}
          >
            Be the Change Bharat Needs – Kartavya Se Shuru Karo.
          </p>
          

        </div>



        {/* Explore More Button */}
        <div className="mt-12">
          <button
            onClick={handleExploreMore}
            className="group relative px-10 md:px-16 py-4 md:py-5 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white text-lg md:text-xl font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-purple-500/30"
            style={{
              boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.3)',
              fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
              fontWeight: '700'
            }}
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button Text */}
            <span className="relative z-10 flex items-center gap-4">
              EXPLORE MORE
              <svg 
                className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-2 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>

            {/* Button Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </button>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-purple-400/20 rounded-full opacity-20 animate-spin-slow" />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-purple-300/15 rounded-full opacity-15 animate-pulse-glow" />
      </div>


    </div>
  );
};

export default Landing;