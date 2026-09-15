import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CONCEPTS } from "../concepts";
import ConceptCard from "../components/ConceptCard";

export default function HelpPage() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(`concept-${hash}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const highlighted = location.hash.replace("#", "");

  return (
    <div className="list-container">
      <h1>Help Me</h1>
      <div className="subtitle">Short guides for every concept used across the problem set — click one to expand it.</div>
      <div className="concept-grid">
        {CONCEPTS.map((c) => (
          <ConceptCard key={c.id} concept={c} defaultOpen={c.id === highlighted} />
        ))}
      </div>
    </div>
  );
}
