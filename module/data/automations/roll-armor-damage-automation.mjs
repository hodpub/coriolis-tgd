import RollArmorBaseAutomation from "./roll-armor-base-automation.mjs";

export default class RollArmorDamageAutomation extends RollArmorBaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollArmorDamage";
  }

  async execute(event) {
    super.execute(event, RollArmorBaseAutomation.RollType.armorRating);
  }
}