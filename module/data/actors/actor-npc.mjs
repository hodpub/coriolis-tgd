import { CORIOLIS_TGD } from '../../config/config.mjs';
import { DataHelper } from "../../helpers/data.mjs";
import cgdActorBase from "./base-actor.mjs";

export default class cgdNPC extends cgdActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.NPC',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Iterate over ability names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(
      CORIOLIS_TGD.Attributes.list.reduce((obj, attribute) => {
        obj[attribute] = new fields.NumberField({
          ...DataHelper.requiredInteger,
          initial: 2,
          min: 2,
          max: 6
        });
        return obj;
      }, {})
    );

    schema.derivedAttributes = new fields.SchemaField(
      Object.keys(CORIOLIS_TGD.Explorer.derivedAttributes).reduce((obj, attribute) => {
        obj[attribute] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 1,
            min: 0
          }),
          max: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 0
          })
        });
        return obj;
      }, {})
    );

    schema.biography = new fields.HTMLField();

    return schema;
  }

  prepareDerivedData() {
    for (const key in this.derivedAttributes) {
      let value = this.derivedAttributes[key].max.bonus ?? 0;
      for (const att of CORIOLIS_TGD.Explorer.derivedAttributes[key]) {
        value += typeof att == "string" ? this.attributes[att] : att;
      }
      this.derivedAttributes[key].max = value;
    }
  }
}
