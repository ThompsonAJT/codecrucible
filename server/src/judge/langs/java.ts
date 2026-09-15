import { Param, Problem, ValueType } from "../typeSystem";

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

function convFn(t: ValueType): string {
  switch (t) {
    case "int": return "Json.asInt";
    case "double": return "Json.asDouble";
    case "boolean": return "Json.asBool";
    case "string": return "Json.asStr";
    case "int[]": return "Json.asIntArray";
    case "double[]": return "Json.asDoubleArray";
    case "boolean[]": return "Json.asBoolArray";
    case "string[]": return "Json.asStrArray";
    case "int[][]": return "Json.asIntMatrix";
  }
}

// A single hand-rolled JSON parser/serializer, bounded to the ValueType
// universe, so the generated driver needs no external Java dependency.
// String.raw keeps every backslash/quote below exactly as written -- no
// double-escaping needed to produce valid Java source.
const JSON_HELPER = String.raw`
final class Json {
    private String src;
    private int pos;

    static Object parse(String s) {
        Json p = new Json();
        p.src = s;
        p.pos = 0;
        p.skipWs();
        return p.parseValue();
    }

    private void skipWs() {
        while (pos < src.length() && Character.isWhitespace(src.charAt(pos))) pos++;
    }

    private Object parseValue() {
        skipWs();
        char c = src.charAt(pos);
        if (c == '{') return parseObject();
        if (c == '[') return parseArray();
        if (c == '"') return parseString();
        if (c == 't') { pos += 4; return Boolean.TRUE; }
        if (c == 'f') { pos += 5; return Boolean.FALSE; }
        if (c == 'n') { pos += 4; return null; }
        return parseNumber();
    }

    private Map<String, Object> parseObject() {
        Map<String, Object> map = new LinkedHashMap<>();
        pos++;
        skipWs();
        if (src.charAt(pos) == '}') { pos++; return map; }
        while (true) {
            skipWs();
            String key = parseString();
            skipWs();
            pos++; // ':'
            Object val = parseValue();
            map.put(key, val);
            skipWs();
            char c = src.charAt(pos);
            if (c == ',') { pos++; continue; }
            pos++; // '}'
            break;
        }
        return map;
    }

    private List<Object> parseArray() {
        List<Object> list = new ArrayList<>();
        pos++;
        skipWs();
        if (src.charAt(pos) == ']') { pos++; return list; }
        while (true) {
            Object val = parseValue();
            list.add(val);
            skipWs();
            char c = src.charAt(pos);
            if (c == ',') { pos++; continue; }
            pos++; // ']'
            break;
        }
        return list;
    }

    private String parseString() {
        StringBuilder sb = new StringBuilder();
        pos++; // opening quote
        while (true) {
            char c = src.charAt(pos++);
            if (c == '"') break;
            if (c == '\\') {
                char e = src.charAt(pos++);
                switch (e) {
                    case 'n': sb.append('\n'); break;
                    case 't': sb.append('\t'); break;
                    case 'r': sb.append('\r'); break;
                    case '"': sb.append('"'); break;
                    case '\\': sb.append('\\'); break;
                    case '/': sb.append('/'); break;
                    case 'u':
                        String hex = src.substring(pos, pos + 4);
                        pos += 4;
                        sb.append((char) Integer.parseInt(hex, 16));
                        break;
                    default: sb.append(e);
                }
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private Double parseNumber() {
        int start = pos;
        if (src.charAt(pos) == '-') pos++;
        while (pos < src.length()) {
            char c = src.charAt(pos);
            if (Character.isDigit(c) || c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') pos++;
            else break;
        }
        return Double.parseDouble(src.substring(start, pos));
    }

    static int asInt(Object o) { return ((Number) o).intValue(); }
    static double asDouble(Object o) { return ((Number) o).doubleValue(); }
    static boolean asBool(Object o) { return (Boolean) o; }
    static String asStr(Object o) { return (String) o; }

    @SuppressWarnings("unchecked")
    static int[] asIntArray(Object o) {
        List<Object> l = (List<Object>) o;
        int[] a = new int[l.size()];
        for (int i = 0; i < l.size(); i++) a[i] = asInt(l.get(i));
        return a;
    }

    @SuppressWarnings("unchecked")
    static double[] asDoubleArray(Object o) {
        List<Object> l = (List<Object>) o;
        double[] a = new double[l.size()];
        for (int i = 0; i < l.size(); i++) a[i] = asDouble(l.get(i));
        return a;
    }

    @SuppressWarnings("unchecked")
    static boolean[] asBoolArray(Object o) {
        List<Object> l = (List<Object>) o;
        boolean[] a = new boolean[l.size()];
        for (int i = 0; i < l.size(); i++) a[i] = asBool(l.get(i));
        return a;
    }

    @SuppressWarnings("unchecked")
    static String[] asStrArray(Object o) {
        List<Object> l = (List<Object>) o;
        String[] a = new String[l.size()];
        for (int i = 0; i < l.size(); i++) a[i] = asStr(l.get(i));
        return a;
    }

    @SuppressWarnings("unchecked")
    static int[][] asIntMatrix(Object o) {
        List<Object> l = (List<Object>) o;
        int[][] a = new int[l.size()][];
        for (int i = 0; i < l.size(); i++) a[i] = asIntArray(l.get(i));
        return a;
    }

    static String quote(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        sb.append("\"");
        return sb.toString();
    }

    static String toJson(Object o) {
        if (o == null) return "null";
        if (o instanceof Integer || o instanceof Double || o instanceof Boolean) return o.toString();
        if (o instanceof String) return quote((String) o);
        if (o instanceof int[]) {
            int[] a = (int[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(","); sb.append(a[i]); }
            return sb.append("]").toString();
        }
        if (o instanceof double[]) {
            double[] a = (double[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(","); sb.append(a[i]); }
            return sb.append("]").toString();
        }
        if (o instanceof boolean[]) {
            boolean[] a = (boolean[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(","); sb.append(a[i]); }
            return sb.append("]").toString();
        }
        if (o instanceof String[]) {
            String[] a = (String[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(","); sb.append(quote(a[i])); }
            return sb.append("]").toString();
        }
        if (o instanceof int[][]) {
            int[][] a = (int[][]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(","); sb.append(toJson(a[i])); }
            return sb.append("]").toString();
        }
        return "null";
    }
}
`;

