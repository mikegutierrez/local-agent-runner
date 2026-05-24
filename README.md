# Local Agent Runner

Local Agent Runner is a local Electron developer tool for inspecting a workspace and, over time, running script- or agent-like tasks against it. The project is intentionally Codex-adjacent: it is a learning and portfolio project focused on the architecture behind desktop developer tooling rather than a packaged product.

The current milestone implements a typed Electron boundary and a workspace inspector. A user can select a local folder, inspect package metadata, view available npm scripts, and see basic git status information.

## Table of contents

- [Motivation](#motivation)
- [Current capabilities](#current-capabilities)
- [Architecture docs](#architecture-docs)
- [Getting started](#getting-started)
- [Developer setup](#developer-setup)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [How AI was used in this project](#how-ai-was-used-in-this-project)

## Motivation

This project is built to practice the architecture used in local-first developer tools:

- A browser-safe React renderer.
- A narrow typed preload bridge exposed as `window.desktop`.
- A privileged Electron main process for filesystem, git, process, and app lifecycle work.
- Shared TypeScript contracts for IPC channels, workspace metadata, and run lifecycle models.
- Clear boundaries between UI, renderer-side desktop wrappers, IPC handlers, main-process services, and child-process orchestration.

The goal is to build the kind of practical foundation used in Codex-like desktop tooling: coordinating local workspaces, typed IPC, streaming process output, cancellation, retry, persistence, and eventually a stronger service boundary.

## Current capabilities

- Select a local workspace folder through the native Electron folder picker.
- Inspect `package.json` metadata.
- Parse npm scripts with explicit missing, valid, and invalid states.
- Detect whether the selected workspace is a git repository.
- Display current git branch and dirty-state information when available.
- Keep Electron, Node, and browser-only renderer code separated by TypeScript project boundaries.

Planned work includes script execution, stdout/stderr streaming, cancellation, run history, retries, and observability surfaces for process and IPC lifecycle debugging.

## Architecture docs

- [IPC architecture](docs/ipc-architecture.md): diagram of the renderer, preload bridge, shared contracts, main-process handlers, and local machine resources.

## Getting started

Use Node `20.19.0` or newer. The repo includes `.nvmrc` and enables npm engine checks through `.npmrc`.

```sh
nvm use
npm install
npm run dev
```

The development command starts the Vite renderer dev server, watches the Electron TypeScript build, and launches Electron once the required compiled files are available.

## Developer setup

Before opening a pull request or treating a change as complete, run:

```sh
npm run typecheck
npm run lint
npm run build
```

Useful local commands:

```sh
npm run start:built
npm run inspect:workspace -- /path/to/workspace
```

`start:built` launches the last compiled app from `dist`. `inspect:workspace` runs the workspace inspection service from the command line, which is useful when iterating on package or git parsing behavior outside the UI.

## Project structure

```text
.
├── index.html                 Vite renderer HTML entry point
├── package.json               npm scripts, runtime deps, dev tooling, Node engine
├── vite.config.mts            Vite renderer build configuration
├── tsconfig.electron.json     TypeScript config for Electron main/preload/shared code
├── tsconfig.renderer.json     TypeScript config for browser-safe renderer code
├── eslint.config.mjs          ESLint flat config
├── .npmrc                     npm project settings, including engine-strict
├── .nvmrc                     expected local Node version
├── docs/
│   ├── ipc-architecture.md    IPC architecture diagram page
│   └── ipc-architecture.svg   GitHub-renderable IPC architecture diagram
├── scripts/
│   └── inspect-workspace.ts   CLI helper for testing workspace inspection
└── src/
    ├── main/                  privileged Electron/Node process
    │   ├── main.ts            BrowserWindow creation and app lifecycle
    │   ├── ipc/               IPC handler registration and channel wiring
    │   ├── services/          workspace, package.json, git, and run services
    │   └── processes/         command execution and future process orchestration
    ├── preload/
    │   └── preload.ts         narrow typed bridge exposed as window.desktop
    ├── renderer/              React + TypeScript UI, browser-safe only
    │   ├── App.tsx            root application component
    │   ├── main.tsx           React renderer entry point
    │   ├── styles.css         global renderer styles
    │   ├── vite-env.d.ts      Vite renderer type references
    │   ├── desktop/           renderer-side wrappers around the preload API
    │   └── hooks/             renderer workflow/state hooks
    └── shared/                shared browser-safe types and helpers
        ├── desktop-api.ts     top-level preload API contract
        ├── ipc/               IPC channel names and message contracts
        ├── runs/              run lifecycle states, events, and process models
        ├── validation/        shared runtime value guards
        └── workspaces/        workspace metadata, package, script, and git models
```

## Scripts

- `npm run dev`
  Starts the development loop. Runs the Vite renderer dev server, watches and compiles Electron main/preload TypeScript, then launches Electron once everything is ready. Renderer changes hot-refresh; main/preload changes restart Electron.

- `npm run dev:electron`
  Internal helper used by `dev`. Waits for the Vite server and compiled Electron files, then runs Electron through `nodemon` so it restarts when `dist/electron` changes.

- `npm run build`
  Creates a clean production-style build. Removes `dist`, type-checks renderer and Electron code, then builds the renderer with Vite.

- `npm start`
  Builds the app from scratch and launches Electron from the compiled output.

- `npm run start:built`
  Launches Electron using the existing compiled output in `dist` without rebuilding.

- `npm run typecheck`
  Runs TypeScript checks for both the renderer and Electron main/preload code.

- `npm run lint`
  Runs ESLint across the project.

- `npm run clean`
  Removes the full `dist` directory.

- `npm run clean:renderer`
  Removes only the renderer build output at `dist/renderer`.

- `npm run inspect:workspace -- /path/to/workspace`
  Runs the workspace inspection service from the command line and prints the result. This is a development helper for validating package and git parsing behavior.

## How AI was used in this project

I wrote the code for this project. AI was used as a programming and architecture review partner while I built it.

I used AI to review boundaries between Electron main, preload, renderer, and shared code; pressure-test IPC and TypeScript contracts; identify edge cases around package parsing and git inspection; and refine implementation plans before writing the next slice of code.

The implementation decisions, code changes, testing, and final tradeoffs are mine. I treated AI feedback like a senior code review partner: useful for critique, alternative designs, and catching blind spots, but not a substitute for understanding the architecture or verifying behavior locally.
