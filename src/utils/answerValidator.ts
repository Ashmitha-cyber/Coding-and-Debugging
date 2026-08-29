import { Question } from '../types';

export interface ValidationResult {
  isCorrect: boolean;
  output: string;
  error?: string;
  executionStatus: 'SUCCESS' | 'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'LOGIC_ERROR';
}

/**
 * Normalizes code for flexible comparison
 */
export function normalizeCode(code: string): string {
  if (!code) return '';
  return code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd()) // Keep leading indentation, trim trailing space
    .filter(line => !line.trim().startsWith('#')) // Optional comment stripping for core comparison
    .join('\n')
    .trim();
}

/**
 * Checks for common Python syntax errors in user submission
 */
function detectSyntaxErrors(code: string): string | null {
  const lines = code.split('\n');
  
  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const line = lines[idx];
    const trimmed = line.trim();
    
    // Check for loop/if/def/while missing colon
    if (
      (trimmed.startsWith('for ') ||
       trimmed.startsWith('while ') ||
       trimmed.startsWith('if ') ||
       trimmed.startsWith('elif ') ||
       trimmed.startsWith('else') ||
       trimmed.startsWith('def ')) &&
      !trimmed.endsWith(':') &&
      !trimmed.endsWith('{') && // In case someone wrote JS
      !trimmed.includes('#')
    ) {
      return `File "solution.py", line ${lineNum}\n    ${line}\n    ^\nSyntaxError: expected ':'`;
    }
    
    // Check for unmatched quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 && doubleQuotes % 2 === 0) {
      return `File "solution.py", line ${lineNum}\n    ${line}\nSyntaxError: unterminated string literal (single quote)`;
    }
    if (doubleQuotes % 2 !== 0 && singleQuotes % 2 === 0) {
      return `File "solution.py", line ${lineNum}\n    ${line}\nSyntaxError: unterminated string literal (double quote)`;
    }
  }

  // Check for unmatched parentheses
  let parenDepth = 0;
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '(') parenDepth++;
    if (code[i] === ')') parenDepth--;
    if (parenDepth < 0) {
      return `File "solution.py"\nSyntaxError: unmatched ')'`;
    }
  }
  if (parenDepth > 0) {
    return `File "solution.py"\nSyntaxError: '(' was never closed`;
  }

  return null;
}

/**
 * Simulates or verifies code execution output
 */
export function validateAnswer(question: Question, userCode: string): ValidationResult {
  const syntaxErr = detectSyntaxErrors(userCode);
  if (syntaxErr) {
    return {
      isCorrect: false,
      output: '',
      error: syntaxErr,
      executionStatus: 'SYNTAX_ERROR'
    };
  }

  const normalizedUser = normalizeCode(userCode);
  const normalizedExpected = normalizeCode(question.expectedAnswer);
  
  // Check exact normalized match
  if (normalizedUser === normalizedExpected) {
    return {
      isCorrect: true,
      output: question.expectedOutput,
      executionStatus: 'SUCCESS'
    };
  }

  // Check accepted alternative answers
  if (question.acceptedAnswers && question.acceptedAnswers.length > 0) {
    for (const alt of question.acceptedAnswers) {
      if (normalizedUser === normalizeCode(alt)) {
        return {
          isCorrect: true,
          output: question.expectedOutput,
          executionStatus: 'SUCCESS'
        };
      }
    }
  }

  // Fuzzy check: if user code contains core required fixes and matches key tokens
  const brokenNormalized = normalizeCode(question.brokenCode);
  if (normalizedUser === brokenNormalized) {
    return {
      isCorrect: false,
      output: '',
      error: `Execution failed. Code still contains original uncorrected bugs.\nReview error trace: Check syntax, variables, or logic constraints.`,
      executionStatus: 'RUNTIME_ERROR'
    };
  }

  // If question is a specific range loop or print
  // Let's do token-based heuristic verification for robust user experience
  const expectedTokens = normalizedExpected.split(/\s+/);
  const userTokens = normalizedUser.split(/\s+/);
  
  let matchCount = 0;
  for (const token of expectedTokens) {
    if (userTokens.includes(token)) {
      matchCount++;
    }
  }
  
  const tokenRatio = matchCount / Math.max(expectedTokens.length, 1);
  
  if (tokenRatio >= 0.95 && !userCode.includes(question.brokenCode)) {
    return {
      isCorrect: true,
      output: question.expectedOutput,
      executionStatus: 'SUCCESS'
    };
  }

  return {
    isCorrect: false,
    output: `> Program executed but failed validation criteria.\n> Output did not match expected telemetry signature.`,
    error: `Validation Check: Expected output '${question.expectedOutput.replace(/\n/g, '\\n')}' was not produced.`,
    executionStatus: 'LOGIC_ERROR'
  };
}
