import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { VM } from 'vm2';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5000;

// In-memory storage
interface Submission {
  id: string;
  code: string;
  language: string;
  output: string | null;
  error: string | null;
  runtimeMs: number | null;
  timestamp: number;
  score: number; // higher is better (e.g., based on output length or correctness? we'll define a simple metric)
}

// For demo, we'll rank by output length (longer output = higher score) if no error.
const submissions: Submission[] = [];

function runInSandbox(code: string): { output: string | null; error: string | null; runtimeMs: number } {
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
      }
    }
  });

  let output: string | null = null;
  let error: string | null = null;
  try {
    const result = vm.run(`(function () { ${code} })()`);
    output = captured.length > 0
      ? captured.join('\n')
      : result !== undefined && result !== null ? String(result) : '';
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const runtimeMs = Date.now() - start;
  return { output, error, runtimeMs };
}

app.post('/api/submit', (req: Request, res: Response) => {
  const { code, language } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }
  const { output, error, runtimeMs } = runInSandbox(code);
  const id = Math.random().toString(36).substr(2, 9);
  // Simple scoring: if no error, score = output length; else score = 0
  const score = error === null ? (output ?? '').length : 0;
  const submission: Submission = {
    id,
    code,
    language: language || 'javascript',
    output,
    error,
    runtimeMs,
    timestamp: Date.now(),
    score,
  };
  submissions.push(submission);
  // Keep only last 100 submissions
  if (submissions.length > 100) submissions.shift();
  res.json({ submission });
});

app.get('/api/leaderboard', (_req: Request, res: Response) => {
  // Sort by score descending, then by timestamp ascending
  const leaderboard = [...submissions].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timestamp - b.timestamp;
  }).slice(0, 10);
  res.json({ leaderboard });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Code Execution Arena backend running on port ${PORT}`);
});