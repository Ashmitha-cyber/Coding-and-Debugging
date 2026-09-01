import React, { useState, useMemo } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Code2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RoundResult, ParticipantInfo, PerformanceRank, Question, QuestionAnswerState } from '../types';
import { LEVEL_CONFIGS, QUESTIONS } from '../data/questions';
import { soundManager } from '../utils/audio';

interface FinalResultsProps {
  roundResults: Record<number, RoundResult>;
  participant?: ParticipantInfo | null;
  answers?: Record<number, QuestionAnswerState>;
  questions?: Question[];
  onRestart: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  roundResults,
  participant,
  answers = {},
  questions = QUESTIONS,
  onRestart
}) => {
  const [selectedReviewRound, setSelectedReviewRound] = useState<1 | 2 | 3>(3);
  const [questionFilter, setQuestionFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Record<number, boolean>>({});

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

  // Filter questions for the selected review round
  const currentRoundQuestions = useMemo(() => {
    return questions.filter(q => q.round === selectedReviewRound);
  }, [questions, selectedReviewRound]);

  const filteredQuestions = useMemo(() => {
    return currentRoundQuestions.filter(q => {
      const state = answers[q.id];
      const isCorrect = state?.isCorrect ?? false;
      if (questionFilter === 'CORRECT') return isCorrect;
      if (questionFilter === 'INCORRECT') return !isCorrect;
      return true;
    });
  }, [currentRoundQuestions, answers, questionFilter]);

  const toggleQuestionExpand = (id: number) => {
    setExpandedQuestionIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    soundManager.playBeep(450, 'sine', 0.02);
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    currentRoundQuestions.forEach(q => {
      all[q.id] = true;
    });
    setExpandedQuestionIds(all);
  };

  const collapseAll = () => {
    setExpandedQuestionIds({});
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-[#081026]/95 border border-[#00f0ff]/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(0,240,255,0.3)] backdrop-blur-xl space-y-8"
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

        {/* ================= DETAILED QUESTION REVIEW & BUG EXPLANATIONS MODULE ================= */}
        <div className="space-y-4 pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Championship Question &amp; Bug Diagnosis Review
                </h3>
                <p className="text-[11px] font-mono text-gray-400">
                  Inspect answer keys and detailed code explanations for all levels.
                </p>
              </div>
            </div>

            <div className="flex gap-2 font-mono text-[11px]">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 rounded bg-[#09142e] border border-gray-700 hover:border-[#00f0ff] text-gray-300 hover:text-[#00f0ff] transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 rounded bg-[#09142e] border border-gray-700 hover:border-[#00f0ff] text-gray-300 hover:text-[#00f0ff] transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Level Switcher Bar */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#050c1f] border border-gray-800 font-mono text-xs">
            {([1, 2, 3] as const).map(lvl => {
              const cfg = LEVEL_CONFIGS[lvl];
              const isSelected = selectedReviewRound === lvl;
              const lvlQuestions = questions.filter(q => q.round === lvl);
              const lvlCorrectCount = lvlQuestions.filter(q => answers[q.id]?.isCorrect).length;

              return (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedReviewRound(lvl);
                    soundManager.playBeep(480, 'sine', 0.03);
                  }}
                  className={`py-2.5 px-3 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00f0ff]/20 to-[#0055ff]/20 text-white border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>LEVEL 0{lvl}</span>
                    <span className="text-[10px] opacity-75">({lvlCorrectCount}/{lvlQuestions.length})</span>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-[#00f0ff]">
                    {cfg.levelName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters for Selected Level */}
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex rounded-lg bg-black/40 p-0.5 border border-gray-800 text-[10px]">
              <button
                onClick={() => setQuestionFilter('ALL')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  questionFilter === 'ALL'
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold border border-[#00f0ff]/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ALL ({currentRoundQuestions.length})
              </button>
              <button
                onClick={() => setQuestionFilter('CORRECT')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  questionFilter === 'CORRECT'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-gray-400 hover:text-emerald-300'
                }`}
              >
                CORRECT ({currentRoundQuestions.filter(q => answers[q.id]?.isCorrect).length})
              </button>
              <button
                onClick={() => setQuestionFilter('INCORRECT')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  questionFilter === 'INCORRECT'
                    ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                    : 'text-gray-400 hover:text-red-300'
                }`}
              >
                MISSED ({currentRoundQuestions.filter(q => !answers[q.id]?.isCorrect).length})
              </button>
            </div>

            <div className="text-[11px] text-gray-400">
              Showing <span className="text-[#00f0ff] font-bold">{filteredQuestions.length}</span> questions
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-8 text-center text-gray-500 font-mono text-xs bg-[#050c1f] rounded-2xl border border-gray-800">
                No questions found under the "{questionFilter}" filter for Level 0{selectedReviewRound}.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const state = answers[q.id];
                const isCorrect = state?.isCorrect ?? false;
                const userCode = state?.code || q.brokenCode;
                const isExpanded = !!expandedQuestionIds[q.id];
                const originalIndex = currentRoundQuestions.findIndex(orig => orig.id === q.id);

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
                            <span>·</span>
                            <span className="text-gray-500">{q.seqId}</span>
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
                            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1 text-[11px]">
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

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundManager.playBeep(520, 'sine', 0.05);
              onRestart();
            }}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:opacity-95 text-black font-extrabold font-mono text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART BUG ARENA</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
