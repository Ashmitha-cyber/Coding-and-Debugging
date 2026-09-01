import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  Award,
  Hash,
  Clock,
  ShieldAlert,
  Building,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ParticipantRecord, Department, YearOfStudy } from '../types';
import { soundManager } from '../utils/audio';

interface AdminParticipantEditorModalProps {
  isOpen: boolean;
  participant: ParticipantRecord | null;
  defaultDepartment?: Department;
  onClose: () => void;
  onSave: (record: ParticipantRecord) => void;
}

export const AdminParticipantEditorModal: React.FC<AdminParticipantEditorModalProps> = ({
  isOpen,
  participant,
  defaultDepartment = 'IT',
  onClose,
  onSave
}) => {
  const isNew = !participant;

  const [formData, setFormData] = useState<Partial<ParticipantRecord>>({
    name: '',
    registerNumber: '',
    department: defaultDepartment,
    year: 'III',
    college: 'Knowledge Institute of Technology',
    teamName: '',
    partnerName: '',
    partnerRegisterNumber: '',
    round1Score: 0,
    round2Score: 0,
    round3Score: 0,
    totalScore: 0,
    tabViolations: 0,
    timeUsed: '15m 00s',
    status: 'Completed',
    qualifiedForRound2: false,
    resultStatus: 'Pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (participant) {
      setFormData({
        ...participant,
        round1Score: participant.round1Score ?? 0,
        round2Score: participant.round2Score ?? 0,
        round3Score: participant.round3Score ?? 0,
        totalScore: participant.totalScore ?? ((participant.round1Score ?? 0) + (participant.round2Score ?? 0) + (participant.round3Score ?? 0)),
        tabViolations: participant.tabViolations ?? 0,
        status: participant.status ?? 'Completed',
        qualifiedForRound2: !!participant.qualifiedForRound2,
        resultStatus: participant.resultStatus ?? (participant.qualifiedForRound2 ? 'Qualified' : 'Not Qualified')
      });
    } else {
      setFormData({
        id: `P-${Date.now()}`,
        name: '',
        registerNumber: '',
        department: defaultDepartment,
        year: 'III',
        college: 'Knowledge Institute of Technology',
        teamName: '',
        partnerName: '',
        partnerRegisterNumber: '',
        round1Score: 0,
        round2Score: 0,
        round3Score: 0,
        totalScore: 0,
        tabViolations: 0,
        timeUsed: '15m 00s',
        status: 'Completed',
        qualifiedForRound2: false,
        resultStatus: 'Pending',
        registeredAt: new Date().toISOString()
      });
    }
    setErrors({});
  }, [participant, defaultDepartment, isOpen]);

  if (!isOpen) return null;

  const handleScoreChange = (field: 'round1Score' | 'round2Score' | 'round3Score', val: number) => {
    const clampedVal = Math.max(0, Math.min(15, isNaN(val) ? 0 : val));
    const nextR1 = field === 'round1Score' ? clampedVal : (formData.round1Score ?? 0);
    const nextR2 = field === 'round2Score' ? clampedVal : (formData.round2Score ?? 0);
    const nextR3 = field === 'round3Score' ? clampedVal : (formData.round3Score ?? 0);
    const nextTotal = nextR1 + nextR2 + nextR3;

    setFormData((prev) => ({
      ...prev,
      [field]: clampedVal,
      totalScore: nextTotal,
      accuracy: `${Math.round((nextTotal / 45) * 100)}%`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Lead participant name is required';
    }
    if (!formData.registerNumber?.trim()) {
      newErrors.registerNumber = 'Register number is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      soundManager.playError();
      return;
    }

    const r1 = formData.round1Score ?? 0;
    const r2 = formData.round2Score ?? 0;
    const r3 = formData.round3Score ?? 0;
    const total = r1 + r2 + r3;

    const recordToSave: ParticipantRecord = {
      id: formData.id || `P-${Date.now()}`,
      name: formData.name!.trim(),
      registerNumber: formData.registerNumber!.trim().toUpperCase(),
      department: formData.department as Department,
      year: (formData.year as YearOfStudy) || 'III',
      college: formData.college?.trim() || 'Knowledge Institute of Technology',
      teamName: formData.teamName?.trim() || formData.name!.trim(),
      partnerName: formData.partnerName?.trim() || undefined,
      partnerRegisterNumber: formData.partnerRegisterNumber?.trim().toUpperCase() || undefined,
      round1Score: r1,
      round2Score: r2,
      round3Score: r3,
      totalScore: total,
      accuracy: `${Math.round((total / 45) * 100)}%`,
      timeUsed: formData.timeUsed?.trim() || '15m 00s',
      tabViolations: formData.tabViolations ?? 0,
      status: formData.status as 'Active' | 'In Progress' | 'Completed' | 'Disqualified',
      qualifiedForRound2: !!formData.qualifiedForRound2,
      resultStatus: formData.qualifiedForRound2 ? 'Qualified' : (formData.resultStatus || 'Not Qualified'),
      registeredAt: formData.registeredAt || new Date().toISOString()
    };

    onSave(recordToSave);
    soundManager.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#081026] border border-[#00f0ff]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#050c1f] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
              {isNew ? <Users className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                {isNew ? 'REGISTER NEW PARTICIPANT / TEAM' : 'EDIT PARTICIPANT TELEMETRY & SCORES'}
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                {isNew
                  ? 'Add a new candidate or duo team to the tournament arena'
                  : `Modifying record: ${formData.registerNumber || 'Unknown'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-white font-mono text-xs flex-1">
          {/* Section 1: Identity & Department */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. LEAD PARTICIPANT &amp; TEAM IDENTITY
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Lead Name */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">
                  Lead Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g. Karthik Raja"
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
              </div>

              {/* Lead Register Number */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">
                  Register Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.registerNumber || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, registerNumber: e.target.value.toUpperCase() });
                    if (errors.registerNumber) setErrors({ ...errors, registerNumber: '' });
                  }}
                  placeholder="e.g. 731621205001"
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white uppercase focus:outline-none focus:border-[#00f0ff]"
                />
                {errors.registerNumber && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.registerNumber}</p>
                )}
              </div>

              {/* Team Name */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">
                  Team Name (Optional / Duo)
                </label>
                <input
                  type="text"
                  value={formData.teamName || ''}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="e.g. CYBER_KNIGHTS"
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">
                  Department Track <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.department || 'IT'}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="IT">Department of Information Technology (IT)</option>
                  <option value="AIDS">Artificial Intelligence &amp; Data Science (AI&amp;DS)</option>
                  <option value="CSBS">Computer Science &amp; Business Systems (CSBS)</option>
                </select>
              </div>

              {/* Year of Study */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Year of Study</label>
                <select
                  value={formData.year || 'III'}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value as YearOfStudy })}
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="II">Year II (Sophomore)</option>
                  <option value="III">Year III (Pre-Final)</option>
                  <option value="IV">Year IV (Final Year)</option>
                </select>
              </div>

              {/* College */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Institution / College</label>
                <input
                  type="text"
                  value={formData.college || ''}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="Knowledge Institute of Technology"
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Duo Partner (Optional) */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> 2. DUO PARTNER DETAILS (OPTIONAL)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Partner Full Name</label>
                <input
                  type="text"
                  value={formData.partnerName || ''}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  placeholder="e.g. Vignesh S."
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Partner Register Number</label>
                <input
                  type="text"
                  value={formData.partnerRegisterNumber || ''}
                  onChange={(e) => setFormData({ ...formData, partnerRegisterNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. 731621205045"
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white uppercase focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Performance & Marks */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> 3. ROUND SCORES &amp; TOURNAMENT TELEMETRY
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#050c1f] p-3.5 rounded-xl border border-gray-800">
              {/* Round 1 */}
              <div>
                <label className="block text-[10px] text-[#00f0ff] font-bold mb-1">ROUND 1 (/15)</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={formData.round1Score ?? 0}
                  onChange={(e) => handleScoreChange('round1Score', parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-[#081026] border border-[#00f0ff]/40 rounded text-center text-sm font-bold text-[#00f0ff] focus:outline-none"
                />
              </div>

              {/* Round 2 */}
              <div>
                <label className="block text-[10px] text-[#ff9e00] font-bold mb-1">ROUND 2 (/15)</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={formData.round2Score ?? 0}
                  onChange={(e) => handleScoreChange('round2Score', parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-[#081026] border border-[#ff9e00]/40 rounded text-center text-sm font-bold text-[#ff9e00] focus:outline-none"
                />
              </div>

              {/* Round 3 */}
              <div>
                <label className="block text-[10px] text-[#c084fc] font-bold mb-1">ROUND 3 (/15)</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={formData.round3Score ?? 0}
                  onChange={(e) => handleScoreChange('round3Score', parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-[#081026] border border-[#c084fc]/40 rounded text-center text-sm font-bold text-[#c084fc] focus:outline-none"
                />
              </div>
            </div>

            {/* Total Marks Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <span className="text-xs text-gray-300 font-bold">TOTAL AGGREGATE MARKS:</span>
              <span className="text-lg font-black text-emerald-400">
                {(formData.round1Score ?? 0) + (formData.round2Score ?? 0) + (formData.round3Score ?? 0)} / 45
              </span>
            </div>

            {/* Time Taken & Focus Strikes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00f0ff]" /> Time Elapsed (e.g. 14m 20s)
                </label>
                <input
                  type="text"
                  value={formData.timeUsed || ''}
                  onChange={(e) => setFormData({ ...formData, timeUsed: e.target.value })}
                  placeholder="14m 20s"
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" /> Focus Strikes / Tab Switches
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={formData.tabViolations ?? 0}
                  onChange={(e) => setFormData({ ...formData, tabViolations: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Qualification & Lifecycle Status */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 4. ROUND 2 QUALIFICATION &amp; STATUS
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Qualification Toggle */}
              <div className="p-3 bg-[#050c1f] border border-gray-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Round 2 Qualified</div>
                  <div className="text-[10px] text-gray-400">Shortlist for Code Repair</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.qualifiedForRound2}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData({
                        ...formData,
                        qualifiedForRound2: checked,
                        resultStatus: checked ? 'Qualified' : 'Not Qualified'
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Session Status</label>
                <select
                  value={formData.status || 'Completed'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#050c1f] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Active">Active</option>
                  <option value="Disqualified">Disqualified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] hover:opacity-95 text-black font-extrabold font-mono text-xs uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isNew ? 'SAVE PARTICIPANT' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
