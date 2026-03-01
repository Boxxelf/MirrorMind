# 🪞 MirrorMind

**Real-time media bias and manipulation detection powered by Azure OpenAI**

Built for SEP × Microsoft for Startups Hackathon 2026

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI-0078D4?logo=microsoftazure&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)


## What it does

MirrorMind is a Chrome extension that helps you think critically about what you read online. Select any text on any webpage and instantly get:

-  **Bias Check** — Detects emotional tone, loaded language, and manipulation tactics
-  **Summarize** — 3-bullet summary of key points
-  **Simplify** — Plain language rewrite for complex text
-  **Critical Questions** — Questions to probe assumptions and missing perspectives

All powered by Azure OpenAI (GPT-4o-mini), with responses streaming in real time token-by-token directly in the Chrome Side Panel.


##  Try it out (Quickstart)

A demo API key is included for judges and reviewers to test immediately — no Azure account needed.

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/mirrormind.git
```

### 2. Load in Chrome
1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `mirrormind` folder

### 3. Use it
1. Go to any news site (e.g. [cnn.com](https://cnn.com))
2. Select any text on the page
3. Click the blue **Analyze** button that appears
4. See the analysis stream live in the sidebar

> ⚠️ The demo key is rate-limited and will be rotated after the hackathon. For long-term use, add your own Azure credentials (see below).


##  Using your own Azure credentials

If the demo key stops working, add your own:

1. Go to [Azure Portal](https://portal.azure.com) → create an **Azure OpenAI** resource
2. Deploy `gpt-4o-mini` in Azure AI Foundry
3. Open `src/background/background.js` and replace:

```js
const AZURE_ENDPOINT = "YOUR_AZURE_OPENAI_ENDPOINT";
const AZURE_API_KEY = "YOUR_AZURE_API_KEY";
const AZURE_DEPLOYMENT = "gpt-4o-mini";
```


## How to use

1. Click the MirrorMind icon in Chrome toolbar → **Open Sidebar Panel**
2. Navigate to any news article or webpage
3. Select text (at least 20 characters)
4. Click the blue **Analyze** floating button, or press **⌘⇧M**
5. Watch the analysis stream in real time in the sidebar
6. Switch between Bias Check / Summarize / Simplify / Questions modes


##  Architecture

```
Chrome Extension (MV3)
├── Content Script      → Detects text selection, injects floating button
├── Background Worker   → Calls Azure OpenAI API with SSE streaming
└── Side Panel          → Renders streaming response token-by-token
```

**Message flow:**
`Content Script` → (chrome.runtime.sendMessage) → `Background Worker` → (Azure OpenAI SSE) → `Background Worker` → (chrome.runtime.sendMessage) → `Side Panel`


##  Tech Stack

- **Chrome Extension Manifest V3** — Modern extension standard
- **Azure OpenAI GPT-4o-mini** — Fast, cost-efficient AI inference
- **Server-Sent Events (SSE) Streaming** — Real-time token-by-token output
- **Chrome Side Panel API** — Persistent sidebar without blocking the page
- **Vanilla JS + CSS** — Zero dependencies, lightweight and fast

Technical highlights:
- Real-time SSE streaming from Azure OpenAI rendered token-by-token in the UI
- Cross-context messaging architecture (content script → service worker → side panel)
- Chrome Side Panel API integration (released Chrome 114)
- Dynamic DOM injection with animated floating action button
- Markdown-to-HTML formatting pipeline for structured AI output
- Service Worker lifecycle management under Manifest V3 constraints


## Project Structure

```
mirrormind/
├── manifest.json
├── src/
│   ├── background/
│   │   └── background.js     # Azure OpenAI API calls + streaming
│   ├── content/
│   │   └── content.js        # Text selection detection + floating button
│   ├── sidebar/
│   │   ├── sidebar.html      # Side panel UI
│   │   ├── sidebar.css       # Styles
│   │   └── sidebar.js        # Stream rendering + mode switching
│   └── popup/
│       └── popup.html        # Extension popup
├── styles/
│   └── content.css           # Floating button styles
└── icons/
```
