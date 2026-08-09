const PLACEHOLDER_PORTRAIT = "assets/characters/portraits/placeholder.png";

// FORMATIONS_11V11 y FORMATION_11V11_DEFAULT ya están declaradas en
// main.js — compartidas con la pantalla previa al partido en 11v11
// (pages/match/match.js) para que las dos ofrezcan siempre exactamente
// las mismas formaciones.

function buildStars(rarity) {
    return "★".repeat(rarity);
}

// slotPosition sobreescribe el badge cuando la tarjeta ocupa un puesto
// del campo que no coincide con la posición real del personaje (pasa
// cuando la formación necesita más gente de un puesto del que hay en
// el Once y algún hueco se rellena de respaldo con otra posición, ver
// renderFormation) — sin ella se muestra siempre la posición real, que
// es lo correcto en el selector de sustitución.
function buildPlayerCardMarkup(character, slotPosition) {
    const level = getCharacterLevel(character.id);
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? character.sprite : PLACEHOLDER_PORTRAIT;
    const position = slotPosition || character.position;
    return `
        <span class="player-card-thumb">
            <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
            ${buildAwakeningBadgeMarkup(character.id)}
        </span>
        <span class="player-card-position" data-position="${position}">${position}</span>
        <span class="player-card-stars">${buildStars(character.rarity)}</span>
        <span class="player-card-name">${character.name}</span>
        <span class="player-card-level">Nv. ${level}</span>
    `;
}

function getCurrentFormationKey() {
    const select = document.getElementById("formation-select");
    return (select && FORMATIONS_11V11[select.value]) ? select.value : FORMATION_11V11_DEFAULT;
}

// Qué formación táctica (4-3-3, 4-4-2...) estaba elegida en F11, aparte
// de quién ocupa cada puesto (eso ya se guarda solo, compartido entre
// todas las formaciones, en el Once Principal — bl_once_principal). Se
// guarda al vuelo en cuanto se cambia, sin botón, igual que el resto
// del progreso — getFormation11v11Key/setFormation11v11Key ya están
// declaradas en main.js, compartidas con la pantalla previa al partido
// en 11v11, que usa esta misma preferencia.
function initFormationSelect() {
    const select = document.getElementById("formation-select");
    if (!select) return;
    select.innerHTML = "";
    Object.keys(FORMATIONS_11V11).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = FORMATIONS_11V11[key].label;
        select.appendChild(option);
    });
    select.value = getFormation11v11Key();
    select.addEventListener("change", () => {
        setFormation11v11Key(select.value);
        renderFormation();
    });
}

// Qué índice del Once (0-10) ocupa cada puesto visual de cada fila,
// una vez calculado (buildFormationLayout) — se reutiliza en cada
// renderFormation() mientras la formación elegida no cambie, así
// tocar/vaciar un puesto concreto solo afecta a ESE puesto y no
// desplaza a nadie más de su fila (antes, al no recordar nada entre
// renders, quitar a alguien hacía que el siguiente de su posición
// "subiera" un puesto y el hueco vacío apareciera al final de la fila
// en vez de donde estaba el que se quitó). Solo se recalcula cuando
// cambia la formación (initFormationSelect) o se abandona la página,
// que es cuando SÍ queremos redistribuir a los 11 en las nuevas filas.
let formationLayout = null;
let formationLayoutKey = null;

function buildFormationLayout(once, formation) {
    const consumed = new Array(once.length).fill(false);

    function findMatchingIndex(position) {
        for (let i = 0; i < once.length; i++) {
            if (consumed[i] || !once[i]) continue;
            const character = CHARACTERS_DATA.find((c) => c.id === once[i]);
            if (character && character.position === position) return i;
        }
        return -1;
    }

    function findFallbackIndex() {
        for (let i = 0; i < once.length; i++) {
            if (!consumed[i] && !once[i]) return i;
        }
        for (let i = 0; i < once.length; i++) {
            if (!consumed[i]) return i;
        }
        return -1;
    }

    const layout = {};
    ["DEL", "MED", "DEF", "POR"].forEach((position) => {
        const count = position === "POR" ? 1 : formation[position];
        const indexes = [];
        for (let i = 0; i < count; i++) {
            let index = findMatchingIndex(position);
            if (index === -1) index = findFallbackIndex();
            if (index === -1) continue;
            consumed[index] = true;
            indexes.push(index);
        }
        layout[position] = indexes;
    });
    return layout;
}

