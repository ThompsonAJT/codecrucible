import { getProblem } from "../src/problems";
import { judgeSubmission } from "../src/judge/run";
import { Language } from "../src/judge/driverGen";

const solutions: Record<string, Record<Language, string>> = {
  "two-sum": {
    python: `class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            if target - n in seen:
                return [seen[target - n], i]
            seen[n] = i
        return []
`,
    javascript: `var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
    }
    return [];
};
`,
    java: `import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
    cpp: `#include <vector>
#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            auto it = seen.find(need);
            if (it != seen.end()) return {it->second, i};
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
  },
  "valid-anagram": {
    python: `class Solution:
    def isAnagram(self, s, t):
        return sorted(s) == sorted(t)
`,
    javascript: `var isAnagram = function(s, t) {
    if (s.length !== t.length) return false;
    return s.split("").sort().join("") === t.split("").sort().join("");
};
`,
    java: `import java.util.*;
class Solution {
    public boolean isAnagram(String s, String t) {
        char[] a = s.toCharArray();
        char[] b = t.toCharArray();
        Arrays.sort(a);
        Arrays.sort(b);
        return Arrays.equals(a, b);
    }
}
`,
    cpp: `#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        return s == t;
    }
};
`,
  },
  "merge-intervals": {
    python: `class Solution:
    def merge(self, intervals):
        intervals = sorted(intervals, key=lambda x: x[0])
        result = []
        for interval in intervals:
            if result and interval[0] <= result[-1][1]:
                result[-1][1] = max(result[-1][1], interval[1])
            else:
                result.append(list(interval))
        return result
`,
    javascript: `var merge = function(intervals) {
    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    const result = [];
    for (const iv of sorted) {
        if (result.length && iv[0] <= result[result.length - 1][1]) {
            result[result.length - 1][1] = Math.max(result[result.length - 1][1], iv[1]);
        } else {
            result.push([...iv]);
        }
    }
    return result;
};
`,
    java: `import java.util.*;
class Solution {
    public int[][] merge(int[][] intervals) {
        int[][] sorted = intervals.clone();
        Arrays.sort(sorted, (a, b) -> a[0] - b[0]);
        List<int[]> result = new ArrayList<>();
        for (int[] iv : sorted) {
            if (!result.isEmpty() && iv[0] <= result.get(result.size() - 1)[1]) {
                result.get(result.size() - 1)[1] = Math.max(result.get(result.size() - 1)[1], iv[1]);
            } else {
                result.add(iv.clone());
            }
        }
        return result.toArray(new int[0][]);
    }
}
`,
    cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        vector<vector<int>> sorted = intervals;
        std::sort(sorted.begin(), sorted.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] < b[0];
        });
        vector<vector<int>> result;
        for (auto& iv : sorted) {
            if (!result.empty() && iv[0] <= result.back()[1]) {
                result.back()[1] = max(result.back()[1], iv[1]);
            } else {
                result.push_back(iv);
            }
        }
        return result;
    }
};
`,
  },
};

async function main() {
  const langs: Language[] = ["python", "javascript", "java", "cpp"];
  let failures = 0;
  for (const problemId of Object.keys(solutions)) {
    const problem = getProblem(problemId);
    if (!problem) {
      console.log(`MISSING PROBLEM: ${problemId}`);
      failures++;
      continue;
    }
    for (const lang of langs) {
      const code = solutions[problemId][lang];
      const start = Date.now();
      const result = await judgeSubmission(problem, lang, code, true);
      const ms = Date.now() - start;
      const ok = result.status === "accepted";
      if (!ok) failures++;
      console.log(`[${ok ? "PASS" : "FAIL"}] ${problemId} / ${lang} (${ms}ms) -> ${result.status}${result.message ? " :: " + result.message : ""}`);
      if (!ok) {
        for (const o of result.outcomes) {
          if (!o.pass) {
            console.log(`    case ${o.index}: expected=${JSON.stringify(o.expected)} actual=${JSON.stringify(o.actual)} error=${o.error}`);
          }
        }
      }
    }
  }
  console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
