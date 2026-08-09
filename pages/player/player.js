const params = new URLSearchParams(window.location.search);
const CHARACTER_ID = params.get("id");
let character = null;

function renderHero() {
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? character.sprite : PLAYER_DETAIL_PLACEHOLDER;
    const img = document.getElementById("player-hero-img");
    img.src = resolveAssetPath(spritePath);
    img.alt = character.name;
    img.setAttribute("data-real-sprite", String(hasRealSprite));

    const positionEl = document.getElementById("player-hero-position");
    positionEl.textContent = character.position;
    positionEl.setAttribute("data-position", character.position);

    document.getElementById("player-name").textContent = character.name;
    document.getElementById("player-stars").textContent = "★".repeat(character.rarity);

    const elementIcon = PLAYER_DETAIL_ELEMENT_ICONS[character.element] || "";
    document.getElementById("player-element").textContent = `${elementIcon} ${character.element}`;
    document.getElementById("player-element").setAttribute("data-el", character.element);

    document.getElementById("player-level").textContent = `Nv. ${getCharacterLevel(character.id)}`;

    document.getElementById("player-team").textContent = character.equipoOriginal
        ? `Equipo ${character.equipoOriginal}`
        : "Equipo: Sin asignar";
}

// Escala FIJA para las 4 barras (no el máximo de esa stat en concreto
// para ESTE personaje) — así el ancho representa el poder real de la
// stat, comparable entre personajes de distinta rareza/nivel, en vez
// de verse casi llena siempre.
const STAT_BAR_MAX = 2000;

function renderStats() {
    const stats = getCharacterStatsAtLevel(character);
    const container = document.getElementById("player-stats");
    container.innerHTML = Object.keys(PLAYER_DETAIL_STAT_LABELS).map((key) => {
        const value = stats[key] || 0;
        const pct = Math.max(0, Math.min(100, (value / STAT_BAR_MAX) * 100));
        return `
            <div class="pd-stat-row">
                <span class="pd-stat-label">${PLAYER_DETAIL_STAT_LABELS[key]}</span>
                <div class="pd-stat-track"><div class="pd-stat-fill" style="width:${pct}%"></div></div>
                <span class="pd-stat-value">${value}</span>
            </div>
        `;
    }).join("");
}

function renderPassives() {
    document.getElementById("player-passives").innerHTML = buildPassivesListMarkup(character);
}

// A diferencia de Subir de Nivel, el Despertar no depende de estar en
// el Quinteto — es una mejora permanente del personaje, siempre
// disponible. Gasta Esencias del propio personaje (las que ya da el
// gacha al sacar un duplicado suyo), no Combustible de Ego.
function renderAwakeningSection() {
    const awakening = getCharacterAwakening(character.id);
    const essences = getEssenceBalance(character.id);
    const btn = document.getElementById("player-awakening-btn");

    document.getElementById("player-awakening-current").textContent = `Despertar ${awakening} / ${AWAKENING_MAX}`;
    document.getElementById("player-awakening-essences").textContent = `✨ ${essences.toLocaleString("es-ES")} disponibles`;

    const cost = getAwakeningCost(character.rarity, awakening);
    if (cost === null) {
        document.getElementById("player-awakening-cost").textContent = "";
        btn.textContent = "Despertar Máximo";
        btn.disabled = true;
        btn.onclick = null;
        return;
    }

    document.getElementById("player-awakening-cost").textContent = `Coste: ✨ ${cost}`;

    if (essences < cost) {
        btn.textContent = `Faltan ✨ ${cost - essences}`;
        btn.disabled = true;
        btn.onclick = null;
        return;
    }

    btn.textContent = "Despertar";
    btn.disabled = false;
    btn.onclick = () => {
        if (!spendEssence(character.id, cost)) return;
        setCharacterAwakening(character.id, awakening + 1);
        renderHero();
        renderStats();
        renderPassives();
        renderAwakeningSection();
    };
}

function renderTechniques() {
    document.getElementById("player-techniques").innerHTML = buildTechniqueListMarkup(character);
    const freeSlotBtn = document.querySelector('[data-technique-slot="free"]');
    if (freeSlotBtn) {
        freeSlotBtn.addEventListener("click", () => {
            openTechniquePicker(character.id, renderTechniques);
        });
    }
}

