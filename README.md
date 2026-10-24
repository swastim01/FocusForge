# FocusForge

**Fall behind. Regain control. Take the next step.**

A student-focused task recovery MVP built with React, TypeScript, Vite, Tailwind CSS, and Lucide. Core prioritization is deterministic and runs locally; tasks persist in the browser using localStorage.

## Requirements

- Node.js 20.19+ or 22.12+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## MVP functionality

- Add, edit, delete, and complete tasks.
- Deadline, estimated duration, and importance fields.
- Explainable task ranking based on urgency, importance, and a small-task advantage.
- Capacity slider and sequential daily plan.
- Tasks that do not fit are explicitly listed as unscheduled.
- Overwhelm Recovery Mode selects up to three real pending tasks and explains their ranking.
- localStorage persistence.
- Responsive layout and keyboard-visible focus states.

## Current limitations

- No account sync: tasks are stored only in the current browser.
- The schedule uses a simple 9:00 AM start and sequential time blocks; it does not account for calendar events, dependencies, or break insertion.
- Ranking is a transparent heuristic, not an AI prediction.
- Sample tasks are preloaded for demoability. Use **Reset demo tasks** to restore them.

## Demo flow

1. Use the preloaded competing deadlines.
2. Lower **Available focus time** to 60 minutes to reveal work that will not fit.
3. Select **I'm overwhelmed** and review the ranked next actions.
4. Mark one task complete and observe the plan and progress update.
5. Refresh the page to confirm local persistence.
6. Add/edit/delete a task to demonstrate CRUD.

## Deploy

Build with `npm run build`. Deploy the repository to Vercel or Netlify using:
- Build command: `npm run build`
- Output directory: `dist`

## Credits

- React, TypeScript, Vite, Tailwind CSS, and Lucide are third-party open-source tools.
- AI assistance was used during development; disclose this in the hackathon submission according to the event's rules.
