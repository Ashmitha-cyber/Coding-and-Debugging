import { ParticipantRecord, Department } from '../types';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

const STORAGE_KEY = 'triquetra_participants';
const CONCLUSIONS_KEY_PREFIX = 'triquetra_round1_concluded';
const PARTICIPANTS_UPDATED_EVENT = 'triquetra_participants_updated';
const CONCLUSIONS_UPDATED_EVENT = 'triquetra_round1_concluded_event';

export interface ConclusionsState {
  IT: boolean;
  AIDS: boolean;
  CSBS: boolean;
  global: boolean;
}

// Strip undefined fields because Firestore rejects undefined property values
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

function safeDocId(regNo: string, fallbackId?: string): string {
  const base = regNo ? regNo.trim().toUpperCase() : fallbackId || `ID_${Date.now()}`;
  return base.replace(/[^a-zA-Z0-9_-]/g, '_');
}

class ParticipantStore {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private firestoreParticipantsUnsub: Unsubscribe | null = null;
  private firestoreConclusionsUnsub: Unsubscribe | null = null;
  public firestoreConnected = false;
  public firestoreDisabled = false;

  constructor() {
    this.initFirestoreListeners();
  }

  // Gracefully disable Firestore when free daily write quota or rate limit is reached
  private disableFirestore(reason?: string) {
    if (this.firestoreDisabled) return;
    this.firestoreDisabled = true;
    this.firestoreConnected = false;
    if (reason) {
      console.warn(`[ParticipantStore] Firestore real-time listener suspended (${reason}). Seamlessly operating via central Express backend & local cache.`);
    }
    if (this.firestoreParticipantsUnsub) {
      try {
        this.firestoreParticipantsUnsub();
      } catch (_) {}
      this.firestoreParticipantsUnsub = null;
    }
    if (this.firestoreConclusionsUnsub) {
      try {
        this.firestoreConclusionsUnsub();
      } catch (_) {}
      this.firestoreConclusionsUnsub = null;
    }
  }

  // Real-time Firestore snapshot listeners across all PCs
  private initFirestoreListeners() {
    if (this.firestoreDisabled) return;

    try {
      if (!db) {
        return;
      }

      // 1. Live Real-time listener for all participants across all computers
      const participantsCol = collection(db, 'participants');
      this.firestoreParticipantsUnsub = onSnapshot(
        participantsCol,
        (snapshot) => {
          this.firestoreConnected = true;
          const firestoreList: ParticipantRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ParticipantRecord;
            if (data && data.registerNumber) {
              firestoreList.push(data);
            }
          });

          if (firestoreList.length > 0) {
            // Merge with local cache & update
            const cached = this.getCachedParticipants();
            const map = new Map<string, ParticipantRecord>();
            cached.forEach((p) => map.set(p.registerNumber.toUpperCase(), p));
            firestoreList.forEach((p) => map.set(p.registerNumber.toUpperCase(), p));
            const merged = Array.from(map.values());
            this.setLocalCache(merged);
          }
        },
        (error) => {
          const msg = error?.message || '';
          const code = (error as any)?.code || '';
          if (code === 'resource-exhausted' || msg.includes('Quota') || msg.includes('quota') || msg.includes('resource-exhausted')) {
            this.disableFirestore('daily write/read quota reached');
          } else {
            console.warn('Firestore snapshot notice (syncing via central server):', msg);
            this.firestoreConnected = false;
          }
        }
      );

