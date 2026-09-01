import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Ensure data directory exists for server-side persistence
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');
const DELETED_FILE = path.join(DATA_DIR, 'deleted_participants.json');
const CONCLUSIONS_FILE = path.join(DATA_DIR, 'conclusions.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'custom_questions.json');

// Default initial participants for demo / showcase
const DEFAULT_INITIAL_PARTICIPANTS = [
  {
    id: 'P-101',
    name: 'Karthik Raja',
    registerNumber: '21IT101',
    year: 'III',
    department: 'IT',
    teamName: 'CYBER_VIPERS',
    partnerName: 'Vignesh S.',
    partnerRegisterNumber: '21IT102',
    round1Score: 14,
    round2Score: 13,
    round3Score: 12,
    totalScore: 39,
    accuracy: '87%',
    timeUsed: '24m 15s',
    timeUsedSeconds: 1455,
    tabViolations: 0,
    status: 'Completed',
    finishingStatus: 'Finished (24m 15s)',
    qualifiedForRound2: true,
    resultStatus: 'Qualified',
    registeredAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'P-102',
    name: 'Pooja Sundaram',
    registerNumber: '21IT103',
    year: 'III',
    department: 'IT',
    teamName: 'BYTE_FORCE',
    partnerName: 'Divya R.',
    partnerRegisterNumber: '21IT104',
    round1Score: 15,
    round2Score: 14,
    round3Score: 11,
    totalScore: 40,
    accuracy: '89%',
    timeUsed: '22m 40s',
    timeUsedSeconds: 1360,
    tabViolations: 0,
    status: 'Completed',
    finishingStatus: 'Finished (22m 40s)',
    qualifiedForRound2: true,
    resultStatus: 'Qualified',
    registeredAt: new Date(Date.now() - 3400000).toISOString()
  },
  {
    id: 'P-103',
    name: 'Ananya Sharma',
    registerNumber: '21AIDS201',
    year: 'III',
    department: 'AIDS',
    teamName: 'NEURAL_STORM',
    partnerName: 'Aravind K.',
    partnerRegisterNumber: '21AIDS202',
    round1Score: 15,
    round2Score: 15,
    round3Score: 14,
    totalScore: 44,
    accuracy: '98%',
    timeUsed: '19m 30s',
    timeUsedSeconds: 1170,
    tabViolations: 0,
    status: 'Completed',
    finishingStatus: 'Finished (19m 30s)',
    qualifiedForRound2: true,
    resultStatus: 'Qualified',
    registeredAt: new Date(Date.now() - 3200000).toISOString()
  },
  {
    id: 'P-104',
    name: 'Rohan Varma',
    registerNumber: '21AIDS203',
    year: 'III',
    department: 'AIDS',
    teamName: 'TENSOR_OPS',
    partnerName: 'Swathi P.',
    partnerRegisterNumber: '21AIDS204',
    round1Score: 13,
    round2Score: 12,
    round3Score: 10,
    totalScore: 35,
    accuracy: '78%',
    timeUsed: '27m 50s',
    timeUsedSeconds: 1670,
    tabViolations: 1,
    status: 'Completed',
    finishingStatus: 'Finished (27m 50s)',
    qualifiedForRound2: true,
    resultStatus: 'Qualified',
    registeredAt: new Date(Date.now() - 3000000).toISOString()
  },
  {
    id: 'P-105',
    name: 'Aditya Narayan',
    registerNumber: '21CSBS301',
    year: 'III',
    department: 'CSBS',
    teamName: 'ALGO_TRADERS',
    partnerName: 'Rahul J.',
    partnerRegisterNumber: '21CSBS302',
    round1Score: 14,
    round2Score: 13,
    round3Score: 13,
    totalScore: 40,
    accuracy: '89%',
    timeUsed: '21m 10s',
    timeUsedSeconds: 1270,
    tabViolations: 0,
    status: 'Completed',
    finishingStatus: 'Finished (21m 10s)',
    qualifiedForRound2: true,
    resultStatus: 'Qualified',
    registeredAt: new Date(Date.now() - 2800000).toISOString()
  }
];

// Helper to load file JSON
function loadJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to save file JSON
function saveJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// In-Memory state caches
let participants: any[] = loadJsonFile(PARTICIPANTS_FILE, DEFAULT_INITIAL_PARTICIPANTS);
let deletedParticipants: string[] = loadJsonFile(DELETED_FILE, []);
let conclusions: Record<string, boolean> = loadJsonFile(CONCLUSIONS_FILE, {
  IT: false,
  AIDS: false,
  CSBS: false,
  global: false
});
let customQuestions: any[] = loadJsonFile(QUESTIONS_FILE, []);

// Sanitize initial participants with any existing tombstones
if (deletedParticipants.length > 0) {
  const delSet = new Set(deletedParticipants.map((d) => String(d).toUpperCase().trim()));
  participants = participants.filter((p) => {
    const reg = (p.registerNumber || '').toUpperCase().trim();
    const id = (p.id || '').toUpperCase().trim();
    return (!reg || !delSet.has(reg)) && (!id || !delSet.has(id));
  });
}

// Save initial file if not present
if (!fs.existsSync(PARTICIPANTS_FILE)) {
  saveJsonFile(PARTICIPANTS_FILE, participants);
}
if (!fs.existsSync(DELETED_FILE)) {
  saveJsonFile(DELETED_FILE, deletedParticipants);
}
if (!fs.existsSync(CONCLUSIONS_FILE)) {
  saveJsonFile(CONCLUSIONS_FILE, conclusions);
}

// =========================================================================
// API ROUTES
// =========================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    participantsCount: participants.length
  });
});

