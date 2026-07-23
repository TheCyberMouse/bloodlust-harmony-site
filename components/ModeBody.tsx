import { Fragment } from "react";
import type { ModeBlock, ModeItem, ModeSection } from "@/lib/modes";

/** Renders **bold** spans inside an otherwise-plain string. */
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

function Item({ item }: { item: ModeItem }) {
  if (typeof item === "string") return <Inline text={item} />;
  return (
    <>
      <Inline text={item.text} />
      {item.sub && item.sub.length > 0 ? (
        <ul className="mt-2 ml-5 list-disc space-y-1.5 text-bh-mute">
          {item.sub.map((s, i) => (
            <li key={i}>
              <Inline text={s} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function Block({ block }: { block: ModeBlock }) {
  if (block.type === "p") {
    return (
      <p className="text-bh-mute leading-relaxed">
        <Inline text={block.text} />
      </p>
    );
  }
  const Tag = block.type === "ol" ? "ol" : "ul";
  return (
    <Tag
      className={`ml-5 space-y-2.5 text-bh-mute ${
        block.type === "ol" ? "list-decimal" : "list-disc"
      }`}
    >
      {block.items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          <Item item={item} />
        </li>
      ))}
    </Tag>
  );
}

export default function ModeBody({ sections }: { sections: ModeSection[] }) {
  return (
    <div className="mt-10 space-y-10 max-w-prose">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="font-display text-2xl text-bh-ink mb-4">
            {section.heading}
          </h2>
          <div className="space-y-4">
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
