import { sendToChat } from "../../helpers/chat.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class ConsumeItemAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "consume";
  }

  async execute() {
    const { system, item, actor } = this.getParents();

    if (!system.hasOwnProperty("quantity")) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.consume.noQuantity", { localize: true });
      return;
    }

    if (!system.consumable) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.consume.notConsumable", { localize: true });
      return;
    }

    const newQuantity = system.quantity - 1;

    if (newQuantity < 0) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.consume.notEnough", { localize: true });
      return;
    }

    if (newQuantity || !system.deleteWhenZero)
      await item.update({ "system.quantity": newQuantity });
    else
      await item.delete();

    return sendToChat(actor, item.name, game.i18n.format("CORIOLIS_TGD.Automation.FIELDS.consume.itemUsed", { newQuantity }));
  }
}