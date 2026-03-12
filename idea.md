# Focuz (Interval)

## Core Idea

### Problem

Knowledge workers and students practicing time-boxed focused work (Pomodoro technique, deep work sessions) rely on generic timer apps that offer no productivity tracking, no session history, and no context capture. Existing focus timers either oversimplify (just a countdown) or overcomplicate (requiring accounts, cloud sync, subscription fees). When a session ends, there is no record of what was accomplished, how productive the time was, or what interruptions occurred. Users who value privacy must sacrifice features to avoid sending productivity data to external servers.

### Solution

Focuz (branded as "Interval") is a distraction-free focus timer and productivity tracker that runs entirely client-side with zero backend. Users configure timed work intervals, log their productivity after each interval (productive or distracted), capture notes and todos during sessions, and review a complete session history. A precision timer using requestAnimationFrame ensures accurate time tracking with proper pause accounting. Session recovery detects interrupted sessions and offers to continue or save them. All data persists in localStorage — no accounts, no servers, no data collection.

### Value

Focuz provides the productivity tracking depth of subscription-based tools with the privacy of a local-first application. The interval-based logging creates a granular record of focus quality over time, not just time spent. Session recovery protects against browser crashes and accidental closes. Customizable audio notifications using the Web Audio API give users fine-grained control over their work rhythm cues. Data export (JSON, CSV, plain text) enables integration with personal analytics workflows.

### User Outcome

A user opens the app, configures their interval duration, starts a session, and focuses on their work. At the end of each interval, they log whether they were productive or distracted, optionally adding notes. During the session, they capture todos and reference notes. When the session ends, it is saved with total duration, interval count, average productivity rating, and all captured context. Over time, the session history reveals focus patterns. If the browser closes mid-session, recovery offers to continue where they left off.

---

## Key Features

### Precision Interval Timer

#### Purpose

Provide an accurate, visually engaging countdown timer that adapts to the user's preferred work rhythm.

#### Capabilities

- Configurable interval duration with minutes and seconds (minimum 5 seconds)
- Auto-repeat toggle for continuous interval cycling
- Circular SVG progress ring for visual countdown representation
- Precision timing using requestAnimationFrame (not setInterval) for sub-frame accuracy
- Precise pause tracking with total paused time and per-interval paused time via refs
- Pause/resume with keyboard shortcut (Space)

#### User Benefit

The timer is accurate to the frame, pauses are tracked precisely, and the visual progress ring provides ambient awareness of time remaining without requiring direct attention.

---

### Productivity Logging

#### Purpose

Capture granular productivity data at the interval level to build a meaningful record of focus quality.

#### Capabilities

- Post-interval productivity rating: "productive" or "distracted"
- Optional notes per interval for context on what was accomplished or what interrupted focus
- Average productivity rating calculated per session
- Historical logging preserved across all sessions

#### User Benefit

Users build a detailed record of their focus quality over time — not just how long they worked, but how effectively they used that time, enabling self-awareness and habit improvement.

---

### Session Context Capture

#### Purpose

Allow users to capture thoughts, tasks, and references during focus sessions without breaking flow.

#### Capabilities

- Free-text notes with timestamps captured during active sessions
- Checkable todo list for tracking tasks within a session
- Keyboard shortcut for quick note entry (Ctrl+N)
- Keyboard shortcut to end session (Ctrl+E)
- All notes and todos persisted as part of the session record

#### User Benefit

Context captured during focus sessions is preserved alongside productivity data, eliminating the need for a separate note-taking tool during work sessions.

---

### Session History and Export

#### Purpose

Provide a browsable archive of all past sessions with full detail and exportable data.

#### Capabilities

- Complete session history with expandable detail views
- Per-session data: start time, end time, total duration, interval count, average rating, notes, todos, and per-interval logs
- Data export in three formats: JSON (structured), CSV (spreadsheet-compatible), and plain text
- Keyword extraction from notes (filters stop words, extracts significant terms)

#### User Benefit

Users review their focus history to identify patterns, track improvement over time, and export data for personal analytics or journaling workflows.

---

### Session Recovery

#### Purpose

Protect against data loss when sessions are interrupted by browser crashes, accidental tab closes, or system restarts.

