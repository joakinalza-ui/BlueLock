const PLACEHOLDER_PORTRAIT = "assets/characters/portraits/placeholder.png";

// Probabilidades por rareza en una tirada normal (antes de que el
// pity fuerce un ★3). El pool solo llega hasta ★3 en este juego.
const GACHA_RARITY_WEIGHTS = { 1: 75, 2: 22, 3: 3 };
const GACHA_COST_X1 = 150;
const GACHA_COST_X10 = 1500;
// Esencias recibidas al sacar en una tirada (x1/x10) un personaje que
// ya estaba desbloqueado: siempre 1 fija, sin importar su rareza (esto
// es distinto de las Esencias variables por rareza que da el Mapa de
// Fichajes en victorias 2ª-11ª — esa tabla no cambia).
const GACHA_PULL_DUPLICATE_ESSENCE = 1;

const GACHA_BANNER_NAME = "Convocatoria: Selección Blue Lock";
// Canje de Tickets de Gacha: 1 ticket cubre una tirada x1 gratis, 10
// tickets cubren una tirada x10 gratis — ambas opciones coexisten, se
// eligen solas según qué botón se pulse.
const GACHA_TICKETS_FOR_X1 = 1;
const GACHA_TICKETS_FOR_X10 = 10;

function buildStars(rarity) {
    return "★".repeat(rarity);
}

// Elige una rareza al azar según GACHA_RARITY_WEIGHTS, repartiendo el
// peso solo entre las rarezas que de verdad tienen personajes en el
// pool (por si algún tier se queda sin nadie). Si forceGuaranteed3 es
// true (pity al máximo), siempre devuelve 3.
function pickRarityTier(forceGuaranteed3) {
    if (forceGuaranteed3) return 3;
    const availableTiers = Object.keys(GACHA_RARITY_WEIGHTS)
        .map(Number)
        .filter((rarity) => CHARACTERS_DATA.some((c) => c.rarity === rarity && !c.gachaExcluded));
    if (!availableTiers.length) return null;
    const totalWeight = availableTiers.reduce((sum, r) => sum + GACHA_RARITY_WEIGHTS[r], 0);
    let roll = Math.random() * totalWeight;
    for (const rarity of availableTiers) {
        roll -= GACHA_RARITY_WEIGHTS[rarity];
        if (roll <= 0) return rarity;
    }
    return availableTiers[availableTiers.length - 1];
}

// Elige un personaje al azar dentro de una rareza ya decidida y
// resuelve si es nuevo (se desbloquea) o duplicado (se convierte en
// Esencias del propio personaje). No decide la rareza ni toca el
// pity — eso es cosa de quien la llame (pullOnce con las probabilidades
// normales, o el sobre de bienvenida con rarezas fijas).
function resolvePullResult(rarity) {
    const pool = CHARACTERS_DATA.filter((c) => c.rarity === rarity && !c.gachaExcluded);
    const character = pool[Math.floor(Math.random() * pool.length)];

    const wasUnlocked = isCharacterUnlocked(character);
    if (wasUnlocked) {
        addEssence(character.id, GACHA_PULL_DUPLICATE_ESSENCE);
        return { character, isNew: false, essenceGained: GACHA_PULL_DUPLICATE_ESSENCE };
    }
    unlockCharacter(character.id);
    return { character, isNew: true, essenceGained: 0 };
}

// Una tirada normal: elige rareza respetando el pity y resuelve el
// resultado sobre esa rareza.
function pullOnce() {
    const pityCount = getPityCount();
    const forceGuaranteed3 = pityCount + 1 >= PITY_THRESHOLD;
    const rarity = pickRarityTier(forceGuaranteed3);
    setPityCount(rarity === 3 ? 0 : pityCount + 1);
    return resolvePullResult(rarity);
}

function pullMultiple(count) {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(pullOnce());
    }
    return results;
}

