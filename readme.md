# TSXLight Renderer

TSXLight Renderer is a server-owned TSX rendering experiment for web and Electron shells. Components are authored with a React-like TSX syntax and a custom JSX factory, but component instances, state, callbacks, page transitions, and rerender decisions live on the server.

## Architecture

- Custom TSX/JSX factory for component authoring.
- Server-side component tree rendering into HTML shells.
- Per-user renderer instances with isolated state and callback tables.
- Socket-routed client events that invoke server-owned callbacks.
- Page manager for registered pages, active page IDs, load/unload hooks, and transitions.
- State save/load hooks for persistence across renders and page changes.
- Screen-size tracking for user-specific layout decisions.
- Electron and web shell support.
- Juice Messenger sample application surface.

## Requirements

This is an older TypeScript/Node experiment. Use an older Node line if modern dependency resolution causes issues.

- Node.js and npm
- TypeScript / ts-node through local dependencies
- Electron for the desktop shell path

Avoid global installs unless needed for legacy local workflows; the repository declares the required packages in `package.json`.

## Setup

```bash
npm install
```

## Runbook

Start the server/web renderer:

```bash
npm start
```

Run in watch mode:

```bash
npm run start:watch
```

Start the Electron shell:

```bash
npm run electronStart
```

Compile TypeScript/TSX using the custom JSX factory:

```bash
npm run compile
```

## Important Scripts

- `npm start`: runs `ts-node ./src`.
- `npm run start:watch`: runs the nodemon watch loop.
- `npm run electronStart`: starts Electron.
- `npm run compile`: compiles TSX with `tsxlight.createElement` as the JSX factory.

The `test` script is currently a placeholder and exits with an error.

## Runtime Model

Each connected user receives a renderer instance:

```text
user -> rendererId -> active page -> component instance -> callback table
```

The browser receives rendered markup plus a small callback bridge. When a user interacts with an element, the client sends a socket message containing renderer/page/callback identity. The server validates the message, invokes the stored callback, mutates server-side component state, and rerenders the shell for that renderer.

## Page and State Flow

Page transitions follow this shape:

```text
save outgoing page state
run outgoing unload hook
select next page for renderer
load or create renderer-local component instance
render next shell
run incoming load/afterRender hook
```

Use `saveState()` and `loadState()` to persist component data across renders. Use `forceUpdate()` when a rerender should occur without saving state into the store.

## Troubleshooting

- If TSX does not compile, confirm the compile command includes `--jsxFactory tsxlight.createElement`.
- If callbacks fire for stale elements, clear/regenerate the callback table during rerender.
- If multiple tabs interfere, check the settings that control duplicate active connections per user.
- If modern Node versions produce dependency issues, retry with an older Node version compatible with TypeScript 3.8 and Electron 8.
