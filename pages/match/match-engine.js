// Motor de Command Battles: lógica pura, sin DOM. Usa funciones ya
// compartidas de main.js (getQuinteto, getOnce, getCharacterPower,
// getCharacterStatsAtLevel, getEquippedTechniqueId, findTechniqueById)
// para no duplicar cómo se leen el Quinteto/Once o las stats de un
// personaje.

const MATCH_PE_START = 100;
const TECHNIQUE_BONUS_PERCENT = 0.25;
const EARLY_SHOT_PENALTY = 0.5;
// Predicción defensiva: acertar la acción real del rival da +15% a mi
// resultado defensivo, fallarla da -15%.
const DEFENSE_BONUS_PERCENT = 0.15;
// Entrada↔Regate, Interceptación↔Pase, Bloqueo↔Tiro.
const DEFENSE_MATCH = { entrada: "regate", interceptacion: "pase", bloqueo: "tiro" };
// Cada elemento gana al siguiente de la lista, cíclicamente
// (Aire > Montaña > Fuego > Bosque > Aire).
const ELEMENT_CYCLE = ["Aire", "Montaña", "Fuego", "Bosque"];

function doesElementBeat(attacker, defender) {
    const i = ELEMENT_CYCLE.indexOf(attacker);
    if (i === -1) return false;
    const beats = ELEMENT_CYCLE[(i + 1) % ELEMENT_CYCLE.length];
    return beats === defender;
}

// --- Zonas de campo: 5 zonas desde tu portería (1) a la rival (5). El
// balón empieza siempre en la 3 (Centro). Sustituye por completo al
// antiguo sistema de "pasos necesarios según diferencia de poder".
const FIELD_ZONE_MIN = 1;
const FIELD_ZONE_MAX = 5;
const FIELD_ZONE_START = 3;
const FIELD_ZONE_MINE_GOAL = 1;
const FIELD_ZONE_RIVAL_GOAL = 5;

function clampZone(zone) {
    return Math.max(FIELD_ZONE_MIN, Math.min(FIELD_ZONE_MAX, zone));
}

// +1 si el equipo con posesión ataca hacia la zona 5 (soy yo), -1 si
// ataca hacia la zona 1 (el rival).
function getAttackDirection(owner) {
    return owner === "me" ? 1 : -1;
}

// Puesto que defiende una zona ABSOLUTA (1 = junto a mi portería, 5 =
// junto a la rival) para el equipo defendingSide ("me" o "rival"):
// cada equipo defiende con su DEF cerca de SU PROPIA portería, su DEL
// presionando cerca de la portería contraria, y su MED en el centro —
// simétrico para los dos lados, solo mirado desde la portería de cada
// uno (por eso para "rival" se invierte la zona antes de mirar la
// tabla: su portería está en la zona 5 absoluta, no en la 1).
function getDefendingPositionForZone(zone, defendingSide) {
    const ownZone = defendingSide === "me" ? zone : (FIELD_ZONE_MAX + FIELD_ZONE_MIN) - zone;
    if (ownZone <= 2) return "DEF";
    if (ownZone === 3) return "MED";
    return "DEL";
}

// Media de una stat concreta entre los jugadores de lineup que ocupan
// EXACTAMENTE ese puesto (getStatsFn calcula las stats de cada uno, ya
// con su nivel/Despertar/Equipamiento correspondiente); si la
// alineación no tiene ningún jugador de ese puesto, cae a
// fallbackStats (la media de todo el equipo) para no romper el
// partido. Se usa tanto para resolver la Command Battle de verdad como
// para la estimación del modo AUTO — misma cifra en los dos sitios, a
// propósito.
// passiveBonus (opcional): cuánto suman las Pasivas de equipo (Sinergia,
// Mejora individual) a ESE stat en concreto -- ver computePassiveBonusMap
// más abajo. Sin esto, un defensor/portero de un puesto real en la
// alineación se queda con su stat en bruto (getStatsFn = getCharacterStatsAtLevel
// o el equivalente del rival) sin pasar nunca por las pasivas del
// equipo, aunque esas mismas pasivas SÍ suban su stat de ataque
// (fallbackStats, la media ya calculada con pasivas incluidas, solo se
// usa si no hay nadie de ese puesto en la alineación). Por eso antes
// atacar "sacaba mucho" y defender "sacaba poco": el ataque siempre
// pasaba por las pasivas, la defensa nunca.
function getPositionalDefenseStat(lineup, position, statKey, getStatsFn, fallbackStats, passiveBonus) {
    const candidates = lineup.filter((c) => c.position === position);
    if (!candidates.length) return fallbackStats[statKey];
    const total = candidates.reduce((sum, c) => sum + getStatsFn(c)[statKey], 0);
    const bonus = (passiveBonus && passiveBonus[statKey]) || 0;
    return (total / candidates.length) + bonus;
}

// Diferencia, stat por stat, entre las stats de un equipo ANTES y
// DESPUÉS de aplicarle applyMatchStartPassiveEffects -- el bonus PURO
// que aporta el equipo (Sinergia, Mejora individual), para poder
// sumárselo también a la stat defensiva concreta de un puesto (ver
// getPositionalDefenseStat arriba), que si no se calcula en bruto y
// nunca pasa por las pasivas.
function computePassiveBonusMap(baseStats, boostedStats) {
    const bonus = {};
    Object.keys(boostedStats).forEach((key) => {
        bonus[key] = boostedStats[key] - (baseStats[key] || 0);
    });
    return bonus;
}

