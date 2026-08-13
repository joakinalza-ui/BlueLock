const PLACEHOLDER_PORTRAIT = "assets/characters/portraits/placeholder.webp";

// FORMATIONS_5V5 y FORMATION_5V5_DEFAULT ya están declaradas en
// main.js — compartidas con el selector de alineación de Desafíos
// (challenges/map.js) para que las dos pantallas ofrezcan siempre
// exactamente las mismas formaciones.

function buildStars(rarity) {
    return "★".repeat(rarity);
}

// slotPosition sobreescribe el badge cuando la tarjeta ocupa un puesto
// del campo que no coincide con la posición real del personaje (pasa
// cuando la formación necesita más gente de un puesto del que hay en
// el Quinteto y algún hueco se rellena de respaldo con otra posición,
// ver renderFormation) — sin ella se muestra siempre la posición real,
// que es lo correcto en el selector de sustitución.
function buildPlayerCardMarkup(character, slotPosition) {
    const level = getCharacterLevel(character.id);
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? getCharacterThumbSprite(character) : PLACEHOLDER_PORTRAIT;
    const position = slotPosition || character.position;
    return `
        <span class="player-card-thumb">
            <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
            ${buildAwakeningBadgeMarkup(character.id)}
            <span class="player-card-position" data-position="${position}">${position}</span>
        </span>
        <span class="player-card-stars">${buildStars(character.rarity)}</span>
        <span class="player-card-name">${character.name}</span>
        <span class="player-card-level">Nv. ${level}</span>
    `;
}

// Qué formación táctica (2-1-1, 1-2-1...) estaba elegida en F5, aparte
// de quién ocupa cada puesto (eso ya se guarda solo, en el Quinteto
// Principal — bl_quinteto). Se guarda al vuelo en cuanto se cambia,
// sin botón, igual que el resto del progreso — getFormation5v5Key/
// setFormation5v5Key ya están declaradas en main.js, compartidas con
// la pantalla previa al partido en 5v5 (pages/match/match.js), que usa
// esta misma preferencia.
function initFormationSelect() {
    const select = document.getElementById("formation-select");
    if (!select) return;
    select.innerHTML = "";
    Object.keys(FORMATIONS_5V5).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = FORMATIONS_5V5[key].label;
        select.appendChild(option);
    });
    select.value = getFormation5v5Key();
    select.addEventListener("change", () => {
        setFormation5v5Key(select.value);
        renderFormation();
    });
}

// Qué índice del Quinteto ocupa cada hueco visual de cada fila, para
// la formación actual — se recalcula desde cero (empareja primero por
// posición real; si no hay nadie de esa posición, cae a un hueco vacío
// sin usar de otra fila, y si tampoco hay, a cualquier índice todavía
// libre) solo la PRIMERA vez o al CAMBIAR de formación. Mientras la
// formación se mantenga, se reutiliza el mismo índice para cada hueco
// aunque su contenido cambie — así tocar un jugador concreto para
// quitarlo o sustituirlo deja exactamente su propio hueco vacío o con
// el nuevo jugador, sin desplazar a los demás de sitio.
let formationLayout = null;
let formationLayoutKey = null;

