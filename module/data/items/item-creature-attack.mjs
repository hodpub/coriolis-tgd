import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import RollCreatureAttackAutomation from "../automations/roll-creature-attack.mjs";
import cgdItemBase from "./base-item.mjs";

export default class cgdCreatureAttack extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.CreatureAttack',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.baseDice = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });
    schema.damage = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });
    schema.damageCritical = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });
    schema.despair = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });
    schema.blight = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 0,
      min: 0,
      max: 10
    });
    schema.attackNumber = new fields.NumberField({
      ...DataHelper.requiredInteger,
      initial: 1,
      min: 1,
      max: 6
    });
    schema.range = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Weapon.attackRanges, initial: CORIOLIS_TGD.Weapon.attackRangeConstants.engaged });

    schema.description = new fields.HTMLField();

    return schema;
  }


  prepareDerivedData() {
    super.prepareDerivedData();

    const info = [];
    info.push(game.i18n.localize(`CORIOLIS_TGD.Item.Weapon.FIELDS.range.${this.range}.label`));
    if (this.baseDice)
      info.push(game.i18n.format("CORIOLIS_TGD.Item.CreatureAttack.FIELDS.baseDice.info", { value: this.baseDice }));
    if (this.damage)
      info.push(game.i18n.format("CORIOLIS_TGD.Item.CreatureAttack.FIELDS.damage.info", { value: this.damage }));
    if (this.damageCritical)
      info.push(game.i18n.format("CORIOLIS_TGD.Item.CreatureAttack.FIELDS.damageCritical.info", { value: this.damageCritical }));
    if (this.despair)
      info.push(game.i18n.format("CORIOLIS_TGD.Item.CreatureAttack.FIELDS.despair.info", { value: this.despair }));
    if (this.blight)
      info.push(game.i18n.format("CORIOLIS_TGD.Item.CreatureAttack.FIELDS.blight.info", { value: this.blight }));
    this.info = `(${info.join(", ")})`;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (Object.keys(this.automations).length)
      return;

    const automation = new RollCreatureAttackAutomation({}, { parent: this });
    this.updateSource({
      automations: {
        [automation._id]: automation
      }
    });
  }

  get chatTemplate() {
    return "systems/coriolis-tgd/templates/chat/creatureAttack.hbs";
  };
}