import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import RollAttributeAutomation from "../automations/roll-attribute-automation.mjs";
import cgdItemBase from './base-item.mjs';

export default class cgdEquipment extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Equipment',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.bonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 5,
      validate: (v, o) => v <= o.partial || o.source.maxBonus,
      validationError: game.i18n.localize("CORIOLIS_TGD.Item.Equipment.FIELDS.bonus.error")
    });
    schema.maxBonus = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 5
    });
    schema.quantity = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
    });
    schema.weight = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 1,
      min: 0,
    });
    schema.cost = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
    });
    schema.consumable = new fields.BooleanField();
    schema.supplyConsumed = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.deleteWhenZero = new fields.BooleanField({ initial: true });
    schema.tech = new fields.SetField(new fields.StringField({ required: true, choices: CORIOLIS_TGD.Equipment.techChoices }), { initial: [CORIOLIS_TGD.Equipment.techConstants.ordinary] });
    return schema;
  }


  prepareDerivedData() {
    const t = this.tech.map(tech => game.i18n.localize(`CORIOLIS_TGD.Item.Equipment.FIELDS.tech.${tech}.label`));
    this.techDescription = Array.from(t).join(", ");
    this.state = "";
    if (this.maxBonus == 0 || this.bonus == this.maxBonus)
      return;

    if (this.bonus == 0)
      this.state = "<i class='fas fa-circle-xmark' style='font-size: 24px' data-tooltip='" + game.i18n.localize("CORIOLIS_TGD.Item.Equipment.FIELDS.bonus.broken") + "'></i>";
    else
      this.state = "<i class='fas fa-triangle-exclamation' style='font-size: 24px' data-tooltip='" + game.i18n.localize("CORIOLIS_TGD.Item.Equipment.FIELDS.bonus.damaged") + "'></i>";
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (Object.keys(this.automations).length || this.parent.isEmbedded)
      return;

    const automation = new RollAttributeAutomation({}, { parent: this });
    this.updateSource({
      automations: {
        [automation._id]: automation
      }
    });
  }

  canRunAutomation() {
    return this.maxBonus == 0 || this.bonus > 0 ? undefined :
      new foundry.data.validation.DataModelValidationFailure({ message: "You can't run automation for equipments that are broken." });
  }
}