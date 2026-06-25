// IAP catalog. In production these resolve through the store + server-side
// receipt validation (see supabase/functions/validate-iap). Here the grant
// fields drive the sandbox shop on ShopScreen.

export interface IapProduct {
  productId: string;
  title: string;
  emoji: string;
  priceUsd: number;
  type: 'consumable' | 'nonconsumable' | 'season';
  grantGems?: number;
  grantCoins?: number;
}

export const IAP_CATALOG: IapProduct[] = [
  { productId: 'gems.small', title: '100 Gems', emoji: '💎', priceUsd: 0.99, type: 'consumable', grantGems: 100 },
  { productId: 'gems.medium', title: '600 Gems', emoji: '💎', priceUsd: 4.99, type: 'consumable', grantGems: 600 },
  { productId: 'gems.large', title: '2,800 Gems', emoji: '💎', priceUsd: 19.99, type: 'consumable', grantGems: 2800 },
  { productId: 'gems.mega', title: '8,000 Gems', emoji: '💎', priceUsd: 49.99, type: 'consumable', grantGems: 8000 },
  { productId: 'starter.pack', title: 'Starter Pack', emoji: '🎀', priceUsd: 4.99, type: 'nonconsumable', grantGems: 500, grantCoins: 5000 },
  { productId: 'noads', title: 'Remove Ads', emoji: '🚫', priceUsd: 3.99, type: 'nonconsumable' },
  { productId: 'battlepass.s1', title: 'Battle Pass S1', emoji: '🏆', priceUsd: 9.99, type: 'season', grantGems: 300 },
];
