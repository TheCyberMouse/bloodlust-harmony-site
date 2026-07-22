// =============================================================================
// Cyber Mouse MCP — single JSON-RPC endpoint
// =============================================================================
// Speaks the Model Context Protocol (JSON-RPC 2.0 over HTTP). Stateless —
// every POST request is independent, so the route plays nicely with Vercel
// serverless functions.
//
// Auth: every request must carry `Authorization: Bearer ${MCP_SHARED_SECRET}`.
// The shared secret is set in this MCP's env vars and pasted into Cowork
// when the connector is registered.
// =============================================================================

import { z } from "zod";
import { tools } from "@/lib/tools";

export const runtime = "nodejs";
export const maxDuration = 60; // Tools that hit Supabase/Replicate need a moment.

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = {
  name: "bloodlust-harmony-mcp",
  version: "0.1.0",
};

const JsonRpcRequest = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.any().optional(),
});

function ok(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function err(id: unknown, code: number, message: string, data?: unknown) {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message, ...(data !== undefined && { data }) },
  });
}

export async function POST(req: Request) {
  // -----------------------------------------------------------------------
  // Auth
  // -----------------------------------------------------------------------
  const expected = process.env.MCP_SHARED_SECRET;
  if (!expected) {
    return new Response(
      "MCP_SHARED_SECRET not configured on the server.",
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";

  // Compare against several plausible formats so we don't trip on minor
  // client conventions: Bearer <token>, raw <token>, or token-prefix forms.
  const matchesBearer = auth === `Bearer ${expected}`;
  const matchesRaw = auth === expected;
  const matchesXApiKey = req.headers.get("x-api-key") === expected;

  if (!matchesBearer && !matchesRaw && !matchesXApiKey) {
    // Per the MCP spec, a 401 response from the resource server should
    // include WWW-Authenticate pointing to the OAuth protected-resource
    // metadata so the client can discover where to obtain a token.
    const origin = (() => {
      const url = new URL(req.url);
      const fwdHost = req.headers.get("x-forwarded-host");
      const fwdProto = req.headers.get("x-forwarded-proto");
      const host = fwdHost ?? url.host;
      const proto = fwdProto ?? url.protocol.replace(":", "");
      return `${proto}://${host}`;
    })();

    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer realm="bloodlust-harmony-mcp", resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
      },
    });
  }

  // -----------------------------------------------------------------------
  // Parse JSON-RPC
  // -----------------------------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err(null, -32700, "Parse error: request body is not valid JSON.");
  }

  const parsed = JsonRpcRequest.safeParse(body);
  if (!parsed.success) {
    return err(
      (body as { id?: unknown })?.id ?? null,
      -32600,
      "Invalid Request: " + parsed.error.message,
    );
  }
  const { id = null, method, params } = parsed.data;

  // -----------------------------------------------------------------------
  // Dispatch
  // -----------------------------------------------------------------------
  try {
    switch (method) {
      case "initialize":
        return ok(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        });

      case "notifications/initialized":
      case "notifications/cancelled":
        // Notifications expect no response per JSON-RPC; HTTP 204 is fine.
        return new Response(null, { status: 204 });

      case "ping":
        return ok(id, {});

      case "tools/list":
        return ok(id, {
          tools: tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
          })),
        });

      case "tools/call": {
        const callParams = z
          .object({
            name: z.string(),
            arguments: z.record(z.any()).optional(),
          })
          .safeParse(params);
        if (!callParams.success) {
          return err(id, -32602, "Invalid params for tools/call.");
        }
        const tool = tools.find((t) => t.name === callParams.data.name);
        if (!tool) {
          return err(id, -32601, `Unknown tool: ${callParams.data.name}`);
        }
        const result = await tool.handler(callParams.data.arguments ?? {});
        return ok(id, result);
      }

      default:
        return err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Internal error";
    return err(id, -32603, msg);
  }
}

// Some clients probe with GET — return a small JSON status for health checks.
export async function GET() {
  return Response.json({
    status: "ok",
    server: SERVER_INFO,
    protocolVersion: PROTOCOL_VERSION,
    toolCount: tools.length,
  });
}
