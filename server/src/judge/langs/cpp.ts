import { Param, Problem, ValueType } from "../typeSystem";

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

function convFn(t: ValueType): string {
  switch (t) {
    case "int": return "asInt";
    case "double": return "asDouble";
    case "boolean": return "asBool";
    case "string": return "asStr";
    case "int[]": return "asIntArray";
    case "double[]": return "asDoubleArray";
    case "boolean[]": return "asBoolArray";
    case "string[]": return "asStrArray";
    case "int[][]": return "asIntMatrix";
  }
}

// Hand-rolled JSON value/parser/serializer bounded to the ValueType universe,
// so the driver needs no external C++ dependency (no nlohmann/json etc).
// String.raw keeps every backslash/quote below exactly as written.
const JSON_HELPER = String.raw`
struct JVal {
    enum Type { NUL, BOOL, NUM, STR, ARR, OBJ } type = NUL;
    bool b = false;
    double num = 0;
    string str;
    vector<JVal> arr;
    map<string, JVal> obj;
};

void skipWs(const string& s, size_t& pos) {
    while (pos < s.size() && isspace((unsigned char) s[pos])) pos++;
}

string parseRawString(const string& s, size_t& pos) {
    string out;
    pos++; // opening quote
    while (true) {
        char c = s[pos++];
        if (c == '"') break;
        if (c == '\\') {
            char e = s[pos++];
            switch (e) {
                case 'n': out += '\n'; break;
                case 't': out += '\t'; break;
                case 'r': out += '\r'; break;
                case '"': out += '"'; break;
                case '\\': out += '\\'; break;
                case '/': out += '/'; break;
                case 'u': {
                    string hex = s.substr(pos, 4);
                    pos += 4;
                    int code = (int) strtol(hex.c_str(), nullptr, 16);
                    out += (char) code;
                    break;
                }
                default: out += e;
            }
        } else {
            out += c;
        }
    }
    return out;
}

JVal parseValue(const string& s, size_t& pos);

JVal parseNumber(const string& s, size_t& pos) {
    size_t start = pos;
    if (s[pos] == '-') pos++;
    while (pos < s.size() && (isdigit((unsigned char) s[pos]) || s[pos] == '.' || s[pos] == 'e' || s[pos] == 'E' || s[pos] == '+' || s[pos] == '-')) pos++;
    JVal v;
    v.type = JVal::NUM;
    v.num = stod(s.substr(start, pos - start));
    return v;
}

JVal parseObject(const string& s, size_t& pos) {
    JVal v;
    v.type = JVal::OBJ;
    pos++; // {
    skipWs(s, pos);
    if (s[pos] == '}') { pos++; return v; }
    while (true) {
        skipWs(s, pos);
        string key = parseRawString(s, pos);
        skipWs(s, pos);
        pos++; // :
        JVal val = parseValue(s, pos);
        v.obj[key] = val;
        skipWs(s, pos);
        if (s[pos] == ',') { pos++; continue; }
        pos++; // }
        break;
    }
    return v;
}

JVal parseArray(const string& s, size_t& pos) {
    JVal v;
    v.type = JVal::ARR;
    pos++; // [
    skipWs(s, pos);
    if (s[pos] == ']') { pos++; return v; }
    while (true) {
        JVal val = parseValue(s, pos);
        v.arr.push_back(val);
        skipWs(s, pos);
        if (s[pos] == ',') { pos++; continue; }
        pos++; // ]
        break;
    }
    return v;
}

JVal parseValue(const string& s, size_t& pos) {
    skipWs(s, pos);
    char c = s[pos];
    if (c == '{') return parseObject(s, pos);
    if (c == '[') return parseArray(s, pos);
    if (c == '"') { JVal v; v.type = JVal::STR; v.str = parseRawString(s, pos); return v; }
    if (c == 't') { pos += 4; JVal v; v.type = JVal::BOOL; v.b = true; return v; }
    if (c == 'f') { pos += 5; JVal v; v.type = JVal::BOOL; v.b = false; return v; }
    if (c == 'n') { pos += 4; JVal v; v.type = JVal::NUL; return v; }
    return parseNumber(s, pos);
}

int asInt(const JVal& v) { return (int) llround(v.num); }
double asDouble(const JVal& v) { return v.num; }
bool asBool(const JVal& v) { return v.b; }
string asStr(const JVal& v) { return v.str; }

vector<int> asIntArray(const JVal& v) {
    vector<int> r;
    for (auto& e : v.arr) r.push_back(asInt(e));
    return r;
}

vector<double> asDoubleArray(const JVal& v) {
    vector<double> r;
    for (auto& e : v.arr) r.push_back(asDouble(e));
    return r;
}

vector<bool> asBoolArray(const JVal& v) {
    vector<bool> r;
    for (auto& e : v.arr) r.push_back(asBool(e));
    return r;
}

vector<string> asStrArray(const JVal& v) {
    vector<string> r;
    for (auto& e : v.arr) r.push_back(asStr(e));
    return r;
}

vector<vector<int>> asIntMatrix(const JVal& v) {
    vector<vector<int>> r;
    for (auto& e : v.arr) r.push_back(asIntArray(e));
    return r;
}

string jsonQuote(const string& s) {
    string out = "\"";
    for (unsigned char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default:
                if (c < 0x20) {
                    char buf[8];
                    snprintf(buf, sizeof(buf), "\\u%04x", c);
                    out += buf;
                } else {
                    out += (char) c;
                }
        }
    }
    out += "\"";
    return out;
}

string toJson(int v) { return to_string(v); }
string toJson(double v) { ostringstream oss; oss << v; return oss.str(); }
string toJson(bool v) { return v ? "true" : "false"; }
string toJson(const string& v) { return jsonQuote(v); }

string toJson(const vector<int>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += to_string(v[i]); }
    return s + "]";
}

string toJson(const vector<double>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += toJson(v[i]); }
    return s + "]";
}

string toJson(const vector<bool>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += (v[i] ? "true" : "false"); }
    return s + "]";
}

string toJson(const vector<string>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += jsonQuote(v[i]); }
    return s + "]";
}

string toJson(const vector<vector<int>>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += toJson(v[i]); }
    return s + "]";
}
`;

