import cgdActorBase from './base-actor.mjs';
import { CORIOLIS_TGD as CONFIG } from '../../config/config.mjs';
import { DataHelper } from "../../helpers/data.mjs"
import ConsumeSupplyAutomation from "../automations/consume-supply-automation.mjs";

export default class cgdExplorer extends cgdActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Explorer',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Iterate over ability names and create a new SchemaField for each.
    schema.attributes = new fields.SchemaField(
      CONFIG.Attributes.list.reduce((obj, attribute) => {
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
      Object.keys(CONFIG.Explorer.derivedAttributes).reduce((obj, attribute) => {
        obj[attribute] = new fields.SchemaField({
          value: new fields.NumberField({
            ...DataHelper.requiredInteger,
            initial: 0,
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

    schema.experience = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.rukh = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });

    schema.keepsake = new fields.SchemaField({
      item: new fields.StringField(),
      used: new fields.BooleanField()
    });

    schema.biography = new fields.SchemaField({
      profession: new fields.StringField({ required: false, nullable: true }),
      speciality: new fields.StringField({ required: false, nullable: true }),
      quirk: new fields.StringField({ required: false, nullable: true }),
      appearance: new fields.StringField({ required: false, nullable: true }),
      motivation: new fields.StringField({ required: false, nullable: true }),
      origin: new fields.StringField({ required: false, nullable: true }),
      faction: new fields.StringField({ required: false, nullable: true }),
      contacts: new fields.HTMLField(),
      others: new fields.HTMLField(),
    });

    return schema;
  }

  prepareDerivedData() {
    this.prepareAutomations();
    for (const key in this.derivedAttributes) {
      let value = this.derivedAttributes[key].max.bonus ?? 0;
      for (const att of CONFIG.Explorer.derivedAttributes[key]) {
        value += typeof att == "string" ? this.attributes[att] : att;
      }
      this.derivedAttributes[key].max = value;
      this.atHandMax = 3;
    }

    const items = this.parent.items;
    let encumbrance = 0;
    let supplyCount = 0;
    for (const item of items) {
      if (item.system.hasOwnProperty("weight"))
        encumbrance += item.system.weight * item.system.quantity;
      if (item.flags["coriolis-tgd"]?.isSupply)
        supplyCount += item.system.quantity;
    }
    this.derivedAttributes.encumbrance.value = encumbrance;
    this.derivedAttributes.encumbrance.percentage = Math.min(100, Math.round(encumbrance / this.derivedAttributes.encumbrance.max * 10) * 10);
    this.supplyCount = supplyCount;
    this.atHandCount = this.parent.items.filter(it => it.type == "weapon" && it.system.atHand).length;
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // data.lvl = this.attributes.level.value;

    return data;
  }

  async _preCreate(data, options, user) {
    const supplyAutomation = new ConsumeSupplyAutomation();
    const supply = {
      name: game.i18n.localize("CORIOLIS_TGD.Item.Equipment.FIELDS.supply.label"),
      img: "systems/coriolis-tgd/assets/icons/supply.svg",
      type: "equipment",
      flags: {
        "coriolis-tgd": {
          isSupply: true
        }
      },
      system: {
        bonus: 0,
        maxBonus: 0,
        consumable: true,
        cost: 100,
        quantity: 0,
        supplyConsumed: 1,
        tech: ["ordinary"],
        weight: 0.25,
        deleteWhenZero: false,
        automations: {
          [supplyAutomation._id]: supplyAutomation
        }
      }
    };
    this.parent.updateSource({ items: [supply] });
  }
}
