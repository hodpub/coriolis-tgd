import { DataHelper } from "../../helpers/data.mjs";
import cgdActorBase from "./base-actor.mjs";

export default class cgdBird extends cgdActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Bird',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...DataHelper.requiredInteger,
        initial: 0,
        min: 0
      }),
      max: new fields.NumberField({
        ...DataHelper.requiredInteger,
        initial: 0,
        min: 0
      })
    });

    schema.energy = new fields.SchemaField({
      value: new fields.NumberField({
        ...DataHelper.requiredInteger,
        initial: 0,
        min: 0
      }),
      max: new fields.NumberField({
        ...DataHelper.requiredInteger,
        initial: 0,
        min: 0
      })
    });

    // TODO: add choices
    schema.type = new fields.StringField({});

    schema.appearance = new fields.StringField();

    return schema;
  }
}