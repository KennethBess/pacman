# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern browser-based arcade game inspired by Pac-Man, built with TypeScript and HTML5 Canvas. No game code exists yet — the repository currently contains development tooling, AI assistant instructions, and project scaffolding.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Rendering**: HTML5 Canvas 2D API — no game engine by default
- **Build**: Vite (dev server, bundling, HMR)
- **Testing**: Vitest for unit tests; Playwright for browser-level gameplay tests
- **Formatting**: Prettier (auto-runs on save and via Claude hooks)
- **Linting**: ESLint with auto-fix on save
- **Audio**: Web Audio API
- **Package manager**: npm

## Commands

No `package.json` exists yet. Once the project is initialized (`npm init` + dependency install), expect:

```bash
npm run dev          # Vite dev server with HMR
npm run build        # Production build to dist/
npm run test         # Vitest (all tests)
npm run test -- --run src/path/to/file.test.ts  # Single test file
npx tsc --noEmit     # Type-check without emitting
npx prettier --check .  # Check formatting
```

## Code Style

- 2-space indentation for TS/JS/HTML/CSS/JSON/YAML (4-space for Python, C#)
- LF line endings, UTF-8, final newline required (enforced by `.editorconfig`)
- Prettier is the formatter — runs automatically via Claude hooks on Edit/Write for `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.css`, `.html`, `.yaml`, `.yml`
- TypeScript type-checking (`tsc --noEmit`) runs automatically via Claude hooks on `.ts`/`.tsx` edits

## Architecture Principles

- **Deterministic game loop**: Fixed-timestep update with `requestAnimationFrame` render. Frame-rate differences must not change gameplay.
- **State separate from rendering**: Game rules live in pure modules. Rendering consumes state but never owns rules. All game logic must be testable without Canvas, DOM, or audio.
- **Tile/grid-based movement**: Movement, collisions, pellet consumption, tunnel behavior, and ghost transitions are driven by the maze grid.
- **Ghost AI as explicit state machines**: Chase, scatter, frightened, respawn, and release timing — not conditional sprawl.
- **Configuration, not magic numbers**: Speed tables, frightened durations, release timers, tile size, score values — all named constants or config objects.
- **Explicit game states**: Ready, playing, dying, paused, game-over, level-complete as distinct phases with clear transitions.

## Spec-Driven Development (OpenSpec)

Features are spec-driven. Before implementing:

1. Check `openspec/changes/` for an existing spec
2. If found, follow its `tasks.md`
3. If not, create one first: `/opsx:new <feature>`

Workflow: `/opsx:new` → `/opsx:ff` → review → `/opsx:apply` → `/opsx:archive`

Break larger gameplay work into focused specs (movement, ghost AI, scoring, UI, audio, level content).

## Originality Requirement

This is an original game inspired by Pac-Man. Do not copy or embed copyrighted sprites, sounds, fonts, logos, map layouts, or trademarked branding from the original game. Use original or placeholder assets only.
