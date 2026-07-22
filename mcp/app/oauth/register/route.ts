// =============================================================================
// POST /oauth/register — RFC 7591 Dynamic Client Registration
// =============================================================================
// Cowork posts here without prior knowledge of our server, registering itself
// as an OAuth client. We accept any registration. Because we issue tokens
// that are equivalent to the shared secret (single-user system, the user IS
// the MCP owner), we don't actually authenticate client_id / client_secret
// at the token endpoint — any registered client gets the same token.
//
// We echo back the redirect_uris the caller requested, plus a synthetic
// client_id, so the caller is happy.
// =============================================================================

import { randomBytes } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return Response.json(
      { error: "invalid_client_metadata", error_description: "Body must be JSON." },
      { status: 400 },
    );
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? (body.redirect_uris as string[])
    : [];

  const clientId = `cm-${randomBytes(8).toString("hex")}`;

  return Response.json(
    {
      client_id: clientId,
      // No client_secret — we use "none" (public client) auth so PKCE alone
      // protects the code exchange. This matches Anthropic's reference MCPs.
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      application_type: typeof body.application_type === "string" ? body.application_type : "native",
      client_name:
        typeof body.client_name === "string" ? body.client_name : "Cyber Mouse MCP Client",
    },
    { status: 201 },
  );
}

// Some clients probe with GET — return method-not-allowed.
export async function GET() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
