import { beforeEach, describe, it, expect, vi } from "vitest";
import { getSavedReports, saveReport, deleteReport } from "./reportHistory";
import type { AnalysisReport } from "./types";

const mockReport: AnalysisReport = {
  executiveSummary: ["Users want faster load times", "Mobile UX needs work"],
  themes: [],
  featureRequests: [],
  totalEntries: 30,
  analyzedAt: "2026-04-28T00:00:00.000Z",
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("getSavedReports", () => {
  it("returns empty array when no reports are saved", () => {
    expect(getSavedReports()).toEqual([]);
  });

  it("returns all saved reports", () => {
    saveReport(mockReport, "feedback text");
    saveReport(mockReport, "more feedback");
    expect(getSavedReports()).toHaveLength(2);
  });

  it("returns empty array when localStorage contains corrupt JSON", () => {
    localStorage.setItem("feedback-synth-reports", "{not valid json");
    expect(getSavedReports()).toEqual([]);
  });
});

describe("saveReport", () => {
  it("saves a report and returns it with id, savedAt, and feedbackPreview", () => {
    const saved = saveReport(mockReport, "Users love the dark mode");
    expect(saved.id).toBeTruthy();
    expect(saved.savedAt).toBeTruthy();
    expect(saved.feedbackPreview).toBe("Users love the dark mode");
    expect(saved.report).toEqual(mockReport);
  });

  it("truncates long feedback to 120 chars with ellipsis", () => {
    const long = "a".repeat(200);
    const saved = saveReport(mockReport, long);
    expect(saved.feedbackPreview).toBe("a".repeat(120) + "...");
  });

  it("does not add ellipsis when feedback is exactly 120 chars", () => {
    const exact = "a".repeat(120);
    const saved = saveReport(mockReport, exact);
    expect(saved.feedbackPreview).toBe(exact);
    expect(saved.feedbackPreview.endsWith("...")).toBe(false);
  });

  it("trims whitespace from the feedback preview", () => {
    const saved = saveReport(mockReport, "   hello world   ");
    expect(saved.feedbackPreview).toBe("hello world");
  });

  it("prepends new reports so newest is first", () => {
    saveReport(mockReport, "first");
    saveReport(mockReport, "second");
    const reports = getSavedReports();
    expect(reports[0].feedbackPreview).toBe("second");
    expect(reports[1].feedbackPreview).toBe("first");
  });

  it("limits storage to 10 reports, dropping the oldest", () => {
    for (let i = 0; i < 12; i++) {
      saveReport(mockReport, `feedback ${i}`);
    }
    const reports = getSavedReports();
    expect(reports).toHaveLength(10);
    expect(reports[0].feedbackPreview).toBe("feedback 11");
    expect(reports[9].feedbackPreview).toBe("feedback 2");
  });

  it("persists saved reports to localStorage under the correct key", () => {
    saveReport(mockReport, "feedback");
    const raw = localStorage.getItem("feedback-synth-reports");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toHaveLength(1);
  });

  it("generates a unique id for each saved report", () => {
    const a = saveReport(mockReport, "one");
    const b = saveReport(mockReport, "two");
    expect(a.id).not.toBe(b.id);
  });
});

describe("deleteReport", () => {
  it("removes the report with the given id", () => {
    const saved = saveReport(mockReport, "feedback");
    deleteReport(saved.id);
    expect(getSavedReports()).toHaveLength(0);
  });

  it("only removes the targeted report", () => {
    const a = saveReport(mockReport, "first");
    saveReport(mockReport, "second");
    deleteReport(a.id);
    const remaining = getSavedReports();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].feedbackPreview).toBe("second");
  });

  it("is a no-op when given an unknown id", () => {
    saveReport(mockReport, "feedback");
    deleteReport("nonexistent-id");
    expect(getSavedReports()).toHaveLength(1);
  });

  it("does nothing when storage is empty", () => {
    expect(() => deleteReport("any-id")).not.toThrow();
    expect(getSavedReports()).toHaveLength(0);
  });
});
