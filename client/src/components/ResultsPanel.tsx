import { JudgeResult, JudgeStatus } from "../types";

const STATUS_LABELS: Record<JudgeStatus, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  runtime_error: "Runtime Error",
  compile_error: "Compile Error",
  timeout: "Time Limit Exceeded",
  internal_error: "Internal Error",
};

function fmt(v: unknown): string {
  return JSON.stringify(v);
}

export default function ResultsPanel({
  result,
  loading,
}: {
  result: JudgeResult | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="results-panel">
        <div className="status-line">Running…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel">
        <div className="empty">Run your code to see results here.</div>
      </div>
    );
  }

  const hasCaseDetails = result.outcomes && result.outcomes.length > 0;

  return (
    <div className="results-panel">
      <div className={`status-line ${result.status}`}>{STATUS_LABELS[result.status]}</div>
      {result.message && <pre className="error-block">{result.message}</pre>}
      {hasCaseDetails &&
        result.outcomes.map((o) => (
          <div key={o.index} className={`testcase ${o.pass ? "pass" : "fail"}`}>
            <div className="tc-header">
              <span>Test case {o.index + 1}</span>
              <span>{o.pass ? "Pass" : "Fail"}</span>
            </div>
            <div className="tc-row">
              <b>Input:</b> {fmt(o.input)}
            </div>
            <div className="tc-row">
              <b>Expected:</b> {fmt(o.expected)}
            </div>
            <div className="tc-row">
              <b>Output:</b> {o.error ? o.error : fmt(o.actual)}
            </div>
            {o.timeMs !== null && (
              <div className="tc-row">
                <b>Time:</b> {o.timeMs.toFixed(2)} ms
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
