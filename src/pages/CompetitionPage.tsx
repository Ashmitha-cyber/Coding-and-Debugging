import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Upload, AlertTriangle, Cpu, Clock, ShieldCheck, FileCode, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Question, QuestionAnswerState, ParticipantInfo } from '../types';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { CodeEditor } from '../components/CodeEditor';
import { SubmitConfirmationModal } from '../components/SubmitConfirmationModal';
import { soundManager } from '../utils/audio';

interface CompetitionPageProps {
  round: 1 | 2 | 3;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, QuestionAnswerState>;
  remainingTime: number;
  participant?: ParticipantInfo | null;
  onSelectQuestion: (index: number) => void;
  onUpdateAnswer: (questionId: number, code: string, isAnswered: boolean) => void;
  onSubmitRound: () => void;
}

export const CompetitionPage: React.FC<CompetitionPageProps> = ({
  round,
  questions,
  currentQuestionIndex,
  answers,
  remainingTime,
  participant,
  onSelectQuestion,
  onUpdateAnswer,
  onSubmitRound
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const questionIdOffset = (round - 1) * 15 + 1;
  const currentAnswerState = answers[currentQuestion.id] || {
    code: currentQuestion.brokenCode,
    isAnswered: false
  };

  const [localCode, setLocalCode] = useState(currentAnswerState.code || currentQuestion.brokenCode);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Sync local code when active question changes
  useEffect(() => {
    const saved = answers[currentQuestion.id];
    setLocalCode(saved?.code !== undefined ? saved.code : currentQuestion.brokenCode);
  }, [currentQuestion.id, answers]);

  // Answered / modified count calculation
  const answeredCount = questions.filter(q => answers[q.id]?.isAnswered).length;

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
    const hasModified = newCode.trim() !== currentQuestion.brokenCode.trim();
    onUpdateAnswer(currentQuestion.id, newCode, hasModified);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      soundManager.playBeep(520, 'sine', 0.04);
      onSelectQuestion(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      soundManager.playBeep(580, 'sine', 0.04);
      onSelectQuestion(currentQuestionIndex + 1);
    }
  };

  return (
    <main className="pt-20 pb-28 px-3 sm:px-6 md:px-8 max-w-[1440px] mx-auto flex flex-col gap-4 text-white">
      
      {/* Top Status Strip */}
      <div className="flex justify-between items-center w-full px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] bg-[#0b1633] border border-[#00f0ff]/30 px-2.5 py-1 text-[#00f0ff] flex items-center gap-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> FOCUS GUARD ACTIVE
          </span>
          {participant?.department && (
            <span className="font-mono text-[11px] bg-[#0b1633] border border-gray-700 px-2.5 py-1 text-gray-300 rounded-lg">
              TRACK: {participant.department}
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-gray-400">
          LEVEL 0{round} // QUESTION {currentQuestionIndex + 1} OF 15
        </div>
      </div>

      {/* Stepper / Question Navigator Matrix */}
      <QuestionNavigator
        totalQuestions={questions.length}
        currentIndex={currentQuestionIndex}
        answers={answers}
        questionIdOffset={questionIdOffset}
        onSelectQuestion={onSelectQuestion}
      />

      {/* Main Workspace Grid (Left 5 Cols: Problem Spec & Broken Snippet, Right 7 Cols: IDE Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[480px]">
        
        {/* Left Column (5 Cols): Problem Specification & Broken Code Display */}
        <motion.section
          key={`problem-${currentQuestion.id}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-5 bg-[#081026]/90 backdrop-blur-xl border border-[#00f0ff]/20 rounded-xl p-5 md:p-6 relative flex flex-col justify-between shadow-xl"
        >
          <div className="space-y-4">
            {/* Header badges */}
            <div className="flex justify-between items-center">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-amber-300 border border-amber-500/40 bg-amber-950/30 px-2.5 py-0.5 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>[{currentQuestion.category.toUpperCase()}]</span>
              </div>
              <span className="font-mono text-[10px] text-gray-400">
                SEQ_ID: {currentQuestion.seqId}
              </span>
            </div>

            {/* Question Title */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                {currentQuestion.questionNumber.toString().padStart(2, '0')}. {currentQuestion.title}
              </h2>
            </div>

            {/* Description & Broken Code Reference */}
            <div className="text-sm text-gray-300 leading-relaxed space-y-3">
              <p>{currentQuestion.description}</p>

              {/* Broken Code Reference */}
              <div>
                <span className="text-[11px] font-mono text-red-400 uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5" /> Broken Code Reference:
                </span>
                <pre className="bg-[#040816] p-3 rounded-lg border-l-2 border-red-500 font-mono text-xs text-red-200/90 whitespace-pre-wrap overflow-x-auto">
                  {currentQuestion.brokenCode}
                </pre>
              </div>

              {/* Expected Output Spec */}
              <div>
                <span className="text-[11px] font-mono text-[#00f0ff] uppercase tracking-wider block mb-1 font-semibold">
                  # Expected Output Target:
                </span>
                <pre className="bg-[#040816] p-3 rounded-lg border-l-2 border-[#00f0ff] font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                  {currentQuestion.expectedOutput}
                </pre>
              </div>

              {currentQuestion.explanation && (
                <div className="text-[11px] text-gray-400 bg-[#050c1f] p-2.5 rounded-lg border border-gray-800">
                  <span className="font-semibold text-[#00f0ff]">Guidance:</span> {currentQuestion.explanation}
                </div>
              )}
            </div>
          </div>

          {/* Limits Specs Footer */}
          <div className="mt-6 border-t border-gray-800 pt-3 flex flex-wrap gap-4 text-gray-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" /> MEM: {currentQuestion.memoryLimit}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00f0ff]" /> TIME: {currentQuestion.timeLimit}
            </span>
          </div>
        </motion.section>

        {/* Right Column (7 Cols): IDE Terminal Editor (NO check code button) */}
        <motion.div
          key={`editor-${currentQuestion.id}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-7 flex flex-col"
        >
          <CodeEditor
            question={currentQuestion}
            code={localCode}
            onChange={handleCodeChange}
          />
        </motion.div>

      </div>

      {/* Bottom Action Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-between items-center h-20 px-4 md:px-12 bg-[#060c1d]/95 backdrop-blur-xl border-t border-[#00f0ff]/20 shadow-[0_-4px_30px_rgba(0,0,0,0.7)]">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#0b1633] disabled:opacity-40 disabled:hover:bg-transparent rounded-xl px-4 py-2.5 transition-all font-mono text-xs cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">PREVIOUS</span>
        </button>

        {/* Center: Submit Round Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:from-[#38e1ff] hover:to-[#1a6bff] text-black rounded-full px-8 sm:px-12 py-3.5 shadow-[0_0_30px_rgba(0,240,255,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 font-mono text-xs font-black tracking-widest uppercase cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[3]" />
            <span>SUBMIT ROUND 0{round}</span>
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-[#0b1633] disabled:opacity-40 disabled:hover:bg-transparent rounded-xl px-4 py-2.5 transition-all font-mono text-xs cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">NEXT</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Submit Round Confirmation Dialog */}
      <SubmitConfirmationModal
        isOpen={isSubmitModalOpen}
        round={round}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        remainingTimeSeconds={remainingTime}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={() => {
          setIsSubmitModalOpen(false);
          onSubmitRound();
        }}
      />
    </main>
  );
};
