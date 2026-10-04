import { describe, expect, it } from "vitest";
import { buildReferenceIndex, collectTargets, planTidy } from "./planner";

describe("collectTargets", () => {
  const files = [
    "a.png",
    "B.JPG",
    "note.md",
    "doc.pdf",
    "Notes/c.png",
    "00_Slides/deck/d.png",
  ];
  const base = { extensions: ["png", "jpg"], excludedFolders: [] };

  it("root scope keeps only files directly under the vault root", () => {
    expect(collectTargets(files, { ...base, scope: "root" })).toEqual(["a.png", "B.JPG"]);
  });

  it("vault scope keeps matching files everywhere", () => {
    expect(collectTargets(files, { ...base, scope: "vault" })).toEqual([
      "a.png",
      "B.JPG",
      "Notes/c.png",
      "00_Slides/deck/d.png",
    ]);
  });

  it("drops files inside excluded folders (and their subfolders)", () => {
    expect(
      collectTargets(files, { ...base, scope: "vault", excludedFolders: ["00_Slides/", " Notes "] }),
    ).toEqual(["a.png", "B.JPG"]);
  });

  it("does not treat a folder name prefix as a match", () => {
    expect(
      collectTargets(["Notes2/x.png"], { ...base, scope: "vault", excludedFolders: ["Notes"] }),
    ).toEqual(["Notes2/x.png"]);
  });
});

describe("buildReferenceIndex", () => {
  it("inverts resolvedLinks and merges canvas references without duplicates", () => {
    const index = buildReferenceIndex(
      { "A/note.md": { "x.png": 2, "y.png": 1 }, "B/note.md": { "x.png": 1 } },
      { "C/board.canvas": ["x.png", "x.png"], "A/note.md": ["y.png"] },
    );
    expect(index.get("x.png")).toEqual(["A/note.md", "B/note.md", "C/board.canvas"]);
    expect(index.get("y.png")).toEqual(["A/note.md"]);
  });
});

describe("planTidy", () => {
  const plan = (
    attachments: string[],
    refs: Record<string, string[]>,
    existing: string[] = attachments,
  ) =>
    planTidy({
      attachments,
      references: new Map(Object.entries(refs)),
      existingPaths: new Set(existing),
    });

  it("moves an attachment next to its only referencing note", () => {
    expect(plan(["a.png"], { "a.png": ["Misc/ACT-X/note.md"] })).toEqual({
      moves: [{ from: "a.png", to: "Misc/ACT-X/a.png" }],
      deletes: [],
      skips: [],
    });
  });

  it("deletes an attachment with no references", () => {
    expect(plan(["a.png"], {})).toEqual({ moves: [], deletes: ["a.png"], skips: [] });
  });

  it("leaves an attachment alone when it already sits beside a referencing note", () => {
    expect(plan(["X/a.png"], { "X/a.png": ["A/n.md", "X/n.md"] })).toEqual({
      moves: [],
      deletes: [],
      skips: [],
    });
  });

  it("treats root notes as living in the root folder", () => {
    expect(plan(["a.png"], { "a.png": ["root-note.md"] }).moves).toEqual([]);
  });

  it("with several referencing notes, moves to the first one by path order", () => {
    expect(plan(["a.png"], { "a.png": ["Zeta/n.md", "Alpha/n.md"] }).moves).toEqual([
      { from: "a.png", to: "Alpha/a.png" },
    ]);
  });

  it("skips when the destination already exists", () => {
    expect(plan(["a.png"], { "a.png": ["X/n.md"] }, ["a.png", "X/a.png"])).toEqual({
      moves: [],
      deletes: [],
      skips: [{ path: "a.png", target: "X/a.png", reason: "exists" }],
    });
  });

  it("skips the second of two attachments planned for the same destination", () => {
    const result = plan(["a.png", "Old/a.png"], { "a.png": ["X/n.md"], "Old/a.png": ["X/m.md"] });
    expect(result.moves).toEqual([{ from: "a.png", to: "X/a.png" }]);
    expect(result.skips).toEqual([{ path: "Old/a.png", target: "X/a.png", reason: "exists" }]);
  });
});
