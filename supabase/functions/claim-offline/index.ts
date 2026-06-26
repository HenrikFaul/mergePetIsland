// Edge Function: claim-offline
// Returns server-authoritative offline earnings (capped at 8h) and advances
// last_seen_at so the reward can't be double-claimed.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OFFLINE_CAP_SEC = 8 * 3600;

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

  const { data: state, error } = await supa
    .from('island_state')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error || !state) return new Response('no state', { status: 404 });

  const now = Date.now();
  const lastSeen = new Date(state.last_seen_at).getTime();
  const offlineSec = Math.min(
    OFFLINE_CAP_SEC,
    Math.max(0, Math.floor((now - lastSeen) / 1000)),
  );

  let perSec = 0;
  for (const e of state.grid_state ?? []) {
    if (e.type === 'pet') perSec += e.coinPerSec ?? 0;
  }
  const earned = Math.floor(perSec * offlineSec);

  await supa
    .from('island_state')
    .update({
      coins: Number(state.coins) + earned,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  return Response.json({ earned, seconds: offlineSec, totalCoins: Number(state.coins) + earned });
});
