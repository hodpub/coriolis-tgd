
import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import { createFeatureTagsAndCheckBulky } from "../../helpers/feature.mjs";
import EmbeddedFeature from "../embedded/embedded-feature.mjs";
import cgdEquipment from "./item-equipment.mjs";


export default class cgdArmor extends cgdEquipment {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Armor',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = super.defineSchema();

    schema.armorRating = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 10
    });
    schema.blightProtection = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 0,
      max: 10
    });
    schema.cost = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1,
    });

    schema.extras = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
    });
    schema.tech = new fields.SetField(new fields.StringField({ required: true, choices: CORIOLIS_TGD.Equipment.techChoices }), { initial: [CORIOLIS_TGD.Equipment.techConstants.ordinary] });
    schema.deleteWhenZero = new fields.BooleanField({ initial: true });
    schema.features = new fields.TypedObjectField(new fields.TypedSchemaField(EmbeddedFeature.TYPES));
    schema.equipped = new fields.BooleanField({ initial: true});
    return schema;
  }

  prepareDerivedData() {
    const t = this.tech.map(tech => game.i18n.localize(`CORIOLIS_TGD.Item.Equipment.FIELDS.tech.${tech}.label`));
    this.techDescription = Array.from(t).join(", ");
    [this.featureTags, this.bulky] = createFeatureTagsAndCheckBulky(this.features);
  }
}
