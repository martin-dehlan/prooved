// PostHog client — EU cloud, cookieless (memory persistence).
// Cookieless mode avoids §25 TDDDG consent banner requirement.
// Trade-off: returning visitors counted as new on reload.
import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!key) return;

  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    persistence: 'memory',
    autocapture: true,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    disable_session_recording: false,
    person_profiles: 'identified_only',
  });
  initialized = true;
}

export function isPostHogReady() {
  return initialized;
}

export { posthog };