export function genJavaDriver(p: Problem): string {
  const extraction = p.params
    .map((param: Param) => `                ${javaType(param.type)} ${param.name} = ${convFn(param.type)}(input.get(${JSON.stringify(param.name)}));`)
    .join("\n");
  const argNames = p.params.map((x) => x.name).join(", ");

  const mainBody = String.raw`import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

${JSON_HELPER}

public class Main {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws Exception {
        String content = new String(Files.readAllBytes(Paths.get("testcases.json")), StandardCharsets.UTF_8);
        List<Object> cases = (List<Object>) Json.parse(content);
        Solution sol = new Solution();
        StringBuilder out = new StringBuilder("[");
        for (int ci = 0; ci < cases.size(); ci++) {
            if (ci > 0) out.append(",");
            Map<String, Object> caseObj = (Map<String, Object>) cases.get(ci);
            Map<String, Object> input = (Map<String, Object>) caseObj.get("input");
            long start = System.nanoTime();
            try {
${extraction}
                ${javaType(p.returnType)} result = sol.${p.functionName}(${argNames});
                double elapsed = (System.nanoTime() - start) / 1e6;
                Object boxed = result;
                out.append("{\"actual\":").append(Json.toJson(boxed)).append(",\"error\":null,\"timeMs\":").append(elapsed).append("}");
            } catch (Throwable t) {
                double elapsed = (System.nanoTime() - start) / 1e6;
                out.append("{\"actual\":null,\"error\":").append(Json.quote(String.valueOf(t))).append(",\"timeMs\":").append(elapsed).append("}");
            }
        }
        out.append("]");
        System.out.println(out.toString());
    }
}
`;
  return mainBody;
}
