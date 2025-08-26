import { DataHelper } from "../../helpers/data.mjs";
import cgdItemBase from './base-item.mjs';

export default class cgdSolo extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Solo',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.delveClass = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1,
      max: 4
    });
    schema.depthClass = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1,
      max: 4
    });
    schema.deepScanBonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.blightScanBonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 5,
    });
    schema.distanceToExitBonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.forayDistanceBonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
    });

    return schema;
  }
}