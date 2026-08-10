const PLACEHOLDER_PORTRAIT = "assets/characters/portraits/placeholder.webp";

function buildNodeMarkup(characterId, index) {
    const character = CHARACTERS_DATA.find((c) => c.id === characterId);
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? getCharacterThumbSprite(character) : PLACEHOLDER_PORTRAIT;
    const wins = getTransferProgress(characterId);
    const unlocked = isTransferNodeUnlocked(index);
    const completed = isTransferNodeCompleted(characterId);

    let statusClass = "is-locked";
    let statusLabel = "Bloqueado";
    if (completed) {
        statusClass = "is-completed";
        statusLabel = "Completado";
    } else if (unlocked) {
        statusClass = "is-unlocked";
        statusLabel = `${wins} / ${TRANSFER_NODE_MATCHES}`;
    }

    return `
        <div class="transfer-node ${statusClass}" data-character-id="${characterId}" data-index="${index}">
            <span class="transfer-node-portrait">
                <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
                ${!unlocked ? '<span class="transfer-node-lock">🔒</span>' : ""}
                ${completed ? '<span class="transfer-node-check">✓</span>' : ""}
            </span>
            <span class="transfer-node-info">
                <span class="transfer-node-position" data-position="${character.position}">${character.position}</span>
                <span class="transfer-node-name">${character.name}</span>
                <span class="transfer-node-stars">${"★".repeat(character.rarity)}</span>
                <span class="transfer-node-progress">${statusLabel}</span>
            </span>
        </div>
    `;
}

function renderMap() {
    const container = document.getElementById("transfer-nodes");
    container.innerHTML = TRANSFER_NODES
        .map((id, i) => buildNodeMarkup(id, i))
        .join('<div class="transfer-connector"></div>');

    container.querySelectorAll(".transfer-node.is-unlocked").forEach((node) => {
        node.addEventListener("click", () => {
            const characterId = node.dataset.characterId;
            const matchNumber = getTransferProgress(characterId) + 1;
            window.location.href = resolveAssetPath(
                `pages/match/index.html?characterId=${encodeURIComponent(characterId)}&matchNumber=${matchNumber}`
            );
        });
    });
}

document.addEventListener("DOMContentLoaded", renderMap);
window.addEventListener("pageshow", renderMap);
