import RollArmorBaseAutomation from "./roll-armor-base-automation.mjs";

export default class RollArmorBlightAutomation extends RollArmorBaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollArmorBlight";
  }

  async execute(event) {
    super.execute(event, RollArmorBaseAutomation.RollType.blightProtection);
  }
}