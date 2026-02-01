import { spawn } from "node:child_process";
import type { RuntimeEnv } from "../runtime.js";

export type SignalDaemonOpts = {
  cliPath: string;
  account?: string;
  httpHost: string;
  httpPort: number;
  receiveMode?: "on-start" | "manual";
  ignoreAttachments?: boolean;
  ignoreStories?: boolean;
  sendReadReceipts?: boolean;
  runtime?: RuntimeEnv;
  onUntrustedIdentity?: (params: { identity: string; line: string }) => void | Promise<void>;
};

export type SignalDaemonHandle = {
  pid?: number;
  stop: () => void;
};

export function classifySignalCliLogLine(line: string): "log" | "error" | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }
  // signal-cli commonly writes all logs to stderr; treat severity explicitly.
  if (/\b(ERROR|WARN|WARNING)\b/.test(trimmed)) {
    return "error";
  }
  // Some signal-cli failures are not tagged with WARN/ERROR but should still be surfaced loudly.
  if (/\b(FAILED|SEVERE|EXCEPTION)\b/i.test(trimmed)) {
    return "error";
  }
  return "log";
}

function extractUntrustedIdentity(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }
  if (!/\buntrusted identity\b/i.test(trimmed)) {
    return null;
  }
  const match = trimmed.match(/\buntrusted identity\b(?:[^:]*[:\s]+)?(.+)$/i);
  const identity = match?.[1]?.trim();
  return identity || trimmed;
}

function buildDaemonArgs(opts: SignalDaemonOpts): string[] {
  const args: string[] = [];
  if (opts.account) {
    args.push("-a", opts.account);
  }
  args.push("daemon");
  args.push("--http", `${opts.httpHost}:${opts.httpPort}`);
  args.push("--no-receive-stdout");

  if (opts.receiveMode) {
    args.push("--receive-mode", opts.receiveMode);
  }
  if (opts.ignoreAttachments) {
    args.push("--ignore-attachments");
  }
  if (opts.ignoreStories) {
    args.push("--ignore-stories");
  }
  if (opts.sendReadReceipts) {
    args.push("--send-read-receipts");
  }

  return args;
}

export function spawnSignalDaemon(opts: SignalDaemonOpts): SignalDaemonHandle {
  const args = buildDaemonArgs(opts);
  const child = spawn(opts.cliPath, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const log = opts.runtime?.log ?? (() => {});
  const error = opts.runtime?.error ?? (() => {});
  const onUntrustedIdentity = opts.onUntrustedIdentity;

  const handleLine = (raw: string) => {
    const line = raw.trim();
    if (!line) {
      return;
    }
    const untrustedIdentity = onUntrustedIdentity ? extractUntrustedIdentity(line) : null;
    if (untrustedIdentity && onUntrustedIdentity) {
      try {
        void onUntrustedIdentity({ identity: untrustedIdentity, line });
      } catch (err) {
        error(`signal-cli untrusted identity handler failed: ${String(err)}`);
      }
    }
    const kind = classifySignalCliLogLine(line);
    if (kind === "log") {
      log(`signal-cli: ${line}`);
    } else if (kind === "error") {
      error(`signal-cli: ${line}`);
    }
  };

  child.stdout?.on("data", (data) => {
    for (const line of data.toString().split(/\r?\n/)) {
      handleLine(line);
    }
  });
  child.stderr?.on("data", (data) => {
    for (const line of data.toString().split(/\r?\n/)) {
      handleLine(line);
    }
  });
  child.on("error", (err) => {
    error(`signal-cli spawn error: ${String(err)}`);
  });

  return {
    pid: child.pid ?? undefined,
    stop: () => {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    },
  };
}