// Técnica Básica defensiva ("bloqueo" o "parada", según defienda un
// Tiro a puerta o no — ver resolveDefenseChoice) del primer jugador de
// ESE puesto en la alineación, si le llega el PE disponible. A
// diferencia de getAvailableTechnique (mi jugador activo al atacar,
// incluye el hueco equipado desde otro personaje), aquí solo se miran
// las 2 Técnicas Básicas FIJAS del defensor posicional — no hay
// "jugador activo" único al defender (getPositionalDefenseStat ya
// promedia entre varios si hay más de uno en ese puesto).
function getPositionalDefenseTechnique(lineup, position, actionType, peAvailable) {
    const candidate = lineup.find((c) => c.position === position);
    if (!candidate) return null;
    const technique = (candidate.techniques || []).find((t) => t.type === actionType);
    if (!technique) return null;
    if (technique.cost > peAvailable) return null;
    return technique;
}

// Orden ofensivo de puestos, usado por el PASE para decidir si el
// balón avanza (más ofensivo) o retrocede (más defensivo) una zona.
const POSITION_OFFENSIVE_RANK = { POR: 0, DEF: 1, MED: 2, DEL: 3 };

// --- Duración del partido en minutos, no en número fijo de posesiones:
// cada Command Battle sucede en un minuto concreto, que avanza un
// salto aleatorio independiente respecto al anterior. El partido
// termina en cuanto el minuto acumulado alcanza o supera el límite (90
// en 11v11, 30 en 5v5) — el último salto se recorta exactamente a ese
// límite en vez de pasarse.
const MATCH_MINUTES_11V11 = 90;
const MATCH_MINUTES_5V5 = 30;
const MATCH_MINUTE_JUMP_11V11 = { min: 10, max: 25 };
const MATCH_MINUTE_JUMP_5V5 = { min: 4, max: 10 };

function getMatchMinuteLimit(mode) {
    return mode === "11v11" ? MATCH_MINUTES_11V11 : MATCH_MINUTES_5V5;
}

function rollMinuteJump(mode) {
    const range = mode === "11v11" ? MATCH_MINUTE_JUMP_11V11 : MATCH_MINUTE_JUMP_5V5;
    return range.min + Math.random() * (range.max - range.min);
}

// Avanza el reloj antes de resolver la siguiente Command Battle,
// recortando al límite exacto si el salto se pasaría de él.
function advanceMatchMinute(state) {
    state.currentMinute = Math.min(state.matchMinuteLimit, state.currentMinute + rollMinuteJump(state.mode));
}

// Mi alineación activa para el modo del partido: el Quinteto Principal
// para 5v5, o el Once Principal (compartido entre todas las
// formaciones 11v11) para 11v11. Los huecos vacíos se descartan.
function getMyLineupCharacters(mode) {
    const ids = mode === "5v5" ? getQuinteto() : getOnce();
    return ids
        .filter((id) => id)
        .map((id) => CHARACTERS_DATA.find((c) => c.id === id))
        .filter(Boolean);
}

// El jugador "activo" (empieza siendo el primero de la alineación)
// aporta el elemento y las técnicas equipadas que determinan qué
// Command Battles pueden llevar bonus de Ego — sin él (alineación
// vacía) no hay ni elemento ni técnicas disponibles. Cambia de manos
// cada vez que se gana un PASE (ver resolvePlayerChoice).
function getInitialActivePlayer(lineup) {
    return lineup.length ? lineup[0] : null;
}

// A quién le pasa el balón el jugador activo tras ganar un PASE: el
// pase SIEMPRE va hacia adelante o al mismo rango, nunca hacia atrás
// (un MED no le pasa a un DEF, un DEL solo le pasa a otro DEL —
// POSITION_OFFENSIVE_RANK: POR<DEF<MED<DEL). Entre esos compañeros
// "hacia adelante", se prioriza el (o los, si hay empate) de rango más
// cercano al suyo propio, en vez de cualquiera al azar — así el balón
// circula de forma natural puesto a puesto. Si nadie de la alineación
// tiene rango igual o mayor (alineación anómala, p. ej. solo porteros
// aparte de él), se cae a cualquier compañero para no romper el
// partido. Si solo hay uno en la alineación, se queda con el balón.
function pickNextActivePlayer(lineup, currentId) {
    if (lineup.length <= 1) return lineup[0] || null;
    const currentPlayer = lineup.find((c) => c.id === currentId);
    const currentRank = currentPlayer ? (POSITION_OFFENSIVE_RANK[currentPlayer.position] ?? 1) : 1;

    const others = lineup.filter((c) => c.id !== currentId);
    const forwardCandidates = others.filter((c) => (POSITION_OFFENSIVE_RANK[c.position] ?? 1) >= currentRank);
    const candidates = forwardCandidates.length ? forwardCandidates : others;

    const rankDiff = (c) => Math.abs((POSITION_OFFENSIVE_RANK[c.position] ?? 1) - currentRank);
    const closestDiff = Math.min(...candidates.map(rankDiff));
    const closestCandidates = candidates.filter((c) => rankDiff(c) === closestDiff);

    return closestCandidates[Math.floor(Math.random() * closestCandidates.length)];
}

