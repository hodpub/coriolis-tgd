import cgdRollDialog from "../../applications/dialog/roller.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class RollCreatureAttackAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollCreatureAttack";
  }

  async execute(event) {
    const { system, item, actor } = this.getParents();

    if (!system.baseDice) {
      return item.sendToChat(event);
    }
    const rollOptions = {
      damage: system.damage,
      critical: system.damageCritical,
      despair: system.despair,
      blight: system.blight,
      description: system.description
    }

    const dialog = new cgdRollDialog({ actor, item, rollOptions, maxPush: 0 });
    return dialog.wait(event);
  }
}