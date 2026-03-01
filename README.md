# Interval — Focus Timer & Productivity Tracker

A distraction-free focus timer built with **Next.js 16** that tracks work sessions with configurable intervals, productivity logging, notes, and todos — all stored locally in your browser.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Interval timer** — Configurable work intervals with auto-repeat and audio notifications
- **Session tracking** — Every session records start/end times, duration, and interval count
- **Productivity logging** — Rate each interval as productive or distracted with optional notes
- **Notes & todos** — Capture thoughts and tasks during focus sessions
- **Session history** — Browse, expand, and export all past sessions
- **Data export** — Download session data as JSON, CSV, or plain text
- **Dark mode** — Toggle between light and dark themes, persisted across reloads
- **Session recovery** — Automatically detects interrupted sessions and lets you continue, save, or discard
- **Keyboard shortcuts** — Space to pause, Ctrl+N for notes, Ctrl+E to end
- **PWA-ready** — Web app manifest for add-to-home-screen support
- **Fully local** — Zero backend; all data stored in `localStorage`

---

## Tech Stack

| Layer       | Technology                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)                      |
| Language    | TypeScript 5 (strict mode)                              |
| Styling     | CSS custom properties + Tailwind v4                     |
| Fonts       | DM Serif Display, DM Sans, Space Mono (via `next/font`) |
| Icons       | Lucide React                                            |
| Persistence | localStorage (custom hooks)                             |
| Audio       | Web Audio API                                           |
| Linting     | ESLint 9 + eslint-config-next                           |
| Formatting  | Prettier 3                                              |
| Git hooks   | Husky 9 + lint-staged                                   |

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** — v18.18 or later → [Download Node.js](https://nodejs.org/)
- **pnpm** — v8 or later → Install with `npm install -g pnpm`
- **Git** — Any recent version → [Download Git](https://git-scm.com/)

Verify your installation:

```bash
node -v    # Should print v18.18.0 or higher
pnpm -v    # Should print 8.x or higher
git -v     # Should print git version 2.x
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/focuz.git
cd focuz
```

### 2. Install dependencies

```bash
pnpm install
```

This also runs `husky` automatically (via the `prepare` script) to set up Git hooks.

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page hot-reloads as you edit files.

### 4. Build for production

```bash
pnpm build
```

Then serve the production build:

```bash
pnpm start
```

---

## Available Scripts

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Start the dev server with Turbopack                      |
| `pnpm build`        | Create an optimized production build                     |
| `pnpm start`        | Serve the production build locally                       |
| `pnpm lint`         | Run ESLint on the entire project                         |
| `pnpm lint:fix`     | Run ESLint and auto-fix fixable issues                   |
| `pnpm format`       | Format all files with Prettier                           |
| `pnpm format:check` | Check if all files are formatted (CI-friendly)           |
| `pnpm typecheck`    | Run TypeScript compiler checks (no output files)         |
| `pnpm validate`     | Run typecheck + lint + build in sequence (full CI check) |

---

## Code Quality

This project enforces code quality automatically through Git hooks.

### On every commit (pre-commit)

[lint-staged](https://github.com/lint-staged/lint-staged) runs on staged files only:

- **TypeScript / JavaScript files** → Prettier format + ESLint fix
- **JSON / CSS / Markdown / YAML files** → Prettier format

### On every push (pre-push)

The full pipeline runs before code reaches the remote:

1. **`tsc --noEmit`** — Catches all type errors
2. **`eslint`** — Catches lint violations
3. **`next build`** — Ensures the project compiles successfully

If any step fails, the push is blocked until you fix the issue.

### Manual check

Run everything at once:

```bash
pnpm validate
```

---

## Project Structure

```
focuz/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, viewport
│   ├── page.tsx                # Main app — timer, dashboard, history, settings
│   ├── globals.css             # All styles + CSS custom properties + dark mode
│   ├── icon.tsx                # Generated favicon (32×32) via ImageResponse
│   ├── apple-icon.tsx          # Generated Apple touch icon (180×180)
│   ├── opengraph-image.tsx     # Generated OG image (1200×630)
│   ├── twitter-image.tsx       # Twitter card image (reuses OG)
│   ├── robots.ts               # robots.txt generation
│   ├── sitemap.ts              # XML sitemap generation
│   ├── manifest.ts             # PWA web app manifest
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React contexts
│   └── hooks/                  # App-level custom hooks
├── lib/
│   ├── useAudio.ts             # Web Audio API hook for beep sounds
│   ├── usePersistence.ts       # localStorage state management + types
│   ├── useTimerRefs.ts         # requestAnimationFrame timer refs
│   └── utils.ts                # Formatting, date, and helper utilities
├── public/                     # Static assets
├── .husky/
│   ├── pre-commit              # Runs lint-staged
│   └── pre-push                # Runs tsc + lint + build
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Files Prettier should skip
├── eslint.config.mjs           # ESLint flat config
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS + Tailwind CSS
└── package.json                # Dependencies, scripts, lint-staged config
```

---

## Configuration Files

| File                 | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `.prettierrc`        | Prettier rules — semicolons, double quotes, trailing commas   |
| `.prettierignore`    | Excludes `node_modules`, `.next`, lock files from formatting  |
| `eslint.config.mjs`  | ESLint flat config with Next.js + TypeScript + Prettier rules |
| `tsconfig.json`      | TypeScript strict mode, bundler resolution, `@/*` path alias  |
| `next.config.ts`     | Next.js app configuration                                     |
| `postcss.config.mjs` | PostCSS with Tailwind CSS v4 plugin                           |

---

## Deployment

### Vercel (recommended)

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js and deploys with zero configuration.

### Self-hosted

```bash
pnpm build
pnpm start
```

The app runs on port 3000 by default. Set `PORT` environment variable to change it.

---

## Troubleshooting

**Husky hooks not running on Windows?**

On Windows, Husky Git hooks **must be run from Git Bash**, not PowerShell or CMD.

### Recommended: Use Git Bash terminal

1. Open Git Bash (right-click in your project folder → "Git Bash Here")
2. Run your Git commands from Git Bash:

```bash
git add .
git commit -m "Your message"  # pre-commit hook runs here
git push                      # pre-push hook runs here
```

**Why?** Windows PowerShell/CMD cannot execute shell (`.sh`) scripts directly. Husky uses POSIX shell scripts, requiring Git Bash or WSL2 Bash.

### Alternative: PowerShell with --no-verify flag

If you prefer PowerShell, bypass hooks during development:

```powershell
git add .
git commit -m "Your message" --no-verify    # Skip pre-commit
git push --no-verify                        # Skip pre-push
```

**Note:** While `--no-verify` skips hooks, code quality is validated on GitHub via CI/CD. Ensure `pnpm validate` passes locally.

**Verify hooks are configured:**

```bash
git config core.hooksPath          # Should print ".husky"
ls -la .husky/                     # Should show pre-commit and pre-push
```

**Manual validation (any terminal)**

Even without hooks, validate locally with:

```powershell
pnpm validate    # Runs: format → lint → typecheck → build
```

**ESLint or TypeScript errors?**

Check issues with:

```powershell
pnpm validate
```

**Port 3000 already in use?**

```powershell
pnpm dev -- -p 3001
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes (pre-commit hooks run automatically)
4. Push to the branch (pre-push hooks verify tsc + lint + build)
5. Open a Pull Request

---

## License

MIT
