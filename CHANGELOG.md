# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-05-19

First tagged public beta. Continuously deployed at <https://prooved.xyz>.

### Added

- Magic-link authentication with locale-aware redirect through PKCE callback.
- Localized routing (`/de`, `/en`) under Next.js App Router with `next-intl`.
- Platform connectors: eBay (OAuth Gold), PayPal (OAuth Gold), Vinted (bio-code Silver), Kleinanzeigen (bio-code Silver), Etsy, GitHub, LinkedIn, Discogs, Reverb, Shpock, Willhaben, Facebook.
- Public verified-profile pages at `/[slug]` with platform cards, source attribution, and expiry warnings.
- Abuse-report flow with email notification to the admin address.
- Account settings: theme, language, email change, account deletion.
- Activity log with per-user filtering.
- Signed JSON export of a user's profile and connections.
- Optional Solana wallet verification (Phantom, Solflare) with nonce signing.
- eBay marketplace account-deletion webhook.
- Daily cron at `/api/cron/refresh-connections` to refresh cached platform stats.
- PostHog cookieless product analytics.

### Security

- Vercel functions pinned to `fra1` (Frankfurt) so compute stays in the EU.
- Strict Content-Security-Policy, HSTS with `preload`, X-Frame-Options `DENY`, Referrer-Policy `strict-origin-when-cross-origin`, Permissions-Policy locking down sensor APIs.
- CAA records pin certificate issuance to Let's Encrypt; DNSSEC enabled at the registrar.
- DMARC (`p=none` reporting), SPF, DKIM (Resend) configured for the email domain.
- `/.well-known/security.txt` per RFC 9116 and a published `SECURITY.md` with a 72-hour acknowledgement commitment.
- OpenSSF Scorecard and CodeQL workflows added to CI.
- Dependabot enabled for weekly npm and GitHub Actions updates.
- Bumped `next` to `16.2.6` to clear the PostCSS XSS advisory in the transitive dep tree.

### Documentation

- `SECURITY.md` — disclosure policy and scope.
- `CONTRIBUTING.md` — coding standards, commit format, PR requirements.
- `docs/INTERFACE.md` — external HTTP API surface, OAuth callbacks, webhooks, cron paths.

[Unreleased]: https://github.com/martin-dehlan/prooved/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/martin-dehlan/prooved/releases/tag/v0.1.0
