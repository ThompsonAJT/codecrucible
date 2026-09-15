import { getProblem } from "../src/problems";
import { judgeSubmission } from "../src/judge/run";
import { Language } from "../src/judge/driverGen";

const solutions: Record<string, Record<Language, string>> = {
  "contains-duplicate": {
    python: `class Solution:\n    def containsDuplicate(self, nums):\n        return len(set(nums)) != len(nums)\n`,
    javascript: `var containsDuplicate = function(nums) {\n    return new Set(nums).size !== nums.length;\n};\n`,
    java: `import java.util.*;\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        Set<Integer> s = new HashSet<>();\n        for (int n : nums) if (!s.add(n)) return true;\n        return false;\n    }\n}\n`,
    cpp: `#include <vector>\n#include <unordered_set>\nusing namespace std;\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        unordered_set<int> s;\n        for (int n : nums) { if (s.count(n)) return true; s.insert(n); }\n        return false;\n    }\n};\n`,
  },
  "best-time-to-buy-and-sell-stock": {
    python: `class Solution:\n    def maxProfit(self, prices):\n        best = 0\n        lo = float('inf')\n        for p in prices:\n            lo = min(lo, p)\n            best = max(best, p - lo)\n        return best\n`,
    javascript: `var maxProfit = function(prices) {\n    let best = 0, lo = Infinity;\n    for (const p of prices) { lo = Math.min(lo, p); best = Math.max(best, p - lo); }\n    return best;\n};\n`,
    java: `class Solution {\n    public int maxProfit(int[] prices) {\n        int best = 0, lo = Integer.MAX_VALUE;\n        for (int p : prices) { lo = Math.min(lo, p); best = Math.max(best, p - lo); }\n        return best;\n    }\n}\n`,
    cpp: `#include <vector>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        int best = 0, lo = INT_MAX;\n        for (int p : prices) { lo = min(lo, p); best = max(best, p - lo); }\n        return best;\n    }\n};\n`,
  },
  "maximum-subarray": {
    python: `class Solution:\n    def maxSubArray(self, nums):\n        best = nums[0]\n        cur = nums[0]\n        for n in nums[1:]:\n            cur = max(n, cur + n)\n            best = max(best, cur)\n        return best\n`,
    javascript: `var maxSubArray = function(nums) {\n    let best = nums[0], cur = nums[0];\n    for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); }\n    return best;\n};\n`,
    java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int best = nums[0], cur = nums[0];\n        for (int i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); }\n        return best;\n    }\n}\n`,
    cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int best = nums[0], cur = nums[0];\n        for (size_t i = 1; i < nums.size(); i++) { cur = max(nums[i], cur + nums[i]); best = max(best, cur); }\n        return best;\n    }\n};\n`,
  },
  "valid-parentheses": {
    python: `class Solution:\n    def isValid(self, s):\n        pairs = {')':'(', ']':'[', '}':'{'}\n        stack = []\n        for c in s:\n            if c in pairs.values():\n                stack.append(c)\n            else:\n                if not stack or stack.pop() != pairs[c]:\n                    return False\n        return not stack\n`,
    javascript: `var isValid = function(s) {\n    const pairs = {')':'(', ']':'[', '}':'{'};\n    const stack = [];\n    for (const c of s) {\n        if (c === '(' || c === '[' || c === '{') stack.push(c);\n        else if (stack.pop() !== pairs[c]) return false;\n    }\n    return stack.length === 0;\n};\n`,
    java: `import java.util.*;\nclass Solution {\n    public boolean isValid(String s) {\n        Map<Character,Character> pairs = Map.of(')','(', ']','[', '}','{');\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c=='('||c=='['||c=='{') stack.push(c);\n            else {\n                if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n}\n`,
    cpp: `#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    bool isValid(string s) {\n        unordered_map<char,char> pairs = {{')','('},{']','['},{'}','{'}};\n        stack<char> st;\n        for (char c : s) {\n            if (c=='('||c=='['||c=='{') st.push(c);\n            else {\n                if (st.empty() || st.top() != pairs[c]) return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};\n`,
  },
  "climbing-stairs": {
    python: `class Solution:\n    def climbStairs(self, n):\n        a, b = 1, 1\n        for _ in range(n - 1):\n            a, b = b, a + b\n        return b\n`,
    javascript: `var climbStairs = function(n) {\n    let a = 1, b = 1;\n    for (let i = 0; i < n - 1; i++) { [a, b] = [b, a + b]; }\n    return b;\n};\n`,
    java: `class Solution {\n    public int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 0; i < n - 1; i++) { int t = a + b; a = b; b = t; }\n        return b;\n    }\n}\n`,
    cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 0; i < n - 1; i++) { int t = a + b; a = b; b = t; }\n        return b;\n    }\n};\n`,
  },
  "single-number": {
    python: `class Solution:\n    def singleNumber(self, nums):\n        r = 0\n        for n in nums:\n            r ^= n\n        return r\n`,
    javascript: `var singleNumber = function(nums) {\n    return nums.reduce((a, b) => a ^ b, 0);\n};\n`,
    java: `class Solution {\n    public int singleNumber(int[] nums) {\n        int r = 0;\n        for (int n : nums) r ^= n;\n        return r;\n    }\n}\n`,
    cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        int r = 0;\n        for (int n : nums) r ^= n;\n        return r;\n    }\n};\n`,
  },
  "search-insert-position": {
    python: `class Solution:\n    def searchInsert(self, nums, target):\n        lo, hi = 0, len(nums)\n        while lo < hi:\n            mid = (lo + hi) // 2\n            if nums[mid] < target:\n                lo = mid + 1\n            else:\n                hi = mid\n        return lo\n`,
    javascript: `var searchInsert = function(nums, target) {\n    let lo = 0, hi = nums.length;\n    while (lo < hi) { const mid = (lo + hi) >> 1; if (nums[mid] < target) lo = mid + 1; else hi = mid; }\n    return lo;\n};\n`,
    java: `class Solution {\n    public int searchInsert(int[] nums, int target) {\n        int lo = 0, hi = nums.length;\n        while (lo < hi) { int mid = (lo + hi) / 2; if (nums[mid] < target) lo = mid + 1; else hi = mid; }\n        return lo;\n    }\n}\n`,
    cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        int lo = 0, hi = (int)nums.size();\n        while (lo < hi) { int mid = (lo + hi) / 2; if (nums[mid] < target) lo = mid + 1; else hi = mid; }\n        return lo;\n    }\n};\n`,
  },
  "product-of-array-except-self": {
    python: `class Solution:\n    def productExceptSelf(self, nums):\n        n = len(nums)\n        res = [1] * n\n        left = 1\n        for i in range(n):\n            res[i] = left\n            left *= nums[i]\n        right = 1\n        for i in range(n - 1, -1, -1):\n            res[i] *= right\n            right *= nums[i]\n        return res\n`,
    javascript: `var productExceptSelf = function(nums) {\n    const n = nums.length;\n    const res = new Array(n).fill(1);\n    let left = 1;\n    for (let i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }\n    let right = 1;\n    for (let i = n - 1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }\n    return res;\n};\n`,
    java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        int left = 1;\n        for (int i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }\n        int right = 1;\n        for (int i = n - 1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }\n        return res;\n    }\n}\n`,
    cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        int n = nums.size();\n        vector<int> res(n, 1);\n        int left = 1;\n        for (int i = 0; i < n; i++) { res[i] = left; left *= nums[i]; }\n        int right = 1;\n        for (int i = n - 1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }\n        return res;\n    }\n};\n`,
  },
  "move-zeroes": {
    python: `class Solution:\n    def moveZeroes(self, nums):\n        res = [n for n in nums if n != 0]\n        res += [0] * (len(nums) - len(res))\n        return res\n`,
    javascript: `var moveZeroes = function(nums) {\n    const res = nums.filter(n => n !== 0);\n    while (res.length < nums.length) res.push(0);\n    return res;\n};\n`,
    java: `import java.util.*;\nclass Solution {\n    public int[] moveZeroes(int[] nums) {\n        List<Integer> res = new ArrayList<>();\n        int zeros = 0;\n        for (int n : nums) { if (n != 0) res.add(n); else zeros++; }\n        int[] out = new int[nums.length];\n        for (int i = 0; i < res.size(); i++) out[i] = res.get(i);\n        return out;\n    }\n}\n`,
    cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> moveZeroes(vector<int>& nums) {\n        vector<int> res;\n        for (int n : nums) if (n != 0) res.push_back(n);\n        while ((int)res.size() < (int)nums.size()) res.push_back(0);\n        return res;\n    }\n};\n`,
  },
  "rotate-array": {
    python: `class Solution:\n    def rotate(self, nums, k):\n        n = len(nums)\n        k %= n\n        return nums[-k:] + nums[:-k] if k else list(nums)\n`,
    javascript: `var rotate = function(nums, k) {\n    const n = nums.length;\n    k %= n;\n    if (k === 0) return [...nums];\n    return [...nums.slice(-k), ...nums.slice(0, -k)];\n};\n`,
    java: `class Solution {\n    public int[] rotate(int[] nums, int k) {\n        int n = nums.length;\n        k %= n;\n        int[] out = new int[n];\n        for (int i = 0; i < n; i++) out[(i + k) % n] = nums[i];\n        return out;\n    }\n}\n`,
    cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> rotate(vector<int>& nums, int k) {\n        int n = nums.size();\n        k %= n;\n        vector<int> out(n);\n        for (int i = 0; i < n; i++) out[(i + k) % n] = nums[i];\n        return out;\n    }\n};\n`,
  },
  "fizz-buzz": {
    python: `class Solution:\n    def fizzBuzz(self, n):\n        res = []\n        for i in range(1, n + 1):\n            if i % 15 == 0: res.append("FizzBuzz")\n            elif i % 3 == 0: res.append("Fizz")\n            elif i % 5 == 0: res.append("Buzz")\n            else: res.append(str(i))\n        return res\n`,
    javascript: `var fizzBuzz = function(n) {\n    const res = [];\n    for (let i = 1; i <= n; i++) {\n        if (i % 15 === 0) res.push("FizzBuzz");\n        else if (i % 3 === 0) res.push("Fizz");\n        else if (i % 5 === 0) res.push("Buzz");\n        else res.push(String(i));\n    }\n    return res;\n};\n`,
    java: `class Solution {\n    public String[] fizzBuzz(int n) {\n        String[] res = new String[n];\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) res[i-1] = "FizzBuzz";\n            else if (i % 3 == 0) res[i-1] = "Fizz";\n            else if (i % 5 == 0) res[i-1] = "Buzz";\n            else res[i-1] = String.valueOf(i);\n        }\n        return res;\n    }\n}\n`,
    cpp: `#include <vector>\n#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        vector<string> res;\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) res.push_back("FizzBuzz");\n            else if (i % 3 == 0) res.push_back("Fizz");\n            else if (i % 5 == 0) res.push_back("Buzz");\n            else res.push_back(to_string(i));\n        }\n        return res;\n    }\n};\n`,
  },
  "reverse-integer": {
    python: `class Solution:\n    def reverse(self, x):\n        sign = -1 if x < 0 else 1\n        digits = str(abs(x))[::-1]\n        val = sign * int(digits)\n        if val < -2**31 or val > 2**31 - 1:\n            return 0\n        return val\n`,
    javascript: `var reverse = function(x) {\n    const sign = x < 0 ? -1 : 1;\n    const digits = Math.abs(x).toString().split("").reverse().join("");\n    const val = sign * parseInt(digits, 10);\n    if (val < -(2**31) || val > 2**31 - 1) return 0;\n    return val;\n};\n`,
    java: `class Solution {\n    public int reverse(int x) {\n        long r = 0;\n        long xx = x;\n        while (xx != 0) { r = r * 10 + xx % 10; xx /= 10; }\n        if (r < Integer.MIN_VALUE || r > Integer.MAX_VALUE) return 0;\n        return (int) r;\n    }\n}\n`,
    cpp: `class Solution {\npublic:\n    int reverse(int x) {\n        long long r = 0;\n        long long xx = x;\n        while (xx != 0) { r = r * 10 + xx % 10; xx /= 10; }\n        if (r < INT_MIN || r > INT_MAX) return 0;\n        return (int) r;\n    }\n};\n`,
  },
};

async function main() {
  const langs: Language[] = ["python", "javascript", "java", "cpp"];
  let failures = 0;
  let total = 0;
  for (const problemId of Object.keys(solutions)) {
    const problem = getProblem(problemId);
    if (!problem) {
      console.log(`MISSING PROBLEM: ${problemId}`);
      failures++;
      continue;
    }
    for (const lang of langs) {
      total++;
      const code = solutions[problemId][lang];
      const start = Date.now();
      const result = await judgeSubmission(problem, lang, code, true);
      const ms = Date.now() - start;
      const ok = result.status === "accepted";
      if (!ok) failures++;
      console.log(`[${ok ? "PASS" : "FAIL"}] ${problemId} / ${lang} (${ms}ms) -> ${result.status}${result.message ? " :: " + result.message.slice(0, 200) : ""}`);
      if (!ok) {
        for (const o of result.outcomes) {
          if (!o.pass) {
            console.log(`    case ${o.index}: input=${JSON.stringify(o.input)} expected=${JSON.stringify(o.expected)} actual=${JSON.stringify(o.actual)} error=${o.error}`);
          }
        }
      }
    }
  }
  console.log(`\n${total - failures}/${total} passed`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
