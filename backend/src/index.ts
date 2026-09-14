import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import ts from 'typescript';
import { VM } from 'vm2';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5000;

type SupportedLanguage = 'javascript' | 'typescript';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  kind?: 'algorithm' | 'system-design';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  constraints: string[];
  architecture?: string[];
  apiContract?: string[];
  acceptanceRate: number;
  examples: ProblemExample[];
  starterCode: Record<SupportedLanguage, string>;
  testCases: TestCase[];
}

const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    category: 'Arrays',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['Hash Table', 'Array'],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    acceptanceRate: 49.6,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

const test = JSON.parse(input);
console.log(JSON.stringify(twoSum(test.nums, test.target)));`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }

  return [];
}

const test = JSON.parse(input) as { nums: number[]; target: number };
console.log(JSON.stringify(twoSum(test.nums, test.target)));`
    },
    testCases: [
      { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: '[0,1]' },
      { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: '[1,2]' },
      { input: JSON.stringify({ nums: [3, 3], target: 6 }), expectedOutput: '[0,1]' }
    ]
  },
  {
    id: 'reverse-integer',
    title: 'Reverse Integer',
    category: 'Math',
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.`,
    difficulty: 'Medium',
    tags: ['Math'],
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    acceptanceRate: 33.8,
    examples: [
      { input: 'x = 123', output: '321', explanation: '123 reversed is 321.' },
      { input: 'x = -123', output: '-321', explanation: 'The sign is preserved and digits are reversed.' },
      { input: 'x = 120', output: '21', explanation: 'Removing trailing zeros gives 21.' }
    ],
    starterCode: {
      javascript: `function reverse(x) {
  const sign = x < 0 ? -1 : 1;
  const reversed = Number(String(Math.abs(x)).split('').reverse().join('')) * sign;

  if (reversed < -2147483648 || reversed > 2147483647) {
    return 0;
  }

  return reversed;
}

console.log(reverse(-123));`,
      typescript: `function reverse(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const reversed = Number(String(Math.abs(x)).split('').reverse().join('')) * sign;

  if (reversed < -2147483648 || reversed > 2147483647) {
    return 0;
  }

  return reversed;
}

console.log(reverse(-123));`
    },
    testCases: [
      { input: '123', expectedOutput: '321' },
      { input: '-123', expectedOutput: '-321' },
      { input: '120', expectedOutput: '21' },
      { input: '0', expectedOutput: '0' },
      { input: '1534236469', expectedOutput: '0' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'Stacks',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets are closed by the same type of brackets.
- Open brackets are closed in the correct order.`,
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    constraints: ['1 <= s.length <= 10^4', 's consists only of parentheses characters'],
    acceptanceRate: 42.1,
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'The string is balanced.' },
      { input: 's = "([)]"', output: 'false', explanation: 'The closing bracket order is invalid.' }
    ],
    starterCode: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (['(', '[', '{'].includes(ch)) {
      stack.push(ch);
    } else if (stack[stack.length - 1] === map[ch]) {
      stack.pop();
    } else {
      return false;
    }
  }

  return stack.length === 0;
}

console.log(isValid('()[]{}'));`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (['(', '[', '{'].includes(ch)) {
      stack.push(ch);
    } else if (stack[stack.length - 1] === map[ch]) {
      stack.pop();
    } else {
      return false;
    }
  }

  return stack.length === 0;
}

console.log(isValid('()[]{}'));`
    },
    testCases: [
      { input: '()[]{}', expectedOutput: 'true' },
      { input: '(]', expectedOutput: 'false' },
      { input: '{[]}', expectedOutput: 'true' },
      { input: '([)]', expectedOutput: 'false' }
    ]
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Strings',
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    difficulty: 'Medium',
    tags: ['Hash Map', 'String', 'Sliding Window'],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    acceptanceRate: 34.7,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b".' }
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  let left = 0;
  let longest = 0;
  const seen = new Map();

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch)) {
      left = Math.max(left, seen.get(ch) + 1);
    }
    seen.set(ch, right);
    longest = Math.max(longest, right - left + 1);
  }

  return longest;
}

