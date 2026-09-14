import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { VM } from 'vm2';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5000;

// ============ In-memory Data ============

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  // languages allowed: we'll support javascript and typescript (node)
  // For simplicity, we assume the solution is JavaScript/TypeScript code that reads from a global `input` variable
  // and writes output via console.log.
}

// Sample problems
const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]
`,
    difficulty: 'Easy',
    testCases: [
      {
        input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
        expectedOutput: '0,1'
      },
      {
        input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
        expectedOutput: '1,2'
      },
      {
        input: JSON.stringify({ nums: [3, 3], target: 6 }),
        expectedOutput: '0,1'
      }
    ]
  },
  {
    id: 'reverse-integer',
    title: 'Reverse Integer',
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).

Example 1:
Input: x = 123
Output: 321

Example 2:
Input: x = -123
Output: -321

Example 3:
Input: x = 120
Output: 21
`,
    difficulty: 'Medium',
    testCases: [
      { input: '123', expectedOutput: '321' },
      { input: '-123', expectedOutput: '-321' },
      { input: '120', expectedOutput: '21' },
      { input: '0', expectedOutput: '0' },
      { input: '1534236469', expectedOutput: '0' } // overflow
    ]
  }
];

interface Submission {
  id: string;
  problemId: string;
  code: string;
  language: string; // 'javascript' or 'typescript'
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded';
  passedTestCases: number;
  totalTestCases: number;
  runtimeMs: number | null;
  timestamp: number;
}

const submissions: Submission[] = [];

// ============ Sandbox Execution ============

function runInSandbox(code: string, input: string | null): { output: string | null; error: string | null; runtimeMs: number } {
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
    timeout: 1000, // 1 second
    sandbox: {
      console: {
        log: (...args: any[]) => {
          captured.push(args.map(formatValue).join(' '));
        },
        error: (...args: any[]) => {
          captured.push(args.map(formatValue).join(' '));
        },
        warn: (...args: any[]) => {
          captured.push(args.map(formatValue).join(' '));
        },
        info: (...args: any[]) => {
          captured.push(args.map(formatValue).join(' '));
        }
      },
      // Provide input as a global variable if given
      ...(input !== null ? { input } : {})
    }
  });

  let output: string | null = null;
  let error: string | null = null;
  try {
    // Wrap user code in a function to isolate scope and provide input
    const wrapped = `(function() { ${code} })()`;
    const result = vm.run(wrapped);
    output = captured.length > 0
      ? captured.join('\n')
      : result !== undefined && result !== null ? String(result) : '';
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const runtimeMs = Date.now() - start;
  return { output, error, runtimeMs };
}

// ============ API Routes ============

app.get('/api/problems', (_req: Request, res: Response) => {
  // Return problems without test cases (to avoid leaking expected outputs)
  const problemsWithoutTestCases = problems.map(({ testCases, ...rest }) => rest);
  res.json({ problems: problemsWithoutTestCases });
});

app.get('/api/problems/:id', (req: Request, res: Response) => {
  const problem = problems.find(p => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  // Return full problem (including test cases) for the client to verify? In real LeetCode, test cases are hidden.
  // We'll hide expectedOutput but keep input for transparency? Actually we should hide both.
  // For demo, we'll return the problem without expectedOutput.
  const { testCases, ...problemWithoutTestCases } = problem;
  // We'll send test cases with expectedOutput hidden (maybe null)
  const testCasesWithoutExpected = testCases.map(tc => ({ input: tc.input, expectedOutput: null }));
  res.json({ problem: { ...problemWithoutTestCases, testCases: testCasesWithoutExpected } });
});

app.post('/api/submit/:problemId', (req: Request, res: Response) => {
  const { problemId } = req.params;
  const { code, language } = req.body;

  const problem = problems.find(p => p.id === problemId);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  // We only support javascript/typescript for now
  if (!['javascript', 'typescript'].includes(language)) {
    return res.status(400).json({ error: `Language ${language} not supported yet.` });
  }

  let passed = 0;
  let totalRuntime = 0;
  let status: Submission['status'] = 'Accepted';
  let errorMsg: string | null = null;

  for (const tc of problem.testCases) {
    const { output, error, runtimeMs } = runInSandbox(code, tc.input);
    totalRuntime += runtimeMs;
    if (error !== null) {
      status = 'Runtime Error';
      errorMsg = error;
      break;
    }
    // Trim output and expected output for comparison
    const out = (output ?? '').trim();
    const expected = tc.expectedOutput.trim();
    if (out === expected) {
      passed++;
    } else {
      if (status === 'Accepted') {
        status = 'Wrong Answer';
        errorMsg = `Expected "${expected}" but got "${out}"`;
      }
    }
  }

  // Determine final status
  if (status === 'Accepted' && passed === problem.testCases.length) {
    status = 'Accepted';
  } else if (status === 'Wrong Answer') {
    // already set
  } else if (status === 'Runtime Error') {
    // already set
  } else {
    // fallback
    status = 'Wrong Answer';
  }

  const id = Math.random().toString(36).substr(2, 9);
  const submission: Submission = {
    id,
    problemId,
    code,
    language,
    status,
    passedTestCases: passed,
    totalTestCases: problem.testCases.length,
    runtimeMs: passed === problem.testCases.length ? totalRuntime / problem.testCases.length : null,
    timestamp: Date.now()
  };

  submissions.push(submission);
  // Keep only last 100 submissions overall
  if (submissions.length > 100) submissions.shift();

  res.json({ submission });
});

app.get('/api/leaderboard/:problemId', (req: Request, res: Response) => {
  const { problemId } = req.params;
  const problemSubmissions = submissions.filter(s => s.problemId === problemId);
  // Sort by: most passed test cases, then least runtime, then earliest timestamp
  const leaderboard = [...problemSubmissions]
    .sort((a, b) => {
      if (b.passedTestCases !== a.passedTestCases) return b.passedTestCases - a.passedTestCases;
      if (a.runtimeMs !== null && b.runtimeMs !== null) {
        if (a.runtimeMs !== b.runtimeMs) return a.runtimeMs - b.runtimeMs;
      } else if (a.runtimeMs === null && b.runtimeMs !== null) {
        return 1; // a worse (null runtime)
      } else if (a.runtimeMs !== null && b.runtimeMs === null) {
        return -1; // b worse
      }
      return a.timestamp - b.timestamp;
    })
    .slice(0, 10);
  res.json({ leaderboard });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Code Execution Arena backend running on port ${PORT}`);
});