import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Lock,
  RefreshCw,
  Award,
  Users,
  Lightbulb,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RoundResult, ParticipantInfo, ParticipantRecord, Question, QuestionAnswerState, Department } from '../types';
import { LEVEL_CONFIGS } from '../data/questions';
import { soundManager } from '../utils/audio';
import { participantStore } from '../utils/participantStore';

interface RoundResultsProps {
  round: 1 | 2 | 3;
  result: RoundResult;
  questions?: Question[];
  answers?: Record<number, QuestionAnswerState>;
  participant?: ParticipantInfo | null;
  onContinue: () => void;
  onViewFinalTelemetry?: () => void;
}

export const RoundResults: React.FC<RoundResultsProps> = ({
  round,
  result,
  questions = [],
  answers = {},
  participant,
  onContinue,
  onViewFinalTelemetry
}) => {
  const currentConfig = LEVEL_CONFIGS[round];
  const [isRoundConcluded, setIsRoundConcluded] = useState<boolean>(false);
  const [isQualified, setIsQualified] = useState<boolean>(false);
  const [participantRecord, setParticipantRecord] = useState<ParticipantRecord | null>(null);
  const [qualifiedList, setQualifiedList] = useState<ParticipantRecord[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Tab & Filter States for Concluded View
  const [activeTab, setActiveTab] = useState<'QUALIFIED_LIST' | 'EXPLANATIONS'>('QUALIFIED_LIST');
  const [questionFilter, setQuestionFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({});

  const checkQualification = async () => {
    try {
      // Trigger background sync to ensure latest conclusions and participants
      if (round === 1) {
        participantStore.fetchConclusions().catch(() => {});
        participantStore.fetchAllParticipants().catch(() => {});
      }

      // Check conclusion status for Round 1
      if (round === 1) {
        const conclusions = participantStore.getCachedConclusions();
        const deptKey = (participant?.department || '').trim().toUpperCase() as Department;
        const isDeptConcluded = deptKey && conclusions[deptKey] !== undefined ? conclusions[deptKey] : false;
        const concluded = !!(isDeptConcluded || conclusions.global);
        setIsRoundConcluded(concluded);
      } else {
        // Round 2 and Round 3 are automatically ready for detailed review once submitted
        setIsRoundConcluded(true);
      }

      const list = participantStore.getCachedParticipants();
      if (list && list.length > 0) {
        // Robust match for current participant
        const userReg = (participant?.registerNumber || '').toUpperCase().trim();
        const userPartnerReg = (participant?.partnerRegisterNumber || '').toUpperCase().trim();
        const userName = (participant?.name || '').toLowerCase().trim();
        const userTeam = (participant?.teamName || '').toLowerCase().trim();

        const current = list.find((p) => {
          const pReg = (p.registerNumber || '').toUpperCase().trim();
          const pPartnerReg = (p.partnerRegisterNumber || '').toUpperCase().trim();
          const pName = (p.name || '').toLowerCase().trim();
          const pTeam = (p.teamName || '').toLowerCase().trim();

          if (userReg && pReg && pReg === userReg) return true;
          if (userPartnerReg && pPartnerReg && pPartnerReg === userPartnerReg) return true;
          if (userReg && pPartnerReg && pPartnerReg === userReg) return true;
          if (userPartnerReg && pReg && pReg === userPartnerReg) return true;
          if (userTeam && pTeam && pTeam === userTeam) return true;
          if (userName && pName && pName === userName) return true;
          return false;
        });

        if (current) {
          setParticipantRecord(current);
          setIsQualified(!!current.qualifiedForRound2);
        } else {
          setIsQualified(false);
        }

        // Get qualified list for the department (or overall)
        const qualified = list.filter((p) => {
          if (participant?.department) {
            return p.department === participant.department && !!p.qualifiedForRound2;
          }
          return !!p.qualifiedForRound2;
        });
        setQualifiedList(qualified);
      }
    } catch (e) {
      console.error('Failed to parse qualification state', e);
    }
  };

  useEffect(() => {
    checkQualification();

    // Event listeners for conclusion / participant updates from Admin portal
    const handleConcludeEvent = () => {
      checkQualification();
    };

    window.addEventListener('triquetra_round1_concluded_event', handleConcludeEvent);
    window.addEventListener('triquetra_participants_updated', handleConcludeEvent);

    // Periodic polling every 2.5 seconds to catch admin conclusion in real-time
    const interval = setInterval(checkQualification, 2500);

    return () => {
      window.removeEventListener('triquetra_round1_concluded_event', handleConcludeEvent);
      window.removeEventListener('triquetra_participants_updated', handleConcludeEvent);
      clearInterval(interval);
    };
  }, [participant, result, round]);

  const handleManualCheck = () => {
    setIsChecking(true);
    soundManager.playBeep(520, 'sine', 0.04);
    setTimeout(() => {
      checkQualification();
      setIsChecking(false);
    }, 600);
  };

  const toggleQuestionExpand = (id: number) => {
    setExpandedQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
    soundManager.playBeep(450, 'sine', 0.02);
  };

  const expandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    questions.forEach((q) => {
      allExpanded[q.id] = true;
    });
    setExpandedQuestionIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedQuestionIds({});
  };

  // Filtered questions based on user selection
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const state = answers[q.id];
      const isCorrect = state?.isCorrect ?? false;
      if (questionFilter === 'CORRECT') return isCorrect;
      if (questionFilter === 'INCORRECT') return !isCorrect;
      return true;
    });
  }, [questions, answers, questionFilter]);

  const minutes = Math.floor(result.timeRemainingSeconds / 60);
  const seconds = result.timeRemainingSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const timeUsedM = Math.floor(result.timeUsedSeconds / 60);
  const timeUsedS = result.timeUsedSeconds % 60;
  const timeUsedFormatted = `${timeUsedM}m ${timeUsedS}s`;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-[#081026]/95 border border-[#00f0ff]/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,240,255,0.25)] backdrop-blur-xl space-y-6"
      >
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" /> LEVEL 0{round} COMPLETED
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wide font-mono">
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

        {/* ROUND 1 EVALUATION / CONCLUSION STATE */}
        {round === 1 ? (
          <div className="space-y-6">
            {!isRoundConcluded ? (
              /* AWAITING ADMIN CONCLUSION STATE */
              <div className="p-6 rounded-2xl bg-[#050c1f] border border-[#00f0ff]/30 space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  AWAITING EVALUATORS TO CONCLUDE ROUND 1
                </div>

                <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
                  Your Round 1 solution has been recorded in the Arena Leaderboard. The evaluators are currently reviewing department submissions. Once the admin clicks <strong className="text-[#00f0ff]">Conclude Round 1</strong>, your official qualification status, next round shortlist, and code explanations will be revealed here automatically.
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleManualCheck}
                    disabled={isChecking}
                    className="px-5 py-2.5 rounded-xl bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Checking Arena Server...' : 'Check Status / Refresh'}
                  </button>
                </div>

                <div className="text-[11px] font-mono text-gray-500 flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Answer keys and shortlist are locked until admin concludes Round 1</span>
                </div>
              </div>
            ) : (
              /* ADMIN HAS CONCLUDED ROUND 1 -> REVEAL QUALIFICATION, SHORTLIST & EXPLANATIONS */
              <div className="space-y-6">
                {/* 1. QUALIFICATION BANNER & ADVANCE OPTION */}
                {isQualified ? (
                  /* QUALIFIED STATE */
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
                      Great work, <strong className="text-white">{participant?.teamName || participant?.name}</strong>! Based on your Round 1 performance and admin evaluation, you have officially qualified for <strong className="text-emerald-300">Level 02: CODE REPAIR</strong>.
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
                  /* NOT QUALIFIED STATE */
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
                          EVALUATION CONCLUDED
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wide">
                          THANK YOU FOR PARTICIPATING
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      Thank you for participating in <strong className="text-white">Triquetra'26 Coding &amp; Debugging Arena</strong>! While your score did not meet the shortlisting cutoff for Round 2, we sincerely appreciate your hard work and competitive spirit. You can review all correct code solutions and bug explanations below.
                    </p>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          soundManager.playBeep(450, 'sine', 0.05);
                          if (onViewFinalTelemetry) {
                            onViewFinalTelemetry();
                          } else {
                            onContinue();
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-95 text-white font-bold font-mono text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                      >
                        <Award className="w-4 h-4" />
                        <span>VIEW FINAL PARTICIPATION TELEMETRY</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. TAB CONTROLS: SELECTED PARTICIPANTS VS BUG EXPLANATIONS */}
                <div className="space-y-4">
                  <div className="flex border-b border-gray-800 gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('QUALIFIED_LIST');
                        soundManager.playBeep(480, 'sine', 0.02);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold cursor-pointer transition-all border-b-2 ${
                        activeTab === 'QUALIFIED_LIST'
                          ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>SELECTED CANDIDATES FOR ROUND 2 ({qualifiedList.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('EXPLANATIONS');
                        soundManager.playBeep(520, 'sine', 0.02);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold cursor-pointer transition-all border-b-2 ${
                        activeTab === 'EXPLANATIONS'
                          ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>ROUND 1 BUG EXPLANATIONS ({questions.length})</span>
                    </button>
                  </div>

                  {activeTab === 'QUALIFIED_LIST' ? (
                    /* SHORTLISTED PARTICIPANTS TABLE */
                    <div className="space-y-3">
                      <div className="p-4 bg-[#050c1f] rounded-2xl border border-emerald-500/30 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>OFFICIAL SHORTLIST — ADVANCING TO LEVEL 02: CODE REPAIR</span>
                          </div>
                          <span className="text-[11px] font-mono text-gray-400">
                            {participant?.department ? `Track: ${participant.department} · ` : ''}{qualifiedList.length} Selected Candidates
                          </span>
                        </div>

                        {qualifiedList.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 font-mono text-xs space-y-1">
                            <p>No candidates have been shortlisted yet for this track.</p>
                            <p className="text-[11px] text-gray-500">Evaluator shortlisting is in progress.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs">
                              <thead>
                                <tr className="border-b border-gray-800 text-gray-400 text-[10px] uppercase">
                                  <th className="py-2.5 px-3">#</th>
                                  <th className="py-2.5 px-3">Candidate / Team</th>
                                  <th className="py-2.5 px-3">Reg No</th>
                                  <th className="py-2.5 px-3">Track</th>
                                  <th className="py-2.5 px-3 text-right">R1 Score</th>
                                  <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-800/60">
                                {qualifiedList.map((p, idx) => {
                                  const isCurrent =
                                    participant?.registerNumber &&
                                    p.registerNumber?.toUpperCase() === participant.registerNumber.toUpperCase();

                                  return (
                                    <tr
                                      key={p.id || p.registerNumber || idx}
                                      className={`transition-colors ${
                                        isCurrent
                                          ? 'bg-emerald-500/15 border-l-2 border-emerald-400 font-bold'
                                          : 'hover:bg-white/5'
                                      }`}
                                    >
                                      <td className="py-2.5 px-3 text-gray-400">{idx + 1}</td>
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1.5">
                                          <span className={isCurrent ? 'text-emerald-300' : 'text-white'}>
                                            {p.teamName || p.name}
                                          </span>
                                          {isCurrent && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-400 text-black font-bold">
                                              YOU
                                            </span>
                                          )}
                                        </div>
                                        {p.partnerName && (
                                          <div className="text-[10px] text-gray-400">
                                            Partner: {p.partnerName} ({p.partnerRegisterNumber || ''})
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-gray-300">{p.registerNumber}</td>
                                      <td className="py-2.5 px-3">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                                          {p.department}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                                        {p.round1Score ?? 0}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                          <CheckCircle2 className="w-3 h-3" /> QUALIFIED
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* CORRECT ANSWERS, BUG DIAGNOSIS & EXPLANATIONS */
                    <div className="space-y-4">
                      {/* Filter Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#050c1f] p-3 rounded-xl border border-gray-800">
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-gray-400" />
                        <div className="flex gap-1">
                          <button
                            onClick={() => setQuestionFilter('ALL')}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                              questionFilter === 'ALL'
                                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            All ({questions.length})
                          </button>
                          <button
                            onClick={() => setQuestionFilter('INCORRECT')}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                              questionFilter === 'INCORRECT'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Incorrect ({result.totalQuestions - result.score})
                          </button>
                          <button
                            onClick={() => setQuestionFilter('CORRECT')}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                              questionFilter === 'CORRECT'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            Correct ({result.score})
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={expandAll}
                          className="text-[11px] font-mono text-gray-400 hover:text-[#00f0ff] underline cursor-pointer"
                        >
                          Expand All
                        </button>
                        <span className="text-gray-600">·</span>
                        <button
                          onClick={collapseAll}
                          className="text-[11px] font-mono text-gray-400 hover:text-[#00f0ff] underline cursor-pointer"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    {/* Question List */}
                    <div className="space-y-3">
                      {filteredQuestions.map((q, idx) => {
                        const state = answers[q.id];
                        const isCorrect = state?.isCorrect ?? false;
                        const userCode = state?.code || q.brokenCode;
                        const isExpanded = !!expandedQuestionIds[q.id];

                        return (
                          <div
                            key={q.id}
                            className={`rounded-2xl border transition-all ${
                              isCorrect
                                ? 'bg-[#050c1f] border-emerald-500/30'
                                : 'bg-[#050c1f] border-red-500/30'
                            }`}
                          >
                            {/* Question Header Card */}
                            <div
                              onClick={() => toggleQuestionExpand(q.id)}
                              className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-white/5 rounded-2xl transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                                    isCorrect
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                                      : 'bg-red-500/20 text-red-400 border border-red-400/40'
                                  }`}
                                >
                                  {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-gray-400">
                                      Q{(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                    <h4 className="font-mono text-xs font-bold text-white">
                                      {q.title}
                                    </h4>
                                  </div>
                                  <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2 mt-0.5">
                                    <span>{q.category}</span>
                                    <span>·</span>
                                    <span className="uppercase text-[#00f0ff]">{q.language}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    isCorrect
                                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-red-950/80 text-red-300 border border-red-500/40'
                                  }`}
                                >
                                  {isCorrect ? 'RESOLVED' : 'MISSED / BUGGY'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Collapsible Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-800 text-xs font-mono"
                                >
                                  {/* Problem Statement */}
                                  <div className="text-gray-300 text-[11px] leading-relaxed pt-2">
                                    <span className="text-[#00f0ff] font-bold">TASK: </span>
                                    {q.description}
                                  </div>

                                  {/* Expected Output */}
                                  {q.expectedOutput && (
                                    <div className="p-2.5 rounded-lg bg-[#0c1324] border border-gray-800 text-[11px]">
                                      <span className="text-gray-400">Target Output: </span>
                                      <code className="text-emerald-300 font-bold">{q.expectedOutput}</code>
                                    </div>
                                  )}

                                  {/* Code Comparison Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    {/* Candidate's Submitted Code */}
                                    <div className="space-y-1">
                                      <div className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-between">
                                        <span>Your Submission:</span>
                                        <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                                          {isCorrect ? 'Valid' : 'Failed Tests'}
                                        </span>
                                      </div>
                                      <pre className={`p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed ${
                                        isCorrect
                                          ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-100'
                                          : 'bg-red-950/20 border border-red-500/30 text-red-100'
                                      }`}>
                                        <code>{userCode}</code>
                                      </pre>
                                    </div>

                                    {/* Official Correct Solution */}
                                    <div className="space-y-1">
                                      <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                                        <span>Official Correct Code:</span>
                                      </div>
                                      <pre className="p-3 rounded-xl bg-[#031c15]/90 border border-emerald-500/40 text-emerald-200 overflow-x-auto text-[11px] leading-relaxed">
                                        <code>{q.expectedAnswer}</code>
                                      </pre>
                                    </div>
                                  </div>

                                  {/* Bug Explanation & Breakdown */}
                                  {q.explanation && (
                                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1 text-[11px]">
                                      <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[10px]">
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Bug Diagnosis &amp; Fix Explanation</span>
                                      </div>
                                      <p className="text-amber-100/90 leading-relaxed">
                                        {q.explanation}
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
          /* ROUND 2 OR ROUND 3 RESULTS (ADVANCE / FINAL RESULTS + CODE EXPLANATIONS) */
          <div className="space-y-6">
            <div className="pt-2">
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

            {/* Answer Key & Bug Explanations for Round 2 & Round 3 */}
            {questions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Level 0{round} Answer Key &amp; Explanations ({filteredQuestions.length})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Filter Pills */}
                    <div className="flex rounded-lg bg-black/40 p-0.5 border border-gray-800 font-mono text-[10px]">
                      <button
                        onClick={() => setQuestionFilter('ALL')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          questionFilter === 'ALL'
                            ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/40'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        ALL ({questions.length})
                      </button>
                      <button
                        onClick={() => setQuestionFilter('CORRECT')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          questionFilter === 'CORRECT'
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'text-gray-400 hover:text-emerald-300'
                        }`}
                      >
                        CORRECT ({questions.filter((q) => answers[q.id]?.isCorrect).length})
                      </button>
                      <button
                        onClick={() => setQuestionFilter('INCORRECT')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          questionFilter === 'INCORRECT'
                            ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                            : 'text-gray-400 hover:text-red-300'
                        }`}
                      >
                        MISSED ({questions.filter((q) => !answers[q.id]?.isCorrect).length})
                      </button>
                    </div>

                    <div className="flex gap-2 font-mono text-[11px]">
                      <button
                        onClick={expandAll}
                        className="text-gray-400 hover:text-[#00f0ff] underline cursor-pointer"
                      >
                        Expand All
                      </button>
                      <span className="text-gray-600">·</span>
                      <button
                        onClick={collapseAll}
                        className="text-gray-400 hover:text-[#00f0ff] underline cursor-pointer"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredQuestions.length === 0 ? (
                    <div className="py-6 text-center text-gray-500 font-mono text-xs">
                      No questions match the selected filter.
                    </div>
                  ) : (
                    filteredQuestions.map((q) => {
                      const state = answers[q.id];
                      const isCorrect = state?.isCorrect ?? false;
                      const userCode = state?.code || q.brokenCode;
                      const isExpanded = !!expandedQuestionIds[q.id];
                      const originalIndex = questions.findIndex(orig => orig.id === q.id);

                      return (
                        <div
                          key={q.id}
                          className={`rounded-2xl border transition-all ${
                            isCorrect
                              ? 'bg-[#050c1f] border-emerald-500/30'
                              : 'bg-[#050c1f] border-red-500/30'
                          }`}
                        >
                          <div
                            onClick={() => toggleQuestionExpand(q.id)}
                            className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-white/5 rounded-2xl transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                                  isCorrect
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                                    : 'bg-red-500/20 text-red-400 border border-red-400/40'
                                }`}
                              >
                                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-gray-400">
                                    Q{((originalIndex >= 0 ? originalIndex : 0) + 1).toString().padStart(2, '0')}
                                  </span>
                                  <h4 className="font-mono text-xs font-bold text-white">
                                    {q.title}
                                  </h4>
                                </div>
                                <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2 mt-0.5">
                                  <span>{q.category}</span>
                                  <span>·</span>
                                  <span className="uppercase text-[#00f0ff]">{q.language}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  isCorrect
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-red-950/80 text-red-300 border border-red-500/40'
                                }`}
                              >
                                {isCorrect ? 'RESOLVED' : 'MISSED / BUGGY'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-800 text-xs font-mono"
                              >
                                <div className="text-gray-300 text-[11px] leading-relaxed pt-2">
                                  <span className="text-[#00f0ff] font-bold">TASK: </span>
                                  {q.description}
                                </div>

                                {q.expectedOutput && (
                                  <div className="p-2.5 rounded-lg bg-[#0c1324] border border-gray-800 text-[11px]">
                                    <span className="text-gray-400">Target Output: </span>
                                    <code className="text-emerald-300 font-bold">{q.expectedOutput}</code>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                  <div className="space-y-1">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">
                                      Your Submission:
                                    </div>
                                    <pre className={`p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed ${
                                      isCorrect
                                        ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-100'
                                        : 'bg-red-950/20 border border-red-500/30 text-red-100'
                                    }`}>
                                      <code>{userCode}</code>
                                    </pre>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                                      <span>Official Correct Code:</span>
                                    </div>
                                    <pre className="p-3 rounded-xl bg-[#031c15]/90 border border-emerald-500/40 text-emerald-200 overflow-x-auto text-[11px] leading-relaxed">
                                      <code>{q.expectedAnswer}</code>
                                    </pre>
                                  </div>
                                </div>

                                {q.explanation && (
                                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1 text-[11px]">
                                    <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase text-[10px]">
                                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Bug Diagnosis &amp; Fix Explanation</span>
                                    </div>
                                    <p className="text-amber-100/90 leading-relaxed">
                                      {q.explanation}
                                    </p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
