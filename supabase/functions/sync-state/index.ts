// Edge Function: sync-state
// Client pushes its island_state every ~30s. The server applies anti-cheat
// reconciliation on coins and persists the snapshot.
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  const supa = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const body = await req.json();
  const { data: prev } = await supa
    .from('island_state')
    .select('coins, last_seen_at, grid_state')
    .eq('user_id', user.id)
    .single();

  // Anti-cheat: cap the coin gain by the theoretical max since last sync.
  let coins = Number(body.coins ?? 0);
  if (prev) {
    const elapsedSec = Math.max(
      0,
      (Date.now() - new Date(prev.last_seen_at).getTime()) / 1000,
    );
    let perSec = 0;
    for (const e of prev.grid_state ?? []) if (e.type === 'pet') perSec += e.coinPerSec ?? 0;
    const maxGain = perSec * elapsedSec * 1.2 + 100_000; // tolerance + manual grants
    coins = Math.min(coins, Number(prev.coins) + maxGain);
  }

  const { error } = await supa
    .from('island_state')
    .update({
      coins: Math.floor(coins),
      gems: body.gems ?? 0,
      biomes_unlocked: body.biomesUnlocked ?? ['grass'],
      pet_album: body.album ?? {},
      grid_state: body.grid ?? [],
      owned_decorations: body.ownedDecorations ?? [],
      daily_streak: body.dailyStreak ?? 0,
      last_daily_claim: body.lastDailyClaim ?? null,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true, coins: Math.floor(coins) });
});
