// =============================================================================
// /.well-known/oauth-authorization-server
// =============================================================================
// RFC 8414 metadata document. Tells MCP clients (like Cowork) where to find
// our authorization, token, and dynamic-client-registration endpoints.
// =============================================================================

export const runtime = "nodejs";

export async function GET(req: Request) {
  const origin = originFrom(req);
  return Response.json({
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256", "plain"],
    token_endpoint_auth_methods_supported: [
      "none",
      "client_secret_post",
      "client_secret_basic",
    ],
    scopes_supported: ["mcp"],
  });
}

// We honour the X-Forwarded-* headers that Vercel sets so the URLs we return
// are always the canonical public origin.
function originFrom(req: Request): string {
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? url.host;
  const proto = forwardedProto ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