console.log(lengthOfLongestSubstring('abcabcbb'));`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  let left = 0;
  let longest = 0;
  const seen = new Map<string, number>();

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (seen.has(ch)) {
      left = Math.max(left, seen.get(ch)! + 1);
    }
    seen.set(ch, right);
    longest = Math.max(longest, right - left + 1);
  }

  return longest;
}

console.log(lengthOfLongestSubstring('abcabcbb'));`
    },
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' },
      { input: '', expectedOutput: '0' }
    ]
  },
  {
    id: 'merge-sorted-array',
    title: 'Merge Sorted Array',
    category: 'Arrays',
    description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2. Merge nums1 and nums2 into one sorted array.`,
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    constraints: ['nums1.length == m + n', 'nums2.length == n'],
    acceptanceRate: 46.8,
    examples: [
      { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]', explanation: 'The arrays are merged and sorted in-place.' }
    ],
    starterCode: {
      javascript: `function merge(nums1, m, nums2, n) {
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
    k--;
  }

  return nums1;
}

console.log(merge([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3));`,
      typescript: `function merge(nums1: number[], m: number, nums2: number[], n: number): number[] {
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
    k--;
  }

  return nums1;
}

console.log(merge([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3));`
    },
    testCases: [
      { input: '[1,2,3,0,0,0]|3|[2,5,6]|3', expectedOutput: '[1,2,2,3,5,6]' },
      { input: '[1]|1|[]|0', expectedOutput: '[1]' },
      { input: '[0]|0|[1]|1', expectedOutput: '[0,1]' }
    ]
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    category: 'Dynamic Programming',
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.`,
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'Array'],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    acceptanceRate: 52.2,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the maximum sum 6.' }
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  let current = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }

  return best;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`,
      typescript: `function maxSubArray(nums: number[]): number {
  let current = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }

  return best;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' }
    ]
  },
  {
    id: 'distributed-rate-limiter',
    title: 'Design a Distributed Rate Limiter',
    kind: 'system-design',
    category: 'System Design',
    description: `Design a rate limiter that allows at most N requests per user during a rolling time window.

For this executable exercise, implement createRateLimiter(limit, windowMs). It should return an allow(userId, now) function. The sandbox sends a JSON scenario containing requests with userId and timestamp values. Return true when a request is accepted and false when it is throttled.

In a production design, explain how you would make the state shared across API instances, keep decisions fast, and handle clock skew or a Redis failure.`,
    difficulty: 'Hard',
    tags: ['Distributed Systems', 'Redis', 'API Design'],
    constraints: ['Each user has an independent quota', 'The window is rolling, not calendar-based', 'Old timestamps must not block future requests forever'],
    architecture: ['API Gateway receives the request', 'Rate limiter checks shared Redis state with an atomic operation', 'Allowed requests continue to the service; rejected requests return HTTP 429', 'Metrics record allowed, rejected, and backend-error decisions'],
    apiContract: ['createRateLimiter(limit, windowMs) -> allow(userId, now)', 'allow returns boolean', 'Rejected requests should map to HTTP 429 Too Many Requests'],
    acceptanceRate: 27.4,
    examples: [
      { input: 'limit = 2, windowMs = 1000, requests = [0, 100, 200]', output: '[true,true,false]', explanation: 'The third request is rejected because two requests are still inside the rolling window.' },
      { input: 'limit = 2, windowMs = 1000, requests = [0, 100, 1001]', output: '[true,true,true]', explanation: 'The first request has expired by the time 1001 arrives.' }
    ],
    starterCode: {
      javascript: `function createRateLimiter(limit, windowMs) {
  const requestsByUser = new Map();

  return function allow(userId, now) {
    const timestamps = requestsByUser.get(userId) ?? [];
    const active = timestamps.filter(timestamp => now - timestamp < windowMs);

    if (active.length >= limit) {
      requestsByUser.set(userId, active);
      return false;
    }

    active.push(now);
    requestsByUser.set(userId, active);
    return true;
  };
}

const scenario = JSON.parse(input);
const allow = createRateLimiter(scenario.limit, scenario.windowMs);
const decisions = scenario.requests.map(request => allow(request.userId, request.timestamp));
console.log(JSON.stringify(decisions));`,
      typescript: `function createRateLimiter(limit: number, windowMs: number) {
  const requestsByUser = new Map<string, number[]>();

  return function allow(userId: string, now: number): boolean {
    const timestamps = requestsByUser.get(userId) ?? [];
    const active = timestamps.filter(timestamp => now - timestamp < windowMs);

    if (active.length >= limit) {
      requestsByUser.set(userId, active);
      return false;
    }

    active.push(now);
    requestsByUser.set(userId, active);
    return true;
  };
}

const scenario = JSON.parse(input) as { limit: number; windowMs: number; requests: Array<{ userId: string; timestamp: number }> };
const allow = createRateLimiter(scenario.limit, scenario.windowMs);
const decisions = scenario.requests.map(request => allow(request.userId, request.timestamp));
console.log(JSON.stringify(decisions));`
    },
    testCases: [
      { input: JSON.stringify({ limit: 2, windowMs: 1000, requests: [{ userId: 'ada', timestamp: 0 }, { userId: 'ada', timestamp: 100 }, { userId: 'ada', timestamp: 200 }] }), expectedOutput: '[true,true,false]' },
      { input: JSON.stringify({ limit: 2, windowMs: 1000, requests: [{ userId: 'ada', timestamp: 0 }, { userId: 'ada', timestamp: 100 }, { userId: 'ada', timestamp: 1001 }] }), expectedOutput: '[true,true,true]' },
      { input: JSON.stringify({ limit: 1, windowMs: 500, requests: [{ userId: 'ada', timestamp: 0 }, { userId: 'grace', timestamp: 10 }, { userId: 'ada', timestamp: 20 }, { userId: 'grace', timestamp: 600 }] }), expectedOutput: '[true,true,false,true]' }
    ]
  }
];

