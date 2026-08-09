function initSettingsNameEditor() {
    const display = document.getElementById("settings-name-display");
    const input = document.getElementById("settings-name-input");
    const box = display ? display.closest(".name-field") : null;
    if (!display || !input || !box) return;

    createPlayerNameEditor({
        display,
        input,
        getBoxSize: () => {
            const rect = box.getBoundingClientRect();
            return { width: rect.width * 0.9, height: rect.height * 0.7 };
        },
    });
}

// Un personaje del selector de Home solo se puede elegir si ya está
// desbloqueado en la Colección (characters-data.js). Se cruzan los dos
// roster distintos por la ruta del sprite, que es el único dato que
// comparten literalmente entre ambos.
function isHomeCharacterUnlocked(character) {
    const match = CHARACTERS_DATA.find((c) => c.sprite === character.sprite);
    return !!match && isCharacterUnlocked(match);
}

const HOME_CHARACTERS_PER_PAGE = 6;
let homeSelectorPage = 0;

function getUnlockedHomeRoster() {
    return CHARACTER_ROSTER.filter(isHomeCharacterUnlocked);
}

function renderCharacterPage() {
    const grid = document.getElementById("character-grid");
    if (!grid) return;

    const selectedId = getHomeCharacterId();
    const unlockedRoster = getUnlockedHomeRoster();
    const totalPages = Math.max(1, Math.ceil(unlockedRoster.length / HOME_CHARACTERS_PER_PAGE));
    homeSelectorPage = Math.min(Math.max(0, homeSelectorPage), totalPages - 1);

    const start = homeSelectorPage * HOME_CHARACTERS_PER_PAGE;
    const pageItems = unlockedRoster.slice(start, start + HOME_CHARACTERS_PER_PAGE);

    grid.innerHTML = "";
    pageItems.forEach((character) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "character-card";
        if (character.id === selectedId) {
            card.classList.add("is-selected");
        }
        card.setAttribute("data-character-id", character.id);
        card.innerHTML = `
            <span class="character-card-thumb">
                <img src="${resolveAssetPath(character.sprite)}" alt="${character.name}">
            </span>
            <span class="character-card-name">${character.name}</span>
        `;
        card.addEventListener("click", () => {
            setHomeCharacterId(character.id);
            grid.querySelectorAll(".character-card").forEach((el) => {
                el.classList.toggle("is-selected", el === card);
            });
        });
        grid.appendChild(card);
    });

    // Mismo sistema de alineación por contenido que Colección/F5/F11/
    // Fichajes/Gacha: mide cada sprite vía canvas contra una referencia
    // estable (Isagi, CHARACTER_ROSTER[0]) — así el encuadre no cambia
    // según qué otros personajes compartan página.
    alignRealSpriteThumbs("#character-grid img");

    document.getElementById("character-page-indicator").textContent = `Página ${homeSelectorPage + 1} de ${totalPages}`;
    document.getElementById("character-page-prev").disabled = homeSelectorPage <= 0;
    document.getElementById("character-page-next").disabled = homeSelectorPage >= totalPages - 1;
}

function initCharacterGrid() {
    const grid = document.getElementById("character-grid");
    const prevBtn = document.getElementById("character-page-prev");
    const nextBtn = document.getElementById("character-page-next");
    if (!grid || !prevBtn || !nextBtn) return;

    // Abre directamente en la página donde está el personaje
    // seleccionado actualmente, no siempre en la página 1.
    const selectedId = getHomeCharacterId();
    const unlockedRoster = getUnlockedHomeRoster();
    const selectedIndex = unlockedRoster.findIndex((c) => c.id === selectedId);
    homeSelectorPage = selectedIndex >= 0 ? Math.floor(selectedIndex / HOME_CHARACTERS_PER_PAGE) : 0;

    prevBtn.addEventListener("click", () => {
        homeSelectorPage--;
        renderCharacterPage();
    });
    nextBtn.addEventListener("click", () => {
        homeSelectorPage++;
        renderCharacterPage();
    });

    renderCharacterPage();
}

// DEBUG: añade 10.000 diamantes y 10.000 Combustible de Ego al saldo
// actual, para pruebas rápidas.
const DEBUG_CURRENCY_GRANT_AMOUNT = 10000;

function initDebugGrantCurrency() {
    const btn = document.getElementById("debug-grant-currency-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        setDiamonds(getDiamonds() + DEBUG_CURRENCY_GRANT_AMOUNT);
        setEgoFuel(getEgoFuel() + DEBUG_CURRENCY_GRANT_AMOUNT);
        alert(`+${DEBUG_CURRENCY_GRANT_AMOUNT.toLocaleString("es-ES")} Diamantes y +${DEBUG_CURRENCY_GRANT_AMOUNT.toLocaleString("es-ES")} Combustible de Ego añadidos.`);
    });
}

function initResetProgress() {
    const resetBtn = document.getElementById("reset-progress-btn");
    const overlay = document.getElementById("reset-confirm-overlay");
    const cancelBtn = document.getElementById("reset-cancel-btn");
    const confirmBtn = document.getElementById("reset-confirm-btn");
    if (!resetBtn || !overlay || !cancelBtn || !confirmBtn) return;

    resetBtn.addEventListener("click", () => {
        overlay.hidden = false;
    });

    cancelBtn.addEventListener("click", () => {
        overlay.hidden = true;
    });

    confirmBtn.addEventListener("click", () => {
        resetProgress();
        window.location.href = "../../index.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initSettingsNameEditor();
    initCharacterGrid();
    initDebugGrantCurrency();
    initResetProgress();
});
