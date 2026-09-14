import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [status, setStatus] = useState<'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | null>(null);
  const [passedTestCases, setPassedTestCases] = useState(0);
  const [totalTestCases, setTotalTestCases] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProblems();
    // If there's a problem selected, fetch its leaderboard
    if (selectedProblemId) {
      fetchLeaderboard(selectedProblemId);
    }
  }, [selectedProblemId]);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${API_URL}/problems`);
      setProblems(res.data.problems);
      // Select the first problem by default if none selected
      if (!selectedProblemId && problems.length === 0 && res.data.problems.length > 0) {
        setSelectedProblemId(res.data.problems[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch problems', err);
    }
  };

  const handleProblemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const problemId = e.target.value;
    setSelectedProblemId(problemId);
    setProblem(null); // reset problem details
    setCode('');
    setOutput(null);
    setError(null);
    setRuntime(null);
    setStatus(null);
    setPassedTestCases(0);
    setTotalTestCases(0);
    setLeaderboard([]);
    fetchProblemDetails(problemId);
    fetchLeaderboard(problemId);
  };

  const fetchProblemDetails = (problemId: string) => {
    axios.get(`${API_URL}/problems/${problemId}`)
      .then(res => {
        setProblem(res.data.problem);
      })
      .catch(err => console.error('Failed to fetch problem details', err));
  };

  const fetchLeaderboard = (problemId: string) => {
    axios.get(`${API_URL}/leaderboard/${problemId}`)
      .then(res => {
        setLeaderboard(res.data.leaderboard);
      })
      .catch(err => console.error('Failed to fetch leaderboard', err));
  };

  const submitCode = async () => {
    if (!problem || !selectedProblemId) return;
    setSubmitting(true);
    setLoading(true);
    setOutput(null);
    setError(null);
    setRuntime(null);
    setStatus(null);
    setPassedTestCases(0);
    setTotalTestCases(0);
    try {
      const res = await axios.post(`${API_URL}/submit/${selectedProblemId}`, {
        code,
        language
      });
      const sub = res.data.submission;
      setOutput(sub.output ?? '');
      setError(sub.error);
      setRuntime(sub.runtimeMs);
      setStatus(sub.status);
      setPassedTestCases(sub.passedTestCases);
      setTotalTestCases(sub.totalTestCases);
      // refresh leaderboard for this problem
      fetchLeaderboard(selectedProblemId);
    } catch (err) {
      setError('Submission failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!problems.length) {
    return (
      <div className="App">
        <p>Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 AI Code Execution Arena</h1>
        <p>LeetCode-style coding challenge platform</p>
      </header>
      <main className="App-main">
        <section className="problem-selector">
          <h2>Select a Problem</h2>
          <select
            value={selectedProblemId || ''}
            onChange={handleProblemChange}
            className="problem-select"
            disabled={loading}
          >
            <option value="">-- Select a Problem --</option>
            {problems.map(p => (
              <option key={p.id} value={p.id}>
                [{p.difficulty}] {p.title}
              </option>
            ))}
          </select>
        </section>

        {problem && (
          <section className="problem-detail">
            <h2>{problem.title}</h2>
            <div className="difficulty-badge">{problem.difficulty}</div>
            <p>{problem.description}</p>
          </section>
        )}

        {selectedProblemId && !problem ? (
          <p className="loading">Loading problem details...</p>
        ) : null}

        {problem && (
          <section className="code-section">
            <h2>Write Your Solution</h2>
            <div className="controls">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
                disabled={submitting}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
              <button
                onClick={submitCode}
                disabled={submitting || !code.trim()}
                className="submit-btn"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              className="code-input"
            />
          </section>
        )}

        {problem && (
          <section className="result-section">
            <h2>Result</h2>
            {loading && <p className="loading">Running test cases...</p>}
            {error && !status && (
              <div className="result error">
                <h3>Error:</h3>
                <pre>{error}</pre>
              </div>
            )}
            {status && (
              <div className={`result ${status.toLowerCase()}`}>
                <h3>Status: {status}</h3>
                {error && (
                  <div>
                    <p>Error: {error}</p>
                  </div>
                )}
                {output !== null && output !== '' && status !== 'Runtime Error' && (
                  <div>
                    <p>Output:</p>
                    <pre>{output}</pre>
                  </div>
                )}
                {runtime !== null && (
                  <p>Average Runtime: {runtime.toFixed(2)} ms</p>
                )}
                <p>
                  Test Cases: {passedTestCases} / {totalTestCases} passed
                </p>
              </div>
            )}
          </section>
        )}

        {selectedProblemId && (
          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            {leaderboard.length === 0 ? (
              <p className="empty">No submissions yet for this problem. Be the first!</p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Passed</th>
                    <th>Runtime (ms)</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td>{idx + 1}</td>
                      <td>{sub.language}</td>
                      <td>
                        <span className={`status-badge ${sub.status.toLowerCase()}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>{sub.passedTestCases}/{sub.totalTestCases}</td>
                      <td>{sub.runtimeMs !== null ? sub.runtimeMs.toFixed(2) : 'N/A'}</td>
                      <td>{new Date(sub.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;