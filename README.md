# FocusForge

### Fall behind. Regain control. Take the next step.

**FocusForge is a productivity tool for students who have fallen behind and need a realistic way forward.**

Deadlines pile up. Study plans break. Everything starts feeling urgent at once.

FocusForge helps students turn that chaos into a clear set of priorities. It organizes tasks, accounts for available time, and helps you decide what deserves your attention next. When the workload becomes overwhelming, **Overwhelm Recovery Mode** cuts through the noise and identifies three actionable next steps.

Not another productivity system demanding that you do more. A way to figure out what to do next.

---

## The Problem

Most productivity tools work best when you're already organized.

But students don't always stay on schedule. An assignment takes longer than expected. An exam gets closer. A missed day turns into a missed week. Suddenly, the original plan no longer makes sense.

When everything feels important, deciding where to start becomes another task.

## The Approach

FocusForge is built around a simple idea:

**You don't need a perfect plan. You need a useful next step.**

Add your tasks, set deadlines, estimate the time they require, and choose their importance. FocusForge helps make the workload visible, explains task priorities, and identifies when your available time isn't enough.

When you fall behind, recovery becomes the priority — not guilt, and not an unrealistic schedule.

## What It Does

### Task Management
Create, edit, and delete tasks with deadlines, importance levels, and estimated durations. Track completed work and keep your workload organized.

### Explainable Prioritization
Understand why a task deserves attention based on factors such as urgency, importance, and estimated effort. Prioritization should be understandable, not a mysterious score.

### Time-Aware Planning
Compare your workload against the time you actually have. Identify tasks that don't fit instead of pretending everything can be completed.

### Overwhelm Recovery Mode
The core of FocusForge.

When your workload becomes too much, Recovery Mode identifies three useful next actions, explains why they matter, and helps you focus on manageable progress rather than the entire backlog.

### Progress and Replanning
Mark tasks complete and see your workload change. As priorities shift, use the updated task list to decide what comes next.

### Local Persistence
Task data is stored in your browser using `localStorage`, allowing your work to remain available across refreshes on the same browser and origin.

---

## The Experience

The intended workflow is straightforward:

1. **Capture** — Add assignments, exams, projects, and study sessions.
2. **Prioritize** — See which tasks deserve attention and why.
3. **Recognize the constraint** — Discover when the workload exceeds available time.
4. **Recover** — Use Overwhelm Recovery Mode to identify three next actions.
5. **Make progress** — Complete a task and reassess what remains.

The goal isn't to optimize every minute of a student's life. It's to make the next decision easier when the plan falls apart.

---

## Built With

- **React** — Component-based user interface
- **TypeScript** — Typed application code
- **Vite** — Development server and production build
- **Tailwind CSS** — Interface styling
- **Lucide React** — Interface icons
- **Browser localStorage** — Client-side task persistence

FocusForge is designed to work without requiring a paid AI API or an API key for its core workflow.

## Run Locally

### Requirements

- Node.js and npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/swastim01/FocusForge.git
cd FocusForge
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed in your terminal.

### Production Build

Compile and validate the application:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The preview server prints its local URL in the terminal.

---

## Engineering Principles

FocusForge is built around a few practical principles:

- **Action over noise.** Recommendations should help a student do something concrete.
- **Realistic planning.** Available time is a constraint, not an optional detail.
- **Explainability.** Students should understand why a task is prioritized.
- **Recovery over perfection.** A disrupted schedule should be recoverable.
- **Simplicity.** The core experience should not depend on external AI services, accounts, or complicated setup.

## Current Status

FocusForge is an actively developed hackathon project.

The production build has been verified locally. The application's key workflows have also been manually exercised during development. Public deployment, cross-browser behavior, and broader automated testing should be verified separately before being treated as complete.

The application currently uses browser-local storage rather than a shared backend. Task data does not automatically synchronize across devices or browsers.

## Roadmap

- Refine prioritization and explainability.
- Improve recovery recommendations and schedule recalculation.
- Expand automated testing for core workflows.
- Continue improving accessibility and responsive behavior.
- Publish and verify a public demo.

## Built for Students

FocusForge is for the student who missed a deadline, lost a weekend, underestimated an assignment, or opened their task list and didn't know where to begin.

Falling behind happens.

**What matters is finding a way forward.**

---

*FocusForge — Fall behind. Regain control. Take the next step.*
