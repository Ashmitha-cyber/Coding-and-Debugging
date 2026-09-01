import React from 'react';
import { Trophy, CheckCircle2, Award, RotateCcw, Share2, ShieldCheck, Sparkles, User } from 'lucide-react';
import { motion } from 'motion/react';
import { RoundResult, ParticipantInfo, PerformanceRank } from '../types';
import { LEVEL_CONFIGS } from '../data/questions';
import { soundManager } from '../utils/audio';

interface FinalResultsProps {
  roundResults: Record<number, RoundResult>;
  participant?: ParticipantInfo | null;
  onRestart: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  roundResults,
  participant,
  onRestart
}) => {
  // Aggregate stats
  let totalScore = 0;
  let totalQuestions = 0;
  let totalTimeSeconds = 0;
  let totalTabViolations = 0;

  [1, 2, 3].forEach(r => {
    const res = roundResults[r];
    if (res) {
      totalScore += res.score;
      totalQuestions += res.totalQuestions;
      totalTimeSeconds += res.timeUsedSeconds;
      totalTabViolations += res.tabSwitches;
    }
  });

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  // Rank calculation
  let rank: PerformanceRank = 'Bug Hunter';
  let rankColor = '#ff9e00';
  let rankBadge = 'TIER 4';

  if (overallAccuracy >= 90) {
    rank = 'Arena Master';
    rankColor = '#00f0ff';
    rankBadge = 'CHAMPION';
  } else if (overallAccuracy >= 75) {
    rank = 'Senior Debugger';
    rankColor = '#38bdf8';
    rankBadge = 'ELITE';
  } else if (overallAccuracy >= 50) {
    rank = 'Code Specialist';
    rankColor = '#c084fc';
    rankBadge = 'VETERAN';
  }

  const minutesUsed = Math.floor(totalTimeSeconds / 60);
  const secondsUsed = totalTimeSeconds % 60;
  const timeFormatted = `${minutesUsed}m ${secondsUsed}s`;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-[#081026]/95 border border-[#00f0ff]/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(0,240,255,0.3)] backdrop-blur-xl space-y-6"
      >
        {/* Certificate / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" /> TRIQUETRA'26 CODING &amp; DEBUGGING CERTIFICATE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide">
            BUG ARENA TELEMETRY REPORT
          </h1>
          <div className="text-xs font-mono text-gray-400 space-y-1">
            {participant?.name ? (
              <div>
                <p className="text-sm font-bold text-[#00f0ff]">
                  {participant.name} ({participant.registerNumber})
                  {participant.teamName ? ` · Team: ${participant.teamName}` : ''}
                </p>
                {participant.partnerName && (
                  <p className="text-xs text-gray-300">
                    Partner: {participant.partnerName} ({participant.partnerRegisterNumber || 'N/A'})
                  </p>
                )}
                <p className="text-[11px] text-gray-400">
                  Year {participant.year || 'III'} · Track: <span className="text-[#00f0ff]">{participant.department}</span>
                </p>
              </div>
            ) : (
              <p>Official Arena Participant</p>
            )}
          </div>
        </div>

        {/* Rank Badge */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1d3d] to-[#081226] border border-[#00f0ff]/30 text-center space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
            CERTIFIED RANKING // {rankBadge}
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono" style={{ color: rankColor }}>
            {rank}
          </div>
          <div className="text-xs text-gray-300 font-sans">
            Total Score: <strong className="text-white font-mono">{totalScore} / {totalQuestions || 45}</strong> · Overall Accuracy: <strong className="text-emerald-400 font-mono">{overallAccuracy}%</strong>
          </div>
        </div>

        {/* Level Breakdown Grid */}
        <div className="space-y-2 font-mono text-xs">
          <div className="text-[#00f0ff] font-bold uppercase tracking-wider text-[11px]">
            LEVEL-BY-LEVEL PERFORMANCE BREAKDOWN
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((roundNum) => {
              const res = roundResults[roundNum];
              const cfg = LEVEL_CONFIGS[roundNum as 1 | 2 | 3];
              return (
                <div key={roundNum} className="p-3.5 rounded-xl bg-[#050c1f] border border-gray-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold">LEVEL 0{roundNum}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                      {cfg.levelName}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {res ? `${res.score} / ${res.totalQuestions}` : '— / 15'}
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Acc: {res ? `${res.accuracy}%` : '—'}</span>
                    <span>Strikes: {res ? res.tabSwitches : 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aggregate Summary Bar */}
        <div className="p-4 rounded-xl bg-[#050c1f] border border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
          <div>
            <div className="text-gray-500 text-[10px]">TOTAL SCORE</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{totalScore} / 45</div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px]">TOTAL ACCURACY</div>
            <div className="text-lg font-bold text-[#00f0ff] mt-0.5">{overallAccuracy}%</div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px]">ELAPSED TIME</div>
            <div className="text-lg font-bold text-white mt-0.5">{timeFormatted}</div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px]">FOCUS STRIKES</div>
            <div className={`text-lg font-bold mt-0.5 ${totalTabViolations > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalTabViolations} Total
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundManager.playBeep(520, 'sine', 0.05);
              onRestart();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:opacity-95 text-black font-extrabold font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART BUG ARENA</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
