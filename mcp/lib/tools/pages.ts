import { z } from "zod";
import { supabase } from "@/lib/supabase";
import {
  McpTool,
  errorResult,
  textResult,
  zodObjectToJsonSchema,
} from "./types";

// Prose pages for the Bloodlust & Harmony site (lore, guides, devlog).
// NOTE: the game-data entity tables (units/buildings/abilities/...) are
// machine-written by the game repo's sync pipeline and are deliberately NOT
// editable here — wiki_pages is the only content surface the MCP writes.
const PAGE_TABLE = "wiki_pages";

// -----------------------------------------------------------------------------
// list_pages
// -----------------------------------------------------------------------------
export const listPagesTool: McpTool = {
  name: "list_pages",
  description:
    "List all prose pages (lore, guides, devlog) in wiki_pages with status, " +
    "category, last-updated timestamps and provenance. Use this as the first " +
    "step to find pages to edit. Game-data pages (units, buildings, ...) are " +
    "synced from the game and cannot be edited here.",
  inputSchema: zodObjectToJsonSchema({}),
  handler: async () => {
    const { data, error } = await supabase()
      .from(PAGE_TABLE)
      .select("slug, title, category, status, updated_at, updated_by")
      .order("updated_at", { ascending: false });
    if (error) return errorResult(`list_pages failed: ${error.message}`);
    return textResult(data);
  },
};

// -----------------------------------------------------------------------------
// get_page
// -----------------------------------------------------------------------------
const GetPageArgs = z.object({
  slug: z.string().describe("Page slug, e.g. 'lore-exemplaris', 'guide-economy'."),
});

export const getPageTool: McpTool = {
  name: "get_page",
  description:
    "Fetch a single wiki_pages row (title, category, body, status) by slug.",
  inputSchema: zodObjectToJsonSchema(GetPageArgs.shape),
  handler: async (args) => {
    const { slug } = GetPageArgs.parse(args);
    const { data, error } = await supabase()
      .from(PAGE_TABLE)
      .select("slug, title, category, body, status, updated_at, updated_by")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return errorResult(`get_page failed: ${error.message}`);
    if (!data) return errorResult(`No page with slug '${slug}'.`);
    return textResult(data);
  },
};

// -----------------------------------------------------------------------------
// upsert_page
// -----------------------------------------------------------------------------
const UpsertPageArgs = z.object({
  slug: z.string().describe("Page slug (kebab-case, stable once published)."),
  title: z.string().describe("Page title shown on the site."),
  category: z
    .enum(["lore", "guide", "devlog"])
    .describe("Which section of the site the page belongs to."),
  body: z
    .string()
    .describe(
      "Full page body (markdown/HTML). OVERWRITES the existing body — fetch " +
        "with get_page first, edit, and pass back the whole thing.",
    ),
  status: z
    .enum(["published", "draft"])
    .optional()
    .describe("'published' = visible on the site; 'draft' (default) = hidden."),
});

export const upsertPageTool: McpTool = {
  name: "upsert_page",
  description:
    "Create or overwrite a prose page. Stamps updated_by='claude-mcp'. The " +
    "site picks the change up on the next ISR revalidation, or immediately " +
    "after trigger_deploy.",
  inputSchema: zodObjectToJsonSchema(UpsertPageArgs.shape),
  handler: async (args) => {
    const { slug, title, category, body, status } = UpsertPageArgs.parse(args);
    const { error } = await supabase()
      .from(PAGE_TABLE)
      .upsert(
        {
          slug,
          title,
          category,
          body,
          status: status ?? "draft",
          updated_by: "claude-mcp",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      );
    if (error) return errorResult(`upsert_page failed: ${error.message}`);
    return textResult({ ok: true, slug });
  },
};

// -----------------------------------------------------------------------------
// delete_page
// -----------------------------------------------------------------------------
const DeletePageArgs = z.object({
  slug: z.string().describe("Page slug to delete."),
});

export const deletePageTool: McpTool = {
  name: "delete_page",
  description:
    "Permanently delete a wiki_pages row. No undo — prefer status='draft' via " +
    "upsert_page unless the page should genuinely be removed.",
  inputSchema: zodObjectToJsonSchema(DeletePageArgs.shape),
  handler: async (args) => {
    const { slug } = DeletePageArgs.parse(args);
    const { error } = await supabase().from(PAGE_TABLE).delete().eq("slug", slug);
    if (error) return errorResult(`delete_page failed: ${error.message}`);
    return textResult({ ok: true, deleted: slug });
  },
};
