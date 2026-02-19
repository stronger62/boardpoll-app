# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A no-build, no-dependencies board meeting date poll app. The frontend is a single self-contained HTML file; the backend is a Google Apps Script web app that uses a Google Sheet as its database.

## Development

There is no build step, no package manager, and no test suite. To develop locally:

- Open `index.html` directly in a browser (requires `config.js` in the same directory)
- Copy `config.example.js` to `config.js` and fill in your Apps Script URL and secret

To deploy Apps Script changes: edit in the Google Apps Script editor, then go to Deploy > Manage deployments > edit > set "New version" > Deploy.

## Deployment (GitHub Pages)

`config.js` is gitignored and never committed. Instead, `.github/workflows/deploy.yml` generates it at deploy time from two GitHub repository secrets:

- `APPS_SCRIPT_URL` — the deployed web app URL from Apps Script
- `APP_SECRET` — must match `APP_SECRET` in `Code.gs`
- `SITE_PASSWORD` — password shown to all visitors before the app loads (leave empty to disable)

Add these at: repo Settings → Secrets and variables → Actions → New repository secret.

Also set Pages source to **GitHub Actions**: repo Settings → Pages → Source → GitHub Actions.

Every push to `main` triggers a deploy. The generated `config.js` exists only in the deployment artifact — it never touches the git history.

## Architecture

### Two-file structure

| File | Role |
|------|------|
| `index.html` | Entire frontend: HTML, CSS, and JS in one file |
| `apps-script/Code.gs` | Google Apps Script backend (deployed as a web app) |

### Frontend (`index.html`)

All views are pre-rendered in HTML and toggled via `display: none` / `.active`. Hash-based routing drives navigation:

- `#/` → create poll view
- `#/poll/<pollId>` → vote view
- `#/admin/<pollId>?key=<adminKey>` → admin results view
- `#/results/<pollId>` → public results view (shown after voting)

The `api()` function at the top of the `<script>` block handles all communication with the Apps Script backend via POST. Every request includes the shared `secret` from `config.js`.

Poll IDs (8 chars) and admin keys (16 chars) are generated client-side using `crypto.getRandomValues()` before the `createPoll` API call.

### Backend (`apps-script/Code.gs`)

A single `doPost()` handler dispatches on `body.action`:

- `createPoll` — appends a row to the "Polls" sheet
- `getPoll` — looks up a poll by ID
- `getVotes` — returns all votes for a poll
- `submitVote` — upserts a vote (deletes existing row for same name+pollId, then appends)

The Google Sheet auto-creates two tabs ("Polls", "Votes") with headers on first run via `getOrCreateSheet()`.

### Auth / config

`config.js` (gitignored) exposes a `POLL_CONFIG` global with `apiUrl` and `secret`. The Apps Script checks that `body.secret === APP_SECRET` on every request. The admin key is verified client-side by comparing `pollData.adminKey` from the API response.