      // 2. Live listener for system state & round conclusions
      const conclusionsDoc = doc(db, 'system_state', 'conclusions');
      this.firestoreConclusionsUnsub = onSnapshot(
        conclusionsDoc,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const state: ConclusionsState = {
              IT: !!data.IT,
              AIDS: !!data.AIDS,
              CSBS: !!data.CSBS,
              global: !!data.global
            };
            this.setConclusionsCache(state);
          }
        },
        (err) => {
          const msg = err?.message || '';
          const code = (err as any)?.code || '';
          if (code === 'resource-exhausted' || msg.includes('Quota') || msg.includes('quota')) {
            this.disableFirestore('quota reached');
          }
        }
      );
    } catch (e: any) {
      this.disableFirestore(e?.message || 'initialization notice');
    }
  }

  // Get cached participants synchronously from localStorage
  getCachedParticipants(): ParticipantRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to read cached participants', e);
    }
    return [];
  }

  // Get cached conclusions
  getCachedConclusions(): ConclusionsState {
    try {
      const itConcluded = localStorage.getItem(`${CONCLUSIONS_KEY_PREFIX}_IT`) === 'true';
      const aidsConcluded = localStorage.getItem(`${CONCLUSIONS_KEY_PREFIX}_AIDS`) === 'true';
      const csbsConcluded = localStorage.getItem(`${CONCLUSIONS_KEY_PREFIX}_CSBS`) === 'true';
      const globalConcluded = localStorage.getItem(CONCLUSIONS_KEY_PREFIX) === 'true';

      return {
        IT: itConcluded || globalConcluded,
        AIDS: aidsConcluded || globalConcluded,
        CSBS: csbsConcluded || globalConcluded,
        global: globalConcluded
      };
    } catch (e) {
      return { IT: false, AIDS: false, CSBS: false, global: false };
    }
  }

  // Save to local cache and trigger UI event
  private setLocalCache(participants: ParticipantRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
      window.dispatchEvent(new CustomEvent(PARTICIPANTS_UPDATED_EVENT, { detail: participants }));
    } catch (e) {
      console.error('Failed to set local participants cache', e);
    }
  }

  // Set conclusion local cache
  private setConclusionsCache(conclusions: ConclusionsState) {
    try {
      localStorage.setItem(`${CONCLUSIONS_KEY_PREFIX}_IT`, String(conclusions.IT));
      localStorage.setItem(`${CONCLUSIONS_KEY_PREFIX}_AIDS`, String(conclusions.AIDS));
      localStorage.setItem(`${CONCLUSIONS_KEY_PREFIX}_CSBS`, String(conclusions.CSBS));
      localStorage.setItem(CONCLUSIONS_KEY_PREFIX, String(conclusions.global));
      window.dispatchEvent(new CustomEvent(CONCLUSIONS_UPDATED_EVENT, { detail: conclusions }));
    } catch (e) {}
  }

  // Full bidirectional sync: uploads this PC's local cache & downloads all other PCs' candidates
  async syncWithServer(): Promise<ParticipantRecord[]> {
    if (this.isSyncing) {
      return this.getCachedParticipants();
    }

    this.isSyncing = true;
    try {
      // Server API sync (persisted to server file data/participants.json)
      const localParticipants = this.getCachedParticipants();
      const res = await fetch('/api/participants/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ localParticipants })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
          return data.participants;
        }
      }
    } catch (e) {
      // Offline fallback to local cache
    } finally {
      this.isSyncing = false;
    }
    return this.getCachedParticipants();
  }

  // Fetch all participants directly from central server (accessible by any PC / Admin panel)
  async fetchAllParticipants(): Promise<ParticipantRecord[]> {
    try {
      const res = await fetch('/api/participants', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
          return data.participants;
        }
      }
    } catch (e) {
      console.warn('Direct fetch from /api/participants failed, attempting sync', e);
    }
    return this.syncWithServer();
  }

  // Fetch conclusions state from server
  async fetchConclusions(): Promise<ConclusionsState> {
    try {
      const res = await fetch('/api/conclusions', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conclusions) {
          const state: ConclusionsState = {
            IT: !!data.conclusions.IT,
            AIDS: !!data.conclusions.AIDS,
            CSBS: !!data.conclusions.CSBS,
            global: !!data.conclusions.global
          };
          this.setConclusionsCache(state);
          return state;
        }
      }
    } catch (e) {
      // Ignore network errors
    }
    return this.getCachedConclusions();
  }

  // Register or Update a participant record (Writes to Local Cache + Central Server + Firestore if active)
  async registerOrUpdate(record: Partial<ParticipantRecord> & { registerNumber: string }): Promise<ParticipantRecord> {
    // 1. Update local cache immediately for instant UI response
    const cached = this.getCachedParticipants();
    const regNo = record.registerNumber.toUpperCase().trim();
    const existingIndex = cached.findIndex(
      (p) => (p.registerNumber && p.registerNumber.toUpperCase() === regNo) || (record.id && p.id === record.id)
    );

    let updatedList: ParticipantRecord[];
    let targetRecord: ParticipantRecord;

    if (existingIndex >= 0) {
      targetRecord = {
        ...cached[existingIndex],
        ...record,
        registerNumber: regNo
      };
      updatedList = [...cached];
      updatedList[existingIndex] = targetRecord;
    } else {
      targetRecord = {
        id: record.id || `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: record.name || 'Anonymous Candidate',
        registerNumber: regNo,
        year: record.year || 'III',
        department: record.department || 'IT',
        teamName: record.teamName,
        partnerName: record.partnerName,
        partnerRegisterNumber: record.partnerRegisterNumber,
        round1Score: record.round1Score ?? 0,
        round2Score: record.round2Score ?? 0,
        round3Score: record.round3Score ?? 0,
        totalScore: record.totalScore ?? 0,
        accuracy: record.accuracy || '0%',
        timeUsed: record.timeUsed || '0m 00s',
        timeUsedSeconds: record.timeUsedSeconds || 0,
        tabViolations: record.tabViolations || 0,
        status: record.status || 'Active',
        finishingStatus: record.finishingStatus || 'In Progress',
        registeredAt: record.registeredAt || new Date().toISOString(),
        ...record
      };
      updatedList = [targetRecord, ...cached];
    }

    this.setLocalCache(updatedList);

    // 2. Broadcast to Central Server API (Reliable server persistence)
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetRecord)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
        }
      }
    } catch (e) {
      console.warn('Server API sync notice:', e);
    }

    // 3. Write to Firestore if connected and not exhausted
    if (db && !this.firestoreDisabled) {
      try {
        const docId = safeDocId(targetRecord.registerNumber, targetRecord.id);
        const cleanData = sanitizeForFirestore(targetRecord);
        setDoc(doc(db, 'participants', docId), cleanData, { merge: true }).catch((err) => {
          const msg = err?.message || '';
          if (err?.code === 'resource-exhausted' || msg.includes('Quota') || msg.includes('quota')) {
            this.disableFirestore('quota reached on write');
          }
        });
      } catch (err: any) {
        this.disableFirestore(err?.message);
      }
    }

    return targetRecord;
  }

  // Update specific participant by register number
  async updateParticipant(regNo: string, updates: Partial<ParticipantRecord>): Promise<boolean> {
    const cached = this.getCachedParticipants();
    const upperReg = regNo.toUpperCase().trim();
    const updated = cached.map((p) =>
      p.registerNumber.toUpperCase() === upperReg ? { ...p, ...updates, registerNumber: upperReg } : p
    );
    this.setLocalCache(updated);

    try {
      const res = await fetch(`/api/participants/${encodeURIComponent(upperReg)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
        }
      }
    } catch (e) {
      console.error('Failed to PUT participant to server', e);
    }

    // Optional Firestore update
    if (db && !this.firestoreDisabled) {
      try {
        const docId = safeDocId(upperReg);
        const cleanData = sanitizeForFirestore(updates);
        setDoc(doc(db, 'participants', docId), cleanData, { merge: true }).catch((err) => {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
            this.disableFirestore('quota reached');
          }
        });
      } catch (_) {}
    }

    return true;
  }

  // Delete participant
  async deleteParticipant(regNo: string): Promise<boolean> {
    const cached = this.getCachedParticipants();
    const upperReg = regNo.toUpperCase().trim();
    const updated = cached.filter((p) => p.registerNumber.toUpperCase() !== upperReg);
    this.setLocalCache(updated);

    try {
      const res = await fetch(`/api/participants/${encodeURIComponent(upperReg)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
        }
      }
    } catch (e) {
      console.error('Failed to DELETE participant', e);
    }

    // Optional Firestore delete
    if (db && !this.firestoreDisabled) {
      try {
        const docId = safeDocId(upperReg);
        deleteDoc(doc(db, 'participants', docId)).catch(() => {});
      } catch (_) {}
    }

    return true;
  }

  // Save bulk participants (e.g. conclusion qualification update)
  async saveBulkParticipants(list: ParticipantRecord[]): Promise<boolean> {
    this.setLocalCache(list);

    try {
      const res = await fetch('/api/participants/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
        }
      }
    } catch (e) {
      console.error('Failed to save bulk participants', e);
    }

    if (db && !this.firestoreDisabled) {
      try {
        const batch = writeBatch(db);
        list.slice(0, 50).forEach((p) => {
          const docId = safeDocId(p.registerNumber, p.id);
          const clean = sanitizeForFirestore(p);
          batch.set(doc(db, 'participants', docId), clean, { merge: true });
        });
        batch.commit().catch((err) => {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
            this.disableFirestore('quota reached');
          }
        });
      } catch (_) {}
    }

    return true;
  }

  // Import external JSON list and merge with database
  async importAndMergeParticipants(newRecords: ParticipantRecord[]): Promise<ParticipantRecord[]> {
    const existing = this.getCachedParticipants();
    const map = new Map<string, ParticipantRecord>();
    existing.forEach((p) => map.set(p.registerNumber.toUpperCase(), p));
    newRecords.forEach((p) => map.set(p.registerNumber.toUpperCase(), p));
    const merged = Array.from(map.values());

    this.setLocalCache(merged);

    try {
      const res = await fetch('/api/participants/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localParticipants: merged })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
          return data.participants;
        }
      }
    } catch (e) {
      console.error('Failed to import and sync records', e);
    }

    return this.getCachedParticipants();
  }

  // Clear department participants
  async clearDepartment(department: Department): Promise<boolean> {
    const cached = this.getCachedParticipants();
    const updated = cached.filter((p) => p.department !== department);
    this.setLocalCache(updated);

    try {
      const res = await fetch('/api/participants/clear-dept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
        }
      }
    } catch (e) {
      console.error('Failed to clear department', e);
    }

    return true;
  }

  // Update department conclusions
  async saveConclusions(updates: Partial<ConclusionsState>): Promise<ConclusionsState> {
    const current = this.getCachedConclusions();
    const updated: ConclusionsState = {
      ...current,
      ...updates
    };
    this.setConclusionsCache(updated);

    try {
      const res = await fetch('/api/conclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conclusions) {
          const newState: ConclusionsState = {
            IT: !!data.conclusions.IT,
            AIDS: !!data.conclusions.AIDS,
            CSBS: !!data.conclusions.CSBS,
            global: !!data.conclusions.global
          };
          this.setConclusionsCache(newState);
          return newState;
        }
      }
    } catch (e) {
      console.error('Failed to save conclusions', e);
    }

    if (db && !this.firestoreDisabled) {
      try {
        const clean = sanitizeForFirestore(updated);
        setDoc(doc(db, 'system_state', 'conclusions'), clean, { merge: true }).catch((err) => {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
            this.disableFirestore('quota reached');
          }
        });
      } catch (_) {}
    }

    return updated;
  }

  // Start periodic polling
  startPolling(intervalMs: number = 3500): () => void {
    this.syncWithServer();
    this.fetchConclusions();

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.syncWithServer();
      this.fetchConclusions();
    }, intervalMs);

    return () => {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      if (this.firestoreParticipantsUnsub) {
        try {
          this.firestoreParticipantsUnsub();
        } catch (_) {}
        this.firestoreParticipantsUnsub = null;
      }
      if (this.firestoreConclusionsUnsub) {
        try {
          this.firestoreConclusionsUnsub();
        } catch (_) {}
        this.firestoreConclusionsUnsub = null;
      }
    };
  }
}

export const participantStore = new ParticipantStore();
