const PLACEHOLDER_PORTRAIT = "assets/characters/portraits/placeholder.webp";

// Modo edición del Quinteto: mientras está activo, pendingQuinteto es
// una copia de trabajo (5 ids o null) que no se guarda en localStorage
// hasta "Confirmar cambios". "Cancelar" simplemente la descarta.
let editMode = false;
let pendingQuinteto = null;

function findCharacterById(id) {
    return CHARACTERS_DATA.find((c) => c.id === id) || null;
}

function getUnlockedCharacters() {
    return CHARACTERS_DATA.filter(isCharacterUnlocked);
}

function buildStars(rarity) {
    return "★".repeat(rarity);
}

function buildPlayerCardMarkup(character) {
    const level = getCharacterLevel(character.id);
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? getCharacterThumbSprite(character) : PLACEHOLDER_PORTRAIT;
    const upgradeBadge = hasCharacterUpgradeAvailable(character)
        ? '<span class="player-card-upgrade-badge" title="Puede subir de Nivel o Despertar"></span>'
        : "";
    return `
        <span class="player-card-thumb">
            <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
            ${buildAwakeningBadgeMarkup(character.id)}
            <span class="player-card-position" data-position="${character.position}">${character.position}</span>
        </span>
        ${upgradeBadge}
        <span class="player-card-stars">${buildStars(character.rarity)}</span>
        <span class="player-card-name">${character.name}</span>
        <span class="player-card-level">Nv. ${level}</span>
    `;
}

// Ya no hace falta alinear nada aquí: las tarjetas usan las fotos
// "-thumb" (ver getCharacterThumbSprite en main.js), pre-recortadas en
// el servidor con un encuadre consistente — la corrección en tiempo de
// ejecución (alignRealSpriteThumbs) solo sigue haciendo falta donde se
// muestra la foto SIN recortar (selector de personaje de la Home, en
// menu.js), no aquí.
function alignAllThumbs() {}

function renderQuintetoGrid() {
    const grid = document.getElementById("quinteto-grid");
    const baseLevelEl = document.getElementById("quinteto-base-level-value");
    if (!grid) return;

    const realQuinteto = getQuinteto();
    const displayQuinteto = editMode ? pendingQuinteto : realQuinteto;

    grid.innerHTML = "";
    displayQuinteto.forEach((characterId, slotIndex) => {
        const character = characterId ? findCharacterById(characterId) : null;
        const isPending = editMode && characterId !== realQuinteto[slotIndex];

        if (!character) {
            const slot = document.createElement("div");
            slot.className = "quinteto-slot" + (editMode ? " is-editable" : "");
            slot.innerHTML = '<span class="quinteto-slot-placeholder">Vacío</span>'
                + (editMode ? '<span class="edit-pencil">✎</span>' : "");
            if (editMode) {
                slot.addEventListener("click", () => openSlotPicker(slotIndex));
            }
            grid.appendChild(slot);
            return;
        }

        const card = document.createElement("div");
        card.className = "player-card" + (editMode ? " is-editable" : "") + (isPending ? " is-pending" : "");
        card.innerHTML = buildPlayerCardMarkup(character)
            + (editMode ? '<span class="edit-pencil">✎</span>' : "")
            + (isPending ? '<span class="pending-badge">Nuevo</span>' : "");
        attachLongPressPreview(card, character);
        card.addEventListener("click", () => {
            if (editMode) {
                openSlotPicker(slotIndex);
            } else {
                navigateToPlayerDetail(character.id, null, { editMode, pendingQuinteto });
            }
        });
        grid.appendChild(card);
    });

    baseLevelEl.textContent = getQuintetoBaseLevel();
}

