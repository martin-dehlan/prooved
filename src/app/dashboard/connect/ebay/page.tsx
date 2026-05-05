import { OAuthConnectButton } from '@/features/connections';

export default function ConnectEbayPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">eBay verknüpfen</h1>
      <p className="text-sm text-zinc-600">
        Du wirst zu eBay weitergeleitet. Nach der Bestätigung holen wir deine
        FeedbackScore über die Trading API. Tier: Gold.
      </p>
      <OAuthConnectButton platform="ebay" />
    </div>
  );
}
