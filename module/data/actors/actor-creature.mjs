import { CORIOLIS_TGD } from '../../config/config.mjs';
import { DataHelper } from "../../helpers/data.mjs";
import cgdActorBase from "./base-actor.mjs";

export default class cgdCreature extends cgdActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Creature',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Iterate over ability names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(
      CORIOLIS_TGD.Attributes.list.reduce((obj, attribute) => {
        obj[attribute] = new fields.NumberField({
          ...DataHelper.requiredInteger,
          initial: 0,
          min: 0,
          max: 10
        });
        return obj;
      }, {})
    );

    schema.derivedAttributes = new fields.SchemaField({
      health: new fields.SchemaField({
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
      })
    });

    schema.ferocity = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 1, min: 1, max: 10 });

    schema.biography = new fields.HTMLField();
    schema.containmentProtocol = new fields.HTMLField();
    schema.containmentProtocolBonus = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0, max: 10 });

    schema.lastAttack = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0, max: 10 });
    schema.armor = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0, max: 10 });
    schema.size = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Creature.sizeChoices, initial: CORIOLIS_TGD.Creature.sizeConstants.normal });
    schema.behaviourPattern = new fields.ArrayField(new fields.StringField(), { initial: ["", "", "", "", "", "",] });

    return schema;
  }

  prepareDerivedData() {
    let current = {
      min: 1,
      max: 1,
      text: this.behaviourPattern[0]
    };
    const behaviourList = [];
    for (let index = 1; index < this.behaviourPattern.length; index++) {
      const element = this.behaviourPattern[index];
      if (element == current.text) {
        current.max = index + 1;
        continue;
      }

      behaviourList.push(current);
      current = {
        min: index + 1,
        max: index + 1,
        text: element
      };
    }
    behaviourList.push(current);
    this.behaviourList = behaviourList;
    this.maxPush = {};
    for (const element of CORIOLIS_TGD.Attributes.list) {
      this.maxPush[element] = 0;
    }
  }
}
