export type Difficulty = "Easy" | "Medium" | "Hard";

export interface ProblemSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface TestCasePublic {
  input: Record<string, unknown>;
  output: unknown;
}

export interface ProblemDetail {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  starterCode: Record<Language, string>;
  sampleTests: TestCasePublic[];
}

export type Language = "python" | "javascript" | "java" | "cpp";

export interface TestOutcome {
  index: number;
  pass: boolean;
  input: Record<string, unknown>;
  expected: unknown;
  actual: unknown;
  error: string | null;
  timeMs: number | null;
}

export type JudgeStatus =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "compile_error"
  | "timeout"
  | "internal_error";

export interface JudgeResult {
  status: JudgeStatus;
  outcomes: TestOutcome[];
  message?: string;
}
