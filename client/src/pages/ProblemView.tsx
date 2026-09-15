import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { fetchProblem, runCode } from "../api";
import { JudgeResult, Language, ProblemDetail } from "../types";
import ResultsPanel from "../components/ResultsPanel";

const LANGUAGES: { id: Language; label: string; monaco: string }[] = [
  { id: "python", label: "Python", monaco: "python" },
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
];

function storageKey(problemId: string, language: Language) {
  return `codecrucible:${problemId}:${language}`;
}

export default function ProblemView() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setProblem(null);
    setResult(null);
    fetchProblem(id)
      .then((p) => {
        setProblem(p);
        const saved = localStorage.getItem(storageKey(id, language));
        setCode(saved ?? p.starterCode[language] ?? "");
      })
      .catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeLanguage = useCallback(
    (next: Language) => {
      if (!problem || !id) return;
      const saved = localStorage.getItem(storageKey(id, next));
      setLanguage(next);
      setCode(saved ?? problem.starterCode[next] ?? "");
      setResult(null);
    },
    [problem, id]
  );

  const onEditorChange = useCallback(
    (value: string | undefined) => {
      const next = value ?? "";
      setCode(next);
      if (id) localStorage.setItem(storageKey(id, language), next);
    },
    [id, language]
  );

  const resetCode = useCallback(() => {
    if (!problem || !id) return;
    const starter = problem.starterCode[language] ?? "";
    setCode(starter);
    localStorage.setItem(storageKey(id, language), starter);
  }, [problem, id, language]);

  const execute = useCallback(
    async (submit: boolean) => {
      if (!id) return;
      setRunning(true);
      setResult(null);
      try {
        const r = await runCode(id, language, code, submit);
        setResult(r);
      } catch (e) {
        setResult({ status: "internal_error", outcomes: [], message: String(e) });
      } finally {
        setRunning(false);
      }
    },
    [id, language, code]
  );

  const monacoLang = useMemo(() => LANGUAGES.find((l) => l.id === language)?.monaco ?? "plaintext", [language]);

  if (error) return <div className="empty">Failed to load problem: {error}</div>;
  if (!problem) return <div className="loading">Loading problem…</div>;

  return (
    <div className="problem-view">
      <div className="left-panel">
        <h1>{problem.title}</h1>
        <div className="meta">
          <span className={`difficulty ${problem.difficulty}`}>{problem.difficulty}</span>
          {problem.tags.map((t) => (
            <Link className="tag" to={`/help#${t}`} key={t}>
              {t}
            </Link>
          ))}
        </div>
        <div className="description">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>
      </div>
      <div className="right-panel">
        <div className="editor-toolbar">
          <select value={language} onChange={(e) => changeLanguage(e.target.value as Language)}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <button className="btn" onClick={resetCode} disabled={running}>
            Reset
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={() => execute(false)} disabled={running}>
            Run
          </button>
          <button className="btn primary" onClick={() => execute(true)} disabled={running}>
            Submit
          </button>
        </div>
        <div className="editor-container">
          <Editor
            height="100%"
            theme="vs-dark"
            language={monacoLang}
            value={code}
            onChange={onEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              tabSize: 4,
            }}
          />
        </div>
        <ResultsPanel result={result} loading={running} />
      </div>
    </div>
  );
}