// Media de las 4 stats de la alineación activa — se sigue usando para
// el lado que ATACA (mi Regate/Pase/Tiro, o el Regate/Pase/Tiro del
// rival cuando me toca defender). Con la alineación vacía se usa una
// base mínima para que el partido no se rompa, aunque no debería
// llegarse a esa situación en el uso normal.
function getMyAverageStats(lineup) {
    if (!lineup.length) return { tiro: 1, tecnica: 1, defensa: 1, parada: 1 };
    const totals = { tiro: 0, tecnica: 0, defensa: 0, parada: 0 };
    lineup.forEach((character) => {
        const stats = getCharacterStatsAtLevel(character);
        totals.tiro += stats.tiro || 0;
        totals.tecnica += stats.tecnica || 0;
        totals.defensa += stats.defensa || 0;
        totals.parada += stats.parada || 0;
    });
    return {
        tiro: totals.tiro / lineup.length,
        tecnica: totals.tecnica / lineup.length,
        defensa: totals.defensa / lineup.length,
        parada: totals.parada / lineup.length,
    };
}

// Aplica un bloque de effects (matchStart) de UNA pasiva a la media del
// equipo (myStats) — ABSOLUTO sobre la media, no por-jugador, porque
// las Command Battles siempre comparan medias de equipo, nunca stats
// individuales sueltas. requiresTeammateId (p. ej. "Hermanos Wanima")
// solo se activa si ese compañero concreto también está en la
// alineación; requiresTeamCount (Sinergia de Equipo) solo si hay al
// menos ese número de compañeros con ese equipoOriginal — el bonus
// vale para TODA la alineación, no solo para los de ese equipo, por
// eso sigue sumando sobre la misma myStats compartida. El guard
// `!effect.stats` ignora limpiamente efectos de otro tipo (el aura
// elemental de Supertécnica, ver computeElementTechniqueBonus) si
// alguna vez se recorre la misma lista de effects sin querer.
function applyPassiveEffectList(myStats, lineup, effects, multiplier) {
    effects.forEach((effect) => {
        if (effect.trigger !== "matchStart") return;
        if (!effect.stats) return;
        if (effect.requiresTeammateId && !lineup.some((c) => c.id === effect.requiresTeammateId)) return;
        if (effect.requiresTeamCount) {
            const count = lineup.filter((c) => c.equipoOriginal === effect.requiresTeamCount.equipoOriginal).length;
            if (count < effect.requiresTeamCount.min) return;
        }
        const amount = effect.baseAmount * multiplier;
        effect.stats.forEach((statKey) => {
            myStats[statKey] = (myStats[statKey] || 0) + amount;
        });
    });
}

// Aplica los efectos "al empezar el partido" de TODAS las pasivas de
// cada titular de una alineación — la MÍA o la del RIVAL (Mapa de
// Fichajes/Desafíos/Historia también tienen pasivas reales, ver los
// createXMatchState más abajo), por eso el nivel/Despertar de cada
// personaje no se leen aquí con getCharacterLevel/getCharacterAwakening
// directamente sino a través de getLevel/getAwakening — para mi
// alineación son esas mismas funciones (mi progreso real), para la
// rival son su nivel/Despertar fijo de ese nodo/mapa/capítulo (nunca mi
// progreso). Dos fuentes, con reglas distintas:
//  - character.passives (pasivas normales propias, tipo "Mejora de
//    Tiro"): bloqueada del todo hasta que el NIVEL del personaje
//    alcanza su unlockLevel (getGenericAbilityLevel, mismo cálculo por
//    índice que usa la ficha para pintarlas — ver main.js), y desde
//    ahí escala un +20% de su bonus base por cada nivel adicional
//    (getOwnPassiveLevelMultiplier).
//  - character.uniquePassive: bloqueada del todo en Despertar 0, y
//    desde Despertar 1 su bonus escala un +10% por cada nivel adicional
//    (Despertar 1 = 100% del base, Despertar 10 = 190%).
function applyMatchStartPassiveEffects(teamStats, lineup, getLevel, getAwakening) {
    lineup.forEach((character) => {
        const characterLevel = getLevel(character);
        (character.passives || []).forEach((passive, index) => {
            const level = getGenericAbilityLevel(characterLevel, index);
            if (level < 1) return;
            applyPassiveEffectList(teamStats, lineup, passive.effects, getOwnPassiveLevelMultiplier(level));
        });

        const awakening = getAwakening(character);
        if (awakening < 1) return;
        const uniqueEffects = character.uniquePassive && character.uniquePassive.effects;
        if (!uniqueEffects) return;
        const multiplier = 1 + 0.10 * (awakening - 1);
        applyPassiveEffectList(teamStats, lineup, uniqueEffects, multiplier);
    });
}

