// MirrorMind - Sidebar Script

let currentMode = "bias";
let currentText = "";
let isAnalyzing = false;

const modeLabels = {
  bias: "Bias Analysis",
  summarize: "Summary",
  simplify: "Simplified Version",
  question: "Critical Questions"
};

// DOM refs
const previewText = document.getElementById("previewText");
const analyzeBtn = document.getElementById("analyzeBtn");
const emptyState = document.getElementById("emptyState");
const loading = document.getElementById("loading");
const output = document.getElementById("output");
const outputContent = document.getElementById("outputContent");
const outputLabel = document.getElementById("outputLabel");
const copyBtn = document.getElementById("copyBtn");

// Mode buttons
document.querySelectorAll(".mm-mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mm-mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    
    // Re-analyze if we have text
    if (currentText && !isAnalyzing) {
      startAnalysis();
    }
  });
});

// Analyze button
analyzeBtn.addEventListener("click", () => {
  if (currentText && !isAnalyzing) {
    startAnalysis();
  }
});

// Copy button
copyBtn.addEventListener("click", () => {
  const text = outputContent.innerText;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 2000);
  });
});

function startAnalysis() {
  isAnalyzing = true;
  showLoading();
  chrome.runtime.sendMessage({
    type: "ANALYZE_TEXT",
    text: currentText,
    mode: currentMode
  });
}

function showLoading() {
  emptyState.style.display = "none";
  output.style.display = "none";
  loading.style.display = "flex";
  outputContent.innerHTML = "";
}

function showOutput() {
  loading.style.display = "none";
  output.style.display = "block";
  outputLabel.textContent = modeLabels[currentMode];
}

// Format markdown-like text to HTML
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*)/gm, "<h4 style='margin: 10px 0 4px; color: #0078D4; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;'>$1</h4>")
    .replace(/^## (.*)/gm, "<h3 style='margin: 12px 0 6px; color: #323130; font-size: 13px;'>$1</h3>")
    .replace(/^# (.*)/gm, "<h2 style='margin: 12px 0 6px; color: #323130; font-size: 14px;'>$1</h2>")
    .replace(/^- (.*)/gm, "• $1")
    .replace(/\n/g, "<br>");
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ANALYZE_TEXT") {
    // Triggered from content script via background
    currentText = message.text;
    updatePreview(currentText);
    analyzeBtn.disabled = false;
    startAnalysis();
  }

  if (message.type === "STREAM_START") {
    showOutput();
    outputContent.innerHTML = "";
  }

  if (message.type === "STREAM_TOKEN") {
    isAnalyzing = true;
    const rawText = outputContent.dataset.raw || "";
    const newRaw = rawText + message.token;
    outputContent.dataset.raw = newRaw;
    outputContent.innerHTML = formatText(newRaw);
    
    // Auto-scroll
    outputContent.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  if (message.type === "STREAM_END") {
    isAnalyzing = false;
  }

  if (message.type === "STREAM_ERROR") {
    isAnalyzing = false;
    loading.style.display = "none";
    output.style.display = "block";
    outputContent.innerHTML = `<span style="color: #D83B01;">Error: ${message.error}</span><br><br>Please check your Azure API key in the extension settings.`;
  }
});

// Also listen for text selected via content script floating button
chrome.storage.local.get("selectedText", ({ selectedText }) => {
  if (selectedText) {
    currentText = selectedText;
    updatePreview(currentText);
    analyzeBtn.disabled = false;
    chrome.storage.local.remove("selectedText");
  }
});

function updatePreview(text) {
  previewText.textContent = text.length > 150 ? text.substring(0, 150) + "..." : text;
  previewText.classList.add("has-text");
}

// Check for pending analysis on load
chrome.storage.session.get(["pendingText", "pendingMode"], ({ pendingText, pendingMode }) => {
  if (pendingText) {
    currentText = pendingText;
    if (pendingMode) currentMode = pendingMode;
    updatePreview(currentText);
    analyzeBtn.disabled = false;
    chrome.storage.session.remove(["pendingText", "pendingMode"]);
    setTimeout(() => startAnalysis(), 500);
  }
});
