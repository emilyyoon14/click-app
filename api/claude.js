export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '서버에 ANTHROPIC_API_KEY가 설정되어 있지 않아요. Vercel 프로젝트 설정 > Environment Variables에서 등록해주세요.',
    });
  }

  try {
    const { model, max_tokens, messages } = req.body || {};

    if (!messages) {
      return res.status(400).json({ error: 'messages가 없어요.' });
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 4096,
        messages,
      }),
    });

    const data = await claudeResponse.json();

    if (!claudeResponse.ok) {
      const message = (data && data.error && data.error.message) || `Claude API 오류 (${claudeResponse.status})`;
      return res.status(claudeResponse.status).json({ error: message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: '서버 처리 중 오류가 발생했어요: ' + err.message });
  }
}
