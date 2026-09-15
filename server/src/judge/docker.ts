import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { Language } from "./driverGen";

export interface LangConfig {
  image: string;
  cmd: string;
  solutionFile: string;
  driverFile: string;
}

export const LANG_CONFIGS: Record<Language, LangConfig> = {
  python: {
    image: "python:3.12-slim",
    cmd: "python3 driver.py",
    solutionFile: "solution.py",
    driverFile: "driver.py",
  },
  javascript: {
    image: "node:20-slim",
    cmd: "node driver.js",
    solutionFile: "solution.js",
    driverFile: "driver.js",
  },
  java: {
    image: "eclipse-temurin:21-jdk",
    cmd: "mkdir -p out && javac Solution.java Main.java -d out && java -cp out Main",
    solutionFile: "Solution.java",
    driverFile: "Main.java",
  },
  cpp: {
    image: "gcc:13",
    cmd: "g++ -O2 -std=c++17 -o sol main.cpp && ./sol",
    solutionFile: "solution.cpp",
    driverFile: "main.cpp",
  },
};

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

const TIME_LIMIT_MS = 10_000;
const MAX_OUTPUT_BYTES = 2_000_000;

export function runInDocker(hostDir: string, lang: LangConfig): Promise<ExecResult> {
  return new Promise((resolve) => {
    const containerName = `judge-${randomUUID()}`;
    const args = [
      "run",
      "--rm",
      "--name", containerName,
      "--network", "none",
      "--memory", "256m",
      "--memory-swap", "256m",
      "--cpus", "1",
      "--pids-limit", "128",
      "--security-opt", "no-new-privileges",
      "-u", "1000:1000",
      "-v", `${hostDir}:/workspace`,
      "-w", "/workspace",
      lang.image,
      "sh", "-c", lang.cmd,
    ];

    const proc = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let killed = false;

    const timer = setTimeout(() => {
      timedOut = true;
      killed = true;
      spawn("docker", ["kill", containerName]);
    }, TIME_LIMIT_MS);

    proc.stdout.on("data", (d) => {
      stdout += d.toString();
      if (stdout.length > MAX_OUTPUT_BYTES && !killed) {
        killed = true;
        spawn("docker", ["kill", containerName]);
      }
    });
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > MAX_OUTPUT_BYTES && !killed) {
        killed = true;
        spawn("docker", ["kill", containerName]);
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + "\n" + String(err), exitCode: null, timedOut });
    });
  });
}
