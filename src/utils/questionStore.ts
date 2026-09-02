import { Question } from '../types';

const STORAGE_KEY = 'triquetra_custom_questions';
const QUESTIONS_UPDATED_EVENT = 'triquetra_questions_updated';

export const questionStore = {
  // Get all active questions from localStorage (default is empty [] so admin adds questions)
  getAllQuestions(): Question[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load questions from storage', e);
    }
    // Default initial state is empty array
    return [];
  },

  // Fetch questions from central server (/api/questions)
  async fetchServerQuestions(): Promise<Question[]> {
    try {
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.questions));
          window.dispatchEvent(new CustomEvent(QUESTIONS_UPDATED_EVENT, { detail: data.questions }));
          return data.questions;
        }
      }
    } catch (e) {
      // Offline fallback: load local cache
    }
    return this.getAllQuestions();
  },

  // Save full questions array to localStorage and sync to server
  saveQuestions(questions: Question[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      window.dispatchEvent(new CustomEvent(QUESTIONS_UPDATED_EVENT, { detail: questions }));

      // Sync with central backend server
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      }).catch((err) => console.warn('Failed to sync questions to server', err));
    } catch (e) {
      console.error('Failed to save questions to storage', e);
    }
  },

  // Add a new question
  addQuestion(question: Omit<Question, 'id' | 'seqId'> & { id?: number }): Question {
    const all = this.getAllQuestions();
    const newId = question.id || (all.length > 0 ? Math.max(...all.map((q) => q.id)) + 1 : 1);
    const seqId = `Q-${question.round}-${Math.floor(1000 + Math.random() * 9000)}`;

    const questionsInRound = all.filter((q) => q.round === question.round);
    const questionNumber = question.questionNumber || questionsInRound.length + 1;

    const newQuestion: Question = {
      id: newId,
      round: question.round,
      questionNumber: questionNumber,
      title: question.title || `Challenge #${questionNumber}`,
      category: question.category || 'General Bug',
      type: question.type || 'debugging',
      description: question.description || '',
      brokenCode: question.brokenCode || '',
      expectedAnswer: question.expectedAnswer || '',
      acceptedAnswers: question.acceptedAnswers || [],
      language: question.language || 'python',
      difficulty: question.difficulty || 'medium',
      expectedOutput: question.expectedOutput || 'Execution Completed',
      filename: question.filename || `module_${questionNumber}.${question.language === 'python' ? 'py' : 'js'}`,
      memoryLimit: question.memoryLimit || '64MB',
      timeLimit: question.timeLimit || '1000ms',
      seqId: seqId,
      explanation: question.explanation || ''
    };

    const updated = [...all, newQuestion];
    this.saveQuestions(updated);
    return newQuestion;
  },

  // Update an existing question
  updateQuestion(id: number, updates: Partial<Question>): boolean {
    const all = this.getAllQuestions();
    const index = all.findIndex((q) => q.id === id);
    if (index === -1) return false;

    all[index] = { ...all[index], ...updates };
    this.saveQuestions(all);
    return true;
  },

  // Delete a question by ID
  deleteQuestion(id: number): boolean {
    const all = this.getAllQuestions();
    const filtered = all.filter((q) => q.id !== id);
    if (filtered.length === all.length) return false;

    this.saveQuestions(filtered);
    return true;
  },

  // Clear all questions completely across all rounds
  clearAllQuestions(): Question[] {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent(QUESTIONS_UPDATED_EVENT, { detail: [] }));

      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: [] })
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to clear questions', e);
    }
    return [];
  },

  // Reset to empty challenge bank
  resetToDefaults(): Question[] {
    return this.clearAllQuestions();
  },

  // Import questions from JSON
  importQuestions(imported: any[]): { success: boolean; count: number; error?: string } {
    try {
      if (!Array.isArray(imported)) {
        return { success: false, count: 0, error: 'Expected an array of question objects' };
      }

      const validQuestions: Question[] = [];
      let currentMaxId = this.getAllQuestions().reduce((max, q) => Math.max(max, q.id), 0);

      for (let i = 0; i < imported.length; i++) {
        const item = imported[i];
        if (!item.title || !item.brokenCode || !item.expectedAnswer) {
          continue; // Skip invalid items
        }

        currentMaxId++;
        validQuestions.push({
          id: typeof item.id === 'number' ? item.id : currentMaxId,
          round: item.round === 2 ? 2 : item.round === 3 ? 3 : 1,
          questionNumber: Number(item.questionNumber) || i + 1,
          title: String(item.title),
          category: item.category || 'General Bug',
          type: item.type || 'debugging',
          description: String(item.description || ''),
          brokenCode: String(item.brokenCode),
          expectedAnswer: String(item.expectedAnswer),
          acceptedAnswers: Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : [],
          language: item.language || 'python',
          difficulty: item.difficulty || 'medium',
          expectedOutput: String(item.expectedOutput || 'Execution Completed'),
          filename: item.filename || `module_${i + 1}.${item.language === 'python' ? 'py' : 'js'}`,
          memoryLimit: item.memoryLimit || '64MB',
          timeLimit: item.timeLimit || '1000ms',
          seqId: item.seqId || `Q-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
          explanation: item.explanation || ''
        });
      }

      this.saveQuestions(validQuestions);
      return { success: true, count: validQuestions.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Failed to import questions' };
    }
  }
};
