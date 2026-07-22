// =============================================================================
// /.well-known/oauth-protected-resource
// =============================================================================
// Protected-resource metadata (the newer MCP spec adds this alongside RFC
// 8414's authorization-server metadata). Tells clients which authorization
// servers can issue tokens for this resource.
// =============================================================================

export const runtime = "nodejs";

export async function GET(req: Request) {
  const origin = originFrom(req);
  return Response.json({
    resource: `${origin}/api/mcp`,
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp"],
  });
}

function originFrom(req: Request): string {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? url.host;
  const proto = forwardedProto ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
