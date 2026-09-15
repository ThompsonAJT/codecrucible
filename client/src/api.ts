import { JudgeResult, Language, ProblemDetail, ProblemSummary } from "./types";

export async function fetchProblems(): Promise<ProblemSummary[]> {
  const res = await fetch("/api/problems");
  if (!res.ok) throw new Error("Failed to load problems");
  return res.json();
}

export async function fetchProblem(id: string): Promise<ProblemDetail> {
  const res = await fetch(`/api/problems/${id}`);
  if (!res.ok) throw new Error("Problem not found");
  return res.json();
}

export async function runCode(
  id: string,
  language: Language,
  code: string,
  submit: boolean
): Promise<JudgeResult> {
  const res = await fetch(`/api/problems/${id}/run?mode=${submit ? "submit" : "run"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
