// The bounded set of value types every problem/driver/generator understands.
// Kept deliberately small (no objects, no linked lists/trees) so every
// language driver can be hand-rolled without an external JSON dependency.
export type ValueType =
  | "int"
  | "double"
  | "boolean"
  | "string"
  | "int[]"
  | "double[]"
  | "boolean[]"
  | "string[]"
  | "int[][]";

export interface Param {
  name: string;
  type: ValueType;
}

export type ComparisonMode = "exact" | "unordered";

export interface TestCase {
  input: Record<string, unknown>;
  output: unknown;
  hidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string; // markdown
  functionName: string;
  params: Param[];
  returnType: ValueType;
  comparisonMode?: ComparisonMode;
  testCases: TestCase[];
}

export const isArrayType = (t: ValueType): boolean => t.endsWith("[]");