// Aura de equipo de las pasivas "Mejora Supertécnicas [Elemento]": a
// diferencia de applyPassiveEffectList (que suma directo a las stats),
// este bonus no se aplica a ninguna stat de forma fija — sube la
// potencia de la Supertécnica de CUALQUIER compañero de ese elemento
// cuando la usa de verdad (ver resolvePlayerChoice para mi lado,
// resolveDefenseChoice para el del rival), así que se calcula aparte
// como un mapa por elemento y se consulta ahí en cada Command Battle.
// getLevel: igual que en applyMatchStartPassiveEffects, mi progreso
// real o el nivel fijo del rival según de qué alineación se trate. A
// diferencia del resto de pasivas propias, esta NO pasa por el
// desbloqueo por hueco (getGenericAbilityLevel) — nunca está bloqueada
// del todo, activa desde el Nivel 1 del propio personaje — pero SÍ sube
// de nivel 1-10 en los mismos escalones que le tocarían al hueco en el
// que esté (getElementAuraLevel, en main.js: hueco 0 → Nv.10,30,50,70...
// de personaje, hueco 1 → Nv.20,40,60,80...), del que escala +25 de
// base, +5 por cada nivel del aura (Nv.1 = +25, Nv.2 = +30... Nv.10 =
// +70 como mucho). Si varios personajes de la alineación llevan el aura
// del mismo elemento, sus bonus se SUMAN.
function computeElementTechniqueBonus(lineup, getLevel) {
    const bonus = { Bosque: 0, Fuego: 0, "Montaña": 0, Aire: 0 };
    lineup.forEach((character) => {
        const characterLevel = getLevel(character);
        (character.passives || []).forEach((passive, index) => {
            (passive.effects || []).forEach((effect) => {
                if (effect.kind !== "elementTechniqueAura") return;
                const auraLevel = getElementAuraLevel(characterLevel, index);
                bonus[effect.element] = (bonus[effect.element] || 0) + effect.baseAmount + effect.perLevelAmount * (auraLevel - 1);
            });
        });
    });
    return bonus;
}

function smallVariance(range) {
    return (Math.random() * 2 - 1) * range;
}

// Resuelve una Command Battle. myStat/rivalStat ya son el valor base
// (Técnica, Tiro, Defensa o Parada según corresponda). techniqueBonus
// es el % ya decidido por quien llama (0 si no se usa técnica).
// penaltyMultiplier es 0.5 solo para el Tiro intentado antes de tiempo.
function resolveCommandBattle({ myStat, rivalStat, myElement, rivalElement, techniqueBonus, penaltyMultiplier, reliabilityBonus }) {
    const elementalMultiplier = doesElementBeat(myElement, rivalElement) ? 1.15 : 1;
    const reliabilityMultiplier = 1 + (reliabilityBonus || 0);
    let myResult = myStat * (1 + (techniqueBonus || 0)) * elementalMultiplier * reliabilityMultiplier;
    myResult *= penaltyMultiplier || 1;
    myResult += smallVariance(myStat * 0.1);

    const rivalResult = rivalStat + smallVariance(rivalStat * 0.1);

    return { myResult: Math.round(myResult), rivalResult: Math.round(rivalResult), won: myResult > rivalResult };
}

// Qué intenta el rival en esta Command Battle de su posesión: Regate o
// Pase (al azar) mientras el balón no esté en su zona de tiro (junto a
// MI portería, zona 1), Tiro en cuanto llega ahí — nunca se revela
// antes de que el jugador elija su predicción defensiva.
function decideRivalAction(state) {
    if (state.zone === FIELD_ZONE_MINE_GOAL) return "tiro";
    return Math.random() < 0.5 ? "regate" : "pase";
}

function createMatchState(character, matchNumber) {
    const mode = getTransferMatchMode(matchNumber);
    const lineup = getMyLineupCharacters(mode);
    const myStats = getMyAverageStats(lineup);
    const myBaseStats = { ...myStats };
    applyMatchStartPassiveEffects(myStats, lineup, (c) => getCharacterLevel(c.id), (c) => getCharacterAwakening(c.id));
    const myPassiveBonus = computePassiveBonusMap(myBaseStats, myStats);
    const elementTechniqueBonus = computeElementTechniqueBonus(lineup, (c) => getCharacterLevel(c.id));
    const activePlayer = getInitialActivePlayer(lineup);
    // El rival del Mapa de Fichajes tiene nivel/Despertar FIJOS por
    // nodo y partido (ver TRANSFER_RIVAL_DATA en main.js) — nunca la
    // media/nivel de mi propio equipo. rivalLineup (todo su equipo,
    // real, no solo el objetivo del nodo) es lo que permite elegir un
    // defensor por puesto según la zona del balón, y también lo que
    // cuentan sus propias pasivas (Sinergia de Equipo, aura elemental)
    // — con el MISMO nivel/Despertar fijo del nodo para todos, nunca mi
    // progreso real de esos personajes.
    const rivalStats = getTransferRivalStatsAtLevel(character, matchNumber);
    const rivalBaseStats = { ...rivalStats };
    const rivalLineup = getTransferRivalLineup(character, mode);
    const getRivalLevel = () => getTransferRivalLevel(character.id, matchNumber);
    const getRivalAwakening = () => getTransferRivalAwakening(character.id);
    applyMatchStartPassiveEffects(rivalStats, rivalLineup, getRivalLevel, getRivalAwakening);
    const rivalPassiveBonus = computePassiveBonusMap(rivalBaseStats, rivalStats);
    const rivalElementTechniqueBonus = computeElementTechniqueBonus(rivalLineup, getRivalLevel);

    return {
        character,
        matchNumber,
        mode,
        lineup,
        rivalLineup,
        // Stats de un compañero cualquiera del equipo rival, al mismo
        // nivel/Despertar fijo del nodo (igual que rivalStats arriba).
        getRivalCharacterStats: (c) => getTransferRivalStatsAtLevel(c, matchNumber, character.id),
        matchMinuteLimit: getMatchMinuteLimit(mode),
        currentMinute: 0,
        currentOwner: Math.random() < 0.5 ? "me" : "rival",
        zone: FIELD_ZONE_START,
        score: { me: 0, rival: 0 },
        pe: MATCH_PE_START,
        peMax: MATCH_PE_START,
        myStats,
        myPassiveBonus,
        elementTechniqueBonus,
        rivalStats,
        rivalPassiveBonus,
        rivalElementTechniqueBonus,
        activePlayer,
        isOver: false,
    };
}

