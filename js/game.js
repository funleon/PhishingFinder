// Game State
let currentScenario = null;
let foundClues = new Set();
let score = 0;
const TOTAL_CLUES = 5;
const SCORE_PER_CLUE = 20;

// DOM Elements
const emailContentArea = document.getElementById('email-content-area');
const scoreDisplay = document.getElementById('score');
const foundCountDisplay = document.getElementById('found-count');
const startModal = document.getElementById('start-modal');
const feedbackModal = document.getElementById('feedback-modal');
const gameOverModal = document.getElementById('game-over-modal');

// Init
function startGame() {
    startModal.classList.remove('show');
    loadRandomScenario();
}

function loadRandomScenario() {
    // Select random scenario from global quizData (loaded from data.js)
    const randomIndex = Math.floor(Math.random() * quizData.length);
    currentScenario = quizData[randomIndex];

    // Render
    renderEmail(currentScenario);
}

function renderEmail(data) {
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
        <div class="email-header">
            <h2 class="email-subject" data-target="subject">${data.subject}</h2>
            <div class="email-meta">
                <div class="avatar">${data.sender.charAt(0).toUpperCase()}</div>
                <div class="sender-info">
                    <span class="sender-name" data-target="sender">${getSenderName(data.sender)}</span>
                    <span class="sender-email" data-target="sender">&lt;${data.sender}&gt;</span>
                    <span class="to-me">寄給 我</span>
                </div>
                <div style="margin-left: auto; color: #605e5c; font-size: 12px;">${today}</div>
            </div>
        </div>
        <div class="email-body" data-target="content">
            ${markInteractiveContent(data.content)}
        </div>
    `;

    emailContentArea.innerHTML = html;

    // Attach click listeners to everything in the email view
    // We delegate interactions
    emailContentArea.addEventListener('click', handleEmailClick);
}

// Helper to extract name from email or part of it
function getSenderName(email) {
    return email.split('@')[0];
}

// Helper to wrap text content in spans if needed, but for now we rely on user clicking specific elements
// However, to make specific parts "clickable" as hotspots, we can just detect what was clicked.
// But some hotspots are "sender", "subject".
// The content (body) might have hotspots like "link" or "greeting".
// We need to map clicks to targets.
function markInteractiveContent(htmlContent) {
    // For simplicity, we assume the HTML content from data.js already has some structure.
    // We will treat specific elements as targets based on heuristic or classes if added.
    // But since data.js is simple HTML string, we'll traverse logic in handleClick.
    return htmlContent;
}

function handleEmailClick(e) {
    // Prevent default link actions
    if (e.target.tagName === 'A') {
        e.preventDefault();
    }

    let targetType = null;
    let clickedElement = e.target;

    // Identify what was clicked
    if (clickedElement.closest('.email-subject')) {
        targetType = 'subject';
    } else if (clickedElement.closest('.sender-info')) {
        targetType = 'sender';
    } else if (clickedElement.tagName === 'A' || clickedElement.closest('a')) {
        targetType = 'link';
    } else if (clickedElement.innerText && (clickedElement.innerText.includes('親愛') || clickedElement.innerText.includes('客戶') || clickedElement.innerText.includes('同仁') || clickedElement.innerText.includes('用戶'))) {
        // Heuristic for greeting
        targetType = 'greeting';
    } else if (clickedElement.innerText && (clickedElement.innerText.includes('立即') || clickedElement.innerText.includes('升級') || clickedElement.innerText.includes('失效') || clickedElement.innerText.includes('暫停'))) {
        // Heuristic for urgency/offer content blocks
        targetType = 'urgency';
    } else {
        // Fallback: check if we clicked on body content generally
        // This is tricky. Let's try to match specific clues.
        targetType = 'content';
    }

    // Check if this targetType matches any clue
    checkClue(targetType);
}

function checkClue(targetType) {
    // Find if this target represents a valid clue that hasn't been found yet
    const clue = currentScenario.clues.find(c => {
        // Simple matching logic. 
        // In a real refined version, we might want precise ID matching.
        // For now, we match broad categories: 'sender', 'subject', 'link', 'greeting', 'urgency', 'content'
        if (foundClues.has(c.id)) return false; // Already found

        // fuzzy match
        if (c.target === targetType) return true;

        // If targetType is 'content', it might match 'urgency' or 'offer' if we didn't detect it precisely
        if (targetType === 'content' && (c.target === 'urgency' || c.target === 'offer' || c.target === 'signature')) {
            // We give benefit of doubt if they click the paragraph text
            return true;
        }

        return false;
    });

    if (clue) {
        // Correct find!
        foundClues.add(clue.id);
        score += SCORE_PER_CLUE;
        updateUI();
        showFeedback(true, "找到疑點！", clue.reason);

        if (foundClues.size >= TOTAL_CLUES) {
            // No auto end, wait for user to click button in feedback modal
        }
    } else {
        // Wrong or already found
        if (foundClues.size < TOTAL_CLUES) {
            // Optional: penalize or just show info? 
            // SA says "display warning/info"
            // showFeedback(false, "這裡看起來很正常", "請再仔細看看其他地方。");
        }
    }
}

function updateUI() {
    scoreDisplay.innerText = score;
    foundCountDisplay.innerText = foundClues.size;
}

function showFeedback(isSuccess, title, message) {
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackBody = document.getElementById('feedback-body');

    feedbackTitle.innerText = title;
    feedbackTitle.className = "modal-header " + (isSuccess ? "success" : "info");
    feedbackBody.innerText = message;

    const feedbackBtn = feedbackModal.querySelector('.btn-modal');
    if (foundClues.size >= TOTAL_CLUES) {
        feedbackBtn.innerText = "完成遊戲";
    } else {
        feedbackBtn.innerText = "繼續尋找";
    }

    feedbackModal.classList.add('show');
}

function closeFeedback() {
    feedbackModal.classList.remove('show');
    if (foundClues.size >= TOTAL_CLUES) {
        endGame();
    }
}

function endGame() {
    feedbackModal.classList.remove('show');
    document.getElementById('final-score').innerText = score;
    gameOverModal.classList.add('show');
}

function generateCertificate() {
    const username = document.getElementById('username').value.trim() || "熱心玩家";

    // Fill certificate data
    document.getElementById('cert-name-text').innerText = username;
    document.getElementById('cert-score-text').innerText = score;
    document.getElementById('cert-date-text').innerText = new Date().toLocaleDateString('zh-TW');

    // Show container momentarily (offscreen)
    const certContainer = document.getElementById('certificate-container');
    certContainer.style.display = 'block';

    // Use html2canvas with options to handle images better
    html2canvas(document.getElementById('certificate'), {
        useCORS: true,
        allowTaint: true, // Try to allow taint if CORS fails for local dev
        logging: true
    }).then(canvas => {
        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `資安證書_${username}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (e) {
            console.error("Certificate export failed:", e);
            alert("無法匯出證書圖片 (瀏覽器安全限制)。請嘗試在本地伺服器環境執行。");
        }

        // Hide again
        certContainer.style.display = 'none';
    }).catch(err => {
        console.error("Certificate generation failed:", err);
        alert("產生證書時發生錯誤：" + err);
        certContainer.style.display = 'none';
    });
}