#### Capabilities

- Automatic detection of interrupted (partial) sessions on application load
- Age-based recovery logic: recent sessions offer continue option, older sessions offer save/discard
- Configurable maximum continue age for determining recoverability
- Full session data preservation including elapsed time, intervals completed, notes, and todos

#### User Benefit

No session data is lost to browser crashes — users can resume interrupted sessions or save their progress, eliminating the frustration of losing tracked time and captured context.

---

### Audio Notifications and Customization

#### Purpose

Provide configurable audio cues that signal interval completion without requiring visual attention.

#### Capabilities

- Web Audio API-based sound generation (no audio file dependencies)
- Configurable oscillator waveform: sine, square, sawtooth, or triangle
- Adjustable frequency, duration, beep count, and volume
- Dark/light/system theme toggle with persistent preference
- PWA-ready with web app manifest and generated icons for standalone installation

#### User Benefit

Audio cues are fully customizable to the user's environment and preferences — from subtle sine tones for quiet offices to prominent square waves for noisy environments — and the app installs as a standalone PWA for quick access.

---

## System Structure

### User Interface

The application is a single-page client component within the Next.js App Router. The main interface is view-based (switching between dashboard, active session, and history views via state) rather than route-based. The active session view shows the circular progress ring, timer controls, and context capture panels (notes and todos). The history view provides an expandable list of past sessions. A settings overlay configures audio, timing, and display preferences.

### Data Layer

The system stores application settings (volume, sound preferences, theme), the active session (if one is in progress), and an array of completed sessions with all associated data (intervals, logs, notes, todos, timing). All data is serialized to localStorage under a versioned key (`interval_v4`). State management uses Zustand with a custom persistence layer.

### Access Model

There is no authentication. The application is fully anonymous and local. No accounts, no server communication, no data collection, no tracking. Every user's data exists exclusively in their own browser.

### Persistence

All data persists in localStorage across browser sessions. There is no cloud sync — data stays on the device. The PWA manifest enables installation for native-like access. Session recovery ensures data survives unexpected interruptions. The versioned storage key enables future data migration if the schema changes.

---

## User Workflow

### Entry

Users arrive at the dashboard view showing their recent session history and overall statistics. The interface immediately communicates the app's purpose and workflow.

### Creation

Users open the setup overlay, configure their interval duration (minutes and seconds), toggle auto-repeat, and start a session. The circular progress ring begins counting down.

### Organization

During the session, users capture notes and manage todos. At the end of each interval, they log their productivity status with optional notes. The timer auto-continues or waits for manual restart based on the auto-repeat setting.

### Retrieval

The session history view provides a chronological list of all past sessions. Expanding a session reveals full details: duration, intervals, productivity logs, notes, and todos. Export generates downloadable files in the user's preferred format.

### Reuse

Exported session data integrates with personal analytics tools, spreadsheets, or journals. Session history patterns inform adjustments to interval duration and work habits. Audio and timing settings persist for consistent future sessions.

---

## Documentation / Support Layer

### Purpose

Help users understand the timer workflow and customize settings for their preferred work style.

### Contents

- Timer configuration and interval setup
- Productivity logging workflow
- Keyboard shortcuts reference (Space, Ctrl+N, Ctrl+E)
- Audio notification customization options
- Session recovery behavior explanation
- Data export format descriptions

### User Benefit

Users configure the app to match their exact work rhythm and environment, understanding all available customization options without trial and error.

---

## Product Positioning

### Category

Productivity utility — focus timer and session tracker.

### Scope

Focuses on timed focus sessions, interval-based productivity logging, context capture (notes and todos), session history, and data export. Intentionally avoids task management, project planning, calendar integration, or social features. The product is a single-purpose focus tool that tracks both time and productivity quality.

### Primary Users

Individual knowledge workers, students, and deep work practitioners who use time-boxed focus techniques (Pomodoro, etc.) and want granular productivity tracking with complete privacy — no accounts, no servers, no data leaving the device.

### Core Value Proposition

A precision focus timer with interval-based productivity logging, session recovery, and multi-format export — running entirely in the browser with zero backend, zero accounts, and zero data collection, giving users deep productivity insights without sacrificing privacy.
