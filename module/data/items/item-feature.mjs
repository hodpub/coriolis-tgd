import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import cgdItemBase from './base-item.mjs';

export default class cgdFeature extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Feature',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.type = new fields.StringField({ initial: CORIOLIS_TGD.Equipment.featureConstants.weapon, required: true, choices: CORIOLIS_TGD.Equipment.featureChoices });
    schema.modifier = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 });

    return schema;
  }
}