interface Submission {
  id: string;
  problemId: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
  passedTestCases: number;
  totalTestCases: number;
  runtimeMs: number | null;
  timestamp: number;
  output?: string | null;
  error?: string | null;
}

const submissions: Submission[] = [];

function transpileCode(code: string, language: SupportedLanguage): string {
  if (language === 'javascript') {
    return code;
  }

  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  });

  return result.outputText;
}

function runInSandbox(code: string, input: string | null, language: SupportedLanguage): { output: string | null; error: string | null; runtimeMs: number } {
  const start = Date.now();
  const captured: string[] = [];
  const formatValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'undefined') return '';
    if (typeof value === 'function') return value.toString();
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const vm = new VM({
    timeout: 1000,
    sandbox: {
      console: {
        log: (...args: any[]) => captured.push(args.map(formatValue).join(' ')),
        error: (...args: any[]) => captured.push(args.map(formatValue).join(' ')),
        warn: (...args: any[]) => captured.push(args.map(formatValue).join(' ')),
        info: (...args: any[]) => captured.push(args.map(formatValue).join(' '))
      },
      ...(input !== null ? { input } : {})
    }
  });

  let output: string | null = null;
  let error: string | null = null;

  try {
    const normalizedCode = transpileCode(code, language);
    const wrapped = `(function() { ${normalizedCode} })()`;
    const result = vm.run(wrapped);
    output = captured.length > 0 ? captured.join('\n') : result !== undefined && result !== null ? String(result) : '';
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const runtimeMs = Date.now() - start;
  return { output, error, runtimeMs };
}

function evaluateSubmission(problem: Problem, code: string, language: SupportedLanguage) {
  let passed = 0;
  let totalRuntime = 0;
  let status: Submission['status'] = 'Accepted';
  let errorMsg: string | null = null;
  let output: string | null = null;

  for (const tc of problem.testCases) {
    const result = runInSandbox(code, tc.input, language);
    totalRuntime += result.runtimeMs;
    output = result.output;

    if (result.error !== null) {
      status = 'Runtime Error';
      errorMsg = result.error;
      break;
    }

    const out = (result.output ?? '').trim();
    const expected = tc.expectedOutput.trim();

    if (out === expected) {
      passed++;
    } else if (status === 'Accepted') {
      status = 'Wrong Answer';
      errorMsg = `Expected "${expected}" but got "${out}"`;
    }
  }

  if (status === 'Accepted' && passed !== problem.testCases.length) {
    status = 'Wrong Answer';
  }

  return {
    status,
    passedTestCases: passed,
    totalTestCases: problem.testCases.length,
    runtimeMs: passed === problem.testCases.length ? totalRuntime / problem.testCases.length : null,
    output,
    error: errorMsg
  };
}