// Partido de Desafíos: siempre 5v5, mi alineación es la restringida al
// mapa (getChallengeLineup — por equipoOriginal o por rareza según el
// mapa), el rival es un equipo completo (no un personaje único)
// resuelto por getChallengeRivalStatsForMatch — sus stats agregadas ya
// vienen medias entre su alineación de hasta 5, y rivalLineup permite
// elegir un defensor concreto por puesto según la zona del balón (ver
// getPositionalDefenseStat). "state.character" (usado por
// resolveCommandBattle/resolveDefenseChoice solo para leer .element
// del rival) se fija al primer miembro de esa alineación rival, igual
// de simplificado que en el Mapa de Fichajes (el rival no rota de
// elemento a media Command Battle, es fijo todo el partido).
function createChallengeMatchState(mapKey, matchNumber) {
    const lineupIds = getChallengeLineup(mapKey).filter(Boolean);
    const lineup = lineupIds.map((id) => CHARACTERS_DATA.find((c) => c.id === id)).filter(Boolean);
    const myStats = getMyAverageStats(lineup);
    const myBaseStats = { ...myStats };
    applyMatchStartPassiveEffects(myStats, lineup, (c) => getCharacterLevel(c.id), (c) => getCharacterAwakening(c.id));
    const myPassiveBonus = computePassiveBonusMap(myBaseStats, myStats);
    const elementTechniqueBonus = computeElementTechniqueBonus(lineup, (c) => getCharacterLevel(c.id));
    const activePlayer = getInitialActivePlayer(lineup);

    const rival = getChallengeRivalStatsForMatch(mapKey, matchNumber);
    const rivalStats = rival.stats;
    const rivalBaseStats = { ...rivalStats };
    const getRivalLevel = () => rival.level;
    const getRivalAwakening = () => rival.awakening;
    applyMatchStartPassiveEffects(rivalStats, rival.lineup, getRivalLevel, getRivalAwakening);
    const rivalPassiveBonus = computePassiveBonusMap(rivalBaseStats, rivalStats);
    const rivalElementTechniqueBonus = computeElementTechniqueBonus(rival.lineup, getRivalLevel);

    return {
        mapKey,
        rivalTeam: rival.rivalTeam,
        rivalLineup: rival.lineup,
        getRivalCharacterStats: (c) => getStatsAtLevelAwakening(c, rival.level, rival.awakening),
        character: rival.lineup[0] || { element: null },
        matchNumber,
        mode: "5v5",
        lineup,
        matchMinuteLimit: getMatchMinuteLimit("5v5"),
        currentMinute: 0,
        currentOwner: Math.random() < 0.5 ? "me" : "rival",
        zone: FIELD_ZONE_START,
        score: { me: 0, rival: 0 },
        pe: MATCH_PE_START,
        peMax: MATCH_PE_START,
        myStats,
        myPassiveBonus,
        elementTechniqueBonus,
        rivalStats,
        rivalPassiveBonus,
        rivalElementTechniqueBonus,
        activePlayer,
        isOver: false,
    };
}

// Partido de Historia: mi alineación es la normal (Quinteto/Once, según
// el modo que le toque a ese partido — igual que en el Mapa de
// Fichajes, no la restringida de Desafíos), el rival es un equipo
// genérico escalable (getStoryRivalStatsForMatch, sin equipoOriginal
// concreto) al nivel/Despertar fijos de ese capítulo/partido.
// "state.character" se fija al primer miembro de esa alineación rival,
// igual de simplificado que en Desafíos.
function createStoryMatchState(chapterKey, matchNumber) {
    const rival = getStoryRivalStatsForMatch(chapterKey, matchNumber);
    const lineup = getMyLineupCharacters(rival.mode);
    const myStats = getMyAverageStats(lineup);
    const myBaseStats = { ...myStats };
    applyMatchStartPassiveEffects(myStats, lineup, (c) => getCharacterLevel(c.id), (c) => getCharacterAwakening(c.id));
    const myPassiveBonus = computePassiveBonusMap(myBaseStats, myStats);
    const elementTechniqueBonus = computeElementTechniqueBonus(lineup, (c) => getCharacterLevel(c.id));
    const activePlayer = getInitialActivePlayer(lineup);

    const rivalStats = rival.stats;
    const rivalBaseStats = { ...rivalStats };
    const getRivalLevel = () => rival.level;
    const getRivalAwakening = () => rival.awakening;
    applyMatchStartPassiveEffects(rivalStats, rival.lineup, getRivalLevel, getRivalAwakening);
    const rivalPassiveBonus = computePassiveBonusMap(rivalBaseStats, rivalStats);
    const rivalElementTechniqueBonus = computeElementTechniqueBonus(rival.lineup, getRivalLevel);

    return {
        chapterKey,
        rivalLineup: rival.lineup,
        getRivalCharacterStats: (c) => getStatsAtLevelAwakening(c, rival.level, rival.awakening),
        character: rival.lineup[0] || { element: null },
        matchNumber,
        mode: rival.mode,
        lineup,
        matchMinuteLimit: getMatchMinuteLimit(rival.mode),
        currentMinute: 0,
        currentOwner: Math.random() < 0.5 ? "me" : "rival",
        zone: FIELD_ZONE_START,
        score: { me: 0, rival: 0 },
        pe: MATCH_PE_START,
        peMax: MATCH_PE_START,
        myStats,
        myPassiveBonus,
        elementTechniqueBonus,
        rivalStats,
        rivalPassiveBonus,
        rivalElementTechniqueBonus,
        activePlayer,
        isOver: false,
    };
}

