import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isRetryable, withRetry, runPipeline } from "./pipeline";

const messagesCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: messagesCreate };
  },
}));

beforeEach(() => {
  messagesCreate.mockReset();
});

describe("isRetryable", () => {
  it("returns true for rate limit errors", () => {
    expect(isRetryable(new Error("Rate limit exceeded"))).toBe(true);
    expect(isRetryable(new Error("HTTP 429 Too Many Requests"))).toBe(true);
  });

  it("returns true for 5xx server errors", () => {
    expect(isRetryable(new Error("HTTP 500"))).toBe(true);
    expect(isRetryable(new Error("502 Bad Gateway"))).toBe(true);
    expect(isRetryable(new Error("503 Service Unavailable"))).toBe(true);
  });

  it("returns true for overload/capacity errors", () => {
    expect(isRetryable(new Error("Server overloaded"))).toBe(true);
    expect(isRetryable(new Error("at capacity"))).toBe(true);
  });

  it("returns true for network/timeout errors", () => {
    expect(isRetryable(new Error("Network error"))).toBe(true);
    expect(isRetryable(new Error("Request timeout"))).toBe(true);
    expect(isRetryable(new Error("fetch failed"))).toBe(true);
  });

  it("returns false for ordinary errors", () => {
    expect(isRetryable(new Error("Failed to parse JSON"))).toBe(false);
    expect(isRetryable(new Error("Invalid API key"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isRetryable("not an error")).toBe(false);
    expect(isRetryable(null)).toBe(false);
    expect(isRetryable(undefined)).toBe(false);
  });
});

describe("withRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the result without retrying when fn succeeds", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry("step", fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable errors and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("rate limit"))
      .mockResolvedValueOnce("ok");
    const promise = withRetry("step", fn);
    await vi.runAllTimersAsync();
    expect(await promise).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries on retryable errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("rate limit"));
    const promise = withRetry("step", fn);
    const expectation = expect(promise).rejects.toThrow(/Pipeline failed at "step"/);
    await vi.runAllTimersAsync();
    await expectation;
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry on non-retryable errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Invalid JSON"));
    await expect(withRetry("step", fn)).rejects.toThrow(/Pipeline failed at "step": Invalid JSON/);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("includes step name in the error message", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(withRetry("Clustering themes", fn)).rejects.toThrow(
      /Pipeline failed at "Clustering themes": boom/,
    );
  });
});

describe("runPipeline", () => {
  it("returns a complete AnalysisReport on the happy path", async () => {
    messagesCreate
      // Step 1: ingest
      .mockResolvedValueOnce({
        content: [{ type: "text", text: '["fb1", "fb2"]' }],
      })
      // Step 2: cluster
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              themes: ["theme A"],
              entries: [
                { id: 0, text: "fb1", themes: ["theme A"], sentiment: "positive", isFeatureRequest: false },
                { id: 1, text: "fb2", themes: ["theme A"], sentiment: "negative", isFeatureRequest: true },
              ],
            }),
          },
        ],
      })
      // Steps 3 & 4 run in parallel
      .mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify({ "theme A": "high" }) }],
      })
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              themeQuotes: { "theme A": ["fb1"] },
              featureRequests: [{ description: "do thing", count: 1, quotes: ["fb2"] }],
            }),
          },
        ],
      })
      // Step 5: synthesize
      .mockResolvedValueOnce({
        content: [{ type: "text", text: '["Insight 1", "Insight 2"]' }],
      });

    const report = await runPipeline("raw text", "test-key", () => {});
    expect(report.executiveSummary).toEqual(["Insight 1", "Insight 2"]);
    expect(report.themes).toHaveLength(1);
    expect(report.themes[0].name).toBe("theme A");
    expect(report.themes[0].actionability).toBe("high");
    expect(report.themes[0].quotes).toEqual(["fb1"]);
    expect(report.featureRequests).toHaveLength(1);
    expect(report.totalEntries).toBe(2);
    expect(report.analyzedAt).toBeTruthy();
  });

  it("calls onStep for every pipeline step in order", async () => {
    messagesCreate
      .mockResolvedValueOnce({ content: [{ type: "text", text: '["fb1"]' }] })
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              themes: ["t"],
              entries: [{ id: 0, text: "fb1", themes: ["t"], sentiment: "neutral", isFeatureRequest: false }],
            }),
          },
        ],
      })
      .mockResolvedValueOnce({ content: [{ type: "text", text: '{"t": "low"}' }] })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: '{"themeQuotes": {}, "featureRequests": []}' }],
      })
      .mockResolvedValueOnce({ content: [{ type: "text", text: '["summary"]' }] });

    const onStep = vi.fn();
    await runPipeline("raw", "key", onStep);
    expect(onStep.mock.calls.map((c) => c[0])).toEqual([
      "ingesting",
      "clustering",
      "scoring",
      "extracting",
      "synthesizing",
      "complete",
    ]);
  });

  it("emits onPartialResult with themes and feature requests before synthesis", async () => {
    messagesCreate
      .mockResolvedValueOnce({ content: [{ type: "text", text: '["fb1"]' }] })
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              themes: ["t"],
              entries: [{ id: 0, text: "fb1", themes: ["t"], sentiment: "neutral", isFeatureRequest: false }],
            }),
          },
        ],
      })
      .mockResolvedValueOnce({ content: [{ type: "text", text: '{"t": "medium"}' }] })
      .mockResolvedValueOnce({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              themeQuotes: { t: ["fb1"] },
              featureRequests: [{ description: "X", count: 1, quotes: [] }],
            }),
          },
        ],
      })
      .mockResolvedValueOnce({ content: [{ type: "text", text: '["s"]' }] });

    const onPartial = vi.fn();
    await runPipeline("raw", "key", () => {}, onPartial);
    expect(onPartial).toHaveBeenCalledOnce();
    const partial = onPartial.mock.calls[0][0];
    expect(partial.themes).toHaveLength(1);
    expect(partial.featureRequests).toHaveLength(1);
    expect(partial.totalEntries).toBe(1);
  });
});
