import fs from "fs";
import os from "os";
import path from "path";
import { Problem, TestCase } from "./typeSystem";
import { Language, genDriver } from "./driverGen";
import { LANG_CONFIGS, runInDocker } from "./docker";

export interface TestOutcome {
  index: number;
  pass: boolean;
  input: Record<string, unknown>;
  expected: unknown;
  actual: unknown;
  error: string | null;
  timeMs: number | null;
}

export interface JudgeResult {
  status: "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "timeout" | "internal_error";
  outcomes: TestOutcome[];
  message?: string;
}

function normalize(val: unknown, mode: "exact" | "unordered"): unknown {
  if (mode === "unordered" && Array.isArray(val)) {
    const copy = [...val];
    copy.sort((a, b) => {
      const sa = JSON.stringify(a);
      const sb = JSON.stringify(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
    return copy;
  }
  return val;
}

function valuesEqual(expected: unknown, actual: unknown, mode: "exact" | "unordered"): boolean {
  return JSON.stringify(normalize(expected, mode)) === JSON.stringify(normalize(actual, mode));
}

export async function judgeSubmission(
  problem: Problem,
  language: Language,
  userCode: string,
  includeHidden: boolean
): Promise<JudgeResult> {
  const cases: TestCase[] = includeHidden
    ? problem.testCases
    : problem.testCases.filter((tc) => !tc.hidden);

  if (cases.length === 0) {
    return { status: "internal_error", outcomes: [], message: "No test cases to run." };
  }

  const lang = LANG_CONFIGS[language];
  const hostDir = fs.mkdtempSync(path.join(os.tmpdir(), "codecrucible-"));

  try {
    let solutionCode = userCode;
    if (language === "javascript") {
      solutionCode = `${userCode}\nmodule.exports = ${problem.functionName};\n`;
    }
    fs.writeFileSync(path.join(hostDir, lang.solutionFile), solutionCode);
    fs.writeFileSync(path.join(hostDir, lang.driverFile), genDriver(language, problem));
    fs.writeFileSync(
      path.join(hostDir, "testcases.json"),
      JSON.stringify(cases.map((c) => ({ input: c.input })))
    );
    fs.chmodSync(hostDir, 0o777);

    const execResult = await runInDocker(hostDir, lang);

    if (execResult.timedOut) {
      return { status: "timeout", outcomes: [], message: "Execution exceeded the time limit." };
    }

    if (execResult.exitCode !== 0) {
      // Distinguish compile errors (nonzero exit, no parseable stdout) from
      // runtime errors caught inside the driver (those still print JSON).
      const parsed = tryParse(execResult.stdout);
      if (!parsed) {
        return {
          status: "compile_error",
          outcomes: [],
          message: execResult.stderr.trim() || execResult.stdout.trim() || "Compilation or execution failed.",
        };
      }
    }

    const parsed = tryParse(execResult.stdout);
    if (!parsed || !Array.isArray(parsed)) {
      return {
        status: "internal_error",
        outcomes: [],
        message: execResult.stderr.trim() || "Could not parse judge output.",
      };
    }

    const outcomes: TestOutcome[] = cases.map((tc, i) => {
      const r = parsed[i] as { actual: unknown; error: string | null; timeMs: number };
      if (!r) {
        return { index: i, pass: false, input: tc.input, expected: tc.output, actual: null, error: "missing result", timeMs: null };
      }
      if (r.error) {
        return { index: i, pass: false, input: tc.input, expected: tc.output, actual: null, error: r.error, timeMs: r.timeMs };
      }
      const pass = valuesEqual(tc.output, r.actual, problem.comparisonMode ?? "exact");
      return { index: i, pass, input: tc.input, expected: tc.output, actual: r.actual, error: null, timeMs: r.timeMs };
    });

    const anyRuntimeError = outcomes.some((o) => o.error);
    const allPass = outcomes.every((o) => o.pass);

    return {
      status: allPass ? "accepted" : anyRuntimeError ? "runtime_error" : "wrong_answer",
      outcomes,
    };
  } finally {
    fs.rmSync(hostDir, { recursive: true, force: true });
  }
}

function tryParse(s: string): unknown {
  try {
    return JSON.parse(s.trim());
  } catch {
    return null;
  }
}
