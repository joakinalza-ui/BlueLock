const params = new URLSearchParams(window.location.search);
const CHARACTER_ID = params.get("characterId");
const CHALLENGE_MAP = params.get("challengeMap");
const STORY_CHAPTER = params.get("storyChapter");
const MATCH_NUMBER = parseInt(params.get("matchNumber"), 10) || 1;

let state = null;
let autoMode = false;
let autoTimer = null;

function clearAutoTimer() {
    if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
    }
}

function updateAutoButton() {
    const btn = document.getElementById("match-auto-toggle");
    if (!btn) return;
    btn.classList.toggle("is-active", autoMode);
    btn.textContent = autoMode ? "AUTO: ON" : "AUTO";
}

// Programa la siguiente Command Battle automática con una pequeña
// pausa extra (0.25-0.65s, ENCIMA del tiempo de animación del campo
// visual que ya espera playOutcomeFx antes de llamar aquí) para que dé
// tiempo a leer el registro en vez de resolver todo instantáneamente.
function scheduleAutoStep() {
    if (!autoMode || isMatchOver(state)) return;
    clearAutoTimer();
    autoTimer = setTimeout(runAutoStep, 250 + Math.random() * 400);
}

function runAutoStep() {
    autoTimer = null;
    if (!autoMode || isMatchOver(state)) return;

    if (state.currentOwner === "rival") {
        const defenseChoice = decideAutoDefenseChoice();
        const useTechnique = decideAutoUseDefenseTechnique(state);
        const facingShot = state.zone === FIELD_ZONE_MINE_GOAL;
        const myDefendingPosition = facingShot ? "POR" : getDefendingPositionForZone(state.zone, "me");
        const technique = useTechnique
            ? getPositionalDefenseTechnique(state.lineup, myDefendingPosition, facingShot ? "parada" : "bloqueo", state.pe)
            : null;
        const defender = state.lineup.find((c) => c.position === myDefendingPosition) || null;

        castTechniqueOrProceed(defender, technique, () => {
            const outcome = resolveDefenseChoice(state, defenseChoice, useTechnique);
            renderHeader();
            document.getElementById("match-actions").innerHTML = "";
            playOutcomeFx(outcome.outcome, () => {
                renderActions();
                scheduleAutoStep();
            });
        });
    } else {
        const myScorer = state.activePlayer; // capturado ANTES de resolver, ver comentario de playOutcomeFx
        const action = decideAutoAttackAction(state);
        const useTechnique = decideAutoUseTechnique(state, action);
        const technique = useTechnique ? getAvailableTechnique(state, action === "tiro" ? "tiro" : action) : null;

        castTechniqueOrProceed(myScorer, technique, () => {
            const outcome = resolvePlayerChoice(state, action, useTechnique);
            renderHeader();
            document.getElementById("match-actions").innerHTML = "";
            playOutcomeFx(outcome.outcome, () => {
                renderActions();
                scheduleAutoStep();
            }, myScorer);
        });
    }
}

// Al activar, la Command Battle actual pasa a resolverse sola (sin
// esperar clic) desde donde esté el partido; al desactivar a mitad de
// partido, se cancela cualquier paso ya programado y se vuelve a la
// elección manual desde ese mismo punto.
function toggleAutoMode() {
    autoMode = !autoMode;
    updateAutoButton();
    if (autoMode) {
        scheduleAutoStep();
    } else {
        clearAutoTimer();
    }
    renderActions();
}

// Zonas de campo (1 = junto a mi portería, 5 = junto a la rival),
// mostradas en la franja central del campo visual.
const FIELD_ZONE_LABELS = {
    1: "Zona Propia",
    2: "Medio Propio",
    3: "Centro",
    4: "Medio Rival",
    5: "Área Rival",
};

// Orden de filas de arriba a abajo: el rival primero (su portería queda
// fuera de pantalla por encima) y luego mi equipo en espejo (mi
// portería queda fuera de pantalla por debajo).
//
// Cada puesto tiene una "zona de reposo" NEUTRAL: distancia fija a la
// propia portería (POR=0, DEF=1, MED=2, DEL=3 líneas de profundidad),
// igual para los dos equipos, solo mirada desde la portería de cada
// uno -- por eso da zonas altas para mí (empezando en 1) y bajas para
// el rival (empezando en 5). Esa zona de reposo se empuja hacia
// state.zone según cuánto "siga" esa línea al balón
// (LIVE_PITCH_PUSH_WEIGHT: el portero casi nada, los delanteros mucho)
// y a media fuerza si ese equipo no tiene la posesión (forma más
// compacta al defender) -- así el equipo entero sube al atacar y se
// repliega al defender, en vez de quedarse siempre en la misma
// formación fija. El jugador que tiene el balón AHORA MISMO se despega
// de su línea y se coloca exactamente en state.zone.
const LIVE_PITCH_POSITION_DEPTH = { POR: 0, DEF: 1, MED: 2, DEL: 3 };
const LIVE_PITCH_PUSH_WEIGHT = { POR: 0.08, DEF: 0.3, MED: 0.5, DEL: 0.7 };

function getLivePitchGoalZone(side) {
    return side === "me" ? FIELD_ZONE_MINE_GOAL : FIELD_ZONE_RIVAL_GOAL;
}

function getLivePitchNeutralZone(position, side) {
    const goal = getLivePitchGoalZone(side);
    const depth = LIVE_PITCH_POSITION_DEPTH[position] ?? 1;
    return side === "me" ? goal + depth : goal - depth;
}

function isLivePitchActiveCharacter(character, side) {
    return side === "me"
        ? !!(state.currentOwner === "me" && state.activePlayer && state.activePlayer.id === character.id)
        : !!(state.currentOwner === "rival" && state.rivalActivePlayer && state.rivalActivePlayer.id === character.id);
}

function getLivePitchTargetZone(character, side) {
    if (isLivePitchActiveCharacter(character, side)) return state.zone;

    const neutral = getLivePitchNeutralZone(character.position, side);
    const hasPossession = state.currentOwner === side;
    const pushWeight = (LIVE_PITCH_PUSH_WEIGHT[character.position] ?? 0.3) * (hasPossession ? 1 : 0.5);
    const pushed = neutral + (state.zone - neutral) * pushWeight;
    return Math.max(FIELD_ZONE_MIN, Math.min(FIELD_ZONE_MAX, pushed));
}

// Reparto horizontal fijo (no cambia durante el partido): a cada
// jugador de un mismo (equipo, puesto) le toca un hueco a izquierda o
// derecha del centro, y cada equipo se sesga un poco hacia su lado
// (mío a la izquierda, rival a la derecha) para que, cuando las dos
// líneas coincidan cerca de la misma zona (el punto del balón), no
// queden exactamente montadas una encima de otra.
let livePitchSlotOffsets = {};
const LIVE_PITCH_SLOT_SPACING = 32;
const LIVE_PITCH_TEAM_BIAS = { me: -16, rival: 16 };

function computeLivePitchSlots() {
    livePitchSlotOffsets = {};
    [["me", state.lineup], ["rival", state.rivalLineup]].forEach(([side, lineup]) => {
        const byPosition = {};
        lineup.forEach((c) => { (byPosition[c.position] = byPosition[c.position] || []).push(c); });
        Object.values(byPosition).forEach((group) => {
            group.forEach((c, i) => {
                const spread = (i - (group.length - 1) / 2) * LIVE_PITCH_SLOT_SPACING;
                livePitchSlotOffsets[side + "|" + c.id] = LIVE_PITCH_TEAM_BIAS[side] + spread;
            });
        });
    });
}