// Técnica del jugador activo que corresponde a una acción concreta
// (regate, pase o tiro), si tiene una equipada de ese tipo y le llega
// el PE.
function getAvailableTechnique(state, actionType) {
    if (!state.activePlayer) return null;
    const equippedId = getEquippedTechniqueId(state.activePlayer.id);
    const candidates = [...state.activePlayer.techniques];
    if (equippedId) {
        const found = findTechniqueById(equippedId);
        if (found) candidates.push(found.technique);
    }
    const match = candidates.find((t) => t.type === actionType);
    if (!match) return null;
    if (match.cost > state.pe) return null;
    return match;
}

// action: "regate" | "pase" | "tiro". useTechnique: true para gastar
// PE y aplicar el bonus de la técnica disponible para esa acción. El
// reloj NO avanza mientras se encadenan Regate/Pase exitosos dentro de
// la misma posesión — solo salta (ver advanceMatchMinute) cuando esta
// termina (gol o pérdida de balón), justo antes de que empiece la
// posesión del rival.
function resolvePlayerChoice(state, action, useTechnique) {
    let technique = null;
    if (useTechnique) {
        technique = getAvailableTechnique(state, action === "tiro" ? "tiro" : action);
        if (technique) state.pe -= technique.cost;
    }
    const techniqueBonus = technique ? TECHNIQUE_BONUS_PERCENT : 0;
    // Cada Técnica tiene su PROPIO elemento (characters-data.js), que no
    // tiene por qué coincidir con el del jugador que la lleva. Si se usa
    // de verdad (technique truthy — PE pagado), ese elemento manda tanto
    // para la ventaja elemental (doesElementBeat, abajo) como para el
    // aura "Mejora Supertécnicas [Elemento]" (solo cuenta cuando hay
    // Técnica real de por medio, ver computeElementTechniqueBonus, ya
    // sumado por equipo). Sin Técnica, se usa el elemento propio del
    // jugador (acción básica, sin nada equipado de por medio).
    const activeElement = technique ? technique.element : (state.activePlayer ? state.activePlayer.element : null);
    const auraBonus = technique ? (state.elementTechniqueBonus[technique.element] || 0) : 0;

    let result;
    let outcome; // "advance" | "goal" | "turnover" | "miss"

    if (action === "regate" || action === "pase") {
        // Regate/Pase SIEMPRE los defiende el puesto de campo que
        // corresponda a la zona actual (nunca el portero — el portero
        // solo entra en juego en un Tiro con el balón en su propia
        // área, ver más abajo).
        const defendingPosition = getDefendingPositionForZone(state.zone, "rival");
        const rivalDefenseStat = getPositionalDefenseStat(state.rivalLineup, defendingPosition, "defensa", state.getRivalCharacterStats, state.rivalStats, state.rivalPassiveBonus);

        result = resolveCommandBattle({
            myStat: state.myStats.tecnica + auraBonus,
            rivalStat: rivalDefenseStat,
            myElement: activeElement,
            rivalElement: state.character.element,
            techniqueBonus,
            penaltyMultiplier: 1,
            reliabilityBonus: action === "pase" ? 0.05 : 0,
        });
        if (result.won) {
            outcome = "advance";
            const direction = getAttackDirection(state.currentOwner); // "me" siempre aquí, pero se deja explícito
            if (action === "regate") {
                // Regate exitoso: 1 zona hacia la portería contraria,
                // sin importar quién lleve el balón.
                state.zone = clampZone(state.zone + direction);
            } else if (state.activePlayer) {
                // Pase exitoso: el balón pasa a otro jugador (siempre
                // hacia adelante o al mismo rango, ver
                // pickNextActivePlayer) y SIEMPRE avanza 1 zona hacia la
                // portería contraria, igual que el Regate.
                state.activePlayer = pickNextActivePlayer(state.lineup, state.activePlayer.id);
                state.zone = clampZone(state.zone + direction);
            }
        } else {
            outcome = "turnover";
        }
    } else {
        // Tiro: solo tiene la probabilidad alta (sin penalización) si
        // el balón está en la Zona 5 (junto a la portería rival) —
        // desde cualquier otra zona es un tiro prematuro penalizado.
        // Con el balón "a puerta" de verdad defiende el portero
        // (Parada); si no, defiende el puesto de esa zona con su
        // Defensa, como un despeje improvisado.
        const onTime = state.zone === FIELD_ZONE_RIVAL_GOAL;
        const defendingPosition = onTime ? "POR" : getDefendingPositionForZone(state.zone, "rival");
        const defenseStatKey = onTime ? "parada" : "defensa";
        const rivalDefenseStat = getPositionalDefenseStat(state.rivalLineup, defendingPosition, defenseStatKey, state.getRivalCharacterStats, state.rivalStats, state.rivalPassiveBonus);

        result = resolveCommandBattle({
            myStat: state.myStats.tiro + auraBonus,
            rivalStat: rivalDefenseStat,
            myElement: activeElement,
            rivalElement: state.character.element,
            techniqueBonus,
            penaltyMultiplier: onTime ? 1 : EARLY_SHOT_PENALTY,
        });
        if (result.won) {
            state.score.me += 1;
            outcome = "goal";
        } else {
            outcome = "miss";
        }
    }

    const possessionEnded = outcome !== "advance";
    if (possessionEnded) {
        advanceMatchMinute(state);
        state.currentOwner = "rival";
        // Al perder la posesión (turnover/miss) el balón se queda en la
        // misma zona — el rival ataca en dirección contraria desde ahí.
        // Tras un gol, kickoff: el balón vuelve al centro.
        if (outcome === "goal") state.zone = FIELD_ZONE_START;
    }

    return { action, technique, outcome, result, possessionEnded };
}