function getFilteredSortedCollection() {
    const search = document.getElementById("collection-search").value.trim().toLowerCase();
    const positionFilter = document.getElementById("collection-position-filter").value;
    const teamFilter = document.getElementById("collection-team-filter").value;
    const sortBy = document.getElementById("collection-sort").value;

    let list = getUnlockedCharacters().filter((c) => {
        const matchesSearch = !search || c.name.toLowerCase().includes(search);
        const matchesPosition = positionFilter === "all" || c.position === positionFilter;
        // Los personajes sin equipoOriginal (null) solo aparecen en "Todos".
        const matchesTeam = teamFilter === "all" || c.equipoOriginal === teamFilter;
        return matchesSearch && matchesPosition && matchesTeam && !isInQuinteto(c.id);
    });

    // Quien tenga Despertar disponible AHORA MISMO (Esencias suficientes
    // para el siguiente nivel) sube al principio de la lista, por delante
    // de cualquier otro criterio de orden — se recalcula en cada render,
    // así que en cuanto se aplica el Despertar (y no llegan más Esencias
    // todavía para el siguiente) vuelve solo a su sitio normal.
    list = list.slice().sort((a, b) => {
        const awakenA = canCharacterAwaken(a) ? 1 : 0;
        const awakenB = canCharacterAwaken(b) ? 1 : 0;
        if (awakenA !== awakenB) return awakenB - awakenA;

        if (sortBy === "level") {
            return getCharacterLevel(b.id) - getCharacterLevel(a.id);
        }
        if (sortBy === "rarity") {
            return b.rarity - a.rarity;
        }
        return a.name.localeCompare(b.name);
    });

    return list;
}

function renderCollectionGrid() {
    const grid = document.getElementById("collection-grid");
    const counter = document.getElementById("collection-counter");
    if (!grid) return;

    counter.textContent = `${getUnlockedCharacters().length} / ${TOTAL_ROSTER_SIZE}`;

    const list = getFilteredSortedCollection();
    grid.innerHTML = "";

    if (!list.length) {
        grid.innerHTML = '<p class="collection-empty">Ningún jugador coincide con la búsqueda.</p>';
        return;
    }

    list.forEach((character) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "player-card";
        card.setAttribute("data-character-id", character.id);
        card.innerHTML = buildPlayerCardMarkup(character);
        attachLongPressPreview(card, character);
        const canAddToQuinteto = !editMode && !isInQuinteto(character.id);
        card.addEventListener("click", () => {
            navigateToPlayerDetail(character.id, canAddToQuinteto ? {
                actionLabel: "Añadir al Quinteto",
                actionType: "swapModal",
                characterId: character.id,
            } : null, { editMode, pendingQuinteto });
        });
        grid.appendChild(card);
    });
}

// Los 4 objetos siempre están "puestos", a nivel = nivel base del
// equipo — no hay estado "sin conseguir" que mostrar.
function renderEquipmentGrid() {
    const grid = document.getElementById("equipment-grid");
    if (!grid) return;

    const equipment = getEquipment();
    grid.innerHTML = "";
    EQUIPMENT_SLOTS.forEach((slot) => {
        const nivel = equipment[slot].nivel;
        const statLabel = EQUIPMENT_STAT_LABEL[EQUIPMENT_STAT_BY_SLOT[slot]];
        const card = document.createElement("div");
        card.className = "equipment-card has-level";
        card.innerHTML = `
            <span class="equipment-icon">${EQUIPMENT_ICON_BY_SLOT[slot]}</span>
            <span class="equipment-info">
                <span class="equipment-name">${EQUIPMENT_LABEL_BY_SLOT[slot]}</span>
                <span class="equipment-level">Nv. ${nivel} — +${nivel} ${statLabel}</span>
            </span>
        `;
        grid.appendChild(card);
    });
}

function renderAll() {
    renderQuintetoGrid();
    renderCollectionGrid();
    renderEquipmentGrid();
    alignAllThumbs();
}

function openSwapModal(incomingCharacterId) {
    const overlay = document.getElementById("swap-modal-overlay");
    const slotsContainer = document.getElementById("swap-modal-slots");
    if (!overlay || !slotsContainer) return;

    const quinteto = getQuinteto();
    slotsContainer.innerHTML = "";
    quinteto.forEach((characterId, slotIndex) => {
        const character = characterId ? findCharacterById(characterId) : null;
        const row = document.createElement("button");
        row.type = "button";
        row.className = "swap-modal-slot";
        if (!character) {
            row.classList.add("swap-modal-slot-empty");
            row.innerHTML = `<span>Slot ${slotIndex + 1} — Vacío</span>`;
        } else {
            row.innerHTML = `
                <span>${character.name}</span>
                <span class="swap-modal-slot-level">Nv. ${getCharacterLevel(character.id)}</span>
            `;
        }
        row.addEventListener("click", () => {
            setQuintetoSlot(slotIndex, incomingCharacterId);
            overlay.hidden = true;
            renderAll();
        });
        slotsContainer.appendChild(row);
    });

    overlay.hidden = false;
}

