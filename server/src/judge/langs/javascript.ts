import { Problem } from "../typeSystem";

export function genJavaScriptDriver(p: Problem): string {
  const argNames = p.params.map((x) => x.name);
  const destructure = argNames.length ? `const { ${argNames.join(", ")} } = c.input;` : "";
  const argList = argNames.join(", ");
  return `const fs = require("fs");
const solutionFn = require("./solution.js");

const cases = JSON.parse(fs.readFileSync("testcases.json", "utf8"));
const results = [];

for (const c of cases) {
  ${destructure}
  const start = process.hrtime.bigint();
  try {
    const actual = solutionFn(${argList});
    const timeMs = Number(process.hrtime.bigint() - start) / 1e6;
    results.push({ actual: actual === undefined ? null : actual, error: null, timeMs });
  } catch (e) {
    const timeMs = Number(process.hrtime.bigint() - start) / 1e6;
    results.push({ actual: null, error: (e && e.message) || String(e), timeMs });
  }
}

console.log(JSON.stringify(results));
`;
}
