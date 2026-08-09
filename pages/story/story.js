function buildChapterCardMarkup(chapter) {
    const unlocked = isStoryChapterUnlocked(chapter.key);
    const completed = isStoryChapterFullyCompleted(chapter.key);

    let progressLabel;
    if (chapter.kind === "narrative") {
        progressLabel = completed ? "Leído" : "Sin leer";
    } else {
        progressLabel = `${getStoryProgress(chapter.key)} / ${chapter.totalMatches} partidos`;
    }

    const classes = "story-chapter-card" + (completed ? " is-completed" : "") + (unlocked ? "" : " is-locked");
    const badge = !unlocked
        ? '<span class="story-chapter-lock">🔒</span>'
        : completed
            ? '<span class="story-chapter-check">✓</span>'
            : "";

    const inner = `
        <span class="story-chapter-name">${chapter.title}</span>
        <span class="story-chapter-progress">${progressLabel}</span>
        ${badge}
    `;

    if (!unlocked) {
        return `<div class="${classes}">${inner}</div>`;
    }
    return `<a class="${classes}" href="chapter.html?chapter=${chapter.key}">${inner}</a>`;
}

function renderChapters() {
    const container = document.getElementById("story-chapters-container");
    container.innerHTML = `<div class="story-chapters">${STORY_CHAPTERS.map(buildChapterCardMarkup).join("")}</div>`;
}

document.addEventListener("DOMContentLoaded", renderChapters);
window.addEventListener("pageshow", renderChapters);
