import { z } from "zod";
import { supabase } from "@/lib/supabase";
import {
  McpTool,
  errorResult,
  textResult,
  zodObjectToJsonSchema,
} from "./types";

const RULES_TABLE = "voice_rules";
const PHRASES_TABLE = "voice_phrases";

// -----------------------------------------------------------------------------
// list_voice_rules
// -----------------------------------------------------------------------------
export const listVoiceRulesTool: McpTool = {
  name: "list_voice_rules",
  description:
    "List all Bloodlust & Harmony game-voice rules (always/prefer/avoid/never). Claude " +
    "should call this BEFORE drafting any public-facing copy and follow what " +
    "it returns.",
  inputSchema: zodObjectToJsonSchema({}),
  handler: async () => {
    const { data, error } = await supabase()
      .from(RULES_TABLE)
      .select("id, rule_type, description, created_at")
      .order("rule_type, created_at");
    if (error) return errorResult(`list_voice_rules failed: ${error.message}`);
    return textResult(data);
  },
};

// -----------------------------------------------------------------------------
// add_voice_rule
// -----------------------------------------------------------------------------
const AddVoiceRuleArgs = z.object({
  rule_type: z
    .enum(["always", "prefer", "avoid", "never"])
    .describe(
      "Severity. 'always'/'never' are absolute, 'prefer'/'avoid' are soft.",
    ),
  description: z
    .string()
    .describe("The rule itself. Phrase it as an actionable directive."),
});

export const addVoiceRuleTool: McpTool = {
  name: "add_voice_rule",
  description: "Add a new brand-voice rule.",
  inputSchema: zodObjectToJsonSchema(AddVoiceRuleArgs.shape),
  handler: async (args) => {
    const rule = AddVoiceRuleArgs.parse(args);
    const { error, data } = await supabase()
      .from(RULES_TABLE)
      .insert(rule)
      .select("id")
      .single();
    if (error) return errorResult(`add_voice_rule failed: ${error.message}`);
    return textResult({ ok: true, id: data.id });
  },
};

// -----------------------------------------------------------------------------
// list_voice_phrases
// -----------------------------------------------------------------------------
const ListVoicePhrasesArgs = z.object({
  category: z.string().optional().describe("Filter to one category if provided."),
});

export const listVoicePhrasesTool: McpTool = {
  name: "list_voice_phrases",
  description:
    "List example phrases grouped by category. Useful when Claude needs " +
    "in-house language (Holy Inquiry, Codification, etc.) or canonical " +
    "openings/closings.",
  inputSchema: zodObjectToJsonSchema(ListVoicePhrasesArgs.shape),
  handler: async (args) => {
    const { category } = ListVoicePhrasesArgs.parse(args ?? {});
    let q = supabase().from(PHRASES_TABLE).select("id, category, phrase");
    if (category) q = q.eq("category", category);
    const { data, error } = await q.order("category, id");
    if (error) return errorResult(`list_voice_phrases failed: ${error.message}`);
    return textResult(data);
  },
};

// -----------------------------------------------------------------------------
// add_voice_phrase
// -----------------------------------------------------------------------------
const AddVoicePhraseArgs = z.object({
  category: z.string().describe("Group, e.g. 'opener', 'objection', 'close', 'lexicon'."),
  phrase: z.string().describe("The phrase itself."),
});

export const addVoicePhraseTool: McpTool = {
  name: "add_voice_phrase",
  description: "Add a new branded phrase to the voice library.",
  inputSchema: zodObjectToJsonSchema(AddVoicePhraseArgs.shape),
  handler: async (args) => {
    const phrase = AddVoicePhraseArgs.parse(args);
    const { error, data } = await supabase()
      .from(PHRASES_TABLE)
      .insert(phrase)
      .select("id")
      .single();
    if (error) return errorResult(`add_voice_phrase failed: ${error.message}`);
    return textResult({ ok: true, id: data.id });
  },
};
