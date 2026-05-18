-- Add 'facebook' to the connections.platform CHECK constraint.
-- Idempotent: drops old constraint by name if present, recreates with full platform set.
-- Note: this file lists every platform currently supported by adapters/index.ts,
-- in case earlier ad-hoc ALTERs in the live DB drifted from 0001_init.sql.

ALTER TABLE connections
  DROP CONSTRAINT IF EXISTS connections_platform_check;

ALTER TABLE connections
  ADD CONSTRAINT connections_platform_check
  CHECK (platform IN (
    'ebay',
    'vinted',
    'kleinanzeigen',
    'paypal',
    'website',
    'etsy',
    'github',
    'linkedin',
    'facebook',
    'discogs',
    'willhaben',
    'shpock',
    'reverb',
    'custom'
  ));
