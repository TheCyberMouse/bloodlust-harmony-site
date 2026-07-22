import type { McpTool } from "./types";

import {
  listPagesTool,
  getPageTool,
  upsertPageTool,
  deletePageTool,
} from "./pages";
import {
  listVoiceRulesTool,
  addVoiceRuleTool,
  listVoicePhrasesTool,
  addVoicePhraseTool,
} from "./voice";
import { triggerDeployTool } from "./deploy";

/**
 * Master tool registry for the Bloodlust & Harmony wiki MCP. Prose pages +
 * brand voice + deploy only — the game-data entity tables are machine-owned
 * by the game repo's sync pipeline and have no write tools here on purpose.
 */
export const tools: McpTool[] = [
  // Prose pages (lore / guides / devlog)
  listPagesTool,
  getPageTool,
  upsertPageTool,
  deletePageTool,
  // Game voice
  listVoiceRulesTool,
  addVoiceRuleTool,
  listVoicePhrasesTool,
  addVoicePhraseTool,
  // Deploy
  triggerDeployTool,
];

export type { McpTool };
