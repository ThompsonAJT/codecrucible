import { Problem } from "./typeSystem";
import { genPythonDriver } from "./langs/python";
import { genJavaScriptDriver } from "./langs/javascript";
import { genJavaDriver } from "./langs/java";
import { genCppDriver } from "./langs/cpp";

export type Language = "python" | "javascript" | "java" | "cpp";

export function genDriver(lang: Language, p: Problem): string {
  switch (lang) {
    case "python": return genPythonDriver(p);
    case "javascript": return genJavaScriptDriver(p);
    case "java": return genJavaDriver(p);
    case "cpp": return genCppDriver(p);
  }
}
