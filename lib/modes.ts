// =============================================================================
// Game modes. Hand-authored content (there is no game-data export for modes),
// kept player-facing: the rules and flavor a player experiences, not the
// internal designer knobs. One source feeds the overview, detail pages, nav,
// and sitemap. Inline **bold** is rendered by components/ModeBody.tsx.
// =============================================================================

export type ModeItem = string | { text: string; sub?: string[] };

export type ModeBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: ModeItem[] }
  | { type: "ol"; items: ModeItem[] };

export type ModeSection = { heading: string; blocks: ModeBlock[] };

export type GameMode = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  glance: { players: string; economy: string; buildings: string; win: string };
  sections: ModeSection[];
};

export const GAME_MODES: GameMode[] = [
  {
    slug: "regular",
    name: "Regular",
    tagline: "The classic Castle Fight loop, and the shipped default.",
    summary:
      "Place spawner buildings, they field armies every wave, and the last castle standing wins. This is the mode ranked and quickplay always use.",
    glance: {
      players: "1v1 to 3v3 teams",
      economy: "Full",
      buildings: "Your faction's menu",
      win: "Destroy the enemy castles",
    },
    sections: [
      {
        heading: "Rules",
        blocks: [
          {
            type: "ul",
            items: [
              "Two or three teams (1v1, 2v2, 1v1v1, up to 3v3). Each player picks a **faction** and a color in the lobby.",
              "You never control units directly. You place **spawner buildings** in your build zone, and every wave they field units that march down the lane and fight on their own.",
              "Each team defends a **castle**. Destroy every enemy castle to win. Lose yours and you are out.",
              "Five resources drive the economy: **Gold** (an income tick every 15 seconds), **Lumber** (earned when you place buildings), **Stardust** (scarce), **Points** (personal score from kills), and **Stormdust** (a team pool from kills).",
              "Beyond spawners there are **towers** (defensive, tower slots only), **special buildings** (auto-casting support like healing shrines and war horns), **researches** (a per-faction upgrade tab), and the **shop** (resource swaps and team-buff scrolls). Every player also gets one **Rescue Strike**, an emergency wipe of nearby enemy units.",
              "Options set when the server is created: lane count, spawn mode (rotate per wave or everyone spawns together), Fog of War (off, first 3 minutes, first 5 minutes, or always), and the round limit.",
            ],
          },
        ],
      },
      {
        heading: "Flow",
        blocks: [
          {
            type: "p",
            text: "Pick your race, color, and team in the lobby and ready up. Castles and build zones are assigned, then income and waves begin. From there it is all reaction: build, upgrade, research, and answer whatever composition the other side is massing. When a team's castle falls they are out, and the last castle standing takes the match. A round limit and sudden-death rules resolve any stalemate.",
          },
        ],
      },
    ],
  },
  {
    slug: "ultimate",
    name: "Ultimate",
    tagline:
      "Everyone plays one shared cross-faction race and is dealt a random build set.",
    summary:
      "A shared cross-faction pool deals you a random 13-building set. No comfort picks, just the strongest line inside what you were dealt.",
    glance: {
      players: "1v1 to 3v3 teams",
      economy: "Full",
      buildings: "Random 13 from a shared pool",
      win: "Destroy the enemy castles",
    },
    sections: [
      {
        heading: "Rules",
        blocks: [
          {
            type: "ul",
            items: [
              "Every seat, human and bot, is forced onto the **Ultimate race**, a special faction whose building pool spans every race in the game. The lobby shows Ultimate on every row and locks the race picker.",
              {
                text: "At match start each player independently rolls a **13-building set** from that pool:",
                sub: [
                  "**1 tower**",
                  "**2 special buildings**",
                  "**5 one-food units**",
                  "**5 two-food units**",
                ],
              },
              "Within those 13, **2 picks are guaranteed to be stardust units**, meaning units that cost stardust themselves or whose upgrade chain reaches one (the Elven Archer counts through its Stormbow upgrade).",
              "Your hotbar shows only your rolled set, one-food row above two-food row. Upgrade chains ride along: roll the base building and its upgrades are reachable.",
              "Researches, the shop, and the castle come from the Ultimate race's own curated lists, shared by everyone.",
              "Otherwise it plays exactly like Regular: same castles, waves, economy, and win condition.",
            ],
          },
        ],
      },
      {
        heading: "Why it plays well",
        blocks: [
          {
            type: "p",
            text: "No comfort picks. Two players draw different toolkits from the same pool and have to find the strongest line inside what they were dealt. Rolls are re-applied identically on reconnect, so a disconnect never re-rolls your set.",
          },
        ],
      },
    ],
  },
  {
    slug: "draft",
    name: "Draft",
    tagline:
      "Ban, then snake-draft your whole build set from a shared pool before the first wave.",
    summary:
      "Ultimate's variety with agency. Ban a building, snake-pick your 13, deny an opponent's synergy, and race for contested picks before the clocks start.",
    glance: {
      players: "1v1 to 3v3 teams",
      economy: "Full",
      buildings: "Drafted: ban, then snake",
      win: "Destroy the enemy castles",
    },
    sections: [
      {
        heading: "Rules",
        blocks: [
          {
            type: "ul",
            items: [
              "Like Ultimate, every seat plays a shared cross-faction race. But instead of a random roll you **choose** your buildings on a full-screen draft board while the match clocks are held.",
              "**Ban round first.** In turn order, each player bans one building from the pool or skips. Bans are permanent and visible to everyone.",
              "**Snake draft second.** Pick order runs 1 to N then N to 1, repeating. Each pick is exclusive, so a taken building greys out for everyone.",
              {
                text: "Your collection must reach the same makeup as an Ultimate roll (1 tower, 2 specials, 5 one-food, 5 two-food, for **13 picks**), with a stardust **minimum of 1 and maximum of 2**:",
                sub: [
                  "The maximum is a hard rule, so a third stardust unit is simply unpickable.",
                  "The minimum is forced late: when your remaining unit slots equal your stardust deficit, only stardust units stay pickable.",
                ],
              },
              "**The pool cycles.** It is finite, so once a category (tower, special, stardust unit, one-food, two-food) has no free un-banned entries left, its already-drafted entries become available again, and several players can end up with the same building. Bans never cycle back, and you can never duplicate your own pick.",
              "The board shows every player's growing set live with bucket counters, a turn banner, and a countdown. A timeout auto-picks a random valid building. Bots pick with a short delay and skip their bans.",
              "When the draft completes the clocks start and it plays out like Regular with your drafted hotbar.",
            ],
          },
        ],
      },
      {
        heading: "Why it plays well",
        blocks: [
          {
            type: "p",
            text: "It is the strategy layer of Ultimate with agency: hate-banning a key building, denying an opponent's synergy, reading what the table is building, and racing for the contested picks.",
          },
        ],
      },
    ],
  },
  {
    slug: "poker",
    name: "Poker",
    tagline:
      "Free-for-all army poker. Get dealt a hidden army, bet chips, and let the pit decide.",
    summary:
      "Hold'em where the cards are armies. Ante up, bet between card reveals, and watch your composition fight it out in the pit. Last chip stack wins.",
    glance: {
      players: "2 to 9, free-for-all",
      economy: "Chips only",
      buildings: "Dealt as army cards",
      win: "Last chip stack standing",
    },
    sections: [
      {
        heading: "The table",
        blocks: [
          {
            type: "ul",
            items: [
              "**2 to 9 players, every seat for itself.** Teams do not exist here, so the lobby shows one flat Players list.",
              "Everyone starts with the same chip stack. The match is a tournament: lose your chips and you are eliminated but keep spectating, and the last player holding chips wins.",
              "It is played on a dedicated arena: one circular **pit**, no castles, no build zones, no economy. Chips are the only currency, and the usual RTS interface is replaced by a poker HUD showing your cards, the seats, the pot, the blinds, and your action buttons.",
            ],
          },
        ],
      },
      {
        heading: "A hand, step by step",
        blocks: [
          {
            type: "ol",
            items: [
              "**Forced bets.** Every live seat posts the **ante**. The seat left of the dealer button posts the **small blind** and the next the **big blind** (heads-up, the dealer is the small blind and acts first). Blind levels climb on a real-time schedule and apply from the next hand. A short stack posts what it can, all-in for less.",
              "**Deal.** Each live seat is dealt a hidden hand of **1 to 2 cards**. A card is a unit type plus a rolled count from the deck's range, for example Assassin one to eight, Footman two to twelve, or Red Dragon one to three. Hands are dealt fully up front but revealed one card at a time, so you see card one now.",
              "**Boon reveal.** One random **battlefield boon** for the hand is announced right away, on the HUD and as glowing text on the arena floor, such as \"Double Shield, all units\" or \"Grovewardens gain attack.\" It is public information, so factor it into your betting.",
              "**Redraw window.** A simultaneous timed window where each player keeps their hand or **redraws** it. Redraws are limited per hand, a redraw re-rolls the whole hand, and you still only see the current card. A timeout keeps.",
              "**Betting on card one.** Standard poker in turn order: **fold, check, call, raise, or all-in**. A full raise reopens the action, an all-in short of a minimum raise does not, and the round closes once every seat still able to act has acted since the last raise and matched the price. Each turn has a timer, and a timeout checks if it is free or folds otherwise.",
              "**Card two revealed.** Everyone still in the hand sees their second card, and a fresh betting round opens.",
              "**Showdown.** Every army still in the hand spawns evenly around the pit, facing center, with the boon applied to qualifying units. The armies fight entirely on their own, with no player control, until one stands or the **60-second cap** hits.",
              "**Payout.** Full side pots: each all-in caps what that seat can win, and overflow forms side pots contested only by the deeper stacks. The last army standing takes the pots it is eligible for. If the timer expires with several survivors, each pot splits evenly among its eligible survivors. If everyone folds to one player they take it uncontested, any uncalled raise refunded, and never reveal their hand.",
              "**Next hand.** Eliminations apply, the dealer button advances, and after a short intermission the next hand deals.",
            ],
          },
        ],
      },
      {
        heading: "Reading a hand",
        blocks: [
          {
            type: "p",
            text: "There is no hand-ranking chart. The battlefield is the ranking. You are weighing raw stats, splash damage, anti-air, casters, and how a composition survives a multi-army free-for-all. A big single-target army can crush one opponent and melt in a six-way brawl, while durable splash scales. The boon can swing all of it.",
          },
        ],
      },
      {
        heading: "Edge cases",
        blocks: [
          {
            type: "p",
            text: "A disconnected player's seat plays on at bot pace and their dealt army still fights, and reconnecting re-attaches to the seat and hands the cards back. Bots bet with a pot-odds heuristic on the cards they have seen, with a chance to bluff.",
          },
        ],
      },
    ],
  },
  {
    slug: "sandbox",
    name: "Sandbox",
    tagline:
      "A free-for-all playground for testing compositions. No economy, no clocks, no winner.",
    summary:
      "Spawn any army, on any side, anywhere, and watch it fight with the full game AI. The place to answer \"do twelve Footmen beat eight Skeletons?\"",
    glance: {
      players: "Up to 9 FFA sides",
      economy: "None",
      buildings: "Spawn palette",
      win: "None, it is a sandbox",
    },
    sections: [
      {
        heading: "Rules",
        blocks: [
          {
            type: "ul",
            items: [
              "An open arena with the RTS interface hidden and a **spawn palette** in its place, listing every unit in the game grouped by its faction.",
              "Pick a unit, set a count from 1 to 50, pick one of **nine free-for-all sides** (every side is hostile to every other), then **click the ground** to stamp that army. Click again to place more, and right-click to stop.",
              "Spawned armies fight on their own with the full game AI, stats, abilities, and passives. It is the live game simulation, just fed by hand.",
              "**Clear All** removes every unit through the normal death path, corpses and all.",
              "Any player in the session can spawn, there is no win condition, and you leave through the pause menu.",
            ],
          },
        ],
      },
      {
        heading: "What it is for",
        blocks: [
          {
            type: "p",
            text: "Balance testing (do twelve Footmen beat eight Skeletons?), showing off units, stress tests, and just messing around. It is also the smoke-test rig for the free-for-all systems that Poker runs on.",
          },
        ],
      },
    ],
  },
];

export function getMode(slug: string): GameMode | undefined {
  return GAME_MODES.find((m) => m.slug === slug);
}
