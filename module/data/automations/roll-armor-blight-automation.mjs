import RollArmorBaseAutomation from "./roll-armor-base-automation.mjs";

export default class RollArmorBlightAutomation extends RollArmorBaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollArmorBlight";
  }

  async execute(event) {
    const result = await super.execute(event, RollArmorBaseAutomation.RollType.blightProtection);

    if (result) {
      const roll = result.rolls[0];
      const blightLevel = roll.options.blightLevel ?? 0;
      if (blightLevel > 0) {
        const blightDamage = Math.max(0, blightLevel - roll.successCount);
        if (blightDamage > 0) {
          const { actor } = this.getParents();
          const heart = actor.system.derivedAttributes.heart;
          if (heart) {
            await actor.update({
              "system.derivedAttributes.heart.value": Math.max(0, heart.value - blightDamage)
            });
          }
        }
      }
    }

    return result;
  }
}