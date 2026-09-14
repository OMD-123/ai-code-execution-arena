# 🤖 AI Code Execution Arena

A full-stack MERN/TypeScript application inspired by LeetCode, where users solve coding problems, submit code in a sandboxed environment, and compete on leaderboards.

## Features

- **Problem Set**: LeetCode-style problems with descriptions, difficulties, and hidden test cases.
- **Multiple Languages**: Submit solutions in JavaScript or TypeScript (Node.js).
- **Sandboxed Execution**: Uses `vm2` to safely run untrusted code with timeouts and console output capture.
- **Verdict System**: Get instant feedback: Accepted, Wrong Answer, Runtime Error.
- **Leaderboard**: Ranked by number of passed test cases, then fastest average runtime, then earliest submission.
- **Real-time Updates**: Leaderboard updates every 5 seconds.
- **Responsive Design**: Works on mobile and desktop.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TypeScript, Vite
- **Sandboxing**: vm2
- **State**: In-memory (for demo purposes)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OMD-123/ai-code-execution-arena.git
   cd ai-code-execution-arena
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev   # uses ts-node-dev for hot reloading
   ```
   The backend will run on `http://localhost:5000`.

2. In a new terminal, start the frontend:
   ```bash
   cd ../frontend
   npm run dev   # runs Vite dev server
   ```
   The frontend will be available at `http://localhost:5173`.

### Usage

1. Select a problem from the dropdown (e.g., Two Sum, Reverse Integer).
2. Read the problem description and difficulty.
3. Select a language (JavaScript or TypeScript).
4. Write your solution in the textarea.
5. Click "Submit".
6. View the verdict (Accepted/Wrong Answer/Runtime Error), output, runtime, and test case results.
7. The leaderboard for the problem updates automatically showing the top 10 submissions.

### Sample Problems Included

- **Two Sum** (Easy): Find indices of two numbers that add up to a target.
- **Reverse Integer** (Medium): Reverse digits of a 32-bit signed integer.

### Notes

- This is a demo application. In a production setting, you would want to:
  - Use a more robust sandboxing solution (like Firecracker or gVisor).
  - Store submissions and problems in a database (MongoDB, PostgreSQL).
  - Add user authentication.
  - Expand the problem set with more LeetCode-style questions.
  - Implement a more sophisticated scoring system.
  - Add rate limiting and more security measures.

### License

MIT