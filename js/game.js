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

    // Traverse up to find an element with data-target
    // This allows clicking inside a span or link to still work
    const targetElement = clickedElement.closest('[data-target]');

    if (targetElement) {
        targetType = targetElement.dataset.target;
    } else {
        // Fallback checks for header elements which we manually tagged in renderEmail
        if (clickedElement.closest('.email-subject')) {
            targetType = 'subject';
        } else if (clickedElement.closest('.sender-info')) {
            targetType = 'sender';
        } else {
            // If no specific target found, treat as general content or ignore
            targetType = 'content';
        }
    }

    // Check if this targetType matches any clue
    checkClue(targetType);
}

function checkClue(targetType) {
    // Find if this target represents a valid clue that hasn't been found yet
    const clue = currentScenario.clues.find(c => {
        if (foundClues.has(c.id)) return false; // Already found

        // Direct match
        if (c.target === targetType) return true;

        if (targetType === 'content') {
            // If the user clicked general content, but the clue points to a specific text inside content 
            // that we might have missed wrapping or is just hard to click, 
            // we might want to be lenient OR strict. 
            // Given we added precise spans, we should be stricter now.
            // BUT, if the user clicks unwrapped text in the body, it defaults to 'content'.
            // If the valid clue is 'urgency' but they clicked a non-urgency part of the body, it shouldn't trigger.
            // So we ONLY return true if the clue target IS 'content'.
            return c.target === 'content';
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
            // Game completion handled in closeFeedback
        }
    } else {
        // Wrong or already found
        // Optional: Feedback for wrong clicks
        // showFeedback(false, "這裡看起來很正常", "請再仔細看看其他地方。");
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

    feedbackModal.classList.add('show');

    // Update button text based on progress
    const feedbackBtn = document.getElementById('feedback-btn');
    if (foundClues.size >= TOTAL_CLUES) {
        feedbackBtn.innerText = "完成遊戲";
    } else {
        feedbackBtn.innerText = "繼續尋找";
    }
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

function showCertificatePreview() {
    const username = document.getElementById('username').value.trim() || "熱心玩家";

    // Fill certificate data
    document.getElementById('cert-name-text').innerText = username;
    document.getElementById('cert-score-text').innerText = score;
    document.getElementById('cert-date-text').innerText = new Date().toLocaleDateString('zh-TW');

    // Show container momentarily (offscreen via z-index, but onscreen coordinates)
    const certContainer = document.getElementById('certificate-container');
    certContainer.style.display = 'block';
    certContainer.style.left = '0px';
    certContainer.style.top = '0px';

    // Use a timeout to ensure DOM Layout is calculated
    setTimeout(() => {
        // html2canvas configuration
        html2canvas(document.getElementById('certificate'), {
            scale: 2,
            logging: true,
            useCORS: false, // Changed to false to avoid tainting issues with Data URIs
            allowTaint: true, // Allow taint to prevent error, we will handle DataURL failure
            backgroundColor: null,
            onclone: (clonedDoc) => {
                const clonedCert = clonedDoc.getElementById('certificate');
                if (clonedCert) clonedCert.style.backgroundImage = 'none';
            }
        }).then(canvas => {
            const previewContainer = document.getElementById('certificate-preview-modal').querySelector('div[style*="overflow: auto"]');
            const previewImg = document.getElementById('preview-img');
            const downloadBtn = document.querySelector('.btn-download-icon');

            // Reset state
            previewImg.style.display = 'inline-block';
            downloadBtn.style.display = 'inline-block'; // Show download button by default

            // Remove any existing canvas from previous fallback
            const existingCanvas = previewContainer.querySelector('canvas');
            if (existingCanvas) existingCanvas.remove();

            try {
                // Try to generate image
                const dataUrl = canvas.toDataURL("image/png");
                previewImg.src = dataUrl;
            } catch (e) {
                console.warn("Canvas toDataURL failed (likely tainted), falling back to raw canvas display:", e);

                // Fallback: Display Canvas directly
                previewImg.style.display = 'none'; // Hide image
                downloadBtn.style.display = 'none'; // Hide download button as it requires DataURL

                // Style the canvas for preview
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';
                canvas.style.border = '1px solid #ddd';

                // Insert canvas into preview container
                previewContainer.appendChild(canvas);

                // Optional: Notify user why download button is gone (or just rely on the existing instruction)
            }

            // Show preview modal
            document.getElementById('certificate-preview-modal').classList.add('show');

            // Hide source container again
            certContainer.style.display = 'none';

        }).catch(err => {
            console.error("Certificate generation failed:", err);
            alert("無法產生預覽圖片 (截圖錯誤): " + (err.message || err));
            certContainer.style.display = 'none';
        });
    }, 100);
}

function downloadCertificate() {
    const previewImg = document.getElementById('preview-img');
    const username = document.getElementById('username').value.trim() || "玩家";

    if (!previewImg.src || previewImg.src === window.location.href) {
        alert("找不到證書圖片，請重新產生。");
        return;
    }

    try {
        const link = document.createElement('a');
        link.download = `資安證書_${username}.png`;
        link.href = previewImg.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed:", e);
        alert("下載失敗，請嘗試長按圖片儲存。");
    }
}

function closePreview() {
    document.getElementById('certificate-preview-modal').classList.remove('show');
    // Optional: Reload logic moved here? Or keep user choice.
    // Keeping user choice allows them to preview/download again if needed.
    // If we want to reload after closing, uncomment below:
    // location.reload();
}





// Sidebar Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking a menu item (for better UX on mobile)
        const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('show');
                }
            });
        });
    }
});
