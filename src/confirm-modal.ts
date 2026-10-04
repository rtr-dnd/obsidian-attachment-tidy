import { App, Modal, Setting } from "obsidian";
import type { Plan } from "./planner";

/** Resolves true when the user confirms, false on cancel or close. */
export function confirmPlan(app: App, plan: Plan): Promise<boolean> {
  return new Promise((resolve) => new ConfirmModal(app, plan, resolve).open());
}

class ConfirmModal extends Modal {
  private confirmed = false;

  constructor(
    app: App,
    private plan: Plan,
    private resolve: (confirmed: boolean) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl, plan } = this;
    this.setTitle(`Trash ${plan.deletes.length} unused attachment(s)?`);

    if (plan.moves.length > 0) {
      contentEl.createEl("p", {
        text: `${plan.moves.length} attachment(s) will also be moved next to their notes.`,
      });
    }

    const list = contentEl.createEl("ul", { cls: "attachment-tidy-list" });
    for (const path of plan.deletes) list.createEl("li", { text: path });

    new Setting(contentEl)
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) =>
        button
          .setButtonText("Tidy")
          .setWarning()
          .onClick(() => {
            this.confirmed = true;
            this.close();
          }),
      );
  }

  onClose(): void {
    this.contentEl.empty();
    this.resolve(this.confirmed);
  }
}
