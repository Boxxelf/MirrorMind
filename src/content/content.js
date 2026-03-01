// MirrorMind - Content Script
// Detects text selection and triggers analysis

let selectionTimeout = null;
let floatingButton = null;
let selectedText = "";

// Create floating action button
function createFloatingButton() {
  const btn = document.createElement("div");
  btn.id = "mirrormind-btn";
  btn.innerHTML = `
    <div class="mm-btn-inner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <span>Analyze</span>
    </div>
  `;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedText) {
      chrome.runtime.sendMessage({ type: "OPEN_SIDEBAR" });
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: "ANALYZE_TEXT",
          text: selectedText,
          mode: "bias"
        });
      }, 300);
      hideFloatingButton();
    }
  });
  document.body.appendChild(btn);
  return btn;
}

function showFloatingButton(x, y) {
  if (!floatingButton) {
    floatingButton = createFloatingButton();
  }
  floatingButton.style.left = `${Math.min(x, window.innerWidth - 120)}px`;
  floatingButton.style.top = `${y - 45}px`;
  floatingButton.style.display = "block";
  floatingButton.classList.add("mm-visible");
}

function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.classList.remove("mm-visible");
    setTimeout(() => {
      if (floatingButton) floatingButton.style.display = "none";
    }, 200);
  }
}

// Listen for text selection
document.addEventListener("mouseup", (e) => {
  clearTimeout(selectionTimeout);
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 20) {
      selectedText = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showFloatingButton(
        rect.left + window.scrollX + rect.width / 2,
        rect.top + window.scrollY
      );
    } else {
      hideFloatingButton();
      selectedText = "";
    }
  }, 200);
});

document.addEventListener("mousedown", (e) => {
  if (e.target.id !== "mirrormind-btn" && !e.target.closest("#mirrormind-btn")) {
    hideFloatingButton();
  }
});

// Listen for keyboard shortcut (Cmd/Ctrl + Shift + M)
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "M") {
    const text = window.getSelection()?.toString().trim();
    if (text && text.length > 20) {
      selectedText = text;
      chrome.runtime.sendMessage({ type: "OPEN_SIDEBAR" });
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: "ANALYZE_TEXT",
          text: selectedText,
          mode: "bias"
        });
      }, 300);
    }
  }
});