// El sprite GRANDE (no el "-thumb", que recorta muy cerca de la cara)
// es una ilustración de cuerpo entero con fondo transparente -- se usa
// tal cual, sin recortar en círculo, para que el jugador se vea como un
// muñeco de pie sobre el campo en vez de una ficha con la cara.
function buildLivePitchIconMarkup(character, side, index) {
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? character.sprite : PLAYER_DETAIL_PLACEHOLDER;
    // El balanceo de reposo (ver .live-pitch-icon-bob en match.css) se
    // retrasa un poco distinto por jugador (inline, para que gane
    // siempre a cualquier animation-delay de una clase CSS) para que no
    // boten todos exactamente a la vez -- se ve más vivo.
    const bobDelay = ((index || 0) % 4) * 0.15;
    // 4 capas: .live-pitch-icon coloca (top/left, nunca se anima nada
    // más ahí) -- .live-pitch-icon-bob balancea/corre (rebote e
    // inclinación) -- .live-pitch-icon-glow reacciona con color (pulso
    // al ganar/perder, resalte si está activo) -- .live-pitch-icon-figure
    // es el propio muñeco (golpeo al chutar). Al ir en elementos
    // distintos, todas las animaciones conviven sin pisarse.
    return `
        <div class="live-pitch-icon" data-character="${character.id}" data-side="${side}">
            <div class="live-pitch-icon-shadow"></div>
            <div class="live-pitch-icon-bob" style="animation-delay:${bobDelay}s">
                <div class="live-pitch-icon-glow"></div>
                <img class="live-pitch-icon-figure" src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}">
                <span class="live-pitch-icon-ball">⚽</span>
            </div>
        </div>
    `;
}

// Pinta TODOS los jugadores de los dos equipos -- una sola vez al
// arrancar el partido (las alineaciones no cambian a mitad de
// partido). La posición de cada uno se calcula aparte, en
// updateLivePitchPositions.
function renderLivePitchRoster() {
    const track = document.getElementById("live-pitch-track");
    if (!track) return;
    computeLivePitchSlots();
    livePitchLastZone = {};
    track.innerHTML =
        state.lineup.map((c, i) => buildLivePitchIconMarkup(c, "me", i)).join("") +
        state.rivalLineup.map((c, i) => buildLivePitchIconMarkup(c, "rival", i)).join("");
    updateLivePitchPositions();
}

// Rectángulo (relativo a #live-pitch) de la zona de juego, sin contar
// las franjas de portería arriba/abajo -- medido en vivo con
// getBoundingClientRect, no a mano, así encaja sea cual sea el tamaño
// real de pantalla.
function getLivePitchTrackRect() {
    const pitch = document.getElementById("live-pitch");
    const track = document.getElementById("live-pitch-track");
    if (!pitch || !track) return null;
    const pitchRect = pitch.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    return { top: trackRect.top - pitchRect.top, height: trackRect.height };
}

// Deja un margen a cada lado (la mitad del icono) para que el jugador
// activo en la zona 1/5 no quede a caballo entre la franja de juego y
// la franja de portería.
const LIVE_PITCH_ICON_RADIUS = 26;

function zoneToTopPx(zoneValue, trackRect) {
    const usableHeight = Math.max(0, trackRect.height - LIVE_PITCH_ICON_RADIUS * 2);
    const fraction = (FIELD_ZONE_MAX - zoneValue) / (FIELD_ZONE_MAX - FIELD_ZONE_MIN);
    return trackRect.top + LIVE_PITCH_ICON_RADIUS + fraction * usableHeight;
}

// Recoloca a TODOS los jugadores según la situación actual (zona del
// balón, quién ataca/defiende, quién tiene el balón ahora mismo) y
// resalta al que lo tiene -- se llama en cada Command Battle, nunca
// solo al arrancar, así el campo entero se mueve solo con cada jugada
// (transición CSS de "top"/"left", ver .live-pitch-icon en match.css).
// Recuerda la última zona pintada de cada jugador para poder detectar
// si de verdad se ha movido de un paso a otro (y solo entonces
// disparar la animación de carrera, ver .is-moving en match.css) --
// sin esto, cada Command Battle repintaría la animación de correr
// aunque nadie hubiera cambiado de sitio.
let livePitchLastZone = {};

function updateLivePitchPositions() {
    const trackRect = getLivePitchTrackRect();
    if (!trackRect) return;

    document.querySelectorAll(".live-pitch-icon").forEach((el) => {
        const side = el.dataset.side;
        const lineup = side === "me" ? state.lineup : state.rivalLineup;
        const character = lineup.find((c) => c.id === el.dataset.character);
        if (!character) return;

        const key = side + "|" + character.id;
        const zoneValue = getLivePitchTargetZone(character, side);
        const movedEnough = livePitchLastZone[key] !== undefined && Math.abs(livePitchLastZone[key] - zoneValue) > 0.05;
        livePitchLastZone[key] = zoneValue;

        el.style.top = zoneToTopPx(zoneValue, trackRect) + "px";
        el.style.left = `calc(50% + ${livePitchSlotOffsets[key] || 0}px)`;
        el.classList.toggle("is-active", isLivePitchActiveCharacter(character, side));

        if (movedEnough) {
            el.classList.add("is-moving");
            clearTimeout(el._liveMoveTimer);
            el._liveMoveTimer = setTimeout(() => el.classList.remove("is-moving"), 620);
        }
    });
}

// Tema visual por elemento (mismos iconos que PLAYER_DETAIL_ELEMENT_ICONS
// en main.js, ver Ficha) para el aura/rayos/placa de la cinemática de
// Técnica -- color y brillo coherentes con el elemento real de la
// Técnica que se está usando (technique.element, no el del jugador que
// la lleva, igual que ya hace doesElementBeat en match-engine.js).
const TECHNIQUE_ELEMENT_THEME = {
    Fuego: { icon: "🔥", color: "#fb923c", glow: "rgba(251,146,60,0.55)" },
    Bosque: { icon: "🌲", color: "#4ade80", glow: "rgba(74,222,128,0.5)" },
    "Montaña": { icon: "⛰️", color: "#d6d3d1", glow: "rgba(214,211,209,0.5)" },
    Aire: { icon: "💨", color: "#7dd3fc", glow: "rgba(125,211,252,0.5)" },
};

const TECHNIQUE_CAST_MS = 1150;

// Cinemática de activación de Técnica (ver .live-pitch-technique en
// match.css): el personaje que la usa entra a pantalla completa con un
// aura de su elemento y el nombre de la Técnica, ANTES de resolver la
// Command Battle -- así se nota que "está pasando algo especial" en vez
// de que una Técnica se vea exactamente igual que una acción básica.
// character/technique pueden venir null (por ejemplo si el motor no
// encontrara Técnica disponible pese a haberla pedido) -- en ese caso
// se salta directo al callback sin más, igual que un envite sin Técnica.
function playTechniqueCastCutscene(character, technique, callback) {
    const cutscene = document.getElementById("live-pitch-technique");
    if (!cutscene || !character || !technique) {
        callback();
        return;
    }

    const img = document.getElementById("live-pitch-technique-img");
    const nameEl = document.getElementById("live-pitch-technique-name");
    const iconEl = document.getElementById("live-pitch-technique-icon");
    const theme = TECHNIQUE_ELEMENT_THEME[technique.element] || TECHNIQUE_ELEMENT_THEME.Aire;

    const hasRealSprite = !!character.sprite;
    img.src = resolveAssetPath(hasRealSprite ? character.sprite : PLAYER_DETAIL_PLACEHOLDER);
    img.alt = character.name;
    nameEl.textContent = technique.name;
    iconEl.textContent = theme.icon;
    cutscene.style.setProperty("--tech-color", theme.color);
    cutscene.style.setProperty("--tech-glow", theme.glow);

    cutscene.classList.remove("is-visible");
    void cutscene.offsetWidth; // fuerza reflow para poder repetir la animación en Técnicas consecutivas
    cutscene.classList.add("is-visible");
    setTimeout(() => {
        cutscene.classList.remove("is-visible");
        callback();
    }, TECHNIQUE_CAST_MS);
}

// Si hay Técnica de verdad, primero se ve su cinemática y SOLO al
// terminar se llama a proceed (que resuelve la Command Battle); sin
// Técnica, proceed se llama al momento, como hasta ahora.
function castTechniqueOrProceed(character, technique, proceed) {
    if (technique) {
        playTechniqueCastCutscene(character, technique, proceed);
    } else {
        proceed();
    }
}

