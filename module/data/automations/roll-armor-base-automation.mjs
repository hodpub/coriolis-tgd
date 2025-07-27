import cgdRollDialog from "../../applications/dialog/roller.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class RollArmorBaseAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "";
  }

  static RollType = {
    armorRating: "armorRating",
    blightProtection: "blightProtection"
  }

  async execute(event, rollType) {
    const { system, item, actor } = this.getParents();
    if (item.type != "armor") {
      ui.notifications.error(game.i18n.localize("CORIOLIS_TGD.Automation.FIELDS.armorRoll.notArmor"));
      return;
    }

    const value = system[rollType];

    if (value == 0) {
      ui.notifications.error(game.i18n.localize(`CORIOLIS_TGD.Automation.FIELDS.armorRoll.${rollType}Zero`));
      return;
    }

    const helmetBonus = actor.system.helmetBonus?.[rollType] ?? 0;

    const armor = foundry.utils.deepClone(item);
    armor.system.bonus = value + helmetBonus;
    armor.system.rollType = rollType;
    const roller = new cgdRollDialog({ actor, item: armor, hideAttribute: true, maxPush: 0 });
    const result = await roller.wait(event);
    return result;
  }
}