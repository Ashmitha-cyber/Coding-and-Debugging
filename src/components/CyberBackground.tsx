import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030713]">
      {/* 1. Deep Space Radial Nebulas & Core Light Blooms */}
      <div className="absolute -top-32 left-1/4 w-[750px] h-[550px] bg-[#00f0ff]/12 rounded-full blur-[160px]" />
      <div className="absolute top-1/4 -right-24 w-[650px] h-[650px] bg-[#2563eb]/15 rounded-full blur-[170px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#00d2ff]/10 rounded-full blur-[180px]" />
      <div className="absolute -bottom-40 left-1/3 w-[800px] h-[600px] bg-[#3b82f6]/15 rounded-full blur-[180px]" />

      {/* 2. Top-Left Watermark Bug Wireframe (matching image) */}
      <div className="absolute top-8 left-4 sm:left-12 opacity-[0.06] text-[#00f0ff] pointer-events-none transform -rotate-12 scale-125 sm:scale-150">
        <svg width="340" height="340" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="50" cy="54" rx="20" ry="26" stroke="#00f0ff" strokeWidth="1.5" />
          <circle cx="50" cy="24" r="10" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="45" y1="16" x2="35" y2="8" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="55" y1="16" x2="65" y2="8" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="35" cy="8" r="2" fill="#00f0ff" />
          <circle cx="65" cy="8" r="2" fill="#00f0ff" />
          {/* Antenna segments & legs */}
          <path d="M 32 42 Q 12 36 6 24" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 30 54 Q 10 54 4 62" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 32 66 Q 14 74 8 88" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 68 42 Q 88 36 94 24" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 70 54 Q 90 54 96 62" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 68 66 Q 86 74 92 88" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Internal circuit lines on bug */}
          <line x1="50" y1="30" x2="50" y2="78" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="38" y1="50" x2="62" y2="50" stroke="#00f0ff" strokeWidth="1.2" />
          <line x1="40" y1="62" x2="60" y2="62" stroke="#00f0ff" strokeWidth="1.2" />
        </svg>
      </div>

      {/* 3. PCB Circuit Board Vector Network (Top-Right & Center Flanks) */}
      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="goldLine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9e00" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff9e00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Right side intricate circuit tracks */}
        <g stroke="url(#cyanLine)" strokeWidth="1.2" fill="none">
          <path d="M 750 0 L 750 120 L 820 190 L 980 190" />
          <path d="M 850 0 L 850 80 L 920 150 L 1200 150" />
          <path d="M 950 0 L 950 60 L 1050 160 L 1050 300 L 1150 400" />
          <path d="M 1100 0 L 1100 140 L 1220 260 L 1400 260" />
          <path d="M 1300 0 L 1300 90 L 1380 170 L 1550 170" />
          <path d="M 680 160 L 640 200 L 520 200" />
          <path d="M 1120 380 L 1220 480 L 1450 480" />
          <path d="M 980 280 L 1080 380 L 1080 520 L 1180 620" />
        </g>

        {/* Circuit Nodes (Glowing Dots) */}
        <circle cx="820" cy="190" r="3" fill="#00f0ff" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="980" cy="190" r="2.5" fill="#00f0ff" />
        <circle cx="920" cy="150" r="2.5" fill="#00f0ff" />
        <circle cx="1050" cy="300" r="3" fill="#00f0ff" />
        <circle cx="1220" cy="260" r="2.5" fill="#00f0ff" />
        <circle cx="640" cy="200" r="2.5" fill="#00f0ff" />
        <circle cx="1220" cy="480" r="3" fill="#38bdf8" />
        <circle cx="1080" cy="520" r="2.5" fill="#00f0ff" />

        {/* Left side subtle circuit accents */}
        <g stroke="#00f0ff" strokeOpacity="0.2" strokeWidth="1" fill="none">
          <path d="M 0 140 L 180 140 L 240 200 L 340 200" />
          <path d="M 0 320 L 120 320 L 190 390 L 290 390" />
          <path d="M 80 0 L 80 80 L 140 140" />
          <circle cx="240" cy="200" r="2" fill="#00f0ff" />
          <circle cx="190" cy="390" r="2" fill="#00f0ff" />
        </g>
      </svg>

      {/* 4. Matrix Binary Streams (Left and Right) */}
      <div className="absolute top-20 left-4 sm:left-8 font-mono text-[9px] sm:text-[10px] text-[#00f0ff]/20 select-none leading-4 hidden md:block">
        <div className="text-[#00f0ff]/35 font-bold">01000011 01001111</div>
        <div>01000100 01001001</div>
        <div>01001110 01000111</div>
        <div className="mt-2 text-[#38bdf8]/30">01000001 01001110</div>
        <div>01000100 00100000</div>
        <div className="mt-2 text-[#00f0ff]/35 font-bold">01000100 01000101</div>
        <div>01000010 01010101</div>
        <div>01000111 01000111</div>
        <div className="mt-4 text-[#ff9e00]/25 font-bold"># include &lt;arena.h&gt;</div>
        <div className="text-[#ff9e00]/20">int init_matrix() &#123;</div>
        <div className="text-[#ff9e00]/20">&nbsp;&nbsp;return DEBUG_OK;</div>
        <div className="text-[#ff9e00]/20">&#125;</div>
      </div>

      <div className="absolute top-20 right-4 sm:right-8 font-mono text-[9px] sm:text-[10px] text-[#00f0ff]/20 select-none leading-4 text-right hidden md:block">
        <div className="text-[#00f0ff]/35 font-bold">11010010 10101100</div>
        <div>00101110 11010001</div>
        <div>10011101 01101010</div>
        <div className="mt-2 text-[#c084fc]/30">0x7FFE9042 // MEM</div>
        <div>0x00401000 // ENTRY</div>
        <div className="mt-4 text-[#c084fc]/25 font-bold">def patch_bytecode():</div>
        <div className="text-[#c084fc]/20">&nbsp;&nbsp;&nbsp;&nbsp;repair_overflow()</div>
        <div className="text-[#c084fc]/20">&nbsp;&nbsp;&nbsp;&nbsp;return 0x00</div>
      </div>

      {/* 5. 3D Glowing Cyber Perspective Grid Floor with Horizon Light Beam */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] overflow-hidden pointer-events-none">
        
        {/* Radiant Horizon Glow & High-Intensity Flare Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_20px_#00f0ff,0_0_40px_#00f0ff]" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-[#00f0ff]/15 blur-2xl rounded-full" />
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[40%] h-12 bg-white/20 blur-xl rounded-full" />

        {/* 3D Tilted Perspective Grid */}
        <div 
          className="w-full h-[180%] origin-top opacity-30"
          style={{
            transform: 'perspective(380px) rotateX(68deg) translateY(-20px)',
            backgroundImage: `
              linear-gradient(to right, #00f0ff 1.5px, transparent 1.5px),
              linear-gradient(to bottom, #00f0ff 1.5px, transparent 1.5px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 90%)'
          }}
        />
        
        {/* Soft bottom vignette so content remains ultra readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030713] via-[#030713]/40 to-transparent" />
      </div>

      {/* 6. Subtle Cyber Scanline Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px'
        }}
      />
    </div>
  );
};
