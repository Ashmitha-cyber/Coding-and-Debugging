import React from 'react';
import { X, Info, Cpu, Network, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#081026] border border-[#00f0ff]/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0d1f42] via-[#112854] to-[#0d1f42] px-6 py-4 border-b border-[#00f0ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
                NATIONAL TECHNICAL SYMPOSIUM
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                ABOUT TRIQUETRA'26 CODING &amp; DEBUGGING
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          <div className="leading-relaxed">
            <p className="mb-3">
              <strong className="text-white">TRIQUETRA'26: The Bug Arena</strong> is the flagship debugging championship uniting three powerhouse technological domains:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-center">
                <Network className="w-6 h-6 text-[#00f0ff] mx-auto mb-2" />
                <div className="font-bold text-[#00f0ff] text-sm">IT</div>
                <div className="text-xs text-gray-400">Information Technology</div>
              </div>

              <div className="p-4 rounded-xl bg-[#ff9e00]/10 border border-[#ff9e00]/30 text-center">
                <Cpu className="w-6 h-6 text-[#ff9e00] mx-auto mb-2" />
                <div className="font-bold text-[#ff9e00] text-sm">AIDS</div>
                <div className="text-xs text-gray-400">AI & Data Science</div>
              </div>

              <div className="p-4 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 text-center">
                <ShieldCheck className="w-6 h-6 text-[#c084fc] mx-auto mb-2" />
                <div className="font-bold text-[#c084fc] text-sm">CSBS</div>
                <div className="text-xs text-gray-400">CS & Business Systems</div>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Symbolized by the Celtic Triquetra knot—three intertwined loops forming a unified eternal structure—the competition challenges developers to identify syntax faults, unravel logical anomalies, and conquer complex edge-case algorithms in an electrifying cyber-themed arena.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0c1630] border border-[#00f0ff]/20 font-mono text-xs space-y-2">
            <div className="text-[#00f0ff] font-bold uppercase tracking-wider">
              // ARENA SPECIFICATIONS
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Platform Engine:</span>
              <span className="text-white">Triquetra Bug Arena v2.6.0</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Execution Sandbox:</span>
              <span className="text-white">Strict Client-side Evaluator</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Focus Telemetry:</span>
              <span className="text-emerald-400">Active Anti-Cheat Guardian</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050c1f] border-t border-[#00f0ff]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
