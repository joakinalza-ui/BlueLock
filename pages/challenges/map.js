const mapParams = new URLSearchParams(window.location.search);
const MAP_KEY = mapParams.get("map");

function buildMatchMarkup(matchNumber, rivalTeam) {
    const level = getChallengeRivalLevel(matchNumber);
    const wins = getChallengeProgress(MAP_KEY);
    const unlocked = isChallengeMatchUnlocked(MAP_KEY, matchNumber);
    const completed = wins >= matchNumber;

    let statusClass = "is-locked";
    let statusLabel = "Bloqueado";
    if (completed) {
        statusClass = "is-completed";
        statusLabel = "Ganado";
    } else if (unlocked) {
        statusClass = "is-unlocked";
        statusLabel = `Nivel rival ${level}`;
    }

    const rivalLabel = rivalTeam ? `vs Equipo ${rivalTeam}` : "Rival genérico";

    return `
        <div class="challenge-match ${statusClass}" data-match-number="${matchNumber}">
            <span class="challenge-match-number">${matchNumber}</span>
            <span class="challenge-match-info">
                <span class="challenge-match-rival">${rivalLabel}</span>
                <span class="challenge-match-status">${statusLabel}</span>
            </span>
            ${!unlocked ? '<span class="challenge-match-lock">🔒</span>' : ""}
            ${completed ? '<span class="challenge-match-check">✓</span>' : ""}
        </div>
    `;
}

// Mapas de equipo: bloques de 5 (CHALLENGE_MATCHES_PER_MAP /
// CHALLENGE_MATCHES_PER_BLOCK, 10 con los 50 partidos actuales), cada
// uno contra uno de los otros 4 equipos — con más bloques que equipos
// rivales, la identidad rota y se repite (getChallengeMatchRivalTeam
// se encarga del módulo, misma fuente que usa el partido de verdad).
// Mapas de rareza: el rival es genérico y no rota, pero se agrupan
// igual en bloques de 5 (para que el nivel/Despertar suba en los
// mismos puntos), todos "vs Rival genérico". Los partidos
// desbloqueados siempre son clicables — editar y completar la
// alineación se hace en la pantalla previa a cada partido
// (match/index.html), no aquí, así que ya no hace falta bloquear la
// lista mientras la alineación esté incompleta.
function renderMatches() {
    const container = document.getElementById("challenge-matches");
    const isTeamMap = isChallengeTeamMap(MAP_KEY);
    const totalBlocks = Math.ceil(CHALLENGE_MATCHES_PER_MAP / CHALLENGE_MATCHES_PER_BLOCK);
    const blocks = [];

    for (let block = 0; block < totalBlocks; block++) {
        const firstMatchOfBlock = block * CHALLENGE_MATCHES_PER_BLOCK + 1;
        const rivalTeam = isTeamMap ? getChallengeMatchRivalTeam(MAP_KEY, firstMatchOfBlock) : null;
        const matchNumbers = [];
        for (let i = 1; i <= CHALLENGE_MATCHES_PER_BLOCK; i++) matchNumbers.push(block * CHALLENGE_MATCHES_PER_BLOCK + i);
        const blockLabel = isTeamMap ? `Bloque ${block + 1} — vs Equipo ${rivalTeam}` : `Bloque ${block + 1}`;
        blocks.push(`
            <p class="challenge-block-label">${blockLabel}</p>
            <div class="challenge-block-matches">${matchNumbers.map((n) => buildMatchMarkup(n, rivalTeam)).join("")}</div>
        `);
    }
    container.innerHTML = blocks.join("");

    container.querySelectorAll(".challenge-match.is-unlocked").forEach((el) => {
        el.addEventListener("click", () => {
            const matchNumber = el.dataset.matchNumber;
            window.location.href = resolveAssetPath(`pages/match/index.html?challengeMap=${MAP_KEY}&matchNumber=${matchNumber}`);
        });
    });
}

// Aviso informativo si faltan personajes desbloqueados que cumplan la
// restricción de este mapa (equipo o rareza) — ya no bloquea nada
// (eso ya se ve, partido a partido, en la pantalla previa), solo
// avisa de por qué la alineación puede no llegar a completarse.
function renderWarning() {
    const warning = document.getElementById("challenge-warning");
    const config = getChallengeMapConfig(MAP_KEY);
    const eligible = getChallengeEligibleCharacters(MAP_KEY).length;
    const restrictionLabel = config.kind === "team" ? `del ${config.label}` : `de ${config.label} (rareza ★${config.rarity})`;

    if (eligible < CHALLENGE_LINEUP_SIZE) {
        warning.hidden = false;
        warning.textContent = `Necesitas ${CHALLENGE_LINEUP_SIZE} personajes desbloqueados ${restrictionLabel} para completar tu alineación (tienes ${eligible} / ${CHALLENGE_LINEUP_SIZE}).`;
    } else {
        warning.hidden = true;
    }
}

function initMap() {
    const config = getChallengeMapConfig(MAP_KEY);
    if (!config) {
        window.location.href = resolveAssetPath("pages/challenges/index.html");
        return;
    }
    document.getElementById("map-title").textContent = config.kind === "team" ? `Desafío ${config.label}` : config.label;
    renderWarning();
    renderMatches();
}

document.addEventListener("DOMContentLoaded", initMap);
window.addEventListener("pageshow", () => {
    if (!getChallengeMapConfig(MAP_KEY)) return;
    renderWarning();
    renderMatches();
});
