import express from "express";
import cors from "cors";
import { loadProblems, getProblem } from "./problems";
import { genStarterCode } from "./judge/starterGen";
import { judgeSubmission } from "./judge/run";
import { Language } from "./judge/driverGen";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const VALID_LANGS: Language[] = ["python", "javascript", "java", "cpp"];

app.get("/api/problems", (_req, res) => {
  const problems = loadProblems().map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags,
  }));
  res.json(problems);
});

app.get("/api/problems/:id", (req, res) => {
  const problem = getProblem(req.params.id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  const sampleTests = problem.testCases.filter((tc) => !tc.hidden);
  res.json({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    description: problem.description,
    starterCode: genStarterCode(problem),
    sampleTests,
  });
});

app.post("/api/problems/:id/run", async (req, res) => {
  const problem = getProblem(req.params.id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  const { language, code } = req.body ?? {};
  if (!VALID_LANGS.includes(language)) return res.status(400).json({ error: "Invalid language" });
  if (typeof code !== "string") return res.status(400).json({ error: "Missing code" });

  const submit = req.query.mode === "submit";
  try {
    const result = await judgeSubmission(problem, language, code, submit);
    res.json(result);
  } catch (e) {
    res.status(500).json({ status: "internal_error", outcomes: [], message: String(e) });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`codecrucible server listening on http://localhost:${PORT}`);
});
