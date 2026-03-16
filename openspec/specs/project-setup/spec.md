## Purpose

Vite + TypeScript + ESLint project initialization, entry point, and build pipeline.

## Requirements

### Requirement: Project initializes with Vite and TypeScript
The project SHALL have a `package.json` with Vite as the build tool, TypeScript in strict mode, and dev scripts for `dev`, `build`, and `test`.

#### Scenario: Dev server starts
- **WHEN** the user runs `npm run dev`
- **THEN** Vite starts a dev server with HMR serving the game at `localhost`

#### Scenario: Production build
- **WHEN** the user runs `npm run build`
- **THEN** Vite produces a bundled output in `dist/` with no TypeScript errors

### Requirement: Entry point loads canvas
The `index.html` SHALL contain a `<canvas>` element and load the main TypeScript entry point. The canvas MUST fill the viewport with a fixed aspect ratio.

#### Scenario: Page load
- **WHEN** the browser loads `index.html`
- **THEN** a canvas element is visible and the game loop begins

### Requirement: ESLint and Prettier configured
The project SHALL include ESLint and Prettier configurations consistent with the `.editorconfig` settings (2-space indent, LF line endings, UTF-8).

#### Scenario: Lint check passes
- **WHEN** the user runs `npx eslint src/`
- **THEN** no lint errors are reported for conforming code
