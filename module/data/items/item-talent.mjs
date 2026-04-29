
import { DataHelper } from "../../helpers/data.mjs";
import cgdItemBase from './base-item.mjs';

export default class cgdTalent extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Talent',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.maxLevel = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1,
      max: 3
    });
    schema.bonusPerLevel = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 5
    });

    schema.currentLevel = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1,
      max: 3,
    });

    return schema;
  }

  static validateJoint(data) {
    if (data.currentLevel > data.maxLevel)
      ui.notifications.error("CORIOLIS_TGD.Item.Talent.FIELDS.currentLevel.error");
      //TODO: check with Foundry why this is not working
      // throw Error(game.i18n.localize("CORIOLIS_TGD.Item.Talent.FIELDS.currentLevel.error"));
  }

  prepareDerivedData() {
    this.bonus = this.currentLevel * this.bonusPerLevel;
  }
}
