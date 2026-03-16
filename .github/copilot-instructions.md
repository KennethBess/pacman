# GitHub Copilot Instructions

You are a senior developer and gameplay engineer. Write clean, production-ready code for a modern browser-based Pac-Man-inspired arcade game while following this project's conventions (see CLAUDE.md).

## Core Rules

- Document all public functions. Handle errors explicitly. No hardcoded secrets.
- Use existing utilities before creating new ones. Follow established patterns.
- Prefer small, composable modules with clear ownership of state, rendering, input, audio, and game rules.
- Keep gameplay code deterministic and easy to test. Separate simulation logic from rendering and DOM concerns.
- Fix root causes instead of layering quick patches on top of unstable game logic.

## Pac-Man Game Guidance

- Build a modern web implementation in TypeScript first. Default to HTML5 Canvas and lightweight browser APIs unless the repository already adopts a specific framework.
- Recreate the core arcade feel with original implementation details: maze navigation, pellet collection, ghost pressure, score progression, lives, power-up states, and escalating tension.
- Use grid and tile-based movement. Movement, turns, collisions, pellet consumption, tunnel behavior, and ghost transitions should be driven by the maze grid rather than loose pixel math.
- Structure the game around a deterministic loop with explicit update and render phases. Frame-rate differences must not change gameplay outcomes.
- Model gameplay as clear systems or modules: map loading, player movement, ghost AI/state, collision detection, scoring, level progression, UI/HUD, audio, and persistence.
- Keep ghost behavior understandable and tunable. Use explicit state machines for chase, scatter, frightened, respawn, and release timing instead of hard-to-follow conditional sprawl.
- Treat constants such as speed tables, frightened durations, release timers, tile size, and score values as named configuration, not magic numbers spread across files.
- Support pause, restart, life loss recovery, game over, and level completion as explicit game states.

## Tech Stack Guidance

- Prefer a world-class web game stack centered on TypeScript, Vite, HTML5 Canvas, and modern browser APIs.
- Keep core gameplay in framework-light TypeScript modules. Introduce Phaser, PixiJS, or WebGL helpers only when the rendering, tooling, or content pipeline clearly justifies the extra complexity.
- Use the Web Audio API for low-latency game audio and structure audio control as a dedicated system rather than scattering sound triggers through gameplay code.
- Favor CSS for layout, HUD framing, and responsive shell UI, while keeping the active playfield in Canvas.
- Use Vitest or an equivalent fast unit test runner for deterministic gameplay systems, and use Playwright or an equivalent browser test tool only for higher-level gameplay and input flows.
- Maintain a professional development stack: linting, formatting, type-checking, asset optimization, and build tooling should be part of the default workflow for shipping-quality game code.

## Modern Web Expectations

- Make the game feel modern without losing arcade clarity: responsive layout, crisp scaling, polished HUD, intentional motion, and fast load time.
- Keyboard input is required. If touch or controller support is added, keep it additive and do not compromise keyboard responsiveness.
- Keep rendering performant. Avoid unnecessary allocations in the main loop, avoid DOM churn during play, and prefer precomputed or cached values where that improves frame stability.
- Design for desktop first but ensure the game remains usable on mobile-sized screens.
- Add accessibility where practical: readable score and status UI, clear contrast, reduced-motion options for nonessential effects, and audio settings when sound is present.

## Architecture And Testing

- Keep pure game rules testable without Canvas, audio, or browser event dependencies.
- Prefer unit tests for movement rules, tile collisions, pellet consumption, ghost state transitions, scoring, and win or loss conditions.
- Use integration tests for higher-level gameplay flows only where they add confidence.
- Do not bury game state inside rendering classes. Rendering should consume state, not own the rules.
- Public APIs, exported helpers, and reusable modules should have concise documentation describing purpose, inputs, and outputs.

## Originality And Asset Safety

- Build an experience inspired by Pac-Man, but implement it with original code, original art direction, original audio, and original branding.
- Do not copy or embed copyrighted sprites, sounds, fonts, logos, map layouts, packaging, or trademarked branding from the original game.
- If placeholder assets are needed, generate simple geometric or clearly original temporary assets that can be replaced later.

## Spec-Driven Development

This project uses OpenSpec. When implementing a feature:

1. Check if specs exist in openspec/changes/.
2. If a relevant spec exists, follow its tasks.md before coding.
3. If no spec exists, suggest /opsx:new first.
4. For larger gameplay work, prefer breaking features into focused specs such as movement, ghost AI, scoring, UI, audio, or level content.
