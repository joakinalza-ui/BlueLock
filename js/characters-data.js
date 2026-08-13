// Datos de los 59 jugadores del roster. Generado a partir de la lista
// pasada por el usuario: posición, elemento y rareza son los datos
// reales; statsLevel1/statsLevel100 se calculan con el reparto de pesos
// 40/28/20/12% sobre el poder total dado por rareza (★1: 85→2600,
// ★2: 100→2900, ★3: 118→3250), en el orden de stats por posición
// (DEL=tiro>tecnica>defensa>parada, MED=tecnica>tiro>defensa>parada,
// DEF=defensa>tecnica>tiro>parada, POR=parada>defensa>tiro>tecnica).
//
// PENDIENTE: solo se pasaron 55 de los 59 personajes (faltan 4) y a los
// 24 "★1 restantes" no se les dio elemento (element: null). Corregir
// aquí en cuanto se tengan esos datos.
const TOTAL_ROSTER_SIZE = 59;

// Huecos de habilidad genéricos para cualquier personaje que TODAVÍA no
// tenga sus propias pasivas definidas (character.passives ausente o
// vacío) — de momento solo Junichi/Keisuke Wanima tienen las suyas de
// verdad. "Próximamente" es un placeholder sin efecto real, a la
// espera de irlas rellenando una a una, pero el NIVEL de cada hueco ya
// se calcula y se muestra desde ya (mismo sistema que la Pasiva Única
// pero atado al NIVEL del personaje en vez del Despertar): cada 10
// niveles sube un nivel uno de los dos huecos, alternando (nivel 10 →
// Habilidad 1 Nv.1, nivel 20 → Habilidad 2 Nv.1, nivel 30 → Habilidad 1
// Nv.2...) hasta que ambos llegan a su nivel máximo (10) en el nivel
// máximo del personaje (200 = LEVEL_MAX).
const GENERIC_ABILITY_MAX_LEVEL = 10;
const GENERIC_ABILITY_SLOTS = [
    { name: "Habilidad 1", description: "Próximamente", icon: "❓", unlockLevel: 10 },
    { name: "Habilidad 2", description: "Próximamente", icon: "❓", unlockLevel: 20 },
];

