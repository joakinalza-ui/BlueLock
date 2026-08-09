function formatElapsed(ms) {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

function showToast(text) {
    const toast = document.getElementById("training-toast");
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2000);
}

function render() {
    const statusEl = document.getElementById("training-status");
    const sinceEl = document.getElementById("training-since");
    const accruedEl = document.getElementById("training-accrued");
    const capEl = document.getElementById("training-cap");
    const fillEl = document.getElementById("training-progress-fill");
    const hintEl = document.getElementById("training-hint");
    const startBtn = document.getElementById("training-start-btn");
    const collectBtn = document.getElementById("training-collect-btn");
    const balanceEl = document.getElementById("training-balance");

    const active = isTrainingActive();
    const capAmount = getTrainingCapAmount();
    capEl.textContent = capAmount.toLocaleString("es-ES");
    balanceEl.textContent = getEgoFuel().toLocaleString("es-ES");

    if (!active) {
        statusEl.textContent = "Inactiva";
        statusEl.classList.remove("is-active");
        sinceEl.hidden = true;
        startBtn.hidden = false;
        collectBtn.hidden = true;
        accruedEl.textContent = "0";
        fillEl.style.width = "0%";
        fillEl.classList.remove("is-full");
        hintEl.textContent = "Inicia la generación para empezar a acumular Combustible de Ego.";
        return;
    }

    statusEl.textContent = "Generando";
    statusEl.classList.add("is-active");
    sinceEl.hidden = false;
    sinceEl.textContent = `Activa desde hace ${formatElapsed(Date.now() - getTrainingStart())}`;
    startBtn.hidden = true;
    collectBtn.hidden = false;

    const accrued = getTrainingAccrued();
    accruedEl.textContent = accrued.toLocaleString("es-ES");
    const percent = Math.min(100, (accrued / capAmount) * 100);
    fillEl.style.width = `${percent}%`;
    fillEl.classList.toggle("is-full", accrued >= capAmount);
    collectBtn.disabled = accrued <= 0;
    hintEl.textContent = accrued >= capAmount
        ? "Has alcanzado el tope de acumulación. Recoge para seguir generando."
        : `Genera ${getTrainingRatePerHour()} de Combustible de Ego por hora.`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("training-start-btn").addEventListener("click", () => {
        startTraining();
        render();
    });

    document.getElementById("training-collect-btn").addEventListener("click", () => {
        const amount = collectTraining();
        render();
        if (amount > 0) showToast(`+${amount} Combustible de Ego`);
    });

    render();
    setInterval(render, 1000);
});
