// 계정(닉네임/직업 등)을 Vercel KV에 저장/조회해요.
// 이게 없으면 새로고침할 때마다 "처음 보는 사람"으로 취급돼서 회원가입 화면으로 다시 튕겨요.
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { provider, id } = req.query;
      if (!provider || !id) {
        res.status(400).json({ error: 'provider, id가 필요해요' });
        return;
      }
      const account = await kv.get(`click:account:${provider}:${id}`);
      res.status(200).json({ account: account || null });
      return;
    }

    if (req.method === 'POST') {
      const { provider, id, nickname, email, job } = req.body || {};
      if (!provider || !id || !nickname) {
        res.status(400).json({ error: 'provider, id, nickname이 필요해요' });
        return;
      }
      const account = { nickname, email: email || null, job: job || null, updatedAt: Date.now() };
      await kv.set(`click:account:${provider}:${id}`, account);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'account 처리 중 오류' });
  }
}
