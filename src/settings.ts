import { App, PluginSettingTab, Setting } from "obsidian";
import type AttachmentTidyPlugin from "./main";
import type { Scope } from "./planner";

export interface AttachmentTidySettings {
  /** Comma-separated, e.g. "png, jpg". */
  extensions: string;
  confirmBeforeDelete: boolean;
  /** true = OS trash, false = the vault's .trash folder. */
  useSystemTrash: boolean;
  ribbonScope: Scope;
  /** One folder per line. */
  excludedFolders: string;
}

export const DEFAULT_SETTINGS: AttachmentTidySettings = {
  extensions: "png, jpg, jpeg, gif, webp, svg",
  confirmBeforeDelete: true,
  useSystemTrash: true,
  ribbonScope: "root",
  excludedFolders: "",
};

export function parseExtensions(value: string): string[] {
  return value
    .split(",")
    .map((e) => e.trim().replace(/^\./, "").toLowerCase())
    .filter((e) => e !== "");
}

export function parseFolders(value: string): string[] {
  return value.split("\n").filter((f) => f.trim() !== "");
}

export class AttachmentTidySettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: AttachmentTidyPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    const { settings } = this.plugin;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Attachment extensions")
      .setDesc("Comma-separated. Only files with these extensions are tidied.")
      .addText((text) =>
        text.setValue(settings.extensions).onChange(async (value) => {
          settings.extensions = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Confirm before deleting")
      .setDesc("Show the list of unused attachments before they are trashed.")
      .addToggle((toggle) =>
        toggle.setValue(settings.confirmBeforeDelete).onChange(async (value) => {
          settings.confirmBeforeDelete = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Delete to")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("system", "System trash")
          .addOption("local", "Vault .trash folder")
          .setValue(settings.useSystemTrash ? "system" : "local")
          .onChange(async (value) => {
            settings.useSystemTrash = value === "system";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Ribbon icon scope")
      .setDesc("What the ribbon icon tidies.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("root", "Vault root only")
          .addOption("vault", "Whole vault")
          .setValue(settings.ribbonScope)
          .onChange(async (value) => {
            settings.ribbonScope = value as Scope;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Excluded folders")
      .setDesc(
        "One folder per line. Attachments inside these folders are never moved or deleted. " +
          "Use this for folders whose files are referenced from outside notes and canvases (HTML, slide sources, ...).",
      )
      .addTextArea((text) =>
        text.setValue(settings.excludedFolders).onChange(async (value) => {
          settings.excludedFolders = value;
          await this.plugin.saveSettings();
        }),
      );
  }
}
