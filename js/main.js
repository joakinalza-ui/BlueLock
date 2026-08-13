const PLAYER_NAME_KEY = "bl_player_name";
const PLAYER_NAME_DEFAULT = "Entrenador";
const PLAYER_NAME_MAX_LENGTH = 8;

function getPlayerName() {
    const stored = localStorage.getItem(PLAYER_NAME_KEY);
    return stored && stored.trim() ? stored : PLAYER_NAME_DEFAULT;
}

function setPlayerName(rawName) {
    const clean = rawName.trim().slice(0, PLAYER_NAME_MAX_LENGTH);
    const finalName = clean || PLAYER_NAME_DEFAULT;
    localStorage.setItem(PLAYER_NAME_KEY, finalName);
    return finalName;
}

const HOME_CHARACTER_KEY = "bl_home_character";
const HOME_CHARACTER_DEFAULT = "isagi";

// Encuadre por defecto del sprite grande de la Home (object-position):
// prioriza la cabeza/parte superior del personaje, recortando el resto
// según haga falta. Cada entrada de CHARACTER_ROSTER puede sobrescribirlo
// con su propio "homeImagePosition" si un sprite concreto queda mal así.
const HOME_IMAGE_POSITION_DEFAULT = "top center";

// Escalado sutil del sprite grande de la Home según la altura real del
// personaje (alturaCm, characters-data.js): 180cm es la referencia
// "neutra" (escala 1x), y el resultado se limita a [0.9x, 1.1x] para
// que la diferencia se note sin desproporcionar el layout ni desbordar
// el marco fijo del sprite.
const HOME_SPRITE_HEIGHT_REFERENCE_CM = 180;
const HOME_SPRITE_HEIGHT_SCALE_MIN = 0.9;
const HOME_SPRITE_HEIGHT_SCALE_MAX = 1.1;
const HOME_SPRITE_HEIGHT_DEFAULT_CM = 175;

// Roster único de personajes desbloqueados. Se usa tanto para elegir el
// protagonista de la Home (Menú > Personaje de la Home) como para la
// pantalla de Equipo (Jugadores/Colección). Solo incluye personajes con
// arte real ya generado — se añaden más entradas aquí a medida que haya
// arte nuevo, no huecos "bloqueados" de relleno.
const CHARACTER_ROSTER = [
    {
        id: "isagi",
        name: "Isagi Yoichi",
        sprite: "assets/characters/sprites/Z/isagi-sprite.webp",
        position: "DEL",
        rarity: 5,
    },
    {
        id: "bachira",
        name: "Bachira Meguru",
        sprite: "assets/characters/sprites/Z/bachira-sprite.webp",
        position: "DEL",
        rarity: 5,
    },
    {
        id: "kuon",
        name: "Wataru Kuon",
        sprite: "assets/characters/sprites/Z/kuon-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "imamura",
        name: "Yudai Imamura",
        sprite: "assets/characters/sprites/Z/imamura-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "kunigami",
        name: "Kunigami Rensuke",
        sprite: "assets/characters/sprites/Z/kunigami-sprite.webp",
        position: "DEL",
        rarity: 3,
    },
    {
        id: "iemon",
        name: "Iemon Naoyuki",
        sprite: "assets/characters/sprites/Z/iemon-sprite.webp",
        position: "POR",
        rarity: 2,
    },
    {
        id: "naruhaya",
        name: "Asahi Naruhaya",
        sprite: "assets/characters/sprites/Z/naruhaya-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "raichi",
        name: "Jingo Raichi",
        sprite: "assets/characters/sprites/Z/raichi-sprite.webp",
        position: "DEF",
        rarity: 2,
    },
    {
        id: "igaguri",
        name: "Gurimu Igarashi",
        sprite: "assets/characters/sprites/Z/igaguri-sprite.webp",
        position: "DEF",
        rarity: 2,
    },
    {
        id: "hijikata",
        name: "Kisaburo Hijikata",
        sprite: "assets/characters/sprites/V/hijikata-sprite.webp",
        position: "POR",
        rarity: 1,
    },
    {
        id: "shishiya",
        name: "Kei Shishiya",
        sprite: "assets/characters/sprites/W/shisiya-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "eiyu",
        name: "Tsukoteru Eiyu",
        sprite: "assets/characters/sprites/X/eiyu-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "atatame",
        name: "Masumi Atatame",
        sprite: "assets/characters/sprites/V/atatame-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "amazora",
        name: "Yusei Amazora",
        sprite: "assets/characters/sprites/W/amazora-sprite.webp",
        position: "DEL",
        rarity: 1,
    },
    {
        id: "barou",
        name: "Shoei Barou",
        sprite: "assets/characters/sprites/X/barou-sprite.webp",
        position: "DEL",
        rarity: 3,
    },
    {
        id: "tokimitsu",
        name: "Aoshi Tokimitsu",
        sprite: "assets/characters/sprites/sin-equipo/tokimitsu-sprite.webp",
        position: "MED",
        rarity: 3,
    },
    {
        id: "sanga",
        name: "Rian Sanga",
        sprite: "assets/characters/sprites/X/sanga-sprite.webp",
        position: "DEL",
        rarity: 1,
    },
    {
        id: "meiji",
        name: "Haato Meiji",
        sprite: "assets/characters/sprites/X/meji-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "nerima",
        name: "Retsu Nerima",
        sprite: "assets/characters/sprites/V/nerima-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "kira",
        name: "Kira Ryosuke",
        sprite: "assets/characters/sprites/sin-equipo/kira-sprite.webp",
        position: "DEL",
        rarity: 2,
    },
    {
        id: "okawa",
        name: "Hibiki Ookawa",
        sprite: "assets/characters/sprites/Y/okawa-sprite.webp",
        position: "DEL",
        rarity: 2,
    },
    {
        id: "reo",
        name: "Reo Mikage",
        sprite: "assets/characters/sprites/V/reo-sprite.webp",
        position: "MED",
        rarity: 3,
    },
    {
        id: "rin",
        name: "Rin Itoshi",
        sprite: "assets/characters/sprites/sin-equipo/rin-sprite.webp",
        position: "DEL",
        rarity: 3,
    },
    {
        id: "zantetsu",
        name: "Zantetsu Tsurugi",
        sprite: "assets/characters/sprites/V/zantetsu-sprite.webp",
        position: "DEF",
        rarity: 3,
    },
    {
        id: "niko",
        name: "Ikki Niko",
        sprite: "assets/characters/sprites/Y/niko-sprite.webp",
        position: "MED",
        rarity: 3,
    },
    {
        id: "keisuke",
        name: "Keisuke Wanima",
        sprite: "assets/characters/sprites/W/keisuke-sprite.webp",
        position: "DEL",
        rarity: 2,
    },
    {
        id: "junichi",
        name: "Junichi Wanima",
        sprite: "assets/characters/sprites/W/junichi-sprite.webp",
        position: "DEL",
        rarity: 2,
    },
    {
        id: "chigiri",
        name: "Chigiri Hyoma",
        sprite: "assets/characters/sprites/Z/chigiri-sprite.webp",
        position: "DEF",
        rarity: 3,
    },
    {
        id: "nagi",
        name: "Nagi Seishiro",
        sprite: "assets/characters/sprites/V/nagi-sprite.webp",
        position: "DEL",
        rarity: 3,
    },
    {
        id: "aryu",
        name: "Aryu Jyubei",
        sprite: "assets/characters/sprites/sin-equipo/aryu-sprite.webp",
        position: "DEF",
        rarity: 3,
    },
    {
        id: "ebina",
        name: "Shuhei Ebina",
        sprite: "assets/characters/sprites/V/ebina-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "nemoto",
        name: "Sota Nemoto",
        sprite: "assets/characters/sprites/V/nemoto-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "daido",
        name: "Burai Daido",
        sprite: "assets/characters/sprites/X/daido-sprite.webp",
        position: "DEL",
        rarity: 1,
    },
    {
        id: "gagamaru",
        name: "Gagamaru Gin",
        sprite: "assets/characters/sprites/Z/gagamaru-sprite.webp",
        position: "DEL",
        rarity: 2,
    },
    {
        id: "midorikawa",
        name: "Hirakazu Midorikawa",
        sprite: "assets/characters/sprites/V/Midorikawa-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "torikai",
        name: "Kanji Torikai",
        sprite: "assets/characters/sprites/V/torikai-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "hohai",
        name: "Rikiya Hohai",
        sprite: "assets/characters/sprites/V/hohai-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "fuwa",
        name: "Raito Fuwa",
        sprite: "assets/characters/sprites/W/fuwa-sprite.webp",
        position: "POR",
        rarity: 1,
    },
    {
        id: "mera",
        name: "Koki Mera",
        sprite: "assets/characters/sprites/W/mera-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "tokita",
        name: "Kai Tokita",
        sprite: "assets/characters/sprites/W/tokita-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "koshinaka",
        name: "Yujin Koshinaka",
        sprite: "assets/characters/sprites/W/koshinaka-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "isezaki",
        name: "Takuma Isezaki",
        sprite: "assets/characters/sprites/W/isezaki-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "jigen",
        name: "Noboru Jigen",
        sprite: "assets/characters/sprites/W/jigen-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "munakata",
        name: "Hiromu Munakata",
        sprite: "assets/characters/sprites/W/munakata-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "dokomo",
        name: "Yuza Dokomo",
        sprite: "assets/characters/sprites/X/dokomo-sprite.webp",
        position: "POR",
        rarity: 1,
    },
    {
        id: "banku",
        name: "Yawara Banku",
        sprite: "assets/characters/sprites/X/banku-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "morinaga",
        name: "Daiya Morinaga",
        sprite: "assets/characters/sprites/X/morinaga-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "ezaki",
        name: "Chihiro Ezaki",
        sprite: "assets/characters/sprites/X/ezaki-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "otsuka",
        name: "Kosei Otsuka",
        sprite: "assets/characters/sprites/X/otsuka-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "kora",
        name: "Buruto Kora",
        sprite: "assets/characters/sprites/X/kora-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "ito",
        name: "Juraki Ito",
        sprite: "assets/characters/sprites/Y/ito-sprite.webp",
        position: "POR",
        rarity: 1,
    },
    {
        id: "suzuki",
        name: "Ashime Suzuki",
        sprite: "assets/characters/sprites/Y/zuzuki-sprite.webp",
        position: "DEL",
        rarity: 1,
    },
    {
        id: "madoka",
        name: "Tobio Madoka",
        sprite: "assets/characters/sprites/Y/madoka-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "konan",
        name: "Shinichi Konan",
        sprite: "assets/characters/sprites/Y/shinichi-sprite.webp",
        position: "DEF",
        rarity: 1,
    },
    {
        id: "sato",
        name: "Iori Sato",
        sprite: "assets/characters/sprites/Y/sato-sprite.webp",
        position: "POR",
        rarity: 1,
    },
    {
        id: "kagura",
        name: "Soshi Kagura",
        sprite: "assets/characters/sprites/Y/kagura-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "rokkaku",
        name: "Fuma Rokkaku",
        sprite: "assets/characters/sprites/Y/rokaku-sprite.webp",
        position: "MED",
        rarity: 1,
    },
    {
        id: "takeyama",
        name: "Mareto Takeyama",
        sprite: "assets/characters/sprites/Y/takeyama-sprite.webp",
        position: "DEL",
        rarity: 1,
    },
    {
        id: "koshiba",
        name: "Hyuga Koshiba",
        sprite: "assets/characters/sprites/Y/koshiba-sprite.webp",
        position: "DEL",
        rarity: 1,
    },
];

// Quinteto Principal: hasta 5 ids de personaje, guardados en orden fijo
// de slot (null = hueco vacío). Empieza vacío: nadie entra al Quinteto
// hasta que se elige explícitamente desde la Colección.
const QUINTETO_KEY = "bl_quinteto";
const QUINTETO_SIZE = 5;

function getQuinteto() {
    let stored;
    try {
        stored = JSON.parse(localStorage.getItem(QUINTETO_KEY));
    } catch (e) {
        stored = null;
    }
    if (!Array.isArray(stored)) {
        stored = [];
    }
    const normalized = stored
        .slice(0, QUINTETO_SIZE)
        .map((id) => (typeof id === "string" && id ? id : null));
    while (normalized.length < QUINTETO_SIZE) normalized.push(null);
    return normalized;
}

function setQuintetoSlot(slotIndex, characterId) {
    const quinteto = getQuinteto();
    quinteto[slotIndex] = characterId;
    localStorage.setItem(QUINTETO_KEY, JSON.stringify(quinteto));
}

function isInQuinteto(characterId) {
    return getQuinteto().includes(characterId);
}

// El nivel pertenece al SLOT (posición 1-5 del Quinteto), no al
// personaje: quien ocupe un slot usa y muestra el nivel de ESE slot
// mientras lo ocupe, y al salir no se lleva nada — el siguiente en
// entrar hereda el nivel ya presente en el slot. Todos los slots
// empiezan en nivel 1, existan o no huecos ocupados todavía.
const QUINTETO_SLOT_LEVELS_KEY = "bl_quinteto_slot_levels";

function getQuintetoSlotLevels() {
    let stored;
    try {
        stored = JSON.parse(localStorage.getItem(QUINTETO_SLOT_LEVELS_KEY));
    } catch (e) {
        stored = null;
    }
    if (!Array.isArray(stored)) {
        stored = [];
    }
    const normalized = stored
        .slice(0, QUINTETO_SIZE)
        .map((v) => (typeof v === "number" && v > 0 ? v : 1));
    while (normalized.length < QUINTETO_SIZE) normalized.push(1);
    return normalized;
}

function getSlotLevel(slotIndex) {
    return getQuintetoSlotLevels()[slotIndex];
}

function setSlotLevel(slotIndex, level) {
    const levels = getQuintetoSlotLevels();
    const previousLevel = levels[slotIndex];
    levels[slotIndex] = level;
    localStorage.setItem(QUINTETO_SLOT_LEVELS_KEY, JSON.stringify(levels));

    // Progreso de la misión diaria "Sube de nivel a 1 jugador": se
    // engancha aquí (el único sitio del código que de verdad sube un
    // nivel) para que cualquier futuro sistema de entrenamiento que
    // llame a setSlotLevel la complete solo, sin tocar este archivo otra vez.
    if (level > previousLevel) {
        setMissionProgress("levelUp", 1);
    }
}

// Nivel base del equipo: el más bajo de los 5 slots (existan o no
// huecos ocupados en ellos ahora mismo).
function getQuintetoBaseLevel() {
    return Math.min(...getQuintetoSlotLevels());
}

// Ningún slot puede quedar más de QUINTETO_LEVEL_GAP_MAX niveles por
// encima del slot más bajo de los 5 — obliga a nivelar parejo antes de
// poder seguir subiendo al que va más adelantado.
const QUINTETO_LEVEL_GAP_MAX = 10;

// Nivel efectivo de un personaje: si ocupa un slot del Quinteto ahora
// mismo, el nivel de ESE slot; si no, el nivel base del equipo (el
// slot más bajo de los 5), igual que ya se mostraba antes.
function getCharacterLevel(characterId) {
    const slotIndex = getQuinteto().indexOf(characterId);
    if (slotIndex !== -1) return getSlotLevel(slotIndex);
    return getQuintetoBaseLevel();
}

// Poder de un personaje en su nivel actual: interpolación lineal entre
// la suma de sus 4 stats en nivel 1 (statsLevel1) y en nivel 100
// (statsLevel100), los únicos dos puntos que guarda characters-data.js.
function sumStats(stats) {
    return Object.values(stats).reduce((total, value) => total + value, 0);
}

