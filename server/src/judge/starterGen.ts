import { Param, Problem, ValueType } from "./typeSystem";

function pyType(t: ValueType): string {
  switch (t) {
    case "int": return "int";
    case "double": return "float";
    case "boolean": return "bool";
    case "string": return "str";
    case "int[]": return "List[int]";
    case "double[]": return "List[float]";
    case "boolean[]": return "List[bool]";
    case "string[]": return "List[str]";
    case "int[][]": return "List[List[int]]";
  }
}

function jsAnnotation(t: ValueType): string {
  switch (t) {
    case "int":
    case "double": return "number";
    case "boolean": return "boolean";
    case "string": return "string";
    case "int[]":
    case "double[]": return "number[]";
    case "boolean[]": return "boolean[]";
    case "string[]": return "string[]";
    case "int[][]": return "number[][]";
  }
}

function javaType(t: ValueType): string {
  switch (t) {
    case "int": return "int";
    case "double": return "double";
    case "boolean": return "boolean";
    case "string": return "String";
    case "int[]": return "int[]";
    case "double[]": return "double[]";
    case "boolean[]": return "boolean[]";
    case "string[]": return "String[]";
    case "int[][]": return "int[][]";
  }
}

function javaDefaultReturn(t: ValueType): string {
  switch (t) {
    case "int": return "0";
    case "double": return "0.0";
    case "boolean": return "false";
    case "string": return '""';
    case "int[]": return "new int[0]";
    case "double[]": return "new double[0]";
    case "boolean[]": return "new boolean[0]";
    case "string[]": return "new String[0]";
    case "int[][]": return "new int[0][0]";
  }
}

function cppType(t: ValueType): string {
  switch (t) {
    case "int": return "int";
    case "double": return "double";
    case "boolean": return "bool";
    case "string": return "string";
    case "int[]": return "vector<int>";
    case "double[]": return "vector<double>";
    case "boolean[]": return "vector<bool>";
    case "string[]": return "vector<string>";
    case "int[][]": return "vector<vector<int>>";
  }
}

function cppDefaultReturn(t: ValueType): string {
  switch (t) {
    case "int": return "0";
    case "double": return "0.0";
    case "boolean": return "false";
    case "string": return '""';
    default: return "{}";
  }
}

function isPrimitive(t: ValueType): boolean {
  return t === "int" || t === "double" || t === "boolean" || t === "string";
}

export function genPythonStarter(p: Problem): string {
  const args = p.params.map((x) => `${x.name}: ${pyType(x.type)}`).join(", ");
  return [
    "from typing import List",
    "",
    "class Solution:",
    `    def ${p.functionName}(self, ${args}) -> ${pyType(p.returnType)}:`,
    "        # write your solution here",
    "        pass",
    "",
  ].join("\n");
}

export function genJavaScriptStarter(p: Problem): string {
  const jsdocParams = p.params.map((x) => ` * @param {${jsAnnotation(x.type)}} ${x.name}`).join("\n");
  const argNames = p.params.map((x) => x.name).join(", ");
  return [
    "/**",
    jsdocParams,
    ` * @return {${jsAnnotation(p.returnType)}}`,
    " */",
    `var ${p.functionName} = function(${argNames}) {`,
    "    // write your solution here",
    "};",
    "",
  ].join("\n");
}

export function genJavaStarter(p: Problem): string {
  const args = p.params.map((x) => `${javaType(x.type)} ${x.name}`).join(", ");
  return [
    "class Solution {",
    `    public ${javaType(p.returnType)} ${p.functionName}(${args}) {`,
    "        // write your solution here",
    `        return ${javaDefaultReturn(p.returnType)};`,
    "    }",
    "}",
    "",
  ].join("\n");
}

export function genCppStarter(p: Problem): string {
  const args = p.params
    .map((x) => {
      const t = cppType(x.type);
      return isPrimitive(x.type) ? `${t} ${x.name}` : `${t}& ${x.name}`;
    })
    .join(", ");
  return [
    "#include <vector>",
    "#include <string>",
    "using namespace std;",
    "",
    "class Solution {",
    "public:",
    `    ${cppType(p.returnType)} ${p.functionName}(${args}) {`,
    "        // write your solution here",
    `        return ${cppDefaultReturn(p.returnType)};`,
    "    }",
    "};",
    "",
  ].join("\n");
}

export function genStarterCode(p: Problem): Record<string, string> {
  return {
    python: genPythonStarter(p),
    javascript: genJavaScriptStarter(p),
    java: genJavaStarter(p),
    cpp: genCppStarter(p),
  };
}
