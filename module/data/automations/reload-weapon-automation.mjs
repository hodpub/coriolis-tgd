import { sendToChat } from "../../helpers/chat.mjs";
import BaseAutomation from "./base-automation.mjs";

const { StringField } = foundry.data.fields;
export default class ReloadWeaponAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "reloadWeapon";
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

    const supplyConsumed = 1;

    const newQuantity = supplyItem.system.quantity - supplyConsumed;

    if (newQuantity < 0) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.consumeSupply.notEnough", { localize: true, format: { required: supplyConsumed, available: supplyItem.system.quantity } });
      return;
    }

    await supplyItem.update({ "system.quantity": newQuantity });
    await item.update({ "system.loaded": true });

    return sendToChat(actor, item.name, game.i18n.format("CORIOLIS_TGD.Automation.FIELDS.reloadWeapon.reloaded", { supplyConsumed, newQuantity }));
  }
}