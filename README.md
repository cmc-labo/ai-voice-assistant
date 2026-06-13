# AI Voice Chat

A minimal web app that lets you speak to Claude and hear its response — powered by the Web Speech API for recognition and synthesis, with a lip-syncing avatar.

![screenshot](docs/screenshot.png)

## Features

- **Voice input** via Web Speech API (browser-native, no external STT service)
- **Claude API** integration through a local proxy server (keeps your API key server-side)
- **Text-to-speech** playback with Japanese voice selection
- **Lip-sync avatar** that animates while Claude speaks
- **Conversation history** maintained across turns within a session
- **HTTPS** support via self-signed certificate (required for mic access on non-localhost)

## Project Structure

```
ai-voice-chat/
├── server.js          # Express proxy server — forwards requests to Anthropic API
├── package.json
├── .env               # Your API key (never committed — see .env.example)
├── .env.example       # Template for environment variables
├── certs/             # Self-signed SSL certificates (never committed)
│   ├── cert.pem
│   └── key.pem
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

Copy `.env.example` to `.env` and fill in your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
PORT=3000
```

### 3. (Optional) Generate a self-signed HTTPS certificate

HTTPS is required when accessing from any address other than `localhost` (e.g. a VM's private IP).

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 \
  -keyout certs/key.pem -out certs/cert.pem \
  -days 825 -nodes \
  -subj "/CN=192.168.33.10" \
  -addext "subjectAltName=IP:192.168.33.10,IP:127.0.0.1,DNS:localhost"
```

Replace `192.168.33.10` with your machine's IP address.  
If `certs/` is absent the server falls back to plain HTTP automatically.

### 4. Start the server

```bash
npm start
```

With certificates present you will see:

```
✅ Server running (HTTPS): https://localhost:3000
```

### 5. Open in your browser

| Access from | URL |
|---|---|
| Same machine | `https://localhost:3000` |
| Another device / VM host | `https://<your-ip>:3000` |

On first visit your browser will warn about the self-signed certificate.  
Click **Advanced → Proceed** to continue. This is a one-time step.

> **Note:** The Web Speech API (microphone) only works on `localhost` or over HTTPS. Chrome is strongly recommended.

## Why a proxy server?

Calling `api.anthropic.com` directly from the browser runs into two problems:

1. **CORS** — the API does not allow cross-origin requests from browsers.
2. **Key exposure** — embedding your API key in frontend code makes it visible to anyone who opens DevTools.

The Express server in `server.js` keeps the API key on the server side and acts as a thin relay between the frontend and the Anthropic API.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key |
| `PORT` | No | Port to listen on (default: `3000`) |

## Roadmap

- [ ] Streaming responses (chunk-by-chunk display and speech)
- [ ] Voice selector UI for TTS
- [ ] Persistent conversation history (localStorage)
- [ ] Live2D / Three.js lip-sync integration
- [ ] Deploy guide (Railway, Render, etc.)

## License

MIT
