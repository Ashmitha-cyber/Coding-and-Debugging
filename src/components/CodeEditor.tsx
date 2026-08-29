import React, { useRef, useState } from 'react';
import { RotateCcw, Copy, Check, Terminal, Code2 } from 'lucide-react';
import { Question } from '../types';
import { soundManager } from '../utils/audio';

interface CodeEditorProps {
  question: Question;
  code: string;
  onChange: (newCode: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  question,
  code,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 6);

  // Handle Tab key inside editor for standard 4-space indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newValue);

      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    soundManager.playBeep(600, 'sine', 0.05);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onChange(question.brokenCode);
    soundManager.playBeep(350, 'sawtooth', 0.08);
  };

  return (
    <section className="bg-[#050c1f] border border-[#00f0ff]/20 rounded-xl overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative h-full min-h-[460px]">
      {/* Terminal Title Bar */}
      <div className="bg-[#07132a] border-b border-[#00f0ff]/15 px-4 py-2.5 flex justify-between items-center select-none">
        {/* Terminal buttons & filename */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="ml-3 font-mono text-[11px] text-[#00f0ff] truncate max-w-[200px] sm:max-w-none flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#00f0ff]" /> {question.filename}
          </span>
        </div>

        {/* Action icons (Reset & Copy) - Notice NO "Check Code" / "Run Test" button per user instructions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-[#00f0ff] px-2 py-1 rounded transition-colors text-xs flex items-center gap-1 font-mono hover:bg-white/5 cursor-pointer"
            title="Copy Code to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-red-400 px-2 py-1 rounded transition-colors text-xs flex items-center gap-1 font-mono hover:bg-white/5 cursor-pointer"
            title="Reset to Original Broken Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Main Text Area with Line Numbers */}
      <div className="flex-1 flex overflow-auto p-4 font-mono text-sm leading-relaxed relative min-h-[280px] bg-[#040816]">
        {/* Line Numbers Column */}
        <div className="text-gray-600 pr-3.5 select-none text-right flex flex-col font-mono text-xs pt-0.5 border-r border-[#00f0ff]/10 mr-3.5 min-w-[28px]">
          {Array.from({ length: lineCount }).map((_, i) => (
            <span key={i} className="leading-6">
              {i + 1}
            </span>
          ))}
        </div>

        {/* Textarea for actual code writing */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className="flex-1 bg-transparent border-none outline-none resize-none text-[#c7f9ff] font-mono text-xs sm:text-sm leading-6 focus:ring-0 p-0 placeholder-gray-600 selection:bg-[#00f0ff]/30"
          placeholder="# Fix the broken program here..."
        />
      </div>

      {/* Editor Footer / Info Note */}
      <div className="bg-[#07132a] border-t border-[#00f0ff]/15 px-4 py-2 flex justify-between items-center font-mono text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          <span>Editor Active · Tab indentation enabled (4 spaces)</span>
        </div>
        <div className="text-gray-500">
          Evaluated upon round submission
        </div>
      </div>
    </section>
  );
};
