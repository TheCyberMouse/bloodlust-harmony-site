// =============================================================================
// GET /oauth/authorize — OAuth 2.1 authorization endpoint
// =============================================================================
// The client (Cowork) opens this URL in the user's browser. Because this MCP
// is single-user (Patrick is both the MCP owner and the only user), there
// is no separate "consent" needed — we auto-approve and redirect back with
// an authorization code.
//
// If you ever multi-tenant this, you'd render a real consent UI here.
// =============================================================================

import { issueCode } from "@/lib/oauth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;
  const redirectUri = params.get("redirect_uri");
  const state = params.get("state");
  const responseType = params.get("response_type");
  const clientId = params.get("client_id");
  const codeChallenge = params.get("code_challenge") ?? undefined;
  const codeChallengeMethod = params.get("code_challenge_method") ?? undefined;

  // Validate required params.
  if (!redirectUri) {
    return new Response("Missing required parameter: redirect_uri", { status: 400 });
  }
  if (responseType !== "code") {
    return redirectWithError(
      redirectUri,
      state,
      "unsupported_response_type",
      "Only response_type=code is supported.",
    );
  }
  if (!clientId) {
    return redirectWithError(redirectUri, state, "invalid_request", "Missing client_id.");
  }

  // Auto-approve and issue a signed authorization code.
  const code = issueCode({
    cc: codeChallenge,
    ccm: codeChallengeMethod,
    redirect_uri: redirectUri,
    client_id: clientId,
  });

  return redirectWithCode(redirectUri, state, code);
}

function redirectWithCode(redirectUri: string, state: string | null, code: string): Response {
  const target = new URL(redirectUri);
  target.searchParams.set("code", code);
  if (state) target.searchParams.set("state", state);
  return Response.redirect(target.toString(), 302);
}

function redirectWithError(
  redirectUri: string,
  state: string | null,
  error: string,
  description: string,
): Response {
  // Per RFC 6749, errors get returned via redirect when redirect_uri parses OK.
  try {
    const target = new URL(redirectUri);
    target.searchParams.set("error", error);
    target.searchParams.set("error_description", description);
    if (state) target.searchParams.set("state", state);
    return Response.redirect(target.toString(), 302);
  } catch {
    return new Response(`${error}: ${description}`, { status: 400 });
  }
}
