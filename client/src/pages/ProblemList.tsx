import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProblems } from "../api";
import { ProblemSummary } from "../types";

export default function ProblemList() {
  const [problems, setProblems] = useState<ProblemSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProblems().then(setProblems).catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="empty">Failed to load problems: {error}</div>;
  if (!problems) return <div className="loading">Loading problems…</div>;

  return (
    <div className="list-container">
      <h1>Problems</h1>
      <div className="subtitle">{problems.length} problems &middot; forge your solution, then run it for real</div>
      <table className="problem-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Difficulty</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p) => (
            <tr key={p.id}>
              <td>
                <Link to={`/problems/${p.id}`}>{p.title}</Link>
              </td>
              <td>
                <span className={`difficulty ${p.difficulty}`}>{p.difficulty}</span>
              </td>
              <td>
                {p.tags.map((t) => (
                  <Link className="tag" to={`/help#${t}`} key={t}>
                    {t}
                  </Link>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
