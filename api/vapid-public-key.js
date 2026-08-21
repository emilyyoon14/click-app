// VAPID 공개키는 이름 그대로 "공개"해도 되는 키예요 (비밀키만 서버에만 있으면 돼요).
// 프론트에서 이 엔드포인트로 공개키를 받아서 푸시 구독에 사용해요.
export default function handler(req, res) {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
}
