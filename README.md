# local-agent-runner

## Project structure

```text
.
├── index.html                 Vite renderer HTML entry point
├── package.json               npm scripts, runtime deps, dev tooling, Node engine
├── vite.config.mts            Vite renderer build configuration
├── tsconfig.electron.json     TypeScript config for Electron main/preload/shared code
├── tsconfig.renderer.json     TypeScript config for browser-safe renderer code
├── .eslint.config.mjs         ESLint configuration
├── .npmrc                     npm project settings
├── .nvmrc                     expected local Node version
└── src/
    ├── main/                  privileged Electron/Node process
    │   ├── main.ts            BrowserWindow creation and app lifecycle
    │   ├── ipc/               IPC handler registration and channel wiring
    │   ├── services/          workspace, git, filesystem, and package inspection services
    │   ├── processes/         child process orchestration, streaming, cancellation
    │   └── persistence/       local run history and app state persistence
    ├── preload/
    │   └── preload.ts         narrow typed bridge exposed as window.desktop
    ├── renderer/              React + TypeScript UI, browser-safe only
    │   ├── App.tsx            root application component
    │   ├── main.tsx           React renderer entry point
    │   ├── styles.css         global renderer styles
    │   ├── vite-env.d.ts      renderer globals and window.desktop typing
    │   └── desktop/           renderer-side wrappers around the preload API
    └── shared/                shared types and schemas with no Electron/Node dependencies
        ├── desktop-api.ts     top-level preload API contract
        ├── ipc/               IPC channel names and message contracts
        ├── runs/              run lifecycle states, events, and process models
        └── workspace/         workspace metadata, package, script, and git models
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
