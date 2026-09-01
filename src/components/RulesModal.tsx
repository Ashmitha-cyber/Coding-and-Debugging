import React from 'react';
import { X, ShieldAlert, CheckCircle2, Clock, Terminal, AlertOctagon, HelpCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#081026] border border-[#00f0ff]/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-[#0d1f42] via-[#112854] to-[#0d1f42] px-6 py-4 border-b border-[#00f0ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
                TRIQUETRA'26 // OFFICIAL CODEX
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                ARENA RULES & DIRECTIVES
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          
          {/* 3 Progressive Levels Rule */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" /> 01. THREE PROGRESSIVE LEVELS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30">
                <div className="text-[#00f0ff] font-bold">LEVEL 01: BUG SCAN</div>
                <div className="text-gray-400 text-[11px] mt-1">15 Questions · Syntax & Fundamentals · 20 Mins</div>
              </div>
              <div className="p-3 rounded-lg bg-[#ff9e00]/10 border border-[#ff9e00]/30">
                <div className="text-[#ff9e00] font-bold">LEVEL 02: CODE REPAIR</div>
                <div className="text-gray-400 text-[11px] mt-1">15 Questions · Logic & Reconstruction · 20 Mins</div>
              </div>
              <div className="p-3 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30">
                <div className="text-[#c084fc] font-bold">LEVEL 03: BOSS ARENA</div>
                <div className="text-gray-400 text-[11px] mt-1">15 Questions · Master Edge Cases · 20 Mins</div>
              </div>
            </div>
          </div>

          {/* Strict Tab Switching & Anti-Cheat */}
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
            <h3 className="text-xs font-mono text-red-400 uppercase tracking-wider flex items-center gap-2 font-bold">
              <AlertOctagon className="w-4 h-4 text-red-400" /> 02. STRICT TAB-SWITCHING RESTRICTION
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Active tab presence is monitored in real-time. Switching browser tabs to look up answers or navigate away is recorded as an infraction.
            </p>
            <ul className="text-xs text-gray-300 space-y-1 pl-4 list-disc font-mono">
              <li><strong className="text-yellow-400">Strike 1:</strong> First telemetry tab-switch warning logged.</li>
              <li><strong className="text-orange-400">Strike 2:</strong> Critical anti-cheat warning.</li>
              <li><strong className="text-red-400">Strike 3:</strong> <strong>AUTOMATIC TERMINATION & ROUND SUBMISSION</strong>.</li>
            </ul>
            <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2">
              ✓ <strong>Exemption:</strong> Screen turn-off, display sleep, or system lock are exempted and NOT counted as a violation.
            </div>
          </div>

          {/* No Check Code / Evaluation Mode */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00f0ff]" /> 03. PURE DEBUGGING & SUBMISSION
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              To test true debugging craftsmanship, live code validation hints are disabled during the live round. Fix each broken snippet in the terminal editor, inspect expected output specifications, and click <strong>SUBMIT ROUND</strong> when completed.
            </p>
          </div>

          {/* Scoring & Timers */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00f0ff]" /> 04. TIMING & SCORING METRICS
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Each round provides a strict 20-minute countdown clock. The final ranking is determined by total test cases resolved, accuracy percentage, and lowest elapsed execution time.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050c1f] border-t border-[#00f0ff]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#00f0ff] hover:bg-[#38e1ff] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            I UNDERSTAND THE RULES
          </button>
        </div>
      </div>
    </div>
  );
};
