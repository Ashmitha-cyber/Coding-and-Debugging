export type GamePhase = 
  | 'LANDING' 
  | 'BRIEFING' 
  | 'COMPETITION' 
  | 'ROUND_RESULTS' 
  | 'FINAL_RESULTS';

export type Department = 'IT' | 'AIDS' | 'CSBS';

export type YearOfStudy = 'II' | 'III' | 'IV';

export type QuestionLanguage = 'python' | 'javascript';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'debugging' | 'completion' | 'output_correction' | 'logic';

export interface ParticipantInfo {
  name: string;
  registerNumber: string;
  year: YearOfStudy;
  department: Department;
  teamName?: string;
  partnerName?: string;
  partnerRegisterNumber?: string;
  teamRegisterNumber?: string;
  email?: string;
  college?: string;
}

export interface Question {
  id: number;
  round: 1 | 2 | 3;
  questionNumber: number; // 1 to 15 in current round
  title: string;
  category: string;
  type: QuestionType;
  description: string;
  brokenCode: string;
  expectedAnswer: string;
  acceptedAnswers?: string[];
  language: QuestionLanguage;
  difficulty: QuestionDifficulty;
  expectedOutput: string;
  filename: string;
  memoryLimit: string;
  timeLimit: string;
  seqId: string;
  explanation?: string;
}

export interface LevelInfo {
  round: 1 | 2 | 3;
  levelName: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  description: string;
  objective: string;
  totalQuestions: number;
  timeLimitSeconds: number; // 1200 = 20 mins
  levelCode: string;
}

export interface QuestionAnswerState {
  code: string;
  isAnswered: boolean;
  isSubmitted?: boolean;
  isCorrect?: boolean;
}

export interface RoundResult {
  round: 1 | 2 | 3;
  levelName: string;
  score: number; // Out of 15
  totalQuestions: number; // 15
  accuracy: number; // Percentage
  timeRemainingSeconds: number;
  timeUsedSeconds: number;
  tabSwitches: number;
  autoSubmitted?: boolean;
  completedAt?: string;
}

export type PerformanceRank = 
  | 'Arena Master' 
  | 'Senior Debugger' 
  | 'Code Specialist' 
  | 'Bug Hunter';

export interface ParticipantRecord {
  id?: string;
  name: string;
  registerNumber: string;
  year?: YearOfStudy | string;
  college?: string;
  department: Department;
  teamName?: string;
  partnerName?: string;
  partnerRegisterNumber?: string;
  
  // Separate marks for each round & total
  round1Score?: number;
  round2Score?: number;
  round3Score?: number;
  totalScore?: number;
  
  accuracy?: string;
  timeUsed?: string;
  timeUsedSeconds?: number;
  tabViolations?: number;
  
  // Status and result
  status?: 'Active' | 'In Progress' | 'Completed' | 'Disqualified';
  qualifiedForRound2?: boolean; // Ticked manually by admin in leaderboard
  resultStatus?: 'Qualified' | 'Not Qualified' | 'Pending' | 'Disqualified';
  finishingStatus?: string; // e.g. "Finished (12m 30s)", "In Progress"
  registeredAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface AdminSubmission {
  id: string;
  participantName: string;
  registerNumber: string;
  department: Department;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeUsed: string;
  tabViolations: number;
  status: 'Completed' | 'In Progress' | 'Disqualified';
}