function buildFormationLayout(quinteto, formation) {
    const consumed = new Array(quinteto.length).fill(false);

    function findMatchingIndex(position) {
        for (let i = 0; i < quinteto.length; i++) {
            if (consumed[i] || !quinteto[i]) continue;
            const character = CHARACTERS_DATA.find((c) => c.id === quinteto[i]);
            if (character && character.position === position) return i;
        }
        return -1;
    }

    function findFallbackIndex() {
        for (let i = 0; i < quinteto.length; i++) {
            if (!consumed[i] && !quinteto[i]) return i;
        }
        for (let i = 0; i < quinteto.length; i++) {
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

// Coloca a los 5 titulares del Quinteto Principal en la fila que le
// toca a su hueco (ver formationLayout arriba). Así las 5 tarjetas del
// campo siempre corresponden a los 5 slots reales del Quinteto, sea
// cual sea su composición, sin reordenarse entre sí al editar uno.
function renderFormation() {
    const select = document.getElementById("formation-select");
    const formationKey = select.value;
    const formation = FORMATIONS_5V5[formationKey] || FORMATIONS_5V5[FORMATION_5V5_DEFAULT];
    const quinteto = getQuinteto();

    if (!formationLayout || formationLayoutKey !== formationKey) {
        formationLayout = buildFormationLayout(quinteto, formation);
        formationLayoutKey = formationKey;
    }

    ["DEL", "MED", "DEF", "POR"].forEach((position) => {
        const row = document.getElementById(`row-${position}`);
        row.innerHTML = "";
        formationLayout[position].forEach((index) => {
            const characterId = quinteto[index];
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
            attachLongPressPreview(card, character);
            card.addEventListener("click", () => openSlotPicker(index, position));
            row.appendChild(card);
        });
    });

    const titulares = quinteto.filter((id) => id).map((id) => CHARACTERS_DATA.find((c) => c.id === id)).filter(Boolean);
    const powerEl = document.getElementById("power-value");
    if (!titulares.length) {
        powerEl.textContent = "—";
    } else {
        const totalPower = titulares.reduce((sum, c) => sum + getCharacterPower(c), 0);
        powerEl.textContent = totalPower;
    }

}

// Modifica el Quinteto Principal directamente (mismos datos que
// "Editar Quinteto" en Jugadores), pre-filtrando por la posición del
// puesto tocado. Resultados paginados de 6 en 6 (igual que el selector
// de Personaje de la Home) en vez de lista larga con scroll — el
// filtro por posición se mantiene igual, solo cambia cómo se muestran
// los resultados que pasan ese filtro.
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

    const quinteto = getQuinteto();
    const takenElsewhere = quinteto.filter((id, i) => id && i !== slotIndex);
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
        setQuintetoSlot(slotIndex, null);
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
        attachLongPressPreview(card, character);
        card.addEventListener("click", () => {
            setQuintetoSlot(slotIndex, character.id);
            overlay.hidden = true;
            renderFormation();
        });
        listContainer.appendChild(card);
    });

    // Mismo sistema de alineación por contenido que el resto de la app
    // (Home/Colección/F5/F11/Fichajes/Gacha) — solo se alinean los
    // sprites reales, el placeholder "Vacío" ya es consistente de por sí.

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
// ancho) en el dispositivo concreto. Siempre hay 4 filas (DEL/MED/
// DEF/POR) y como mucho 2 puestos por fila en cualquier formación de
// F5, así que a diferencia de F11 no hace falta un tamaño "compacto"
// aparte. Mismo patrón que fitPitchCardSize() en formation11.js.
// Deja un pequeño margen (92% del hueco por fila) en vez de ocupar el
// alto disponible al completo: las tarjetas quedan un poco más bajas
// de lo que cabría como máximo, y ese hueco sobrante lo reparte
// justify-content:space-between de .pitch-field como aire extra entre
// filas — a petición del usuario, un poco más cortas sin perder ancho.
const PITCH_ROW_HEIGHT_USAGE = 0.97;

function fitPitchCardSize() {
    const field = document.querySelector(".pitch-field");
    const row = document.querySelector(".pitch-row");
    const sampleCard = document.querySelector(".player-card");
    if (!field || !row) return;

    const fieldStyle = getComputedStyle(field);
    const fieldRect = field.getBoundingClientRect();
    const paddingTop = parseFloat(fieldStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(fieldStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(fieldStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(fieldStyle.paddingRight) || 0;
    const rowGap = parseFloat(fieldStyle.rowGap || fieldStyle.gap) || 12;
    const columnGap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 14;

    // "Chroma" de texto de la carta: alto real menos el ancho actual
    // (el retrato es 1:1, así que el resto del alto es texto/badges).
    // Solo se mide sobre una carta real (.player-card): un hueco vacío
    // (.pitch-slot-empty) tiene su propia proporción fija de placeholder
    // y no sirve de referencia para el chroma de texto.
    let chrome = 58;
    if (sampleCard) {
        const cardRect = sampleCard.getBoundingClientRect();
        if (cardRect.width > 0) chrome = cardRect.height - cardRect.width;
    }

    const availableHeight = fieldRect.height - paddingTop - paddingBottom - 3 * rowGap;
    const maxWidthByHeight = (availableHeight / 4) * PITCH_ROW_HEIGHT_USAGE - chrome;

    const availableWidth = fieldRect.width - paddingLeft - paddingRight;
    const maxWidthByWidth = (availableWidth - columnGap) / 2;

    const cardWidth = Math.max(48, Math.floor(Math.min(maxWidthByHeight, maxWidthByWidth)));
    document.documentElement.style.setProperty("--card-width", cardWidth + "px");
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
