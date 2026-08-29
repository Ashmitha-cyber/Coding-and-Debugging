import React, { useState, useEffect } from 'react';
import { X, Code, CheckCircle, AlertCircle, Save, HelpCircle, FileText } from 'lucide-react';
import { Question, QuestionLanguage, QuestionDifficulty, QuestionType } from '../types';
import { soundManager } from '../utils/audio';

interface AdminQuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: Question | null;
  onSave: (questionData: Omit<Question, 'id' | 'seqId'> & { id?: number }) => void;
  defaultRound?: 1 | 2 | 3;
}

export const AdminQuestionEditorModal: React.FC<AdminQuestionEditorModalProps> = ({
  isOpen,
  onClose,
  questionToEdit,
  onSave,
  defaultRound = 1
}) => {
  const [round, setRound] = useState<1 | 2 | 3>(defaultRound);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Syntax Error');
  const [type, setType] = useState<QuestionType>('debugging');
  const [language, setLanguage] = useState<QuestionLanguage>('python');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('easy');
  const [description, setDescription] = useState('');
  const [brokenCode, setBrokenCode] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (questionToEdit) {
      setRound(questionToEdit.round);
      setQuestionNumber(questionToEdit.questionNumber);
      setTitle(questionToEdit.title);
      setCategory(questionToEdit.category);
      setType(questionToEdit.type);
      setLanguage(questionToEdit.language);
      setDifficulty(questionToEdit.difficulty);
      setDescription(questionToEdit.description);
      setBrokenCode(questionToEdit.brokenCode);
      setExpectedAnswer(questionToEdit.expectedAnswer);
      setExpectedOutput(questionToEdit.expectedOutput);
      setExplanation(questionToEdit.explanation || '');
      setError('');
    } else {
      setRound(defaultRound);
      setQuestionNumber(1);
      setTitle('');
      setCategory('Syntax Error');
      setType('debugging');
      setLanguage('python');
      setDifficulty('easy');
      setDescription('');
      setBrokenCode('# Enter initial/broken code here\n');
      setExpectedAnswer('# Enter correct solution code here\n');
      setExpectedOutput('');
      setExplanation('');
      setError('');
    }
  }, [questionToEdit, isOpen, defaultRound]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a question title');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a problem description');
      return;
    }
    if (!brokenCode.trim()) {
      setError('Please enter initial/broken code');
      return;
    }
    if (!expectedAnswer.trim()) {
      setError('Please enter expected solution code');
      return;
    }

    onSave({
      id: questionToEdit?.id,
      round,
      questionNumber: Number(questionNumber) || 1,
      title: title.trim(),
      category: category.trim() || 'General Bug',
      type,
      language,
      difficulty,
      description: description.trim(),
      brokenCode: brokenCode.trim(),
      expectedAnswer: expectedAnswer.trim(),
      expectedOutput: expectedOutput.trim() || 'Execution Completed',
      explanation: explanation.trim() || 'Fixed code logic.',
      filename: `system_module_${questionNumber}.${language === 'python' ? 'py' : 'js'}`,
      memoryLimit: '64MB',
      timeLimit: '1000ms'
    });

    soundManager.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#081026] border border-[#00f0ff]/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0e1c3d] border-b border-[#00f0ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/20 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                {questionToEdit ? 'ALTER / EDIT QUESTION' : 'ADD NEW ARENA QUESTION'}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Round {round} · {language.toUpperCase()} · {difficulty.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Grid: Round, Question Number, Language, Difficulty */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Target Round *</label>
              <select
                value={round}
                onChange={(e) => setRound(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
              >
                <option value={1}>Round 1: BUG SCAN</option>
                <option value={2}>Round 2: CODE REPAIR</option>
                <option value={3}>Round 3: BOSS ARENA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Q# Index (1..15)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={questionNumber}
                onChange={(e) => setQuestionNumber(Number(e.target.value))}
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Language *</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as QuestionLanguage)}
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Question Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Array Index Out of Bounds in Navigation"
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Bug Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Syntax Error, Logic Bug"
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Problem Description / Objective *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the broken system symptom and what the participant must debug..."
              className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg p-3 text-white font-sans text-xs focus:border-[#00f0ff] focus:outline-none resize-y"
            />
          </div>

          {/* Code Editors: Broken Code vs Expected Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-red-400 mb-1 flex items-center gap-1 font-bold">
                <FileText className="w-3 h-3" /> Initial / Broken Code *
              </label>
              <textarea
                required
                rows={6}
                value={brokenCode}
                onChange={(e) => setBrokenCode(e.target.value)}
                placeholder="# Initial code presented with bugs..."
                className="w-full bg-[#030816] border border-red-500/30 focus:border-red-400 rounded-lg p-3 text-red-200 font-mono text-xs focus:outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-emerald-400 mb-1 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3 h-3" /> Expected Answer / Solution *
              </label>
              <textarea
                required
                rows={6}
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                placeholder="# Cleaned and correct debugged code..."
                className="w-full bg-[#030816] border border-emerald-500/30 focus:border-emerald-400 rounded-lg p-3 text-emerald-200 font-mono text-xs focus:outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Expected Output & Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Expected Output (Console)</label>
              <input
                type="text"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="e.g. 0 1 2 3 4 or Success"
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-[#00f0ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Explanation / Hint</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="e.g. Fixed array off-by-one indexing error"
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-[#00f0ff] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:opacity-90 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              <Save className="w-3.5 h-3.5" />
              {questionToEdit ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
