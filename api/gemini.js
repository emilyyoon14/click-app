// /api/gemini.js
// Vercel 서버리스 함수 — 브라우저가 아니라 여기서만 Gemini API 키를 사용합니다.
// 키는 Vercel 프로젝트의 "Environment Variables"에 GEMINI_API_KEY로 등록하세요.
//
// 이 함수는 프론트엔드(index.html)가 보내는 { model, contents, generationConfig }를
// 그대로 Gemini API로 전달하고, 응답을 그대로 돌려주는 "프록시" 역할만 해요.

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb', // 사진/PDF(base64)가 들어오므로 넉넉하게
    },
  },
};

// 무료 티어(Flash 계열)만 사용하도록 기본값을 고정해뒀어요.
// 나중에 Google이 모델을 바꾸면(가끔 있는 일이에요), 이 줄 하나만 바꾸면 돼요.
const DEFAULT_MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '서버에 GEMINI_API_KEY가 설정되어 있지 않아요. Vercel 프로젝트 설정 > Environment Variables에서 등록해주세요.',
    });
  }

  try {
    const { model, contents, generationConfig } = req.body || {};

    if (!contents) {
      return res.status(400).json({ error: 'contents가 없어요.' });
    }

    const modelId = model || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({ contents, generationConfig }),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = (data && data.error && data.error.message) || `Gemini API 오류 (${geminiResponse.status})`;
      return res.status(geminiResponse.status).json({ error: message });
    }

    // index.html이 기대하는 형태(data.candidates 등) 그대로 전달
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: '서버 처리 중 오류가 발생했어요: ' + err.message });
  }
}