// defenseChoice: "entrada" | "interceptacion" | "bloqueo", elegido SIN
// conocer la acción real del rival (se decide aquí mismo, al resolver).
// Acertar el emparejamiento (ver DEFENSE_MATCH) da +15% a mi resultado
// defensivo; fallarlo da -15%. Reutiliza resolveCommandBattle poniendo
// mi lado defensivo en "myStat" (así "won" ya significa "defendí
// bien") y el bonus/penalización de predicción como penaltyMultiplier.
// useTechnique: true para gastar PE en la Técnica Básica defensiva
// ("Bloqueo" o "Parada", según el puesto que le toque a esta zona) del
// jugador de ese puesto, si tiene una y me llega el PE — mismo +25% que
// ya daba usar una Técnica al atacar (antes esto nunca pasaba: defender
// siempre iba sin bonus de Técnica, aunque el personaje tuviera una).
// El reloj NO avanza mientras el rival encadena Regate/Pase exitosos
// dentro de la misma posesión — solo salta (ver advanceMatchMinute)
// cuando esta termina (gol rival, interceptado o bloqueado), justo
// antes de que empiece mi posesión.
function resolveDefenseChoice(state, defenseChoice, useTechnique) {
    const rivalAction = decideRivalAction(state);
    const predictionCorrect = DEFENSE_MATCH[defenseChoice] === rivalAction;

    // decideRivalAction solo elige "tiro" con el balón ya en zona 1
    // (junto a mi portería), así que un tiro rival siempre es "a
    // puerta" — lo defiende mi portero. Regate/Pase los defiende el
    // puesto de campo de la zona actual.
    const facingShot = rivalAction === "tiro";
    const myDefendingPosition = facingShot ? "POR" : getDefendingPositionForZone(state.zone, "me");
    const myDefenseStatKey = facingShot ? "parada" : "defensa";
    const defenseStat = getPositionalDefenseStat(state.lineup, myDefendingPosition, myDefenseStatKey, getCharacterStatsAtLevel, state.myStats, state.myPassiveBonus);

    let technique = null;
    if (useTechnique) {
        technique = getPositionalDefenseTechnique(state.lineup, myDefendingPosition, facingShot ? "parada" : "bloqueo", state.pe);
        if (technique) state.pe -= technique.cost;
    }
    const techniqueBonus = technique ? TECHNIQUE_BONUS_PERCENT : 0;

    const attackStat = rivalAction === "tiro" ? state.rivalStats.tiro : state.rivalStats.tecnica;
    // El rival no elige/paga una Técnica concreta como yo (no tiene PE
    // ni selección de acción) — su aura "Mejora Supertécnicas
    // [Elemento]" (ver computeElementTechniqueBonus) se aplica siempre
    // según SU elemento de identidad (state.character.element, el mismo
    // que ya se usa para la ventaja elemental de abajo), no por técnica.
    const rivalAuraBonus = state.rivalElementTechniqueBonus ? (state.rivalElementTechniqueBonus[state.character.element] || 0) : 0;

    const result = resolveCommandBattle({
        myStat: defenseStat,
        rivalStat: attackStat + rivalAuraBonus,
        myElement: state.activePlayer ? state.activePlayer.element : null,
        rivalElement: state.character.element,
        techniqueBonus,
        penaltyMultiplier: predictionCorrect ? 1 + DEFENSE_BONUS_PERCENT : 1 - DEFENSE_BONUS_PERCENT,
    });

    const defended = result.won;
    let outcome; // "intercepted" | "rivalAdvance" | "blocked" | "rivalGoal"

    if (rivalAction === "tiro") {
        if (defended) {
            outcome = "blocked";
        } else {
            state.score.rival += 1;
            outcome = "rivalGoal";
        }
    } else {
        if (defended) {
            outcome = "intercepted";
        } else {
            // El rival no tiene jugadores individuales rastreados (su
            // lado es agregado), así que su avance —por Regate o por
            // Pase— siempre mueve 1 zona hacia mi portería; no hay
            // forma de aplicar la regla de "más/menos ofensivo" del
            // Pase sin un jugador rival concreto al que comparar.
            state.zone = clampZone(state.zone + getAttackDirection("rival"));
            outcome = "rivalAdvance";
        }
    }

    const possessionEnded = outcome !== "rivalAdvance";
    if (possessionEnded) {
        advanceMatchMinute(state);
        state.currentOwner = "me";
        if (outcome === "rivalGoal") state.zone = FIELD_ZONE_START;
        // En bloqueo/interceptado, el balón se queda en la misma zona
        // — ahora ataco yo en dirección contraria desde ahí.
    }

    return { defenseChoice, rivalAction, predictionCorrect, technique, outcome, result, possessionEnded };
}

