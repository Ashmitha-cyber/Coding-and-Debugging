import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Upload, X } from 'lucide-react';
import { LEVEL_CONFIGS } from '../data/questions';

interface SubmitConfirmationModalProps {
  isOpen: boolean;
  round: 1 | 2 | 3;
  answeredCount: number;
  totalQuestions: number;
  remainingTimeSeconds: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  isOpen,
  round,
  answeredCount,
  totalQuestions,
  remainingTimeSeconds,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  const currentConfig = LEVEL_CONFIGS[round];
  const unansweredCount = totalQuestions - answeredCount;
  const minutes = Math.floor(Math.max(0, remainingTimeSeconds) / 60);
  const seconds = Math.max(0, remainingTimeSeconds) % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#081026] border border-[#00f0ff]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] text-white flex flex-col">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/50 flex items-center justify-center text-[#00f0ff]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
              LEVEL 0{round} // {currentConfig.levelName}
            </div>
            <h3 className="text-lg font-bold">SUBMIT ROUND ANSWERS?</h3>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-[#050c1f] rounded-xl border border-[#00f0ff]/20 p-4 space-y-3 font-mono text-xs mb-5">
          <div className="flex justify-between items-center text-gray-300">
            <span>Answered / Modified:</span>
            <span className="font-bold text-emerald-400">{answeredCount} / {totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>Unmodified Questions:</span>
            <span className={unansweredCount > 0 ? 'font-bold text-amber-400' : 'text-gray-500'}>
              {unansweredCount}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-300 pt-2 border-t border-gray-800">
            <span>Remaining Time:</span>
            <span className="font-bold text-[#00f0ff]">{formattedTime}</span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg text-amber-200 text-xs font-mono mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              You still have {unansweredCount} unmodified questions. You can keep working or submit now to lock your answers.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-gray-300 font-mono text-xs cursor-pointer transition-colors"
          >
            KEEP WORKING
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:opacity-90 text-black font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer transition-all active:scale-95"
          >
            CONFIRM & SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};
