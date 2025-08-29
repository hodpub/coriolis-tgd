import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import { createFeatureTagsAndCheckBulky } from "../../helpers/feature.mjs";
import EmbeddedFeature from "../embedded/embedded-feature.mjs";
import cgdEquipment from "./item-equipment.mjs";

export default class cgdWeapon extends cgdEquipment {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Equipment',
    'CORIOLIS_TGD.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    delete schema.consumable;
    delete schema.supplyConsumed;

    schema.attackType = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Weapon.attackTypes, initial: CORIOLIS_TGD.Weapon.attackTypeConstants.close });
    schema.grip = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Weapon.grips, initial: CORIOLIS_TGD.Weapon.gripConstants.oneHand });

    schema.damage = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 10
    });
    schema.critical = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 10
    });
    schema.blight = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });
    schema.atHand = new fields.BooleanField();

    schema.minRange = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Weapon.attackRanges, initial: CORIOLIS_TGD.Weapon.attackRangeConstants.engaged });
    schema.maxRange = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Weapon.attackRanges, initial: CORIOLIS_TGD.Weapon.attackRangeConstants.engaged });

    schema.features = new fields.TypedObjectField(new fields.TypedSchemaField(EmbeddedFeature.TYPES));

    schema.loaded = new fields.BooleanField({ initial: true });

    return schema;
  }


  prepareDerivedData() {
    super.prepareDerivedData();
    [this.featureTags,] = createFeatureTagsAndCheckBulky(this.features);
  }

  canRunAutomation() {
    const superResult = super.canRunAutomation();
    if (superResult)
      return superResult;

    return this.parent.actor.type != "explorer" || this.atHand ? undefined :
      new foundry.data.validation.DataModelValidationFailure({ message: "You can't run automation for weapons that are not at hand" });
  }
}