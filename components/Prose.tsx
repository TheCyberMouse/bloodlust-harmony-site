import Link from "next/link";
import type { ProsePage } from "@/lib/wiki";

/**
 * Shared renderers for the hand-written sections (lore / guides / devlog).
 *
 * Body handling: wiki_pages bodies are HTML or plain text. If the body
 * contains markup we trust it (it only ever comes from the MCP or /admin,
 * both service-role gated) and render via dangerouslySetInnerHTML — plain
 * {text} would print tags literally (reference-site gotcha). Plain text gets
 * split into paragraphs on blank lines.
 */
export function ProseBody({ body }: { body: string }) {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(body);
  if (looksLikeHtml) {
    return (
      <div
        className="prose-body max-w-prose space-y-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }
  return (
    <div className="max-w-prose space-y-4 leading-relaxed">
      {body
        .split(/\n\s*\n/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i}>{p.trim()}</p>
        ))}
    </div>
  );
}

export function ProseIndex({
  title,
  intro,
  basePath,
  pages,
}: {
  title: string;
  intro: string;
  basePath: string;
  pages: ProsePage[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">{title}</h1>
      <p className="mt-2 text-bh-mute">{intro}</p>

      {pages.length === 0 ? (
        <p className="mt-10 text-bh-mute">Nothing published here yet.</p>
      ) : (
        <div className="mt-10 space-y-4">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={`${basePath}/${p.slug}`}
              className="group block rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
            >
              <div className="font-display text-lg group-hover:text-bh-blood transition-colors">
                {p.title}
              </div>
              <div className="mt-1 text-xs text-bh-mute">
                {new Date(p.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProseArticle({ page }: { page: ProsePage }) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">{page.title}</h1>
      <p className="mt-2 text-xs text-bh-mute">
        Updated{" "}
        {new Date(page.updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      <div className="mt-8">
        <ProseBody body={page.body} />
      </div>
    </article>
  );
}