function updatePullX1CostDisplay() {
    const costEl = document.getElementById("pull-x1-cost");
    if (getGachaTickets() >= GACHA_TICKETS_FOR_X1) {
        costEl.innerHTML = '<span class="ticket-icon">🎫</span> GRATIS';
    } else {
        costEl.innerHTML = '<span class="diamond-icon"><img src="../../assets/ui/diamond-icon.png" alt=""></span> 150';
    }
}

function updatePullX10CostDisplay() {
    const costEl = document.getElementById("pull-x10-cost");
    if (getGachaTickets() >= GACHA_TICKETS_FOR_X10) {
        costEl.innerHTML = `<span class="ticket-icon">🎫</span> ${GACHA_TICKETS_FOR_X10} tickets — GRATIS`;
    } else {
        costEl.innerHTML = '<span class="diamond-icon"><img src="../../assets/ui/diamond-icon.png" alt=""></span> 1.500';
    }
}

function updateHeaderCounters() {
    const diamonds = getDiamonds();
    const tickets = getGachaTickets();
    document.getElementById("diamond-count").textContent = diamonds.toLocaleString("es-ES");
    document.getElementById("ticket-count").textContent = tickets.toLocaleString("es-ES");
    const pity = getPityCount();
    document.getElementById("pity-fraction").textContent = `${pity} / ${PITY_THRESHOLD}`;
    document.getElementById("pity-fill").style.width = Math.min(100, (pity / PITY_THRESHOLD) * 100) + "%";

    updatePullX1CostDisplay();
    updatePullX10CostDisplay();
    document.getElementById("pull-x1-btn").disabled = tickets < GACHA_TICKETS_FOR_X1 && diamonds < GACHA_COST_X1;
    document.getElementById("pull-x10-btn").disabled = tickets < GACHA_TICKETS_FOR_X10 && diamonds < GACHA_COST_X10;

    // Solo se avisa de "★3 garantizado" cuando de verdad va a tocar
    // dentro de esa tirada — el pity nunca se resetea salvo al sacar un
    // ★3, así que si ya está a 10 o menos del umbral, el x10 SÍ o SÍ
    // incluye uno garantizado.
    document.getElementById("pull-x10-guarantee").hidden = pity + 10 < PITY_THRESHOLD;

    updatePointsShopButtonCount();
}

function showInsufficientFundsToast() {
    const toast = document.getElementById("insufficient-funds-toast");
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2200);
}

function buildResultCardMarkup(result) {
    const character = result.character;
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? character.sprite : PLACEHOLDER_PORTRAIT;
    const badge = result.isNew
        ? '<span class="result-card-badge badge-new">¡NUEVO!</span>'
        : `<span class="result-card-badge badge-essence">+${result.essenceGained} Esen.</span>`;
    return `
        <span class="result-card-thumb">
            <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
        </span>
        <span class="result-card-position" data-position="${character.position}">${character.position}</span>
        ${badge}
        <span class="result-card-stars">${buildStars(character.rarity)}</span>
        <span class="result-card-name">${character.name}</span>
    `;
}

function showPullResults(results) {
    const overlay = document.getElementById("pull-result-overlay");
    const grid = document.getElementById("pull-result-grid");
    grid.innerHTML = "";
    grid.classList.toggle("is-single", results.length === 1);
    results.forEach((result) => {
        const card = document.createElement("div");
        card.className = "result-card" + (result.isNew ? " is-new" : "");
        card.innerHTML = buildResultCardMarkup(result);
        grid.appendChild(card);
    });
    overlay.hidden = false;
    alignRealSpriteThumbs('#pull-result-grid img[data-real-sprite="true"]');
}