const GOAL_CUTSCENE_MS = 1050;

// Escena de gol a pantalla completa sobre el campo (estilo "parada de
// cámara" de Captain Tsubasa Dream Team): el retrato GRANDE de quien
// marcó entra con un golpe de escala + un destello radial detrás, se
// mantiene un instante con el texto ¡GOL!/GOL RIVAL, y se apaga sola
// (ver GOAL_CUTSCENE_MS). scorer puede ser null (por ejemplo si el
// motor no diera un jugador concreto) -- en ese caso se usa el
// placeholder en vez de romper.
function playGoalCutscene(scorer, isBad) {
    const cutscene = document.getElementById("live-pitch-cutscene");
    const img = document.getElementById("live-pitch-cutscene-img");
    const text = document.getElementById("live-pitch-cutscene-text");
    if (cutscene && img && text) {
        const hasRealSprite = scorer && !!scorer.sprite;
        img.src = resolveAssetPath(hasRealSprite ? scorer.sprite : PLAYER_DETAIL_PLACEHOLDER);
        img.alt = scorer ? scorer.name : "";
        text.textContent = isBad ? "GOL RIVAL" : "¡GOL!";

        cutscene.classList.remove("is-visible");
        void cutscene.offsetWidth; // fuerza reflow para poder repetir la animación en goles consecutivos
        cutscene.classList.toggle("is-bad", isBad);
        cutscene.classList.add("is-visible");
        setTimeout(() => cutscene.classList.remove("is-visible"), GOAL_CUTSCENE_MS);
    }

    const scoreEl = document.getElementById("score-line");
    scoreEl.classList.remove("is-bump");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("is-bump");
}

// Pulso de color en el icono ACTIVO ahora mismo (ver
// updateLivePitchPositions, que ya se llamó antes desde renderHeader) --
// verde (bien para mí), ámbar/rojo con sacudida (mal para mí) o ámbar
// neutro (avance rival sin gol). Se fuerza un reflow para poder repetir
// la misma animación en Command Battles consecutivas.
function pulseActivePitchIcon(kind) {
    const el = document.querySelector(".live-pitch-icon.is-active");
    if (!el) return;
    el.classList.remove("fx-good", "fx-warn", "fx-bad");
    void el.offsetWidth;
    el.classList.add("fx-" + kind);
}

// Golpeo de balón (rotación + estirón, ver .fx-kick en match.css) en el
// icono ACTIVO -- solo en un Tiro de verdad (propio: gol o fallo; del
// rival cuando dispara a puerta), independiente del pulso de color de
// arriba (van en elementos distintos, conviven sin pisarse).
const KICK_OUTCOMES = new Set(["goal", "miss", "rivalGoal", "blocked"]);

function kickActivePitchIcon() {
    const el = document.querySelector(".live-pitch-icon.is-active");
    if (!el) return;
    el.classList.remove("fx-kick");
    void el.offsetWidth;
    el.classList.add("fx-kick");
}

// Aviso rápido de "gran jugada" sin retrato (ver .live-pitch-toast en
// match.css) para los resultados que SÍ merecen resaltarse pero no
// tienen un único jugador al que atribuírselos con sentido (defensa
// por puesto, no por persona — a diferencia del gol, que sí tiene
// goleador real). advance/rivalAdvance no llevan texto: son el
// resultado más frecuente con diferencia y llenarían la pantalla de
// ruido si sonaran en cada Command Battle.
const OUTCOME_TOAST_TEXT = {
    intercepted: { text: "¡INTERCEPTADO!", isBad: false },
    blocked: { text: "¡BLOQUEADO!", isBad: false },
    turnover: { text: "¡ROBADO!", isBad: true },
    miss: { text: "FALLO", isBad: true },
};
const TOAST_MS = 550;

function playOutcomeToast(outcomeKey) {
    const config = OUTCOME_TOAST_TEXT[outcomeKey];
    const toast = document.getElementById("live-pitch-toast");
    const textEl = document.getElementById("live-pitch-toast-text");
    if (!config || !toast || !textEl) return;

    textEl.textContent = config.text;
    toast.classList.remove("is-visible");
    void toast.offsetWidth; // fuerza reflow para poder repetir la animación en jugadas consecutivas
    toast.classList.toggle("is-bad", config.isBad);
    toast.classList.add("is-visible");
    setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
}

const PITCH_ANIM_MS = 550;
const OUTCOME_PITCH_FX = {
    advance: "good",
    goal: "good",
    miss: "bad",
    turnover: "bad",
    intercepted: "good",
    blocked: "good",
    rivalAdvance: "warn",
    rivalGoal: "bad",
};

// Efecto visual de UN resultado de Command Battle (ataque o defensa),
// ya con las posiciones recalculadas (renderHeader -> updateLivePitchPositions
// se llama justo antes, en cada punto de llamada). callback se dispara
// pasado el tiempo de la animación (más largo si hay escena de gol, ver
// GOAL_CUTSCENE_MS): ahí es cuando se pintan los botones de la
// siguiente decisión (o se programa el siguiente paso automático) --
// así no se puede interrumpir a mitad tocando otro botón ni se pisan
// animaciones entre sí. myScorer: quién marcó SI el resultado es "goal"
// -- hay que pasarlo capturado desde fuera (ver handleChoice/
// runAutoStep) porque para cuando esta función se llama,
// resolvePlayerChoice ya reasignó state.activePlayer a quien presiona
// la siguiente jugada, no a quien acaba de chutar. Para "rivalGoal" no
// hace falta: state.rivalActivePlayer no se toca al perder ELLOS la
// posesión, así que sigue apuntando al que marcó.
function playOutcomeFx(outcomeKey, callback, myScorer) {
    pulseActivePitchIcon(OUTCOME_PITCH_FX[outcomeKey] || "warn");
    if (KICK_OUTCOMES.has(outcomeKey)) kickActivePitchIcon();
    if (outcomeKey === "goal") playGoalCutscene(myScorer, false);
    if (outcomeKey === "rivalGoal") playGoalCutscene(state.rivalActivePlayer, true);
    playOutcomeToast(outcomeKey);
    const isGoal = outcomeKey === "goal" || outcomeKey === "rivalGoal";
    setTimeout(callback, isGoal ? GOAL_CUTSCENE_MS : PITCH_ANIM_MS);
}

function renderHeader() {
    document.getElementById("score-line").textContent = `${state.score.me} - ${state.score.rival}`;
    document.getElementById("possession-line").textContent = isMatchOver(state)
        ? "Partido terminado"
        : `Min. ${Math.round(state.currentMinute)} / ${state.matchMinuteLimit} — ${state.currentOwner === "me" ? "Tuya" : "Rival"}`;
    document.getElementById("zone-line").textContent = FIELD_ZONE_LABELS[state.zone];
    updateLivePitchPositions();
}

function buildActionButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "match-choice-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
}

const ACTION_LABELS = { regate: "Regate", pase: "Pase", tiro: "Tiro" };
const DEFENSE_LABELS = { entrada: "Entrada", interceptacion: "Interceptación", bloqueo: "Bloqueo" };

function handleChoice(action, useTechnique) {
    const myScorer = state.activePlayer; // capturado ANTES de resolver, ver comentario de playOutcomeFx
    // Se vacían los botones ANTES de animar (en vez de esperar a
    // renderActions) para que no se pueda tocar la siguiente decisión a
    // mitad de la cinemática de Técnica ni de la animación del campo.
    document.getElementById("match-actions").innerHTML = "";
    const technique = useTechnique ? getAvailableTechnique(state, action === "tiro" ? "tiro" : action) : null;

    castTechniqueOrProceed(myScorer, technique, () => {
        const outcome = resolvePlayerChoice(state, action, useTechnique);
        renderHeader();
        document.getElementById("match-actions").innerHTML = "";
        playOutcomeFx(outcome.outcome, renderActions, myScorer);
    });
}

