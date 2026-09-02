import { Question, LevelInfo } from '../types';

export const LEVEL_CONFIGS: Record<1 | 2 | 3, LevelInfo> = {
  1: {
    round: 1,
    levelName: 'BUG SCAN',
    subtitle: 'LEVEL 01 // FUNDAMENTALS',
    badge: 'BUG SCAN',
    accentColor: '#00f0ff',
    description: 'Detect bugs, identify syntax & runtime errors, and prove your debugging fundamentals.',
    objective: 'Eliminate fundamental bugs across syntax, indentation, and conditional statements to stabilize the core arena compiler.',
    totalQuestions: 15,
    timeLimitSeconds: 1200, // 20 minutes
    levelCode: 'LVL-01-SCAN'
  },
  2: {
    round: 2,
    levelName: 'CODE REPAIR',
    subtitle: 'LEVEL 02 // LOGIC & RECONSTRUCTION',
    badge: 'CODE REPAIR',
    accentColor: '#ff9e00',
    description: 'Repair broken programs, understand complex logic, and eliminate hidden bugs.',
    objective: 'Reconstruct broken data transformations, recursive routines, dictionary mappings, and sorting algorithms under time pressure.',
    totalQuestions: 15,
    timeLimitSeconds: 1200, // 20 minutes
    levelCode: 'LVL-02-REPAIR'
  },
  3: {
    round: 3,
    levelName: 'BOSS ARENA',
    subtitle: 'LEVEL 03 // MASTER DEBUGGING',
    badge: 'BOSS ARENA',
    accentColor: '#a855f7',
    description: 'Face the hardest debugging challenges and conquer the final arena.',
    objective: 'Tackle advanced algorithms, binary search boundaries, deep cycle detectors, dynamic programming memoization, and complex edge cases.',
    totalQuestions: 15,
    timeLimitSeconds: 1200, // 20 minutes
    levelCode: 'LVL-03-BOSS'
  }
};

// Initial challenge bank is cleared so administrator can configure custom challenges
export const QUESTIONS: Question[] = [];
