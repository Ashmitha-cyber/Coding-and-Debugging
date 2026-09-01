import { Question } from '../types';
import { QUESTIONS as DEFAULT_QUESTIONS } from '../data/questions';

const STORAGE_KEY = 'triquetra_custom_questions';
const QUESTIONS_UPDATED_EVENT = 'triquetra_questions_updated';

export const questionStore = {
  // Get all active questions (from localStorage or defaults)
  getAllQuestions(): Question[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load custom questions from storage', e);
    }
    return DEFAULT_QUESTIONS;
  },

  // Fetch questions from central server
  async fetchServerQuestions(): Promise<Question[]> {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.questions));
          window.dispatchEvent(new CustomEvent(QUESTIONS_UPDATED_EVENT, { detail: data.questions }));
          return data.questions;
        }
      }
    } catch (e) {
      // Ignore network errors and use local cache
    }
    return this.getAllQuestions();
  },

  // Save full questions array
  saveQuestions(questions: Question[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      window.dispatchEvent(new CustomEvent(QUESTIONS_UPDATED_EVENT, { detail: questions }));

      // Sync with server in background
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      }).catch(err => console.warn('Failed to sync questions to server', err));
    } catch (e) {
      console.error('Failed to save questions to storage', e);
    }
  },

  // Add a new question
  addQuestion(question: Omit<Question, 'id' | 'seqId'>): Question {
    const all = this.getAllQuestions();
    const newId = all.length > 0 ? Math.max(...all.map(q => q.id)) + 1 : 1;
    const seqId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    const newQuestion: Question = {
      ...question,
      id: newId,
      seqId,
      filename: question.filename || `custom_module_${newId}.${question.language === 'python' ? 'py' : 'js'}`,
      memoryLimit: question.memoryLimit || '64MB',
      timeLimit: question.timeLimit || '1000ms'
    };

    const updated = [...all, newQuestion];
    this.saveQuestions(updated);
    return newQuestion;
  },

  // Update an existing question
  updateQuestion(id: number, updates: Partial<Question>): boolean {
    const all = this.getAllQuestions();
    const index = all.findIndex(q => q.id === id);
    if (index === -1) return false;

    all[index] = { ...all[index], ...updates };
    this.saveQuestions(all);
    return true;
  },

  // Delete a question
  deleteQuestion(id: number): boolean {
    const all = this.getAllQuestions();
    const filtered = all.filter(q => q.id !== id);
    if (filtered.length === all.length) return false;

    this.saveQuestions(filtered);
    return true;
  },

  // Reset to default standard questions
  resetToDefaults(): Question[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(QUESTIONS_UPDATED_EVENT, { detail: DEFAULT_QUESTIONS }));
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: [] })
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to reset questions', e);
    }
    return DEFAULT_QUESTIONS;
  }
};
