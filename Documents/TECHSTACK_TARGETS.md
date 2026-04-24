# Techstack Target Matrix

## Runtime and Framework Targets

- Node.js: `22.x` (LTS baseline, enforced by `engines`)
- Next.js: `14.2.x` latest patch line
- React / React DOM: `18.3.x`
- TypeScript: `6.x`
- NextAuth: `4.24.x`

## Tooling Targets

- ESLint: `8.x` (project-compatible baseline)
- Prettier: `3.x`
- Jest: `29.x`
- `tsx`: `4.x` for script execution

## Upgrade Order

1. Dependency hygiene and script runner pinning.
2. CI and dependency automation.
3. API/auth contract modernization.
4. UI dependency modernization (drag-and-drop).
5. Security and deployment hardening.
6. Regression checks before release.
