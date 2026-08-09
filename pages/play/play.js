function updateCurrencyCounters() {
    document.getElementById("diamond-count").textContent = getDiamonds().toLocaleString("es-ES");
    document.getElementById("points-count").textContent = getRecruitPoints().toLocaleString("es-ES");
}

function updateFichajesProgress() {
    const valueEl = document.getElementById("fichajes-progress-value");
    if (!valueEl) return;
    valueEl.textContent = `${getTransferOverallProgressPercent()}%`;
}

function updateDesafiosProgress() {
    const valueEl = document.getElementById("desafios-progress-value");
    if (!valueEl) return;
    const progress = getChallengeOverallProgress();
    valueEl.textContent = `${progress.wins}/${progress.total}`;
}

function updateHistoriaProgress() {
    const valueEl = document.getElementById("historia-progress-value");
    if (!valueEl) return;
    const progress = getStoryOverallProgress();
    valueEl.textContent = `${progress.done}/${progress.total}`;
}

function showSoonToast() {
    const toast = document.getElementById("soon-toast");
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2000);
}

// Eventos: visible pero sin funcionalidad todavía en este Vertical
// Slice — Mapa de Fichajes, Desafíos e Historia (todos <a> normales) ya
// navegan de verdad.
function initSoonCards() {
    ["mode-eventos"].forEach((id) => {
        const card = document.getElementById(id);
        if (card) card.addEventListener("click", showSoonToast);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCurrencyCounters();
    initSoonCards();
    updateFichajesProgress();
    updateDesafiosProgress();
    updateHistoriaProgress();
});
