# Security Policy

We take the security of Prooved seriously. If you believe you've found a security vulnerability, please follow the steps below.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security reports.**

Instead, email us at:

- `security@prooved.xyz`

Include in your report:

- A clear description of the issue
- Steps to reproduce, or a proof of concept
- The affected URL, endpoint, or component
- Your assessment of the impact
- Your contact details, so we can follow up

## What to Expect

- We will acknowledge your report within **72 hours**.
- We will give an initial assessment within **7 days**.
- We will keep you updated as we investigate and resolve the issue.
- We will credit you in the release notes once the fix ships, unless you prefer to stay anonymous.

## Scope

In scope:

- `prooved.xyz` and `*.prooved.xyz`
- The codebase in this repository
- Any official API or OAuth integration we operate

Out of scope:

- Vulnerabilities in upstream platforms (eBay, PayPal, Vinted, Kleinanzeigen, etc.) — please report those to the respective vendor.
- Volumetric DoS / DDoS attacks
- Social engineering against staff
- Findings from automated scanners with no demonstrated impact
- Issues already known and tracked

## Safe Harbor

If you act in good faith and follow this policy, we will not pursue legal action against you for your research.

## Supported Versions

Only the latest `main` branch deployed to production at `prooved.xyz` is in scope. There are no LTS branches.

## Disclosure Timeline

We follow a coordinated-disclosure model. We ask that you give us a reasonable window (typically 90 days, or sooner once a fix is shipped) before public disclosure.
