// 유저의 "내 일정" 데이터 + 푸시 구독 정보를 Vercel KV에 저장해요.
// 프론트에서 일정이 바뀔 때마다(추가/앱 로드 시) 이 엔드포인트로 동기화해요.
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { userId, subscription, scheduleItems } = req.body || {};
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId가 필요해요' });
      return;
    }

    const key = `click:user:${userId}`;
    const existing = (await kv.get(key)) || {};

    const updated = {
      subscription: subscription !== undefined ? subscription : (existing.subscription || null),
      scheduleItems: Array.isArray(scheduleItems) ? scheduleItems : (existing.scheduleItems || []),
      updatedAt: Date.now(),
    };

    await kv.set(key, updated);
    // 리마인드 크론이 순회할 수 있도록 유저 id 목록에도 등록
    await kv.sadd('click:users', userId);

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'save-schedule 저장 중 오류' });
  }
}
