# Focuz

**Distraction-free focus timer that turns productivity into a game.**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/umairhex/focuz)

![Focuz Timer](https://via.placeholder.com/1200x600/667eea/ffffff?text=Focuz+Focus+Timer)

---

## Problem Statement

Pomodoro timers are **everywhere**, but most are **bloated** (ads, sign-ups) or **boring** (no feedback). Deep work requires **psychological reward**—seeing your focus streaks, tracking progress, understanding patterns.

Focuz removes friction and adds satisfaction:

**The problem it solves:**

- ❌ Can't focus without distraction tracking
- ❌ No visibility into productivity patterns
- ❌ Timer apps are cluttered with ads
- ✅ Instant timer start (one click)
- ✅ Session history with trends
- ✅ Data export (CSV, JSON)
- ✅ Fully private (100% localStorage)

**Result:** Users complete their focus sessions and see tangible progress in weeks.

---

## Key Features

- **Customizable Intervals** – Work/break durations are configurable (default: 25min work, 5min break)
- **Session Tracking** – Automatic logging of every completed session
- **Productivity Notes** – Capture what you worked on in each session
- **Session History** – View past sessions, achievements, and streaks
- **Data Export** – Download session data as JSON or CSV
- **Dark Mode** – Eyes-friendly interface for long sessions
- **PWA Ready** – Works offline, installable on phone
- **Keyboard Shortcuts** – Skip breaks, pause, resume without mouse
- **Beautiful UI** – Glassmorphism design with smooth animations
- **Zero Backend** – Fully private, no servers needed

---

## Architecture Decisions

**Why Next.js 16 for a timer app?** Seems overkill, but Next.js provides:

- **Static prerendering** – Timer loads instant (no SSR needed)
- **Image optimization** – Icons/backgrounds load fast
- **Vercel deployment** – One-click hosting with auto-scaling
- **PWA support** – next-pwa makes it installable

**Why localStorage instead of database?** Privacy is feature #1 for Focuz. Sessions are personal data. Storing locally means:

- ✅ Works offline
- ✅ No privacy concerns
- ✅ No server costs
- ✅ Users own their data (can export/delete)

**Why Zustand over Redux?** Focuz state is simple: current timer, sessions array, settings. Zustand is 2KB (vs Redux 50KB+). Simpler code for state management.

**Why React Hook Form + Zod?** Settings form (work duration, break duration, etc.) needs validation. React Hook Form + Zod provides type-safe forms with 5KB overhead.

**Why next-themes?** Theme switching is non-trivial (persist to localStorage, respect system preferences, prevent flash). next-themes handles all of it in one hook.

---

## Tech Stack

| Layer                  | Technology                           |
| ---------------------- | ------------------------------------ |
| **Frontend**           | Next.js 16.1.6, React 19, TypeScript |
| **State Management**   | Zustand                              |
| **Forms & Validation** | React Hook Form, Zod                 |
| **UI**                 | Lucide React, Tailwind CSS 4         |
| **Storage**            | localStorage, IndexedDB              |
| **Theme**              | next-themes                          |
| **Export**             | papaparse (CSV)                      |
| **Deployment**         | Vercel                               |

---

## Getting Started (5 minutes)

### Prerequisites

- Node.js 20+, pnpm 10+

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-username/focuz.git
cd focuz

# Install dependencies
pnpm install

# No .env needed (fully local app)
```

### Run Locally

```bash
# Development server
pnpm dev

# Open http://localhost:3000
```

### Build & Production

```bash
# Validate (lint, type-check, test, build)
pnpm validate

# Production build
pnpm build

# Start production server
pnpm start
```

### Deploy to Vercel

```bash
# One-click deploy
vercel

# No environment variables needed
```

---

## Usage

### Start a Focus Session

1. Open Focuz
2. Click **Start** (or press `Space`)
3. Focus for your set duration
4. Session auto-logs when timer completes

### Log What You Worked On

1. After session completes, type in **Notes** field
2. Notes save automatically
3. Build a journal of your work

### View Session History

1. Click **History** tab
2. See all past sessions with timestamps
3. Track streaks and productivity trends

### Export Data

1. Click **Settings**
2. Select **Export as CSV** or **Export as JSON**
3. Data downloads to your computer

### Customize Timers

1. **Settings** → **Duration**
2. Set work/break intervals
3. Changes apply to next session

---

## Known Limitations

1. **localStorage limit** – Browser limit ~5-10MB. After ~500 sessions, you'll hit limit. Solution: export and clear history.
2. **No cloud sync** – Data doesn't sync across devices. Use export/import to move data.
3. **No mobile app** – Web app works on mobile but no native app. PWA installation available (install from browser menu).
4. **Background timer** – Timer pauses if browser tab is not active (browser security). Solution: keep tab open.
5. **No notifications** – Browser notifications require permission; not enabled by default. Permission prompt on first session.

---

## Roadmap

- **v2 (Q2 2026)** – Cloud sync (optional), mobile app, Slack integration for status updates
- **v3 (Q3 2026)** – Analytics (productivity insights), team collaboration, Pomodoro AI coaching
- **v4 (Q4 2026)** – Health integration (Apple Health, Google Fit), smart break recommendations

---

## License

MIT – See [LICENSE](LICENSE) for details.

---

**Focus better. Ship more.** [Start your session →](https://focuz.vercel.app)

---

**Author:** [Umair](https://github.com/umairhex) | [Portfolio](https://umairrx.dev) | [LinkedIn](https://www.linkedin.com/in/umairhex)
