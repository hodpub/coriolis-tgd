import { showAutomationsDialog } from "../helpers/automation.mjs";
import { sendToChat } from "../helpers/chat.mjs";

const { renderTemplate } = foundry.applications.handlebars;

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class cgdItem extends foundry.documents.Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  async sendToChat(event) {
    const label = this.name;
    const template = this.system.chatTemplate;
    const content = await renderTemplate(template, this);
    return sendToChat(this.actor, label, content, event);
  }

  async automate(event, specificAutomationId) {
    const item = this;
    if (typeof item.system.canRunAutomation === "function") {
      const canRunAutomation = item.system.canRunAutomation();
      if (canRunAutomation instanceof foundry.data.validation.DataModelValidationFailure) {
        ui.notifications.error(canRunAutomation.message);
        return;
      }
    }

    if (specificAutomationId){
      const specificAutomation = item.system.automations[specificAutomationId];
      return await specificAutomation.execute(event);
    }

    const keys = Object.keys(item.system.automations);
    const possibleAutomations = [];
    for (const automationId of keys) {
      const automation = item.system.automations[automationId];
      if (automation.showAsSelection)
        possibleAutomations.push(item.system.automations[automationId]);
    }

    if (possibleAutomations.length == 0)
      return this.sendToChat(event);

    if (possibleAutomations.length == 1)
      return possibleAutomations[0].execute(event);

    const automationToRun = await showAutomationsDialog(possibleAutomations, item.name);
    await automationToRun.execute(event);
  }
}