export function genCppDriver(p: Problem): string {
  const extraction = p.params
    .map((param: Param) => `            ${cppType(param.type)} ${param.name} = ${convFn(param.type)}(input.obj.at(${JSON.stringify(param.name)}));`)
    .join("\n");
  const argNames = p.params.map((x) => x.name).join(", ");

  return String.raw`#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <deque>
#include <algorithm>
#include <numeric>
#include <functional>
#include <climits>
#include <cmath>
#include <cctype>
#include <chrono>
#include <cstdlib>
#include <cstdio>
using namespace std;

${JSON_HELPER}

#include "solution.cpp"

int main() {
    ifstream f("testcases.json");
    stringstream buffer;
    buffer << f.rdbuf();
    string content = buffer.str();
    size_t pos = 0;
    JVal root = parseValue(content, pos);

    Solution sol;
    string out = "[";
    for (size_t ci = 0; ci < root.arr.size(); ci++) {
        if (ci > 0) out += ",";
        JVal& caseObj = root.arr[ci];
        JVal& input = caseObj.obj["input"];
        auto start = chrono::high_resolution_clock::now();
        try {
${extraction}
            auto result = sol.${p.functionName}(${argNames});
            auto end = chrono::high_resolution_clock::now();
            double elapsed = chrono::duration<double, milli>(end - start).count();
            out += "{\"actual\":" + toJson(result) + ",\"error\":null,\"timeMs\":" + to_string(elapsed) + "}";
        } catch (const exception& e) {
            auto end = chrono::high_resolution_clock::now();
            double elapsed = chrono::duration<double, milli>(end - start).count();
            out += "{\"actual\":null,\"error\":" + jsonQuote(e.what()) + ",\"timeMs\":" + to_string(elapsed) + "}";
        } catch (...) {
            auto end = chrono::high_resolution_clock::now();
            double elapsed = chrono::duration<double, milli>(end - start).count();
            out += "{\"actual\":null,\"error\":\"unknown error\",\"timeMs\":" + to_string(elapsed) + "}";
        }
    }
    out += "]";
    cout << out << endl;
    return 0;
}
`;
}
