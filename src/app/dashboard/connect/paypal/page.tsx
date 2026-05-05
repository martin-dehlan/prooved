import { OAuthConnectButton } from '@/features/connections';

export default function ConnectPayPalPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">PayPal verknüpfen</h1>
      <p className="text-sm text-zinc-600">
        Du wirst zu PayPal weitergeleitet. Wir holen nur Identitätsstatus und
        Account-Typ — keine Transaktionsdaten. Tier: Gold.
      </p>
      <OAuthConnectButton platform="paypal" />
    </div>
  );
}
