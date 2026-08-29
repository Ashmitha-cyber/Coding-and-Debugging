import React from 'react';
import { ArrowRight, Clock, HelpCircle, ShieldAlert, Terminal, AlertTriangle, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { LEVEL_CONFIGS } from '../data/questions';
import { ParticipantInfo } from '../types';
import { soundManager } from '../utils/audio';

interface MissionBriefingProps {
  round: 1 | 2 | 3;
  participant?: ParticipantInfo | null;
  onBeginMission: () => void;
}

export const MissionBriefing: React.FC<MissionBriefingProps> = ({
  round,
  participant,
  onBeginMission
}) => {
  const level = LEVEL_CONFIGS[round];

  const handleBegin = () => {
    soundManager.playLaunch();
    onBeginMission();
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-[#081026]/95 border border-[#00f0ff]/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,240,255,0.2)] backdrop-blur-xl space-y-6"
      >
        {/* Header Tag */}
        <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b border-[#00f0ff]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest font-bold">
              {level.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {participant?.department && (
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                participant.department === 'IT' ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40' :
                participant.department === 'AIDS' ? 'bg-[#ff9e00]/20 text-[#ff9e00] border border-[#ff9e00]/40' :
                'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/40'
              }`}>
                TRACK: {participant.department}
              </span>
            )}
            <span className="font-mono text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded">
              {level.levelCode}
            </span>
          </div>
        </div>

        {/* Level Title & Description */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-wide text-white uppercase flex items-center gap-3">
            <span>LEVEL 0{round}:</span>
            <span className="text-[#00f0ff]">{level.levelName}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
            {level.description}
          </p>
        </div>

        {/* Level Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#050c1f] p-4 rounded-xl border border-[#00f0ff]/20">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Questions</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">15</div>
          </div>
          <div className="bg-[#050c1f] p-4 rounded-xl border border-[#00f0ff]/20">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Time Limit</div>
            <div className="text-2xl font-bold font-mono text-[#00f0ff] mt-1">15 Mins</div>
          </div>
          <div className="bg-[#050c1f] p-4 rounded-xl border border-[#00f0ff]/20">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Evaluation</div>
            <div className="text-sm font-bold font-mono text-[#ff9e00] mt-2">On Submit</div>
          </div>
          <div className="bg-[#050c1f] p-4 rounded-xl border border-[#00f0ff]/20">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Focus Limit</div>
            <div className="text-sm font-bold font-mono text-red-400 mt-2">3 Strikes</div>
          </div>
        </div>

        {/* Objective & Security Guidelines */}
        <div className="bg-[#050c1f] p-5 rounded-2xl border border-[#00f0ff]/15 space-y-3">
          <div className="font-mono text-xs text-[#00f0ff] uppercase tracking-wider font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4" /> LEVEL OPERATIONAL OBJECTIVE
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
            {level.objective}
          </p>

          <div className="pt-3 border-t border-gray-800 flex items-start gap-2 text-xs text-amber-300 font-mono">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Anti-Cheat Active: Do not switch tabs or minimize the window. 3 infractions will trigger automatic round submission.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleBegin}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:from-[#38e1ff] hover:to-[#1a6bff] text-black font-extrabold font-mono text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.4)] cursor-pointer active:scale-95 transition-all"
          >
            <span>COMMENCE LEVEL 0{round}</span>
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