function renderMyTurnActions(container) {
    const ready = state.zone === FIELD_ZONE_RIVAL_GOAL;

    const peLine = document.createElement("p");
    peLine.className = "match-pe";
    peLine.textContent = `PE: ${state.pe} / ${state.peMax}`;
    container.appendChild(peLine);

    // Regate/Pase son la vía principal mientras el balón no está en el
    // Área Rival (zona 5); el Tiro sigue disponible pero penalizado, no
    // se oculta. Al llegar a esa zona, el Tiro deja de estar penalizado
    // (alta probabilidad) pero se muestra como un botón más, sin resaltar.
    const order = ready ? ["tiro", "regate", "pase"] : ["regate", "pase", "tiro"];

    order.forEach((action) => {
        const isPenalizedShot = action === "tiro" && !ready;
        const label = isPenalizedShot
            ? `${ACTION_LABELS[action]} (penalización: fuera de posición)`
            : ACTION_LABELS[action];

        const btn = buildActionButton(label, () => handleChoice(action, false));
        if (isPenalizedShot) btn.classList.add("is-penalized");
        container.appendChild(btn);

        const technique = getAvailableTechnique(state, action);
        if (technique) {
            container.appendChild(buildActionButton(
                `${ACTION_LABELS[action]} + ${technique.name} (-${technique.cost} PE)`,
                () => handleChoice(action, true)
            ));
        }
    });
}

function handleDefenseChoice(defenseChoice, useTechnique) {
    document.getElementById("match-actions").innerHTML = "";
    let technique = null;
    let defender = null;
    if (useTechnique) {
        const facingShot = state.zone === FIELD_ZONE_MINE_GOAL;
        const myDefendingPosition = facingShot ? "POR" : getDefendingPositionForZone(state.zone, "me");
        technique = getPositionalDefenseTechnique(state.lineup, myDefendingPosition, facingShot ? "parada" : "bloqueo", state.pe);
        defender = state.lineup.find((c) => c.position === myDefendingPosition) || null;
    }

    castTechniqueOrProceed(defender, technique, () => {
        const outcome = resolveDefenseChoice(state, defenseChoice, useTechnique);
        renderHeader();
        document.getElementById("match-actions").innerHTML = "";
        playOutcomeFx(outcome.outcome, renderActions);
    });
}

// Posesión rival: el jugador predice, SIN saber qué va a intentar el
// rival, entre 3 acciones defensivas (una por cada acción rival
// posible). El rival ya tiene su acción decidida internamente, pero no
// se revela hasta resolver la elección. Igual que al atacar, si el
// puesto que le toca defender a esta zona tiene una Técnica Básica
// defensiva disponible ("Bloqueo" o "Parada", según si el balón está en
// la Zona 1 — decideRivalAction siempre tira ahí, nunca al azar) se
// ofrece un botón extra por cada predicción para gastar PE en ella.
function renderRivalTurn(container) {
    const promptLine = document.createElement("p");
    promptLine.className = "match-waiting";
    promptLine.textContent = "Posesión rival — elige tu predicción defensiva:";
    container.appendChild(promptLine);

    const peLine = document.createElement("p");
    peLine.className = "match-pe";
    peLine.textContent = `PE: ${state.pe} / ${state.peMax}`;
    container.appendChild(peLine);

    const facingShot = state.zone === FIELD_ZONE_MINE_GOAL;
    const myDefendingPosition = facingShot ? "POR" : getDefendingPositionForZone(state.zone, "me");
    const technique = getPositionalDefenseTechnique(state.lineup, myDefendingPosition, facingShot ? "parada" : "bloqueo", state.pe);

    Object.keys(DEFENSE_LABELS).forEach((choice) => {
        container.appendChild(buildActionButton(DEFENSE_LABELS[choice], () => handleDefenseChoice(choice, false)));
        if (technique) {
            container.appendChild(buildActionButton(
                `${DEFENSE_LABELS[choice]} + ${technique.name} (-${technique.cost} PE)`,
                () => handleDefenseChoice(choice, true)
            ));
        }
    });
}

function renderFinal(container) {
    const winner = getWinner(state);
    const title = winner === "me" ? "¡Victoria!" : winner === "rival" ? "Derrota" : "Empate";

    // Misión diaria "Juega 1 partido": cuenta con solo terminar el
    // partido, gane o pierda (o empate) — no depende del resultado.
    setMissionProgress("playMatch", 1);
    // Misiones Normales "Juega X partidos" / "Marca X goles": contadores
    // permanentes, se acumulan siempre (partidos jugados y goles
    // marcados de TODOS los modos), no solo hoy.
    incrementLifetimeMatchesPlayed();
    addLifetimeGoalsScored(state.score.me);

    let rewardsHtml = "";
    let backLabel = "Volver al Mapa de Fichajes";
    let backHref = "pages/transfers/index.html";

    if (state.mapKey) {
        backLabel = "Volver al mapa de Desafíos";
        backHref = `pages/challenges/map.html?map=${encodeURIComponent(state.mapKey)}`;
        if (winner === "me") {
            const rewardResult = applyChallengeMatchWin(state.mapKey, state.matchNumber);
            if (rewardResult) {
                const rewards = [
                    `◆ +${rewardResult.diamondsGained} diamantes`,
                    `🎫 +${rewardResult.ticketsGained} Ticket de Gacha`,
                ];
                if (rewardResult.mapCompleted) rewards.push("🏆 Mapa de Desafíos completado");
                rewardsHtml = rewards.map((r) => `<div class="match-reward-row">${r}</div>`).join("");
            }
        }
    } else if (state.chapterKey) {
        const config = getStoryChapterConfig(state.chapterKey);
        backLabel = "Volver a Historia";
        backHref = `pages/story/chapter.html?chapter=${encodeURIComponent(state.chapterKey)}`;
        if (winner === "me") {
            const rewardResult = applyStoryMatchWin(state.chapterKey, state.matchNumber);
            if (rewardResult) {
                const rewards = [
                    `◆ +${rewardResult.diamondsGained} diamantes`,
                    `⛽ +${rewardResult.egoFuelGained.toLocaleString("es-ES")} Combustible de Ego`,
                ];
                if (rewardResult.chapterCompleted) rewards.push(`🏁 ${config ? config.title : "Capítulo"} completado`);
                rewardsHtml = rewards.map((r) => `<div class="match-reward-row">${r}</div>`).join("");
            }
        }
    } else if (winner === "me" && TRANSFER_NODES.includes(state.character.id)) {
        const rewardResult = applyTransferMatchWin(state.character.id);
        if (rewardResult) {
            const rewards = [];
            if (rewardResult.unlocked) rewards.push(`🔓 ${state.character.name} desbloqueado en tu roster`);
            if (rewardResult.essenceGained) rewards.push(`✨ +${rewardResult.essenceGained} Esencias de ${state.character.name}`);
            rewards.push(`◆ +${rewardResult.diamondsGained} diamantes`);
            if (rewardResult.nodeCompleted) rewards.push("🏁 Fichaje completado — siguiente nodo desbloqueado");
            rewardsHtml = rewards.map((r) => `<div class="match-reward-row">${r}</div>`).join("");
        }
    }

    const titleEl = document.createElement("p");
    titleEl.className = "match-final-title";
    titleEl.textContent = `${title} (${state.score.me} - ${state.score.rival})`;
    container.appendChild(titleEl);

    if (rewardsHtml) {
        const rewardsWrap = document.createElement("div");
        rewardsWrap.innerHTML = rewardsHtml;
        container.appendChild(rewardsWrap);
    }

    const backBtn = buildActionButton(backLabel, () => {
        window.location.href = resolveAssetPath(backHref);
    });
    container.appendChild(backBtn);
}

// Con AUTO activo se sigue mostrando la Command Battle actual (zona,
// PE, de quién es el balón — ya en la cabecera) pero sin botones — se
// resuelve sola, sin esperar ningún clic.
function renderAutoStatus(container) {
    if (state.currentOwner === "me") {
        const peLine = document.createElement("p");
        peLine.className = "match-pe";
        peLine.textContent = `PE: ${state.pe} / ${state.peMax}`;
        container.appendChild(peLine);
    }

    const waitingLine = document.createElement("p");
    waitingLine.className = "match-waiting";
    waitingLine.textContent = "AUTO activado — resolviendo...";
    container.appendChild(waitingLine);
}

