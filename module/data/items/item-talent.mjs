
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
      validate: (v, o) => v <= o.partial || o.source.maxLevel,
      validationError: game.i18n.localize("CORIOLIS_TGD.Item.Talent.FIELDS.currentLevel.error")
    });

    // schema.tags = new fields.SetField(fields.StringField)

    return schema;
  }

  prepareDerivedData() {
    this.bonus = this.currentLevel * this.bonusPerLevel;
  }
}
