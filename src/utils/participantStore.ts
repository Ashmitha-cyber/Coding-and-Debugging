import { ParticipantRecord, Department } from '../types';

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

class ParticipantStore {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isFetching = false;
  private lastFetchTime = 0;

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

  // Save to local cache and trigger event
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

  // Fetch all participants from central server
  async fetchAllParticipants(): Promise<ParticipantRecord[]> {
    if (this.isFetching) {
      return this.getCachedParticipants();
    }

    this.isFetching = true;
    try {
      const res = await fetch('/api/participants', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.participants)) {
          this.setLocalCache(data.participants);
          this.lastFetchTime = Date.now();
          return data.participants;
        }
      }
    } catch (e) {
      // Fallback to local cache if network/offline
      console.warn('Network issue fetching participants from server, using cache', e);
    } finally {
      this.isFetching = false;
    }
    return this.getCachedParticipants();
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
      console.warn('Error fetching conclusions from server', e);
    }
    return this.getCachedConclusions();
  }

  // Register or Update a participant record (Sends to Server + updates local cache)
  async registerOrUpdate(record: Partial<ParticipantRecord> & { registerNumber: string }): Promise<ParticipantRecord> {
    // 1. Update local cache immediately for optimistic UI
    const cached = this.getCachedParticipants();
    const regNo = record.registerNumber.toUpperCase().trim();
    const existingIndex = cached.findIndex(
      p => (p.registerNumber && p.registerNumber.toUpperCase() === regNo) || (record.id && p.id === record.id)
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
        id: record.id || `P-${Date.now()}`,
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
        registeredAt: record.registeredAt || new Date().toISOString(),
        ...record
      };
      updatedList = [targetRecord, ...cached];
    }

    this.setLocalCache(updatedList);

    // 2. Broadcast to Central Server so other PCs receive it immediately
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
          return data.participant || targetRecord;
        }
      }
    } catch (e) {
      console.error('Server sync failed for participant POST, will retry on next poll', e);
    }

    return targetRecord;
  }

  // Update specific participant by register number
  async updateParticipant(regNo: string, updates: Partial<ParticipantRecord>): Promise<boolean> {
    const cached = this.getCachedParticipants();
    const upperReg = regNo.toUpperCase().trim();
    const updated = cached.map(p =>
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
      return true;
    } catch (e) {
      console.error('Failed to PUT participant', e);
      return false;
    }
  }

  // Delete participant
  async deleteParticipant(regNo: string): Promise<boolean> {
    const cached = this.getCachedParticipants();
    const upperReg = regNo.toUpperCase().trim();
    const updated = cached.filter(p => p.registerNumber.toUpperCase() !== upperReg);
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
      return true;
    } catch (e) {
      console.error('Failed to DELETE participant', e);
      return false;
    }
  }

  // Save bulk participants (e.g. conclusion qualification update or clear)
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
      return true;
    } catch (e) {
      console.error('Failed to save bulk participants', e);
      return false;
    }
  }

  // Clear department participants
  async clearDepartment(department: Department): Promise<boolean> {
    const cached = this.getCachedParticipants();
    const updated = cached.filter(p => p.department !== department);
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
      return true;
    } catch (e) {
      console.error('Failed to clear department', e);
      return false;
    }
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
    return updated;
  }

  // Start periodic polling to sync from all PCs
  startPolling(intervalMs: number = 2500): () => void {
    // Initial fetch
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
    };
  }
}

export const participantStore = new ParticipantStore();
