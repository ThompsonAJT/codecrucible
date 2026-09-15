import fs from "fs";
import path from "path";
import { Problem } from "./judge/typeSystem";

const PROBLEMS_DIR = path.resolve(__dirname, "..", "..", "problems");

let cache: Problem[] | null = null;

export function loadProblems(): Problem[] {
  if (cache) return cache;
  const files = fs.readdirSync(PROBLEMS_DIR).filter((f) => f.endsWith(".json"));
  cache = files
    .map((f) => JSON.parse(fs.readFileSync(path.join(PROBLEMS_DIR, f), "utf8")) as Problem)
    .sort((a, b) => a.title.localeCompare(b.title));
  return cache;
}

export function getProblem(id: string): Problem | undefined {
  return loadProblems().find((p) => p.id === id);
}
