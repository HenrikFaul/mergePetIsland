// Edge Function: refresh-quests
// Generates 3 AI-personalised daily quests via the Lovable AI Gateway, with a
// deterministic fallback so the daily reset never blocks on the model.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const FALLBACK = [
  { key: 'merge_lv3', target: 3, reward: { gems: 5, egg: 'basic' } },
  { key: 'collect_25k', target: 25000, reward: { gems: 15, egg: 'golden' } },
  { key: 'discover_2_pets', target: 2, reward: { gems: 30, egg: 'golden' } },
];

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

  const { data: state } = await supa
    .from('island_state')
    .select('coins, biomes_unlocked, pet_album')
    .eq('user_id', user.id)
    .single();

  let quests = FALLBACK;
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (apiKey && state) {
    try {
      const highest = Math.max(0, ...Object.values(state.pet_album ?? {}).map(Number));
      const prompt = `Generate 3 daily quests for a merge/idle pet game.
Player: highest pet level ${highest}, biomes ${(state.biomes_unlocked ?? []).join(',')}, coins ${state.coins}.
Each achievable in one 5-15 min session, tied to: merge, collect coin, place decoration, buy egg.
Varied difficulty (easy/medium/hard). Reward gem (5/15/30) + optional special egg.
Output JSON {"quests":[{"key","target","reward":{"gems","egg"}}]}.`;
      const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Lovable-API-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });
      const j = await r.json();
      const parsed = JSON.parse(j.choices?.[0]?.message?.content ?? '{}');
      if (Array.isArray(parsed.quests) && parsed.quests.length) quests = parsed.quests;
    } catch {
      quests = FALLBACK;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const q of quests) {
    await supa.from('quests').upsert(
      {
        user_id: user.id,
        date: today,
        quest_key: q.key,
        progress: 0,
        target: q.target,
        reward: q.reward,
        claimed: false,
      },
      { onConflict: 'user_id,date,quest_key' },
    );
  }
  return Response.json({ quests });
});
