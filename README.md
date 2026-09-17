# Wordle Solver

## Summary

An automated Wordle solver client and CLI tool designed for the Votee Wordle API (`daily`, `random`, and `word` endpoints). The solver uses frequency-based heuristics and candidate filtering to guess target words step-by-step.

---

## Instructions

### 1. Pre-generate Candidates

Before running the solver, generate the candidate word lists grouped by length:

```bash
node scripts/init-candidates.js
```

This fetches the alpha word list and generates pre-partitioned JSON files in `candidates/{size}.json`.

### 2. Run the Solver

You can run the solver either via Node.js (server side) or directly in a web browser (client side):

- **Option A: Server Side (Node.js)**

  ```bash
  node src/solver.js
  ```

  _(Configure `API_URL` directly in `src/solver.js` if targeting different modes or sizes)._

- **Option B: Client Side (Web UI)**
  Serve the project folder using any local HTTP server (required for ES modules and fetching JSON files):
  ```bash
  npx serve .
  # or: python3 -m http.server
  ```
  Open `http://localhost:3000/src/index.html` in your browser, pick your API mode (`daily`, `random`, or `word`), configure inputs, and click **Solve Wordle**.

---

## Algorithm

1. **Optimal Candidate Selection (Frequency Heuristic)**:
   - Calculate letter frequencies across all remaining candidates without counting duplicate letters within the same candidate twice.
   - Pick the candidate word that maximizes the sum of unique character frequencies. This ensures that regardless of feedback, the guess reveals information about the most common letters and eliminates as many non-matching words as possible in each round.
2. **Candidate Filtering**:
   - When feedback is received from the API (`correct`, `present`, `absent`), prune the remaining candidate list.
   - Retain only candidates that produce matching constraints:
     - `correct`: Letter must match the exact position.
     - `present`: Letter must exist in the candidate but not at the guessed index.
     - `absent`: Letter must not exist anywhere in the candidate.

---

## Performance Awareness

- **Hard Mode (Word Length < 5)**:
  Shorter words (lengths 1–4) offer fewer letter constraints per guess and share high letter overlap across few positions (e.g., rhyming patterns). Consequently, guesses often exceed 6 attempts.
- **Easy Mode (Word Length ≥ 5)**:
  Larger words (lengths ≥ 5) expose more letter positions per guess, enabling rapid elimination of candidates. The solver typically finds the target word in $\le 6$ attempts.

---

## Folder Structure

```text
.
├── candidates/                # Pre-generated candidate JSON lists by word length (e.g., 5.json)
├── scripts/
│   └── init-candidates.js    # Script to download wordlist and partition into candidates/
├── src/
│   ├── index.html            # Web UI with API selector, parameters, and interactive board
│   └── solver.js             # Core solver generator function and CLI runner
├── package.json               # Node.js project configuration and build scripts
├── vercel.json                # Vercel deployment configuration and URL rewrites
└── README.md
```