// Coloca a los 11 titulares del Once Principal en la fila que
// corresponde a su propia posición — mismo patrón que F5
// (formation.js): cada puesto visual (lleno o vacío) queda vinculado a
// un índice concreto del Once (0-10) para poder tocarlo y cambiarlo.
// El cálculo de qué índice va en cada puesto (buildFormationLayout) se
// hace una sola vez por formación y se reutiliza (ver formationLayout
// arriba); aquí solo se recorre ese resultado y se pinta.
function renderFormation() {
    const formationKey = getCurrentFormationKey();
    const formation = FORMATIONS_11V11[formationKey];
    const once = getOnce();

    if (!formationLayout || formationLayoutKey !== formationKey) {
        formationLayout = buildFormationLayout(once, formation);
        formationLayoutKey = formationKey;
    }

    ["DEL", "MED", "DEF", "POR"].forEach((position) => {
        const row = document.getElementById(`row-${position}`);
        row.innerHTML = "";
        const indexes = formationLayout[position];
        row.classList.toggle("is-compact", indexes.length > 4);
        indexes.forEach((index) => {
            const characterId = once[index];
            const character = characterId ? CHARACTERS_DATA.find((c) => c.id === characterId) : null;

            if (!character) {
                const empty = document.createElement("button");
                empty.type = "button";
                empty.className = "pitch-slot-empty";
                empty.innerHTML = `<span class="pitch-slot-empty-label">+</span>`;
                empty.addEventListener("click", () => openSlotPicker(index, position));
                row.appendChild(empty);
                return;
            }

            const card = document.createElement("button");
            card.type = "button";
            card.className = "player-card";
            card.innerHTML = buildPlayerCardMarkup(character, position);
            card.addEventListener("click", () => {
                navigateToPlayerDetail(character.id, {
                    actionLabel: "Cambiar jugador",
                    actionType: "slotPicker",
                    slotIndex: index,
                    position,
                });
            });
            row.appendChild(card);
        });
    });

    const filled = once.filter((id) => id).map((id) => CHARACTERS_DATA.find((c) => c.id === id)).filter(Boolean);
    const powerEl = document.getElementById("power-value");
    powerEl.textContent = filled.length ? filled.reduce((sum, c) => sum + getCharacterPower(c), 0) : "—";

    alignRealSpriteThumbs('.player-card-thumb img[data-real-sprite="true"]');
}

// Resultados paginados de 6 en 6 (igual que el selector de Personaje de
// la Home) en vez de lista larga con scroll — el filtro por posición se
// mantiene igual, solo cambia cómo se muestran los resultados que pasan
// ese filtro.
const SLOT_PICKER_PER_PAGE = 8;
let slotPickerActiveSlotIndex = null;
let slotPickerPage = 0;

function openSlotPicker(slotIndex, defaultPosition) {
    const overlay = document.getElementById("slot-picker-overlay");
    const filterSelect = document.getElementById("slot-picker-position-filter");
    if (!overlay || !filterSelect) return;

    slotPickerActiveSlotIndex = slotIndex;
    slotPickerPage = 0;
    filterSelect.value = defaultPosition;
    filterSelect.onchange = () => {
        slotPickerPage = 0;
        renderSlotPickerList(slotIndex);
    };

    renderSlotPickerList(slotIndex);
    overlay.hidden = false;
}

function renderSlotPickerList(slotIndex) {
    const listContainer = document.getElementById("slot-picker-list");
    const filterSelect = document.getElementById("slot-picker-position-filter");
    const overlay = document.getElementById("slot-picker-overlay");
    const prevBtn = document.getElementById("slot-picker-page-prev");
    const nextBtn = document.getElementById("slot-picker-page-next");
    const indicator = document.getElementById("slot-picker-page-indicator");
    if (!listContainer) return;

    const once = getOnce();
    const takenElsewhere = once.filter((id, i) => id && i !== slotIndex);
    const positionFilter = filterSelect.value;

    const options = CHARACTERS_DATA.filter(isCharacterUnlocked)
        .filter((c) => !takenElsewhere.includes(c.id))
        .filter((c) => positionFilter === "all" || c.position === positionFilter);

    const totalPages = Math.max(1, Math.ceil(options.length / SLOT_PICKER_PER_PAGE));
    slotPickerPage = Math.min(Math.max(0, slotPickerPage), totalPages - 1);
    const start = slotPickerPage * SLOT_PICKER_PER_PAGE;
    const pageItems = options.slice(start, start + SLOT_PICKER_PER_PAGE);

    listContainer.innerHTML = "";

    const emptyCard = document.createElement("button");
    emptyCard.type = "button";
    emptyCard.className = "picker-slot-empty";
    emptyCard.innerHTML = `<span class="picker-slot-empty-label">Vacío (sin jugador)</span>`;
    emptyCard.addEventListener("click", () => {
        setOnceSlot(slotIndex, null);
        overlay.hidden = true;
        renderFormation();
    });
    listContainer.appendChild(emptyCard);

    if (!options.length) {
        const empty = document.createElement("p");
        empty.className = "picker-empty-message";
        empty.textContent = "Ningún jugador desbloqueado coincide con este filtro.";
        listContainer.appendChild(empty);
    }

    pageItems.forEach((character) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "player-card";
        card.innerHTML = buildPlayerCardMarkup(character);
        card.addEventListener("click", () => {
            setOnceSlot(slotIndex, character.id);
            overlay.hidden = true;
            renderFormation();
        });
        listContainer.appendChild(card);
    });

    // Mismo sistema de alineación por contenido que el resto de la app
    // (Home/Colección/F5/F11/Fichajes/Gacha) — solo se alinean los
    // sprites reales, el placeholder "Vacío" ya es consistente de por sí.
    alignRealSpriteThumbs('.player-card-thumb img[data-real-sprite="true"]');

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
        renderSlotPickerList(slotPickerActiveSlotIndex);
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
        slotPickerPage++;
        renderSlotPickerList(slotPickerActiveSlotIndex);
    });
}