function initSwapModal() {
    const overlay = document.getElementById("swap-modal-overlay");
    const cancelBtn = document.getElementById("swap-modal-cancel");
    if (!overlay || !cancelBtn) return;
    cancelBtn.addEventListener("click", () => {
        overlay.hidden = true;
    });
}

// Selector inverso usado en modo edición: se elige un slot del Quinteto
// primero (al tocar su carta) y aquí se elige quién lo ocupa, entre los
// desbloqueados que no estén ya asignados a OTRO slot pendiente (para
// no duplicar a un mismo jugador en dos puestos). Paginado de 6 en 6
// (igual que el selector de Personaje de la Home) en vez de lista larga
// con scroll; la fila "Vacío" queda siempre visible, fuera de la
// paginación, por ser una acción especial y no un jugador más.
const SLOT_PICKER_PER_PAGE = 8;
let slotPickerActiveSlotIndex = null;
let slotPickerPage = 0;

function openSlotPicker(slotIndex) {
    const overlay = document.getElementById("slot-picker-overlay");
    if (!overlay) return;

    slotPickerActiveSlotIndex = slotIndex;
    slotPickerPage = 0;
    renderSlotPickerPage();
    overlay.hidden = false;
}

function renderSlotPickerPage() {
    const listContainer = document.getElementById("slot-picker-list");
    const overlay = document.getElementById("slot-picker-overlay");
    const prevBtn = document.getElementById("slot-picker-page-prev");
    const nextBtn = document.getElementById("slot-picker-page-next");
    const indicator = document.getElementById("slot-picker-page-indicator");
    if (!listContainer) return;

    const slotIndex = slotPickerActiveSlotIndex;
    const takenElsewhere = pendingQuinteto.filter((id, i) => id && i !== slotIndex);
    const options = getUnlockedCharacters().filter((c) => !takenElsewhere.includes(c.id));

    const totalPages = Math.max(1, Math.ceil(options.length / SLOT_PICKER_PER_PAGE));
    slotPickerPage = Math.min(Math.max(0, slotPickerPage), totalPages - 1);
    const start = slotPickerPage * SLOT_PICKER_PER_PAGE;
    const pageItems = options.slice(start, start + SLOT_PICKER_PER_PAGE);

    listContainer.innerHTML = "";

    const emptyRow = document.createElement("button");
    emptyRow.type = "button";
    emptyRow.className = "swap-modal-slot swap-modal-slot-empty";
    emptyRow.innerHTML = `
        <span class="swap-modal-slot-thumb">
            <img src="${resolveAssetPath(PLACEHOLDER_PORTRAIT)}" alt="" data-real-sprite="false">
        </span>
        <span class="swap-modal-slot-name">Vacío (sin jugador)</span>
    `;
    emptyRow.addEventListener("click", () => {
        pendingQuinteto[slotIndex] = null;
        overlay.hidden = true;
        renderQuintetoGrid();
    });
    listContainer.appendChild(emptyRow);

    pageItems.forEach((character) => {
        const hasRealSprite = !!character.sprite;
        const spritePath = hasRealSprite ? getCharacterThumbSprite(character) : PLACEHOLDER_PORTRAIT;
        const row = document.createElement("button");
        row.type = "button";
        row.className = "swap-modal-slot";
        row.innerHTML = `
            <span class="swap-modal-slot-thumb">
                <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
            </span>
            <span class="swap-modal-slot-name">${character.name}</span>
            <span class="swap-modal-slot-level">Nv. ${getCharacterLevel(character.id)}</span>
        `;
        row.addEventListener("click", () => {
            pendingQuinteto[slotIndex] = character.id;
            overlay.hidden = true;
            renderQuintetoGrid();
        });
        listContainer.appendChild(row);
    });

    if (indicator) indicator.textContent = `Página ${slotPickerPage + 1} de ${totalPages}`;
    if (prevBtn) prevBtn.disabled = slotPickerPage <= 0;
    if (nextBtn) nextBtn.disabled = slotPickerPage >= totalPages - 1;
}

