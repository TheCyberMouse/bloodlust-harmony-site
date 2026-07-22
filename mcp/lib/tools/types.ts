import { z } from "zod";

/**
 * MCP tool definition. The `inputSchema` is a JSON Schema (Draft 7) that
 * MCP clients use to validate arguments before invoking the tool. We
 * generate it from a Zod schema via `zodToJsonSchema` in each tool file.
 */
export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<McpResult>;
};

/** What a tool returns — list of content blocks, MCP-style. */
export type McpResult = {
  content: Array<
    | { type: "text"; text: string }
    | { type: "image"; data: string; mimeType: string }
  >;
  isError?: boolean;
};

/** Convenience: format any JSON-able value as a single text content block. */
export function textResult(value: unknown): McpResult {
  return {
    content: [
      {
        type: "text",
        text:
          typeof value === "string"
            ? value
            : JSON.stringify(value, null, 2),
      },
    ],
  };
}

/** Convenience: signal an error to the MCP client. */
export function errorResult(message: string): McpResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

/**
 * Minimal Zod → JSON Schema converter for the tool input shapes we use.
 * Avoids pulling in a heavy library. Handles only the shapes we need:
 * objects of (string | number | boolean | array | optional) fields with
 * `.describe(...)` annotations.
 */
export function zodObjectToJsonSchema(
  shape: z.ZodRawShape,
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, raw] of Object.entries(shape)) {
    const { schema, isOptional } = unwrap(raw);
    const desc = (raw as any)._def?.description;
    properties[key] = { ...zodLeaf(schema), ...(desc && { description: desc }) };
    if (!isOptional) required.push(key);
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

function unwrap(s: z.ZodTypeAny): { schema: z.ZodTypeAny; isOptional: boolean } {
  let isOptional = false;
  let cur: any = s;
  // Peel ZodOptional / ZodDefault / ZodNullable
  while (
    cur?._def?.typeName === "ZodOptional" ||
    cur?._def?.typeName === "ZodDefault" ||
    cur?._def?.typeName === "ZodNullable"
  ) {
    if (cur._def.typeName === "ZodOptional") isOptional = true;
    if (cur._def.typeName === "ZodDefault") isOptional = true;
    cur = cur._def.innerType;
  }
  return { schema: cur, isOptional };
}

function zodLeaf(s: z.ZodTypeAny): Record<string, unknown> {
  const t = (s as any)._def.typeName;
  switch (t) {
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodArray":
      return { type: "array", items: zodLeaf((s as any)._def.type) };
    case "ZodEnum":
      return { type: "string", enum: (s as any)._def.values };
    case "ZodAny":
    case "ZodUnknown":
      return {};
    case "ZodRecord":
      return { type: "object", additionalProperties: true };
    case "ZodObject":
      return zodObjectToJsonSchema((s as any)._def.shape());
    default:
      return {};
  }
}
