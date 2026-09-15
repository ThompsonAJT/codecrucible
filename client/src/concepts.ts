export interface Concept {
  id: string;
  label: string;
  summary: string;
  whenToUse: string;
  keyIdea: string;
  complexity: string;
  pitfall: string;
  snippet: string;
}

export const CONCEPTS: Concept[] = [
  {
    id: "array",
    label: "Array",
    summary: "A contiguous, indexable block of values — the default container for almost every problem here.",
    whenToUse: "Whenever you need ordered data with O(1) access by index.",
    keyIdea: "Most array problems boil down to choosing what to track while scanning once: a running max/min, a count, a set of seen values, or a window boundary.",
    complexity: "Index access O(1); search O(n) unless sorted or indexed by a hash map.",
    pitfall: "Off-by-one errors at the boundaries — double check whether a loop should use < length or <= length - 1.",
    snippet: "for i, n in enumerate(nums):\n    # track something as you go\n    best = max(best, n)",
  },
  {
    id: "hash-table",
    label: "Hash Table",
    summary: "A map/dict/set giving average O(1) lookup, insert, and delete by key.",
    whenToUse: "Anytime you'd otherwise need a nested loop to check \"have I seen this value / its complement before?\"",
    keyIdea: "Trade space for time: store what you've seen (value -> index, or just a set) so a second pass — or the rest of the same pass — becomes a lookup instead of a scan.",
    complexity: "O(1) average per operation, O(n) overall to build; O(n) worst case if many hash collisions.",
    pitfall: "Forgetting to check membership *before* inserting the current element, which can let an element pair with itself.",
    snippet: "seen = {}\nfor i, n in enumerate(nums):\n    if target - n in seen:\n        return [seen[target - n], i]\n    seen[n] = i",
  },
  {
    id: "string",
    label: "String",
    summary: "An ordered sequence of characters — usually immutable, so 'modifying' one means building a new one.",
    whenToUse: "Text/parenthesis validation, anagram/permutation checks, character frequency problems.",
    keyIdea: "Two common approaches: (1) count character frequencies with a hash map or 26-length array, or (2) sort the string and compare.",
    complexity: "Sorting a string is O(n log n); frequency counting is O(n).",
    pitfall: "Assuming strings are mutable in-place (they aren't in Python/Java/JS) — you're always creating new strings unless you drop to a char array/list.",
    snippet: "from collections import Counter\nCounter(s) == Counter(t)  # anagram check",
  },
  {
    id: "sorting",
    label: "Sorting",
    summary: "Reordering data so a greedy scan or two-pointer pass becomes possible.",
    whenToUse: "Problems about intervals, k-th smallest/largest, or where relative order lets you make local greedy decisions.",
    keyIdea: "Sort first, then the rest of the problem often collapses into a single linear pass (e.g. merge overlapping intervals by comparing each to the last kept one).",
    complexity: "O(n log n) for comparison sorts; the pass afterward is usually O(n).",
    pitfall: "Forgetting to sort by the right key (e.g. by interval start, not by interval end).",
    snippet: "items.sort(key=lambda x: x[0])",
  },
  {
    id: "dynamic-programming",
    label: "Dynamic Programming",
    summary: "Solve a problem by combining answers to smaller overlapping subproblems, so you never recompute the same thing twice.",
    whenToUse: "When brute force explores overlapping cases (e.g. \"ways to reach step n\" depends on \"ways to reach n-1\" and \"n-2\").",
    keyIdea: "Define the state (what does dp[i] mean?), find the recurrence relating it to smaller states, then decide if you need the whole table or just the last couple of values (rolling variables).",
    complexity: "Usually O(n) or O(n*m) time with matching space, often reducible to O(1) extra space with rolling variables.",
    pitfall: "Not identifying the base case(s) correctly, or recomputing without memoizing (defeats the purpose).",
    snippet: "a, b = 1, 1\nfor _ in range(n - 1):\n    a, b = b, a + b  # rolling instead of a full array",
  },
  {
    id: "stack",
    label: "Stack",
    summary: "A last-in-first-out (LIFO) structure: push to add, pop to remove the most recently added item.",
    whenToUse: "Matching/nesting problems (parentheses, tags), or \"find the nearest previous/next element that satisfies X\" (monotonic stack).",
    keyIdea: "For matching problems: push openers, and on a closer, check the top of the stack matches before popping.",
    complexity: "O(n) to process n elements, each pushed/popped at most once.",
    pitfall: "Forgetting to check the stack isn't empty before popping, and forgetting to check it's fully empty at the end (unmatched openers).",
    snippet: "stack = []\nfor c in s:\n    if c in openers:\n        stack.append(c)\n    elif not stack or stack.pop() != match[c]:\n        return False\nreturn not stack",
  },
  {
    id: "math",
    label: "Math",
    summary: "Problems solved with arithmetic reasoning rather than a data structure — digit manipulation, modular arithmetic, counting.",
    whenToUse: "Digit reversal, divisibility rules (FizzBuzz), overflow-bounded results.",
    keyIdea: "Peel off digits with % 10 and // 10; watch explicit numeric bounds (e.g. 32-bit signed integer overflow) if the problem states them.",
    complexity: "Usually O(log n) for digit-based problems (number of digits), O(n) for counting problems.",
    pitfall: "Ignoring integer overflow/range limits explicitly stated in the problem, especially in Java/C++.",
    snippet: "digits = []\nwhile x:\n    digits.append(x % 10)\n    x //= 10",
  },
  {
    id: "bit-manipulation",
    label: "Bit Manipulation",
    summary: "Operating directly on the binary representation of numbers with &, |, ^, ~, <<, >>.",
    whenToUse: "Finding a unique element among duplicates, toggling flags, or when a problem hints at O(1) space with no extra data structure.",
    keyIdea: "XOR is the workhorse: a ^ a = 0 and a ^ 0 = a, so XOR-ing every element cancels all duplicates, leaving only the odd one out.",
    complexity: "O(n) time, O(1) space — usually faster and lighter than a hash-set equivalent.",
    pitfall: "Assuming XOR tricks generalize to \"appears twice except one\" when the problem is actually \"appears three times except one\" (needs a different bit-counting approach).",
    snippet: "result = 0\nfor n in nums:\n    result ^= n",
  },
  {
    id: "binary-search",
    label: "Binary Search",
    summary: "Repeatedly halve a sorted search space to find a target or insertion point in O(log n).",
    whenToUse: "The array is sorted (or the answer space is monotonic) and you need faster than O(n) search.",
    keyIdea: "Maintain [lo, hi), compute mid, and shrink whichever half can't contain the answer. Keep the invariant explicit so you don't get an off-by-one infinite loop.",
    complexity: "O(log n) time, O(1) space.",
    pitfall: "Using lo <= hi with mid = (lo+hi)//2 style bounds inconsistently — pick one invariant ([lo, hi) or [lo, hi]) and stick to it throughout the loop.",
    snippet: "lo, hi = 0, len(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if nums[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid\nreturn lo",
  },
  {
    id: "prefix-sum",
    label: "Prefix Sum",
    summary: "Precompute running totals (or products) so any range query becomes O(1) instead of O(n).",
    whenToUse: "Repeated \"sum/product of this subrange\" queries, or \"everything except this index\" problems.",
    keyIdea: "Build prefix[i] = combine(prefix[i-1], nums[i]). For \"except self\" problems, combine a prefix pass (left of i) with a suffix pass (right of i).",
    complexity: "O(n) to build, O(1) per range query afterward.",
    pitfall: "Off-by-one in whether prefix[i] includes index i itself — decide the convention up front and use it consistently.",
    snippet: "left = 1\nfor i in range(n):\n    res[i] = left\n    left *= nums[i]\n# then multiply in a suffix pass from the right",
  },
  {
    id: "two-pointers",
    label: "Two Pointers",
    summary: "Walk two indices through a structure (often from opposite ends, or at different speeds) instead of nesting two loops.",
    whenToUse: "In-place partitioning (move zeroes), reversing/rotating in place, or scanning a sorted array from both ends.",
    keyIdea: "One pointer tracks \"where the next valid element should go\", the other scans forward; swap or write between them as conditions are met.",
    complexity: "O(n) time, O(1) extra space — the main appeal over a nested-loop O(n^2) approach.",
    pitfall: "Forgetting to advance both pointers correctly, causing an infinite loop or skipped element.",
    snippet: "write = 0\nfor read in range(len(nums)):\n    if nums[read] != 0:\n        nums[write], nums[read] = nums[read], nums[write]\n        write += 1",
  },
];

export function getConcept(id: string): Concept | undefined {
  return CONCEPTS.find((c) => c.id === id);
}
