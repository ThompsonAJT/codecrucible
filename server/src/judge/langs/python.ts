import { Problem } from "../typeSystem";

// The driver reads testcases.json (an array of {input: {...}}), calls the
// user's Solution method once per case, and prints a JSON array of
// {actual, error, timeMs} to stdout. Comparison against expected output
// happens server-side, not in the driver.
export function genPythonDriver(p: Problem): string {
  const argNames = p.params.map((x) => x.name);
  const argList = argNames.map((n) => `case_input[${JSON.stringify(n)}]`).join(", ");
  return `import json, time, traceback
from solution import Solution

with open("testcases.json") as f:
    cases = json.load(f)

sol = Solution()
results = []
for case in cases:
    case_input = case["input"]
    start = time.perf_counter()
    try:
        actual = sol.${p.functionName}(${argList})
        elapsed = (time.perf_counter() - start) * 1000
        results.append({"actual": actual, "error": None, "timeMs": elapsed})
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        results.append({"actual": None, "error": "".join(traceback.format_exception_only(type(e), e)).strip(), "timeMs": elapsed})

print(json.dumps(results))
`;
}