// POST bidirectional sync: merges participants from this PC with central server database
app.post('/api/participants/sync', (req, res) => {
  try {
    const { localParticipants } = req.body;
    let modified = false;
    const delSet = new Set(deletedParticipants.map((d) => String(d).toUpperCase().trim()).filter(Boolean));

    if (Array.isArray(localParticipants)) {
      for (const local of localParticipants) {
        if (!local || (!local.registerNumber && !local.id)) continue;
        const regNo = (local.registerNumber || '').toUpperCase().trim();
        const localId = (local.id || '').trim();

        // Tombstone check: If participant was explicitly deleted, do NOT resurrect it!
        if (
          (regNo && delSet.has(regNo)) ||
          (localId && delSet.has(localId.toUpperCase()))
        ) {
          continue;
        }

        const index = participants.findIndex(
          (p) =>
            (regNo && p.registerNumber && p.registerNumber.toUpperCase() === regNo) ||
            (localId && p.id === localId)
        );

        if (index >= 0) {
          const s = participants[index];
          // Smart merge: retain highest progress, scores, and latest updates
          const mergedRound1 = Math.max(local.round1Score ?? 0, s.round1Score ?? 0);
          const mergedRound2 = Math.max(local.round2Score ?? 0, s.round2Score ?? 0);
          const mergedRound3 = Math.max(local.round3Score ?? 0, s.round3Score ?? 0);
          const calculatedTotal = mergedRound1 + mergedRound2 + mergedRound3;
          const mergedTotal = Math.max(local.totalScore ?? 0, s.totalScore ?? 0, calculatedTotal);
          const isQualified = s.qualifiedForRound2 !== undefined ? s.qualifiedForRound2 : !!local.qualifiedForRound2;

          participants[index] = {
            ...s,
            ...local,
            registerNumber: regNo || s.registerNumber,
            name: local.name || s.name,
            department: local.department || s.department,
            year: local.year || s.year,
            teamName: local.teamName || s.teamName,
            partnerName: local.partnerName || s.partnerName,
            partnerRegisterNumber: local.partnerRegisterNumber || s.partnerRegisterNumber,
            round1Score: mergedRound1,
            round2Score: mergedRound2,
            round3Score: mergedRound3,
            totalScore: mergedTotal,
            tabViolations: Math.max(local.tabViolations ?? 0, s.tabViolations ?? 0),
            timeUsed: local.timeUsed && local.timeUsed !== '0m 00s' ? local.timeUsed : s.timeUsed,
            timeUsedSeconds: Math.max(local.timeUsedSeconds ?? 0, s.timeUsedSeconds ?? 0),
            qualifiedForRound2: isQualified,
            resultStatus: isQualified ? 'Qualified' : (s.resultStatus || local.resultStatus || 'Draft'),
            status: s.status === 'Completed' || local.status === 'Completed' ? 'Completed' : (s.status || local.status || 'Active'),
            finishingStatus: local.finishingStatus || s.finishingStatus,
            updatedAt: new Date().toISOString()
          };
          modified = true;
        } else {
          // Add new participant from client PC to central database
          participants.unshift({
            id: local.id || `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: local.name || 'Candidate',
            year: local.year || 'III',
            department: local.department || 'IT',
            teamName: local.teamName,
            partnerName: local.partnerName,
            partnerRegisterNumber: local.partnerRegisterNumber,
            round1Score: local.round1Score ?? 0,
            round2Score: local.round2Score ?? 0,
            round3Score: local.round3Score ?? 0,
            totalScore: local.totalScore ?? 0,
            tabViolations: local.tabViolations ?? 0,
            timeUsed: local.timeUsed || '0m 00s',
            timeUsedSeconds: local.timeUsedSeconds || 0,
            status: local.status || 'Active',
            finishingStatus: local.finishingStatus || 'In Progress',
            qualifiedForRound2: !!local.qualifiedForRound2,
            resultStatus: local.resultStatus || 'Draft',
            registeredAt: local.registeredAt || new Date().toISOString(),
            ...local,
            registerNumber: regNo
          });
          modified = true;
        }
      }
    }

    if (modified) {
      saveJsonFile(PARTICIPANTS_FILE, participants);
    }

    return res.json({
      success: true,
      participants,
      deletedIds: deletedParticipants,
      count: participants.length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error during participant sync:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET all participants (accessed by any PC / Admin panel / Leaderboard)
app.get('/api/participants', (req, res) => {
  const delSet = new Set(deletedParticipants.map((d) => String(d).toUpperCase().trim()).filter(Boolean));
  const filtered = participants.filter((p) => {
    const reg = (p.registerNumber || '').toUpperCase().trim();
    const id = (p.id || '').toUpperCase().trim();
    return (!reg || !delSet.has(reg)) && (!id || !delSet.has(id));
  });
  if (filtered.length !== participants.length) {
    participants = filtered;
    saveJsonFile(PARTICIPANTS_FILE, participants);
  }
  res.json({
    success: true,
    participants: filtered,
    deletedIds: deletedParticipants,
    count: filtered.length,
    timestamp: new Date().toISOString()
  });
});

// POST a new participant registration or score update from any PC
app.post('/api/participants', (req, res) => {
  try {
    const record = req.body;
    if (!record || (!record.registerNumber && !record.id)) {
      return res.status(400).json({ success: false, error: 'Participant register number is required' });
    }

    const regNo = (record.registerNumber || '').toUpperCase().trim();
    const recordId = record.id || '';

    // Un-blacklist if re-registering or explicitly updating
    if (regNo || recordId) {
      const prevLen = deletedParticipants.length;
      deletedParticipants = deletedParticipants.filter(
        (id) => id !== regNo && id !== recordId
      );
      if (deletedParticipants.length !== prevLen) {
        saveJsonFile(DELETED_FILE, deletedParticipants);
      }
    }

    const existingIndex = participants.findIndex(
      (p) => (regNo && p.registerNumber && p.registerNumber.toUpperCase() === regNo) || (recordId && p.id === recordId)
    );

    if (existingIndex >= 0) {
      // Merge updates
      participants[existingIndex] = {
        ...participants[existingIndex],
        ...record,
        registerNumber: regNo || participants[existingIndex].registerNumber,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Insert new participant at front
      const newParticipant = {
        id: record.id || `P-${Date.now()}`,
        registeredAt: new Date().toISOString(),
        score: 0,
        round1Score: 0,
        round2Score: 0,
        round3Score: 0,
        totalScore: 0,
        tabViolations: 0,
        timeUsed: '0m 00s',
        timeUsedSeconds: 0,
        status: 'Active',
        ...record,
        registerNumber: regNo
      };
      participants.unshift(newParticipant);
    }

    saveJsonFile(PARTICIPANTS_FILE, participants);

    return res.json({
      success: true,
      participant: existingIndex >= 0 ? participants[existingIndex] : participants[0],
      totalCount: participants.length,
      participants
    });
  } catch (err: any) {
    console.error('Error handling participant POST:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update participant details (by registerNumber or id)
app.put('/api/participants/:idOrRegNo', (req, res) => {
  try {
    const rawTarget = decodeURIComponent(req.params.idOrRegNo || '').trim();
    const targetUpper = rawTarget.toUpperCase();
    const updates = req.body;

    // Un-blacklist if updating
    deletedParticipants = deletedParticipants.filter(
      (id) => id !== targetUpper && id !== rawTarget
    );
    saveJsonFile(DELETED_FILE, deletedParticipants);

    const index = participants.findIndex(
      (p) =>
        (p.registerNumber && p.registerNumber.toUpperCase() === targetUpper) ||
        (p.id && p.id === rawTarget)
    );

    if (index === -1) {
      // Insert if doesn't exist
      const newRecord = {
        id: updates.id || `P-${Date.now()}`,
        ...updates,
        registerNumber: updates.registerNumber || targetUpper,
        updatedAt: new Date().toISOString()
      };
      participants.unshift(newRecord);
      saveJsonFile(PARTICIPANTS_FILE, participants);
      return res.json({ success: true, participant: newRecord, participants });
    }

    participants[index] = {
      ...participants[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveJsonFile(PARTICIPANTS_FILE, participants);

    return res.json({
      success: true,
      participant: participants[index],
      participants
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE participant (by registerNumber OR id)
app.delete('/api/participants/:idOrRegNo', (req, res) => {
  try {
    const rawTarget = decodeURIComponent(req.params.idOrRegNo || '').trim();
    const targetUpper = rawTarget.toUpperCase();

    const toDelete = participants.filter(
      (p) =>
        (p.registerNumber && p.registerNumber.toUpperCase() === targetUpper) ||
        (p.id && p.id === rawTarget) ||
        (p.id && p.id.toUpperCase() === targetUpper)
    );

    participants = participants.filter(
      (p) =>
        (!p.registerNumber || p.registerNumber.toUpperCase() !== targetUpper) &&
        p.id !== rawTarget &&
        (!p.id || p.id.toUpperCase() !== targetUpper)
    );

    // Record tombstones so background multi-PC syncs do not resurrect this record
    toDelete.forEach((p) => {
      if (p.registerNumber) deletedParticipants.push(p.registerNumber.toUpperCase());
      if (p.id) deletedParticipants.push(p.id.toUpperCase());
    });
    if (targetUpper) deletedParticipants.push(targetUpper);
    if (rawTarget) deletedParticipants.push(rawTarget.toUpperCase());
    deletedParticipants = Array.from(
      new Set(deletedParticipants.map((s) => String(s).toUpperCase().trim()).filter(Boolean))
    );

    saveJsonFile(PARTICIPANTS_FILE, participants);
    saveJsonFile(DELETED_FILE, deletedParticipants);

    return res.json({
      success: true,
      deleted: rawTarget,
      deletedIds: deletedParticipants,
      participants
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST bulk replace / update participants (used for mass qualification or reset)
app.post('/api/participants/bulk', (req, res) => {
  try {
    const { list } = req.body;
    if (Array.isArray(list)) {
      participants = list;
      saveJsonFile(PARTICIPANTS_FILE, participants);
      return res.json({ success: true, count: participants.length, deletedIds: deletedParticipants, participants });
    }
    return res.status(400).json({ success: false, error: 'Invalid list format' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST clear department
app.post('/api/participants/clear-dept', (req, res) => {
  try {
    const { department } = req.body;
    if (department) {
      const removed = participants.filter((p) => p.department === department);
      participants = participants.filter((p) => p.department !== department);

      removed.forEach((p) => {
        if (p.registerNumber) deletedParticipants.push(p.registerNumber.toUpperCase());
        if (p.id) deletedParticipants.push(p.id.toUpperCase());
      });
      deletedParticipants = Array.from(
        new Set(deletedParticipants.map((s) => String(s).toUpperCase().trim()).filter(Boolean))
      );

      saveJsonFile(PARTICIPANTS_FILE, participants);
      saveJsonFile(DELETED_FILE, deletedParticipants);

      return res.json({ success: true, clearedDept: department, deletedIds: deletedParticipants, participants });
    }
    return res.status(400).json({ success: false, error: 'Department code required' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST clear all participants across all departments
app.post('/api/participants/clear-all', (req, res) => {
  try {
    participants.forEach((p) => {
      if (p.registerNumber) deletedParticipants.push(p.registerNumber.toUpperCase());
      if (p.id) deletedParticipants.push(p.id.toUpperCase());
    });
    participants = [];
    deletedParticipants = Array.from(
      new Set(deletedParticipants.map((s) => String(s).toUpperCase().trim()).filter(Boolean))
    );

    saveJsonFile(PARTICIPANTS_FILE, participants);
    saveJsonFile(DELETED_FILE, deletedParticipants);

    return res.json({ success: true, deletedIds: deletedParticipants, participants: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET conclusion status for all departments
app.get('/api/conclusions', (req, res) => {
  res.json({
    success: true,
    conclusions
  });
});

// POST update conclusion state (Conclude Round 1 or Reopen as Draft)
app.post('/api/conclusions', (req, res) => {
  try {
    const updates = req.body;
    conclusions = {
      ...conclusions,
      ...updates
    };
    saveJsonFile(CONCLUSIONS_FILE, conclusions);

    return res.json({
      success: true,
      conclusions
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET custom questions
app.get('/api/questions', (req, res) => {
  res.json({
    success: true,
    questions: customQuestions
  });
});

// POST custom questions
app.post('/api/questions', (req, res) => {
  try {
    const { questions } = req.body;
    if (Array.isArray(questions)) {
      customQuestions = questions;
      saveJsonFile(QUESTIONS_FILE, customQuestions);
      return res.json({ success: true, count: customQuestions.length });
    }
    return res.status(400).json({ success: false, error: 'Questions array required' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// VITE MIDDLEWARE & STATIC SERVING
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Triquetra'26 Central Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Multi-PC Participant Sync API active on /api/participants`);
  });
}

startServer();
