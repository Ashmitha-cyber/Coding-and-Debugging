import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert, XCircle, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TabSwitchMonitorProps {
  switchCount: number;
  isOpen: boolean;
  onDismiss: () => void;
  onAutoSubmitRound: () => void;
}

export const TabSwitchMonitor: React.FC<TabSwitchMonitorProps> = ({
  switchCount,
  isOpen,
  onDismiss,
  onAutoSubmitRound
}) => {
  if (!isOpen && switchCount < 3) return null;

  const isDisqualified = switchCount >= 3;
  const isSecondStrike = switchCount === 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-2xl border p-6 text-white shadow-2xl flex flex-col items-center text-center ${
        isDisqualified
          ? 'bg-[#1a0508] border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]'
          : isSecondStrike
          ? 'bg-[#1f1003] border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]'
          : 'bg-[#151206] border-yellow-500 shadow-[0_0_35px_rgba(234,179,8,0.3)]'
      }`}>
        
        {/* Warning Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
          isDisqualified
            ? 'bg-red-500/20 border-red-500 text-red-400 animate-bounce'
            : isSecondStrike
            ? 'bg-orange-500/20 border-orange-500 text-orange-400 animate-pulse'
            : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
        }`}>
          {isDisqualified ? (
            <XCircle className="w-9 h-9" />
          ) : isSecondStrike ? (
            <AlertOctagon className="w-9 h-9" />
          ) : (
            <AlertTriangle className="w-9 h-9" />
          )}
        </div>

        {/* Header Tag */}
        <div className={`text-[10px] font-mono tracking-widest uppercase mb-1 font-bold ${
          isDisqualified ? 'text-red-400' : isSecondStrike ? 'text-orange-400' : 'text-yellow-400'
        }`}>
          {isDisqualified
            ? '⚠️ VIOLATION LIMIT EXCEEDED'
            : isSecondStrike
            ? '🚨 CRITICAL ANTI-CHEAT STRIKE'
            : '⚠️ FOCUS TELEMETRY WARNING'}
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold tracking-wide mb-2">
          {isDisqualified
            ? 'ROUND AUTOMATICALLY TERMINATED'
            : isSecondStrike
            ? 'FINAL WARNING: TAB SWITCH DETECTED'
            : 'TAB SWITCH DETECTED'}
        </h2>

        {/* Description */}
        <p className="text-xs text-gray-300 leading-relaxed max-w-md mb-3">
          {isDisqualified ? (
            <span>
              You have switched browser tabs <strong className="text-red-400">3 times</strong>. Per Triquetra'26 anti-cheat regulations, your current round is being automatically locked and submitted for evaluation.
            </span>
          ) : isSecondStrike ? (
            <span>
              You have switched browser tabs <strong className="text-orange-400">2 times</strong>. <strong>ONE MORE VIOLATION</strong> will immediately terminate and submit your entire round. Please remain strictly on this screen.
            </span>
          ) : (
            <span>
              You navigated away to another browser tab. Tab switching is strictly monitored. You have <strong className="text-yellow-400">1 / 3 strikes</strong> recorded.
            </span>
          )}
        </p>

        {/* Screen-off Exemption Note */}
        <div className="text-[10px] font-mono text-gray-400 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 mb-5 max-w-md">
          🛡️ <span className="text-emerald-400">Policy Note:</span> Screen turn-off and display sleep are exempted and not considered as violations.
        </div>

        {/* Infraction Stepper */}
        <div className="flex items-center gap-2 mb-6 font-mono text-xs">
          <span className="text-gray-400">Infractions:</span>
          <div className="flex gap-1.5">
            <span className={`px-2.5 py-1 rounded font-bold ${switchCount >= 1 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
              Strike 1
            </span>
            <span className={`px-2.5 py-1 rounded font-bold ${switchCount >= 2 ? 'bg-orange-500 text-black' : 'bg-white/10 text-gray-400'}`}>
              Strike 2
            </span>
            <span className={`px-2.5 py-1 rounded font-bold ${switchCount >= 3 ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'}`}>
              Strike 3 (Auto-Submit)
            </span>
          </div>
        </div>

        {/* Action Button */}
        {isDisqualified ? (
          <button
            onClick={onAutoSubmitRound}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
          >
            <span>PROCEED TO ROUND EVALUATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              soundManager.playBeep(600, 'sine', 0.05);
              onDismiss();
            }}
            className={`w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              isSecondStrike
                ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]'
            }`}
          >
            I UNDERSTAND — RETURN TO ARENA
          </button>
        )}
      </div>
    </div>
  );
};
