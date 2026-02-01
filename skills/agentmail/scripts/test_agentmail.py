import os
from agentmail import AgentMail

api_key = os.getenv("AGENTMAIL_API_KEY")
if not api_key:
    raise SystemExit("AGENTMAIL_API_KEY not set")

client = AgentMail(api_key=api_key)

# List inboxes (first 10)
resp = client.inboxes.list(limit=10)
print("inboxes:")
for inbox in resp.inboxes:
    print(f"- {inbox.inbox_id} ({inbox.display_name})")
