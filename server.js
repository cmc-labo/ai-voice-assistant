// server.js
// シンプルなプロキシサーバー：フロントエンドからの音声チャットリクエストを
// Anthropic API に中継します。APIキーはサーバー側のみで保持します。
//
// 使い方:
//   1. npm install express
//   2. export ANTHROPIC_API_KEY="sk-ant-xxxxx"   (Mac/Linux)
//      または  set ANTHROPIC_API_KEY=sk-ant-xxxxx (Windows)
//   3. node server.js
//   4. ブラウザで http://localhost:3000 を開く

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  警告: 環境変数 ANTHROPIC_API_KEY が設定されていません。');
  console.warn('   例: export ANTHROPIC_API_KEY="sk-ant-xxxxx"');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Claude API へのプロキシエンドポイント
app.post('/api/chat', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY が設定されていません。' });
    }

    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'あなたは親切で知的なAIアシスタントです。ユーザーと日本語で会話します。返答は簡潔に、2〜3文程度にまとめてください。',
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ サーバー起動: http://localhost:${PORT}`);
});
