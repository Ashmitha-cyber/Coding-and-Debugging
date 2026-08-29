import React from 'react';
import { Globe, Satellite, Sparkles, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface SpaceshipJourneyProps {
  round: 1 | 2 | 3;
  answeredCount: number; // 0 to 15
  totalQuestions: number; // 15
  currentQuestionIndex: number;
}

export const SpaceshipJourney: React.FC<SpaceshipJourneyProps> = ({
  round,
  answeredCount,
  totalQuestions,
  currentQuestionIndex
}) => {
  // Progress fraction (0 to 1) based on answered + current active ratio
  const progressRatio = Math.min(1, Math.max(0, (answeredCount) / totalQuestions));
  const progressPercent = Math.round(progressRatio * 100);

  const getLocations = () => {
    switch (round) {
      case 1:
        return {
          origin: 'EARTH',
          originSub: 'ORIGIN',
          destination: 'SPACE STATION',
          destSub: 'DESTINATION',
          iconOrigin: Globe,
          iconDest: Satellite
        };
      case 2:
        return {
          origin: 'SPACE STATION',
          originSub: 'WAYPOINT A',
          destination: 'MARS ORBIT',
          destSub: 'DESTINATION',
          iconOrigin: Satellite,
          iconDest: Globe
        };
      case 3:
        return {
          origin: 'MARS ORBIT',
          originSub: 'WAYPOINT B',
          destination: 'DEEP SPACE GATEWAY',
          destSub: 'FINAL DESTINATION',
          iconOrigin: Globe,
          iconDest: Sparkles
        };
    }
  };

  const loc = getLocations();
  const OriginIcon = loc.iconOrigin;
  const DestIcon = loc.iconDest;

  return (
    <div className="w-full bg-[#151b2d]/90 backdrop-blur-md border border-[#aac7ff]/15 rounded-xl p-4 md:p-6 flex flex-col gap-3 relative overflow-hidden shadow-xl">
      {/* Background HUD Grid Accents */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="absolute top-2 right-4 font-mono text-[10px] text-[#aac7ff]/40 tracking-widest hidden sm:block">
        SECTOR TRAJECTORY // RD-0{round}
      </div>

      {/* Origin & Destination Labels + Spaceship Track */}
      <div className="flex items-center justify-between relative z-10 px-2 md:px-6">
        {/* Origin Node */}
        <div className="flex flex-col items-center gap-1 min-w-[70px] text-center">
          <div className="w-8 h-8 rounded-full bg-[#0c1324] border border-[#aac7ff]/50 flex items-center justify-center text-[#aac7ff] shadow-[0_0_10px_rgba(170,199,255,0.2)]">
            <OriginIcon className="w-4 h-4" />
          </div>
          <span className="font-mono text-[11px] font-bold text-[#aac7ff] uppercase tracking-wider">
            {loc.origin}
          </span>
          <span className="font-mono text-[9px] text-[#8b91a0] tracking-tight">
            {loc.originSub}
          </span>
        </div>

        {/* Central Interplanetary Flight Path */}
        <div className="flex-1 flex flex-col mx-3 md:mx-8 relative">
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10px] font-mono text-[#8b91a0] mb-2 px-1">
            <span className="flex items-center gap-1 text-[#3e90ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3e90ff] animate-ping" />
              PROPULSION ACTIVE
            </span>
            <span className="text-[#aac7ff] font-bold">
              {progressPercent}% REACHED ({answeredCount}/{totalQuestions} NODES)
            </span>
          </div>

          {/* Segmented Track Line */}
          <div className="relative w-full h-7 flex items-center">
            {/* Background tick marks */}
            <div className="w-full flex justify-between px-1 absolute z-0 opacity-25">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[1px] h-3 ${i <= answeredCount ? 'bg-[#3e90ff]' : 'bg-[#8b91a0]'}`}
                />
              ))}
            </div>

            {/* Base line */}
            <div className="w-full h-[2px] bg-[#2e3447] relative z-0 rounded-full" />

            {/* Active completed line glow */}
            <motion.div
              className="absolute left-0 h-[2px] bg-gradient-to-r from-[#3e90ff] via-[#aac7ff] to-[#d0bcff] shadow-[0_0_12px_rgba(170,199,255,0.8)] rounded-full z-10"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 60 }}
            />

            {/* Animated Spaceship Icon along path */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 z-20"
              initial={{ left: 0 }}
              animate={{ left: `calc(${progressPercent}% - 14px)` }}
              transition={{ type: 'spring', damping: 22, stiffness: 65 }}
            >
              <div className="relative group cursor-pointer">
                {/* Engine Thruster Particle Glow */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-2 bg-gradient-to-l from-[#3e90ff] to-transparent rounded-full blur-[2px] animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-[#0c1324] border border-[#3e90ff] flex items-center justify-center text-[#aac7ff] shadow-[0_0_18px_rgba(62,144,255,0.7)] rotate-90">
                  <Navigation className="w-4 h-4 text-[#3e90ff] fill-[#3e90ff]/30" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Destination Node */}
        <div className="flex flex-col items-center gap-1 min-w-[70px] text-center">
          <div className={`w-8 h-8 rounded-full bg-[#0c1324] border flex items-center justify-center transition-colors ${
            progressPercent === 100
              ? 'border-[#3e90ff] text-[#3e90ff] shadow-[0_0_15px_rgba(62,144,255,0.6)]'
              : 'border-[#8b91a0]/40 text-[#8b91a0]'
          }`}>
            <DestIcon className="w-4 h-4" />
          </div>
          <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
            progressPercent === 100 ? 'text-[#3e90ff]' : 'text-[#c0c6d6]'
          }`}>
            {loc.destination}
          </span>
          <span className="font-mono text-[9px] text-[#8b91a0] tracking-tight">
            {loc.destSub}
          </span>
        </div>
      </div>
    </div>
  );
};
