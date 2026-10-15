export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface TopicDefinition {
  id: string;
  name: string;
  ruleFormula: string;
  shortDesc: string;
  example: string;
  domainNotes?: string;
}

export interface SolutionStep {
  step: number;
  title: string;
  latex: string;
  explanation: string;
}

export interface Question {
  id: string;
  topicId: string;
  topicName: string;
  difficulty: DifficultyLevel;
  questionType: string; // e.g. 'standard' | 'equivalent' | 'find-k' | 'error-analysis' | 'work-backward'
  promptText: string;
  expressionLatex: string;
  options: {
    latex: string;
    isCorrect: boolean;
    errorType?: string;
  }[];
  correctIndex: number;
  solutionSteps: SolutionStep[];
  ruleSummary: string;
  commonMistakeExplanation?: string;
  domainRestrictions?: string;
  errorAnalysisData?: {
    originalExpression: string;
    steps: { stepNum: number; latex: string; hasError: boolean; note?: string }[];
    errorStepNum: number;
    errorReason: string;
  };
}

export interface PracticeConfigState {
  selectedTopics: string[];
  selectedDifficulties: DifficultyLevel[];
  randomDifficulty: boolean;
  randomTopic: boolean;
}

export interface MockTestConfigState {
  questionCount: number;
  selectedTopics: string[];
}

export interface TestAnswerState {
  questionId: string;
  selectedIndex: number | null;
}

export interface MockTestResult {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  questions: Question[];
  userAnswers: (number | null)[];
}

export type AppMode = 'practice' | 'mock-config' | 'mock-active' | 'mock-results';