// La tirada x1 usa 1 Ticket de Gacha gratuito si hay alguno disponible
// (ganados en Desafíos) en vez de 300 diamantes; la x10 usa 10 tickets
// en vez de 2.700 diamantes si llegan — ambas opciones de ticket
// coexisten, cada botón elige la suya según cuántos tickets haya.
// Salvo el pago, una tirada con tickets es IDÉNTICA a una de pago
// normal: mismo pity/garantía de ★3, y también da Puntos de
// Reclutamiento (a diferencia del Sobre de Bienvenida, que es un
// regalo único aparte y no los da — ver claimWelcomePull).
function handlePull(count, cost) {
    const ticketsNeeded = count === 1 ? GACHA_TICKETS_FOR_X1 : count === 10 ? GACHA_TICKETS_FOR_X10 : null;
    const useTicket = ticketsNeeded !== null && getGachaTickets() >= ticketsNeeded;
    if (useTicket) {
        if (!spendGachaTickets(ticketsNeeded)) {
            showInsufficientFundsToast();
            return;
        }
    } else if (!spendDiamonds(cost)) {
        showInsufficientFundsToast();
        return;
    }
    const results = pullMultiple(count);
    // 1 Punto de Reclutamiento por cada tirada individual (x1 = 1,
    // x10 = 10), pase lo que pase en el resultado y se pague como se
    // pague. No usa `cost` porque el precio y los puntos ganados son
    // cosas independientes.
    addRecruitPoints(count);
    updateHeaderCounters();
    showPullResults(results);
}

function initPullButtons() {
    document.getElementById("pull-x1-btn").addEventListener("click", () => handlePull(1, GACHA_COST_X1));
    document.getElementById("pull-x10-btn").addEventListener("click", () => handlePull(10, GACHA_COST_X10));

    const resultOverlay = document.getElementById("pull-result-overlay");
    document.getElementById("pull-result-close").addEventListener("click", () => { resultOverlay.hidden = true; });
    document.getElementById("pull-result-ok").addEventListener("click", () => { resultOverlay.hidden = true; });
    resultOverlay.addEventListener("click", (event) => {
        if (event.target === resultOverlay) resultOverlay.hidden = true;
    });
}

function renderBannerDetails() {
    const list = document.getElementById("banner-details-list");
    list.innerHTML = "";
    [3, 2, 1].forEach((rarity) => {
        const characters = CHARACTERS_DATA.filter((c) => c.rarity === rarity && !c.gachaExcluded);
        if (!characters.length) return;
        const tier = document.createElement("div");
        tier.className = "banner-tier";
        tier.innerHTML = `<span class="banner-tier-title">${buildStars(rarity)}</span>`;
        characters
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((character) => {
                const locked = !isCharacterUnlocked(character);
                const row = document.createElement("div");
                row.className = "banner-character-row" + (locked ? " is-locked" : "");
                row.innerHTML = `
                    <span class="banner-character-position">${character.position}</span>
                    <span>${character.name}</span>
                    <span>${locked ? "🔒" : "✓"}</span>
                `;
                tier.appendChild(row);
            });
        list.appendChild(tier);
    });
}

function initBannerDetails() {
    const overlay = document.getElementById("banner-details-overlay");
    document.getElementById("banner-details-btn").addEventListener("click", () => {
        renderBannerDetails();
        overlay.hidden = false;
    });
    document.getElementById("banner-details-close").addEventListener("click", () => { overlay.hidden = true; });
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) overlay.hidden = true;
    });
}

// ===================================================================
// Tienda de Puntos de Reclutamiento: modal (mismo patrón que el resto
// de modales de Gacha) donde se cambian Puntos de Reclutamiento por
// cualquier personaje ★3 del roster, esté ya desbloqueado o no. Si ya
// se tiene, el canje da Esencias en vez de un duplicado inútil, misma
// lógica que una tirada normal.
// ===================================================================

function updatePointsShopButtonCount() {
    const el = document.getElementById("points-shop-btn-count");
    if (el) el.textContent = getRecruitPoints().toLocaleString("es-ES");
}

function buildPointsShopRowMarkup(character) {
    const canAfford = getRecruitPoints() >= RECRUIT_POINTS_REDEEM_COST;
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? character.sprite : PLACEHOLDER_PORTRAIT;
    const owned = isCharacterUnlocked(character);

    return `
        <div class="points-shop-row">
            <span class="points-shop-row-thumb">
                <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
            </span>
            <div class="points-shop-row-info">
                <span class="points-shop-row-name">${character.name}${owned ? ' <span class="points-shop-row-owned">(ya desbloqueado)</span>' : ""}</span>
                <span class="points-shop-row-position">${character.position} · ${buildStars(character.rarity)}</span>
            </div>
            <button class="points-shop-redeem-btn" type="button" data-character="${character.id}" ${canAfford ? "" : "disabled"}>Canjear (${RECRUIT_POINTS_REDEEM_COST} puntos)</button>
        </div>
    `;
}

