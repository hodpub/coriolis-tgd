import { sendToChat } from "../../helpers/chat.mjs";
import BaseAutomation from "./base-automation.mjs";

const { StringField } = foundry.data.fields;
export default class ConsumeSupplyAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "consumeSupply";
  }

  static defineSchema() {
    const schema = super.defineSchema();

    schema.field = new StringField({ required: true, nullable: false, initial: "system.supplyConsumed" });

    return schema;
  }


  async execute() {
    const { system, item, actor } = this.getParents();
    const supplyItem = actor.getSupplyItem();
    if (!supplyItem)
      return;

    const supplyConsumed = system.supplyConsumed ?? 1;

    if (supplyConsumed == 0) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.consumeSupply.noSupplyConsumed", { localize: true });
      return;
    }

    const newQuantity = supplyItem.system.quantity - supplyConsumed;

    if (newQuantity < 0) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.consumeSupply.notEnough", { localize: true, format: { required: supplyConsumed, available: supplyItem.system.quantity } });
      return;
    }

    await supplyItem.update({ "system.quantity": newQuantity });

    return sendToChat(actor, item.name, game.i18n.format("CORIOLIS_TGD.Automation.FIELDS.consumeSupply.itemUsed", { supplyConsumed, newQuantity }));
  }
}