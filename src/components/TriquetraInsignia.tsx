import React from 'react';

interface TriquetraInsigniaProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const TriquetraInsignia: React.FC<TriquetraInsigniaProps> = ({
  className = '',
  size = 460,
  glow = true
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow circles */}
      {glow && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00f0ff]/25 via-[#2563eb]/20 to-[#ff9e00]/20 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute inset-4 rounded-full bg-[#00f0ff]/15 blur-xl pointer-events-none" />
        </>
      )}

      {/* Cybernetic outer spinning decorative ring */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          cx="250" 
          cy="250" 
          r="238" 
          stroke="#00f0ff" 
          strokeWidth="2" 
          strokeDasharray="8 6" 
          strokeOpacity="0.4" 
          className="animate-spin" 
          style={{ transformOrigin: 'center', animationDuration: '60s' }} 
        />
        <circle 
          cx="250" 
          cy="250" 
          r="244" 
          stroke="#ff9e00" 
          strokeWidth="1.5" 
          strokeDasharray="20 12 4 12" 
          strokeOpacity="0.3" 
        />
      </svg>

      {/* Exact Triquetra Symposium Official Circular Emblem */}
      <div className="relative w-[94%] h-[94%] rounded-full overflow-hidden shadow-[0_0_45px_rgba(0,240,255,0.45)] border-2 border-[#00f0ff]/40 bg-[#09172e] flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Triquetra'26 Coding & Debugging Emblem"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