const CHARACTERS_DATA = [
    {
        "id": "kisaburo-hijikata",
        "name": "Kisaburo Hijikata",
        "alturaCm": 178,
        "position": "POR",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/V/hijikata-sprite.webp",
        "techniques": [
            {
                "id": "kisaburo-hijikata-tech-0",
                "name": "Técnica Básica de Parada",
                "type": "parada",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "kisaburo-hijikata-tech-1",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kisaburo-hijikata-passive-0",
                "name": "Mejora de Parada +100",
                "icon": "🧤",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "kisaburo-hijikata-passive-1",
                "name": "Sinergia de Equipo V: Parada",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "V", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "parada": 34,
            "defensa": 24,
            "tiro": 17,
            "tecnica": 10
        },
        "statsLevel100": {
            "parada": 1040,
            "defensa": 728,
            "tiro": 520,
            "tecnica": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "wataru-kuon",
        "name": "Wataru Kuon",
        "alturaCm": 185,
        "position": "DEF",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/Z/kuon-sprite.webp",
        "techniques": [
            {
                "id": "wataru-kuon-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "wataru-kuon-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "wataru-kuon-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "wataru-kuon-passive-1",
                "name": "Mejora de Técnica +75",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "retsu-nerima",
        "name": "Retsu Nerima",
        "alturaCm": 182,
        "position": "DEF",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/V/nerima-sprite.webp",
        "techniques": [
            {
                "id": "retsu-nerima-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "retsu-nerima-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "retsu-nerima-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "retsu-nerima-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "kei-shishiya",
        "name": "Kei Shishiya",
        "alturaCm": 177,
        "position": "DEF",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/W/shisiya-sprite.webp",
        "techniques": [
            {
                "id": "kei-shishiya-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "kei-shishiya-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kei-shishiya-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "kei-shishiya-passive-1",
                "name": "Sinergia de Equipo W: Defensa",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "W", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "tsukoteru-eiyu",
        "name": "Tsukoteru Eiyu",
        "alturaCm": 176,
        "position": "DEF",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/X/eiyu-sprite.webp",
        "techniques": [
            {
                "id": "tsukoteru-eiyu-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "tsukoteru-eiyu-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "tsukoteru-eiyu-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "tsukoteru-eiyu-passive-1",
                "name": "Sinergia de Equipo X: Defensa",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "X", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "yudai-imamura",
        "name": "Yudai Imamura",
        "alturaCm": 178,
        "position": "MED",
        "element": "Aire",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/Z/imamura-sprite.webp",
        "techniques": [
            {
                "id": "yudai-imamura-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "yudai-imamura-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "yudai-imamura-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "yudai-imamura-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "asahi-naruhaya",
        "name": "Asahi Naruhaya",
        "alturaCm": 168,
        "position": "MED",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/Z/naruhaya-sprite.webp",
        "techniques": [
            {
                "id": "asahi-naruhaya-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "asahi-naruhaya-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "asahi-naruhaya-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "asahi-naruhaya-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "masumi-atatame",
        "name": "Masumi Atatame",
        "alturaCm": 180,
        "position": "MED",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/V/atatame-sprite.webp",
        "techniques": [
            {
                "id": "masumi-atatame-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "masumi-atatame-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "masumi-atatame-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "masumi-atatame-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "haato-meiji",
        "name": "Haato Meiji",
        "alturaCm": 185,
        "position": "MED",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/X/meji-sprite.webp",
        "techniques": [
            {
                "id": "haato-meiji-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "haato-meiji-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "haato-meiji-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "haato-meiji-passive-1",
                "name": "Sinergia de Equipo X: Técnica",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "X", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "yusei-amazora",
        "name": "Yusei Amazora",
        "alturaCm": 176,
        "position": "DEL",
        "element": "Aire",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/W/amazora-sprite.webp",
        "techniques": [
            {
                "id": "yusei-amazora-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "yusei-amazora-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "yusei-amazora-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "yusei-amazora-passive-1",
                "name": "Sinergia de Equipo W: Tiro",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "W", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "rian-sanga",
        "name": "Rian Sanga",
        "alturaCm": 186,
        "position": "DEL",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": true,
        "sprite": "assets/characters/sprites/X/sanga-sprite.webp",
        "techniques": [
            {
                "id": "rian-sanga-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "rian-sanga-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "rian-sanga-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "rian-sanga-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "isagi-yoichi",
        "name": "Isagi Yoichi",
        "alturaCm": 175,
        "position": "MED",
        "element": "Bosque",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Z/isagi-sprite.webp",
        "techniques": [
            {
                "id": "isagi-yoichi-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "isagi-yoichi-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "isagi-yoichi-passive-0",
                "name": "Mejora de Tiro",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "isagi-yoichi-passive-1",
                "name": "Mejora de Técnica",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 47,
            "tiro": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tecnica": 1300,
            "tiro": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "bachira-meguru",
        "name": "Bachira Meguru",
        "alturaCm": 176,
        "position": "MED",
        "element": "Aire",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Z/bachira-sprite.webp",
        "techniques": [
            {
                "id": "bachira-meguru-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "bachira-meguru-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "bachira-meguru-passive-0",
                "name": "Sinergia de Equipo Z: Técnica",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Z", "min": 3 } }
                ]
            },
            {
                "id": "bachira-meguru-passive-1",
                "name": "Mejora Supertécnicas Aire",
                "icon": "🌪️",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Aire", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 47,
            "tiro": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tecnica": 1300,
            "tiro": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "chigiri-hyoma",
        "name": "Chigiri Hyoma",
        "alturaCm": 177,
        "position": "DEF",
        "element": "Aire",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Z/chigiri-sprite.webp",
        "techniques": [
            {
                "id": "chigiri-hyoma-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "chigiri-hyoma-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "chigiri-hyoma-passive-0",
                "name": "Sinergia de Equipo Z: Defensa",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Z", "min": 3 } }
                ]
            },
            {
                "id": "chigiri-hyoma-passive-1",
                "name": "Mejora Supertécnicas Aire",
                "icon": "🌪️",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Aire", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 47,
            "tecnica": 33,
            "tiro": 24,
            "parada": 14
        },
        "statsLevel100": {
            "defensa": 1300,
            "tecnica": 910,
            "tiro": 650,
            "parada": 390
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "kunigami-rensuke",
        "name": "Kunigami Rensuke",
        "alturaCm": 188,
        "position": "DEL",
        "element": "Montaña",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Z/kunigami-sprite.webp",
        "techniques": [
            {
                "id": "kunigami-rensuke-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "kunigami-rensuke-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kunigami-rensuke-passive-0",
                "name": "Sinergia de Equipo Z: Tiro",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Z", "min": 3 } }
                ]
            },
            {
                "id": "kunigami-rensuke-passive-1",
                "name": "Mejora Supertécnicas Montaña",
                "icon": "⛰️",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Montaña", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 47,
            "tecnica": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tiro": 1300,
            "tecnica": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "nagi-seishiro",
        "name": "Nagi Seishiro",
        "alturaCm": 190,
        "position": "DEL",
        "element": "Bosque",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/nagi-sprite.webp",
        "techniques": [
            {
                "id": "nagi-seishiro-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "nagi-seishiro-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "nagi-seishiro-passive-0",
                "name": "Sinergia de Equipo V: Tiro",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "V", "min": 3 } }
                ]
            },
            {
                "id": "nagi-seishiro-passive-1",
                "name": "Mejora Supertécnicas Bosque",
                "icon": "🌳",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Bosque", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 47,
            "tecnica": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tiro": 1300,
            "tecnica": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "V"
    },
    {
        "id": "reo-mikage",
        "name": "Reo Mikage",
        "alturaCm": 185,
        "position": "MED",
        "element": "Bosque",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/reo-sprite.webp",
        "techniques": [
            {
                "id": "reo-mikage-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "reo-mikage-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "reo-mikage-passive-0",
                "name": "Sinergia de Equipo V: Técnica",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "V", "min": 3 } }
                ]
            },
            {
                "id": "reo-mikage-passive-1",
                "name": "Mejora Supertécnicas Bosque",
                "icon": "🌳",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Bosque", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 47,
            "tiro": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tecnica": 1300,
            "tiro": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "V"
    },
    {
        "id": "aryu-jyubei",
        "name": "Aryu Jyubei",
        "alturaCm": 195,
        "position": "DEF",
        "element": "Aire",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/sin-equipo/aryu-sprite.webp",
        "techniques": [
            {
                "id": "aryu-jyubei-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "aryu-jyubei-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "aryu-jyubei-passive-0",
                "name": "Mejora de Defensa +160",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 160, "trigger": "matchStart" }
                ]
            },
            {
                "id": "aryu-jyubei-passive-1",
                "name": "Mejora Supertécnicas Aire",
                "icon": "🌪️",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Aire", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 47,
            "tecnica": 33,
            "tiro": 24,
            "parada": 14
        },
        "statsLevel100": {
            "defensa": 1300,
            "tecnica": 910,
            "tiro": 650,
            "parada": 390
        },
        "equipoOriginal": null
    },
    {
        "id": "rin-itoshi",
        "name": "Rin Itoshi",
        "alturaCm": 175,
        "position": "DEL",
        "element": "Bosque",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/sin-equipo/rin-sprite.webp",
        "techniques": [
            {
                "id": "rin-itoshi-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "rin-itoshi-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "rin-itoshi-passive-0",
                "name": "Mejora de Tiro +160",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 160, "trigger": "matchStart" }
                ]
            },
            {
                "id": "rin-itoshi-passive-1",
                "name": "Mejora Supertécnicas Bosque",
                "icon": "🌳",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Bosque", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 47,
            "tecnica": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tiro": 1300,
            "tecnica": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": null
    },
    {
        "id": "shoei-barou",
        "name": "Shoei Barou",
        "alturaCm": 187,
        "position": "DEL",
        "element": "Fuego",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/barou-sprite.webp",
        "techniques": [
            {
                "id": "shoei-barou-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "shoei-barou-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "shoei-barou-passive-0",
                "name": "Sinergia de Equipo X: Tiro",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "X", "min": 3 } }
                ]
            },
            {
                "id": "shoei-barou-passive-1",
                "name": "Mejora Supertécnicas Fuego",
                "icon": "🔥",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Fuego", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 47,
            "tecnica": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tiro": 1300,
            "tecnica": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "X"
    },
    {
        "id": "zantetsu-tsurugi",
        "name": "Zantetsu Tsurugi",
        "alturaCm": 187,
        "position": "DEF",
        "element": "Aire",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/zantetsu-sprite.webp",
        "techniques": [
            {
                "id": "zantetsu-tsurugi-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "zantetsu-tsurugi-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "zantetsu-tsurugi-passive-0",
                "name": "Sinergia de Equipo V: Defensa",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "V", "min": 3 } }
                ]
            },
            {
                "id": "zantetsu-tsurugi-passive-1",
                "name": "Mejora Supertécnicas Aire",
                "icon": "🌪️",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Aire", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 47,
            "tecnica": 33,
            "tiro": 24,
            "parada": 14
        },
        "statsLevel100": {
            "defensa": 1300,
            "tecnica": 910,
            "tiro": 650,
            "parada": 390
        },
        "equipoOriginal": "V"
    },
    {
        "id": "ikki-niko",
        "name": "Ikki Niko",
        "alturaCm": 173,
        "position": "MED",
        "element": "Bosque",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/niko-sprite.webp",
        "techniques": [
            {
                "id": "ikki-niko-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "ikki-niko-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "ikki-niko-passive-0",
                "name": "Sinergia de Equipo Y: Técnica",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 160, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Y", "min": 3 } }
                ]
            },
            {
                "id": "ikki-niko-passive-1",
                "name": "Mejora Supertécnicas Bosque",
                "icon": "🌳",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Bosque", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 47,
            "tiro": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tecnica": 1300,
            "tiro": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "aoshi-tokimitsu",
        "name": "Aoshi Tokimitsu",
        "alturaCm": 183,
        "position": "MED",
        "element": "Montaña",
        "rarity": 3,
        "unlocked": false,
        "sprite": "assets/characters/sprites/sin-equipo/tokimitsu-sprite.webp",
        "techniques": [
            {
                "id": "aoshi-tokimitsu-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "aoshi-tokimitsu-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "aoshi-tokimitsu-passive-0",
                "name": "Mejora de Técnica +160",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 160, "trigger": "matchStart" }
                ]
            },
            {
                "id": "aoshi-tokimitsu-passive-1",
                "name": "Mejora Supertécnicas Montaña",
                "icon": "⛰️",
                "unlockLevel": 20,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Montaña", "baseAmount": 40, "perLevelAmount": 8, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 47,
            "tiro": 33,
            "defensa": 24,
            "parada": 14
        },
        "statsLevel100": {
            "tecnica": 1300,
            "tiro": 910,
            "defensa": 650,
            "parada": 390
        },
        "equipoOriginal": null
    },
    {
        "id": "kira-ryosuke",
        "name": "Kira Ryosuke",
        "alturaCm": 181,
        "position": "DEL",
        "element": "Aire",
        "rarity": 2,
        "unlocked": false,
        "sprite": "assets/characters/sprites/sin-equipo/kira-sprite.webp",
        "techniques": [
            {
                "id": "kira-ryosuke-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "kira-ryosuke-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kira-ryosuke-passive-0",
                "name": "Mejora Supertécnicas Aire",
                "icon": "🌪️",
                "unlockLevel": 10,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Aire", "baseAmount": 32, "perLevelAmount": 6, "trigger": "matchStart" }
                ]
            },
            {
                "id": "kira-ryosuke-passive-1",
                "name": "Mejora de Tiro +130",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 130, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 40,
            "tecnica": 28,
            "defensa": 20,
            "parada": 12
        },
        "statsLevel100": {
            "tiro": 1160,
            "tecnica": 812,
            "defensa": 580,
            "parada": 348
        },
        "equipoOriginal": null
    },
    {
        "id": "gagamaru-gin",
        "name": "Gagamaru Gin",
        "alturaCm": 191,
        "position": "DEL",
        "element": "Montaña",
        "rarity": 2,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Z/gagamaru-sprite.webp",
        "techniques": [
            {
                "id": "gagamaru-gin-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "gagamaru-gin-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "gagamaru-gin-passive-0",
                "name": "Sinergia de Equipo Z: Tiro",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 130, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Z", "min": 3 } }
                ]
            },
            {
                "id": "gagamaru-gin-passive-1",
                "name": "Mejora de Tiro +130",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 130, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 40,
            "tecnica": 28,
            "defensa": 20,
            "parada": 12
        },
        "statsLevel100": {
            "tiro": 1160,
            "tecnica": 812,
            "defensa": 580,
            "parada": 348
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "jingo-raichi",
        "name": "Jingo Raichi",
        "alturaCm": 182,
        "position": "DEF",
        "element": "Fuego",
        "rarity": 2,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Z/raichi-sprite.webp",
        "techniques": [
            {
                "id": "jingo-raichi-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "jingo-raichi-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "jingo-raichi-passive-0",
                "name": "Mejora Supertécnicas Fuego",
                "icon": "🔥",
                "unlockLevel": 10,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Fuego", "baseAmount": 32, "perLevelAmount": 6, "trigger": "matchStart" }
                ]
            },
            {
                "id": "jingo-raichi-passive-1",
                "name": "Mejora de Defensa +130",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 130, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 40,
            "tecnica": 28,
            "tiro": 20,
            "parada": 12
        },
        "statsLevel100": {
            "defensa": 1160,
            "tecnica": 812,
            "tiro": 580,
            "parada": 348
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "gurimu-igarashi",
        "name": "Gurimu Igarashi",
        "alturaCm": 172,
        "position": "DEF",
        "element": "Fuego",
        "rarity": 2,
        "unlocked": false,
        "gachaExcluded": true,
        "sprite": "assets/characters/sprites/Z/igaguri-sprite.webp",
        "techniques": [
            {
                "id": "gurimu-igarashi-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "gurimu-igarashi-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "gurimu-igarashi-passive-0",
                "name": "Sinergia de Equipo Z: Defensa",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 130, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Z", "min": 3 } }
                ]
            },
            {
                "id": "gurimu-igarashi-passive-1",
                "name": "Mejora de Defensa +130",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 130, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 40,
            "tecnica": 28,
            "tiro": 20,
            "parada": 12
        },
        "statsLevel100": {
            "defensa": 1160,
            "tecnica": 812,
            "tiro": 580,
            "parada": 348
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "keisuke-wanima",
        "name": "Keisuke Wanima",
        "alturaCm": 182,
        "position": "DEL",
        "element": "Bosque",
        "rarity": 2,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/keisuke-sprite.webp",
        "techniques": [
            {
                "id": "keisuke-wanima-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "keisuke-wanima-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "keisuke-wanima-passive-0",
                "name": "Mejora de Tiro",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "keisuke-wanima-passive-1",
                "name": "Mejora de Técnica",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "uniquePassive": {
            "id": "keisuke-wanima-unique-passive",
            "name": "Hermanos Wanima",
            "icon": "✨",
            "effects": [
                { "id": "hermanosWanima", "stats": ["tiro", "tecnica"], "baseAmount": 50, "trigger": "matchStart", "requiresTeammateId": "junichi-wanima" }
            ]
        },
        "statsLevel1": {
            "tiro": 40,
            "tecnica": 28,
            "defensa": 20,
            "parada": 12
        },
        "statsLevel100": {
            "tiro": 1160,
            "tecnica": 812,
            "defensa": 580,
            "parada": 348
        },
        "equipoOriginal": "W"
    },
    {
        "id": "junichi-wanima",
        "name": "Junichi Wanima",
        "alturaCm": 182,
        "position": "DEL",
        "element": "Fuego",
        "rarity": 2,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/junichi-sprite.webp",
        "techniques": [
            {
                "id": "junichi-wanima-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "junichi-wanima-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "junichi-wanima-passive-0",
                "name": "Mejora de Tiro",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "junichi-wanima-passive-1",
                "name": "Mejora de Técnica",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "uniquePassive": {
            "id": "junichi-wanima-unique-passive",
            "name": "Hermanos Wanima",
            "icon": "✨",
            "effects": [
                { "id": "hermanosWanima", "stats": ["tiro", "tecnica"], "baseAmount": 50, "trigger": "matchStart", "requiresTeammateId": "keisuke-wanima" }
            ]
        },
        "statsLevel1": {
            "tiro": 40,
            "tecnica": 28,
            "defensa": 20,
            "parada": 12
        },
        "statsLevel100": {
            "tiro": 1160,
            "tecnica": 812,
            "defensa": 580,
            "parada": 348
        },
        "equipoOriginal": "W"
    },
    {
        "id": "hibiki-ookawa",
        "name": "Hibiki Ookawa",
        "alturaCm": 177,
        "position": "DEL",
        "element": "Aire",
        "rarity": 2,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/okawa-sprite.webp",
        "techniques": [
            {
                "id": "hibiki-ookawa-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "hibiki-ookawa-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "hibiki-ookawa-passive-0",
                "name": "Mejora Supertécnicas Aire",
                "icon": "🌪️",
                "unlockLevel": 10,
                "effects": [
                    { "kind": "elementTechniqueAura", "element": "Aire", "baseAmount": 32, "perLevelAmount": 6, "trigger": "matchStart" }
                ]
            },
            {
                "id": "hibiki-ookawa-passive-1",
                "name": "Mejora de Tiro +130",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 130, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 40,
            "tecnica": 28,
            "defensa": 20,
            "parada": 12
        },
        "statsLevel100": {
            "tiro": 1160,
            "tecnica": 812,
            "defensa": 580,
            "parada": 348
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "iemon-naoyuki",
        "name": "Iemon Naoyuki",
        "alturaCm": 187,
        "position": "POR",
        "element": "Fuego",
        "rarity": 2,
        "unlocked": false,
        "gachaExcluded": true,
        "sprite": "assets/characters/sprites/Z/iemon-sprite.webp",
        "techniques": [
            {
                "id": "iemon-naoyuki-tech-0",
                "name": "Técnica Básica de Parada",
                "type": "parada",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "iemon-naoyuki-tech-1",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "iemon-naoyuki-passive-0",
                "name": "Sinergia de Equipo Z: Parada",
                "icon": "🤝",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 130, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Z", "min": 3 } }
                ]
            },
            {
                "id": "iemon-naoyuki-passive-1",
                "name": "Mejora de Parada +130",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 130, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "parada": 40,
            "defensa": 28,
            "tiro": 20,
            "tecnica": 12
        },
        "statsLevel100": {
            "parada": 1160,
            "defensa": 812,
            "tiro": 580,
            "tecnica": 348
        },
        "equipoOriginal": "Z"
    },
    {
        "id": "sota-nemoto",
        "name": "Sota Nemoto",
        "alturaCm": 185,
        "position": "DEF",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": false,
        "gachaExcluded": true,
        "sprite": "assets/characters/sprites/V/nemoto-sprite.webp",
        "techniques": [
            {
                "id": "sota-nemoto-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "sota-nemoto-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "sota-nemoto-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "sota-nemoto-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "rikiya-hohai",
        "name": "Rikiya Hohai",
        "alturaCm": 170,
        "position": "DEL",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/hohai-sprite.webp",
        "techniques": [
            {
                "id": "rikiya-hohai-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "rikiya-hohai-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "rikiya-hohai-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "rikiya-hohai-passive-1",
                "name": "Mejora de Técnica +75",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "hirakazu-midorikawa",
        "name": "Hirakazu Midorikawa",
        "alturaCm": 178,
        "position": "DEF",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/Midorikawa-sprite.webp",
        "techniques": [
            {
                "id": "hirakazu-midorikawa-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "hirakazu-midorikawa-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "hirakazu-midorikawa-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "hirakazu-midorikawa-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "shuhei-ebina",
        "name": "Shuhei Ebina",
        "alturaCm": 172,
        "position": "DEL",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/ebina-sprite.webp",
        "techniques": [
            {
                "id": "shuhei-ebina-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "shuhei-ebina-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "shuhei-ebina-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "shuhei-ebina-passive-1",
                "name": "Mejora de Defensa +75",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "kanji-torikai",
        "name": "Kanji Torikai",
        "alturaCm": 185,
        "position": "MED",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/V/torikai-sprite.webp",
        "techniques": [
            {
                "id": "kanji-torikai-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "kanji-torikai-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kanji-torikai-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "kanji-torikai-passive-1",
                "name": "Mejora de Defensa +75",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "V"
    },
    {
        "id": "koki-mera",
        "name": "Koki Mera",
        "alturaCm": 172,
        "position": "DEF",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/mera-sprite.webp",
        "techniques": [
            {
                "id": "koki-mera-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "koki-mera-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "koki-mera-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "koki-mera-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "kai-tokita",
        "name": "Kai Tokita",
        "alturaCm": 175,
        "position": "DEF",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/tokita-sprite.webp",
        "techniques": [
            {
                "id": "kai-tokita-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "kai-tokita-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kai-tokita-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "kai-tokita-passive-1",
                "name": "Mejora de Técnica +75",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "yujin-koshinaka",
        "name": "Yujin Koshinaka",
        "alturaCm": 179,
        "position": "DEF",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/koshinaka-sprite.webp",
        "techniques": [
            {
                "id": "yujin-koshinaka-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "yujin-koshinaka-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "yujin-koshinaka-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "yujin-koshinaka-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "takuma-isezaki",
        "name": "Takuma Isezaki",
        "alturaCm": 178,
        "position": "MED",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/isezaki-sprite.webp",
        "techniques": [
            {
                "id": "takuma-isezaki-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "takuma-isezaki-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "takuma-isezaki-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "takuma-isezaki-passive-1",
                "name": "Sinergia de Equipo W: Técnica",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "W", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "noboru-jigen",
        "name": "Noboru Jigen",
        "alturaCm": 185,
        "position": "MED",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/jigen-sprite.webp",
        "techniques": [
            {
                "id": "noboru-jigen-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "noboru-jigen-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "noboru-jigen-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "noboru-jigen-passive-1",
                "name": "Mejora de Defensa +75",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "hiromu-munakata",
        "name": "Hiromu Munakata",
        "alturaCm": 182,
        "position": "MED",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/W/munakata-sprite.webp",
        "techniques": [
            {
                "id": "hiromu-munakata-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "hiromu-munakata-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "hiromu-munakata-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "hiromu-munakata-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "yawara-banku",
        "name": "Yawara Banku",
        "alturaCm": 179,
        "position": "DEF",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/banku-sprite.webp",
        "techniques": [
            {
                "id": "yawara-banku-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "yawara-banku-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "yawara-banku-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "yawara-banku-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "daiya-morinaga",
        "name": "Daiya Morinaga",
        "alturaCm": 180,
        "position": "DEF",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/morinaga-sprite.webp",
        "techniques": [
            {
                "id": "daiya-morinaga-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "daiya-morinaga-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "daiya-morinaga-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "daiya-morinaga-passive-1",
                "name": "Mejora de Técnica +75",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "chihiro-ezaki",
        "name": "Chihiro Ezaki",
        "alturaCm": 166,
        "position": "DEF",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/ezaki-sprite.webp",
        "techniques": [
            {
                "id": "chihiro-ezaki-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "chihiro-ezaki-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "chihiro-ezaki-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "chihiro-ezaki-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "kosei-otsuka",
        "name": "Kosei Otsuka",
        "alturaCm": 177,
        "position": "MED",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/otsuka-sprite.webp",
        "techniques": [
            {
                "id": "kosei-otsuka-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "kosei-otsuka-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "kosei-otsuka-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "kosei-otsuka-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "buruto-kora",
        "name": "Buruto Kora",
        "alturaCm": 181,
        "position": "MED",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/kora-sprite.webp",
        "techniques": [
            {
                "id": "buruto-kora-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "buruto-kora-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "buruto-kora-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "buruto-kora-passive-1",
                "name": "Mejora de Defensa +75",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "soshi-kagura",
        "name": "Soshi Kagura",
        "alturaCm": 176,
        "position": "MED",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "gachaExcluded": true,
        "sprite": "assets/characters/sprites/Y/kagura-sprite.webp",
        "techniques": [
            {
                "id": "soshi-kagura-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "soshi-kagura-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "soshi-kagura-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "soshi-kagura-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "fuma-rokkaku",
        "name": "Fuma Rokkaku",
        "alturaCm": 181,
        "position": "MED",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/rokaku-sprite.webp",
        "techniques": [
            {
                "id": "fuma-rokkaku-tech-0",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "fuma-rokkaku-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "fuma-rokkaku-passive-0",
                "name": "Mejora de Técnica +100",
                "icon": "🧠",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "fuma-rokkaku-passive-1",
                "name": "Mejora de Parada +75",
                "icon": "🧤",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tecnica": 34,
            "tiro": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tecnica": 1040,
            "tiro": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "burai-daido",
        "name": "Burai Daido",
        "alturaCm": 192,
        "position": "DEL",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "gachaExcluded": true,
        "sprite": "assets/characters/sprites/X/daido-sprite.webp",
        "techniques": [
            {
                "id": "burai-daido-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "burai-daido-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "burai-daido-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "burai-daido-passive-1",
                "name": "Mejora de Defensa +75",
                "icon": "🛡️",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "mareto-takeyama",
        "name": "Mareto Takeyama",
        "alturaCm": 170,
        "position": "DEF",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/takeyama-sprite.webp",
        "techniques": [
            {
                "id": "mareto-takeyama-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "mareto-takeyama-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "mareto-takeyama-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "mareto-takeyama-passive-1",
                "name": "Sinergia de Equipo Y: Defensa",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Y", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "hyuga-koshiba",
        "name": "Hyuga Koshiba",
        "alturaCm": 182,
        "position": "DEL",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/koshiba-sprite.webp",
        "techniques": [
            {
                "id": "hyuga-koshiba-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "hyuga-koshiba-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "hyuga-koshiba-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "hyuga-koshiba-passive-1",
                "name": "Sinergia de Equipo Y: Tiro",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Y", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "raito-fuwa",
        "name": "Raito Fuwa",
        "alturaCm": 180,
        "position": "POR",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "gachaExcluded": true,
        "sprite": "assets/characters/sprites/W/fuwa-sprite.webp",
        "techniques": [
            {
                "id": "raito-fuwa-tech-0",
                "name": "Técnica Básica de Parada",
                "type": "parada",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "raito-fuwa-tech-1",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "raito-fuwa-passive-0",
                "name": "Mejora de Parada +100",
                "icon": "🧤",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "raito-fuwa-passive-1",
                "name": "Sinergia de Equipo W: Parada",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "W", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "parada": 34,
            "defensa": 24,
            "tiro": 17,
            "tecnica": 10
        },
        "statsLevel100": {
            "parada": 1040,
            "defensa": 728,
            "tiro": 520,
            "tecnica": 312
        },
        "equipoOriginal": "W"
    },
    {
        "id": "yuza-dokomo",
        "name": "Yuza Dokomo",
        "alturaCm": 188,
        "position": "POR",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/X/dokomo-sprite.webp",
        "techniques": [
            {
                "id": "yuza-dokomo-tech-0",
                "name": "Técnica Básica de Parada",
                "type": "parada",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "yuza-dokomo-tech-1",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "yuza-dokomo-passive-0",
                "name": "Mejora de Parada +100",
                "icon": "🧤",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "yuza-dokomo-passive-1",
                "name": "Sinergia de Equipo X: Parada",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "X", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "parada": 34,
            "defensa": 24,
            "tiro": 17,
            "tecnica": 10
        },
        "statsLevel100": {
            "parada": 1040,
            "defensa": 728,
            "tiro": 520,
            "tecnica": 312
        },
        "equipoOriginal": "X"
    },
    {
        "id": "juraki-ito",
        "name": "Juraki Ito",
        "alturaCm": 189,
        "position": "POR",
        "element": "Montaña",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/ito-sprite.webp",
        "techniques": [
            {
                "id": "juraki-ito-tech-0",
                "name": "Técnica Básica de Parada",
                "type": "parada",
                "element": "Montaña",
                "cost": 30
            },
            {
                "id": "juraki-ito-tech-1",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Montaña",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "juraki-ito-passive-0",
                "name": "Mejora de Parada +100",
                "icon": "🧤",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "juraki-ito-passive-1",
                "name": "Sinergia de Equipo Y: Parada",
                "icon": "🤝",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["parada"], "baseAmount": 100, "trigger": "matchStart", "requiresTeamCount": { "equipoOriginal": "Y", "min": 3 } }
                ]
            }
        ],
        "statsLevel1": {
            "parada": 34,
            "defensa": 24,
            "tiro": 17,
            "tecnica": 10
        },
        "statsLevel100": {
            "parada": 1040,
            "defensa": 728,
            "tiro": 520,
            "tecnica": 312
        },
        "equipoOriginal": "Y"
    },
    {
        "id": "ashime-suzuki",
        "name": "Ashime Suzuki",
        "alturaCm": 174,
        "position": "DEL",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/zuzuki-sprite.webp",
        "equipoOriginal": "Y",
        "techniques": [
            {
                "id": "ashime-suzuki-tech-0",
                "name": "Técnica Básica de Tiro",
                "type": "tiro",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "ashime-suzuki-tech-1",
                "name": "Técnica Básica de Regate",
                "type": "regate",
                "element": "Aire",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "ashime-suzuki-passive-0",
                "name": "Mejora de Tiro +100",
                "icon": "⚽",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "ashime-suzuki-passive-1",
                "name": "Mejora de Técnica +75",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "tiro": 34,
            "tecnica": 24,
            "defensa": 17,
            "parada": 10
        },
        "statsLevel100": {
            "tiro": 1040,
            "tecnica": 728,
            "defensa": 520,
            "parada": 312
        }
    },
    {
        "id": "tobio-madoka",
        "name": "Tobio Madoka",
        "alturaCm": 187,
        "position": "DEF",
        "element": "Aire",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/madoka-sprite.webp",
        "equipoOriginal": "Y",
        "techniques": [
            {
                "id": "tobio-madoka-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Aire",
                "cost": 30
            },
            {
                "id": "tobio-madoka-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "tobio-madoka-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "tobio-madoka-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        }
    },
    {
        "id": "shinichi-konan",
        "name": "Shinichi Konan",
        "alturaCm": 180,
        "position": "DEF",
        "element": "Bosque",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/shinichi-sprite.webp",
        "equipoOriginal": "Y",
        "techniques": [
            {
                "id": "shinichi-konan-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Bosque",
                "cost": 30
            },
            {
                "id": "shinichi-konan-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Bosque",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "shinichi-konan-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "shinichi-konan-passive-1",
                "name": "Mejora de Técnica +75",
                "icon": "🧠",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tecnica"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        }
    },
    {
        "id": "iori-sato",
        "name": "Iori Sato",
        "alturaCm": 178,
        "position": "DEF",
        "element": "Fuego",
        "rarity": 1,
        "unlocked": false,
        "sprite": "assets/characters/sprites/Y/sato-sprite.webp",
        "equipoOriginal": "Y",
        "techniques": [
            {
                "id": "iori-sato-tech-0",
                "name": "Técnica Básica de Bloqueo",
                "type": "bloqueo",
                "element": "Fuego",
                "cost": 30
            },
            {
                "id": "iori-sato-tech-1",
                "name": "Técnica Básica de Pase",
                "type": "pase",
                "element": "Fuego",
                "cost": 30
            }
        ],
        "passives": [
            {
                "id": "iori-sato-passive-0",
                "name": "Mejora de Defensa +100",
                "icon": "🛡️",
                "unlockLevel": 10,
                "effects": [
                    { "stats": ["defensa"], "baseAmount": 100, "trigger": "matchStart" }
                ]
            },
            {
                "id": "iori-sato-passive-1",
                "name": "Mejora de Tiro +75",
                "icon": "⚽",
                "unlockLevel": 20,
                "effects": [
                    { "stats": ["tiro"], "baseAmount": 75, "trigger": "matchStart" }
                ]
            }
        ],
        "statsLevel1": {
            "defensa": 34,
            "tecnica": 24,
            "tiro": 17,
            "parada": 10
        },
        "statsLevel100": {
            "defensa": 1040,
            "tecnica": 728,
            "tiro": 520,
            "parada": 312
        }
    }
];
