import os
from agentmail import AgentMail

api_key = os.getenv("AGENTMAIL_API_KEY")
if not api_key:
    raise SystemExit("AGENTMAIL_API_KEY not set")

client = AgentMail(api_key=api_key)

client.inboxes.messages.send(
    inbox_id="mate@agentmail.to",
    to="shayne@sweeney.nyc",
    subject="Quick check-in",
    text="Hey Shayne — just a quick test from AgentMail. If you see this, email sending is working."
)
print("sent")
