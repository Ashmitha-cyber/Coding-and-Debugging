import React from 'react';
import { Volume2, VolumeX, Clock, ShieldAlert, User, Bug } from 'lucide-react';
import { LEVEL_CONFIGS } from '../data/questions';
import { Department, ParticipantInfo } from '../types';

interface TopAppBarProps {
  round: 1 | 2 | 3;
  timeLeft: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  tabSwitches: number;
  participant?: ParticipantInfo | null;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  round,
  timeLeft,
  soundEnabled,
  onToggleSound,
  tabSwitches,
  participant
}) => {
  const currentConfig = LEVEL_CONFIGS[round];

  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.max(0, timeLeft) % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeLeft <= 60;
  const isWarning = timeLeft <= 300 && timeLeft > 60;

  return (
    <header className="fixed top-0 left-0 w-full z-40 h-16 bg-[#060c1d]/90 backdrop-blur-xl border-b border-[#00f0ff]/20 px-4 sm:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Left: Logo & Event Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.4)] flex-shrink-0 bg-[#09172e]">
            <img src="/logo.png" alt="Triquetra Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-wider text-white flex items-center gap-1.5">
              <span>TRIQUETRA'26</span>
              <span className="text-[#00f0ff] text-xs font-mono font-normal tracking-wide">CODING &amp; DEBUGGING</span>
            </div>
          </div>
        </div>

        {/* Level & Dept Badge */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-800 font-mono text-xs">
          <span className="text-gray-400">LEVEL 0{round}:</span>
          <span className="font-bold text-[#00f0ff]">{currentConfig.levelName}</span>
          {participant?.department && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              participant.department === 'IT' ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40' :
              participant.department === 'AIDS' ? 'bg-[#ff9e00]/20 text-[#ff9e00] border border-[#ff9e00]/40' :
              'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/40'
            }`}>
              {participant.department}
            </span>
          )}
        </div>
      </div>

      {/* Center/Right: Participant Info, Focus Strikes & Countdown Timer */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Participant Tag */}
        {participant && (
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-gray-300 bg-[#0b1633] px-3 py-1 rounded-lg border border-[#00f0ff]/20">
            <User className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-white font-medium">{participant.name}</span>
            <span className="text-gray-500">({participant.registerNumber})</span>
          </div>
        )}

        {/* Tab Switch Infraction Badge */}
        <div className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg border transition-all ${
          tabSwitches >= 2
            ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
            : tabSwitches === 1
            ? 'bg-yellow-950/80 border-yellow-500 text-yellow-300'
            : 'bg-[#0b1633] border-gray-700 text-gray-400'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Focus:</span>
          <span className="font-bold">{tabSwitches} / 3</span>
        </div>

        {/* Real-time Urgency Timer */}
        <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold tracking-widest border transition-all shadow-md ${
          isUrgent
            ? 'bg-red-950/90 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
            : isWarning
            ? 'bg-yellow-950/90 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
            : 'bg-[#0b1633] border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formattedTime}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="w-9 h-9 rounded-xl bg-[#0b1633] border border-gray-700 hover:border-[#00f0ff] flex items-center justify-center text-gray-400 hover:text-[#00f0ff] transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>
      </div>
    </header>
  );
};
