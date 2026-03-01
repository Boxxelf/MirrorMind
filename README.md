# 🪞 MirrorMind

**Real-time media bias and manipulation detection powered by Azure OpenAI**

Built for SEP × Microsoft for Startups Hackathon 2026

---

## What it does

MirrorMind is a Chrome extension that helps you think critically about what you read online. Select any text on any webpage and instantly get:

- **Bias Check** — Detects emotional tone, loaded language, and manipulation tactics
- **Summarize** — 3-bullet summary of key points
- **Simplify** — Plain language rewrite
- **Critical Questions** — Questions to probe assumptions and missing perspectives

All powered by Azure OpenAI, streaming responses in real time.

---

## Setup

### 1. Get your Azure OpenAI credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Create an Azure OpenAI resource
3. Deploy `gpt-4o-mini` model
4. Copy your endpoint and API key

### 2. Add your credentials

Open `src/background/background.js` and replace:

```js
const AZURE_ENDPOINT = "YOUR_AZURE_OPENAI_ENDPOINT";
const AZURE_API_KEY = "YOUR_AZURE_API_KEY";
const AZURE_DEPLOYMENT = "gpt-4o-mini";
```

### 3. Load the extension in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select this project folder

### 4. Add icons

Add PNG icons to the `icons/` folder:
- `icon16.png` (16×16)
- `icon48.png` (48×48)
- `icon128.png` (128×128)

---

## How to use

1. Click the MirrorMind icon → **Open Sidebar Panel**
2. Go to any news article or webpage
3. Select text (at least 20 characters)
4. Click the blue **Analyze** button that appears, or press **⌘⇧M**
5. See the analysis stream in real time in the sidebar

---

## Tech Stack

- Chrome Extension Manifest V3
- Azure OpenAI (GPT-4o-mini) with streaming
- Vanilla JS + CSS (no frameworks, fast and lightweight)
- Chrome Side Panel API

---

## Prize Track

**Most Technically Complex/Impressive**

Technical highlights:
- Real-time SSE streaming from Azure OpenAI rendered token-by-token
- Chrome Side Panel API integration
- Cross-context messaging (content script → background → sidebar)
- Dynamic DOM injection with floating action button
- Markdown-to-HTML formatting pipeline
- Service Worker lifecycle management (Manifest V3)