function renderPointsShop() {
    document.getElementById("points-shop-balance-value").textContent = getRecruitPoints().toLocaleString("es-ES");

    const list = document.getElementById("points-shop-list");
    const threeStarRoster = CHARACTERS_DATA
        .filter((c) => c.rarity === 3 && !c.gachaExcluded)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    list.innerHTML = threeStarRoster.map(buildPointsShopRowMarkup).join("");
    alignRealSpriteThumbs('#points-shop-list img[data-real-sprite="true"]');
}

function showPointsShopToast(text) {
    const toast = document.getElementById("points-shop-toast");
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2200);
}

function openPointsShop() {
    renderPointsShop();
    document.getElementById("points-shop-overlay").hidden = false;
}

function closePointsShop() {
    document.getElementById("points-shop-overlay").hidden = true;
}

function handlePointsShopRedeem(characterId) {
    const character = CHARACTERS_DATA.find((c) => c.id === characterId);
    if (!character) return;

    const wasUnlocked = isCharacterUnlocked(character);
    if (!spendRecruitPoints(RECRUIT_POINTS_REDEEM_COST)) return;

    if (wasUnlocked) {
        addEssence(character.id, GACHA_PULL_DUPLICATE_ESSENCE);
        showPointsShopToast(`+${GACHA_PULL_DUPLICATE_ESSENCE} Esencias de ${character.name}`);
    } else {
        unlockCharacter(character.id);
        showPointsShopToast(`¡${character.name} desbloqueado!`);
    }

    renderPointsShop();
    updatePointsShopButtonCount();
}

function initPointsShop() {
    updatePointsShopButtonCount();

    document.getElementById("points-shop-btn").addEventListener("click", openPointsShop);
    document.getElementById("points-shop-close").addEventListener("click", closePointsShop);

    const overlay = document.getElementById("points-shop-overlay");
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closePointsShop();
    });

    document.getElementById("points-shop-list").addEventListener("click", (event) => {
        const btn = event.target.closest(".points-shop-redeem-btn");
        if (!btn || btn.disabled) return;
        handlePointsShopRedeem(btn.dataset.character);
    });
}

// ===================================================================
// Sobre de Bienvenida: tirada gratuita de un solo uso (1×★3 + 2×★2
// garantizados). A diferencia de una tirada normal: no cuesta
// diamantes, no toca el pity (no son tiradas "normales") y — a
// diferencia del resto del Gacha — NO otorga Puntos de Reclutamiento,
// que solo se ganan con tiradas pagadas.
// ===================================================================

const WELCOME_PULL_CLAIMED_KEY = "bl_welcome_pull_claimed";

function hasClaimedWelcomePull() {
    return localStorage.getItem(WELCOME_PULL_CLAIMED_KEY) === "1";
}

function renderWelcomePullCard() {
    const card = document.getElementById("welcome-pull-card");
    if (!card) return;
    card.hidden = hasClaimedWelcomePull();
}

function claimWelcomePull() {
    if (hasClaimedWelcomePull()) return;
    localStorage.setItem(WELCOME_PULL_CLAIMED_KEY, "1");

    const results = [resolvePullResult(3), resolvePullResult(2), resolvePullResult(2)];
    updateHeaderCounters();
    showPullResults(results);
    renderWelcomePullCard();
}

function initWelcomePull() {
    renderWelcomePullCard();
    document.getElementById("welcome-pull-btn").addEventListener("click", claimWelcomePull);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("banner-name").textContent = GACHA_BANNER_NAME;
    updateHeaderCounters();
    initPullButtons();
    initBannerDetails();
    initPointsShop();
    initWelcomePull();
});
