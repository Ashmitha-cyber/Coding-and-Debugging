import React, { useState, useEffect } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  Lock,
  RefreshCw,
  Award,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { RoundResult, ParticipantInfo, ParticipantRecord } from '../types';
import { LEVEL_CONFIGS } from '../data/questions';
import { soundManager } from '../utils/audio';

interface RoundResultsProps {
  round: 1 | 2 | 3;
  result: RoundResult;
  participant?: ParticipantInfo | null;
  onContinue: () => void;
  onViewFinalTelemetry?: () => void;
}

export const RoundResults: React.FC<RoundResultsProps> = ({
  round,
  result,
  participant,
  onContinue,
  onViewFinalTelemetry
}) => {
  const currentConfig = LEVEL_CONFIGS[round];
  const [isRound1Concluded, setIsRound1Concluded] = useState<boolean>(false);
  const [isQualified, setIsQualified] = useState<boolean>(false);
  const [participantRecord, setParticipantRecord] = useState<ParticipantRecord | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkQualification = () => {
    try {
      const deptKey = participant?.department ? `triquetra_round1_concluded_${participant.department}` : null;
      const isDeptConcluded = deptKey ? localStorage.getItem(deptKey) === 'true' : false;
      const isGlobalConcluded = localStorage.getItem('triquetra_round1_concluded') === 'true';
      const concluded = isDeptConcluded || isGlobalConcluded;
      setIsRound1Concluded(concluded);

      const stored = localStorage.getItem('triquetra_participants');
      if (stored && participant?.registerNumber) {
        const list: ParticipantRecord[] = JSON.parse(stored);
        const current = list.find((p) => p.registerNumber === participant.registerNumber);
        if (current) {
          setParticipantRecord(current);
          setIsQualified(!!current.qualifiedForRound2);
        } else {
          // If not found in records, check if score is high as default fallback
          setIsQualified(result.score >= 10);
        }
      } else {
        setIsQualified(result.score >= 10);
      }
    } catch (e) {
      console.error('Failed to parse qualification state', e);
    }
  };

  useEffect(() => {
    checkQualification();

    // Event listener for conclusion / participant updates from Admin page
    const handleConcludeEvent = () => {
      checkQualification();
    };

    window.addEventListener('triquetra_round1_concluded_event', handleConcludeEvent);
    window.addEventListener('triquetra_participants_updated', handleConcludeEvent);

    // Periodic check every 2 seconds during Round 1 results to catch admin clicks
    const interval = setInterval(checkQualification, 2000);

    return () => {
      window.removeEventListener('triquetra_round1_concluded_event', handleConcludeEvent);
      window.removeEventListener('triquetra_participants_updated', handleConcludeEvent);
      clearInterval(interval);
    };
  }, [participant, result]);

  const handleManualCheck = () => {
    setIsChecking(true);
    soundManager.playBeep(520, 'sine', 0.04);
    setTimeout(() => {
      checkQualification();
      setIsChecking(false);
    }, 600);
  };

  const minutes = Math.floor(result.timeRemainingSeconds / 60);
  const seconds = result.timeRemainingSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const timeUsedM = Math.floor(result.timeUsedSeconds / 60);
  const timeUsedS = result.timeUsedSeconds % 60;
  const timeUsedFormatted = `${timeUsedM}m ${timeUsedS}s`;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-[#081026]/95 border border-[#00f0ff]/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,240,255,0.25)] backdrop-blur-xl space-y-6"
      >
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" /> LEVEL 0{round} COMPLETED
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wide">
            {currentConfig.levelName} EVALUATION
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            {participant?.name
              ? `${participant.name} (${participant.registerNumber}) · Year ${participant.year || 'III'} · Track: ${participant.department}`
              : 'Session Complete'}
          </p>
        </div>

        {/* Big Score Card */}
        <div className="bg-[#050c1f] rounded-2xl border border-[#00f0ff]/20 p-6 text-center space-y-2">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            RESOLVED CODE FIXES
          </div>
          <div className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#38bdf8]">
            {result.score} / {result.totalQuestions}
          </div>
          <div className="text-xs font-mono text-emerald-400">
            {result.accuracy}% ACCURACY RATING
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-[#050c1f] p-3 rounded-xl border border-gray-800">
            <div className="text-gray-500 text-[10px]">CORRECT</div>
            <div className="text-emerald-400 font-bold text-base mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {result.score}
            </div>
          </div>

          <div className="bg-[#050c1f] p-3 rounded-xl border border-gray-800">
            <div className="text-gray-500 text-[10px]">INCORRECT</div>
            <div className="text-red-400 font-bold text-base mt-1 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> {result.totalQuestions - result.score}
            </div>
          </div>

          <div className="bg-[#050c1f] p-3 rounded-xl border border-gray-800">
            <div className="text-gray-500 text-[10px]">TIME USED</div>
            <div className="text-[#00f0ff] font-bold text-base mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> {timeUsedFormatted}
            </div>
          </div>

          <div className="bg-[#050c1f] p-3 rounded-xl border border-gray-800">
            <div className="text-gray-500 text-[10px]">FOCUS STRIKES</div>
            <div className="text-amber-400 font-bold text-base mt-1 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> {result.tabSwitches} / 3
            </div>
          </div>
        </div>

        {/* Round 1 Special Conclusion Evaluation Logic */}
        {round === 1 ? (
          <div className="space-y-4">
            {isRound1Concluded ? (
              isQualified ? (
                /* QUALIFIED STATE: CONGRATULATIONS */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-[#07241d] to-[#041914] border-2 border-emerald-400/60 shadow-[0_0_35px_rgba(16,185,129,0.3)] space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        OFFICIALLY SHORTLISTED
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wide">
                        CONGRATULATIONS! QUALIFIED FOR ROUND 2
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Great work, <strong className="text-white">{participant?.teamName || participant?.name}</strong>! Based on your Round 1 submission and the faculty/admin evaluation, you have officially qualified to advance to <strong className="text-emerald-300">Round 2: CODE REPAIR</strong>. Prepare your duo/team for advanced logic debugging!
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        soundManager.playLaunch();
                        onContinue();
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-black font-extrabold font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer transition-all active:scale-95"
                    >
                      <span>ADVANCE TO LEVEL 02: CODE REPAIR</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* NOT QUALIFIED STATE: THANK YOU MESSAGE */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#1c182b]/90 via-[#181324] to-[#0c0817] border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.2)] space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40">
                        EVALUATION COMPLETE
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wide">
                        THANK YOU FOR PARTICIPATING
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    Thank you for participating in the <strong className="text-white">Triquetra'26 Coding &amp; Debugging Arena</strong>! Your Round 1 attempt has been evaluated. While your score did not meet the shortlisting cutoff for Round 2, we sincerely appreciate your hard work, speed, and competitive spirit. We wish you the very best in your upcoming hackathons and engineering journeys!
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        soundManager.playBeep(450, 'sine', 0.05);
                        if (onViewFinalTelemetry) {
                          onViewFinalTelemetry();
                        } else {
                          onContinue();
                        }
                      }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      <Award className="w-4 h-4" />
                      <span>VIEW PARTICIPATION TELEMETRY</span>
                    </button>
                  </div>
                </motion.div>
              )
            ) : (
              /* AWAITING ADMIN CONCLUSION STATE */
              <div className="p-5 rounded-2xl bg-[#050c1f] border border-[#00f0ff]/30 space-y-3 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  AWAITING EVALUATORS TO CONCLUDE ROUND 1
                </div>

                <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
                  Your Round 1 solution has been logged in the Arena Leaderboard. The faculty and evaluators are currently reviewing submissions. Once the admin clicks <strong className="text-[#00f0ff]">Conclude Round 1</strong>, your official qualification status will be displayed here automatically.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleManualCheck}
                    disabled={isChecking}
                    className="px-4 py-2.5 rounded-xl bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Checking Arena Server...' : 'Check Status / Refresh'}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playLaunch();
                      onContinue();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-gray-700 text-xs font-mono cursor-pointer"
                  >
                    Bypass &amp; Continue (Demo Mode) &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Round 2 or Round 3 normal advance button */
          <div className="pt-3">
            <button
              onClick={() => {
                soundManager.playLaunch();
                onContinue();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:opacity-95 text-black font-extrabold font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.4)] cursor-pointer transition-all active:scale-95"
            >
              <span>{round < 3 ? `ADVANCE TO LEVEL 0${round + 1}` : 'VIEW CHAMPIONSHIP REPORT'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
