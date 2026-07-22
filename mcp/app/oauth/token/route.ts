// =============================================================================
// POST /oauth/token — OAuth 2.1 token endpoint
// =============================================================================
// Exchanges an authorization_code for an access token. The issued access
// token is the MCP_SHARED_SECRET itself, since this is a single-user system
// and /api/mcp already accepts that value as a bearer token.
// =============================================================================

import { pkceMatches, verifyCode } from "@/lib/oauth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let params: URLSearchParams;
  if (contentType.includes("application/json")) {
    try {
      const body = (await req.json()) as Record<string, string>;
      params = new URLSearchParams(body as Record<string, string>);
    } catch {
      return tokenError("invalid_request", "Body must be JSON or form-urlencoded.");
    }
  } else {
    const text = await req.text();
    params = new URLSearchParams(text);
  }

  const grantType = params.get("grant_type");
  if (grantType !== "authorization_code") {
    return tokenError(
      "unsupported_grant_type",
      `grant_type=${grantType} is not supported.`,
    );
  }

  const code = params.get("code") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const verifier = params.get("code_verifier") ?? "";

  const payload = verifyCode(code);
  if (!payload) {
    return tokenError("invalid_grant", "Authorization code is invalid or expired.");
  }

  // redirect_uri must match what was sent to /oauth/authorize.
  if (payload.redirect_uri && redirectUri && payload.redirect_uri !== redirectUri) {
    return tokenError("invalid_grant", "redirect_uri does not match the original request.");
  }

  // PKCE check.
  if (payload.cc && !pkceMatches(payload.cc, payload.ccm, verifier)) {
    return tokenError("invalid_grant", "PKCE verification failed.");
  }

  const accessToken = process.env.MCP_SHARED_SECRET;
  if (!accessToken) {
    return tokenError("server_error", "MCP_SHARED_SECRET not configured on the server.");
  }

  return Response.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 60 * 60 * 24 * 365, // effectively non-expiring for personal use
      scope: "mcp",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    },
  );
}

function tokenError(error: string, description: string): Response {
  return Response.json(
    { error, error_description: description },
    {
      status: 400,
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    },
  );
}

// GET on the token endpoint is invalid per RFC 6749.
export async function GET() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