function initSlotPicker() {
    const overlay = document.getElementById("slot-picker-overlay");
    const cancelBtn = document.getElementById("slot-picker-cancel");
    const prevBtn = document.getElementById("slot-picker-page-prev");
    const nextBtn = document.getElementById("slot-picker-page-next");
    if (!overlay || !cancelBtn) return;
    cancelBtn.addEventListener("click", () => {
        overlay.hidden = true;
    });
    if (prevBtn) prevBtn.addEventListener("click", () => {
        slotPickerPage--;
        renderSlotPickerPage();
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
        slotPickerPage++;
        renderSlotPickerPage();
    });
}

function updateEditModeUI() {
    const editBtn = document.getElementById("quinteto-edit-btn");
    const actions = document.getElementById("quinteto-edit-actions");
    if (editBtn) editBtn.hidden = editMode;
    if (actions) actions.hidden = !editMode;
}

function enterEditMode() {
    editMode = true;
    pendingQuinteto = getQuinteto();
    renderAll();
    updateEditModeUI();
}

function exitEditMode(commit) {
    if (commit) {
        const current = getQuinteto();
        pendingQuinteto.forEach((characterId, slotIndex) => {
            if (current[slotIndex] !== characterId) {
                setQuintetoSlot(slotIndex, characterId);
            }
        });
    }
    editMode = false;
    pendingQuinteto = null;
    renderAll();
    updateEditModeUI();
}

function initQuintetoEdit() {
    const editBtn = document.getElementById("quinteto-edit-btn");
    const cancelBtn = document.getElementById("quinteto-cancel-btn");
    const confirmBtn = document.getElementById("quinteto-confirm-btn");
    if (!editBtn || !cancelBtn || !confirmBtn) return;

    editBtn.addEventListener("click", () => enterEditMode());
    cancelBtn.addEventListener("click", () => exitEditMode(false));
    confirmBtn.addEventListener("click", () => exitEditMode(true));
}

// El orden de la Colección (Nombre/Nivel/Rareza) se recuerda entre
// sesiones -- el resto de filtros (búsqueda, puesto, equipo) sí se
// reinician al volver a entrar, solo el orden persiste porque es el
// que se deja fijo una vez elegido.
const COLLECTION_SORT_KEY = "bl_collection_sort";

function getSavedCollectionSort() {
    return localStorage.getItem(COLLECTION_SORT_KEY) || "name";
}

function setSavedCollectionSort(value) {
    localStorage.setItem(COLLECTION_SORT_KEY, value);
}

function initFilters() {
    const sortEl = document.getElementById("collection-sort");
    if (sortEl) sortEl.value = getSavedCollectionSort();

    ["collection-search", "collection-position-filter", "collection-team-filter", "collection-sort"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", renderCollectionGrid);
        el.addEventListener("change", () => {
            if (id === "collection-sort") setSavedCollectionSort(el.value);
            renderCollectionGrid();
            alignAllThumbs();
        });
    });
}

// Al volver de la Ficha de Jugador (pages/player/): recupera el modo
// edición del Quinteto tal como estaba (si estaba activo) y dispara el
// selector correspondiente si se pulsó el botón contextual de la
// ficha. En pageshow (no solo DOMContentLoaded) para que funcione
// también si el navegador restaura la página desde su caché de
// "atrás" sin re-ejecutar los scripts.
function restorePlayerDetailReturnContext() {
    const context = consumePlayerDetailReturnContext();
    if (!context) return;

    if (context.editMode) {
        editMode = true;
        pendingQuinteto = context.pendingQuinteto;
    }
    renderAll();
    updateEditModeUI();

    if (context.triggerAction && context.actionMeta) {
        if (context.actionMeta.actionType === "swapModal") {
            openSwapModal(context.actionMeta.characterId);
        } else if (context.actionMeta.actionType === "slotPicker") {
            openSlotPicker(context.actionMeta.slotIndex);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSwapModal();
    initSlotPicker();
    initQuintetoEdit();
    initFilters();
    renderAll();
});

window.addEventListener("pageshow", restorePlayerDetailReturnContext);