function renderActions() {
    const container = document.getElementById("match-actions");
    container.innerHTML = "";

    if (isMatchOver(state)) {
        clearAutoTimer();
        const autoBtn = document.getElementById("match-auto-toggle");
        if (autoBtn) autoBtn.hidden = true;
        renderFinal(container);
        return;
    }

    if (autoMode) {
        renderAutoStatus(container);
        return;
    }

    if (state.currentOwner === "rival") {
        renderRivalTurn(container);
        return;
    }

    renderMyTurnActions(container);
}

// Mi alineación de cara al partido, para el lado "Tu equipo" del visor
// — el mismo cálculo de poder que ya usan F5/F11 (suma de
// getCharacterPower de cada titular con su nivel/Despertar/Equipamiento
// reales).
function getMyPrematchPower(lineup) {
    return lineup.reduce((sum, character) => sum + getCharacterPower(character), 0);
}

// ids (con huecos null) -> personajes reales, descartando huecos vacíos
// y cualquier id que ya no exista en el roster.
function resolveLineupFromIds(ids) {
    return ids.filter(Boolean).map((id) => CHARACTERS_DATA.find((c) => c.id === id)).filter(Boolean);
}

// Mis ids (con huecos) para el modo de este partido: el Quinteto
// Principal en 5v5, el Once Principal en 11v11 — misma fuente que ya
// usa getMyLineupCharacters() en match-engine.js, pero sin filtrar los
// huecos vacíos (los necesitamos para poder editarlos aquí mismo).
function getMyLineupIds(mode) {
    return mode === "5v5" ? getQuinteto() : getOnce();
}

// Visor de alineaciones: en vez de mostrar las dos plantillas apiladas
// a la vez, se ve una sola cada vez (más grande, sprites legibles) con
// su poder total arriba y flechas a los lados para alternar entre "Tu
// equipo" y "Rival". Solo "Tu equipo" es editable (editConfig presente
// en sus options) — el rival nunca se puede tocar.
let prematchTeams = [];
let prematchTeamIndex = 0;

function setPrematchTeams(myIds, rivalLineup, rivalPower, rivalOptions, editConfig) {
    const myLineup = resolveLineupFromIds(myIds);
    prematchTeams = [
        { label: "Tu equipo", lineup: myLineup, power: getMyPrematchPower(myLineup), options: { editConfig } },
        { label: "Rival", lineup: rivalLineup, power: rivalPower, options: rivalOptions || {} },
    ];
    prematchTeamIndex = 0;
    renderPrematchSquadViewer();
}

function renderPrematchSquadViewer() {
    const team = prematchTeams[prematchTeamIndex];
    if (!team) return;

    const editConfig = team.options.editConfig;
    // "Tu equipo" se recalcula siempre al vuelo desde el editConfig (en
    // vez de usar team.lineup/team.power, que quedarían desfasados en
    // cuanto se cambia algún puesto desde este mismo visor).
    const ids = editConfig ? editConfig.getIds() : null;
    const lineup = editConfig ? resolveLineupFromIds(ids) : team.lineup;
    const power = editConfig ? getMyPrematchPower(lineup) : team.power;

    document.getElementById("prematch-squad-viewer-label").textContent = team.label;
    document.getElementById("prematch-squad-viewer-power").textContent = Math.round(power).toLocaleString("es-ES");
    updatePrematchFormationRow(editConfig);
    renderPrematchPitch(lineup, ids, team.options);
    fitPrematchPitchCardSize();
    updatePrematchStartAvailability();
}

// Selector de formación — se muestra viendo "Tu equipo" en cualquier
// flujo con formación propia (Fichajes/Historia en 5v5 y 11v11 usan
// las mismas de F5/F11; Desafíos tiene la suya propia por mapa). Las
// opciones se reconstruyen en cada render porque la tabla de
// formaciones puede cambiar entre 5v5 y 11v11 según el modo del
// partido (editConfig.formationsTable).
function updatePrematchFormationRow(editConfig) {
    const row = document.getElementById("prematch-formation-row");
    const select = document.getElementById("prematch-formation-select");
    if (!row || !select) return;

    if (!editConfig || !editConfig.getFormation) {
        row.hidden = true;
        return;
    }

    const formationsTable = editConfig.formationsTable;
    select.innerHTML = "";
    Object.keys(formationsTable).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = formationsTable[key].label;
        select.appendChild(option);
    });
    select.value = editConfig.getFormation();
    select.onchange = () => {
        editConfig.setFormation(select.value);
        renderPrematchSquadViewer();
    };
    row.hidden = false;
}

// "Comenzar partido" se deshabilita si el flujo actual exige un mínimo
// de titulares (editConfig.minSize — solo Desafíos, CHALLENGE_LINEUP_SIZE)
// y "Tu equipo" todavía no lo alcanza, con un aviso de cuántos faltan.
// Fichajes/Historia no tienen mínimo: se puede jugar con la alineación
// incompleta, igual que siempre.
function updatePrematchStartAvailability() {
    const myTeam = prematchTeams[0];
    const btn = document.getElementById("prematch-start-btn");
    const warningEl = document.getElementById("prematch-lineup-warning");
    if (!btn) return;

    const editConfig = myTeam && myTeam.options.editConfig;
    const minSize = editConfig && editConfig.minSize;
    if (!minSize) {
        btn.disabled = false;
        if (warningEl) warningEl.hidden = true;
        return;
    }

    const filled = editConfig.getIds().filter(Boolean).length;
    const complete = filled >= minSize;
    btn.disabled = !complete;
    if (warningEl) {
        warningEl.hidden = complete;
        warningEl.textContent = `Completa tu alineación de ${minSize} para poder jugar (llevas ${filled} / ${minSize}).`;
    }
}

function initPrematchSquadViewer() {
    document.getElementById("prematch-squad-prev").addEventListener("click", () => {
        prematchTeamIndex = (prematchTeamIndex - 1 + prematchTeams.length) % prematchTeams.length;
        renderPrematchSquadViewer();
    });
    document.getElementById("prematch-squad-next").addEventListener("click", () => {
        prematchTeamIndex = (prematchTeamIndex + 1) % prematchTeams.length;
        renderPrematchSquadViewer();
    });
    window.addEventListener("resize", schedulePrematchFit);
}

