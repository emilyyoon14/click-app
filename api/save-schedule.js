// 유저의 "내 일정" + 분석 기록(chatHistory) + 약점 태그(topicHistory) + 푸시 구독 정보를
// Vercel KV에 저장/조회해요. 로그인할 때 이걸 다시 불러와야 기록이 안 사라져요.
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'userId가 필요해요' });
        return;
      }
      const record = await kv.get(`click:user:${userId}`);
      res.status(200).json({ record: record || null });
      return;
    }

    if (req.method === 'POST') {
      const { userId, subscription, scheduleItems, chatHistory, topicHistory } = req.body || {};
      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'userId가 필요해요' });
        return;
      }

      const key = `click:user:${userId}`;
      const existing = (await kv.get(key)) || {};

      const updated = {
        subscription: subscription !== undefined ? subscription : (existing.subscription || null),
        scheduleItems: Array.isArray(scheduleItems) ? scheduleItems : (existing.scheduleItems || []),
        chatHistory: Array.isArray(chatHistory) ? chatHistory : (existing.chatHistory || []),
        topicHistory: Array.isArray(topicHistory) ? topicHistory : (existing.topicHistory || []),
        updatedAt: Date.now(),
      };

      await kv.set(key, updated);
      // 리마인드 크론이 순회할 수 있도록 유저 id 목록에도 등록
      await kv.sadd('click:users', userId);

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'save-schedule 처리 중 오류' });
  }
}