// --- Modo AUTO: decide por el jugador con la misma lógica de zonas
// que ya usa la UI manual (recomendar Tiro solo con el balón en la
// zona de tiro), sin ninguna ventaja de información extra.

// Regate/Pase mientras el balón no está en zona de tiro (al azar entre
// los dos, igual que decideRivalAction decide para el rival), Tiro en
// cuanto llega a la zona 5.
function decideAutoAttackAction(state) {
    if (state.zone === FIELD_ZONE_RIVAL_GOAL) return "tiro";
    return Math.random() < 0.5 ? "regate" : "pase";
}

// Resultado ESPERADO (sin el margen aleatorio de resolveCommandBattle,
// que promedia 0) de mi lado si NO se usa técnica, para decidir si
// hace falta gastar PE — no es una trampa porque no mira el resultado
// real (con su aleatoriedad) de la Command Battle, solo la comparación
// de stats base que el jugador también podría estimar a ojo (incluida
// qué puesto rival defiende esta zona, información ya visible en
// pantalla).
function wouldWinWithoutTechnique(state, action) {
    const onTime = state.zone === FIELD_ZONE_RIVAL_GOAL;
    const myStat = action === "tiro" ? state.myStats.tiro : state.myStats.tecnica;
    const defendingPosition = (action === "tiro" && onTime) ? "POR" : getDefendingPositionForZone(state.zone, "rival");
    const defenseStatKey = (action === "tiro" && onTime) ? "parada" : "defensa";
    const rivalStat = getPositionalDefenseStat(state.rivalLineup, defendingPosition, defenseStatKey, state.getRivalCharacterStats, state.rivalStats, state.rivalPassiveBonus);
    const myElement = state.activePlayer ? state.activePlayer.element : null;
    const elementalMultiplier = doesElementBeat(myElement, state.character.element) ? 1.15 : 1;
    const reliabilityMultiplier = action === "pase" ? 1.05 : 1;
    const penaltyMultiplier = (action === "tiro" && !onTime) ? EARLY_SHOT_PENALTY : 1;
    const expectedMyResult = myStat * elementalMultiplier * reliabilityMultiplier * penaltyMultiplier;
    return expectedMyResult >= rivalStat;
}

// Solo gasta PE en técnica si sin ella se perdería el duelo (y hay
// técnica disponible con PE suficiente — getAvailableTechnique ya lo
// comprueba).
function decideAutoUseTechnique(state, action) {
    if (wouldWinWithoutTechnique(state, action)) return false;
    return !!getAvailableTechnique(state, action);
}

// Predicción defensiva a ciegas: al azar entre las 3 opciones, sin
// conocer la acción real del rival (decideRivalAction se decide más
// tarde, dentro de resolveDefenseChoice, exactamente igual que en el
// modo manual).
function decideAutoDefenseChoice() {
    const options = ["entrada", "interceptacion", "bloqueo"];
    return options[Math.floor(Math.random() * options.length)];
}

// Igual que wouldWinWithoutTechnique pero para mi lado defensivo: si mi
// stat (con la ventaja elemental que le toque) ya gana sin gastar PE,
// no hace falta usar la Técnica defensiva. facingShot se puede saber de
// antemano (decideRivalAction siempre da "tiro" con el balón en la
// Zona 1, nunca al azar en ese caso), igual que ya sabe la UI manual.
function wouldDefendWithoutTechnique(state) {
    const facingShot = state.zone === FIELD_ZONE_MINE_GOAL;
    const myDefendingPosition = facingShot ? "POR" : getDefendingPositionForZone(state.zone, "me");
    const myDefenseStatKey = facingShot ? "parada" : "defensa";
    const defenseStat = getPositionalDefenseStat(state.lineup, myDefendingPosition, myDefenseStatKey, getCharacterStatsAtLevel, state.myStats, state.myPassiveBonus);
    const attackStat = facingShot ? state.rivalStats.tiro : state.rivalStats.tecnica;
    const rivalAuraBonus = state.rivalElementTechniqueBonus ? (state.rivalElementTechniqueBonus[state.character.element] || 0) : 0;
    const myElement = state.activePlayer ? state.activePlayer.element : null;
    const elementalMultiplier = doesElementBeat(myElement, state.character.element) ? 1.15 : 1;
    return defenseStat * elementalMultiplier >= attackStat + rivalAuraBonus;
}

// Solo gasta PE en Técnica defensiva si sin ella se perdería el duelo
// (mismo criterio que decideAutoUseTechnique para atacar).
function decideAutoUseDefenseTechnique(state) {
    if (wouldDefendWithoutTechnique(state)) return false;
    const facingShot = state.zone === FIELD_ZONE_MINE_GOAL;
    const myDefendingPosition = facingShot ? "POR" : getDefendingPositionForZone(state.zone, "me");
    return !!getPositionalDefenseTechnique(state.lineup, myDefendingPosition, facingShot ? "parada" : "bloqueo", state.pe);
}

function isMatchOver(state) {
    return state.currentMinute >= state.matchMinuteLimit;
}

// Empate incluido a propósito: si el marcador queda igualado al
// terminar las posesiones, se acepta como resultado final, sin
// desempate.
function getWinner(state) {
    if (state.score.me > state.score.rival) return "me";
    if (state.score.rival > state.score.me) return "rival";
    return "draw";
}