// Calcula el mayor ancho de carta que cabe en el campo SIN que la
// pantalla tenga que deslizarse, midiendo el espacio real disponible
// (el mismo enfoque que ya usa fitPitchCardSize() en formation.js/
// formation11.js para F5/F11). Las 4 filas (DEL/MED/DEF/POR) siempre
// cuentan para el cálculo de alto, esté cada una ocupada o no —así
// nunca se pasa del alto disponible aunque a un equipo le falte gente
// en algún puesto—; el ancho se calcula por la fila con más jugadores.
function fitPrematchPitchCardSize() {
    const field = document.querySelector(".prematch-pitch-field");
    if (!field) return;
    const allRows = Array.from(document.querySelectorAll(".prematch-pitch-row"));
    const nonEmptyRows = allRows.filter((row) => row.children.length > 0);
    if (!nonEmptyRows.length) return;

    const sampleCard = field.querySelector(".player-card");
    const maxCardsInRow = Math.max(...nonEmptyRows.map((row) => row.children.length));

    // Espacio lateral entre cartas de la misma fila: esta pantalla
    // sirve tanto al modo 5v5 (como mucho 2 por fila, igual que F5) como
    // al 11v11 (hasta 5, igual que F11) según el partido — así que en
    // vez de un gap fijo, se calcula con el mismo criterio de densidad
    // que ya usan esas dos pantallas (mucho más aire cuantas menos
    // cartas comparten fila) en vez de dejar siempre el mismo hueco
    // ajustado pensado para el caso más apretado (11v11).
    const columnGap = maxCardsInRow <= 2 ? 30 : maxCardsInRow === 3 ? 18 : maxCardsInRow === 4 ? 12 : 8;
    document.documentElement.style.setProperty("--prematch-column-gap", columnGap + "px");

    const fieldStyle = getComputedStyle(field);
    const fieldRect = field.getBoundingClientRect();
    const paddingTop = parseFloat(fieldStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(fieldStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(fieldStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(fieldStyle.paddingRight) || 0;
    const rowGap = parseFloat(fieldStyle.rowGap || fieldStyle.gap) || 10;

    // "Chroma" de texto de la carta: alto real menos el ancho actual
    // (el retrato es 1:1, así que el resto del alto es texto/badges).
    let chrome = 41;
    if (sampleCard) {
        const cardRect = sampleCard.getBoundingClientRect();
        if (cardRect.width > 0) chrome = cardRect.height - cardRect.width;
    }

    const availableHeight = fieldRect.height - paddingTop - paddingBottom - (allRows.length - 1) * rowGap;
    const maxWidthByHeight = availableHeight / allRows.length - chrome;

    const availableWidth = fieldRect.width - paddingLeft - paddingRight;
    const maxWidthByWidth = (availableWidth - (maxCardsInRow - 1) * columnGap) / maxCardsInRow;

    const cardWidth = Math.max(48, Math.floor(Math.min(maxWidthByHeight, maxWidthByWidth)));
    document.documentElement.style.setProperty("--prematch-card-width", cardWidth + "px");
}

let prematchFitResizeTimer = null;
function schedulePrematchFit() {
    clearTimeout(prematchFitResizeTimer);
    prematchFitResizeTimer = setTimeout(fitPrematchPitchCardSize, 100);
}

// Pantalla previa (Mapa de Fichajes): muestra la alineación rival REAL
// de ese nodo/modo (el objetivo del nodo + compañeros de su mismo
// equipoOriginal) y el poder total de esa alineación (suma de todos,
// mismo nivel/Despertar fijo del nodo), junto a MI propia alineación
// para ese modo, antes de arrancar el partido de verdad.
// Editar "Tu equipo" desde aquí modifica DIRECTAMENTE el Quinteto/Once
// Principal (los mismos bl_quinteto/bl_once_principal que F5/F11) —
// sin restricción de personaje, igual que esas pantallas. La formación
// (y su selector) también es la MISMA que se ve en F5/F11: cambiarla
// aquí cambia lo que se ve allí, y viceversa.
function buildMyLineupEditConfig(mode) {
    const is5v5 = mode === "5v5";
    return {
        getIds: () => getMyLineupIds(mode),
        setSlot: (slotIndex, characterId) => {
            if (is5v5) setQuintetoSlot(slotIndex, characterId);
            else setOnceSlot(slotIndex, characterId);
        },
        getEligible: () => CHARACTERS_DATA.filter(isCharacterUnlocked),
        getFormation: () => is5v5 ? getFormation5v5Key() : getFormation11v11Key(),
        setFormation: (formationKey) => {
            if (is5v5) setFormation5v5Key(formationKey);
            else setFormation11v11Key(formationKey);
        },
        formationsTable: is5v5 ? FORMATIONS_5V5 : FORMATIONS_11V11,
        formationDefault: is5v5 ? FORMATION_5V5_DEFAULT : FORMATION_11V11_DEFAULT,
    };
}

function renderTransferPreMatch(character) {
    const mode = getTransferMatchMode(MATCH_NUMBER);
    const lineup = getTransferRivalLineup(character, mode);
    const rivalPower = getTransferRivalTeamPower(character, MATCH_NUMBER, mode);
    const rivalLevel = getTransferRivalLevel(character.id, MATCH_NUMBER);

    document.getElementById("prematch-matchup").textContent = `${getPlayerName()} vs ${character.name}`;
    document.getElementById("prematch-mode").textContent = `Modo: ${mode}`;

    const rivalAwakening = getTransferRivalAwakening(character.id);
    setPrematchTeams(getMyLineupIds(mode), lineup, rivalPower, { captainId: character.id, fixedLevel: rivalLevel, fixedAwakening: rivalAwakening }, buildMyLineupEditConfig(mode));
}

// "Equipo Z vs Equipo V" en mapas de equipo; "Desafío ★1 vs Rival
// genérico" en mapas de rareza (rivalTeam viene null — no hay equipo
// rival identificable, ver getChallengeRivalStatsForMatch).
function getChallengeMatchupLabel(mapKey, rivalTeam) {
    const config = getChallengeMapConfig(mapKey);
    const myLabel = config ? config.label : mapKey;
    const rivalLabel = rivalTeam ? `Equipo ${rivalTeam}` : "Rival genérico";
    return `${myLabel} vs ${rivalLabel}`;
}

// Pantalla previa (Desafíos): muestra la alineación rival de ESE
// partido concreto (equipo completo del rival de ese bloque, al
// nivel/Despertar que le toca) y su "Poder del rival" como SUMA de
// todo el equipo (rival.teamPower) — igual que el Mapa de Fichajes.
// "Tu equipo" aquí es la alineación restringida de ese mapa
// (getChallengeLineup), no el Quinteto/Once normal.
function renderChallengePreMatch(mapKey) {
    const rival = getChallengeRivalStatsForMatch(mapKey, MATCH_NUMBER);

    document.getElementById("prematch-matchup").textContent = getChallengeMatchupLabel(mapKey, rival.rivalTeam);
    document.getElementById("prematch-mode").textContent = `Partido ${MATCH_NUMBER} / ${CHALLENGE_MATCHES_PER_MAP} — Nivel rival ${rival.level} (Despertar ${rival.awakening})`;

    // Editar "Tu equipo" aquí modifica la alineación restringida de ESE
    // mapa (bl_challenge_lineup) — solo personajes desbloqueados que
    // cumplan la restricción del mapa (equipo o rareza). Único flujo
    // con formación propia (mismas 3 que F5, una por mapa) y con un
    // mínimo obligatorio de titulares para poder jugar — la edición ya
    // no se hace en pages/challenges/map.html, esta es la única
    // pantalla para tocar la alineación.
    const editConfig = {
        getIds: () => getChallengeLineup(mapKey),
        setSlot: (slotIndex, characterId) => setChallengeLineupSlot(mapKey, slotIndex, characterId),
        getEligible: () => getChallengeEligibleCharacters(mapKey),
        getFormation: () => getChallengeFormationKey(mapKey),
        setFormation: (formationKey) => setChallengeFormationKey(mapKey, formationKey),
        formationsTable: FORMATIONS_5V5,
        formationDefault: FORMATION_5V5_DEFAULT,
        minSize: CHALLENGE_LINEUP_SIZE,
    };

    setPrematchTeams(getChallengeLineup(mapKey), rival.lineup, rival.teamPower, { fixedLevel: rival.level, fixedAwakening: rival.awakening }, editConfig);
}

// Pantalla previa (Historia): rival genérico escalable de ese
// capítulo/partido (sin equipo identificable), más el breve texto
// narrativo de ese partido concreto. "Tu equipo" aquí es el
// Quinteto/Once normal (sin restricción), igual que en Fichajes.
function renderStoryPreMatch(chapterKey) {
    const config = getStoryChapterConfig(chapterKey);
    const rival = getStoryRivalStatsForMatch(chapterKey, MATCH_NUMBER);

    document.getElementById("prematch-matchup").textContent = `${getPlayerName()} vs Rival genérico`;
    document.getElementById("prematch-mode").textContent = `${config.title} — Partido ${MATCH_NUMBER} / ${config.totalMatches} — Modo: ${rival.mode} — Nivel rival ${rival.level} (Despertar ${rival.awakening})`;

    const narrativeEl = document.getElementById("prematch-narrative");
    narrativeEl.textContent = getStoryMatchNarrative(chapterKey, MATCH_NUMBER);
    narrativeEl.hidden = false;

    setPrematchTeams(getMyLineupIds(rival.mode), rival.lineup, rival.teamPower, { fixedLevel: rival.level, fixedAwakening: rival.awakening }, buildMyLineupEditConfig(rival.mode));
}

// Tarjeta de personaje compartida con Jugadores/F5/F11 (foto grande,
// badge de puesto, estrellas de rareza, nombre, nivel). fixedLevel se
// usa para las alineaciones rivales (todo el equipo comparte el mismo
// nivel/Despertar de ese partido); sin ella se muestra el nivel real
// del personaje (mi propia alineación). slotPosition sobreescribe el
// badge cuando la tarjeta ocupa un puesto de formación que no coincide
// con la posición real del personaje (ver renderPrematchPitchWithFormation
// más abajo) — sin ella se muestra siempre la posición real, que es lo
// correcto en cualquier otro contexto (rival, selector de sustitución).
// fixedAwakening: el Despertar fijo del rival de ESE partido concreto
// (viene de options.fixedAwakening — TRANSFER_RIVAL_DATA/challenge/
// story, ver renderPrematchPitchReadOnly) — nunca el que el jugador
// tenga guardado para ese personaje si también lo tiene en su propio
// roster. Sin ella (undefined, "Tu equipo") se usa el Despertar real.
function buildPrematchCardMarkup(character, fixedLevel, fixedAwakening, slotPosition) {
    const level = fixedLevel !== undefined ? fixedLevel : getCharacterLevel(character.id);
    const hasRealSprite = !!character.sprite;
    const spritePath = hasRealSprite ? getCharacterThumbSprite(character) : PLAYER_DETAIL_PLACEHOLDER;
    const position = slotPosition || character.position;
    return `
        <span class="player-card-thumb">
            <img src="${resolveAssetPath(spritePath)}" alt="${character.name}" data-real-sprite="${hasRealSprite}" draggable="false">
            ${buildAwakeningBadgeMarkup(character.id, fixedAwakening)}
            <span class="player-card-position" data-position="${position}">${position}</span>
        </span>
        <span class="player-card-stars">${"★".repeat(character.rarity)}</span>
        <span class="player-card-name">${character.name}</span>
        <span class="player-card-level">Nv. ${level}</span>
    `;
}

// Orden visual de filas (de arriba a abajo), igual que el campo de
// F5/F11: delanteros, mediocentros, defensas, portero.
const PREMATCH_POSITION_ORDER = ["DEL", "MED", "DEF", "POR"];

// slotPosition es el puesto de LA FILA donde se coloca la tarjeta —
// normalmente coincide con la posición real del personaje, salvo en el
// modo con formación (Desafíos) cuando un puesto se rellena de
// respaldo con alguien de otra posición: ahí slotPosition también fija
// el filtro con el que se abre el selector de sustitución (tiene más
// sentido buscar directamente por el puesto que falta cubrir) y el
// badge que se muestra (el del puesto, no el del personaje — ver
// buildPrematchCardMarkup).
function buildEditablePlayerCard(character, slotIndex, slotPosition, editConfig) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "player-card is-editable";
    card.innerHTML = buildPrematchCardMarkup(character, undefined, undefined, slotPosition) + '<span class="edit-pencil">✎</span>';
    attachLongPressPreview(card, character);
    card.addEventListener("click", () => openPrematchSlotPicker(slotIndex, slotPosition, editConfig));
    return card;
}

function buildEditableEmptySlot(slotIndex, defaultPosition, editConfig) {
    const empty = document.createElement("button");
    empty.type = "button";
    empty.className = "prematch-pitch-empty";
    empty.innerHTML = `<span class="prematch-pitch-empty-label">+</span>`;
    empty.addEventListener("click", () => openPrematchSlotPicker(slotIndex, defaultPosition, editConfig));
    return empty;
}

// Rival: siempre de solo lectura, sin huecos "+" ni conteos fijos por
// formación — cada fila muestra a quien de verdad ocupe ese puesto en
// su equipo.
function renderPrematchPitchReadOnly(lineup, options) {
    PREMATCH_POSITION_ORDER.forEach((position) => {
        const row = document.getElementById(`prematch-row-${position}`);
        lineup.filter((member) => member.position === position).forEach((member) => {
            const isCaptain = options.captainId && member.id === options.captainId;
            const card = document.createElement("div");
            card.className = "player-card" + (isCaptain ? " is-captain" : "");
            card.innerHTML = buildPrematchCardMarkup(member, options.fixedLevel, options.fixedAwakening);
            row.appendChild(card);
        });
    });
}

// Qué índice del array de ids ocupa cada puesto visual de cada fila,
// una vez calculado (buildPrematchFormationLayout) — se reutiliza en
// cada renderPrematchPitchWithFormation() mientras la formación
// elegida no cambie, igual que en F5/F11 (ver formationLayout en
// formation.js/formation11.js): así tocar/vaciar un puesto concreto
// solo afecta a ESE puesto y no desplaza a nadie más de su fila. Solo
// se recalcula cuando cambia la formación (updatePrematchFormationRow),
// que es cuando SÍ queremos redistribuir. Alternar entre "Tu equipo" y
// "Rival" no toca la formación, así que no invalida esta caché.
let prematchFormationLayout = null;
let prematchFormationLayoutKey = null;

function buildPrematchFormationLayout(ids, formation) {
    const consumed = new Array(ids.length).fill(false);

    const findMatchingIndex = (position) => {
        for (let i = 0; i < ids.length; i++) {
            if (consumed[i] || !ids[i]) continue;
            const character = CHARACTERS_DATA.find((c) => c.id === ids[i]);
            if (character && character.position === position) return i;
        }
        return -1;
    };
    const findFallbackIndex = () => {
        for (let i = 0; i < ids.length; i++) {
            if (!consumed[i] && !ids[i]) return i;
        }
        for (let i = 0; i < ids.length; i++) {
            if (!consumed[i]) return i;
        }
        return -1;
    };

    const layout = {};
    PREMATCH_POSITION_ORDER.forEach((position) => {
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

// "Tu equipo" editable — mismo algoritmo que F5/F11: cada fila tiene un
// número FIJO de huecos según la formación elegida (editConfig.
// formationsTable/formationDefault — F5/F11 o Desafíos, según el
// flujo). El cálculo de qué índice va en cada puesto
// (buildPrematchFormationLayout) se hace una sola vez por formación y
// se reutiliza (ver prematchFormationLayout arriba); aquí solo se
// recorre ese resultado y se pinta.
function renderPrematchPitchWithFormation(ids, editConfig) {
    const formationsTable = editConfig.formationsTable;
    const formationKey = editConfig.getFormation();
    const formation = formationsTable[formationKey] || formationsTable[editConfig.formationDefault];

    if (!prematchFormationLayout || prematchFormationLayoutKey !== formationKey) {
        prematchFormationLayout = buildPrematchFormationLayout(ids, formation);
        prematchFormationLayoutKey = formationKey;
    }

    PREMATCH_POSITION_ORDER.forEach((position) => {
        const row = document.getElementById(`prematch-row-${position}`);
        prematchFormationLayout[position].forEach((index) => {
            const characterId = ids[index];
            const character = characterId ? CHARACTERS_DATA.find((c) => c.id === characterId) : null;
            row.appendChild(character
                ? buildEditablePlayerCard(character, index, position, editConfig)
                : buildEditableEmptySlot(index, position, editConfig));
        });
    });
}

// Coloca la alineación que se esté viendo sobre el campo, una fila por
// puesto — de solo lectura para el Rival, con formación propia editable
// para "Tu equipo" (ver arriba).
function renderPrematchPitch(lineup, ids, options = {}) {
    const editConfig = options.editConfig;

    PREMATCH_POSITION_ORDER.forEach((position) => {
        document.getElementById(`prematch-row-${position}`).innerHTML = "";
    });

    if (editConfig && ids) {
        renderPrematchPitchWithFormation(ids, editConfig);
    } else {
        renderPrematchPitchReadOnly(lineup, options);
    }

}

// Selector de sustitución de "Tu equipo" — mismo patrón (paginado de 6
// en 6, filtro por posición, opción "Vacío") que ya usan F5/F11, con el
// editConfig del flujo actual (Fichajes/Historia editan el Quinteto/
// Once compartido; Desafíos edita la alineación restringida de ese
// mapa) decidiendo de dónde salen los candidatos y qué se guarda.
const PREMATCH_SLOT_PICKER_PER_PAGE = 8;
let prematchSlotPickerActiveIndex = null;
let prematchSlotPickerEditConfig = null;
let prematchSlotPickerPage = 0;

function openPrematchSlotPicker(slotIndex, defaultPosition, editConfig) {
    const overlay = document.getElementById("slot-picker-overlay");
    const filterSelect = document.getElementById("slot-picker-position-filter");
    if (!overlay || !filterSelect) return;

    prematchSlotPickerActiveIndex = slotIndex;
    prematchSlotPickerEditConfig = editConfig;
    prematchSlotPickerPage = 0;
    filterSelect.value = defaultPosition;
    filterSelect.onchange = () => {
        prematchSlotPickerPage = 0;
        renderPrematchSlotPickerList();
    };

    renderPrematchSlotPickerList();
    overlay.hidden = false;
}

function renderPrematchSlotPickerList() {
    const listContainer = document.getElementById("slot-picker-list");
    const filterSelect = document.getElementById("slot-picker-position-filter");
    const overlay = document.getElementById("slot-picker-overlay");
    const prevBtn = document.getElementById("slot-picker-page-prev");
    const nextBtn = document.getElementById("slot-picker-page-next");
    const indicator = document.getElementById("slot-picker-page-indicator");
    if (!listContainer) return;

    const editConfig = prematchSlotPickerEditConfig;
    const slotIndex = prematchSlotPickerActiveIndex;
    const ids = editConfig.getIds();
    const takenElsewhere = ids.filter((id, i) => id && i !== slotIndex);
    const positionFilter = filterSelect.value;

    const options = editConfig.getEligible()
        .filter((c) => !takenElsewhere.includes(c.id))
        .filter((c) => positionFilter === "all" || c.position === positionFilter);

    const totalPages = Math.max(1, Math.ceil(options.length / PREMATCH_SLOT_PICKER_PER_PAGE));
    prematchSlotPickerPage = Math.min(Math.max(0, prematchSlotPickerPage), totalPages - 1);
    const start = prematchSlotPickerPage * PREMATCH_SLOT_PICKER_PER_PAGE;
    const pageItems = options.slice(start, start + PREMATCH_SLOT_PICKER_PER_PAGE);

    listContainer.innerHTML = "";

    const emptyCard = document.createElement("button");
    emptyCard.type = "button";
    emptyCard.className = "picker-slot-empty";
    emptyCard.innerHTML = `<span class="picker-slot-empty-label">Vacío (sin jugador)</span>`;
    emptyCard.addEventListener("click", () => {
        editConfig.setSlot(slotIndex, null);
        overlay.hidden = true;
        renderPrematchSquadViewer();
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
        card.innerHTML = buildPrematchCardMarkup(character);
        attachLongPressPreview(card, character);
        card.addEventListener("click", () => {
            editConfig.setSlot(slotIndex, character.id);
            overlay.hidden = true;
            renderPrematchSquadViewer();
        });
        listContainer.appendChild(card);
    });

    if (indicator) indicator.textContent = `Página ${prematchSlotPickerPage + 1} de ${totalPages}`;
    if (prevBtn) prevBtn.disabled = prematchSlotPickerPage <= 0;
    if (nextBtn) nextBtn.disabled = prematchSlotPickerPage >= totalPages - 1;
}

function initPrematchSlotPicker() {
    const overlay = document.getElementById("slot-picker-overlay");
    const cancelBtn = document.getElementById("slot-picker-cancel");
    const prevBtn = document.getElementById("slot-picker-page-prev");
    const nextBtn = document.getElementById("slot-picker-page-next");
    if (!overlay || !cancelBtn) return;
    cancelBtn.addEventListener("click", () => {
        overlay.hidden = true;
    });
    if (prevBtn) prevBtn.addEventListener("click", () => {
        prematchSlotPickerPage--;
        renderPrematchSlotPickerList();
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
        prematchSlotPickerPage++;
        renderPrematchSlotPickerList();
    });
}

function initLiveMatchPanel() {
    document.getElementById("prematch-panel").hidden = true;
    document.getElementById("live-match-panel").hidden = false;
    // Suelta el ajuste "sin scroll, altura fija" del panel previo — el
    // partido en vivo no necesita ese encaje y puede deslizarse con
    // normalidad si su contenido no cupiera en pantallas muy bajas.
    document.body.classList.remove("prematch-active");

    autoMode = false;
    clearAutoTimer();
    const autoBtn = document.getElementById("match-auto-toggle");
    autoBtn.hidden = false;
    updateAutoButton();
    autoBtn.addEventListener("click", toggleAutoMode);
}

function startTransferMatch(character) {
    initLiveMatchPanel();
    state = createMatchState(character, MATCH_NUMBER);
    document.getElementById("matchup-line").textContent = `${getPlayerName()} vs ${character.name}`;
    document.getElementById("mode-line").textContent = `Modo: ${state.mode}`;
    renderLivePitchRoster();
    renderHeader();
    renderActions();
}

function startChallengeMatch(mapKey) {
    initLiveMatchPanel();
    state = createChallengeMatchState(mapKey, MATCH_NUMBER);
    document.getElementById("matchup-line").textContent = getChallengeMatchupLabel(mapKey, state.rivalTeam);
    document.getElementById("mode-line").textContent = `Partido ${MATCH_NUMBER} / ${CHALLENGE_MATCHES_PER_MAP}`;
    renderLivePitchRoster();
    renderHeader();
    renderActions();
}

function startStoryMatch(chapterKey) {
    initLiveMatchPanel();
    state = createStoryMatchState(chapterKey, MATCH_NUMBER);
    const config = getStoryChapterConfig(chapterKey);
    document.getElementById("matchup-line").textContent = `${config.title} — Partido ${MATCH_NUMBER}`;
    document.getElementById("mode-line").textContent = `Modo: ${state.mode}`;
    renderLivePitchRoster();
    renderHeader();
    renderActions();
}

document.addEventListener("DOMContentLoaded", () => {
    initPrematchSquadViewer();
    initPrematchSlotPicker();

    if (CHALLENGE_MAP) {
        if (!getChallengeMapConfig(CHALLENGE_MAP)) {
            window.location.href = resolveAssetPath("pages/challenges/index.html");
            return;
        }
        document.getElementById("prematch-back").href = resolveAssetPath(`pages/challenges/map.html?map=${encodeURIComponent(CHALLENGE_MAP)}`);
        renderChallengePreMatch(CHALLENGE_MAP);
        document.getElementById("prematch-start-btn").addEventListener("click", () => startChallengeMatch(CHALLENGE_MAP));
        return;
    }

    if (STORY_CHAPTER) {
        const config = getStoryChapterConfig(STORY_CHAPTER);
        if (!config || config.kind !== "matches" || !isStoryMatchUnlocked(STORY_CHAPTER, MATCH_NUMBER)) {
            window.location.href = resolveAssetPath("pages/story/index.html");
            return;
        }
        document.getElementById("prematch-back").href = resolveAssetPath(`pages/story/chapter.html?chapter=${encodeURIComponent(STORY_CHAPTER)}`);
        renderStoryPreMatch(STORY_CHAPTER);
        document.getElementById("prematch-start-btn").addEventListener("click", () => startStoryMatch(STORY_CHAPTER));
        return;
    }

    const character = CHARACTERS_DATA.find((c) => c.id === CHARACTER_ID);
    if (!character) {
        window.location.href = resolveAssetPath("pages/transfers/index.html");
        return;
    }

    renderTransferPreMatch(character);
    document.getElementById("prematch-start-btn").addEventListener("click", () => startTransferMatch(character));
});
