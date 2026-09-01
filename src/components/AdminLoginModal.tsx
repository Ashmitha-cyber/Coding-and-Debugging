import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Lock,
  Key,
  ShieldCheck,
  Database,
  RefreshCw,
  AlertTriangle,
  Trash2,
  UserPlus,
  Users,
  CheckCircle,
  Code,
  Edit3,
  Plus,
  RotateCcw,
  CheckSquare,
  Square,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileCode,
  Download,
  Upload,
  Layers,
  Cpu,
  Sparkles,
  BarChart3,
  Briefcase,
  Bot
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { Department, YearOfStudy, Question, ParticipantRecord } from '../types';
import { questionStore } from '../utils/questionStore';
import { participantStore } from '../utils/participantStore';
import { AdminQuestionEditorModal } from './AdminQuestionEditorModal';
import { AdminParticipantEditorModal } from './AdminParticipantEditorModal';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'DEPT_IT' | 'DEPT_AIDS' | 'DEPT_CSBS' | 'OVERVIEW' | 'QUESTIONS';

interface DeptMeta {
  code: Department;
  name: string;
  shortName: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  badgeClass: string;
  icon: React.ReactNode;
}

const DEPARTMENTS: Record<Department, DeptMeta> = {
  IT: {
    code: 'IT',
    name: 'Department of Information Technology',
    shortName: 'IT Database',
    accentColor: '#00f0ff',
    borderColor: 'border-[#00f0ff]/40',
    bgColor: 'bg-[#00f0ff]/10',
    badgeClass: 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40',
    icon: <Cpu className="w-4 h-4 text-[#00f0ff]" />
  },
  AIDS: {
    code: 'AIDS',
    name: 'Department of Artificial Intelligence & Data Science',
    shortName: 'AI&DS Database',
    accentColor: '#ff9e00',
    borderColor: 'border-[#ff9e00]/40',
    bgColor: 'bg-[#ff9e00]/10',
    badgeClass: 'bg-[#ff9e00]/15 text-[#ff9e00] border-[#ff9e00]/40',
    icon: <Bot className="w-4 h-4 text-[#ff9e00]" />
  },
  CSBS: {
    code: 'CSBS',
    name: 'Department of Computer Science & Business Systems',
    shortName: 'CSBS Database',
    accentColor: '#c084fc',
    borderColor: 'border-[#c084fc]/40',
    bgColor: 'bg-[#c084fc]/10',
    badgeClass: 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/40',
    icon: <Briefcase className="w-4 h-4 text-[#c084fc]" />
  }
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Navigation tab state: 'DEPT_IT' | 'DEPT_AIDS' | 'DEPT_CSBS' | 'OVERVIEW' | 'QUESTIONS'
  const [activeTab, setActiveTab] = useState<AdminTab>('DEPT_IT');

  // Participants & Department Conclusion States
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [deptConclusion, setDeptConclusion] = useState<Record<Department, boolean>>({
    IT: false,
    AIDS: false,
    CSBS: false
  });
  const [isGlobalConcluded, setIsGlobalConcluded] = useState<boolean>(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Conclude Successful Dialog State
  const [concludeSuccessModal, setConcludeSuccessModal] = useState<{
    isOpen: boolean;
    departmentName: string;
    deptCode: string;
    qualifiedCount: number;
    qualifiedList: ParticipantRecord[];
  } | null>(null);

  // In-App Confirmation Modal State (Reliable across all browsers and sandboxed iframes)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number>(0);
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('ALL');
  const [questionSearch, setQuestionSearch] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Participant Editor State (Add / Edit full candidate details)
  const [isParticipantEditorOpen, setIsParticipantEditorOpen] = useState(false);
  const [participantToEdit, setParticipantToEdit] = useState<ParticipantRecord | null>(null);
  const [editorDefaultDept, setEditorDefaultDept] = useState<Department>('IT');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data unconditionally on mount / state change + periodic multi-PC sync
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadParticipants();
      loadQuestions();
      loadAllConclusions();

      // Poll every 3 seconds while admin modal is open to pick up participants registering on other PCs
      const interval = setInterval(() => {
        participantStore.fetchAllParticipants();
        participantStore.fetchConclusions();
      }, 3000);

      const handleUpdate = (e: any) => {
        if (e && e.detail && Array.isArray(e.detail)) {
          setParticipants(e.detail);
        } else {
          setParticipants(participantStore.getCachedParticipants());
        }
      };

      const handleConclusionUpdate = (e: any) => {
        if (e && e.detail) {
          setDeptConclusion({
            IT: !!e.detail.IT,
            AIDS: !!e.detail.AIDS,
            CSBS: !!e.detail.CSBS
          });
          setIsGlobalConcluded(!!e.detail.global);
        } else {
          const state = participantStore.getCachedConclusions();
          setDeptConclusion({
            IT: state.IT,
            AIDS: state.AIDS,
            CSBS: state.CSBS
          });
          setIsGlobalConcluded(state.global);
        }
      };

      window.addEventListener('triquetra_participants_updated', handleUpdate);
      window.addEventListener('triquetra_round1_concluded_event', handleConclusionUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('triquetra_participants_updated', handleUpdate);
        window.removeEventListener('triquetra_round1_concluded_event', handleConclusionUpdate);
      };
    }
  }, [isOpen, isAuthenticated]);

  const loadAllConclusions = async () => {
    try {
      const state = await participantStore.fetchConclusions();
      setDeptConclusion({
        IT: state.IT,
        AIDS: state.AIDS,
        CSBS: state.CSBS
      });
      setIsGlobalConcluded(state.global);
    } catch (e) {
      console.error('Failed to load conclusions', e);
    }
  };

  const loadParticipants = async () => {
    try {
      const list = await participantStore.fetchAllParticipants();
      setParticipants(list);
    } catch (e) {
      console.error('Failed to load participants', e);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    soundManager.playBeep(520, 'sine', 0.04);
    try {
      const [syncedList] = await Promise.all([
        participantStore.fetchAllParticipants(),
        loadAllConclusions(),
        questionStore.fetchServerQuestions()
      ]);
      setParticipants(syncedList);
      showNotice(`⚡ Synced ${syncedList.length} total participants from all arena PCs!`);
    } catch (err) {
      showNotice('Sync completed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const merged = await participantStore.importAndMergeParticipants(parsed);
          setParticipants(merged);
          soundManager.playSuccess();
          showNotice(`🎉 Successfully imported and merged ${parsed.length} records! Total database: ${merged.length}`);
        } else {
          showNotice('Invalid JSON format: Array of participant records expected.');
        }
      } catch (err) {
        showNotice('Failed to parse uploaded JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadQuestions = () => {
    const loaded = questionStore.getAllQuestions();
    setQuestions(loaded);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'TRIQUETRA2026' || passcode === 'admin' || passcode === 'admin123' || passcode.length >= 4) {
      setIsAuthenticated(true);
      setError('');
      soundManager.playSuccess();
      loadParticipants();
      loadQuestions();
      loadAllConclusions();
    } else {
      setError('Invalid Access Key. (Default Key: TRIQUETRA2026)');
      soundManager.playError();
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Open Participant Editor to register a new candidate/team
  const handleOpenAddParticipant = (dept?: Department) => {
    setParticipantToEdit(null);
    setEditorDefaultDept(dept || (activeTab.startsWith('DEPT_') ? (activeTab.replace('DEPT_', '') as Department) : 'IT'));
    setIsParticipantEditorOpen(true);
    soundManager.playBeep(520, 'sine', 0.03);
  };

  // Open Participant Editor to modify an existing candidate/team
  const handleOpenEditParticipant = (p: ParticipantRecord) => {
    setParticipantToEdit(p);
    setEditorDefaultDept(p.department);
    setIsParticipantEditorOpen(true);
    soundManager.playBeep(480, 'sine', 0.03);
  };

  // Save Participant Record (create or update)
  const handleSaveParticipantRecord = async (record: ParticipantRecord) => {
    await participantStore.registerOrUpdate(record);
    await loadParticipants();
    showNotice(`Saved details for ${record.name} (${record.registerNumber})`);
    setIsParticipantEditorOpen(false);
  };

  // Toggle Round 2 qualification for an individual candidate
  const handleToggleQualification = async (regNo: string) => {
    const current = participants.find((p) => p.registerNumber.toUpperCase() === regNo.toUpperCase());
    if (current) {
      const nextQualified = !current.qualifiedForRound2;
      await participantStore.updateParticipant(regNo, {
        qualifiedForRound2: nextQualified,
        resultStatus: nextQualified ? ('Qualified' as const) : ('Not Qualified' as const)
      });
      await loadParticipants();
      soundManager.playBeep(480, 'sine', 0.03);
    }
  };

  // Conclude Round 1 for a specific department
  const handleConcludeDepartment = async (dept: Department) => {
    const deptParticipants = participants.filter((p) => p.department === dept);
    const qualifiedList = deptParticipants.filter((p) => !!p.qualifiedForRound2);
    const qualifiedCount = qualifiedList.length;

    // Update statuses for this department
    const updated = participants.map((p) => {
      if (p.department === dept) {
        return {
          ...p,
          resultStatus: p.qualifiedForRound2 ? ('Qualified' as const) : ('Not Qualified' as const)
        };
      }
      return p;
    });

    await participantStore.saveBulkParticipants(updated);
    await participantStore.saveConclusions({ [dept]: true });
    await loadParticipants();
    await loadAllConclusions();

    soundManager.playSuccess();
    showNotice(`✅ Round 1 Concluded Successfully for ${DEPARTMENTS[dept].name}! (${qualifiedCount} Teams Qualified)`);
    setConcludeSuccessModal({
      isOpen: true,
      departmentName: DEPARTMENTS[dept].name,
      deptCode: DEPARTMENTS[dept].code,
      qualifiedCount,
      qualifiedList
    });
  };

  // Reopen Round 1 for a specific department
  const handleReopenDepartment = async (dept: Department) => {
    await participantStore.saveConclusions({ [dept]: false });
    await loadAllConclusions();
    soundManager.playWarning();
    showNotice(`Round 1 evaluation for ${DEPARTMENTS[dept].shortName} re-opened as DRAFT.`);
  };

  // Conclude all departments simultaneously
  const handleConcludeAll = async () => {
    const updated = participants.map((p) => ({
      ...p,
      resultStatus: p.qualifiedForRound2 ? ('Qualified' as const) : ('Not Qualified' as const)
    }));

    const qualifiedList = updated.filter((p) => !!p.qualifiedForRound2);
    const totalQual = qualifiedList.length;

    await participantStore.saveBulkParticipants(updated);
    await participantStore.saveConclusions({ IT: true, AIDS: true, CSBS: true, global: true });
    await loadParticipants();
    await loadAllConclusions();

    soundManager.playSuccess();
    showNotice(`✅ Round 1 Concluded Successfully across ALL Departments! (${totalQual} Total Qualified)`);
    setConcludeSuccessModal({
      isOpen: true,
      departmentName: 'All 3 Departments (IT, AI&DS, CSBS)',
      deptCode: 'ALL',
      qualifiedCount: totalQual,
      qualifiedList
    });
  };

  // Select Top N in a given department
  const handleSelectTopNDept = async (dept: Department, n: number) => {
    const deptList = participants.filter((p) => p.department === dept);
    const sorted = [...deptList].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    const topRegs = new Set(sorted.slice(0, n).map((p) => p.registerNumber));

    const updated = participants.map((p) => {
      if (p.department === dept) {
        const isTop = topRegs.has(p.registerNumber);
        return {
          ...p,
          qualifiedForRound2: isTop,
          resultStatus: isTop ? ('Qualified' as const) : ('Not Qualified' as const)
        };
      }
      return p;
    });

    await participantStore.saveBulkParticipants(updated);
    await loadParticipants();
    soundManager.playBeep(650, 'sine', 0.05);
    showNotice(`Selected top ${n} ranked team(s) in ${DEPARTMENTS[dept].shortName}.`);
  };

  // Select/Deselect All in a department
  const handleToggleSelectAllDept = async (dept: Department, select: boolean) => {
    const updated = participants.map((p) => {
      if (p.department === dept) {
        return {
          ...p,
          qualifiedForRound2: select,
          resultStatus: select ? ('Qualified' as const) : ('Not Qualified' as const)
        };
      }
      return p;
    });

    await participantStore.saveBulkParticipants(updated);
    await loadParticipants();
    soundManager.playBeep(520, 'sine', 0.03);
    showNotice(select ? `Selected all teams in ${DEPARTMENTS[dept].shortName}.` : `Deselected all in ${DEPARTMENTS[dept].shortName}.`);
  };

  // Delete participant with confirmation dialog
  const requestDeleteParticipant = (p: ParticipantRecord) => {
    const regOrId = p.registerNumber || p.id;
    const nameStr = p.name || 'Candidate';
    setConfirmModal({
      isOpen: true,
      title: 'Delete Participant Record?',
      message: `Are you sure you want to permanently delete ${nameStr} (${regOrId}) from ${DEPARTMENTS[p.department]?.shortName || p.department}? This immediately synchronizes and purges their record from all connected workstations.`,
      confirmText: 'Delete Record',
      isDanger: true,
      onConfirm: async () => {
        await participantStore.deleteParticipant(regOrId);
        await loadParticipants();
        soundManager.playBeep(350, 'square', 0.05);
        showNotice(`Removed participant (${regOrId})`);
        setConfirmModal(null);
      }
    });
  };

  // Direct fast delete (for backward-compatibility or single-click actions)
  const handleDeleteParticipant = async (regNo: string) => {
    await participantStore.deleteParticipant(regNo);
    await loadParticipants();
    soundManager.playBeep(350, 'square', 0.05);
    setDeleteConfirmId(null);
    showNotice(`Removed participant (${regNo})`);
  };

  // Clear department database with confirmation dialog
  const handleClearDepartment = (dept: Department) => {
    setConfirmModal({
      isOpen: true,
      title: `Clear ${DEPARTMENTS[dept].shortName} Database?`,
      message: `Are you sure you want to clear all participant records in ${DEPARTMENTS[dept].name}? All scores, qualification states, and timers for this track will be purged across all workstations.`,
      confirmText: `Clear ${DEPARTMENTS[dept].shortName} Track`,
      isDanger: true,
      onConfirm: async () => {
        await participantStore.clearDepartment(dept);
        await loadParticipants();
        soundManager.playWarning();
        showNotice(`Cleared ${DEPARTMENTS[dept].shortName} database.`);
        setConfirmModal(null);
      }
    });
  };

  // Clear all tournament records
  const handleClearAllTournament = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Tournament Records?',
      message: 'Are you sure you want to clear all participant records across ALL departments (IT, AI&DS, CSBS)? This action is permanent and synchronizes immediately to all connected PCs.',
      confirmText: 'Purge All Records',
      isDanger: true,
      onConfirm: async () => {
        await participantStore.clearAllParticipants();
        await loadParticipants();
        soundManager.playWarning();
        showNotice('Purged all tournament participant records across all tracks.');
        setConfirmModal(null);
      }
    });
  };

  // Add sample team in department
  const handleAddSampleInDept = async (dept: Department) => {
    const r1 = Math.floor(11 + Math.random() * 5); // 11-15
    const r2 = Math.floor(9 + Math.random() * 6);  // 9-15
    const r3 = Math.floor(8 + Math.random() * 7);  // 8-15
    const total = r1 + r2 + r3;
    const timeUsedM = Math.floor(16 + Math.random() * 22);
    const timeUsedS = Math.floor(10 + Math.random() * 49);

    const namesByDept = {
      IT: ['Karthik Raja', 'Pooja Sundaram', 'Devika Menon', 'Santhosh Kumar'],
      AIDS: ['Ananya Sharma', 'Rohan Varma', 'Deepak Nambiar', 'Meera Nair'],
      CSBS: ['Aditya Narayan', 'Sneha Krishnan', 'Harish Babu', 'Priya Chandran']
    };

    const partnersByDept = {
      IT: ['Vignesh S.', 'Divya R.', 'Gokul M.'],
      AIDS: ['Aravind K.', 'Swathi P.', 'Naveen T.'],
      CSBS: ['Rahul J.', 'Pavithra S.', 'Kiran B.']
    };

    const leadName = namesByDept[dept][Math.floor(Math.random() * namesByDept[dept].length)];
    const partnerName = partnersByDept[dept][Math.floor(Math.random() * partnersByDept[dept].length)];

    const newRecord: ParticipantRecord = {
      id: `P-${Date.now()}`,
      name: leadName,
      registerNumber: `21${dept}${Math.floor(100 + Math.random() * 900)}`,
      year: 'III',
      department: dept,
      teamName: `ALPHA_${dept}_${Math.floor(10 + Math.random() * 90)}`,
      partnerName: partnerName,
      partnerRegisterNumber: `21${dept}${Math.floor(100 + Math.random() * 900)}`,
      round1Score: r1,
      round2Score: r2,
      round3Score: r3,
      totalScore: total,
      accuracy: `${Math.floor(80 + Math.random() * 20)}%`,
      timeUsed: `${timeUsedM}m ${timeUsedS}s`,
      timeUsedSeconds: timeUsedM * 60 + timeUsedS,
      tabViolations: Math.floor(Math.random() * 2),
      status: 'Completed',
      finishingStatus: `Finished (${timeUsedM}m ${timeUsedS}s)`,
      qualifiedForRound2: r1 >= 12,
      resultStatus: r1 >= 12 ? 'Qualified' : 'Not Qualified',
      registeredAt: new Date().toISOString()
    };

    await participantStore.registerOrUpdate(newRecord);
    await loadParticipants();
    soundManager.playBeep(600, 'sine', 0.04);
    showNotice(`Added sample team to ${DEPARTMENTS[dept].shortName}: ${newRecord.teamName}`);
  };

  // Export department database as CSV or JSON
  const handleExportData = (dept: Department | 'ALL', format: 'csv' | 'json') => {
    const list = dept === 'ALL' ? participants : participants.filter((p) => p.department === dept);
    if (list.length === 0) {
      showNotice('No participant records to export.');
      return;
    }

    let fileContent = '';
    let filename = `triquetra26_${dept.toLowerCase()}_database.${format}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      fileContent = JSON.stringify(list, null, 2);
      mimeType = 'application/json';
    } else {
      mimeType = 'text/csv';
      const headers = [
        'Rank',
        'Department',
        'Team Name',
        'Lead Participant',
        'Lead Reg No',
        'Year',
        'Partner Name',
        'Partner Reg No',
        'Round 1 (/15)',
        'Round 2 (/15)',
        'Round 3 (/15)',
        'Total Marks (/45)',
        'Time Taken',
        'Violations',
        'Round 2 Qualified',
        'Status'
      ];

      const rows = list.map((p, idx) => [
        idx + 1,
        p.department,
        `"${p.teamName || ''}"`,
        `"${p.name}"`,
        `"${p.registerNumber}"`,
        p.year || '',
        `"${p.partnerName || ''}"`,
        `"${p.partnerRegisterNumber || ''}"`,
        p.round1Score ?? 0,
        p.round2Score ?? 0,
        p.round3Score ?? 0,
        p.totalScore ?? 0,
        `"${p.timeUsed || ''}"`,
        p.tabViolations ?? 0,
        p.qualifiedForRound2 ? 'YES' : 'NO',
        `"${p.resultStatus || p.status || ''}"`
      ]);

      fileContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotice(`Exported ${list.length} records as ${filename}`);
  };

  // Question Store Handlers
  const handleSaveQuestion = (questionData: Omit<Question, 'id' | 'seqId'> & { id?: number }) => {
    if (questionData.id) {
      questionStore.updateQuestion(questionData.id, questionData);
      showNotice(`Updated Question #${questionData.questionNumber}: ${questionData.title}`);
    } else {
      questionStore.addQuestion(questionData);
      showNotice(`Added New Question for Round ${questionData.round}: ${questionData.title}`);
    }
    loadQuestions();
  };

  const handleDeleteQuestion = (id: number) => {
    const targetQ = questions.find((q) => q.id === id);
    const titleStr = targetQ ? `"${targetQ.title}"` : `#${id}`;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Question?',
      message: `Are you sure you want to delete Question ${titleStr} from the challenge bank?`,
      confirmText: 'Delete Question',
      isDanger: true,
      onConfirm: () => {
        questionStore.deleteQuestion(id);
        loadQuestions();
        soundManager.playBeep(350, 'square', 0.05);
        showNotice(`Deleted question #${id}`);
        setConfirmModal(null);
      }
    });
  };

  const handleResetQuestions = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Challenge Bank?',
      message: 'Are you sure you want to reset all questions to the official 45 arena challenges across Rounds 1, 2, and 3?',
      confirmText: 'Reset to Defaults',
      isDanger: false,
      onConfirm: () => {
        questionStore.resetToDefaults();
        loadQuestions();
        soundManager.playWarning();
        showNotice('Questions reset to official defaults.');
        setConfirmModal(null);
      }
    });
  };

  // Helper to get ranked list for a department or all
  const getRankedList = (deptFilter: Department | 'ALL', query: string) => {
    let list = [...participants];

    if (deptFilter !== 'ALL') {
      list = list.filter((p) => p.department === deptFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.registerNumber.toLowerCase().includes(q) ||
          (p.teamName && p.teamName.toLowerCase().includes(q)) ||
          (p.partnerName && p.partnerName.toLowerCase().includes(q))
      );
    }

    // Dynamic Marks Ranking
    list.sort((a, b) => {
      const scoreA = a.totalScore ?? (a.round1Score ?? 0);
      const scoreB = b.totalScore ?? (b.round1Score ?? 0);
      if (scoreB !== scoreA) return scoreB - scoreA;

      const r1A = a.round1Score ?? 0;
      const r1B = b.round1Score ?? 0;
      if (r1B !== r1A) return r1B - r1A;

      const timeA = a.timeUsedSeconds ?? 999999;
      const timeB = b.timeUsedSeconds ?? 999999;
      if (timeA !== timeB) return timeA - timeB;

      return (a.tabViolations ?? 0) - (b.tabViolations ?? 0);
    });

    return list;
  };

  // Memoized Ranked Lists
  const itRanked = useMemo(() => getRankedList('IT', searchQuery), [participants, searchQuery]);
  const aidsRanked = useMemo(() => getRankedList('AIDS', searchQuery), [participants, searchQuery]);
  const csbsRanked = useMemo(() => getRankedList('CSBS', searchQuery), [participants, searchQuery]);
  const allRanked = useMemo(() => getRankedList('ALL', searchQuery), [participants, searchQuery]);

  // Filtered Questions List
  const filteredQuestions = useMemo(() => {
    let list = [...questions];

    if (selectedRoundFilter > 0) {
      list = list.filter((q) => q.round === selectedRoundFilter);
    }

    if (selectedLangFilter !== 'ALL') {
      list = list.filter((q) => q.language === selectedLangFilter.toLowerCase());
    }

    if (questionSearch.trim()) {
      const s = questionSearch.toLowerCase();
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(s) ||
          q.category.toLowerCase().includes(s) ||
          q.description.toLowerCase().includes(s) ||
          q.brokenCode.toLowerCase().includes(s)
      );
    }

    return list;
  }, [questions, selectedRoundFilter, selectedLangFilter, questionSearch]);

  // Guard: Return null if modal is not open
  if (!isOpen) return null;

  // Active department metadata for Department tabs
  const activeDeptCode: Department | null =
    activeTab === 'DEPT_IT' ? 'IT' : activeTab === 'DEPT_AIDS' ? 'AIDS' : activeTab === 'DEPT_CSBS' ? 'CSBS' : null;

  const currentDeptMeta = activeDeptCode ? DEPARTMENTS[activeDeptCode] : null;
  const currentDeptList =
    activeTab === 'DEPT_IT'
      ? itRanked
      : activeTab === 'DEPT_AIDS'
      ? aidsRanked
      : activeTab === 'DEPT_CSBS'
      ? csbsRanked
      : allRanked;

  const activeDeptConcluded = activeDeptCode ? deptConclusion[activeDeptCode] : isGlobalConcluded;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#081026] border border-[#00f0ff]/30 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Header Bar */}
        <div className="relative bg-gradient-to-r from-[#0d1f42] via-[#112854] to-[#0d1f42] px-6 py-4 border-b border-[#00f0ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-semibold">
                CENTRAL ADMINISTRATOR AUTHENTICATION // GANADIPATHY TULSI'S JAIN ENGG COLLEGE
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-mono flex items-center gap-2">
                <span>TRIQUETRA'26 MULTI-DEPARTMENT DATABASE HUB</span>
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

        {/* Unauthenticated Login Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="p-8 max-w-md mx-auto w-full space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center mx-auto text-[#00f0ff]">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white font-mono uppercase">Master Administrator Key</h3>
              <p className="text-xs text-gray-400">
                Single sign-on for IT, AI&amp;DS and CSBS department databases and question authoring.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono text-center">
                {error}
              </div>
            )}

            <div>
              <div className="relative">
                <Key className="w-4 h-4 text-[#00f0ff] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Master Key..."
                  className="w-full bg-[#050c1f] border border-[#00f0ff]/30 focus:border-[#00f0ff] rounded-lg pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="text-[11px] text-gray-500 mt-1 font-mono text-right">
                Master Key:{' '}
                <button
                  type="button"
                  onClick={() => setPasscode('TRIQUETRA2026')}
                  className="text-[#00f0ff] underline cursor-pointer"
                >
                  TRIQUETRA2026
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00d2ff] to-[#0055ff] text-black font-extrabold font-mono text-xs tracking-wider uppercase hover:opacity-90 transition-opacity cursor-pointer"
            >
              Unlock Master Arena Control
            </button>
          </form>
        ) : (
          /* Authenticated Multi-Department Database Screen */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Top Department Switcher Tab Bar */}
            <div className="px-4 sm:px-6 pt-3 bg-[#050c1f] border-b border-[#00f0ff]/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 max-w-full">
                {/* 1. IT Department Tab */}
                <button
                  onClick={() => setActiveTab('DEPT_IT')}
                  className={`px-3.5 py-2 rounded-t-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                    activeTab === 'DEPT_IT'
                      ? 'bg-[#081026] text-[#00f0ff] border-[#00f0ff]/50 border-b-transparent shadow-[0_-5px_15px_rgba(0,240,255,0.15)]'
                      : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>IT DATABASE</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#00f0ff]/20 text-[#00f0ff]">
                    {participants.filter((p) => p.department === 'IT').length}
                  </span>
                </button>

                {/* 2. AI&DS Department Tab */}
                <button
                  onClick={() => setActiveTab('DEPT_AIDS')}
                  className={`px-3.5 py-2 rounded-t-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                    activeTab === 'DEPT_AIDS'
                      ? 'bg-[#081026] text-[#ff9e00] border-[#ff9e00]/50 border-b-transparent shadow-[0_-5px_15px_rgba(255,158,0,0.15)]'
                      : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#ff9e00]" />
                  <span>AI&amp;DS DATABASE</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#ff9e00]/20 text-[#ff9e00]">
                    {participants.filter((p) => p.department === 'AIDS').length}
                  </span>
                </button>

                {/* 3. CSBS Department Tab */}
                <button
                  onClick={() => setActiveTab('DEPT_CSBS')}
                  className={`px-3.5 py-2 rounded-t-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-t border-x ${
                    activeTab === 'DEPT_CSBS'
                      ? 'bg-[#081026] text-[#c084fc] border-[#c084fc]/50 border-b-transparent shadow-[0_-5px_15px_rgba(192,132,252,0.15)]'
                      : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#c084fc]" />
                  <span>CSBS DATABASE</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#c084fc]/20 text-[#c084fc]">
                    {participants.filter((p) => p.department === 'CSBS').length}
                  </span>
                </button>

                {/* 4. Unified All Departments Overview */}
                <button
                  onClick={() => setActiveTab('OVERVIEW')}
                  className={`px-3 py-2 rounded-t-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-t border-x ${
                    activeTab === 'OVERVIEW'
                      ? 'bg-[#081026] text-white border-white/40 border-b-transparent'
                      : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>UNIFIED VIEW</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-gray-300">
                    {participants.length}
                  </span>
                </button>

                {/* 5. Question Bank Tab */}
                <button
                  onClick={() => setActiveTab('QUESTIONS')}
                  className={`px-3 py-2 rounded-t-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-t border-x ${
                    activeTab === 'QUESTIONS'
                      ? 'bg-[#081026] text-emerald-400 border-emerald-400/50 border-b-transparent'
                      : 'bg-transparent text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QUESTION BANK</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">
                    {questions.length}
                  </span>
                </button>
              </div>

              {/* Master Authentication & Multi-PC Live Sync Indicator */}
              <div className="flex items-center gap-2 pb-2 text-[11px] font-mono">
                {/* Hidden File input for JSON import */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJsonFile}
                  accept=".json"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-2.5 py-1 rounded bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/30 text-[#00f0ff] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Force re-sync with central database across all arena PCs"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sync All PCs</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 border border-gray-700 text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Import / Merge JSON database from another PC"
                >
                  <Upload className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">Import JSON</span>
                </button>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Multi-PC Live Sync</span>
                </div>
              </div>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="mx-6 mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4" /> {notification}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW A: SEPARATE DEPARTMENT DATABASE (IT / AI&DS / CSBS) */}
            {/* ========================================================================= */}
            {currentDeptMeta && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Department Header Banner */}
                <div
                  className={`p-4 rounded-2xl border ${currentDeptMeta.borderColor} ${currentDeptMeta.bgColor} flex flex-wrap items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border ${currentDeptMeta.borderColor} flex items-center justify-center bg-[#081026] shadow-[0_0_20px_rgba(0,240,255,0.1)]`}
                    >
                      {currentDeptMeta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${currentDeptMeta.badgeClass}`}>
                          TRACK: {currentDeptMeta.code}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {activeDeptConcluded ? 'Round 1: Published' : 'Round 1: In Evaluation'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                        {currentDeptMeta.name}
                      </h3>
                    </div>
                  </div>

                  {/* Actions for this department */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenAddParticipant(currentDeptMeta.code)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#0099ff] hover:opacity-95 text-black font-extrabold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> + Register Team
                    </button>

                    <button
                      onClick={() => handleAddSampleInDept(currentDeptMeta.code)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-white/10"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> + Sample Team
                    </button>

                    <button
                      onClick={() => handleExportData(currentDeptMeta.code, 'csv')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-white/10"
                      title="Export CSV"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>

                    <button
                      onClick={() => handleClearDepartment(currentDeptMeta.code)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-red-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Dept
                    </button>
                  </div>
                </div>

                {/* Department Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#0b1633] border border-gray-800">
                    <div className="text-[10px] font-mono text-gray-400">TOTAL {currentDeptMeta.code} TEAMS</div>
                    <div className="text-xl font-bold font-mono mt-1 text-white">{currentDeptList.length}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b1633] border border-emerald-500/30">
                    <div className="text-[10px] font-mono text-gray-400">QUALIFIED FOR ROUND 2</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                      {currentDeptList.filter((p) => p.qualifiedForRound2).length}{' '}
                      <span className="text-xs text-gray-500">/ {currentDeptList.length}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b1633] border border-gray-800">
                    <div className="text-[10px] font-mono text-gray-400">HIGHEST SCORE IN {currentDeptMeta.code}</div>
                    <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
                      {currentDeptList.length > 0
                        ? `${Math.max(...currentDeptList.map((p) => p.totalScore || p.round1Score || 0))} / 45`
                        : '0 / 45'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0b1633] border border-red-500/20">
                    <div className="text-[10px] font-mono text-gray-400">FOCUS STRIKES</div>
                    <div className="text-xl font-bold text-red-400 font-mono mt-1">
                      {currentDeptList.reduce((acc, p) => acc + (p.tabViolations || 0), 0)}
                    </div>
                  </div>
                </div>

                {/* Department Round 1 Conclusion & Selection Toolbar */}
                <div className="p-4 bg-gradient-to-r from-[#0e1c3d] via-[#112854] to-[#0e1c3d] rounded-2xl border border-[#00f0ff]/30 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#00f0ff]" />
                      {currentDeptMeta.shortName.toUpperCase()} — ROUND 1 QUALIFICATION
                    </div>
                    <p className="text-[11px] text-gray-300 max-w-xl">
                      Select qualified candidates for {currentDeptMeta.name} using the checkboxes or quick selectors, then click{' '}
                      <strong className="text-[#00f0ff]">Conclude Round 1</strong> to publish.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!activeDeptConcluded ? (
                      <button
                        onClick={() => handleConcludeDepartment(currentDeptMeta.code)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-95 text-black font-extrabold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        CONCLUDE ROUND 1 ({currentDeptList.filter((p) => p.qualifiedForRound2).length} Qualified)
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConcludeDepartment(currentDeptMeta.code)}
                          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          title="Update Published Selection"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Update Published
                        </button>
                        <button
                          onClick={() => handleReopenDepartment(currentDeptMeta.code)}
                          className="px-3 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 font-mono text-xs cursor-pointer"
                        >
                          Reopen as Draft
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Selection Toolbar for this Department */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#050c1f] rounded-xl border border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search in ${currentDeptMeta.code}...`}
                        className="bg-[#0b1633] border border-gray-700 focus:border-[#00f0ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none w-48 sm:w-56"
                      />
                    </div>

                    <div className="text-xs text-gray-400 font-mono pl-2">
                      Quick Select:
                    </div>
                    <button
                      onClick={() => handleSelectTopNDept(currentDeptMeta.code, 3)}
                      className="px-2.5 py-1 rounded bg-[#0b1633] hover:bg-[#122452] border border-gray-700 text-[11px] font-mono text-gray-200 cursor-pointer"
                    >
                      Top 3
                    </button>
                    <button
                      onClick={() => handleSelectTopNDept(currentDeptMeta.code, 5)}
                      className="px-2.5 py-1 rounded bg-[#0b1633] hover:bg-[#122452] border border-gray-700 text-[11px] font-mono text-gray-200 cursor-pointer"
                    >
                      Top 5
                    </button>
                    <button
                      onClick={() => handleToggleSelectAllDept(currentDeptMeta.code, true)}
                      className="px-2.5 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 cursor-pointer"
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleToggleSelectAllDept(currentDeptMeta.code, false)}
                      className="px-2.5 py-1 rounded bg-[#0b1633] hover:bg-[#122452] border border-gray-700 text-[11px] font-mono text-gray-400 cursor-pointer"
                    >
                      None
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-gray-400">
                    Showing <strong className="text-white">{currentDeptList.length}</strong> teams in {currentDeptMeta.shortName}
                  </div>
                </div>

                {/* Department Dedicated Leaderboard Table */}
                <div className="bg-[#050c1f] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#0b1633] text-gray-300 uppercase tracking-wider text-[10px] border-b border-gray-800 select-none">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">QUALIFY</th>
                          <th className="py-3 px-3 w-12 text-center">RANK</th>
                          <th className="py-3 px-4">TEAM &amp; LEAD PARTICIPANT</th>
                          <th className="py-3 px-3">REGISTER NO</th>
                          <th className="py-3 px-3">DUO PARTNER</th>
                          <th className="py-3 px-2 text-center text-[#00f0ff]">R1 (/15)</th>
                          <th className="py-3 px-2 text-center text-[#ff9e00]">R2 (/15)</th>
                          <th className="py-3 px-2 text-center text-[#c084fc]">R3 (/15)</th>
                          <th className="py-3 px-3 text-center bg-[#091838] text-white font-bold">TOTAL (/45)</th>
                          <th className="py-3 px-3">TIME</th>
                          <th className="py-3 px-2 text-center">STRIKES</th>
                          <th className="py-3 px-3 text-center">RESULT</th>
                          <th className="py-3 px-2 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60 text-gray-200">
                        {currentDeptList.length === 0 ? (
                          <tr>
                            <td colSpan={13} className="py-12 text-center text-gray-500 font-mono text-xs">
                              No participants currently registered in {currentDeptMeta.name}. Click <strong className="text-[#00f0ff]">+ Sample Team</strong> to test.
                            </td>
                          </tr>
                        ) : (
                          currentDeptList.map((p, idx) => {
                            const isTop3 = idx < 3;
                            const isQualified = !!p.qualifiedForRound2;

                            return (
                              <tr
                                key={p.registerNumber}
                                className={`hover:bg-[#0a183d]/60 transition-colors ${
                                  isQualified ? 'bg-emerald-950/20' : ''
                                }`}
                              >
                                {/* Qualify Checkbox */}
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() => handleToggleQualification(p.registerNumber)}
                                    className="cursor-pointer text-gray-400 hover:text-white"
                                    title={isQualified ? 'Unselect from Round 2' : 'Qualify for Round 2'}
                                  >
                                    {isQualified ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                      <Square className="w-4 h-4 text-gray-600 hover:text-gray-400" />
                                    )}
                                  </button>
                                </td>

                                {/* Rank */}
                                <td className="py-3 px-3 text-center font-bold">
                                  {idx === 0 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px]">
                                      #1
                                    </span>
                                  ) : idx === 1 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-300 text-black font-black text-[10px]">
                                      #2
                                    </span>
                                  ) : idx === 2 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-700 text-white font-black text-[10px]">
                                      #3
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">#{idx + 1}</span>
                                  )}
                                </td>

                                {/* Team & Lead Participant */}
                                <td className="py-3 px-4">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{p.teamName || p.name}</span>
                                    {isTop3 && <Sparkles className="w-3 h-3 text-amber-400" />}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    Lead: {p.name} · Yr {p.year || 'III'}
                                  </div>
                                </td>

                                {/* Reg No */}
                                <td className="py-3 px-3 text-gray-300 font-mono text-[11px]">
                                  {p.registerNumber}
                                </td>

                                {/* Duo Partner */}
                                <td className="py-3 px-3 text-[11px]">
                                  {p.partnerName ? (
                                    <div>
                                      <div className="text-gray-300 font-medium">{p.partnerName}</div>
                                      <div className="text-[10px] text-gray-500 font-mono">{p.partnerRegisterNumber}</div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-600">—</span>
                                  )}
                                </td>

                                {/* Round 1 Score */}
                                <td className="py-3 px-2 text-center font-bold text-[#00f0ff]">
                                  {p.round1Score ?? 0}
                                </td>

                                {/* Round 2 Score */}
                                <td className="py-3 px-2 text-center font-bold text-[#ff9e00]">
                                  {p.round2Score ?? '—'}
                                </td>

                                {/* Round 3 Score */}
                                <td className="py-3 px-2 text-center font-bold text-[#c084fc]">
                                  {p.round3Score ?? '—'}
                                </td>

                                {/* Total Marks */}
                                <td className="py-3 px-3 text-center font-extrabold text-white bg-[#091838]">
                                  <span className="text-sm text-emerald-400">
                                    {p.totalScore ?? (p.round1Score ?? 0)}
                                  </span>
                                </td>

                                {/* Time Taken */}
                                <td className="py-3 px-3 text-[11px] text-gray-400">
                                  {p.timeUsed || (p.timeUsedSeconds ? `${Math.floor(p.timeUsedSeconds / 60)}m ${p.timeUsedSeconds % 60}s` : '—')}
                                </td>

                                {/* Strikes */}
                                <td className="py-3 px-2 text-center font-bold">
                                  {(p.tabViolations || 0) > 0 ? (
                                    <span className="text-red-400">{p.tabViolations}</span>
                                  ) : (
                                    <span className="text-emerald-400">0</span>
                                  )}
                                </td>

                                {/* Result Status */}
                                <td className="py-3 px-3 text-center">
                                  {activeDeptConcluded ? (
                                    isQualified ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                                        QUALIFIED
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/40">
                                        NOT QUALIFIED
                                      </span>
                                    )
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-300">
                                      {isQualified ? 'SELECTED' : 'DRAFT'}
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleOpenEditParticipant(p)}
                                      className="p-1 rounded hover:bg-[#00f0ff]/20 text-[#00f0ff] hover:text-white cursor-pointer transition-colors"
                                      title="Edit All Participant Details & Scores"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => requestDeleteParticipant(p)}
                                      className="p-1 rounded hover:bg-red-900/50 text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW B: UNIFIED OVERVIEW (All 3 Departments Side-by-Side) */}
            {/* ========================================================================= */}
            {activeTab === 'OVERVIEW' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Department Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['IT', 'AIDS', 'CSBS'] as Department[]).map((deptKey) => {
                    const meta = DEPARTMENTS[deptKey];
                    const deptList = participants.filter((p) => p.department === deptKey);
                    const qualCount = deptList.filter((p) => p.qualifiedForRound2).length;
                    const isConcluded = deptConclusion[deptKey];

                    return (
                      <div
                        key={deptKey}
                        className={`p-4 rounded-2xl border ${meta.borderColor} ${meta.bgColor} space-y-3`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {meta.icon}
                            <span className="font-bold text-white font-mono text-sm">{meta.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${meta.badgeClass}`}>
                            {deptKey}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                          <div className="p-2 rounded bg-[#081026] border border-gray-800">
                            <div className="text-[10px] text-gray-500">TEAMS</div>
                            <div className="text-lg font-bold text-white mt-0.5">{deptList.length}</div>
                          </div>
                          <div className="p-2 rounded bg-[#081026] border border-gray-800">
                            <div className="text-[10px] text-gray-500">QUALIFIED</div>
                            <div className="text-lg font-bold text-emerald-400 mt-0.5">
                              {qualCount} <span className="text-[10px] text-gray-500">/ {deptList.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-mono text-gray-400">
                            Status: <strong className="text-white">{isConcluded ? 'Concluded' : 'Draft'}</strong>
                          </span>
                          <button
                            onClick={() => setActiveTab(`DEPT_${deptKey}` as AdminTab)}
                            className="text-xs font-mono font-bold text-[#00f0ff] hover:underline cursor-pointer"
                          >
                            Open Database &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Master Global Actions */}
                <div className="p-4 bg-[#0b1633] rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">CROSS-DEPARTMENT OPERATIONS</h4>
                    <p className="text-xs text-gray-400">Manage participants, publish evaluation conclusions, or export data across all 3 tracks.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenAddParticipant('IT')}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] hover:opacity-95 text-black font-extrabold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> + Register Participant / Team
                    </button>
                    <button
                      onClick={handleConcludeAll}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold font-mono text-xs uppercase cursor-pointer"
                    >
                      Conclude All Departments
                    </button>
                    <button
                      onClick={() => handleExportData('ALL', 'csv')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export All Data (CSV)
                    </button>
                    <button
                      onClick={handleClearAllTournament}
                      className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-red-500/30"
                      title="Purge all participant records across all 3 tracks"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All Records
                    </button>
                  </div>
                </div>

                {/* Unified Master Leaderboard */}
                <div className="bg-[#050c1f] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                  <div className="p-3 bg-[#0b1633] border-b border-gray-800 flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-white">
                      OVERALL TOURNAMENT RANKINGS (ALL DEPARTMENTS)
                    </div>
                    <div className="text-xs font-mono text-gray-400">
                      Total: <strong className="text-white">{allRanked.length}</strong> Registered Teams
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#081026] text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800 select-none">
                        <tr>
                          <th className="py-2.5 px-3 text-center">RANK</th>
                          <th className="py-2.5 px-2 text-center">TRACK</th>
                          <th className="py-2.5 px-4">TEAM / PARTICIPANT</th>
                          <th className="py-2.5 px-3">REG NO</th>
                          <th className="py-2.5 px-2 text-center text-[#00f0ff]">R1</th>
                          <th className="py-2.5 px-2 text-center text-[#ff9e00]">R2</th>
                          <th className="py-2.5 px-2 text-center text-[#c084fc]">R3</th>
                          <th className="py-2.5 px-3 text-center text-white bg-[#091838]">TOTAL</th>
                          <th className="py-2.5 px-3">TIME</th>
                          <th className="py-2.5 px-3 text-center">STATUS</th>
                          <th className="py-2.5 px-2 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 text-gray-200">
                        {allRanked.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="py-8 text-center text-gray-500 font-mono text-xs">
                              No participants currently registered. Click <strong className="text-[#00f0ff]">+ Register Participant / Team</strong> to add candidate records.
                            </td>
                          </tr>
                        ) : (
                          allRanked.map((p, idx) => (
                            <tr key={p.registerNumber} className="hover:bg-[#0a183d]/60">
                              <td className="py-2.5 px-3 text-center font-bold">#{idx + 1}</td>
                              <td className="py-2.5 px-2 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    DEPARTMENTS[p.department]?.badgeClass || 'bg-gray-800 text-gray-300'
                                  }`}
                                >
                                  {p.department}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-bold text-white">
                                {p.teamName || p.name}
                                <div className="text-[10px] text-gray-400 font-normal">
                                  Lead: {p.name} {p.partnerName ? `· Duo: ${p.partnerName}` : ''}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-gray-400">{p.registerNumber}</td>
                              <td className="py-2.5 px-2 text-center text-[#00f0ff]">{p.round1Score ?? 0}</td>
                              <td className="py-2.5 px-2 text-center text-[#ff9e00]">{p.round2Score ?? '—'}</td>
                              <td className="py-2.5 px-2 text-center text-[#c084fc]">{p.round3Score ?? '—'}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-emerald-400 bg-[#091838]">
                                {p.totalScore ?? p.round1Score ?? 0}
                              </td>
                              <td className="py-2.5 px-3 text-gray-400">{p.timeUsed || '—'}</td>
                              <td className="py-2.5 px-3 text-center">
                                {p.qualifiedForRound2 ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                                    QUALIFIED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] text-gray-500">
                                    {p.status || 'Active'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditParticipant(p)}
                                    className="p-1 rounded hover:bg-[#00f0ff]/20 text-[#00f0ff] hover:text-white cursor-pointer transition-colors"
                                    title="Edit Participant Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => requestDeleteParticipant(p)}
                                    className="p-1 rounded hover:bg-red-900/50 text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW C: QUESTION BANK ENGINE */}
            {/* ========================================================================= */}
            {activeTab === 'QUESTIONS' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#050c1f] rounded-xl border border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        placeholder="Search challenges..."
                        className="bg-[#0b1633] border border-gray-700 focus:border-[#00f0ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none w-48 sm:w-60"
                      />
                    </div>

                    {/* Round Filter */}
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((r) => (
                        <button
                          key={r}
                          onClick={() => setSelectedRoundFilter(r)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                            selectedRoundFilter === r
                              ? 'bg-[#00f0ff] text-black'
                              : 'bg-[#0b1633] text-gray-400 hover:text-white'
                          }`}
                        >
                          {r === 0 ? 'All Rounds' : `R${r}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setQuestionToEdit(null);
                        setIsEditorOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Question
                    </button>
                    <button
                      onClick={handleResetQuestions}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer"
                      title="Reset to 45 Arena Defaults"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Defaults
                    </button>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-2">
                  {filteredQuestions.map((q) => {
                    const isExpanded = expandedQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className="bg-[#050c1f] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
                      >
                        <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-[#0b1633] border border-gray-700 flex items-center justify-center font-mono font-bold text-xs text-[#00f0ff] flex-shrink-0">
                              #{q.questionNumber}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">
                                  Round {q.round}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 uppercase">
                                  {q.language}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                  {q.category}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-xs sm:text-sm truncate mt-0.5">
                                {q.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setQuestionToEdit(q);
                                setIsEditorOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#0b1633] hover:bg-[#122452] text-gray-300 hover:text-white cursor-pointer"
                              title="Edit Question"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#00f0ff]" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg bg-[#0b1633] hover:bg-red-950/80 text-gray-500 hover:text-red-400 cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                              className="p-1.5 rounded-lg bg-[#0b1633] text-gray-400 hover:text-white cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Code & Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-gray-800/80 bg-[#030817] space-y-3">
                            <p className="text-xs text-gray-300">{q.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                              <div className="bg-[#050c1f] p-3 rounded-lg border border-gray-800">
                                <div className="text-[10px] text-red-400 font-bold mb-1">INITIAL / BROKEN CODE:</div>
                                <pre className="text-gray-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                  {q.brokenCode}
                                </pre>
                              </div>
                              <div className="bg-[#050c1f] p-3 rounded-lg border border-gray-800">
                                <div className="text-[10px] text-emerald-400 font-bold mb-1">CORRECT SOLUTION:</div>
                                <pre className="text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                  {q.fixedCode}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question Editor Modal */}
      {isEditorOpen && (
        <AdminQuestionEditorModal
          isOpen={isEditorOpen}
          initialQuestion={questionToEdit}
          onClose={() => {
            setIsEditorOpen(false);
            setQuestionToEdit(null);
          }}
          onSave={handleSaveQuestion}
        />
      )}

      {/* Participant Editor Modal (Add / Edit Full Details & Scores) */}
      {isParticipantEditorOpen && (
        <AdminParticipantEditorModal
          isOpen={isParticipantEditorOpen}
          participant={participantToEdit}
          defaultDepartment={editorDefaultDept}
          onClose={() => {
            setIsParticipantEditorOpen(false);
            setParticipantToEdit(null);
          }}
          onSave={handleSaveParticipantRecord}
        />
      )}

      {/* Universal In-App Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#071126] border border-gray-700/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-150">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                confirmModal.isDanger 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                  : 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40'
              }`}>
                {confirmModal.isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold font-mono text-white tracking-wide">
                  {confirmModal.title}
                </h3>
                <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await confirmModal.onConfirm();
                }}
                className={`px-5 py-2 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-2 ${
                  confirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-[#00f0ff] hover:bg-[#38bdf8] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                }`}
              >
                {confirmModal.isDanger && <Trash2 className="w-3.5 h-3.5" />}
                <span>{confirmModal.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conclude Round 1 Success Dialog */}
      {concludeSuccessModal && concludeSuccessModal.isOpen && (
        <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#08182b] via-[#061224] to-[#040a16] border-2 border-emerald-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.35)] animate-in fade-in zoom-in duration-200 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5] animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> OFFICIAL EVALUATION PUBLISHED
                </div>
                <h3 className="text-lg sm:text-xl font-black font-mono text-white tracking-wide uppercase mt-1">
                  CONCLUDE SUCCESSFUL!
                </h3>
                <p className="text-xs font-mono text-emerald-400 font-bold truncate">
                  {concludeSuccessModal.departmentName}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>QUALIFIED PARTICIPANTS SHORTLISTED:</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono font-extrabold text-sm border border-emerald-400/50">
                  {concludeSuccessModal.qualifiedCount} Qualified
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Round 1 evaluation is now concluded. All <strong className="text-emerald-400">{concludeSuccessModal.qualifiedCount} selected participant(s)</strong> have been authorized in the central database and can now immediately advance to <strong className="text-white font-mono">Round 2: CODE REPAIR</strong> on their workstations.
              </p>
            </div>

            {/* List of qualified participants */}
            {concludeSuccessModal.qualifiedList.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  SHORTLISTED CANDIDATES FOR ROUND 2:
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {concludeSuccessModal.qualifiedList.map((p, idx) => (
                    <div
                      key={p.registerNumber || p.id || idx}
                      className="p-2 rounded-xl bg-[#0b1633] border border-emerald-500/30 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="text-white font-bold">{p.teamName || p.name}</div>
                          <div className="text-[10px] text-gray-400">
                            Reg: {p.registerNumber} {p.partnerName ? `· Partner: ${p.partnerName}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          R1: {p.round1Score ?? 0}/15
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setConcludeSuccessModal(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-95 text-black font-extrabold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>CONFIRM &amp; RETURN TO DATABASE HUB</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
