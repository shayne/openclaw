#!/usr/bin/env python3
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen

try:
    from agentmail import AgentMail
except Exception:
    AgentMail = None

HOOKS_TOKEN = os.getenv("OPENCLAW_HOOKS_TOKEN", "REPLACE_WITH_OPENCLAW_HOOKS_TOKEN")
HOOKS_URL = os.getenv("OPENCLAW_HOOKS_URL", "http://127.0.0.1:18789/hooks/wake")
AGENTMAIL_API_KEY = os.getenv("AGENTMAIL_API_KEY")
INBOX_ID = os.getenv("AGENTMAIL_INBOX", "mate@agentmail.to")
AUTO_REPLY = os.getenv("AGENTMAIL_AUTO_REPLY", "true").lower() in ("1", "true", "yes", "on")
AUTO_REPLY_TEXT = os.getenv(
    "AGENTMAIL_AUTO_REPLY_TEXT",
    "Got it — received. I’ll follow up shortly here too.",
)

class Handler(BaseHTTPRequestHandler):
    def _send(self, code=200, body=b"ok"):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/agentmail":
            return self._send(404, b"not found")
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            return self._send(400, b"invalid json")

        msg = payload.get("message", {}) if isinstance(payload, dict) else {}
        subject = msg.get("subject") or "(no subject)"
        text = msg.get("text") or msg.get("snippet") or "(no body)"
        from_list = msg.get("from") or []
        sender = None
        if isinstance(from_list, list) and from_list:
            sender = from_list[0].get("email") or from_list[0].get("name")
        sender = sender or "unknown"

        # Notify OpenClaw
        wake_text = f"📬 AgentMail from {sender}\nSubject: {subject}\n\n{text}"
        req = Request(
            HOOKS_URL,
            data=json.dumps({"text": wake_text, "mode": "now"}).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {HOOKS_TOKEN}",
            },
            method="POST",
        )
        try:
            with urlopen(req, timeout=10) as resp:
                resp.read()
        except Exception as e:
            return self._send(502, f"hook error: {e}".encode("utf-8"))

        # Auto-reply (avoid loops)
        if AUTO_REPLY and AgentMail and AGENTMAIL_API_KEY:
            sender_email = sender if isinstance(sender, str) else ""
            if sender_email and sender_email.lower() != INBOX_ID.lower() and "agentmail.to" not in sender_email.lower():
                try:
                    client = AgentMail(api_key=AGENTMAIL_API_KEY)
                    reply_subject = subject if subject.lower().startswith("re:") else f"Re: {subject}"
                    client.inboxes.messages.send(
                        inbox_id=INBOX_ID,
                        to=sender_email,
                        subject=reply_subject,
                        text=AUTO_REPLY_TEXT,
                    )
                except Exception:
                    pass

        return self._send(200, b"ok")

if __name__ == "__main__":
    port = int(os.getenv("AGENTMAIL_WEBHOOK_PORT", "18999"))
    server = HTTPServer(("127.0.0.1", port), Handler)
    print(f"AgentMail webhook listening on 127.0.0.1:{port}")
    server.serve_forever()
