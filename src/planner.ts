// Routing rules from docs/PRD.md, kept free of the Obsidian API so they can be unit tested.

export type Scope = "root" | "vault";

export interface TargetOptions {
  scope: Scope;
  /** Lower-case extensions without the dot, e.g. "png". */
  extensions: string[];
  /** Vault-relative folder paths; surrounding whitespace and slashes are ignored. */
  excludedFolders: string[];
}

export interface Move {
  from: string;
  to: string;
}

export interface Skip {
  path: string;
  target: string;
  reason: "exists";
}

export interface Plan {
  moves: Move[];
  deletes: string[];
  skips: Skip[];
}

export interface PlanInput {
  /** Attachments in scope (output of collectTargets). */
  attachments: string[];
  /** Attachment path -> paths of notes/canvases that link to it. */
  references: Map<string, string[]>;
  /** Every file path currently in the vault, for collision checks. */
  existingPaths: Set<string>;
}

export function folderOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

function join(folder: string, name: string): string {
  return folder === "" ? name : `${folder}/${name}`;
}

function extensionOf(path: string): string {
  const name = basename(path);
  const i = name.lastIndexOf(".");
  return i <= 0 ? "" : name.slice(i + 1).toLowerCase();
}

function normalizeFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

export function collectTargets(paths: string[], options: TargetOptions): string[] {
  const extensions = new Set(options.extensions.map((e) => e.toLowerCase()));
  const excluded = options.excludedFolders.map(normalizeFolder).filter((f) => f !== "");

  return paths.filter((path) => {
    if (!extensions.has(extensionOf(path))) return false;
    if (options.scope === "root" && path.includes("/")) return false;
    return !excluded.some((folder) => path.startsWith(`${folder}/`));
  });
}

export function buildReferenceIndex(
  resolvedLinks: Record<string, Record<string, number>>,
  canvasRefs: Record<string, string[]>,
): Map<string, string[]> {
  const index = new Map<string, Set<string>>();
  const add = (target: string, source: string) => {
    let sources = index.get(target);
    if (!sources) index.set(target, (sources = new Set()));
    sources.add(source);
  };

  for (const [source, targets] of Object.entries(resolvedLinks)) {
    for (const target of Object.keys(targets)) add(target, source);
  }
  for (const [source, targets] of Object.entries(canvasRefs)) {
    for (const target of targets) add(target, source);
  }

  return new Map([...index].map(([target, sources]) => [target, [...sources]]));
}

export function planTidy({ attachments, references, existingPaths }: PlanInput): Plan {
  const plan: Plan = { moves: [], deletes: [], skips: [] };
  const claimed = new Set<string>();

  for (const path of attachments) {
    const sources = references.get(path) ?? [];
    if (sources.length === 0) {
      plan.deletes.push(path);
      continue;
    }

    const folders = sources.map(folderOf);
    const current = folderOf(path);
    if (folders.includes(current)) continue;

    // "First" = first by path order, so repeated runs give the same answer.
    const first = [...sources].sort()[0];
    const target = join(folderOf(first), basename(path));
    if (existingPaths.has(target) || claimed.has(target)) {
      plan.skips.push({ path, target, reason: "exists" });
      continue;
    }

    claimed.add(target);
    plan.moves.push({ from: path, to: target });
  }

  return plan;
}
