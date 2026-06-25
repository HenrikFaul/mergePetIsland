// Edge Function: validate-iap
// Verifies a store receipt (Google Play / Apple) and grants the entitlement.
// The store verification calls are stubbed; wire real verifyReceipt / Android
// Publisher API calls where indicated before production.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GRANTS: Record<string, { gems?: number; coins?: number; flag?: string }> = {
  'gems.small': { gems: 100 },
  'gems.medium': { gems: 600 },
  'gems.large': { gems: 2800 },
  'gems.mega': { gems: 8000 },
  'starter.pack': { gems: 500, coins: 5000 },
  'noads': { flag: 'noads' },
  'battlepass.s1': { gems: 300, flag: 'battlepass.s1' },
};

async function verifyReceipt(_store: string, _receipt: string): Promise<boolean> {
  // TODO: call Apple verifyReceipt / Google androidpublisher.purchases.products.get
  return true;
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  const service = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const authed = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { productId, store, receipt } = await req.json();
  const grant = GRANTS[productId];
  if (!grant) return new Response('unknown product', { status: 400 });

  const valid = await verifyReceipt(store, receipt);
  await service.from('iap_receipts').insert({
    user_id: user.id,
    product_id: productId,
    store,
    receipt,
    state: valid ? 'verified' : 'invalid',
  });
  if (!valid) return new Response('invalid receipt', { status: 402 });

  if (grant.gems || grant.coins) {
    const { data: state } = await service
      .from('island_state')
      .select('coins, gems')
      .eq('user_id', user.id)
      .single();
    await service
      .from('island_state')
      .update({
        coins: Number(state?.coins ?? 0) + (grant.coins ?? 0),
        gems: (state?.gems ?? 0) + (grant.gems ?? 0),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  }

  return Response.json({ ok: true, granted: grant });
});
