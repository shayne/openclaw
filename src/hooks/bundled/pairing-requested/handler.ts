import type { OpenClawConfig } from "../../../config/config.js";
import { loadConfig } from "../../../config/config.js";
import { getChannelDock } from "../../../channels/dock.js";
import { normalizeChannelId } from "../../../channels/plugins/index.js";
import { formatCliCommand } from "../../../cli/command-format.js";
import type { HookHandler } from "../../hooks.js";

const formatSenderLabel = (id: string, meta?: Record<string, string>): string => {
  if (!meta) {
    return id;
  }

  const details: string[] = [];
  const name = [meta.firstName, meta.lastName].filter(Boolean).join(" ").trim();
  if (name) {
    details.push(name);
  }
  if (meta.name && meta.name !== name) {
    details.push(meta.name);
  }
  if (meta.displayName && meta.displayName !== name && meta.displayName !== meta.name) {
    details.push(meta.displayName);
  }
  if (meta.username) {
    details.push(meta.username.startsWith("@") ? meta.username : `@${meta.username}`);
  }

  if (details.length === 0) {
    return id;
  }

  return `${id} (${details.join(", ")})`;
};

const handler: HookHandler = async (event) => {
  if (event.type !== "pairing" || event.action !== "requested") {
    return;
  }

  const context = event.context ?? {};
  const channelRaw = typeof context.channel === "string" ? context.channel : "";
  const channel = normalizeChannelId(channelRaw);
  if (!channel) {
    return;
  }

  const cfg =
    (context.cfg && typeof context.cfg === "object" ? (context.cfg as OpenClawConfig) : null) ??
    loadConfig();

  const dock = getChannelDock(channel);
  const resolveAllowFrom = dock?.config?.resolveAllowFrom;
  if (!resolveAllowFrom) {
    return;
  }

  const accountId = typeof context.accountId === "string" ? context.accountId : undefined;
  const allowFromRaw = resolveAllowFrom({ cfg, accountId }) ?? [];
  const allowFrom = dock?.config?.formatAllowFrom
    ? dock.config.formatAllowFrom({ cfg, accountId, allowFrom: allowFromRaw })
    : allowFromRaw.map((entry) => String(entry).trim()).filter(Boolean);

  const recipients = Array.from(new Set(allowFrom.filter((entry) => entry && entry !== "*")));
  if (recipients.length === 0) {
    return;
  }

  const id =
    typeof context.id === "string" || typeof context.id === "number"
      ? String(context.id)
      : "unknown";
  const code = typeof context.code === "string" ? context.code : "";
  const meta =
    context.meta && typeof context.meta === "object"
      ? (context.meta as Record<string, string>)
      : undefined;

  const senderLabel = formatSenderLabel(id, meta);
  const lines = [
    "🔐 New pairing request",
    `Channel: ${channel}`,
    `Sender: ${senderLabel}`,
    ...(code ? [`Code: ${code}`] : []),
    `Approve: ${formatCliCommand(`openclaw pairing approve ${channel} <code>`)}`,
  ];
  const message = lines.join("\n");

  const { deliverOutboundPayloads } = await import("../../../infra/outbound/deliver.js");

  for (const recipient of recipients) {
    try {
      await deliverOutboundPayloads({
        cfg,
        channel,
        to: recipient,
        accountId,
        payloads: [{ text: message }],
        replyToId: null,
        threadId: null,
      });
    } catch (err) {
      console.warn(
        `[pairing-requested] Failed to notify ${channel} recipient ${recipient}: ${String(err)}`,
      );
    }
  }
};

export default handler;