// Despertar: hasta 10 niveles, cuesta Esencias del propio personaje
// (las que ya da el gacha al sacar un duplicado — bl_essences). El
// coste de cada nivel depende de la rareza; el índice del array es el
// despertar ACTUAL (0 = de 0 a 1, 1 = de 1 a 2, ...). Desde el nivel 1
// desbloquea/sube de nivel la Habilidad Única (bloqueada del todo en
// despertar 0).
const AWAKENING_MAX = 10;

// Cada nivel de Despertar sube +4% de stats, plano — los 10 niveles
// completos suman +40% en total (el máximo).
const AWAKENING_STAT_BONUS_PER_LEVEL = 0.04;

function getAwakeningStatBonus(awakeningLevel) {
    const level = Math.max(0, Math.min(AWAKENING_MAX, awakeningLevel));
    return level * AWAKENING_STAT_BONUS_PER_LEVEL;
}
const AWAKENING_COST_BY_RARITY = {
    1: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12],
    3: [1, 1, 1, 1, 1, 1, 1, 1, 2, 3],
};
const AWAKENING_KEY = "bl_character_awakening";

// Color por nivel de Despertar (0-10), compartido por el badge que se
// muestra en TODAS las cartas de jugador de la app (Colección, Quinteto,
// F5, F11, selectores de sustitución, pantallas previas al partido) —
// un color distinto por nivel en vez de por tramos, para que se note el
// progreso nivel a nivel. bg = fondo de la pastilla, text = color del
// número (siempre el tono oscuro de la misma familia, nunca negro
// plano, para que se lea bien encima del fondo de color).
const AWAKENING_BADGE_COLORS = [
    { bg: "#9CA3AF", text: "#1f2430" },
    { bg: "#6EE7B7", text: "#064e3b" },
    { bg: "#34D399", text: "#064e3b" },
    { bg: "#22D3EE", text: "#083344" },
    { bg: "#38BDF8", text: "#03293f" },
    { bg: "#818CF8", text: "#1e1b4b" },
    { bg: "#A78BFA", text: "#2e1065" },
    { bg: "#E879F9", text: "#4a044e" },
    { bg: "#FB7185", text: "#4c0519" },
    { bg: "#D97706", text: "#2a1400" },
    { bg: "#FACC15", text: "#3a2e00" },
];

function getAwakeningBadgeColors(awakeningLevel) {
    const index = Math.max(0, Math.min(AWAKENING_MAX, awakeningLevel));
    return AWAKENING_BADGE_COLORS[index];
}

// Pastilla de Despertar de una carta de jugador — misma marca en
// Colección, Quinteto, F5, F11, selectores de sustitución y pantallas
// previas al partido (ver AWAKENING_BADGE_COLORS arriba). overrideLevel
// es para las cartas de RIVAL en la pantalla previa al partido: su
// Despertar es fijo por nodo/partido (TRANSFER_RIVAL_DATA, etc.), NO el
// que tenga guardado el jugador para ese mismo personaje si también lo
// tiene en su roster — sin overrideLevel se usa siempre el propio
// (getCharacterAwakening), que es el caso normal en el resto de sitios.
function buildAwakeningBadgeMarkup(characterId, overrideLevel) {
    const level = overrideLevel !== undefined ? overrideLevel : getCharacterAwakening(characterId);
    const colors = getAwakeningBadgeColors(level);
    return `<span class="player-card-awakening" style="background:${colors.bg};color:${colors.text}">${level}</span>`;
}

