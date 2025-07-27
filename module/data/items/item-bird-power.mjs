import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import RollBirdPowerAutomation from "../automations/roll-bird-power-automation.mjs";
import cgdItemBase from "./base-item.mjs";

export default class cgdBirdPower extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Item.BirdPower',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.isAttack = new fields.BooleanField();
    schema.damage = new fields.NumberField({ integer: true });
    schema.critical = new fields.NumberField({ integer: true });
    schema.range = new fields.StringField({ blank: true, choices: CORIOLIS_TGD.Weapon.attackRanges, initial: "" });
    schema.minEnergy = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 1, min: 0 });

    return schema;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (Object.keys(this.automations).length)
      return;

    const automation = new RollBirdPowerAutomation({}, { parent: this });
    this.updateSource({
      automations: {
        [automation._id]: automation
      }
    });
  }
}