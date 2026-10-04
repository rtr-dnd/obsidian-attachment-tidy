import { Notice, Plugin, TFile } from "obsidian";
import { confirmPlan } from "./confirm-modal";
import { buildReferenceIndex, collectTargets, planTidy, type Plan, type Scope } from "./planner";
import {
  AttachmentTidySettingTab,
  DEFAULT_SETTINGS,
  parseExtensions,
  parseFolders,
  type AttachmentTidySettings,
} from "./settings";

export default class AttachmentTidyPlugin extends Plugin {
  settings: AttachmentTidySettings = DEFAULT_SETTINGS;
  private running = false;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addRibbonIcon("folder-sync", "Tidy attachments", () => this.tidy(this.settings.ribbonScope));
    this.addCommand({
      id: "tidy-root-attachments",
      name: "Tidy root attachments",
      callback: () => this.tidy("root"),
    });
    this.addCommand({
      id: "tidy-all-attachments",
      name: "Tidy all attachments",
      callback: () => this.tidy("vault"),
    });
    this.addSettingTab(new AttachmentTidySettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async tidy(scope: Scope): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const plan = await this.buildPlan(scope);
      const total = plan.moves.length + plan.deletes.length + plan.skips.length;
      if (total === 0) {
        new Notice("Attachment Tidy: nothing to tidy.");
        return;
      }
      if (plan.deletes.length > 0 && this.settings.confirmBeforeDelete) {
        if (!(await confirmPlan(this.app, plan))) return;
      }
      await this.execute(plan);
    } finally {
      this.running = false;
    }
  }

  private async buildPlan(scope: Scope): Promise<Plan> {
    const files = this.app.vault.getFiles();
    const attachments = collectTargets(
      files.map((f) => f.path),
      {
        scope,
        extensions: parseExtensions(this.settings.extensions),
        excludedFolders: parseFolders(this.settings.excludedFolders),
      },
    );
    const references = buildReferenceIndex(
      this.app.metadataCache.resolvedLinks,
      await this.readCanvasRefs(files),
    );
    const existingPaths = new Set(this.app.vault.getAllLoadedFiles().map((f) => f.path));
    return planTidy({ attachments, references, existingPaths });
  }

  /** resolvedLinks does not cover canvases, so read their file nodes directly. */
  private async readCanvasRefs(files: TFile[]): Promise<Record<string, string[]>> {
    const refs: Record<string, string[]> = {};
    for (const file of files) {
      if (file.extension !== "canvas") continue;
      try {
        const data = JSON.parse(await this.app.vault.cachedRead(file));
        refs[file.path] = (data.nodes ?? [])
          .filter((node: { type?: string; file?: unknown }) => node.type === "file" && typeof node.file === "string")
          .map((node: { file: string }) => node.file);
      } catch (error) {
        console.warn(`Attachment Tidy: could not parse ${file.path}`, error);
      }
    }
    return refs;
  }

  private async execute(plan: Plan): Promise<void> {
    const failures: string[] = [];
    let moved = 0;
    let deleted = 0;

    for (const { from, to } of plan.moves) {
      const file = this.app.vault.getFileByPath(from);
      if (!file) continue;
      try {
        await this.app.fileManager.renameFile(file, to);
        moved++;
      } catch (error) {
        console.error(`Attachment Tidy: failed to move ${from}`, error);
        failures.push(from);
      }
    }

    for (const path of plan.deletes) {
      const file = this.app.vault.getFileByPath(path);
      if (!file) continue;
      try {
        await this.app.vault.trash(file, this.settings.useSystemTrash);
        deleted++;
      } catch (error) {
        console.error(`Attachment Tidy: failed to trash ${path}`, error);
        failures.push(path);
      }
    }

    const lines = [`Attachment Tidy: moved ${moved} / trashed ${deleted} / skipped ${plan.skips.length}`];
    for (const skip of plan.skips) lines.push(`Skipped ${skip.path}: ${skip.target} already exists`);
    if (failures.length > 0) lines.push(`Failed: ${failures.join(", ")} (see console)`);
    new Notice(lines.join("\n"), plan.skips.length + failures.length > 0 ? 0 : 5000);
  }
}
