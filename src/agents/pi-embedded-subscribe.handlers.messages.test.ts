import { describe, expect, it } from "vitest";
import {
  resolveAssistantMessagePhase,
  resolveSilentReplyFallbackText,
} from "./pi-embedded-subscribe.handlers.messages.js";

describe("resolveSilentReplyFallbackText", () => {
  it("replaces NO_REPLY with latest messaging tool text when available", () => {
    expect(
      resolveSilentReplyFallbackText({
        text: "NO_REPLY",
        messagingToolSentTexts: ["first", "final delivered text"],
      }),
    ).toBe("final delivered text");
  });

  it("keeps original text when response is not NO_REPLY", () => {
    expect(
      resolveSilentReplyFallbackText({
        text: "normal assistant reply",
        messagingToolSentTexts: ["final delivered text"],
      }),
    ).toBe("normal assistant reply");
  });

  it("keeps NO_REPLY when there is no messaging tool text to mirror", () => {
    expect(
      resolveSilentReplyFallbackText({
        text: "NO_REPLY",
        messagingToolSentTexts: [],
      }),
    ).toBe("NO_REPLY");
  });
});

describe("resolveAssistantMessagePhase", () => {
  it("reads commentary phase from assistant textSignature metadata", () => {
    expect(
      resolveAssistantMessagePhase({
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Working on it",
            textSignature: JSON.stringify({
              v: 1,
              id: "msg_commentary",
              phase: "commentary",
            }),
          },
        ],
      } as never),
    ).toBe("commentary");
  });

  it("prefers explicit assistant phase when present", () => {
    expect(
      resolveAssistantMessagePhase({
        role: "assistant",
        phase: "final_answer",
        content: [
          {
            type: "text",
            text: "Done",
            textSignature: JSON.stringify({
              v: 1,
              id: "msg_commentary",
              phase: "commentary",
            }),
          },
        ],
      } as never),
    ).toBe("final_answer");
  });
});
