import { Badge } from '@/shared/components/ui';

export function WalletBadge({ address }: { address: string | null }) {
  if (!address) return null;
  const short = `${address.slice(0, 4)}…${address.slice(-4)}`;
  return (
    <a
      href={`https://explorer.solana.com/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge variant="success">◎ {short}</Badge>
    </a>
  );
}
