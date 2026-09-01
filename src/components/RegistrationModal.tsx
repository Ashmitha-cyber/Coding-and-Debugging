import React, { useState } from 'react';
import { X, User, GraduationCap, Hash, ArrowRight, Shield, Cpu, Users, Loader2 } from 'lucide-react';
import { Department, ParticipantInfo, YearOfStudy } from '../types';
import { soundManager } from '../utils/audio';
import { participantStore } from '../utils/participantStore';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (info: ParticipantInfo) => void;
  defaultDepartment?: Department;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  defaultDepartment = 'IT'
}) => {
  const [department, setDepartment] = useState<Department>(defaultDepartment);
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [year, setYear] = useState<YearOfStudy>('III');
  const [teamName, setTeamName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerRegisterNumber, setPartnerRegisterNumber] = useState('');
  const [isDuo, setIsDuo] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter participant name');
      return;
    }
    if (!registerNumber.trim()) {
      setError('Please enter register / roll number');
      return;
    }
    if (!year) {
      setError('Please select year of study (II, III, or IV)');
      return;
    }
    if (isDuo && partnerName.trim() && !partnerRegisterNumber.trim()) {
      setError('Please enter the partner register number');
      return;
    }

    soundManager.playLaunch();

    const participantData: ParticipantInfo = {
      name: name.trim(),
      registerNumber: registerNumber.trim().toUpperCase(),
      year,
      department,
      teamName: teamName.trim() || (isDuo ? `TEAM_${department}_${Math.floor(100 + Math.random() * 900)}` : undefined),
      partnerName: isDuo ? partnerName.trim() : undefined,
      partnerRegisterNumber: isDuo && partnerRegisterNumber.trim() ? partnerRegisterNumber.trim().toUpperCase() : undefined
    };

    // Store participant in participantStore (updates local cache + syncs to central server)
    try {
      localStorage.setItem('triquetra_current_participant', JSON.stringify(participantData));
      participantStore.registerOrUpdate({
        ...participantData,
        id: `P-${Date.now()}`,
        registeredAt: new Date().toISOString(),
        round1Score: 0,
        round2Score: 0,
        round3Score: 0,
        totalScore: 0,
        accuracy: '0%',
        timeUsed: '0m 00s',
        tabViolations: 0,
        status: 'Active'
      });
    } catch (e) {
      console.error('Failed to sync participant registration', e);
    }

    onRegister(participantData);
  };

  const fillDemo = (dept: Department) => {
    setDepartment(dept);
    setName('Alex Vance');
    setRegisterNumber(`21${dept}1042`);
    setYear('III');
    setTeamName(`CYBER_${dept}_WARRIORS`);
    setIsDuo(true);
    setPartnerName('Jordan Miller');
    setPartnerRegisterNumber(`21${dept}1043`);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#081026] border border-[#00f0ff]/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-[#0d1f42] via-[#112854] to-[#0d1f42] px-6 py-4 border-b border-[#00f0ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#00f0ff]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] bg-[#09172e] flex-shrink-0">
              <img src="/logo.png" alt="Triquetra'26" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-[#00f0ff] uppercase">
                TRIQUETRA'26 // THE BUG ARENA
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                PARTICIPANT REGISTRATION
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm text-gray-200">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Department Selection Track */}
          <div>
            <label className="block text-xs font-mono text-[#00f0ff] uppercase tracking-wider mb-2">
              Select Department Track
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setDepartment('IT'); soundManager.playBeep(480, 'sine', 0.03); }}
                className={`py-3 px-2 rounded-xl font-bold font-mono text-center transition-all border cursor-pointer ${
                  department === 'IT'
                    ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-[1.02]'
                    : 'bg-[#0b1633] border-[#00f0ff]/20 text-gray-400 hover:border-[#00f0ff]/50'
                }`}
              >
                <div className="text-base tracking-widest">IT</div>
                <div className="text-[9px] font-normal text-gray-400 mt-0.5">Info Tech</div>
              </button>

              <button
                type="button"
                onClick={() => { setDepartment('AIDS'); soundManager.playBeep(520, 'sine', 0.03); }}
                className={`py-3 px-2 rounded-xl font-bold font-mono text-center transition-all border cursor-pointer ${
                  department === 'AIDS'
                    ? 'bg-[#ff9e00]/20 border-[#ff9e00] text-[#ff9e00] shadow-[0_0_20px_rgba(255,158,0,0.3)] scale-[1.02]'
                    : 'bg-[#0b1633] border-[#ff9e00]/20 text-gray-400 hover:border-[#ff9e00]/50'
                }`}
              >
                <div className="text-base tracking-widest">AIDS</div>
                <div className="text-[9px] font-normal text-gray-400 mt-0.5">AI & Data Sci</div>
              </button>

              <button
                type="button"
                onClick={() => { setDepartment('CSBS'); soundManager.playBeep(580, 'sine', 0.03); }}
                className={`py-3 px-2 rounded-xl font-bold font-mono text-center transition-all border cursor-pointer ${
                  department === 'CSBS'
                    ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#c084fc] shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]'
                    : 'bg-[#0b1633] border-[#a855f7]/20 text-gray-400 hover:border-[#a855f7]/50'
                }`}
              >
                <div className="text-base tracking-widest">CSBS</div>
                <div className="text-[9px] font-normal text-gray-400 mt-0.5">CS & Business</div>
              </button>
            </div>
          </div>

          {/* Participant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00f0ff]" /> Participant Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 focus:border-[#00f0ff] rounded-lg px-3.5 py-2.5 text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#00f0ff] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#00f0ff]" /> Register / Roll Number *
              </label>
              <input
                type="text"
                required
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="e.g. 21IT1042"
                className="w-full bg-[#050c1f] border border-[#00f0ff]/30 focus:border-[#00f0ff] rounded-lg px-3.5 py-2.5 text-white font-mono text-sm uppercase focus:outline-none focus:ring-1 focus:ring-[#00f0ff] transition-colors"
              />
            </div>
          </div>

          {/* Year of Study Selection (Roman Numerals: II, III, IV) */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#00f0ff]" /> Year of Study *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['II', 'III', 'IV'] as YearOfStudy[]).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYear(y);
                    soundManager.playBeep(500 + (y === 'II' ? 0 : y === 'III' ? 50 : 100), 'sine', 0.03);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold font-mono text-center transition-all border cursor-pointer ${
                    year === y
                      ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)] scale-[1.02]'
                      : 'bg-[#050c1f] border-[#00f0ff]/20 text-gray-400 hover:border-[#00f0ff]/40 hover:text-gray-200'
                  }`}
                >
                  <div className="text-lg tracking-wider font-extrabold">{y}</div>
                  <div className="text-[10px] font-normal text-gray-400">
                    {y === 'II' ? '2nd Year' : y === 'III' ? '3rd Year' : '4th Year'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Team / Partner Option */}
          <div className="pt-2 border-t border-[#00f0ff]/15">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00f0ff]" /> Team Participation (Partner Details)
              </span>
              <button
                type="button"
                onClick={() => setIsDuo(!isDuo)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  isDuo ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {isDuo ? '✓ Partner Added' : '+ Add Partner'}
              </button>
            </div>

            {isDuo && (
              <div className="space-y-4 p-3.5 bg-[#050c1f]/80 rounded-xl border border-[#00f0ff]/20 animate-in fade-in">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Team Handle / Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. ZERO_DAY_HUNTERS"
                    className="w-full bg-[#030814] border border-[#00f0ff]/30 rounded-lg px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#00f0ff]" /> Partner Name *
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full bg-[#030814] border border-[#00f0ff]/30 rounded-lg px-3.5 py-2 text-white font-sans text-sm focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#00f0ff]" /> Partner Register Number *
                    </label>
                    <input
                      type="text"
                      value={partnerRegisterNumber}
                      onChange={(e) => setPartnerRegisterNumber(e.target.value)}
                      placeholder="e.g. 21IT1043"
                      className="w-full bg-[#030814] border border-[#00f0ff]/30 rounded-lg px-3.5 py-2 text-white font-mono text-sm uppercase focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-gray-400">
            <span>Quick fill credentials:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('IT')}
                className="text-[#00f0ff] hover:underline cursor-pointer"
              >
                [Demo IT]
              </button>
              <button
                type="button"
                onClick={() => fillDemo('AIDS')}
                className="text-[#ff9e00] hover:underline cursor-pointer"
              >
                [Demo AIDS]
              </button>
              <button
                type="button"
                onClick={() => fillDemo('CSBS')}
                className="text-[#c084fc] hover:underline cursor-pointer"
              >
                [Demo CSBS]
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#00f0ff]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 text-gray-300 font-mono text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0055ff] hover:from-[#38e1ff] hover:to-[#1a6bff] text-black font-bold font-mono text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer active:scale-95 transition-all"
            >
              <span>ENTER THE ARENA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
