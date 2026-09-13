# 🤖 AI Code Execution Arena

A full-stack MERN/TypeScript application where users submit code, it's executed in a sandboxed environment, and results are ranked on a leaderboard.

## Features

- **Code Submission**: Write JavaScript/TypeScript/Python/C++/Java code and submit for execution.
- **Sandboxed Execution**: Uses `vm2` to safely run untrusted code with timeouts.
- **Leaderboard**: Rankings based on output length (longer output = higher score) and runtime.
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
   cd frontend
   npm run dev   # runs Vite dev server
   ```
   The frontend will be available at `http://localhost:5173`.

### Usage

1. Select a language from the dropdown (JavaScript, Python, C++, Java).
2. Write your code in the textarea.
3. Click "Run & Submit".
4. View the output (or error) and runtime.
5. The leaderboard updates automatically showing the top 10 submissions.

### Notes

- This is a demo application. In a production setting, you would want to:
  - Use a more robust sandboxing solution (like Firecracker or gVisor).
  - Store submissions in a database (MongoDB, PostgreSQL).
  - Add user authentication.
  - Implement a more sophisticated scoring system (e.g., based on correctness for specific problems).
  - Add rate limiting and more security measures.

### License

MIT