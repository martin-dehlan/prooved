# Contributing to Prooved

Thanks for considering a contribution. This guide describes the requirements for acceptable contributions.

## Code of Conduct

Be respectful. We follow the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Report violations to `security@prooved.xyz`.

## Reporting Issues

- **Security issues**: do **not** open a public issue. Follow [SECURITY.md](./SECURITY.md).
- **Bugs and feature requests**: open a GitHub issue with steps to reproduce, expected vs. actual behavior, and environment details.

## How to Contribute Code

1. Fork the repo and create a topic branch from `main` (e.g. `fix/login-redirect`).
2. Make your changes following the coding standards below.
3. Add or update tests where applicable.
4. Run the local checks (see below).
5. Open a pull request against `main`. Reference any related issue. Describe the change and the reasoning.
6. A maintainer reviews and merges.

## Coding Standards

### Language and Style

- **TypeScript strict mode**. No `any` unless justified in a comment.
- **ESLint and the Next.js linter rules** are the source of truth for style. Run `npm run lint` before committing.
- **Prettier defaults** (2-space indent, single quotes, trailing commas where valid).
- Code, identifiers, and comments in **English**. User-facing strings translated in `messages/de.json` and `messages/en.json`.

### Architecture

- Feature-first layout under `src/features/<feature>/{components,hooks,services,types}`.
- Shared, cross-feature code lives in `src/shared/`.
- Next.js App Router pages under `src/app/[locale]/...` for localized routes and `src/app/api/...` for API routes.
- React Server Components by default. Add `'use client'` only when hooks, event handlers, or browser APIs are required.

### Data and Security

- Validate all user input with **Zod** schemas at the boundary.
- Never log secrets, tokens, or full request bodies.
- All external HTTP calls: 5s timeout, explicit `User-Agent`, HTTPS only, wrapped in `try/catch` with explicit error handling.
- Database access uses Supabase with Row-Level Security policies. Do not bypass RLS without a documented reason.

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short summary>
```

- `type` is one of `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`, `build`.
- Keep the subject under 70 characters.
- Use the body for the *why* when not obvious from the diff.

## Local Checks (run before opening a PR)

```bash
npm run lint        # ESLint
npx tsc --noEmit    # Type-check
npm test            # Run the Vitest suite
```

If you change DB schema or RLS, also run the Supabase migrations locally.

## Testing Policy

Every pull request that adds major new functionality MUST include automated tests for that functionality. Specifically:

- **New utility functions or business logic** (anything under `src/shared/lib/`): unit tests in a co-located `*.test.ts` file are required.
- **New API routes** (`src/app/api/`): a happy-path test plus at least one error-path test for the route handler.
- **New validation schemas** (Zod): tests covering both accept and reject cases.
- **Security-relevant changes** (auth flow, bio-code generation, signed exports, rate limits): tests are required even for small changes.

Bug fixes SHOULD include a regression test that fails before the fix and passes after.

Tests run automatically on every push and pull request via [`.github/workflows/test.yml`](./.github/workflows/test.yml). A PR that lowers test coverage in security-sensitive code will not be merged.

## Pull Request Requirements

- The PR description explains the change and links any related issue.
- All CI checks (gitleaks, CodeQL, type-check) pass.
- Code is reviewed by a maintainer before merge.
- We squash-merge into `main`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
