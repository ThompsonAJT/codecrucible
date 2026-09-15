# CodeCrucible

A local LeetCode-style practice app. Solve interview-style problems in
Python, JavaScript, Java, or C++, with your code judged against test cases
inside sandboxed Docker containers.

## How it works

- **`problems/`** — problem definitions as JSON: description, function
  signature (typed params + return type), and test cases (some hidden,
  used only on Submit).
- **`server/`** — Express/TypeScript backend. For each submission it:
  1. Generates starter code and a per-language *driver* from the problem's
     type metadata.
  2. Writes the user's code + driver + test cases into a temp directory.
  3. Runs it in a locked-down, one-shot Docker container
     (`--network none`, memory/CPU/pids limits, non-root, `--rm`) that
     executes every test case in a single run and prints results as JSON.
  4. Compares actual vs. expected output and returns pass/fail per case.
- **`client/`** — React + Monaco editor frontend (problem list, description
  panel, editor, Run/Submit, results panel).

Java and C++ drivers include a small hand-rolled JSON parser/serializer
(no external dependency) bounded to a fixed set of value types: `int`,
`double`, `boolean`, `string`, their 1D arrays, and `int[][]`. That covers
the large majority of classic array/string/matrix interview problems.
Linked lists and trees aren't supported yet.

## Prerequisites

- Node.js 18+
- Docker Desktop (or another local Docker daemon), running

## Setup

```bash
npm run install:all
npm run pull-images   # pulls the 4 language runtime images (~3.5GB total)
```

## Run

```bash
npm run dev
```

This starts the backend on http://localhost:4000 and the frontend on
http://localhost:5173 (which proxies `/api` to the backend).

## Adding a new problem

Add a JSON file to `problems/`, following the shape of the existing ones:

```json
{
  "id": "kebab-case-id",
  "title": "Display Title",
  "difficulty": "Easy | Medium | Hard",
  "tags": ["array"],
  "description": "Markdown description",
  "functionName": "camelCaseName",
  "params": [{ "name": "nums", "type": "int[]" }],
  "returnType": "int",
  "comparisonMode": "exact",
  "testCases": [
    { "input": { "nums": [1,2,3] }, "output": 6 },
    { "input": { "nums": [4,5,6] }, "output": 15, "hidden": true }
  ]
}
```

Supported `type` values: `int`, `double`, `boolean`, `string`, `int[]`,
`double[]`, `boolean[]`, `string[]`, `int[][]`. Set `"comparisonMode":
"unordered"` when any correct output ordering should be accepted (e.g.
Two Sum's index pair). Starter code and the per-language driver are
generated automatically — no per-problem, per-language code needed.

## Regression-testing the judge

`server/scripts/testHarness.ts` and `testHarness2.ts` run reference
solutions for every seeded problem across all 4 languages directly
against the judge (bypassing the UI):

```bash
npm run test:judge
```
