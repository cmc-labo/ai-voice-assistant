# AI Voice Chat

A minimal web app that lets you speak to Claude and hear its response — powered by the Web Speech API for recognition and synthesis, with a lip-syncing avatar.

![screenshot](docs/screenshot.png)

## Features

- **Voice input** via Web Speech API (browser-native, no external STT service)
- **Claude API** integration through a local proxy server (keeps your API key server-side)
- **Text-to-speech** playback with Japanese voice selection
- **Lip-sync avatar** that animates while Claude speaks
- **Conversation history** maintained across turns within a session

## Project Structure

```
ai-voice-chat/
├── server.js          # Express proxy server — forwards requests to Anthropic API
├── package.json
└── public/
    └── index.html     # Frontend UI (single-file, no build step)
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- An [Anthropic API key](https://console.anthropic.com/)
- Google Chrome (recommended — Web Speech API support varies by browser)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set your Anthropic API key

**macOS / Linux:**
```bash
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxx"
```

**Windows (Command Prompt):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxx"
```

### 3. Start the server

```bash
npm start
```

You should see:
```
✅ Server running: http://localhost:3000
```

### 4. Open in your browser

Navigate to `http://localhost:3000`, tap the mic button, and start talking.

> **Note:** The Web Speech API only works on `localhost` or over HTTPS. Chrome is strongly recommended.

## Why a proxy server?

Calling `api.anthropic.com` directly from the browser runs into two problems:

1. **CORS** — the API does not allow cross-origin requests from browsers.
2. **Key exposure** — embedding your API key in frontend code makes it visible to anyone who opens DevTools.

The Express server in `server.js` keeps the API key in the environment and acts as a thin relay between the frontend and the Anthropic API.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key |
| `PORT` | No | HTTP port (default: `3000`) |

## Roadmap

- [ ] Streaming responses (chunk-by-chunk display and speech)
- [ ] Voice selector UI for TTS
- [ ] Persistent conversation history (localStorage)
- [ ] Live2D / Three.js lip-sync integration
- [ ] HTTPS / deploy guide (Railway, Render, etc.)

## License

MIT
