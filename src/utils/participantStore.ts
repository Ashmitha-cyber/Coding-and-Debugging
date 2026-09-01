import { ParticipantRecord, Department } from '../types';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  onSnapshot,
  terminate,
  Unsubscribe
} from 'firebase/firestore';

const STORAGE_KEY = 'triquetra_participants';
const CONCLUSIONS_KEY_PREFIX = 'triquetra_round1_concluded';
const PARTICIPANTS_UPDATED_EVENT = 'triquetra_participants_updated';
const CONCLUSIONS_UPDATED_EVENT = 'triquetra_round1_concluded_event';
const FIRESTORE_EXHAUSTED_KEY = 'triquetra_firestore_exhausted_timestamp';
const DELETED_IDS_KEY = 'triquetra_deleted_ids';
const EXHAUSTION_CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface ConclusionsState {
  IT: boolean;
  AIDS: boolean;
  CSBS: boolean;
  global: boolean;
}

function isFirestoreQuotaExhausted(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(FIRESTORE_EXHAUSTED_KEY);
    if (!stored) return false;
    const ts = parseInt(stored, 10);
    if (isNaN(ts)) return stored === 'true';
    if (Date.now() - ts < EXHAUSTION_CACHE_MS) {
      return true;
    }
    localStorage.removeItem(FIRESTORE_EXHAUSTED_KEY);
    return false;
  } catch (_) {
    return false;
  }
}

function markFirestoreExhausted() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FIRESTORE_EXHAUSTED_KEY, Date.now().toString());
    }
  } catch (_) {}
}

function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = (err.code || '').toLowerCase();
  const msg = (err.message || '').toLowerCase();
  return (
    code === 'resource-exhausted' ||
    code === 'permission-denied' ||
    code === 'unavailable' ||
    msg.includes('quota') ||
    msg.includes('resource-exhausted') ||
    msg.includes('exceeded') ||
    msg.includes('maximum backoff')
  );
}

function getDeletedTombstones(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((id: string) => String(id).toUpperCase().trim()));
      }
    }
  } catch (_) {}
  return new Set();
}