function getCharacterAwakenings() {
    try {
        const parsed = JSON.parse(localStorage.getItem(AWAKENING_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getCharacterAwakening(characterId) {
    return getCharacterAwakenings()[characterId] || 0;
}

function setCharacterAwakening(characterId, level) {
    const all = getCharacterAwakenings();
    all[characterId] = level;
    localStorage.setItem(AWAKENING_KEY, JSON.stringify(all));
}

// Coste en Esencias para pasar del despertar actual al siguiente, o
// null si ya está al máximo.
function getAwakeningCost(rarity, currentAwakening) {
    const table = AWAKENING_COST_BY_RARITY[rarity];
    if (!table || currentAwakening >= table.length) return null;
    return table[currentAwakening];
}

function getAwakeningStatMultiplier(characterId) {
    return 1 + getAwakeningStatBonus(getCharacterAwakening(characterId));
}

function getEssenceBalance(characterId) {
    return getEssences()[characterId] || 0;
}

function spendEssence(characterId, amount) {
    const essences = getEssences();
    const current = essences[characterId] || 0;
    if (current < amount) return false;
    essences[characterId] = current - amount;
    localStorage.setItem(ESSENCES_KEY, JSON.stringify(essences));
    return true;
}

// Mapa de Fichajes: 6 personajes exclusivos (gachaExcluded:true en
// characters-data.js — no salen ni en el gacha ni en la Tienda de
// Puntos), cada uno con su propio nodo de 11 partidos secuenciales.
// El progreso es solo "victorias acumuladas" por personaje — no hay
// derrotas que registrar todavía (el "partido" real aún no existe).
const TRANSFER_NODES = [
    "sota-nemoto",
    "soshi-kagura",
    "burai-daido",
    "raito-fuwa",
    "gurimu-igarashi",
    "iemon-naoyuki",
];
const TRANSFER_NODE_MATCHES = 11;
const TRANSFER_WIN_DIAMONDS = 50;
const TRANSFER_PROGRESS_KEY = "bl_transfer_progress";

function getAllTransferProgress() {
    try {
        const parsed = JSON.parse(localStorage.getItem(TRANSFER_PROGRESS_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getTransferProgress(characterId) {
    return getAllTransferProgress()[characterId] || 0;
}

function setTransferProgress(characterId, wins) {
    const all = getAllTransferProgress();
    all[characterId] = wins;
    localStorage.setItem(TRANSFER_PROGRESS_KEY, JSON.stringify(all));
}

// El nodo 1 (índice 0) siempre está desbloqueado; cada nodo siguiente
// se desbloquea al completar las 11 victorias del anterior.
function isTransferNodeUnlocked(nodeIndex) {
    if (nodeIndex === 0) return true;
    const previousId = TRANSFER_NODES[nodeIndex - 1];
    return getTransferProgress(previousId) >= TRANSFER_NODE_MATCHES;
}

// Progreso global del Mapa de Fichajes (todos los nodos), usado en la
// tarjeta de Jugar: suma de victorias de los 6 nodos sobre el total
// posible (6 × 11), redondeado a un entero de porcentaje.
function getTransferOverallProgressPercent() {
    const totalWins = TRANSFER_NODES.reduce((sum, id) => sum + getTransferProgress(id), 0);
    const totalPossible = TRANSFER_NODES.length * TRANSFER_NODE_MATCHES;
    return Math.round((totalWins / totalPossible) * 100);
}

function isTransferNodeCompleted(characterId) {
    return getTransferProgress(characterId) >= TRANSFER_NODE_MATCHES;
}

// El modo alterna partido a partido dentro de un mismo nodo, empezando
// y terminando en 11v11 (partidos impares = 11v11, pares = 5v5; con
// 11 partidos totales el primero y el último son siempre 11v11).
function getTransferMatchMode(matchNumber) {
    return matchNumber % 2 === 1 ? "11v11" : "5v5";
}

// Nivel y Despertar del rival de cada nodo: FIJOS y predefinidos, no
// dependen en absoluto del progreso del jugador. El nivel sube de
// forma lineal entre partido 1 y el 11 (TRANSFER_NODE_MATCHES) de ese
// nodo; el Despertar se queda fijo durante todo el nodo.
// Subido (antes 5-78 de nivel, Despertar 1-6 — muy por debajo de
// LEVEL_MAX=200 y AWAKENING_MAX=10, dejaba el mapa entero fácil de
// sobra) para que el último nodo llegue cerca del tope de verdad.
const TRANSFER_RIVAL_DATA = {
    "sota-nemoto": { levelStart: 10, levelEnd: 25, awakening: 2 },
    "soshi-kagura": { levelStart: 25, levelEnd: 45, awakening: 3 },
    "burai-daido": { levelStart: 45, levelEnd: 70, awakening: 5 },
    "raito-fuwa": { levelStart: 70, levelEnd: 100, awakening: 6 },
    "gurimu-igarashi": { levelStart: 100, levelEnd: 140, awakening: 8 },
    "iemon-naoyuki": { levelStart: 140, levelEnd: 180, awakening: 10 },
};

function getTransferRivalLevel(characterId, matchNumber) {
    const data = TRANSFER_RIVAL_DATA[characterId];
    if (!data) return 1;
    const t = (matchNumber - 1) / (TRANSFER_NODE_MATCHES - 1);
    return Math.round(data.levelStart + (data.levelEnd - data.levelStart) * t);
}

function getTransferRivalAwakening(characterId) {
    const data = TRANSFER_RIVAL_DATA[characterId];
    return data ? data.awakening : 0;
}

// Igual que getCharacterStatsAtLevel, pero con el nivel/Despertar fijos
// de la tabla de arriba en vez de los del propio jugador — el rival es
// siempre el mismo en cada partido concreto, nunca escala con tu
// Quinteto ni con tu progreso real de ese personaje. Sin bonus de
// Equipamiento tampoco: eso es tuyo, no del rival.
// nodeCharacterId: de qué nodo se saca el nivel/Despertar fijo — por
// defecto el propio character.id (el uso normal, cuando "character" ES
// el objetivo del nodo), pero se puede pasar aparte para calcular las
// stats de un COMPAÑERO de su equipo rival con el mismo nivel/Despertar
// del nodo (ver getTransferRivalLineup).
// Delega en getStatsAtLevelAwakening (misma función que usan los
// rivales de Desafíos) para que ambos sistemas queden garantizados a
// usar EXACTAMENTE el mismo cálculo — antes tenían la misma fórmula
// copiada dos veces, con riesgo real de desincronizarse si una de las
// dos copias cambiaba sin la otra.
function getTransferRivalStatsAtLevel(character, matchNumber, nodeCharacterId) {
    const level = getTransferRivalLevel(nodeCharacterId || character.id, matchNumber);
    const awakening = getTransferRivalAwakening(nodeCharacterId || character.id);
    return getStatsAtLevelAwakening(character, level, awakening);
}

function getTransferRivalPower(character, matchNumber, nodeCharacterId) {
    return sumStats(getTransferRivalStatsAtLevel(character, matchNumber, nodeCharacterId));
}

// Equipo rival completo de un nodo: todos los personajes que comparten
// el mismo equipoOriginal que el objetivo, con el propio objetivo
// primero (capitán/protagonista de la alineación).
function getTransferRivalTeamMembers(targetCharacter) {
    const teammates = CHARACTERS_DATA.filter((c) => c.id !== targetCharacter.id && c.equipoOriginal === targetCharacter.equipoOriginal);
    return [targetCharacter, ...teammates];
}

// Distribución ideal para una alineación 5v5: 1 POR + 2 DEF + 1 MED +
// 1 DEL. El objetivo del nodo ya ocupa una de esas plazas según su
// propio puesto; el resto se rellena con compañeros de equipo por
// puesto, y si a algún puesto le faltan candidatos, con quien quede.
const TRANSFER_RIVAL_5V5_POSITION_TARGETS = { POR: 1, DEF: 2, MED: 1, DEL: 1 };

function pickTransferRival5v5Lineup(targetCharacter, teammates) {
    const remaining = { ...TRANSFER_RIVAL_5V5_POSITION_TARGETS };
    remaining[targetCharacter.position] = Math.max(0, (remaining[targetCharacter.position] || 0) - 1);

    const pool = teammates.slice();
    const selected = [targetCharacter];

    ["POR", "DEF", "MED", "DEL"].forEach((position) => {
        let need = remaining[position] || 0;
        while (need > 0) {
            const idx = pool.findIndex((c) => c.position === position);
            if (idx === -1) break;
            selected.push(pool.splice(idx, 1)[0]);
            need--;
        }
    });

    while (selected.length < 5 && pool.length) {
        selected.push(pool.shift());
    }

    return selected;
}

// Alineación rival real para un partido concreto: el equipo completo
// (11) en partidos 11v11, o 5 (objetivo + distribución de puestos) en
// partidos 5v5.
function getTransferRivalLineup(targetCharacter, mode) {
    const fullTeam = getTransferRivalTeamMembers(targetCharacter);
    if (mode === "11v11") return fullTeam;
    return pickTransferRival5v5Lineup(targetCharacter, fullTeam.slice(1));
}

// Poder total del rival de ese partido: suma del poder de TODOS los
// jugadores de su alineación (no solo el objetivo del nodo), todos al
// mismo nivel/Despertar fijo de ese nodo/partido.
function getTransferRivalTeamPower(targetCharacter, matchNumber, mode) {
    const lineup = getTransferRivalLineup(targetCharacter, mode);
    return lineup.reduce((sum, member) => sum + getTransferRivalPower(member, matchNumber, targetCharacter.id), 0);
}

// Aplica las recompensas de ganar el siguiente partido pendiente de
// ese nodo (no hace falta pasar el número: se calcula solo a partir
// del progreso guardado). 1ª victoria = desbloquea al personaje;
// victorias 2ª-11ª = dan exactamente las Esencias de la tabla de
// Despertar para ese paso (así completar el nodo entero siempre deja
// al personaje en Despertar 10 justo). Todas dan 50 diamantes fijos.
function applyTransferMatchWin(characterId) {
    const character = CHARACTERS_DATA.find((c) => c.id === characterId);
    if (!character) return null;

    const wins = getTransferProgress(characterId);
    if (wins >= TRANSFER_NODE_MATCHES) return null;

    const matchNumber = wins + 1;
    setTransferProgress(characterId, matchNumber);
    setDiamonds(getDiamonds() + TRANSFER_WIN_DIAMONDS);

    let unlocked = false;
    let essenceGained = 0;
    if (matchNumber === 1) {
        unlockCharacter(characterId);
        unlocked = true;
    } else {
        const costTable = AWAKENING_COST_BY_RARITY[character.rarity] || [];
        essenceGained = costTable[matchNumber - 2] || 0;
        if (essenceGained) addEssence(characterId, essenceGained);
    }

    return {
        matchNumber,
        unlocked,
        essenceGained,
        diamondsGained: TRANSFER_WIN_DIAMONDS,
        nodeCompleted: matchNumber === TRANSFER_NODE_MATCHES,
    };
}

// --- Desafíos: 8 mapas independientes en total — 5 por equipo original
// de la Primera Selección (Z/V/W/X/Y) y 3 por rareza (★1/★2/★3). Cada
// mapa tiene 20 partidos 5v5 fijos, con el nivel del rival subiendo
// linealmente de 5 a 60 a lo largo de los 20 y el Despertar fijo por
// bloque de 5 (1/2/4/6).
//
// La alineación del jugador está restringida según el TIPO de mapa (ver
// CHALLENGE_MAPS/getChallengeEligibleCharacters): solo ese equipoOriginal
// en los de equipo, solo esa rareza en los de rareza.
//
// El rival es distinto según el tipo: en los de equipo, cada bloque de 5
// partidos se enfrenta a uno de los otros 4 equipos completos (todos sus
// miembros, desbloqueados o no — igual que el rival del Mapa de
// Fichajes). En los de rareza NO hay restricción de equipo ni de rareza
// para el rival — es un rival genérico sacado de characters-data.js
// entero, con la misma distribución de puestos, sin rotar de identidad
// por bloque (no hay "otro equipo" al que rotar).
const CHALLENGE_TEAMS = ["Z", "V", "W", "X", "Y"];
const CHALLENGE_MAPS = [
    { key: "Z", kind: "team", label: "Equipo Z" },
    { key: "V", kind: "team", label: "Equipo V" },
    { key: "W", kind: "team", label: "Equipo W" },
    { key: "X", kind: "team", label: "Equipo X" },
    { key: "Y", kind: "team", label: "Equipo Y" },
    { key: "star1", kind: "rarity", label: "Desafío ★1", rarity: 1 },
    { key: "star2", kind: "rarity", label: "Desafío ★2", rarity: 2 },
    { key: "star3", kind: "rarity", label: "Desafío ★3", rarity: 3 },
];
const CHALLENGE_MATCHES_PER_MAP = 50;
const CHALLENGE_MATCHES_PER_BLOCK = 5;
const CHALLENGE_WIN_DIAMONDS = 200;
const CHALLENGE_RIVAL_LEVEL_START = 1;
const CHALLENGE_RIVAL_LEVEL_END = 200;
// 10 bloques de 5 (50 / 5) — Despertar del rival sube 1 por bloque
// hasta llegar al máximo (10) en el último.
const CHALLENGE_AWAKENING_BY_BLOCK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CHALLENGE_LINEUP_SIZE = 5;

function getChallengeMapConfig(mapKey) {
    return CHALLENGE_MAPS.find((m) => m.key === mapKey) || null;
}

function isChallengeTeamMap(mapKey) {
    const config = getChallengeMapConfig(mapKey);
    return !!config && config.kind === "team";
}

// Orden de rivales de un mapa DE EQUIPO: el orden fijo de CHALLENGE_TEAMS,
// quitando el equipo propio (mismo orden relativo para los 4 que quedan).
// No se usa (ni tiene sentido) en mapas de rareza.
function getChallengeRivalOrder(teamKey) {
    return CHALLENGE_TEAMS.filter((t) => t !== teamKey);
}

function getChallengeBlockIndex(matchNumber) {
    return Math.floor((matchNumber - 1) / CHALLENGE_MATCHES_PER_BLOCK);
}

// A qué equipo se enfrenta un partido concreto (1-50) de un mapa DE
// EQUIPO — con 10 bloques y solo 4 equipos rivales posibles, el orden
// se recorre más de una vez (módulo), así que a partir del bloque 5 se
// repiten los mismos 4 rivales en el mismo orden.
function getChallengeMatchRivalTeam(teamKey, matchNumber) {
    const order = getChallengeRivalOrder(teamKey);
    return order[getChallengeBlockIndex(matchNumber) % order.length];
}

function getChallengeRivalLevel(matchNumber) {
    const t = (matchNumber - 1) / (CHALLENGE_MATCHES_PER_MAP - 1);
    return Math.round(CHALLENGE_RIVAL_LEVEL_START + (CHALLENGE_RIVAL_LEVEL_END - CHALLENGE_RIVAL_LEVEL_START) * t);
}

function getChallengeRivalAwakening(matchNumber) {
    return CHALLENGE_AWAKENING_BY_BLOCK[getChallengeBlockIndex(matchNumber)];
}

// Stats de un personaje a un nivel/despertar EXACTOS (a diferencia de
// getTransferRivalStatsAtLevel, que los busca en una tabla por
// personaje — aquí el nivel/despertar ya vienen decididos por el
// partido del mapa, iguales para todo el equipo rival de ese partido).
function getStatsAtLevelAwakening(character, level, awakening) {
    const t = Math.max(0, Math.min(1, (level - 1) / (LEVEL_MAX - 1)));
    const awakeningMultiplier = 1 + getAwakeningStatBonus(awakening);
    const stats = {};
    Object.keys(character.statsLevel1).forEach((key) => {
        const v1 = character.statsLevel1[key];
        const v100 = character.statsLevel100[key];
        const base = v1 + (v100 - v1) * t;
        stats[key] = Math.round(base * awakeningMultiplier);
    });
    return stats;
}

function averageStatsOfList(list) {
    if (!list.length) return { tiro: 1, tecnica: 1, defensa: 1, parada: 1 };
    const totals = { tiro: 0, tecnica: 0, defensa: 0, parada: 0 };
    list.forEach((stats) => {
        totals.tiro += stats.tiro || 0;
        totals.tecnica += stats.tecnica || 0;
        totals.defensa += stats.defensa || 0;
        totals.parada += stats.parada || 0;
    });
    return {
        tiro: totals.tiro / list.length,
        tecnica: totals.tecnica / list.length,
        defensa: totals.defensa / list.length,
        parada: totals.parada / list.length,
    };
}

// Equipo rival completo de un mapa (todos los miembros de ese
// equipoOriginal, sin filtrar por desbloqueo — el rival de Desafíos
// nunca depende del progreso del jugador).
function getChallengeTeamMembers(teamKey) {
    return CHARACTERS_DATA.filter((c) => c.equipoOriginal === teamKey);
}

// Alineación 5v5 por distribución de puestos (1 POR + 2 DEF + 1 MED +
// 1 DEL) a partir de un pool cualquiera de personajes, sin un
// "objetivo" fijo que vaya primero (aquí no hay un personaje
// protagonista del nodo, es un enfrentamiento de equipos) — se recorre
// el pool en el orden de characters-data.js. Reutilizada tanto por el
// rival de un equipo concreto (pool = ese equipoOriginal) como por el
// rival genérico de los mapas de rareza (pool = roster entero).
function pickLineupByPositionFromPool(sourcePool) {
    const remaining = { POR: 1, DEF: 2, MED: 1, DEL: 1 };
    const pool = sourcePool.slice();
    const selected = [];

    ["POR", "DEF", "MED", "DEL"].forEach((position) => {
        let need = remaining[position];
        while (need > 0) {
            const idx = pool.findIndex((c) => c.position === position);
            if (idx === -1) break;
            selected.push(pool.splice(idx, 1)[0]);
            need--;
        }
    });

    while (selected.length < CHALLENGE_LINEUP_SIZE && pool.length) {
        selected.push(pool.shift());
    }

    return selected;
}

function pickChallengeRivalLineup(teamKey) {
    return pickLineupByPositionFromPool(getChallengeTeamMembers(teamKey));
}

// Rival genérico de los mapas de rareza: sin restricción de equipo NI
// de rareza, sacado del roster completo — misma distribución de
// puestos, sin identidad de equipo que rotar por bloque (por eso no
// varía a lo largo de los 20 partidos, solo su nivel/Despertar).
function pickGenericChallengeRivalLineup() {
    return pickLineupByPositionFromPool(CHARACTERS_DATA);
}

// Stats/poder del equipo rival de un partido concreto (1-20) de un
// mapa, todos al mismo nivel/Despertar de ese partido. rivalTeam queda
// null en mapas de rareza (no hay equipo rival identificable).
//
// stats es la media de los hasta 5 miembros — el motor de partido la
// usa como valor de reserva cuando a la alineación rival le falta el
// puesto que tocaría defender según la zona del balón (ver
// getPositionalDefenseStat en match-engine.js), y también como stat de
// ataque del rival (que no tiene jugador activo individual). teamPower
// es la SUMA de los hasta 5 miembros, para mostrar en pantalla bajo
// "Poder del rival" — igual que getTransferRivalTeamPower en Fichajes.
function getChallengeRivalStatsForMatch(mapKey, matchNumber) {
    const isTeamMap = isChallengeTeamMap(mapKey);
    const rivalTeam = isTeamMap ? getChallengeMatchRivalTeam(mapKey, matchNumber) : null;
    const lineup = isTeamMap ? pickChallengeRivalLineup(rivalTeam) : pickGenericChallengeRivalLineup();
    const level = getChallengeRivalLevel(matchNumber);
    const awakening = getChallengeRivalAwakening(matchNumber);
    const statsList = lineup.map((c) => getStatsAtLevelAwakening(c, level, awakening));
    return {
        rivalTeam,
        lineup,
        level,
        awakening,
        stats: averageStatsOfList(statsList),
        teamPower: statsList.reduce((sum, s) => sum + sumStats(s), 0),
    };
}

// Alineación restringida del jugador para el mapa de un equipo: hasta 5
// ids (null = hueco vacío), guardada aparte del Quinteto Principal —
// solo puede llevar personajes cuyo equipoOriginal sea ESE equipo.
const CHALLENGE_LINEUP_KEY = "bl_challenge_lineup";

function getAllChallengeLineups() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CHALLENGE_LINEUP_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getChallengeLineup(mapKey) {
    const stored = getAllChallengeLineups()[mapKey];
    const arr = Array.isArray(stored) ? stored.slice(0, CHALLENGE_LINEUP_SIZE) : [];
    const normalized = arr.map((id) => (typeof id === "string" && id ? id : null));
    while (normalized.length < CHALLENGE_LINEUP_SIZE) normalized.push(null);
    return normalized;
}

function setChallengeLineupSlot(mapKey, slotIndex, characterId) {
    const all = getAllChallengeLineups();
    const lineup = getChallengeLineup(mapKey);
    lineup[slotIndex] = characterId;
    all[mapKey] = lineup;
    localStorage.setItem(CHALLENGE_LINEUP_KEY, JSON.stringify(all));
}

// Formación táctica (2-1-1, 1-2-1, 1-1-2 — las mismas que F5) de la
// alineación de Desafíos, UNA por mapa (bl_challenge_formation =
// { "Z": "2-1-1", ... }) — independiente de la de F5 y de la de cada
// mapa entre sí. Solo decide en qué fila se ve cada puesto en
// pages/challenges/map.html; no afecta al motor del partido, que ya
// usa el puesto real de cada personaje, no la formación elegida.
const CHALLENGE_FORMATION_KEY = "bl_challenge_formation";

function getAllChallengeFormations() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CHALLENGE_FORMATION_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getChallengeFormationKey(mapKey) {
    const stored = getAllChallengeFormations()[mapKey];
    return FORMATIONS_5V5[stored] ? stored : FORMATION_5V5_DEFAULT;
}

function setChallengeFormationKey(mapKey, formationKey) {
    const all = getAllChallengeFormations();
    all[mapKey] = formationKey;
    localStorage.setItem(CHALLENGE_FORMATION_KEY, JSON.stringify(all));
}

// Personajes que el jugador puede usar en su alineación de un mapa de
// Desafíos concreto: los suyos ya desbloqueados que cumplen la
// restricción de ESE mapa (equipoOriginal en los de equipo, rareza en
// los de rareza). Si hay menos de 5, el mapa avisa y no se puede jugar.
function getChallengeEligibleCharacters(mapKey) {
    const config = getChallengeMapConfig(mapKey);
    if (!config) return [];
    if (config.kind === "team") {
        return CHARACTERS_DATA.filter((c) => c.equipoOriginal === mapKey && isCharacterUnlocked(c));
    }
    return CHARACTERS_DATA.filter((c) => c.rarity === config.rarity && isCharacterUnlocked(c));
}

function hasEnoughChallengeCharacters(mapKey) {
    return getChallengeEligibleCharacters(mapKey).length >= CHALLENGE_LINEUP_SIZE;
}

// Progreso (victorias 0-20) de cada mapa de Desafíos.
const CHALLENGE_PROGRESS_KEY = "bl_challenge_progress";

function getAllChallengeProgress() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CHALLENGE_PROGRESS_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getChallengeProgress(mapKey) {
    return getAllChallengeProgress()[mapKey] || 0;
}

function setChallengeProgress(mapKey, wins) {
    const all = getAllChallengeProgress();
    all[mapKey] = wins;
    localStorage.setItem(CHALLENGE_PROGRESS_KEY, JSON.stringify(all));
}

function isChallengeMatchUnlocked(mapKey, matchNumber) {
    if (matchNumber === 1) return true;
    return getChallengeProgress(mapKey) >= matchNumber - 1;
}

// Progreso global de Desafíos (victorias de los 8 mapas / 160), para
// la tarjeta de Jugar.
function getChallengeOverallProgress() {
    const totalWins = CHALLENGE_MAPS.reduce((sum, m) => sum + getChallengeProgress(m.key), 0);
    return { wins: totalWins, total: CHALLENGE_MAPS.length * CHALLENGE_MATCHES_PER_MAP };
}

// Tickets de Gacha: una tirada x1 gratuita cada uno, ganados al ganar
// CUALQUIER partido de Desafíos (no solo al completar el mapa entero).
const GACHA_TICKETS_KEY = "bl_gacha_tickets";

function getGachaTickets() {
    return parseInt(localStorage.getItem(GACHA_TICKETS_KEY), 10) || 0;
}

function setGachaTickets(amount) {
    localStorage.setItem(GACHA_TICKETS_KEY, String(Math.max(0, amount)));
}

function addGachaTickets(amount) {
    setGachaTickets(getGachaTickets() + amount);
}

// amount: 1 para canjear una tirada x1 gratis, 10 para canjear una
// tirada x10 gratis (ambas opciones coexisten).
function spendGachaTickets(amount) {
    const current = getGachaTickets();
    if (current < amount) return false;
    setGachaTickets(current - amount);
    return true;
}

// Aplica las recompensas de ganar un partido de Desafíos: 200 diamantes
// + 1 Ticket de Gacha, siempre (las 20 victorias del mapa, no solo la
// última) — se llama con el matchNumber recién ganado, y solo avanza el
// progreso si es realmente el siguiente pendiente de ese mapa.
function applyChallengeMatchWin(mapKey, matchNumber) {
    const wins = getChallengeProgress(mapKey);
    if (matchNumber !== wins + 1) return null;

    setChallengeProgress(mapKey, matchNumber);
    setDiamonds(getDiamonds() + CHALLENGE_WIN_DIAMONDS);
    addGachaTickets(1);

    return {
        matchNumber,
        diamondsGained: CHALLENGE_WIN_DIAMONDS,
        ticketsGained: 1,
        mapCompleted: matchNumber === CHALLENGE_MATCHES_PER_MAP,
    };
}

// --- Modo Historia: 3 capítulos basados en los arcos del manga. El
// Capítulo 1 (Introducción) es solo texto, sin partido — kind:
// "narrative". Los Capítulos 2 y 3 (Primera/Segunda Selección) son
// "matches": 10 partidos cada uno, rival genérico escalable (mismo
// nivel/Despertar para todo su equipo, sin equipoOriginal concreto),
// nivel lineal entre levelStart y levelEnd a lo largo de los 10
// partidos, Despertar fijo por capítulo. modePattern decide el modo de
// cada partido: "alternating" empieza en 5v5 y alterna, "5v5" es
// siempre 5v5.
const STORY_CHAPTERS = [
    { key: "intro", kind: "narrative", title: "Introducción" },
    {
        key: "primera-seleccion", kind: "matches", title: "Primera Selección",
        totalMatches: 10, levelStart: 5, levelEnd: 20, awakening: 1, modePattern: "alternating",
    },
    {
        key: "segunda-seleccion", kind: "matches", title: "Segunda Selección",
        totalMatches: 10, levelStart: 20, levelEnd: 30, awakening: 2, modePattern: "5v5",
    },
];
const STORY_WIN_DIAMONDS = 100;
const STORY_WIN_EGO_FUEL = 2000;

// Breve resumen del Capítulo 1 y texto narrativo antes de cada partido
// de los Capítulos 2/3 (STORY_MATCH_NARRATIVE[chapterKey][matchNumber - 1]).
const STORY_INTRO_SUMMARY = "Tras un nuevo fracaso de la selección japonesa en el Mundial, la Federación pone en marcha un programa radical: el Blue Lock. Trescientos delanteros jóvenes quedan encerrados en unas instalaciones aisladas bajo las órdenes de Ego Jinpachi, que solo busca a UN egoísta capaz de convertirse en el mejor delantero del mundo — el resto quedará vetado de por vida de la selección nacional. Empieza la selección.";
const STORY_MATCH_NARRATIVE = {
    "primera-seleccion": [
        "Primer día de la Primera Selección: nadie te conoce todavía, pero todos miran el marcador.",
        "Tu equipo se mide a otro bloque de la Primera Selección. Solo importa quién anota, no quién ayuda.",
        "El nivel sube. Empiezan a aparecer delanteros que ya destacaban en sus academias.",
        "Un enfrentamiento más físico: once contra once, y solo los goles cuentan para seguir en el programa.",
        "La presión de Ego se nota en cada jugada: demuestra que eres el más egoísta del campo.",
        "Tus rivales ya no fallan tanto. Cada Command Battle se decide por detalles.",
        "La Primera Selección se acerca a su punto más duro: solo unos pocos bloques seguirán en pie.",
        "Un equipo forjado a base de derrotas anteriores te espera al otro lado del campo.",
        "Penúltimo partido de la Primera Selección. Ganar aquí es la diferencia entre seguir o desaparecer.",
        "El último partido de la Primera Selección. Ganar aquí abre la puerta a la Segunda Selección.",
    ],
    "segunda-seleccion": [
        "La Segunda Selección reúne a los mejores supervivientes de todo el país. El nivel ya no tiene nada que ver con el de antes.",
        "Nuevos compañeros, nuevos rivales: en la Segunda Selección nadie regala nada.",
        "Cada partido aquí enfrenta estilos de juego completamente distintos — y solo uno se impone.",
        "El campo se llena de delanteros que ya han marcado goles decisivos en la Primera Selección.",
        "La exigencia de Ego crece: ya no basta con ganar, hay que hacerlo con tu propio estilo egoísta.",
        "Un rival que ha estudiado tus jugadas de la Primera Selección te espera con una estrategia distinta.",
        "El nivel de la Segunda Selección empieza a acercarse al de un profesional real.",
        "Quedan pocos partidos. Cada Command Battle puede decidir tu futuro en el programa.",
        "Penúltimo partido de la Segunda Selección — el rival de hoy no ha perdido ni un solo duelo hasta ahora.",
        "El partido más duro de la Segunda Selección. Ganar aquí demuestra que puedes competir por ser el mejor delantero del mundo.",
    ],
};

function getStoryChapterConfig(chapterKey) {
    return STORY_CHAPTERS.find((c) => c.key === chapterKey) || null;
}

function getStoryChapterIndex(chapterKey) {
    return STORY_CHAPTERS.findIndex((c) => c.key === chapterKey);
}

function getStoryMatchNarrative(chapterKey, matchNumber) {
    const list = STORY_MATCH_NARRATIVE[chapterKey];
    return list ? (list[matchNumber - 1] || "") : "";
}

// Capítulo 2: empieza en 5v5 y alterna (partido impar = 5v5, par =
// 11v11). Capítulo 3: siempre 5v5.
function getStoryMatchMode(chapterKey, matchNumber) {
    const config = getStoryChapterConfig(chapterKey);
    if (config && config.modePattern === "alternating") {
        return matchNumber % 2 === 1 ? "5v5" : "11v11";
    }
    return "5v5";
}

function getStoryRivalLevel(chapterKey, matchNumber) {
    const config = getStoryChapterConfig(chapterKey);
    if (!config || config.kind !== "matches") return 1;
    const t = (matchNumber - 1) / (config.totalMatches - 1);
    return Math.round(config.levelStart + (config.levelEnd - config.levelStart) * t);
}

function getStoryRivalAwakening(chapterKey) {
    const config = getStoryChapterConfig(chapterKey);
    return config ? config.awakening : 0;
}

// Reparto de puestos de un rival "sin equipo real" (Historia): 1 POR +
// 2 DEF + 1 MED + 1 DEL en 5v5 (misma distribución reducida que ya usa
// el rival genérico de Desafíos), 1 POR + 4 DEF + 3 MED + 3 DEL en
// 11v11 (4-3-3, la formación por defecto del juego). Se saca del
// roster completo, sin identidad de equipo — por eso no depende de
// ningún equipoOriginal concreto.
function pickGenericLineupForMode(mode) {
    const positionCounts = mode === "11v11"
        ? { POR: 1, DEF: 4, MED: 3, DEL: 3 }
        : { POR: 1, DEF: 2, MED: 1, DEL: 1 };
    const pool = CHARACTERS_DATA.slice();
    const selected = [];

    ["POR", "DEF", "MED", "DEL"].forEach((position) => {
        let need = positionCounts[position];
        while (need > 0) {
            const idx = pool.findIndex((c) => c.position === position);
            if (idx === -1) break;
            selected.push(pool.splice(idx, 1)[0]);
            need--;
        }
    });

    const totalNeeded = Object.values(positionCounts).reduce((a, b) => a + b, 0);
    while (selected.length < totalNeeded && pool.length) {
        selected.push(pool.shift());
    }

    return selected;
}

// Stats/poder del rival genérico de un partido concreto de Historia,
// mismo patrón que getChallengeRivalStatsForMatch: stats es la media
// (usada por el motor), teamPower es la suma (mostrada en pantalla).
function getStoryRivalStatsForMatch(chapterKey, matchNumber) {
    const mode = getStoryMatchMode(chapterKey, matchNumber);
    const lineup = pickGenericLineupForMode(mode);
    const level = getStoryRivalLevel(chapterKey, matchNumber);
    const awakening = getStoryRivalAwakening(chapterKey);
    const statsList = lineup.map((c) => getStatsAtLevelAwakening(c, level, awakening));
    return {
        lineup,
        mode,
        level,
        awakening,
        stats: averageStatsOfList(statsList),
        teamPower: statsList.reduce((sum, s) => sum + sumStats(s), 0),
    };
}

// Progreso de Historia: para capítulos "matches", nº de victorias
// (0-totalMatches). Para el capítulo "narrative" (Introducción), 0 = no
// leído, 1 = leído (ver markStoryNarrativeRead) — mismo almacén que
// getChallengeProgress, con un único objeto por chapterKey.
const STORY_PROGRESS_KEY = "bl_story_progress";

function getAllStoryProgress() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORY_PROGRESS_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getStoryProgress(chapterKey) {
    return getAllStoryProgress()[chapterKey] || 0;
}

function setStoryProgress(chapterKey, value) {
    const all = getAllStoryProgress();
    all[chapterKey] = value;
    localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(all));
}

function markStoryNarrativeRead(chapterKey) {
    setStoryProgress(chapterKey, 1);
}

function isStoryNarrativeRead(chapterKey) {
    return getStoryProgress(chapterKey) >= 1;
}

function isStoryChapterFullyCompleted(chapterKey) {
    const config = getStoryChapterConfig(chapterKey);
    if (!config) return false;
    if (config.kind === "narrative") return isStoryNarrativeRead(chapterKey);
    return getStoryProgress(chapterKey) >= config.totalMatches;
}

// Un capítulo se desbloquea cuando el anterior de la lista está
// completado del todo (el primero — Introducción — siempre está
// desbloqueado). Así el Capítulo 3 exige el Capítulo 2 completo (sus
// 10 victorias), y el Capítulo 2 exige haber leído la Introducción.
function isStoryChapterUnlocked(chapterKey) {
    const index = getStoryChapterIndex(chapterKey);
    if (index <= 0) return true;
    return isStoryChapterFullyCompleted(STORY_CHAPTERS[index - 1].key);
}

function isStoryMatchUnlocked(chapterKey, matchNumber) {
    if (matchNumber === 1) return true;
    return getStoryProgress(chapterKey) >= matchNumber - 1;
}

// Aplica las recompensas de ganar un partido jugable de Historia: 100
// diamantes + 2.000 Combustible de Ego, siempre — solo avanza el
// progreso si matchNumber es realmente el siguiente pendiente de ese
// capítulo (mismo guardia de idempotencia que applyChallengeMatchWin).
function applyStoryMatchWin(chapterKey, matchNumber) {
    const wins = getStoryProgress(chapterKey);
    if (matchNumber !== wins + 1) return null;

    setStoryProgress(chapterKey, matchNumber);
    setDiamonds(getDiamonds() + STORY_WIN_DIAMONDS);
    setEgoFuel(getEgoFuel() + STORY_WIN_EGO_FUEL);

    const config = getStoryChapterConfig(chapterKey);
    return {
        matchNumber,
        diamondsGained: STORY_WIN_DIAMONDS,
        egoFuelGained: STORY_WIN_EGO_FUEL,
        chapterCompleted: config ? matchNumber === config.totalMatches : false,
    };
}

// Progreso global de Historia (para la tarjeta de Jugar): la
// Introducción cuenta como 0/1 o 1/1, cada capítulo de partidos cuenta
// victorias/total — todo sumado sobre el mismo denominador.
function getStoryOverallProgress() {
    let done = 0;
    let total = 0;
    STORY_CHAPTERS.forEach((chapter) => {
        if (chapter.kind === "narrative") {
            total += 1;
            if (isStoryNarrativeRead(chapter.key)) done += 1;
        } else {
            total += chapter.totalMatches;
            done += getStoryProgress(chapter.key);
        }
    });
    return { done, total };
}

function getCharacterPower(character) {
    const stats = getCharacterStatsAtLevel(character);
    return sumStats(stats);
}

// Igual que getCharacterPower pero devuelve las 4 stats por separado
// (para la ficha de jugador), no solo su suma. Incluye el bonus de
// Despertar (+2% acumulativo por nivel) y, si el personaje ya está
// desbloqueado, el bonus plano de Equipamiento (+nivel del objeto a su
// stat correspondiente).
function getCharacterStatsAtLevel(character) {
    const level = getCharacterLevel(character.id);
    const t = Math.max(0, Math.min(1, (level - 1) / (LEVEL_MAX - 1)));
    const awakeningMultiplier = getAwakeningStatMultiplier(character.id);
    const unlocked = isCharacterUnlocked(character);
    const stats = {};
    Object.keys(character.statsLevel1).forEach((key) => {
        const v1 = character.statsLevel1[key];
        const v100 = character.statsLevel100[key];
        const base = v1 + (v100 - v1) * t;
        stats[key] = Math.round(base * awakeningMultiplier) + (unlocked ? getEquipmentStatBonus(key) : 0);
    });
    return stats;
}

// Ficha ampliada de jugador: modal compartido por Jugadores (Quinteto y
// Colección) y por los campos F5/F11. Se crea una sola vez en el DOM
// (inyectado bajo demanda) y se reutiliza; el CSS que lo viste (.pd-*)
// vive en cada hoja de estilos de página, no aquí, siguiendo el mismo
// patrón que .swap-modal-overlay.
const PLAYER_DETAIL_PLACEHOLDER = "assets/characters/portraits/placeholder.webp";
const PLAYER_DETAIL_STAT_LABELS = {
    tiro: "Tiro",
    tecnica: "Técnica",
    defensa: "Defensa",
    parada: "Parada",
};
const PLAYER_DETAIL_ELEMENT_ICONS = {
    Fuego: "🔥",
    Bosque: "🌲",
    Montaña: "⛰️",
    Aire: "💨",
};

// Técnicas: cada personaje trae 2 fijas (character.techniques, no se
// pueden quitar) más un hueco libre por personaje donde se puede
// equipar CUALQUIER técnica fija de CUALQUIER personaje ya
// desbloqueado (no solo las suyas). Se guarda solo el id de la
// técnica equipada en el hueco libre, por personaje.
const EQUIPPED_TECHNIQUE_KEY = "bl_equipped_techniques";

function getEquippedTechniques() {
    try {
        const parsed = JSON.parse(localStorage.getItem(EQUIPPED_TECHNIQUE_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getEquippedTechniqueId(characterId) {
    return getEquippedTechniques()[characterId] || null;
}

function setEquippedTechnique(characterId, techniqueId) {
    const equipped = getEquippedTechniques();
    if (techniqueId) {
        equipped[characterId] = techniqueId;
    } else {
        delete equipped[characterId];
    }
    localStorage.setItem(EQUIPPED_TECHNIQUE_KEY, JSON.stringify(equipped));
}

// Todas las técnicas fijas de todos los personajes ya desbloqueados —
// es el pool completo de donde se puede elegir para un hueco libre.
function getAllTechniqueOptions() {
    const options = [];
    CHARACTERS_DATA.filter(isCharacterUnlocked).forEach((character) => {
        (character.techniques || []).forEach((technique) => {
            options.push({ technique, sourceCharacter: character });
        });
    });
    return options;
}

function findTechniqueById(techniqueId) {
    for (const character of CHARACTERS_DATA) {
        const technique = (character.techniques || []).find((t) => t.id === techniqueId);
        if (technique) return { technique, sourceCharacter: character };
    }
    return null;
}

function buildTechniqueListMarkup(character) {
    const fixedRows = (character.techniques || []).map((technique) => `
        <div class="pd-technique-row is-fixed">
            <span class="pd-technique-element-icon">${PLAYER_DETAIL_ELEMENT_ICONS[technique.element] || ""}</span>
            <span class="pd-technique-name">${technique.name}</span>
            <span class="pd-technique-fixed-tag">Fija</span>
        </div>
    `).join("");

    const equippedId = getEquippedTechniqueId(character.id);
    const equipped = equippedId ? findTechniqueById(equippedId) : null;
    const freeSlotRow = equipped
        ? `
            <button type="button" class="pd-technique-row pd-technique-slot is-filled" data-technique-slot="free">
                <span class="pd-technique-element-icon">${PLAYER_DETAIL_ELEMENT_ICONS[equipped.technique.element] || ""}</span>
                <span class="pd-technique-name">${equipped.technique.name}</span>
                <span class="pd-technique-source">de ${equipped.sourceCharacter.name}</span>
            </button>
        `
        : `
            <button type="button" class="pd-technique-row pd-technique-slot is-empty" data-technique-slot="free">
                <span class="pd-technique-name">Hueco libre — toca para asignar</span>
            </button>
        `;

    return fixedRows + freeSlotRow;
}

// Nivel de un hueco de habilidad "normal" (0-2) al nivel de personaje
// dado — tanto los huecos genéricos "Habilidad 1/2" (GENERIC_ABILITY_SLOTS,
// characters-data.js) como las pasivas normales propias de un personaje
// (character.passives, p.ej. "Mejora de Tiro"/"Mejora de Técnica" de
// los Wanima) usan esta misma regla por su ÍNDICE (0 y 1 alternan):
// cada 10 niveles de personaje sube un nivel una de las dos, alternando
// (nivel 10 → índice par Nv.1, nivel 20 → índice impar Nv.1, nivel 30 →
// índice par Nv.2...) hasta el nivel máximo (10) en el nivel máximo del
// personaje (200 = LEVEL_MAX). 0 = todavía bloqueado.
function getGenericAbilityLevel(characterLevel, slotIndex) {
    const milestone = Math.min(20, Math.floor(characterLevel / 10));
    const level = slotIndex % 2 === 0 ? Math.ceil(milestone / 2) : Math.floor(milestone / 2);
    return Math.min(GENERIC_ABILITY_MAX_LEVEL, level);
}

// Nivel PROPIO de las pasivas "Mejora Supertécnicas [Elemento]" — usa
// el MISMO calendario de subida que cualquier otra pasiva según el
// hueco en el que esté (getGenericAbilityLevel: hueco 0 sube en
// Nv.10,30,50,70... de personaje, hueco 1 en Nv.20,40,60,80...), pero
// sin bloquearse nunca del todo: por debajo del primer escalón de su
// hueco ya cuenta como Nv.1 (en vez de 0/bloqueada). El bonus final es
// +25 en Nv.1, +5 más por cada nivel del aura (Nv.10 = +70 como mucho).
function getElementAuraLevel(characterLevel, slotIndex) {
    return Math.max(1, getGenericAbilityLevel(characterLevel, slotIndex));
}

// A diferencia de la Pasiva Única (que escala un +10%/nivel de
// Despertar), las pasivas normales propias escalan un +20% de su
// bonus base por cada nivel de personaje por encima del primero
// (Nv.1 = 100% del base, Nv.10 = 280%).
const OWN_PASSIVE_BONUS_PER_LEVEL = 0.20;
function getOwnPassiveLevelMultiplier(level) {
    return 1 + OWN_PASSIVE_BONUS_PER_LEVEL * (level - 1);
}

// Texto de una pasiva con efectos reales (character.passives o
// uniquePassive.effects) con el bonus YA CALCULADO al multiplicador
// actual — "Tiro +140" en vez de "+100 Tiro, sube un 20% por nivel",
// para que se lea el número final de un vistazo en vez de la fórmula.
// requiresTeammateId (p.ej. Hermanos Wanima) antepone esa condición;
// requiresTeamCount (Sinergia de Equipo) antepone la condición de
// equipo. characterLevel + slotIndex solo los necesita el aura
// elemental, para calcular su propio nivel 1-10 (getElementAuraLevel,
// mismo calendario que el hueco en el que esté) — no pasa por
// multiplier, que es el multiplicador por nivel del HUECO que usa todo
// lo demás.
function buildPassiveEffectDescription(effects, multiplier, characterLevel, slotIndex) {
    const parts = effects.map((effect) => {
        if (effect.kind === "elementTechniqueAura") {
            const auraLevel = getElementAuraLevel(characterLevel, slotIndex);
            const amount = Math.round(effect.baseAmount + effect.perLevelAmount * (auraLevel - 1));
            return `los compañeros con Supertécnica de ${effect.element} ganan +${amount} de potencia al usarla`;
        }
        const amount = Math.round(effect.baseAmount * multiplier);
        const statLabels = effect.stats.map((key) => PLAYER_DETAIL_STAT_LABELS[key]).join(" y ");
        if (effect.requiresTeammateId) {
            const teammate = CHARACTERS_DATA.find((c) => c.id === effect.requiresTeammateId);
            const teammateName = teammate ? teammate.name : "su compañero";
            return `si ${teammateName} también juega, ${statLabels} +${amount}`;
        }
        if (effect.requiresTeamCount) {
            const { equipoOriginal, min } = effect.requiresTeamCount;
            return `si ${min}+ jugadores del Equipo ${equipoOriginal} están en tu alineación, ${statLabels} +${amount} a todo el equipo`;
        }
        return `${statLabels} +${amount}`;
    });
    return `Al empezar el partido: ${parts.join(", ")}.`;
}

// Una fila de habilidad "normal" (bloqueada o con su nivel actual) —
// misma pinta para los huecos genéricos y para las pasivas propias ya
// definidas, ambos comparten forma (name/icon/unlockLevel). Si tiene
// `effects` (pasiva real, no el placeholder "Próximamente") la
// descripción se calcula con buildPassiveEffectDescription en vez de
// usar el texto fijo guardado.
function buildLeveledPassiveRowMarkup(slot, level, multiplier, characterLevel, slotIndex) {
    if (level < 1) {
        return `
            <div class="pd-passive-row is-locked">
                <span class="pd-passive-icon">🔒</span>
                <div class="pd-passive-info">
                    <span class="pd-passive-name">${slot.name}</span>
                    <span class="pd-passive-desc">Bloqueada, requiere Nivel ${slot.unlockLevel}</span>
                </div>
            </div>
        `;
    }
    const description = slot.effects ? buildPassiveEffectDescription(slot.effects, multiplier, characterLevel, slotIndex) : slot.description;
    return `
        <div class="pd-passive-row">
            <span class="pd-passive-icon">${slot.icon}</span>
            <div class="pd-passive-info">
                <span class="pd-passive-name">${slot.name} — Nv. ${level}</span>
                <span class="pd-passive-desc">${description}</span>
            </div>
        </div>
    `;
}

// Las pasivas "Mejora Supertécnicas [Elemento]" (aura) no se bloquean
// nunca del todo (ya activas en Nv.1 de personaje) pero SÍ suben de
// nivel (1-10) en los mismos escalones que le tocarían a ese hueco
// (getElementAuraLevel: hueco 0 → Nv.10,30,50,70... de personaje,
// hueco 1 → Nv.20,40,60,80...), igual que el resto de pasivas.
function isElementAuraSlot(slot) {
    return !!(slot.effects && slot.effects[0] && slot.effects[0].kind === "elementTechniqueAura");
}

function buildPassivesListMarkup(character) {
    // Pasivas normales PROPIAS del personaje (character.passives) — o,
    // si TODAVÍA no tiene ninguna definida (la mayoría, de momento),
    // los 2 huecos genéricos "Habilidad 1/2" (GENERIC_ABILITY_SLOTS)
    // con su texto "Próximamente". En ambos casos el nivel se calcula
    // según el Nivel del personaje (getGenericAbilityLevel), no
    // dependen del Despertar (eso es solo cosa de la Pasiva Única, más
    // abajo).
    const characterLevel = getCharacterLevel(character.id);
    const slots = (character.passives && character.passives.length) ? character.passives : GENERIC_ABILITY_SLOTS;
    const ownRows = slots.map((slot, index) => {
        if (isElementAuraSlot(slot)) {
            return buildLeveledPassiveRowMarkup(slot, getElementAuraLevel(characterLevel, index), 1, characterLevel, index);
        }
        const level = getGenericAbilityLevel(characterLevel, index);
        return buildLeveledPassiveRowMarkup(slot, level, getOwnPassiveLevelMultiplier(level), characterLevel, index);
    }).join("");

    // La Habilidad Única está bloqueada del todo en Despertar 0; desde
    // Despertar 1 se desbloquea y su "nivel" mostrado es el propio
    // número de despertar (sube junto a él). La mayoría de personajes
    // todavía no tienen ninguna definida (character.uniquePassive
    // ausente) — no se muestra nada en ese caso, en vez de la fila
    // "Bloqueada" genérica de antes.
    const unique = character.uniquePassive;
    if (!unique) return ownRows;

    const awakening = getCharacterAwakening(character.id);
    const uniqueRow = awakening >= 1
        ? `
            <div class="pd-passive-row">
                <span class="pd-passive-icon">${unique.icon}</span>
                <div class="pd-passive-info">
                    <span class="pd-passive-name">${unique.name} — Nv. ${awakening}</span>
                    <span class="pd-passive-desc">${unique.effects ? buildPassiveEffectDescription(unique.effects, 1 + 0.10 * (awakening - 1)) : unique.description}</span>
                </div>
            </div>
        `
        : `
            <div class="pd-passive-row is-locked">
                <span class="pd-passive-icon">🔒</span>
                <div class="pd-passive-info">
                    <span class="pd-passive-name">${unique.name}</span>
                    <span class="pd-passive-desc">Bloqueada, requiere Despertar 1</span>
                </div>
            </div>
        `;

    return ownRows + uniqueRow;
}

// Selector de técnica para el hueco libre: mismo componente visual
// (.swap-modal-*) que el resto de selectores de la app. onDone se
// llama tanto al elegir como al cancelar, para que quien abrió el
// selector pueda refrescarse (normalmente, volver a abrir la ficha de
// jugador con los datos al día).
function ensureTechniquePickerOverlay() {
    let overlay = document.getElementById("technique-picker-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "technique-picker-overlay";
    overlay.className = "swap-modal-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="swap-modal">
            <p class="swap-modal-title">Elige una técnica para el hueco libre</p>
            <div class="swap-modal-slots" id="technique-picker-list"></div>
            <button class="swap-modal-cancel" id="technique-picker-cancel" type="button">Cancelar</button>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function openTechniquePicker(targetCharacterId, onDone) {
    const overlay = ensureTechniquePickerOverlay();
    const list = document.getElementById("technique-picker-list");
    list.innerHTML = "";

    function finish() {
        overlay.hidden = true;
        onDone();
    }

    const emptyRow = document.createElement("button");
    emptyRow.type = "button";
    emptyRow.className = "swap-modal-slot swap-modal-slot-empty";
    emptyRow.innerHTML = "<span>Vacío (sin técnica)</span>";
    emptyRow.addEventListener("click", () => {
        setEquippedTechnique(targetCharacterId, null);
        finish();
    });
    list.appendChild(emptyRow);

    getAllTechniqueOptions().forEach(({ technique, sourceCharacter }) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "swap-modal-slot";
        row.innerHTML = `
            <span>${technique.name}</span>
            <span class="swap-modal-slot-level">${sourceCharacter.name}</span>
        `;
        row.addEventListener("click", () => {
            setEquippedTechnique(targetCharacterId, technique.id);
            finish();
        });
        list.appendChild(row);
    });

    document.getElementById("technique-picker-cancel").onclick = finish;
    overlay.onclick = (event) => {
        if (event.target === overlay) finish();
    };

    overlay.hidden = false;
}

// Ficha de Jugador: pantalla completa (pages/player/), no modal.
// navigateToPlayerDetail() la abre desde cualquier carta de Jugadores/
// F5/F11; el "volver atrás" es el propio historial del navegador. El
// contexto (qué acción contextual mostrar, y cualquier estado que la
// pantalla de origen necesite recuperar intacto — ej. el modo edición
// del Quinteto) viaja en sessionStorage porque la navegación es un
// cambio de página real, no se puede pasar por closures de JS.
const PLAYER_DETAIL_RETURN_KEY = "bl_player_detail_return";

// actionMeta: { actionLabel, actionType: "swapModal"|"slotPicker", ...datos
// que esa acción necesite } o null si la ficha no debe mostrar botón.
// extraState: cualquier dato adicional que la pantalla de origen
// quiera recuperar al volver (ej. { editMode, pendingQuinteto }).
function navigateToPlayerDetail(characterId, actionMeta, extraState) {
    const context = Object.assign({ actionMeta: actionMeta || null, triggerAction: false }, extraState || {});
    sessionStorage.setItem(PLAYER_DETAIL_RETURN_KEY, JSON.stringify(context));
    window.location.href = resolveAssetPath(`pages/player/index.html?id=${encodeURIComponent(characterId)}`);
}

// Se llama UNA VEZ, al volver a una pantalla de origen (en pageshow,
// no solo DOMContentLoaded — así funciona también si el navegador
// restaura la página desde la caché de "atrás" sin re-ejecutar los
// scripts). Consume el contexto (lo borra) para no reaplicarlo en una
// recarga posterior no relacionada.
function consumePlayerDetailReturnContext() {
    const raw = sessionStorage.getItem(PLAYER_DETAIL_RETURN_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PLAYER_DETAIL_RETURN_KEY);
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

// Formaciones 5v5: notación DEF-MED-DEL para los 4 jugadores de campo,
// el portero (POR) siempre es 1 y está implícito. Cada formación suma
// siempre exactamente 5 (4 + 1 POR). Compartidas entre F5
// (formation.js), el selector de alineación de Desafíos
// (challenges/map.js) y la pantalla previa al partido en 5v5
// (pages/match/match.js) para que las tres ofrezcan siempre
// exactamente las mismas opciones.
const FORMATIONS_5V5 = {
    "2-1-1": { label: "2-1-1", DEF: 2, MED: 1, DEL: 1 },
    "1-2-1": { label: "1-2-1", DEF: 1, MED: 2, DEL: 1 },
    "1-1-2": { label: "1-1-2", DEF: 1, MED: 1, DEL: 2 },
};
const FORMATION_5V5_DEFAULT = "2-1-1";

// Qué formación 5v5 está seleccionada ahora mismo (F5 y la pantalla
// previa al partido en 5v5 comparten esta misma preferencia — no hay
// una "formación de partido" aparte, es la misma que se ve en F5).
const FORMATION_5V5_SELECTION_KEY = "bl_formation_5v5_selected";

function getFormation5v5Key() {
    const stored = localStorage.getItem(FORMATION_5V5_SELECTION_KEY);
    return FORMATIONS_5V5[stored] ? stored : FORMATION_5V5_DEFAULT;
}

function setFormation5v5Key(key) {
    localStorage.setItem(FORMATION_5V5_SELECTION_KEY, key);
}

// Formaciones 11v11 clásicas: notación DEF-MED-DEL para los 10
// jugadores de campo, el portero (POR) siempre es 1 e implícito.
// Compartidas entre F11 (formation11.js) y la pantalla previa al
// partido en 11v11 (pages/match/match.js).
const FORMATIONS_11V11 = {
    "4-3-3": { label: "4-3-3", DEF: 4, MED: 3, DEL: 3 },
    "4-4-2": { label: "4-4-2", DEF: 4, MED: 4, DEL: 2 },
    "3-5-2": { label: "3-5-2", DEF: 3, MED: 5, DEL: 2 },
};

// Once Principal (11 VS 11): UNA sola alineación de 11 slots,
// compartida entre TODAS las formaciones — igual que el Quinteto
// Principal de 5v5. Antes se guardaba un roster de 11 separado POR
// FORMACIÓN (bl_once_principal = { "4-3-3": [...], "4-4-2": [...] }),
// lo que hacía que cambiar a una formación todavía no configurada
// mostrara la plantilla vacía (parecía "borrarse" a los jugadores).
// Con un único array, renderFormation() en formation11.js redistribuye
// a los mismos jugadores en las filas de la nueva formación emparejando
// por su puesto real (mismo patrón que ya usa F5 en formation.js), sin
// perder a nadie.
const ONCE_KEY = "bl_once_principal";
const ONCE_SIZE = 11;

// Qué formación 11 VS 11 está seleccionada ahora mismo.
const FORMATION_11V11_SELECTION_KEY = "bl_formation_11v11_selected";
const FORMATION_11V11_DEFAULT = "4-3-3";

function getFormation11v11Key() {
    const stored = localStorage.getItem(FORMATION_11V11_SELECTION_KEY);
    return FORMATIONS_11V11[stored] ? stored : FORMATION_11V11_DEFAULT;
}

function setFormation11v11Key(key) {
    localStorage.setItem(FORMATION_11V11_SELECTION_KEY, key);
}

// Migración desde el formato anterior (un objeto por formación): toma
// como plantilla inicial la de la formación que estuviera seleccionada
// en ese momento y descarta el resto, para no perder de golpe todo lo
// ya configurado.
function migrateOnceDataIfNeeded() {
    let stored;
    try {
        stored = JSON.parse(localStorage.getItem(ONCE_KEY));
    } catch (e) {
        return;
    }
    if (!stored || Array.isArray(stored) || typeof stored !== "object") return;
    const selectedFormation = localStorage.getItem(FORMATION_11V11_SELECTION_KEY) || FORMATION_11V11_DEFAULT;
    const seed = Array.isArray(stored[selectedFormation]) ? stored[selectedFormation] : [];
    localStorage.setItem(ONCE_KEY, JSON.stringify(seed));
}

function getOnce() {
    migrateOnceDataIfNeeded();
    let stored;
    try {
        stored = JSON.parse(localStorage.getItem(ONCE_KEY));
    } catch (e) {
        stored = null;
    }
    if (!Array.isArray(stored)) stored = [];
    const normalized = stored
        .slice(0, ONCE_SIZE)
        .map((id) => (typeof id === "string" && id ? id : null));
    while (normalized.length < ONCE_SIZE) normalized.push(null);
    return normalized;
}

function setOnceSlot(slotIndex, characterId) {
    const once = getOnce();
    once[slotIndex] = characterId;
    localStorage.setItem(ONCE_KEY, JSON.stringify(once));
}

// Cada página define window.BL_ASSET_BASE (antes de cargar este script)
// con la ruta relativa hasta la raíz del proyecto, para que las rutas de
// assets funcionen tanto en el servidor local como abriendo el HTML
// directamente como archivo (donde una ruta absoluta "/assets/..." no
// resuelve a la raíz del proyecto, sino a la raíz del disco).
function resolveAssetPath(path) {
    return (window.BL_ASSET_BASE || "") + path;
}

// Las tarjetas pequeñas (Colección, Quinteto, F5/F11, previa al
// partido) usan una versión recortada de cada foto (mismo archivo,
// sufijo "-thumb", generada aparte SIN tocar el original) para que el
// personaje ocupe siempre la misma proporción del cuadro — la foto
// completa (sin recortar) se sigue usando tal cual en la Home y en la
// Ficha de Jugador, donde se ve a cuerpo entero.
function getCharacterThumbSprite(character) {
    if (!character.sprite) return character.sprite;
    return character.sprite.replace(/\.webp$/, "-thumb.webp");
}

function getHomeCharacterId() {
    const stored = localStorage.getItem(HOME_CHARACTER_KEY);
    return CHARACTER_ROSTER.some((c) => c.id === stored) ? stored : HOME_CHARACTER_DEFAULT;
}

function setHomeCharacterId(id) {
    if (!CHARACTER_ROSTER.some((c) => c.id === id)) return;
    localStorage.setItem(HOME_CHARACTER_KEY, id);
}

function getHomeCharacter() {
    const id = getHomeCharacterId();
    return CHARACTER_ROSTER.find((c) => c.id === id) || CHARACTER_ROSTER[0];
}

function resetProgress() {
    Object.keys(localStorage)
        .filter((key) => key.startsWith("bl_"))
        .forEach((key) => localStorage.removeItem(key));
}

// Diamantes: única moneda del gacha. Saldo inicial 2.500 — el mismo
// número que ya se veía (a mano, sin lógica real detrás) en el
// contador decorativo de la Home.
const DIAMONDS_KEY = "bl_diamonds";
const DIAMONDS_STARTING_BALANCE = 0;

function getDiamonds() {
    const stored = localStorage.getItem(DIAMONDS_KEY);
    return stored === null ? DIAMONDS_STARTING_BALANCE : parseInt(stored, 10) || 0;
}

function setDiamonds(amount) {
    localStorage.setItem(DIAMONDS_KEY, String(Math.max(0, amount)));
}

function spendDiamonds(amount) {
    const current = getDiamonds();
    if (current < amount) return false;
    setDiamonds(current - amount);
    return true;
}

// Pity del gacha: tiradas consecutivas sin sacar un ★3. Se resetea a 0
// en cuanto sale uno; al llegar a PITY_THRESHOLD, la siguiente tirada
// garantiza un ★3.
const PITY_KEY = "bl_gacha_pity";
const PITY_THRESHOLD = 60;

function getPityCount() {
    const stored = localStorage.getItem(PITY_KEY);
    return stored === null ? 0 : parseInt(stored, 10) || 0;
}

function setPityCount(count) {
    localStorage.setItem(PITY_KEY, String(Math.max(0, count)));
}

// Puntos de Reclutamiento: moneda de intercambio del Gacha, aparte del
// pity — se ganan con CUALQUIER tirada (x1 = 1, x10 = 10) y nunca se
// resetean solos (a diferencia del pity, que vuelve a 0 al sacar un
// ★3). Se cambian por personajes ★3 concretos en la Tienda de Puntos.
const RECRUIT_POINTS_KEY = "bl_recruit_points";
const RECRUIT_POINTS_REDEEM_COST = 50;

function getRecruitPoints() {
    const stored = localStorage.getItem(RECRUIT_POINTS_KEY);
    return stored === null ? 0 : parseInt(stored, 10) || 0;
}

function addRecruitPoints(amount) {
    localStorage.setItem(RECRUIT_POINTS_KEY, String(getRecruitPoints() + amount));
}

function spendRecruitPoints(amount) {
    const current = getRecruitPoints();
    if (current < amount) return false;
    localStorage.setItem(RECRUIT_POINTS_KEY, String(current - amount));
    return true;
}

// Esencias: lo que se recibe al sacar en el gacha a un personaje que
// ya estaba desbloqueado, en vez de un duplicado inútil. Son propias
// de cada personaje (no un recurso compartido).
const ESSENCES_KEY = "bl_essences";

function getEssences() {
    try {
        const parsed = JSON.parse(localStorage.getItem(ESSENCES_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function addEssence(characterId, amount) {
    const essences = getEssences();
    essences[characterId] = (essences[characterId] || 0) + amount;
    localStorage.setItem(ESSENCES_KEY, JSON.stringify(essences));
    return essences[characterId];
}

// Combustible de Ego: recurso que se gasta al subir de nivel a un
// miembro del Quinteto Principal (no es por personaje, es un saldo
// único del jugador, como los diamantes). Coste de cada subida = nivel
// actual × 10.
const EGO_FUEL_KEY = "bl_ego_fuel";
const EGO_FUEL_STARTING_BALANCE = 0;

function getEgoFuel() {
    const stored = localStorage.getItem(EGO_FUEL_KEY);
    return stored === null ? EGO_FUEL_STARTING_BALANCE : parseInt(stored, 10) || 0;
}

function setEgoFuel(amount) {
    localStorage.setItem(EGO_FUEL_KEY, String(Math.max(0, amount)));
}

function spendEgoFuel(amount) {
    const current = getEgoFuel();
    if (current < amount) return false;
    setEgoFuel(current - amount);
    return true;
}

const LEVEL_MAX = 200;

function getLevelUpCost(level) {
    return level * 10;
}

// Un personaje puede subir de Nivel solo si está en el Quinteto (el
// nivel pertenece al slot, ver getCharacterLevel), no se pasaría del
// tope de diferencia con el slot más bajo, y le llega el Combustible
// de Ego para el siguiente nivel.
function canCharacterLevelUp(character) {
    if (!isInQuinteto(character.id)) return false;
    const level = getCharacterLevel(character.id);
    if (level >= LEVEL_MAX) return false;
    if (level - getQuintetoBaseLevel() >= QUINTETO_LEVEL_GAP_MAX) return false;
    return getEgoFuel() >= getLevelUpCost(level);
}

// El Despertar no depende del Quinteto — cualquier personaje puede
// subirlo si le llegan las Esencias suyas.
function canCharacterAwaken(character) {
    const cost = getAwakeningCost(character.rarity, getCharacterAwakening(character.id));
    if (cost === null) return false;
    return getEssenceBalance(character.id) >= cost;
}

// Aviso combinado para las cartas del roster: si cualquiera de las dos
// mejoras está disponible ahora mismo, se muestra el badge.
function hasCharacterUpgradeAvailable(character) {
    return canCharacterLevelUp(character) || canCharacterAwaken(character);
}

// Sala de Entrenamiento: genera Combustible de Ego pasivamente a un
// ritmo fijo una vez activada. "start" no cambia mientras siga activa
// (solo sirve para mostrar cuánto lleva encendida); "lastCollect" es lo
// que de verdad determina lo acumulado y se actualiza cada recogida.
// Pasadas TRAINING_CAP_HOURS sin recoger, deja de acumular más hasta
// que se recoja (no seguimos sumando indefinidamente).
const TRAINING_START_KEY = "bl_training_start";
const TRAINING_LAST_COLLECT_KEY = "bl_training_last_collect";
const TRAINING_BASE_RATE_PER_HOUR = 1500;
const TRAINING_CAP_HOURS = 24;

// Bonus PERMANENTE al ritmo de generación, ganado por victorias en
// Auto-run (+2/hora cada una, para siempre — no se pierde al perder
// una tanda, solo se detiene la racha de esa tanda). Tope duro de
// TRAINING_RATE_MAX/hora en total: una vez alcanzado, más victorias ya
// no siguen subiéndolo (pero sí siguen contando para el resultado de
// la tanda).
const TRAINING_RATE_BONUS_KEY = "bl_training_rate_bonus";
const TRAINING_RATE_MAX = 200;

function getTrainingRateBonus() {
    return parseInt(localStorage.getItem(TRAINING_RATE_BONUS_KEY), 10) || 0;
}

function addTrainingRateBonus(amount) {
    const maxBonus = TRAINING_RATE_MAX - TRAINING_BASE_RATE_PER_HOUR;
    const newBonus = Math.min(maxBonus, getTrainingRateBonus() + amount);
    localStorage.setItem(TRAINING_RATE_BONUS_KEY, String(newBonus));
}

function getTrainingRatePerHour() {
    return TRAINING_BASE_RATE_PER_HOUR + getTrainingRateBonus();
}

// El tope de acumulación son 24h de producción al ritmo ACTUAL (si el
// ritmo sube por Auto-run, el tope de 24h sube con él).
function getTrainingCapAmount() {
    return getTrainingRatePerHour() * TRAINING_CAP_HOURS;
}

function isTrainingActive() {
    return localStorage.getItem(TRAINING_START_KEY) !== null;
}

function startTraining() {
    if (isTrainingActive()) return;
    const now = String(Date.now());
    localStorage.setItem(TRAINING_START_KEY, now);
    localStorage.setItem(TRAINING_LAST_COLLECT_KEY, now);
}

function getTrainingStart() {
    const stored = localStorage.getItem(TRAINING_START_KEY);
    return stored ? parseInt(stored, 10) : null;
}

// Combustible acumulado desde la última recogida, ya con el tope de
// getTrainingCapAmount() aplicado.
function getTrainingAccrued() {
    if (!isTrainingActive()) return 0;
    const lastCollect = parseInt(localStorage.getItem(TRAINING_LAST_COLLECT_KEY), 10) || Date.now();
    const elapsedHours = (Date.now() - lastCollect) / 3600000;
    const cappedHours = Math.min(elapsedHours, TRAINING_CAP_HOURS);
    return Math.min(getTrainingCapAmount(), Math.floor(cappedHours * getTrainingRatePerHour()));
}

// Suma lo acumulado al saldo de Combustible de Ego y reinicia el
// contador a 0 sin detener la generación (el "start" original se
// conserva).
function collectTraining() {
    const amount = getTrainingAccrued();
    if (amount > 0) {
        setEgoFuel(getEgoFuel() + amount);
    }
    localStorage.setItem(TRAINING_LAST_COLLECT_KEY, String(Date.now()));
    return amount;
}

// Equipamiento: 4 objetos globales (uno por slot), sin inventario ni
// asignación por personaje — su bonus de nivel se aplica automáticamente
// a la stat correspondiente de TODOS los personajes ya desbloqueados.
// No se obtienen de ninguna fuente ni se guardan aparte: su nivel es
// SIEMPRE el nivel base del equipo (mínimo del Quinteto Principal),
// así que se mantienen sincronizados solos en cuanto ese nivel cambia.
const EQUIPMENT_SLOTS = ["botas", "munequeras", "accesorio", "guantes"];
const EQUIPMENT_STAT_BY_SLOT = {
    botas: "tiro",
    munequeras: "tecnica",
    accesorio: "defensa",
    guantes: "parada",
};
const EQUIPMENT_LABEL_BY_SLOT = {
    botas: "Botas",
    munequeras: "Muñequeras",
    accesorio: "Accesorio",
    guantes: "Guantes",
};
const EQUIPMENT_ICON_BY_SLOT = {
    botas: "👟",
    munequeras: "🔗",
    accesorio: "📿",
    guantes: "🧤",
};
const EQUIPMENT_STAT_LABEL = {
    tiro: "Tiro",
    tecnica: "Técnica",
    defensa: "Defensa",
    parada: "Parada",
};

// Nivel actual de los 4 objetos: siempre el nivel base del equipo (el
// slot más bajo de los 5 del Quinteto Principal).
function getEquipmentLevel() {
    return getQuintetoBaseLevel();
}

function getEquipment() {
    const nivel = getEquipmentLevel();
    const equipment = {};
    EQUIPMENT_SLOTS.forEach((slot) => {
        equipment[slot] = { nivel };
    });
    return equipment;
}

// Bonus plano para una stat concreta ("tiro"/"tecnica"/"defensa"/
// "parada"): al haber exactamente un slot por stat y estar todos al
// mismo nivel, el bonus es directamente ese nivel.
function getEquipmentStatBonus(statKey) {
    return getEquipmentLevel();
}

// Personajes desbloqueados por el jugador vía gacha, además de los que
// characters-data.js ya trae marcados unlocked:true de fábrica. Se
// guardan aparte (en vez de mutar characters-data.js, que es código
// fuente estático) y isCharacterUnlocked() combina ambas fuentes —
// cualquier pantalla que necesite saber si un personaje está
// desbloqueado debe usar esta función, no leer character.unlocked
// directamente.
const UNLOCKED_OVERRIDE_KEY = "bl_unlocked_characters";

function getUnlockedOverrides() {
    try {
        const parsed = JSON.parse(localStorage.getItem(UNLOCKED_OVERRIDE_KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function unlockCharacter(characterId) {
    const overrides = getUnlockedOverrides();
    if (!overrides.includes(characterId)) {
        overrides.push(characterId);
        localStorage.setItem(UNLOCKED_OVERRIDE_KEY, JSON.stringify(overrides));
    }
}

function isCharacterUnlocked(character) {
    return character.unlocked || getUnlockedOverrides().includes(character.id);
}

const PLAYER_NAME_FONT_MIN_PX = 14;
const PLAYER_NAME_FONT_MAX_PX = 40;
const PLAYER_NAME_FILL_RATIO = 0.7;
const PLAYER_NAME_HEIGHT_FILL_RATIO = 0.55;

let playerNameMeasureCanvas = null;

function measureTextWidth(text, fontSizePx) {
    if (!playerNameMeasureCanvas) {
        playerNameMeasureCanvas = document.createElement("canvas");
    }
    const ctx = playerNameMeasureCanvas.getContext("2d");
    ctx.font = `700 ${fontSizePx}px sans-serif`;
    return ctx.measureText(text).width;
}

function computeFitFontSize(text, boxWidthPx, boxHeightPx) {
    const referenceSize = 16;
    const measured = measureTextWidth(text || " ", referenceSize);
    const scale = (boxWidthPx * PLAYER_NAME_FILL_RATIO) / measured;
    const widthFitSize = referenceSize * scale;
    const heightCap = boxHeightPx * PLAYER_NAME_HEIGHT_FILL_RATIO;
    const maxSize = Math.min(PLAYER_NAME_FONT_MAX_PX, heightCap);
    return Math.max(PLAYER_NAME_FONT_MIN_PX, Math.min(maxSize, widthFitSize));
}

// Crea un editor de nombre "click para editar" reutilizable. getBoxSize
// debe devolver el { width, height } en px del hueco disponible para el
// texto, para que el tamaño de fuente se ajuste a ese hueco concreto
// (la pastilla de la Home y el campo del Menú tienen huecos distintos).
function createPlayerNameEditor({ display, input, getBoxSize }) {
    if (!display || !input) return;

    function applyFit(el, text) {
        const box = getBoxSize();
        el.style.fontSize = computeFitFontSize(text, box.width, box.height) + "px";
    }

    function refreshDisplay() {
        const name = getPlayerName();
        display.textContent = name;
        applyFit(display, name);
    }

    refreshDisplay();

    function enterEditMode() {
        const name = getPlayerName();
        input.value = name;
        applyFit(input, name);
        display.hidden = true;
        input.hidden = false;
        input.focus();
        input.select();
    }

    function exitEditMode(save) {
        if (save) {
            setPlayerName(input.value);
            refreshDisplay();
        }
        input.hidden = true;
        display.hidden = false;
    }

    display.addEventListener("click", enterEditMode);

    input.addEventListener("input", () => {
        applyFit(input, input.value);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            exitEditMode(true);
        } else if (event.key === "Escape") {
            exitEditMode(false);
        }
    });

    input.addEventListener("blur", () => exitEditMode(true));
}

// La Home solo MUESTRA el nombre (solo lectura) — el nombre se edita
// exclusivamente desde Menú > Personalizar nombre. Como cada pantalla
// vuelve a leer getPlayerName() al cargar, un cambio hecho en Menú ya
// se refleja aquí sin más: solo cambia dónde se puede editar.
function initHomePlayerNameDisplay() {
    const display = document.getElementById("player-name-display");
    const container = document.getElementById("brand-badge");
    if (!display || !container) return;

    // Debe coincidir con las % de #player-name-display en css/style.css
    // (posición y tamaño del hueco de texto dentro de la pastilla,
    // medidos sobre #brand-badge).
    const widthRatio = 1 - 0.4 - 0.11;
    const heightRatio = 0.2657;

    const name = getPlayerName();
    display.textContent = name;
    const rect = container.getBoundingClientRect();
    const fontSize = computeFitFontSize(name, rect.width * widthRatio, rect.height * heightRatio);
    display.style.fontSize = fontSize + "px";
}

// Mide, sobre un <img> ya cargado, en qué fracción de su altura (0-1)
// empieza el contenido visible (primer píxel no transparente), escaneando
// de arriba a abajo. Misma técnica de escaneo alfa usada para medir los
// iconos del menú inferior.
function measureContentTopFraction(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const alphaThreshold = 15;
    let data;
    try {
        data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (e) {
        return 0;
    }
    for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 4) {
            if (data[(y * canvas.width + x) * 4 + 3] > alphaThreshold) {
                return y / canvas.height;
            }
        }
    }
    return 0;
}

// Mide qué fracción del alto de la miniatura queda como margen vacío
// por encima del personaje cuando esta imagen se muestra "tal cual"
// (object-position:top, sin ajustar). Se usa la primera imagen del
// roster como referencia: su encuadre no se toca nunca.
function measureReferenceMarginFraction(img) {
    return new Promise((resolve) => {
        function compute() {
            const aspect = img.naturalHeight / img.naturalWidth;
            resolve(measureContentTopFraction(img) * aspect);
        }
        if (img.complete && img.naturalWidth > 0) {
            compute();
        } else {
            img.addEventListener("load", compute, { once: true });
        }
    });
}

// Ajusta object-position de una miniatura recortada (object-fit:cover)
// para que el margen visible por encima del personaje coincida con el
// de la imagen de referencia (referenceMarginFraction), en vez de
// recortar a margen cero. Así los personajes con menos aire "de
// fábrica" en su sprite (p.ej. porque el dibujo llega hasta el borde
// superior del lienzo) quedan igual de encuadrados que el de
// referencia, sin tocar el encuadre de este último.
function alignThumbToReferenceMargin(img, referenceMarginFraction) {
    function applyPosition() {
        const aspect = img.naturalHeight / img.naturalWidth;
        if (aspect <= 1) return; // la fórmula asume una fuente más alta que ancha
        const contentTopFraction = measureContentTopFraction(img);
        const positionY = ((referenceMarginFraction - contentTopFraction * aspect) / (1 - aspect)) * 100;
        img.style.objectPosition = `center ${positionY}%`;
    }
    if (img.complete && img.naturalWidth > 0) {
        applyPosition();
    } else {
        img.addEventListener("load", applyPosition, { once: true });
    }
}

// Mide, sobre un <img> ya cargado, el rectángulo (0-1) que ocupa el
// contenido visible (píxeles no transparentes) dentro de su lienzo.
function measureContentBounds(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const alphaThreshold = 15;
    let data;
    try {
        data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (e) {
        return { left: 0, right: 1, top: 0, bottom: 1 };
    }
    let minX = canvas.width;
    let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;
    for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
            if (data[(y * canvas.width + x) * 4 + 3] > alphaThreshold) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (maxX < minX || maxY < minY) return { left: 0, right: 1, top: 0, bottom: 1 };
    return {
        left: minX / canvas.width,
        right: maxX / canvas.width,
        top: minY / canvas.height,
        bottom: maxY / canvas.height,
    };
}

// Mide qué fracción del ancho de su lienzo ocupa el personaje de
// referencia (el primero del roster). Usado por alignRealSpriteThumbs
// para igualar el "plano" de las miniaturas pequeñas entre personajes.
function measureReferenceContentWidthFraction() {
    return new Promise((resolve) => {
        const referenceCharacter = CHARACTER_ROSTER[0];
        const img = new Image();
        img.onload = () => {
            const bounds = measureContentBounds(img);
            resolve(bounds.right - bounds.left);
        };
        img.onerror = () => resolve(null);
        img.src = resolveAssetPath(referenceCharacter.sprite);
    });
}

// Hace zoom (object-fit:cover) sobre el personaje que ocupa menos
// ancho de su propio lienzo que el de referencia, para que todos se
// vean con el mismo "plano" dentro de la carta.
function applyThumbWidthScale(img, referenceContentWidthFraction) {
    function apply() {
        const bounds = measureContentBounds(img);
        const widthFraction = bounds.right - bounds.left;
        if (!widthFraction) return;
        const scale = referenceContentWidthFraction / widthFraction;
        img.style.transform = `scale(${scale})`;
    }
    if (img.complete && img.naturalWidth > 0) {
        apply();
    } else {
        img.addEventListener("load", apply, { once: true });
    }
}

// Aplica a todas las miniaturas con sprite real que coincidan con el
// selector dado el mismo encuadre (margen superior + ancho aparente)
// que el personaje de referencia (CHARACTER_ROSTER[0]) — para que el
// "plano" sea igual en cualquier carta pequeña (Jugadores, F5, F11),
// sea cual sea el personaje. Los placeholders no se tocan: al ser
// siempre el mismo archivo, ya son consistentes entre sí.
function alignRealSpriteThumbs(selector) {
    const targets = [...document.querySelectorAll(selector)];
    if (!targets.length) return;
    const referenceCharacter = CHARACTER_ROSTER[0];
    if (!referenceCharacter) return;

    const referenceImg = new Image();
    referenceImg.onload = () => {
        measureReferenceMarginFraction(referenceImg).then((referenceMarginFraction) => {
            targets.forEach((img) => alignThumbToReferenceMargin(img, referenceMarginFraction));
        });
    };
    referenceImg.src = resolveAssetPath(referenceCharacter.sprite);

    measureReferenceContentWidthFraction().then((referenceContentWidthFraction) => {
        if (!referenceContentWidthFraction) return;
        targets.forEach((img) => applyThumbWidthScale(img, referenceContentWidthFraction));
    });
}

// CHARACTER_ROSTER (usado por la Home) no trae alturaCm propio — se
// cruza por la ruta del sprite con CHARACTERS_DATA, el único dato que
// comparten literalmente ambos roster (mismo patrón que
// isHomeCharacterUnlocked en menu.js).
function getCharacterHeightScale(character) {
    const match = CHARACTERS_DATA.find((c) => c.sprite === character.sprite);
    const alturaCm = (match && typeof match.alturaCm === "number") ? match.alturaCm : HOME_SPRITE_HEIGHT_DEFAULT_CM;
    const rawScale = alturaCm / HOME_SPRITE_HEIGHT_REFERENCE_CM;
    return Math.min(HOME_SPRITE_HEIGHT_SCALE_MAX, Math.max(HOME_SPRITE_HEIGHT_SCALE_MIN, rawScale));
}

// #isagi-sprite tiene ancho y alto FIJOS en CSS (object-fit:cover), así
// que cualquier sprite nuevo queda encuadrado de forma consistente sin
// necesidad de medir ni escalar nada: object-position decide qué parte
// del personaje se prioriza (por defecto la cabeza, arriba-centro) y
// el resto se recorta solo. Un personaje concreto puede sobrescribir
// ese encuadre por defecto añadiendo "homeImagePosition" a su entrada
// en CHARACTER_ROSTER (ej. "center 30%"), solo si de verdad hace falta.
// El escalado por altura se aplica sobre transform-origin:bottom center
// (ver style.css), así que crece/encoge desde los pies hacia arriba,
// como una diferencia de altura real.
function initHomeCharacterSprite() {
    const sprite = document.getElementById("isagi-sprite");
    if (!sprite) return;
    const character = getHomeCharacter();
    sprite.alt = character.name;
    sprite.src = resolveAssetPath(character.sprite);
    sprite.style.objectPosition = character.homeImagePosition || HOME_IMAGE_POSITION_DEFAULT;
    const heightScale = getCharacterHeightScale(character);
    sprite.style.transform = `translateX(-50%) scale(${heightScale})`;
}

// Reduce el font-size de un texto hasta que quepa en el ancho
// disponible de su propia caja, en vez de recortarlo (ellipsis) o
// dejar que se salga visualmente — pensado para contadores numéricos
// en pastillas de tamaño fijo, donde una cifra muy larga podría no
// caber al tamaño por defecto. Guarda el tamaño "base" la primera vez
// para partir siempre de ahí, no seguir encogiendo en llamadas
// sucesivas si el número luego se acorta.
function fitTextToWidth(el, minFontSizePx) {
    if (!el.dataset.baseFontSize) {
        el.dataset.baseFontSize = parseFloat(getComputedStyle(el).fontSize);
    }
    const baseFontSize = parseFloat(el.dataset.baseFontSize);
    const min = minFontSizePx || baseFontSize * 0.5;
    let fontSize = baseFontSize;
    el.style.fontSize = fontSize + "px";
    while (el.scrollWidth > el.clientWidth && fontSize > min) {
        fontSize -= 1;
        el.style.fontSize = fontSize + "px";
    }
}

// Pinta el saldo real de diamantes (getDiamonds()) sobre el hueco vacío
// de diamantes-badge.png. Como cada página vuelve a leer localStorage al
// cargar, volver a la Home tras gastar diamantes en el Gacha ya muestra
// el saldo actualizado sin nada más que hacer aquí.
function initHomeDiamondDisplay() {
    const display = document.getElementById("diamond-count-display");
    if (!display) return;
    display.textContent = getDiamonds().toLocaleString("es-ES");
    fitTextToWidth(display, 11);
}

// ===================================================================
// Misiones: modal superpuesto, disponible desde cualquier página que
// cargue main.js. "Diarias" se resetean solas cada día; "Normales" son
// permanentes (una vez reclamadas, quedan reclamadas para siempre). La
// pestaña "Evento" sigue siendo un placeholder a la espera de tener
// misiones de evento que poner ahí.
// ===================================================================

const MISSIONS_RESET_DATE_KEY = "bl_missions_reset_date";
const MISSIONS_PROGRESS_KEY = "bl_missions_progress";
const MISSIONS_CLAIMED_KEY = "bl_missions_claimed";

const DAILY_MISSIONS = [
    { id: "login", title: "Inicia sesión", target: 1, reward: 100 },
    { id: "levelUp", title: "Sube de nivel a 1 jugador", target: 1, reward: 100 },
    { id: "playMatch", title: "Juega 1 partido", target: 1, reward: 100 },
];

function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Si la fecha guardada de "último reset" no es la de hoy, vacía
// progreso y reclamaciones de las diarias. No hace falta cron ni nada
// que corra en segundo plano: el primer acceso a misiones de un día
// nuevo dispara el reset solo, porque esta función se llama al
// principio de cualquier lectura o escritura de misiones.
function ensureDailyMissionsFresh() {
    const today = getTodayDateString();
    if (localStorage.getItem(MISSIONS_RESET_DATE_KEY) !== today) {
        localStorage.setItem(MISSIONS_RESET_DATE_KEY, today);
        localStorage.setItem(MISSIONS_PROGRESS_KEY, "{}");
        localStorage.setItem(MISSIONS_CLAIMED_KEY, "{}");
    }
}

function readMissionsState(key) {
    ensureDailyMissionsFresh();
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function getMissionProgress(missionId) {
    return readMissionsState(MISSIONS_PROGRESS_KEY)[missionId] || 0;
}

function setMissionProgress(missionId, value) {
    const progress = readMissionsState(MISSIONS_PROGRESS_KEY);
    progress[missionId] = value;
    localStorage.setItem(MISSIONS_PROGRESS_KEY, JSON.stringify(progress));
}

function isMissionClaimed(missionId) {
    return !!readMissionsState(MISSIONS_CLAIMED_KEY)[missionId];
}

function isMissionComplete(mission) {
    return getMissionProgress(mission.id) >= mission.target;
}

// Reclama una misión diaria: sube su recompensa al saldo real de
// diamantes (mismo getDiamonds/setDiamonds que usa el Gacha) y la
// marca como reclamada. Devuelve false sin hacer nada si todavía no
// está completada o si ya se reclamó hoy, para que quien la llame no
// tenga que repetir esas comprobaciones.
function claimDailyMission(missionId) {
    const mission = DAILY_MISSIONS.find((m) => m.id === missionId);
    if (!mission || isMissionClaimed(missionId) || !isMissionComplete(mission)) return false;
    const claimed = readMissionsState(MISSIONS_CLAIMED_KEY);
    claimed[missionId] = true;
    localStorage.setItem(MISSIONS_CLAIMED_KEY, JSON.stringify(claimed));
    setDiamonds(getDiamonds() + mission.reward);
    return true;
}

// La misión "Inicia sesión" se completa sola nada más abrir el juego
// ese día. main.js se carga en todas las páginas, así que basta con
// llamar esto una vez al arrancar cualquiera de ellas.
function registerDailyLogin() {
    if (getMissionProgress("login") < 1) {
        setMissionProgress("login", 1);
    }
}

// Misiones Normales: a diferencia de las Diarias, son PERMANENTES — no
// se resetean nunca (ensureDailyMissionsFresh no las toca en absoluto,
// usan sus propios keys aparte). Su progreso no se empuja a mano como
// el de las diarias: cada una trae su propia getProgress() que lo
// calcula al vuelo a partir del estado real del juego (contadores de
// por vida que se acumulan para siempre, o datos ya existentes como el
// roster desbloqueado o los mapas completados) — así nunca puede
// desincronizarse. Solo hace falta guardar qué misiones ya se han
// reclamado, en un key aparte del de las diarias para que no se borre.
const LIFETIME_MATCHES_KEY = "bl_lifetime_matches_played";
const LIFETIME_LEVELUPS_KEY = "bl_lifetime_levelups";
const LIFETIME_GOALS_KEY = "bl_lifetime_goals_scored";
const NORMAL_MISSIONS_CLAIMED_KEY = "bl_normal_missions_claimed";

function getLifetimeMatchesPlayed() {
    return parseInt(localStorage.getItem(LIFETIME_MATCHES_KEY), 10) || 0;
}

function incrementLifetimeMatchesPlayed() {
    localStorage.setItem(LIFETIME_MATCHES_KEY, String(getLifetimeMatchesPlayed() + 1));
}

function getLifetimeLevelUps() {
    return parseInt(localStorage.getItem(LIFETIME_LEVELUPS_KEY), 10) || 0;
}

function incrementLifetimeLevelUps() {
    localStorage.setItem(LIFETIME_LEVELUPS_KEY, String(getLifetimeLevelUps() + 1));
}

function getLifetimeGoalsScored() {
    return parseInt(localStorage.getItem(LIFETIME_GOALS_KEY), 10) || 0;
}

function addLifetimeGoalsScored(amount) {
    localStorage.setItem(LIFETIME_GOALS_KEY, String(getLifetimeGoalsScored() + amount));
}

// Genera una racha lineal de niveles cada `step` unidades desde `start`
// hasta `max` (incluido siempre como último nivel, aunque no caiga
// justo en un múltiplo de `step` — así el tope real del roster actual
// nunca queda fuera de la racha). Mismo premio en diamantes en TODOS
// los niveles de la racha, sin progresión.
function buildLinearTiers(start, step, max, reward) {
    const tiers = [];
    let target = start;
    while (target < max) {
        tiers.push({ target, reward });
        target += step;
    }
    tiers.push({ target: max, reward });
    return tiers;
}

// Rachas de misiones por niveles (p.ej. desbloquear 15, 20, 25... 55 y
// 59 jugadores) — en vez de mostrar todos los niveles como filas
// separadas, SOLO se muestra el nivel actual (el primero sin reclamar)
// en una única fila; al reclamarlo, la fila pasa sola al siguiente
// nivel de la racha en el próximo render (ver
// getCurrentGroupTier/buildGroupMissionEntry más abajo). Así la lista
// no crece con el número de niveles, aunque la racha tenga muchos.
// getTiers es una función (no un array fijo) porque Desbloquea/
// Despertares dependen de CHARACTERS_DATA, que characters-data.js
// carga DESPUÉS de main.js — evaluarlo aquí mismo, al construir este
// array, rompería con "CHARACTERS_DATA is not defined".
const NORMAL_MISSION_GROUPS = [
    { idPrefix: "matchesPlayed", titleFn: (t) => `Juega ${t} partidos`, getProgress: () => getLifetimeMatchesPlayed(), getTiers: () => buildLinearTiers(5, 5, 5000, 200) },
    { idPrefix: "levelUps", titleFn: (t) => `Sube de nivel ${t} veces`, getProgress: () => getLifetimeLevelUps(), getTiers: () => buildLinearTiers(5, 5, 5000, 200) },
    { idPrefix: "goals", titleFn: (t) => `Marca ${t} goles`, getProgress: () => getLifetimeGoalsScored(), getTiers: () => buildLinearTiers(5, 5, 5000, 200) },
    // Máximo posible con el roster actual: CHARACTERS_DATA.length
    // jugadores (59 ahora mismo) — de 15 en 15... en pasos de 5 hasta
    // llegar justo a ese tope, aunque no sea múltiplo de 5 (59, no 60).
    { idPrefix: "unlock", titleFn: (t) => `Desbloquea ${t} jugadores`, getProgress: () => CHARACTERS_DATA.filter(isCharacterUnlocked).length, getTiers: () => buildLinearTiers(15, 5, CHARACTERS_DATA.length, 200) },
    // Máximo posible: cada uno de los CHARACTERS_DATA.length personajes
    // a Despertar máximo (AWAKENING_MAX) — 590 ahora mismo (59 × 10).
    { idPrefix: "awakenings", titleFn: (t) => `Consigue ${t} Despertares`, getProgress: () => CHARACTERS_DATA.reduce((sum, c) => sum + getCharacterAwakening(c.id), 0), getTiers: () => buildLinearTiers(5, 5, CHARACTERS_DATA.length * AWAKENING_MAX, 200) },
];

// totalMatches de Historia: solo los capítulos "de partidos" cuentan
// (la Introducción es narrativa, se lee, no se "completa" jugando).
// Fichajes/Desafíos/Historia se quedan como misión única ("complétalo
// del todo") en vez de por niveles — ya son metas pequeñas y acotadas
// (6 nodos, 8 mapas, 2 capítulos), no una racha larga como el resto.
const NORMAL_MISSIONS_SINGLE = [
    { id: "transfersAll", title: "Completa el Mapa de Fichajes", target: TRANSFER_NODES.length, reward: 200, getProgress: () => TRANSFER_NODES.filter(isTransferNodeCompleted).length },
    { id: "challengesAll", title: "Completa todos los mapas de Desafíos", target: CHALLENGE_MAPS.length, reward: 200, getProgress: () => CHALLENGE_MAPS.filter((m) => getChallengeProgress(m.key) >= CHALLENGE_MATCHES_PER_MAP).length },
    { id: "storyAll", title: "Completa la Historia", target: STORY_CHAPTERS.filter((c) => c.kind === "matches").length, reward: 200, getProgress: () => STORY_CHAPTERS.filter((c) => c.kind === "matches" && isStoryChapterFullyCompleted(c.key)).length },
];

// El nivel "actual" de una racha es el primero sin reclamar; si ya se
// reclamaron los 5, se queda mostrando el último (racha agotada, el
// botón de Reclamar simplemente no vuelve a activarse).
function getCurrentGroupTier(group) {
    const tiers = group.getTiers();
    return tiers.find((tier) => !isNormalMissionClaimed(`${group.idPrefix}${tier.target}`)) || tiers[tiers.length - 1];
}

function buildGroupMissionEntry(group) {
    const tier = getCurrentGroupTier(group);
    return {
        id: `${group.idPrefix}${tier.target}`,
        title: group.titleFn(tier.target),
        target: tier.target,
        reward: tier.reward,
        getProgress: group.getProgress,
    };
}

// Lista de Misiones Normales a mostrar AHORA MISMO: una fila por racha
// (su nivel actual) más las 3 fijas — se recalcula cada vez que se
// llama en vez de guardarse una sola vez, porque el nivel "actual" de
// cada racha cambia según lo que ya se haya reclamado.
function getNormalMissions() {
    return [...NORMAL_MISSION_GROUPS.map(buildGroupMissionEntry), ...NORMAL_MISSIONS_SINGLE];
}

function readNormalMissionsClaimed() {
    try {
        const parsed = JSON.parse(localStorage.getItem(NORMAL_MISSIONS_CLAIMED_KEY));
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function isNormalMissionComplete(mission) {
    return mission.getProgress() >= mission.target;
}

function isNormalMissionClaimed(missionId) {
    return !!readNormalMissionsClaimed()[missionId];
}

function claimNormalMission(missionId) {
    const mission = getNormalMissions().find((m) => m.id === missionId);
    if (!mission || isNormalMissionClaimed(missionId) || !isNormalMissionComplete(mission)) return false;
    const claimed = readNormalMissionsClaimed();
    claimed[missionId] = true;
    localStorage.setItem(NORMAL_MISSIONS_CLAIMED_KEY, JSON.stringify(claimed));
    setDiamonds(getDiamonds() + mission.reward);
    return true;
}

// Evento todavía no tiene misiones reales (solo "Próximamente"), así
// que de momento esto mira Diarias + Normales.
function hasAnyClaimableMission() {
    const dailyClaimable = DAILY_MISSIONS.some((mission) => isMissionComplete(mission) && !isMissionClaimed(mission.id));
    const normalClaimable = getNormalMissions().some((mission) => isNormalMissionComplete(mission) && !isNormalMissionClaimed(mission.id));
    return dailyClaimable || normalClaimable;
}

let missionsActiveTab = "daily";

function buildMissionRowMarkup(mission) {
    const progress = getMissionProgress(mission.id);
    const complete = isMissionComplete(mission);
    const claimed = isMissionClaimed(mission.id);

    const actionHtml = claimed
        ? `<span class="mission-claimed-label">✓ Reclamada</span>`
        : `<button class="mission-claim-btn" type="button" data-mission="${mission.id}" data-kind="daily" ${complete ? "" : "disabled"}>Reclamar</button>`;

    return `
        <div class="mission-row${claimed ? " is-claimed" : ""}">
            <div class="mission-info">
                <span class="mission-title">${mission.title}</span>
                <span class="mission-progress">${progress}/${mission.target}</span>
            </div>
            <div class="mission-reward">
                <span class="mission-reward-amount"><span class="diamond-icon"><img src="${resolveAssetPath("assets/ui/diamond-icon.webp")}" alt=""></span>${mission.reward}</span>
                ${actionHtml}
            </div>
        </div>
    `;
}

// Misma marca que buildMissionRowMarkup (Diarias), pero leyendo el
// progreso de mission.getProgress() en vez de getMissionProgress(id) —
// las Normales no tienen un valor "empujado" a mano, se recalculan
// solas cada vez que se pintan.
function buildNormalMissionRowMarkup(mission) {
    const progress = Math.min(mission.target, mission.getProgress());
    const complete = isNormalMissionComplete(mission);
    const claimed = isNormalMissionClaimed(mission.id);

    const actionHtml = claimed
        ? `<span class="mission-claimed-label">✓ Reclamada</span>`
        : `<button class="mission-claim-btn" type="button" data-mission="${mission.id}" data-kind="normal" ${complete ? "" : "disabled"}>Reclamar</button>`;

    return `
        <div class="mission-row${claimed ? " is-claimed" : ""}">
            <div class="mission-info">
                <span class="mission-title">${mission.title}</span>
                <span class="mission-progress">${progress}/${mission.target}</span>
            </div>
            <div class="mission-reward">
                <span class="mission-reward-amount"><span class="diamond-icon"><img src="${resolveAssetPath("assets/ui/diamond-icon.webp")}" alt=""></span>${mission.reward}</span>
                ${actionHtml}
            </div>
        </div>
    `;
}

function renderMissionsModal() {
    const overlay = document.getElementById("missions-overlay");
    if (!overlay) return;

    overlay.querySelectorAll(".missions-tab").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.tab === missionsActiveTab);
    });

    const body = overlay.querySelector("#missions-body");
    if (missionsActiveTab === "daily") {
        body.innerHTML = DAILY_MISSIONS.map(buildMissionRowMarkup).join("");
    } else if (missionsActiveTab === "normal") {
        body.innerHTML = getNormalMissions().map(buildNormalMissionRowMarkup).join("");
    } else {
        body.innerHTML = `<p class="missions-empty">Próximamente</p>`;
    }

    updateHomeMissionsIndicator();
}

// El icono de misiones de la Home SIEMPRE está visible (hace falta
// para poder abrir el menú en cualquier momento) — lo único que se
// muestra/oculta es el punto de notificación superpuesto, según haya
// o no algo reclamable ahora mismo. Se llama también desde
// renderMissionsModal() (páginas que no sean la Home no tienen
// #missions-notification-dot, así que ahí simplemente no hace nada).
function updateHomeMissionsIndicator() {
    const dot = document.getElementById("missions-notification-dot");
    if (!dot) return;
    dot.hidden = !hasAnyClaimableMission();
}

function ensureMissionsOverlay() {
    let overlay = document.getElementById("missions-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "missions-overlay";
    overlay.className = "missions-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="missions-modal">
            <button class="missions-close" type="button" aria-label="Cerrar">×</button>
            <h2 class="missions-title">Misiones</h2>
            <div class="missions-tabs">
                <button class="missions-tab" type="button" data-tab="daily">Diarias</button>
                <button class="missions-tab" type="button" data-tab="normal">Normales</button>
                <button class="missions-tab" type="button" data-tab="event">Evento</button>
            </div>
            <div class="missions-body" id="missions-body"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeMissionsModal();
    });
    overlay.querySelector(".missions-close").addEventListener("click", closeMissionsModal);
    overlay.querySelectorAll(".missions-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
            missionsActiveTab = btn.dataset.tab;
            renderMissionsModal();
        });
    });
    overlay.querySelector(".missions-body").addEventListener("click", (event) => {
        const btn = event.target.closest(".mission-claim-btn");
        if (!btn || btn.disabled) return;
        const claimFn = btn.dataset.kind === "normal" ? claimNormalMission : claimDailyMission;
        if (claimFn(btn.dataset.mission)) {
            renderMissionsModal();
            initHomeDiamondDisplay();
        }
    });

    return overlay;
}

function openMissionsModal() {
    const overlay = ensureMissionsOverlay();
    missionsActiveTab = "daily";
    renderMissionsModal();
    overlay.hidden = false;
}

function closeMissionsModal() {
    const overlay = document.getElementById("missions-overlay");
    if (overlay) overlay.hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
    initHomePlayerNameDisplay();
    initHomeDiamondDisplay();
    registerDailyLogin();
    updateHomeMissionsIndicator();

    // El progreso de las misiones casi siempre cambia en OTRA página
    // (subir de nivel, jugar un partido...), así que un solo cálculo al
    // cargar la Home no basta: se reevalúa cada pocos segundos mientras
    // la Home esté abierta, para que el icono aparezca/desaparezca solo
    // en cuanto el estado real cambie, sin quedarse fijo.
    setInterval(updateHomeMissionsIndicator, 2000);
});

// Si el navegador restaura la Home desde su caché de "atrás" (botón
// atrás/adelante), DOMContentLoaded no vuelve a dispararse — sin esto,
// el icono se quedaría con el estado de cuando se abandonó la página.
window.addEventListener("pageshow", updateHomeMissionsIndicator);

// Aviso de nueva versión disponible. Ir por el Service Worker
// ("controllerchange") no valía: ese evento SOLO salta si sw.js en sí
// cambia de bytes, y casi ningún cambio real (CSS/JS/HTML de las
// pantallas) toca ese archivo — en la práctica casi nunca disparaba.
// En su lugar, version.txt (un simple timestamp, un archivo suelto
// más en el repo) se descarga SIEMPRE fresco (cache:"no-store", sin
// pasar por el Service Worker ni la caché HTTP) al abrir cualquier
// página y de nuevo cada vez que se recupera el foco — si el valor ya
// no coincide con el que se leyó al cargar esta página, es que hay una
// versión nueva publicada. Recuerda actualizar version.txt en cada
// commit que cambie algo visible, si no este aviso no se entera.
(function initUpdateNotice() {
    const versionUrl = resolveAssetPath("version.txt");
    let initialVersion = null;

    function fetchVersion() {
        return fetch(versionUrl, { cache: "no-store" })
            .then((r) => (r.ok ? r.text() : null))
            .then((text) => (text ? text.trim() : null))
            .catch(() => null);
    }

    function showUpdateBanner() {
        if (document.getElementById("update-banner")) return;
        const banner = document.createElement("div");
        banner.id = "update-banner";
        banner.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:10px;background:#0d1424;border:1px solid #7fa8ff;border-radius:999px;padding:10px 10px 10px 16px;box-shadow:0 6px 20px rgba(0,0,0,0.5);font-family:sans-serif;max-width:92vw;";
        banner.innerHTML = `
            <span style="color:#fff;font-size:13px;font-weight:600;white-space:nowrap;">Hay una versión nueva</span>
            <button type="button" style="background:#7fa8ff;color:#0a0f1c;border:none;border-radius:999px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;">Recargar</button>
        `;
        banner.querySelector("button").addEventListener("click", () => window.location.reload());
        document.body.appendChild(banner);
    }

    function checkForUpdate() {
        if (initialVersion === null) return;
        fetchVersion().then((current) => {
            if (current && current !== initialVersion) showUpdateBanner();
        });
    }

    fetchVersion().then((v) => {
        initialVersion = v;
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
    });
    window.addEventListener("focus", checkForUpdate);
    setInterval(checkForUpdate, 60000);
})();
