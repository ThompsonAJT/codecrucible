import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Concept } from "../concepts";

function ConceptDetails({ concept }: { concept: Concept }) {
  return (
    <>
      <div className="concept-row">
        <span className="concept-label">When to use it</span>
        <p>{concept.whenToUse}</p>
      </div>
      <div className="concept-row">
        <span className="concept-label">Key idea</span>
        <p>{concept.keyIdea}</p>
      </div>
      <div className="concept-row">
        <span className="concept-label">Complexity</span>
        <p>{concept.complexity}</p>
      </div>
      <div className="concept-row">
        <span className="concept-label">Common pitfall</span>
        <p>{concept.pitfall}</p>
      </div>
      <pre className="concept-snippet">{concept.snippet}</pre>
    </>
  );
}

export default function ConceptCard({ concept, defaultOpen = false }: { concept: Concept; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="concept-card" id={`concept-${concept.id}`}>
      <button className="concept-header" onClick={() => setOpen(true)}>
        <span className="concept-title">{concept.label}</span>
        <span className="concept-chevron">&#9656;</span>
      </button>
      <div className="concept-summary">{concept.summary}</div>

      {open &&
        createPortal(
          <div className="concept-overlay" onClick={() => setOpen(false)}>
            <div className="concept-modal" onClick={(e) => e.stopPropagation()}>
              <button className="concept-modal-close" onClick={() => setOpen(false)} aria-label="Close">
                &#10005;
              </button>
              <span className="concept-title concept-modal-title">{concept.label}</span>
              <div className="concept-summary">{concept.summary}</div>
              <div className="concept-body">
                <ConceptDetails concept={concept} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
