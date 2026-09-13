import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const submitCode = async () => {
    setLoading(true);
    setOutput(null);
    setError(null);
    setRuntime(null);
    try {
      const res = await axios.post(`${API_URL}/submit`, { code, language });
      const sub = res.data.submission;
      setOutput(sub.output);
      setError(sub.error);
      setRuntime(sub.runtimeMs);
      // refresh leaderboard
      fetchLeaderboard();
    } catch (err) {
      setError('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/leaderboard`);
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Poll leaderboard every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 AI Code Execution Arena</h1>
        <p>Submit code, see output, and compete on the leaderboard!</p>
      </header>
      <main className="App-main">
        <section className="code-section">
          <h2>Write Code</h2>
          <div className="controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button onClick={submitCode} disabled={loading} className="submit-btn">
              {loading ? 'Running...' : 'Run & Submit'}
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="code-input"
          />
        </section>

        <section className="result-section">
          <h2>Result</h2>
          {loading && <p className="loading">Running...</p>}
          {error && (
            <div className="result error">
              <h3>Error:</h3>
              <pre>{error}</pre>
            </div>
          )}
          {output !== null && output !== '' && !error && (
            <div className="result output">
              <h3>Output:</h3>
              <pre>{output}</pre>
            </div>
          )}
          {runtime !== null && !error && (
            <div className="result runtime">
              Runtime: {runtime} ms
            </div>
          )}
        </section>

        <section className="leaderboard-section">
          <h2>Leaderboard (Top 10)</h2>
          {leaderboard.length === 0 ? (
            <p className="empty">No submissions yet. Be the first!</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Score</th>
                  <th>Runtime (ms)</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((sub, idx) => (
                  <tr key={sub.id}>
                    <td>{idx + 1}</td>
                    <td>{sub.language}</td>
                    <td>{sub.score}</td>
                    <td>{sub.runtimeMs ?? 'N/A'}</td>
                    <td>{new Date(sub.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;