const getRouteParam = (value: string | string[] | undefined): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
};

app.get('/api/problems', (_req: Request, res: Response) => {
  const problemsWithoutTestCases = problems.map(({ testCases, ...rest }) => rest);
  res.json({ problems: problemsWithoutTestCases });
});

app.get('/api/problems/:id', (req: Request, res: Response) => {
  const problemId = getRouteParam(req.params.id);
  if (!problemId) {
    return res.status(400).json({ error: 'Invalid problem id' });
  }

  const problem = problems.find(p => p.id === problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const { testCases, ...problemWithoutTestCases } = problem;
  const testCasesWithoutExpected = testCases.map(tc => ({ input: tc.input, expectedOutput: null }));
  res.json({ problem: { ...problemWithoutTestCases, testCases: testCasesWithoutExpected } });
});

app.post('/api/run/:problemId', (req: Request, res: Response) => {
  const problemId = getRouteParam(req.params.problemId);
  if (!problemId) {
    return res.status(400).json({ error: 'Invalid problem id' });
  }

  const { code, language } = req.body;
  const problem = problems.find(p => p.id === problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  if (!['javascript', 'typescript'].includes(language)) {
    return res.status(400).json({ error: `Language ${language} not supported yet.` });
  }

  const result = evaluateSubmission(problem, code, language as SupportedLanguage);
  res.json({ result });
});

app.post('/api/sandbox', (req: Request, res: Response) => {
  const { code, language, input } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  if (!['javascript', 'typescript'].includes(language)) {
    return res.status(400).json({ error: `Language ${language} not supported yet.` });
  }

  if (typeof input !== 'string') {
    return res.status(400).json({ error: 'Input must be a JSON string' });
  }

  try {
    JSON.parse(input);
  } catch {
    return res.status(400).json({ error: 'Input must contain valid JSON' });
  }

  const result = runInSandbox(code, input, language as SupportedLanguage);
  res.json({ result });
});

app.post('/api/submit/:problemId', (req: Request, res: Response) => {
  const problemId = getRouteParam(req.params.problemId);
  if (!problemId) {
    return res.status(400).json({ error: 'Invalid problem id' });
  }

  const { code, language } = req.body;
  const problem = problems.find(p => p.id === problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  if (!['javascript', 'typescript'].includes(language)) {
    return res.status(400).json({ error: `Language ${language} not supported yet.` });
  }

  const result = evaluateSubmission(problem, code, language as SupportedLanguage);
  const id = Math.random().toString(36).slice(2, 10);
  const submission: Submission = {
    id,
    problemId,
    code,
    language,
    status: result.status,
    passedTestCases: result.passedTestCases,
    totalTestCases: result.totalTestCases,
    runtimeMs: result.runtimeMs,
    timestamp: Date.now(),
    output: result.output,
    error: result.error
  };

  submissions.push(submission);
  if (submissions.length > 100) submissions.shift();

  res.json({ submission });
});

app.get('/api/leaderboard/:problemId', (req: Request, res: Response) => {
  const problemId = getRouteParam(req.params.problemId);
  if (!problemId) {
    return res.status(400).json({ error: 'Invalid problem id' });
  }

  const problemSubmissions = submissions.filter(s => s.problemId === problemId);
  const leaderboard = [...problemSubmissions]
    .sort((a, b) => {
      if (b.passedTestCases !== a.passedTestCases) return b.passedTestCases - a.passedTestCases;
      if (a.runtimeMs !== null && b.runtimeMs !== null) {
        if (a.runtimeMs !== b.runtimeMs) return a.runtimeMs - b.runtimeMs;
      } else if (a.runtimeMs === null && b.runtimeMs !== null) {
        return 1;
      } else if (a.runtimeMs !== null && b.runtimeMs === null) {
        return -1;
      }
      return a.timestamp - b.timestamp;
    })
    .slice(0, 10);

  res.json({ leaderboard });
});

app.get('/api/submissions', (_req: Request, res: Response) => {
  res.json({ submissions: [...submissions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50) });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`?? AI Code Execution Arena backend running on port ${PORT}`);
});