function buildMapCardMarkup(mapConfig) {
    const wins = getChallengeProgress(mapConfig.key);
    const eligible = getChallengeEligibleCharacters(mapConfig.key).length;
    const completed = wins >= CHALLENGE_MATCHES_PER_MAP;

    return `
        <a class="challenge-map-card${completed ? " is-completed" : ""}" href="map.html?map=${mapConfig.key}">
            <span class="challenge-map-name">${mapConfig.label}</span>
            <span class="challenge-map-progress">${wins} / ${CHALLENGE_MATCHES_PER_MAP} partidos</span>
            <span class="challenge-map-roster">${eligible} / ${CHALLENGE_LINEUP_SIZE} desbloqueados</span>
            ${completed ? '<span class="challenge-map-check">✓ Completado</span>' : ""}
        </a>
    `;
}

function buildSectionMarkup(title, maps) {
    return `
        <p class="challenge-section-title">${title}</p>
        <div class="challenge-maps">${maps.map(buildMapCardMarkup).join("")}</div>
    `;
}

function renderMaps() {
    const container = document.getElementById("challenge-maps-container");
    const teamMaps = CHALLENGE_MAPS.filter((m) => m.kind === "team");
    const rarityMaps = CHALLENGE_MAPS.filter((m) => m.kind === "rarity");
    container.innerHTML = buildSectionMarkup("Por Equipo", teamMaps) + buildSectionMarkup("Por Rareza", rarityMaps);
}

document.addEventListener("DOMContentLoaded", renderMaps);
window.addEventListener("pageshow", renderMaps);