// Calcula el tamaño de carta más grande que cabe SIN que la pantalla
// tenga que deslizarse, midiendo el espacio real disponible (alto y
// ancho) en el dispositivo concreto, en vez de asumir un tamaño fijo
// que solo encaja en algunas pantallas. Siempre hay 4 filas (DEL/MED/
// DEF/POR); las de hasta 4 puestos usan --card-width, la de 5 (3-5-2)
// usa --card-width-compact.
function fitPitchCardSize() {
    const field = document.querySelector(".pitch-field");
    const row = document.querySelector(".pitch-row");
    const sampleCard = document.querySelector(".player-card, .pitch-slot-empty");
    if (!field || !row) return;

    const fieldStyle = getComputedStyle(field);
    const fieldRect = field.getBoundingClientRect();
    const paddingTop = parseFloat(fieldStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(fieldStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(fieldStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(fieldStyle.paddingRight) || 0;
    const rowGap = parseFloat(fieldStyle.rowGap || fieldStyle.gap) || 12;
    const columnGap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 8;

    // "Chroma" de texto de la carta: alto real menos el ancho actual
    // (el retrato es 1:1, así que el resto del alto es texto/badges).
    let chrome = 52;
    if (sampleCard) {
        const cardRect = sampleCard.getBoundingClientRect();
        if (cardRect.width > 0) chrome = cardRect.height - cardRect.width;
    }

    const availableHeight = fieldRect.height - paddingTop - paddingBottom - 3 * rowGap;
    const maxWidthByHeight = availableHeight / 4 - chrome;

    const availableWidth = fieldRect.width - paddingLeft - paddingRight;
    const maxWidthByWidth4 = (availableWidth - 3 * columnGap) / 4;
    const maxWidthByWidth5 = (availableWidth - 4 * columnGap) / 5;

    const baseWidth = Math.max(40, Math.floor(Math.min(maxWidthByHeight, maxWidthByWidth4)));
    const compactWidth = Math.max(36, Math.floor(Math.min(maxWidthByHeight, maxWidthByWidth5)));

    document.documentElement.style.setProperty("--card-width", baseWidth + "px");
    document.documentElement.style.setProperty("--card-width-compact", compactWidth + "px");
}

let fitResizeTimer = null;
function scheduleFitPitchCardSize() {
    clearTimeout(fitResizeTimer);
    fitResizeTimer = setTimeout(fitPitchCardSize, 100);
}

// Al volver de la Ficha de Jugador: dispara el selector de sustitución
// si se pulsó "Cambiar jugador" ahí. En pageshow (no solo
// DOMContentLoaded) para que funcione también si el navegador
// restaura la página desde su caché de "atrás" sin re-ejecutar los
// scripts.
function restorePlayerDetailReturnContext() {
    const context = consumePlayerDetailReturnContext();
    if (!context) return;
    if (context.triggerAction && context.actionMeta && context.actionMeta.actionType === "slotPicker") {
        openSlotPicker(context.actionMeta.slotIndex, context.actionMeta.position);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initFormationSelect();
    initSlotPicker();
    renderFormation();
    fitPitchCardSize();
    window.addEventListener("resize", scheduleFitPitchCardSize);
});

window.addEventListener("pageshow", restorePlayerDetailReturnContext);
