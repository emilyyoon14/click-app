// Vercel Cron이 매일 자동으로 호출하는 엔드포인트예요 (vercel.json 참고, 매일 09:00 KST).
// 모든 유저를 순회하면서 "내일 마감"인 일정이 있으면 웹 푸시 알림을 보내요.
import { kv } from '@vercel/kv';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:hello@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

function dateStrWithOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  // Vercel Cron은 CRON_SECRET을 설정해두면 자동으로 Authorization 헤더를 붙여서 호출해요.
  // 외부에서 아무나 이 URL을 호출해 알림을 발송하지 못하도록 막아주는 장치예요.
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const userIds = (await kv.smembers('click:users')) || [];
    const targetDate = dateStrWithOffset(1); // 내일 마감인 일정 대상

    let sent = 0;
    let cleaned = 0;

    for (const userId of userIds) {
      const record = await kv.get(`click:user:${userId}`);
      if (!record || !record.subscription || !Array.isArray(record.scheduleItems)) continue;

      const dueItems = record.scheduleItems.filter((item) => item.date === targetDate);
      if (dueItems.length === 0) continue;

      const titleList = dueItems.map((i) => i.note).filter(Boolean).join(', ');
      const payload = JSON.stringify({
        title: '📅 내일 마감이에요',
        body: titleList ? `${titleList} — 잊지 말고 확인하세요!` : '내일 마감인 일정이 있어요.',
        url: '/',
      });

      try {
        await webpush.sendNotification(record.subscription, payload);
        sent++;
      } catch (err) {
        // 구독이 만료/취소된 경우(410/404) 정리
        if (err.statusCode === 410 || err.statusCode === 404) {
          await kv.set(`click:user:${userId}`, { ...record, subscription: null });
          cleaned++;
        }
      }
    }

    res.status(200).json({ ok: true, checked: userIds.length, sent, cleaned });
  } catch (err) {
    res.status(500).json({ error: err.message || 'send-reminders 실행 중 오류' });
  }
}
