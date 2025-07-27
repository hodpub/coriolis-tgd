import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import cgdItemBase from './base-item.mjs';

export default class cgdVehicleUpgrade extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.VehicleUpgrade',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.bonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 3,
      validate: (v, o) => v <= o.partial || o.source.maxBonus,
      validationError: game.i18n.localize("CORIOLIS_TGD.Item.Equipment.FIELDS.bonus.error")
    });
    schema.maxBonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 3
    });
    schema.cost = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1
    });
    schema.slot = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0
    });
    schema.tech = new fields.SetField(new fields.StringField({ required: true, choices: CORIOLIS_TGD.Equipment.techChoices }), { initial: [CORIOLIS_TGD.Equipment.techConstants.ordinary] });
    schema.installed = new fields.BooleanField({ initial: false });
    schema.partOfFrame = new fields.BooleanField({ initial: false });

    return schema;
  }

  prepareDerivedData() {
    this.slotInfo = this.partOfFrame ? "-" : this.slot;
  }

  canRunAutomation() {
    return this.maxBonus == 0 || this.bonus > 0 ? undefined :
      new foundry.data.validation.DataModelValidationFailure({ message: "You can't run automation for equipments that are broken." });
  }
}
