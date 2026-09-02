/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GamePhase, QuestionAnswerState, RoundResult, ParticipantInfo, Department, Question, ParticipantRecord } from './types';
import { LEVEL_CONFIGS, QUESTIONS } from './data/questions';
import { questionStore } from './utils/questionStore';
import { participantStore } from './utils/participantStore';
import { shuffleArray } from './utils/shuffle';
import { TopAppBar } from './components/TopAppBar';
import { TabSwitchMonitor } from './components/TabSwitchMonitor';
import { LandingPage } from './pages/LandingPage';
import { MissionBriefing } from './pages/MissionBriefing';
import { CompetitionPage } from './pages/CompetitionPage';
import { RoundResults } from './pages/RoundResults';
import { FinalResults } from './pages/FinalResults';
import { CyberBackground } from './components/CyberBackground';
import { validateAnswer } from './utils/answerValidator';
import { soundManager } from './utils/audio';

const ROUND_TIME_LIMIT = 1200; // 20 minutes in seconds

export default function App() {
  // Navigation & Arena State
  const [phase, setPhase] = useState<GamePhase>('LANDING');
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [sessionSeed, setSessionSeed] = useState<string>(() => `SEED_${Date.now()}_${Math.random()}`);

  // Dynamic Live Questions State (backed by questionStore)
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => questionStore.getAllQuestions());

  // Listen for admin question updates & initialize multi-PC polling
  useEffect(() => {
    questionStore.fetchServerQuestions();
    const stopPolling = participantStore.startPolling(2500);

    const handleQuestionsUpdate = () => {
      setAllQuestions(questionStore.getAllQuestions());
    };
    window.addEventListener('triquetra_questions_updated', handleQuestionsUpdate);

    return () => {
      stopPolling();
      window.removeEventListener('triquetra_questions_updated', handleQuestionsUpdate);
    };
  }, []);

  // Answers State: map question id -> state
  const [answers, setAnswers] = useState<Record<number, QuestionAnswerState>>({});

  // Round Results: map round (1..3) -> result
  const [roundResults, setRoundResults] = useState<Record<number, RoundResult>>({});

  // Urgency Timer State
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio / Sound FX
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tab-Switch Monitoring
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isTabWarningOpen, setIsTabWarningOpen] = useState(false);

  // Filter and shuffle questions for the active round uniquely for each participant
  const roundQuestions = useMemo(() => {
    const baseQuestions = allQuestions.filter((q) => q.round === currentRound);
    const seed = participant?.registerNumber
      ? `${participant.registerNumber}_ROUND_${currentRound}`
      : `${sessionSeed}_ROUND_${currentRound}`;
    return shuffleArray(baseQuestions, seed);
  }, [allQuestions, currentRound, participant?.registerNumber, sessionSeed]);

  // Toggle Sound FX
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.setEnabled(nextState);
    if (nextState) {
      soundManager.playBeep(520, 'sine', 0.05);
    }
  };

  // Synchronize participant record into centralized leaderboard
  const syncParticipantRecord = useCallback((
    roundNumber: 1 | 2 | 3,
    scoreThisRound: number,
    timeUsedSec: number,
    violations: number
  ) => {
    if (!participant) return;

    try {
      const list = participantStore.getCachedParticipants();
      let existing = list.find((p) => p.registerNumber.toUpperCase() === participant.registerNumber.toUpperCase());

      const record: Partial<ParticipantRecord> & { registerNumber: string } = {
        name: participant.name,
        registerNumber: participant.registerNumber.toUpperCase(),
        year: participant.year,
        department: participant.department,
        teamName: participant.teamName || (participant.partnerName ? `TEAM_${participant.department}` : undefined),
        partnerName: participant.partnerName,
        partnerRegisterNumber: participant.partnerRegisterNumber,
        tabViolations: (existing?.tabViolations || 0) + violations
      };

      if (roundNumber === 1) {
        record.round1Score = scoreThisRound;
        record.totalScore = scoreThisRound;
        record.timeUsedSeconds = timeUsedSec;
        record.finishingStatus = `Finished Round 1 (${Math.floor(timeUsedSec / 60)}m ${timeUsedSec % 60}s)`;
        record.status = 'In Progress';
      } else if (roundNumber === 2) {
        record.round2Score = scoreThisRound;
        record.totalScore = (existing?.round1Score || 0) + scoreThisRound;
        record.timeUsedSeconds = (existing?.timeUsedSeconds || 0) + timeUsedSec;
        record.finishingStatus = `Finished Round 2 (${Math.floor(timeUsedSec / 60)}m ${timeUsedSec % 60}s)`;
        record.status = 'In Progress';
      } else if (roundNumber === 3) {
        record.round3Score = scoreThisRound;
        record.totalScore = (existing?.round1Score || 0) + (existing?.round2Score || 0) + scoreThisRound;
        const totalSec = (existing?.timeUsedSeconds || 0) + timeUsedSec;
        record.timeUsedSeconds = totalSec;
        record.finishingStatus = `Finished (${Math.floor(totalSec / 60)}m ${totalSec % 60}s)`;
        record.status = 'Completed';
      }

      const totalPossible = roundNumber * 15;
      record.accuracy = `${Math.round(((record.totalScore || 0) / totalPossible) * 100)}%`;
      record.timeUsed = `${Math.floor((record.timeUsedSeconds || 0) / 60)}m ${(record.timeUsedSeconds || 0) % 60}s`;

      participantStore.registerOrUpdate(record);
    } catch (e) {
      console.error('Failed to sync participant record', e);
    }
  }, [participant]);

  // Submit Current Round Logic
  const handleSubmitRound = useCallback(() => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentRoundQuestions = allQuestions.filter((q) => q.round === currentRound);
    let calculatedScore = 0;

    // Evaluate all questions for this round
    const updatedAnswers = { ...answers };
    currentRoundQuestions.forEach((q) => {
      const userState = updatedAnswers[q.id];
      const codeToValidate = userState?.code || q.brokenCode;

      const validation = validateAnswer(q, codeToValidate);
      const isCorrect = validation.isCorrect;

      if (isCorrect) {
        calculatedScore++;
      }

      updatedAnswers[q.id] = {
        code: codeToValidate,
        isAnswered: userState?.isAnswered || false,
        isSubmitted: true,
        isCorrect: isCorrect
      };
    });

    setAnswers(updatedAnswers);

    const accuracy = Math.round((calculatedScore / (currentRoundQuestions.length || 1)) * 100);
    const timeUsedSeconds = ROUND_TIME_LIMIT - Math.max(0, timeLeft);
    const config = LEVEL_CONFIGS[currentRound];

    const result: RoundResult = {
      round: currentRound,
      levelName: config.levelName,
      score: calculatedScore,
      totalQuestions: currentRoundQuestions.length,
      accuracy,
      timeRemainingSeconds: Math.max(0, timeLeft),
      timeUsedSeconds,
      tabSwitches,
      completedAt: new Date().toISOString()
    };

    setRoundResults((prev) => ({
      ...prev,
      [currentRound]: result
    }));

    // Update global leaderboard record
    syncParticipantRecord(currentRound, calculatedScore, timeUsedSeconds, tabSwitches);

    soundManager.playSuccess();

    if (currentRound < 3) {
      setPhase('ROUND_RESULTS');
    } else {
      setPhase('FINAL_RESULTS');
    }
  }, [currentRound, allQuestions, answers, timeLeft, tabSwitches, syncParticipantRecord]);

  // Urgency Timer Countdown during COMPETITION phase
  useEffect(() => {
    if (phase === 'COMPETITION') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            soundManager.playWarning();
            handleSubmitRound();
            return 0;
          }

          // Warning chimes at milestones
          if (prev === 301) {
            soundManager.playWarning();
          } else if (prev === 61) {
            soundManager.playWarning();
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, handleSubmitRound]);

  // Security Tab-Switch Monitoring
  useEffect(() => {
    if (phase !== 'COMPETITION') return;

    let wakeLockSentinel: any = null;
    if ('wakeLock' in navigator) {
      try {
        (navigator as any).wakeLock.request('screen').then((lock: any) => {
          wakeLockSentinel = lock;
        }).catch(() => {});
      } catch (err) {}
    }

    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'COMPETITION') {
        setTabSwitches((prev) => {
          const newCount = prev + 1;
          soundManager.playWarning();

          if (newCount >= 3) {
            setTimeout(() => {
              handleSubmitRound();
            }, 100);
          } else {
            setIsTabWarningOpen(true);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel && wakeLockSentinel.release) {
        try {
          wakeLockSentinel.release();
        } catch (e) {}
      }
    };
  }, [phase, handleSubmitRound]);

  // Handler: Start from Registration Modal
  const handleStartWithRegistration = (info: ParticipantInfo) => {
    setParticipant(info);
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setTabSwitches(0);
    setPhase('BRIEFING');

    // Register into centralized storage immediately
    try {
      participantStore.registerOrUpdate({
        id: `P-${Date.now()}`,
        name: info.name,
        registerNumber: info.registerNumber.toUpperCase(),
        year: info.year,
        department: info.department,
        teamName: info.teamName || (info.partnerName ? `TEAM_${info.department}` : undefined),
        partnerName: info.partnerName,
        partnerRegisterNumber: info.partnerRegisterNumber,
        round1Score: 0,
        round2Score: 0,
        round3Score: 0,
        totalScore: 0,
        status: 'Active',
        finishingStatus: 'In Progress',
        registeredAt: new Date().toISOString()
      });
    } catch (e) {}
  };

  // Handler: Direct Start / Default Demo Participant
  const handleDirectStart = () => {
    const demoInfo: ParticipantInfo = {
      name: 'Alex Vance',
      registerNumber: '21IT1042',
      year: 'III',
      department: 'IT',
      teamName: 'CYBER_WARRIORS'
    };
    handleStartWithRegistration(demoInfo);
  };

  // Handler: Begin Level from Briefing
  const handleBeginMission = () => {
    setTimeLeft(ROUND_TIME_LIMIT);
    setCurrentQuestionIndex(0);
    setPhase('COMPETITION');
  };

  // Handler: Update code in editor
  const handleUpdateAnswer = (questionId: number, code: string, isAnswered: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        code,
        isAnswered
      }
    }));
  };

  // Handler: Continue to next round from RoundResults
  const handleContinueNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound((prev) => (prev + 1) as 1 | 2 | 3);
      setCurrentQuestionIndex(0);
      setTimeLeft(ROUND_TIME_LIMIT);
      setTabSwitches(0);
      setIsTabWarningOpen(false);
      setPhase('BRIEFING');
    } else {
      setPhase('FINAL_RESULTS');
    }
  };

  // Handler: Restart entire arena
  const handleRestartExpedition = () => {
    setAnswers({});
    setRoundResults({});
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setTimeLeft(ROUND_TIME_LIMIT);
    setTabSwitches(0);
    setIsTabWarningOpen(false);
    setPhase('LANDING');
  };

  return (
    <div className="relative min-h-screen bg-[#030713] text-white font-sans antialiased overflow-x-hidden selection:bg-[#00f0ff]/30 selection:text-[#c7f9ff]">
      {/* Background for game phases */}
      {phase !== 'LANDING' && <CyberBackground />}

      {/* Top App Bar with Real-time Countdown Timer */}
      {phase !== 'LANDING' && (
        <TopAppBar
          round={currentRound}
          timeLeft={timeLeft}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          tabSwitches={tabSwitches}
          participant={participant}
        />
      )}

      {/* Tab Switch Security Warning Modal */}
      <TabSwitchMonitor
        switchCount={tabSwitches}
        isOpen={isTabWarningOpen}
        onDismiss={() => setIsTabWarningOpen(false)}
        onAutoSubmitRound={() => {
          setIsTabWarningOpen(false);
          handleSubmitRound();
        }}
      />

      {/* Screen Routing */}
      {phase === 'LANDING' && (
        <LandingPage
          onStartRegistration={handleStartWithRegistration}
          onDirectStart={handleDirectStart}
        />
      )}

      {phase === 'BRIEFING' && (
        <MissionBriefing
          round={currentRound}
          participant={participant}
          onBeginMission={handleBeginMission}
        />
      )}

      {phase === 'COMPETITION' && (
        <CompetitionPage
          round={currentRound}
          questions={roundQuestions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          remainingTime={timeLeft}
          participant={participant}
          onSelectQuestion={setCurrentQuestionIndex}
          onUpdateAnswer={handleUpdateAnswer}
          onSubmitRound={handleSubmitRound}
        />
      )}

      {phase === 'ROUND_RESULTS' && (
        <RoundResults
          round={currentRound}
          result={
            roundResults[currentRound] || {
              round: currentRound,
              levelName: LEVEL_CONFIGS[currentRound].levelName,
              score: 0,
              totalQuestions: 15,
              accuracy: 0,
              timeRemainingSeconds: 0,
              timeUsedSeconds: 1200,
              tabSwitches: 0,
              completedAt: new Date().toISOString()
            }
          }
          questions={roundQuestions}
          answers={answers}
          participant={participant}
          onContinue={handleContinueNextRound}
          onViewFinalTelemetry={() => setPhase('FINAL_RESULTS')}
        />
      )}

      {phase === 'FINAL_RESULTS' && (
        <FinalResults
          roundResults={roundResults}
          participant={participant}
          answers={answers}
          questions={allQuestions}
          onRestart={handleRestartExpedition}
        />
      )}
    </div>
  );
}
