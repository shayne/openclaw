---
name: pairing-requested
description: "Notify admins when a pairing request is created"
homepage: https://docs.openclaw.ai/hooks#pairing-requested
metadata:
  {
    "openclaw":
      {
        "emoji": "🔐",
        "events": ["pairing:requested"],
        "install": [{ "id": "bundled", "kind": "bundled", "label": "Bundled with OpenClaw" }],
      },
  }
---

# Pairing Requested Hook

Notifies configured admins when a new pairing request is created for any channel.

## What It Does

When a pairing request is created (e.g., an unknown DM sends a message while `dmPolicy=pairing`):

1. **Builds a notification** with the channel, sender id, metadata (if available), and pairing code.
2. **Sends a DM** to configured admins for that channel (using the channel `allowFrom` list).

## Example Notification

```
🔐 New pairing request
Channel: telegram
Sender: 123456789 (@username)
Code: ABCD1234
Approve: openclaw pairing approve telegram <code>
```

## Configuration

Admins are derived from the channel's `allowFrom` configuration.

To disable this hook:

```bash
openclaw hooks disable pairing-requested
```