function addDeletedTombstone(idOrRegNo: string) {
  if (!idOrRegNo) return;
  try {
    const set = getDeletedTombstones();
    set.add(idOrRegNo.trim().toUpperCase());
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (_) {}
}

function removeDeletedTombstone(idOrRegNo: string) {
  if (!idOrRegNo) return;
  try {
    const set = getDeletedTombstones();
    set.delete(idOrRegNo.trim().toUpperCase());
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (_) {}
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
    if (isFirestoreQuotaExhausted()) {
      this.firestoreDisabled = true;
    } else {
      this.initFirestoreListeners();
    }
  }

  // Gracefully disable Firestore when free daily write quota or rate limit is reached
  private disableFirestore(reason?: string) {
    if (this.firestoreDisabled) return;
    this.firestoreDisabled = true;
    this.firestoreConnected = false;
    markFirestoreExhausted();

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

    if (db) {
      try {
        terminate(db).catch(() => {});
      } catch (_) {}
    }
  }

  // Real-time Firestore snapshot listeners across all PCs
  private initFirestoreListeners() {
    if (this.firestoreDisabled || isFirestoreQuotaExhausted()) {
      this.firestoreDisabled = true;
      return;
    }

    try {
      if (!db) {
        return;
      }

      // 1. Live Real-time listener for all participants across all workstations
      const participantsCol = collection(db, 'participants');
      this.firestoreParticipantsUnsub = onSnapshot(
        participantsCol,
        (snapshot) => {
          this.firestoreConnected = true;
          const firestoreList: ParticipantRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ParticipantRecord;
            if (data && (data.registerNumber || data.id)) {
              firestoreList.push(data);
            }
          });

          if (firestoreList.length > 0) {
            // Merge with local cache & update
            const cached = this.getCachedParticipants();
            const map = new Map<string, ParticipantRecord>();
            cached.forEach((p) => {
              const k = (p.registerNumber || p.id || '').toUpperCase().trim();
              if (k) map.set(k, p);
            });
            firestoreList.forEach((p) => {
              const k = (p.registerNumber || p.id || '').toUpperCase().trim();
              if (k) {
                const ex = map.get(k);
                map.set(k, ex ? { ...ex, ...p } : p);
              }
            });
            const merged = Array.from(map.values());
            this.setLocalCache(merged);

            // Sync to central Express backend in background so local JSON file is also in sync
            fetch('/api/participants/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ localParticipants: merged })
            }).catch(() => {});
          }
        },
        (error) => {
          if (isQuotaError(error)) {
            this.disableFirestore('daily write/read quota reached');
          } else {
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
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      );
    } catch (e: any) {
      if (isQuotaError(e)) {
        this.disableFirestore(e?.message || 'initialization notice');
      }
    }
  }

  // Get cached participants synchronously from localStorage (filtered by tombstones)
  getCachedParticipants(): ParticipantRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const tombstones = getDeletedTombstones();
          if (tombstones.size === 0) return parsed;
          return parsed.filter((p) => {
            const reg = (p.registerNumber || '').toUpperCase().trim();
            const id = (p.id || '').toUpperCase().trim();
            return (!reg || !tombstones.has(reg)) && (!id || !tombstones.has(id));
          });
        }
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
      const tombstones = getDeletedTombstones();
      const sanitized = tombstones.size > 0
        ? participants.filter((p) => {
            const reg = (p.registerNumber || '').toUpperCase().trim();
            const id = (p.id || '').toUpperCase().trim();
            return (!reg || !tombstones.has(reg)) && (!id || !tombstones.has(id));
          })
        : participants;

      const prevJson = localStorage.getItem(STORAGE_KEY);
      const newJson = JSON.stringify(sanitized);
      if (prevJson === newJson) {
        return; // Avoid unnecessary re-renders, disk churn, or event loops
      }
      localStorage.setItem(STORAGE_KEY, newJson);
      window.dispatchEvent(new CustomEvent(PARTICIPANTS_UPDATED_EVENT, { detail: sanitized }));
    } catch (e) {
      console.error('Failed to set local participants cache', e);
    }
  }

  // Set conclusion local cache
  private setConclusionsCache(conclusions: ConclusionsState) {
    try {
      const prevIt = localStorage.getItem(`${CONCLUSIONS_KEY_PREFIX}_IT`);
      const prevAids = localStorage.getItem(`${CONCLUSIONS_KEY_PREFIX}_AIDS`);
      const prevCsbs = localStorage.getItem(`${CONCLUSIONS_KEY_PREFIX}_CSBS`);
      const prevGlobal = localStorage.getItem(CONCLUSIONS_KEY_PREFIX);

      const nextIt = String(conclusions.IT);
      const nextAids = String(conclusions.AIDS);
      const nextCsbs = String(conclusions.CSBS);
      const nextGlobal = String(conclusions.global);

      if (prevIt === nextIt && prevAids === nextAids && prevCsbs === nextCsbs && prevGlobal === nextGlobal) {
        return;
      }

      localStorage.setItem(`${CONCLUSIONS_KEY_PREFIX}_IT`, nextIt);
      localStorage.setItem(`${CONCLUSIONS_KEY_PREFIX}_AIDS`, nextAids);
      localStorage.setItem(`${CONCLUSIONS_KEY_PREFIX}_CSBS`, nextCsbs);
      localStorage.setItem(CONCLUSIONS_KEY_PREFIX, nextGlobal);
      window.dispatchEvent(new CustomEvent(CONCLUSIONS_UPDATED_EVENT, { detail: conclusions }));
    } catch (e) {}
  }

  // Full bidirectional sync: merges local cache + server + firestore
  async syncWithServer(): Promise<ParticipantRecord[]> {
    if (this.isSyncing) {
      return this.getCachedParticipants();
    }

    this.isSyncing = true;
    try {
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
          const tombstones = getDeletedTombstones();
          const cleanServerList = data.participants.filter((p: ParticipantRecord) => {
            const reg = (p.registerNumber || '').toUpperCase().trim();
            const id = (p.id || '').toUpperCase().trim();
            return (!reg || !tombstones.has(reg)) && (!id || !tombstones.has(id));
          });
          this.setLocalCache(cleanServerList);
          return cleanServerList;
        }
      }
    } catch (e) {
      // Offline fallback to local cache
    } finally {
      this.isSyncing = false;
    }
    return this.getCachedParticipants();
  }

  // Fetch all participants from BOTH Firestore and Central Server, merging seamlessly
  async fetchAllParticipants(): Promise<ParticipantRecord[]> {
    const tombstones = getDeletedTombstones();

    let serverList: ParticipantRecord[] | null = null;
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
          serverList = data.participants.filter((p: ParticipantRecord) => {
            const reg = (p.registerNumber || '').toUpperCase().trim();
            const id = (p.id || '').toUpperCase().trim();
            return (!reg || !tombstones.has(reg)) && (!id || !tombstones.has(id));
          });
        }
      }
    } catch (e) {
      console.warn('Server fetch notice:', e);
    }

    if (serverList !== null) {
      this.setLocalCache(serverList);
      return serverList;
    }

    return this.getCachedParticipants();
  }

  // Fetch conclusions state from server & Firestore
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

  // Register or Update a participant record (Writes to Local Cache + Central Server + Firestore in parallel)
  async registerOrUpdate(record: Partial<ParticipantRecord> & { registerNumber: string }): Promise<ParticipantRecord> {
    const regNo = record.registerNumber.toUpperCase().trim();
    if (regNo) removeDeletedTombstone(regNo);
    if (record.id) removeDeletedTombstone(record.id);

    const cached = this.getCachedParticipants();
    const existingIndex = cached.findIndex(
      (p) => (p.registerNumber && p.registerNumber.toUpperCase() === regNo) || (record.id && p.id === record.id)
    );

    let targetRecord: ParticipantRecord;
    let updatedList: ParticipantRecord[];

    if (existingIndex >= 0) {
      targetRecord = {
        ...cached[existingIndex],
        ...record,
        registerNumber: regNo,
        updatedAt: new Date().toISOString()
      };
      updatedList = [...cached];
      updatedList[existingIndex] = targetRecord;
    } else {
      targetRecord = {
        id: record.id || `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: record.name || 'Candidate',
        registerNumber: regNo,
        year: record.year || 'III',
        department: record.department || 'IT',
        teamName: record.teamName,
        partnerName: record.partnerName,
        partnerRegisterNumber: record.partnerRegisterNumber ? record.partnerRegisterNumber.toUpperCase().trim() : undefined,
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

    // 1. Immediate local cache update for snappy UI
    this.setLocalCache(updatedList);

    // 2. Parallel Dual Sync to Central Server API + Firestore
    const cleanData = sanitizeForFirestore(targetRecord);
    const docId = safeDocId(targetRecord.registerNumber, targetRecord.id);

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          await setDoc(doc(db, 'participants', docId), cleanData, { merge: true });
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached on write');
          }
        }
      }
    })();

    const serverPromise = (async () => {
      try {
        const res = await fetch('/api/participants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetRecord)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.participants)) {
            const tombstones = getDeletedTombstones();
            const cleanServer = data.participants.filter((p: ParticipantRecord) => {
              const r = (p.registerNumber || '').toUpperCase().trim();
              const i = (p.id || '').toUpperCase().trim();
              return (!r || !tombstones.has(r)) && (!i || !tombstones.has(i));
            });
            this.setLocalCache(cleanServer);
          }
        }
      } catch (e) {
        console.warn('Server API sync notice:', e);
      }
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
    return targetRecord;
  }

  // Update specific participant by register number
  async updateParticipant(regNo: string, updates: Partial<ParticipantRecord>): Promise<boolean> {
    const upperReg = regNo.toUpperCase().trim();
    if (upperReg) removeDeletedTombstone(upperReg);

    const cached = this.getCachedParticipants();
    const updated = cached.map((p) =>
      p.registerNumber.toUpperCase() === upperReg ? { ...p, ...updates, registerNumber: upperReg } : p
    );
    this.setLocalCache(updated);

    const docId = safeDocId(upperReg);
    const cleanData = sanitizeForFirestore(updates);

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          await setDoc(doc(db, 'participants', docId), cleanData, { merge: true });
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      }
    })();

    const serverPromise = (async () => {
      try {
        const res = await fetch(`/api/participants/${encodeURIComponent(upperReg)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.participants)) {
            const tombstones = getDeletedTombstones();
            const cleanServer = data.participants.filter((p: ParticipantRecord) => {
              const r = (p.registerNumber || '').toUpperCase().trim();
              const i = (p.id || '').toUpperCase().trim();
              return (!r || !tombstones.has(r)) && (!i || !tombstones.has(i));
            });
            this.setLocalCache(cleanServer);
          }
        }
      } catch (e) {
        console.error('Failed to PUT participant to server', e);
      }
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
    return true;
  }

  // Delete participant
  async deleteParticipant(regNoOrId: string): Promise<boolean> {
    const rawTarget = (regNoOrId || '').trim();
    const upperTarget = rawTarget.toUpperCase();
    if (rawTarget) addDeletedTombstone(rawTarget);
    if (upperTarget) addDeletedTombstone(upperTarget);

    const cached = this.getCachedParticipants();
    const updated = cached.filter(
      (p) =>
        (!p.registerNumber || p.registerNumber.toUpperCase() !== upperTarget) &&
        p.id !== rawTarget &&
        (!p.id || p.id.toUpperCase() !== upperTarget)
    );
    this.setLocalCache(updated);

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          const docId = safeDocId(upperTarget, rawTarget);
          await deleteDoc(doc(db, 'participants', docId));
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      }
    })();

    const serverPromise = (async () => {
      try {
        const res = await fetch(`/api/participants/${encodeURIComponent(rawTarget)}`, {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.participants)) {
            const tombstones = getDeletedTombstones();
            const cleanServer = data.participants.filter((p: ParticipantRecord) => {
              const r = (p.registerNumber || '').toUpperCase().trim();
              const i = (p.id || '').toUpperCase().trim();
              return (!r || !tombstones.has(r)) && (!i || !tombstones.has(i));
            });
            this.setLocalCache(cleanServer);
          }
        }
      } catch (e) {
        console.error('Failed to DELETE participant', e);
      }
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
    return true;
  }

  // Clear all participants across all departments
  async clearAllParticipants(): Promise<boolean> {
    const cached = this.getCachedParticipants();
    cached.forEach((p) => {
      if (p.registerNumber) addDeletedTombstone(p.registerNumber);
      if (p.id) addDeletedTombstone(p.id);
    });
    this.setLocalCache([]);

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          const batch = writeBatch(db);
          cached.slice(0, 100).forEach((p) => {
            const docId = safeDocId(p.registerNumber, p.id);
            batch.delete(doc(db, 'participants', docId));
          });
          await batch.commit();
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      }
    })();

    const serverPromise = (async () => {
      try {
        const res = await fetch('/api/participants/clear-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.participants)) {
            this.setLocalCache(data.participants);
          }
        }
      } catch (e) {
        console.error('Failed to clear all participants', e);
      }
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
    return true;
  }

  // Save bulk participants (e.g. conclusion qualification update)
  async saveBulkParticipants(list: ParticipantRecord[]): Promise<boolean> {
    list.forEach((p) => {
      if (p.registerNumber) removeDeletedTombstone(p.registerNumber);
      if (p.id) removeDeletedTombstone(p.id);
    });
    this.setLocalCache(list);

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          const batch = writeBatch(db);
          list.slice(0, 50).forEach((p) => {
            const docId = safeDocId(p.registerNumber, p.id);
            const clean = sanitizeForFirestore(p);
            batch.set(doc(db, 'participants', docId), clean, { merge: true });
          });
          await batch.commit();
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      }
    })();

    const serverPromise = (async () => {
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
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
    return true;
  }

  // Import external JSON list and merge with database
  async importAndMergeParticipants(newRecords: ParticipantRecord[]): Promise<ParticipantRecord[]> {
    newRecords.forEach((p) => {
      if (p.registerNumber) removeDeletedTombstone(p.registerNumber);
      if (p.id) removeDeletedTombstone(p.id);
    });
    const existing = this.getCachedParticipants();
    const map = new Map<string, ParticipantRecord>();
    existing.forEach((p) => map.set((p.registerNumber || p.id).toUpperCase(), p));
    newRecords.forEach((p) => map.set((p.registerNumber || p.id).toUpperCase(), p));
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
    const toDelete = cached.filter((p) => p.department === department);
    toDelete.forEach((p) => {
      if (p.registerNumber) addDeletedTombstone(p.registerNumber);
      if (p.id) addDeletedTombstone(p.id);
    });
    const updated = cached.filter((p) => p.department !== department);
    this.setLocalCache(updated);

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          const batch = writeBatch(db);
          toDelete.slice(0, 100).forEach((p) => {
            const docId = safeDocId(p.registerNumber, p.id);
            batch.delete(doc(db, 'participants', docId));
          });
          await batch.commit();
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      }
    })();

    const serverPromise = (async () => {
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
        console.error('Failed to clear department participants', e);
      }
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
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

    const firestorePromise = (async () => {
      if (db && !this.firestoreDisabled && !isFirestoreQuotaExhausted()) {
        try {
          const clean = sanitizeForFirestore(updated);
          await setDoc(doc(db, 'system_state', 'conclusions'), clean, { merge: true });
        } catch (err: any) {
          if (isQuotaError(err)) {
            this.disableFirestore('quota reached');
          }
        }
      }
    })();

    const serverPromise = (async () => {
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
          }
        }
      } catch (e) {
        console.error('Failed to save conclusions', e);
      }
    })();

    await Promise.allSettled([firestorePromise, serverPromise]);
    return updated;
  }

  // Start periodic polling
  startPolling(intervalMs: number = 2500): () => void {
    this.fetchAllParticipants();
    this.fetchConclusions();

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.fetchAllParticipants();
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

