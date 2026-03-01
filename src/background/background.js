// MirrorMind - Background Service Worker
// Handles Azure OpenAI API calls with streaming

const AZURE_ENDPOINT = "https://mirrormind-ai.openai.azure.com";
const AZURE_API_KEY = "4jezzBpqAwhDgsVr1FNpoRI3Cu7fVss6e1Kz5Gnwr3yOXm80BtLjJQQJ99CCACYeBjFXJ3w3AAABACOGHQBm";
const AZURE_DEPLOYMENT = "gpt-4o-mini"; // your deployment name
const AZURE_API_VERSION = "2024-02-15-preview";

// Open side panel when extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for messages from content script or sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE_TEXT") {
    analyzeText(message.text, message.mode, sender.tab?.id);
    sendResponse({ status: "started" });
  }
  if (message.type === "OPEN_SIDEBAR") {
    chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ status: "opened" });
  }
  return true;
});

async function analyzeText(text, mode, tabId) {
  const prompts = {
    bias: `You are a media literacy expert. Analyze the following text for:
1. **Emotional Tone** (neutral/positive/negative/alarming) 
2. **Bias Indicators** (loaded language, framing, omissions)
3. **Manipulation Tactics** (if any: fear, urgency, bandwagon, etc.)
4. **Credibility Score** (0-100)
5. **Recommended Action** (accept/verify/skeptical)

Be specific, cite exact phrases from the text. Format with clear sections.

Text to analyze:
"${text.substring(0, 2000)}"`,

    summarize: `Summarize the following text in 3 bullet points. Be concise and objective.

Text: "${text.substring(0, 2000)}"`,

    simplify: `Rewrite the following text in simple, plain language that a high school student can understand. Keep all key information.

Text: "${text.substring(0, 2000)}"`,

    question: `Generate 3 critical thinking questions someone should ask after reading this text. Questions should probe assumptions, evidence quality, and missing perspectives.

Text: "${text.substring(0, 2000)}"`
  };

  const prompt = prompts[mode] || prompts.bias;

  try {
    const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_API_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are MirrorMind, an AI assistant that helps people think critically about media and information." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800,
        stream: true,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.text();
      chrome.runtime.sendMessage({ type: "STREAM_ERROR", error: `API Error: ${response.status}` });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    chrome.runtime.sendMessage({ type: "STREAM_START", mode });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

      for (const line of lines) {
        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") {
          chrome.runtime.sendMessage({ type: "STREAM_END" });
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            chrome.runtime.sendMessage({ type: "STREAM_TOKEN", token });
          }
        } catch (e) {
          // skip malformed chunks
        }
      }
    }

    chrome.runtime.sendMessage({ type: "STREAM_END" });

  } catch (err) {
    chrome.runtime.sendMessage({ type: "STREAM_ERROR", error: err.message });
  }
}
