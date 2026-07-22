// =============================================================================
// Minimal OAuth helpers for the Cyber Mouse MCP.
//
// We sign authorization codes statelessly so we don't need a database for the
// OAuth flow. Each code is `base64url(JSON payload).base64url(HMAC sig)`,
// signed with MCP_SHARED_SECRET. That avoids storing one-time-use state
// across stateless serverless invocations.
//
// PKCE (S256 + plain) is supported. Codes expire after CODE_TTL_SECONDS.
// =============================================================================

import { createHash, createHmac, randomBytes } from "crypto";

const CODE_TTL_SECONDS = 10 * 60; // 10 minutes

function signingSecret(): string {
  const s = process.env.MCP_SHARED_SECRET;
  if (!s) {
    throw new Error(
      "MCP_SHARED_SECRET not set — OAuth code signing requires it.",
    );
  }
  return s;
}

function base64url(buf: Buffer | Uint8Array | string): string {
  return Buffer.from(buf as Buffer).toString("base64url");
}

function base64urlDecode(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

function hmacSha256(data: string, secret: string): string {
  return base64url(createHmac("sha256", secret).update(data).digest());
}

export function sha256Base64Url(input: string): string {
  return base64url(createHash("sha256").update(input).digest());
}

// -----------------------------------------------------------------------------
// Authorization code: payload signed with HMAC(MCP_SHARED_SECRET).
// -----------------------------------------------------------------------------

export type CodePayload = {
  /** Issued-at (unix seconds). */
  iat: number;
  /** Expires-at (unix seconds). */
  exp: number;
  /** Nonce for uniqueness. */
  nonce: string;
  /** PKCE challenge, if the client sent one. */
  cc?: string;
  /** PKCE method ("S256" or "plain"). */
  ccm?: string;
  /** Redirect URI the client requested — must match at token exchange. */
  redirect_uri?: string;
  /** Client ID the code was issued to. */
  client_id?: string;
};

export function issueCode(partial: Omit<CodePayload, "iat" | "exp" | "nonce">): string {
  const payload: CodePayload = {
    ...partial,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + CODE_TTL_SECONDS,
    nonce: randomBytes(8).toString("hex"),
  };
  const data = base64url(JSON.stringify(payload));
  const sig = hmacSha256(data, signingSecret());
  return `${data}.${sig}`;
}

export function verifyCode(code: string): CodePayload | null {
  if (!code || typeof code !== "string") return null;
  const parts = code.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = hmacSha256(data, signingSecret());
  // Constant-time compare to avoid timing leaks (length differs ⇒ length check
  // is fine for the fail-fast path).
  if (sig.length !== expectedSig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (diff !== 0) return null;
  let payload: CodePayload;
  try {
    payload = JSON.parse(base64urlDecode(data).toString("utf-8")) as CodePayload;
  } catch {
    return null;
  }
  if (Math.floor(Date.now() / 1000) >= payload.exp) return null;
  return payload;
}

// -----------------------------------------------------------------------------
// PKCE check.
// -----------------------------------------------------------------------------

export function pkceMatches(
  challenge: string | undefined,
  method: string | undefined,
  verifier: string,
): boolean {
  if (!challenge) return true; // No challenge ⇒ no check needed.
  if (!verifier) return false;
  if (method === "S256") {
    return sha256Base64Url(verifier) === challenge;
  }
  // plain (or unspecified) ⇒ direct compare.
  return verifier === challenge;
}
