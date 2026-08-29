import React from 'react';
import { Check } from 'lucide-react';
import { QuestionAnswerState } from '../types';
import { soundManager } from '../utils/audio';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, QuestionAnswerState>;
  questionIdOffset: number;
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIdOffset,
  onSelectQuestion
}) => {
  return (
    <section className="bg-[#081026]/90 border border-[#00f0ff]/20 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-lg select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest font-bold">
            QUESTION MATRIX
          </span>
          <span className="text-xs font-mono text-gray-400">
            ({(Object.values(answers) as QuestionAnswerState[]).filter(a => a?.isAnswered).length} / {totalQuestions} modified)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            <span className="text-gray-300">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#10b981]/40 border border-[#10b981]" />
            <span className="text-gray-300">Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#0b1633] border border-gray-700" />
            <span className="text-gray-400">Unanswered</span>
          </div>
        </div>
      </div>

      {/* Grid of 15 Questions */}
      <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5 sm:gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const qId = questionIdOffset + index;
          const answerState = answers[qId];
          const isAnswered = answerState?.isAnswered;
          const isCurrent = currentIndex === index;

          let btnClass = 'bg-[#0b1633] border border-gray-800 text-gray-400 hover:border-[#00f0ff]/50 hover:text-white';

          if (isCurrent) {
            btnClass = 'bg-[#00f0ff] border-[#00f0ff] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.6)] scale-105';
          } else if (isAnswered) {
            btnClass = 'bg-[#064e3b]/50 border-[#10b981]/60 text-emerald-300 font-semibold hover:border-emerald-400';
          }

          return (
            <button
              key={index}
              onClick={() => {
                soundManager.playBeep(480 + index * 15, 'sine', 0.03);
                onSelectQuestion(index);
              }}
              className={`h-9 sm:h-10 rounded-lg flex items-center justify-center font-mono text-xs transition-all relative cursor-pointer ${btnClass}`}
            >
              <span>{(index + 1).toString().padStart(2, '0')}</span>
              {isAnswered && !isCurrent && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
