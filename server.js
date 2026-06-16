require('dotenv').config();

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT  = process.env.PORT  || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  Warning: ANTHROPIC_API_KEY is not set.');
  console.warn('   e.g. export ANTHROPIC_API_KEY="sk-ant-xxxxx"');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for Claude API
app.post('/api/chat', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set.' });
    }

    const { messages } = req.body;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: 'あなたは親切で知的なAIアシスタントです。ユーザーと日本語で会話します。返答は簡潔に、2〜3文程度にまとめてください。',
        messages,
        stream: true
      })
    });

    if (!upstream.ok) {
      const data = await upstream.json().catch(() => ({}));
      console.error('Anthropic API error:', data);
      return res.status(upstream.status).json(data);
    }

    // Relay the Server-Sent Events stream straight through to the client
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
});

// Start HTTPS if certificates exist, otherwise fall back to HTTP
const certPath = path.join(__dirname, 'certs', 'cert.pem');
const keyPath  = path.join(__dirname, 'certs', 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const credentials = {
    cert: fs.readFileSync(certPath),
    key:  fs.readFileSync(keyPath),
  };
  https.createServer(credentials, app).listen(PORT, () => {
    console.log(`✅ Server running (HTTPS): https://localhost:${PORT}`);
  });
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`✅ Server running (HTTP): http://localhost:${PORT}`);
    console.log('   Tip: add certs/cert.pem and certs/key.pem for HTTPS support.');
  });
}