// Solo visible si el personaje está actualmente en el Quinteto
// Principal — oculta del todo (no deshabilitada) en caso contrario.
function renderLevelUpSection() {
    const section = document.getElementById("player-levelup-section");
    const inQuinteto = isInQuinteto(character.id);
    section.hidden = !inQuinteto;
    if (!inQuinteto) return;

    const level = getCharacterLevel(character.id);
    const fuel = getEgoFuel();
    const btn = document.getElementById("player-levelup-btn");

    document.getElementById("player-levelup-current").textContent = `Nv. ${level} / ${LEVEL_MAX}`;
    document.getElementById("player-levelup-fuel").textContent = `🔥 ${fuel.toLocaleString("es-ES")} disponible`;

    if (level >= LEVEL_MAX) {
        document.getElementById("player-levelup-cost").textContent = "";
        btn.textContent = "Nivel Máximo";
        btn.disabled = true;
        btn.onclick = null;
        return;
    }

    // Ningún slot puede quedar más de QUINTETO_LEVEL_GAP_MAX niveles por
    // encima del slot más bajo de los 5 — se recalcula aquí mismo cada
    // render, así que subir el más bajo puede desbloquear este botón de
    // nuevo sin tener que hacer nada más.
    if (level - getQuintetoBaseLevel() >= QUINTETO_LEVEL_GAP_MAX) {
        document.getElementById("player-levelup-cost").textContent = "";
        btn.textContent = `Primero sube de nivel a tus jugadores más bajos (diferencia máxima: ${QUINTETO_LEVEL_GAP_MAX} niveles)`;
        btn.disabled = true;
        btn.onclick = null;
        return;
    }

    const cost = getLevelUpCost(level);
    document.getElementById("player-levelup-cost").textContent = `Coste: 🔥 ${cost.toLocaleString("es-ES")}`;

    if (fuel < cost) {
        btn.textContent = `Faltan 🔥 ${(cost - fuel).toLocaleString("es-ES")}`;
        btn.disabled = true;
        btn.onclick = null;
        return;
    }

    btn.textContent = "Subir de Nivel";
    btn.disabled = false;
    btn.onclick = () => {
        if (!spendEgoFuel(cost)) return;
        const slotIndex = getQuinteto().indexOf(character.id);
        setSlotLevel(slotIndex, Math.min(LEVEL_MAX, level + 1));
        // Misión Normal "Sube de nivel X veces": contador permanente.
        incrementLifetimeLevelUps();
        renderHero();
        renderStats();
        // Por si algún día una pasiva o técnica depende del nivel (hitos
        // cada 10 para comunes, 40/60 para técnicas) — hoy no cambia nada
        // visualmente, pero así queda al día en cuanto lo esté.
        renderPassives();
        renderTechniques();
        renderLevelUpSection();
    };
}

function initTabs() {
    document.querySelectorAll(".player-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".player-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
            document.querySelectorAll(".player-tab-panel").forEach((panel) => {
                panel.hidden = panel.dataset.tabPanel !== tab.dataset.tab;
            });
        });
    });
}

// El botón contextual (Cambiar jugador / Añadir al Quinteto) refleja
// lo que la pantalla de origen pidió mostrar (guardado antes de
// navegar aquí). Al pulsarlo, se marca la acción como "disparar al
// volver" y se usa el historial real del navegador — la pantalla de
// origen es quien de verdad ejecuta la acción al recibir el foco de
// nuevo, viendo ese contexto en pageshow.
function initActionButton() {
    const raw = sessionStorage.getItem(PLAYER_DETAIL_RETURN_KEY);
    const context = raw ? JSON.parse(raw) : null;
    const actionMeta = context && context.actionMeta;
    if (!actionMeta || !actionMeta.actionLabel) return;

    const slot = document.getElementById("player-action-slot");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "player-action-btn";
    btn.textContent = actionMeta.actionLabel;
    btn.addEventListener("click", () => {
        const current = JSON.parse(sessionStorage.getItem(PLAYER_DETAIL_RETURN_KEY) || "{}");
        current.triggerAction = true;
        sessionStorage.setItem(PLAYER_DETAIL_RETURN_KEY, JSON.stringify(current));
        history.back();
    });
    slot.appendChild(btn);
}

function initBackButton() {
    document.getElementById("player-back-btn").addEventListener("click", () => history.back());
}

document.addEventListener("DOMContentLoaded", () => {
    character = CHARACTERS_DATA.find((c) => c.id === CHARACTER_ID);
    if (!character) {
        window.location.href = resolveAssetPath("index.html");
        return;
    }
    renderHero();
    renderStats();
    renderPassives();
    renderAwakeningSection();
    renderTechniques();
    renderLevelUpSection();
    initTabs();
    initActionButton();
    initBackButton();
});
