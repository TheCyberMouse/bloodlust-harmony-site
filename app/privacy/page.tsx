import { Fragment } from "react";

export const metadata = {
  title: "Privacy & data policy",
  description:
    "How Bloodlust & Harmony handles data: optional anonymized match telemetry, Steam multiplayer, and a tracking-free website. Your choices and GDPR rights.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "July 23, 2026";

type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };
type Section = { heading: string; blocks: Block[] };

function Inline({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-bh-ink font-semibold">
            {p}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i} className="text-bh-mute leading-relaxed">
            <Inline text={block.text} />
          </p>
        ) : (
          <ul key={i} className="ml-5 list-disc space-y-2 text-bh-mute">
            {block.items.map((item, j) => (
              <li key={j} className="leading-relaxed">
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

const SECTIONS: Section[] = [
  {
    heading: "Who we are",
    blocks: [
      {
        type: "p",
        text: "Bloodlust & Harmony is made by **TheCyberMouse**, an independent game developer, who is responsible for the data described here (the \"data controller\" under GDPR). For any privacy question or request, email **patrick@thecybermouse.com**.",
      },
    ],
  },
  {
    heading: "Match data from the game",
    blocks: [
      {
        type: "ul",
        items: [
          "The game can record **anonymized** data about a match to help us balance and improve it: build orders (what you built and when), match flow and outcomes, combat and ability events used for balancing, and performance samples such as frame rate.",
          "This data is tied to a **random per-match ID**, not to you. It contains **no names, email addresses, account IDs, or personal details**.",
          "A copy is always kept **on your own device**. It is only **sent to us if you turn on data sharing** in the game menu. If the setting is off, nothing leaves your machine.",
          "You can change this setting at any time. Turning it off stops all future uploads.",
        ],
      },
    ],
  },
  {
    heading: "Playing online through Steam",
    blocks: [
      {
        type: "ul",
        items: [
          "Multiplayer, matchmaking, and the ranked leaderboard use **Steam**, provided by Valve.",
          "Steam handles your account identity and the connection between players. As in any Steam multiplayer game, other players in your match can see your **Steam display name**, and your ranked rating is stored on a **Steam leaderboard**.",
          "Valve processes your Steam account data under **its own privacy policy**.",
        ],
      },
    ],
  },
  {
    heading: "Data stored on your device",
    blocks: [
      {
        type: "p",
        text: "The game saves your **settings, preferences, chosen display name, faction and color, and cached rank** locally so it can remember them between sessions. This stays on your device and is removed when you delete the save or uninstall the game.",
      },
    ],
  },
  {
    heading: "This website",
    blocks: [
      {
        type: "ul",
        items: [
          "bloodlustandharmony.com is an information site: the wiki, guides, and devlog. It has **no advertising, no tracking cookies, no profiling analytics, and no user accounts**.",
          "Our hosting and database providers keep standard **server logs** (such as IP address and browser type) for security and reliability, as any website does. We do not use these to identify or track you.",
        ],
      },
    ],
  },
  {
    heading: "How we use data",
    blocks: [
      {
        type: "ul",
        items: [
          "To **balance and improve the game**: tuning units and the economy, catching bugs, and fixing performance problems.",
          "To **run multiplayer and the ranked ladder** through Steam.",
          "We do **not** sell your data or use it for advertising.",
        ],
      },
    ],
  },
  {
    heading: "Legal basis (EU and UK players)",
    blocks: [
      {
        type: "ul",
        items: [
          "For anonymized match data: your **consent**, given by turning the setting on, which you can withdraw at any time.",
          "For multiplayer and the leaderboard: it is **necessary to provide the online features you chose to use**.",
        ],
      },
    ],
  },
  {
    heading: "Who we share data with",
    blocks: [
      {
        type: "ul",
        items: [
          "**Steam and Valve**, for multiplayer and the leaderboard.",
          "**Service providers** that help us store and analyze anonymized match data and host this website. They act on our behalf and may not use the data for their own purposes.",
          "We do **not** sell your data or share it for marketing.",
        ],
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      {
        type: "ul",
        items: [
          "Anonymized match data is kept only as long as it is useful for analysis, then deleted.",
          "Data stored on your device stays until you remove it.",
        ],
      },
    ],
  },
  {
    heading: "Your choices and rights",
    blocks: [
      {
        type: "ul",
        items: [
          "**Turn it off.** Data sharing is a single toggle in the game's main menu. Off means nothing is sent.",
          "Because match data is anonymized and not linked to you, we usually cannot connect a specific record back to an individual.",
          "If you are in the EU or UK, you have the right to **access, correct, delete, and restrict** your personal data and to **withdraw consent**. For anything tied to your Steam account, contact Valve. For anything else, email us and we will help.",
        ],
      },
    ],
  },
  {
    heading: "Children",
    blocks: [
      {
        type: "p",
        text: "The game is **not directed at children** under the age of digital consent in their country (16 in much of the EU), and we do not knowingly collect their data.",
      },
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy. The **date at the top** shows the current version, and significant changes will be noted in the game or on this site.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">Privacy &amp; data policy</h1>
      <p className="mt-2 text-sm text-bh-mute">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 max-w-prose rounded-lg border border-bh-rule bg-bh-panel p-6">
        <h2 className="font-display text-xl mb-3">The short version</h2>
        <ul className="ml-5 list-disc space-y-2 text-bh-mute leading-relaxed">
          <li>
            The game can send{" "}
            <strong className="text-bh-ink">anonymized</strong> match data
            (build orders, balance, and performance) to help us improve it. It
            is only sent if you turn it on, and it never includes your name or
            personal details.
          </li>
          <li>
            Multiplayer and the ranked ladder run on{" "}
            <strong className="text-bh-ink">Steam</strong>, which handles your
            identity and connections.
          </li>
          <li>
            This website uses{" "}
            <strong className="text-bh-ink">
              no tracking cookies, ads, or accounts
            </strong>
            .
          </li>
          <li>
            You can turn data sharing off anytime in the game menu, and you can
            email us to ask what we hold or to have it removed.
          </li>
        </ul>
      </div>

      <div className="mt-12 max-w-prose space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl text-bh-ink mb-4">
              {section.heading}
            </h2>
            <div className="space-y-4">
              <Blocks blocks={section.blocks} />
            </div>
          </section>
        ))}

        <section>
          <h2 className="font-display text-2xl text-bh-ink mb-4">Contact</h2>
          <p className="text-bh-mute leading-relaxed">
            Questions or requests about your data:{" "}
            <a
              href="mailto:patrick@thecybermouse.com"
              className="text-bh-blood hover:text-bh-bloodInk transition-colors"
            >
              patrick@thecybermouse.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
