import {
  McpTool,
  errorResult,
  textResult,
  zodObjectToJsonSchema,
} from "./types";

// -----------------------------------------------------------------------------
// trigger_deploy
// -----------------------------------------------------------------------------
export const triggerDeployTool: McpTool = {
  name: "trigger_deploy",
  description:
    "Rebuild the live Bloodlust & Harmony website. Call this after content edits so the " +
    "changes appear on the public site immediately (rather than waiting for ISR " +
    "revalidation, which is ~1 hour). Returns the deployment job that Vercel " +
    "kicked off. Safe to call multiple times â€” Vercel deduplicates queued builds.",
  inputSchema: zodObjectToJsonSchema({}),
  handler: async () => {
    // NOTE: env var is named DEPLOY_HOOK_URL rather than VERCEL_DEPLOY_HOOK
    // because Vercel reserves the VERCEL_ prefix for its own runtime vars and
    // won't accept user env vars that start with it.
    const hook = process.env.DEPLOY_HOOK_URL;
    if (!hook) {
      return errorResult(
        "DEPLOY_HOOK_URL is not configured in this MCP instance. Add it to " +
          "the Vercel project's env vars and redeploy the MCP.",
      );
    }
    try {
      const res = await fetch(hook, { method: "POST" });
      const text = await res.text();
      if (!res.ok) {
        return errorResult(`Deploy hook returned ${res.status}: ${text}`);
      }
      return textResult({
        ok: true,
        status: res.status,
        body: tryParseJson(text),
      });
    } catch (e: any) {
      return errorResult(`Deploy hook fetch failed: ${e?.message || String(e)}`);
    }
  },
};

function tryParseJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
