const chapterParams = new URLSearchParams(window.location.search);
const CHAPTER_KEY = chapterParams.get("chapter");

function renderNarrativeChapter() {
    document.getElementById("chapter-narrative-panel").hidden = false;
    document.getElementById("chapter-narrative-text").textContent = STORY_INTRO_SUMMARY;
    document.getElementById("chapter-continue-btn").addEventListener("click", () => {
        markStoryNarrativeRead(CHAPTER_KEY);
        window.location.href = "index.html";
    });
}

function buildMatchMarkup(config, matchNumber) {
    const wins = getStoryProgress(CHAPTER_KEY);
    const unlocked = isStoryMatchUnlocked(CHAPTER_KEY, matchNumber);
    const completed = wins >= matchNumber;
    const mode = getStoryMatchMode(CHAPTER_KEY, matchNumber);
    const level = getStoryRivalLevel(CHAPTER_KEY, matchNumber);

    let statusClass = "is-locked";
    let statusLabel = "Bloqueado";
    if (completed) {
        statusClass = "is-completed";
        statusLabel = "Ganado";
    } else if (unlocked) {
        statusClass = "is-unlocked";
        statusLabel = `Nivel rival ${level}`;
    }

    return `
        <div class="story-match ${statusClass}" data-match-number="${matchNumber}">
            <div class="story-match-top">
                <span class="story-match-number">${matchNumber}</span>
                <span class="story-match-info">
                    <span class="story-match-mode">Partido ${matchNumber} — ${mode}</span>
                    <span class="story-match-status">${statusLabel}</span>
                </span>
                ${!unlocked ? '<span class="story-match-lock">🔒</span>' : ""}
                ${completed ? '<span class="story-match-check">✓</span>' : ""}
            </div>
            <p class="story-match-narrative">${getStoryMatchNarrative(CHAPTER_KEY, matchNumber)}</p>
        </div>
    `;
}

function renderMatchesChapter(config) {
    document.getElementById("chapter-matches-panel").hidden = false;
    const container = document.getElementById("story-matches");
    const matchNumbers = [];
    for (let i = 1; i <= config.totalMatches; i++) matchNumbers.push(i);
    container.innerHTML = matchNumbers.map((n) => buildMatchMarkup(config, n)).join("");

    container.querySelectorAll(".story-match.is-unlocked").forEach((el) => {
        el.addEventListener("click", () => {
            const matchNumber = el.dataset.matchNumber;
            window.location.href = resolveAssetPath(`pages/match/index.html?storyChapter=${CHAPTER_KEY}&matchNumber=${matchNumber}`);
        });
    });
}

function initChapter() {
    const config = getStoryChapterConfig(CHAPTER_KEY);
    if (!config || !isStoryChapterUnlocked(CHAPTER_KEY)) {
        window.location.href = "index.html";
        return;
    }
    document.getElementById("chapter-title").textContent = config.title;

    if (config.kind === "narrative") {
        renderNarrativeChapter();
    } else {
        renderMatchesChapter(config);
    }
}

document.addEventListener("DOMContentLoaded", initChapter);
window.addEventListener("pageshow", () => {
    const config = getStoryChapterConfig(CHAPTER_KEY);
    if (!config || config.kind !== "matches") return;
    renderMatchesChapter(config);
});
