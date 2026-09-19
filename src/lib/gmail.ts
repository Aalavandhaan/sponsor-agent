const GIS_SRC = "https://accounts.google.com/gsi/client";
export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

declare global {
  interface Window {
    google?: any;
  }
}

function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Not in a browser"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Could not load Google sign-in. Check your connection and try again.")));
    if (!existing) {
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

/** Opens the Google consent flow and resolves with an in-memory access token. */
export async function requestGmailAccessToken(clientId: string): Promise<string> {
  if (!clientId) throw new Error("Google OAuth client ID is not configured.");
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SEND_SCOPE,
      callback: (response: { access_token?: string; error?: string; error_description?: string }) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || "Gmail authorization was cancelled."));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error: { message?: string }) => {
        reject(new Error(error?.message || "Gmail authorization was cancelled."));
      },
    });
    client.requestAccessToken();
  });
}

const b64 = (value: string) =>
  btoa(Array.from(new TextEncoder().encode(value), (byte) => String.fromCharCode(byte)).join(""));

const encodeHeader = (value: string) => (/^[\x00-\x7F]*$/.test(value) ? value : `=?UTF-8?B?${b64(value)}?=`);

export function buildRawMessage({ to, subject, message }: { to: string; subject: string; message: string }) {
  const mime = [
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    message,
  ].join("\r\n");
  return b64(mime).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sendGmailMessage(
  accessToken: string,
  email: { to: string; subject: string; message: string },
) {
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: buildRawMessage(email) }),
  });

  if (!response.ok) {
    const body = await response.text();
    let detail = body;
    try {
      detail = JSON.parse(body)?.error?.message ?? body;
    } catch {
      /* keep raw body */
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Gmail rejected the request (${response.status}). Reconnect Gmail and try again. ${detail}`);
    }
    throw new Error(`Gmail could not send the email (${response.status}). ${detail}`);
  }

  return (await response.json()) as { id: string };
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
