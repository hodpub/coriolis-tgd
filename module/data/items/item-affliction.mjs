
import { CORIOLIS_TGD } from "../../config/config.mjs";
import cgdItemBase from './base-item.mjs';

export default class cgdAffliction extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
    'CORIOLIS_TGD.Item.Affliction',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.afflictionType = new fields.StringField({ required: true, initial: CORIOLIS_TGD.Affliction.types[0], choices: CORIOLIS_TGD.Affliction.types });
    schema.lethal = new fields.BooleanField();
    schema.permanent = new fields.BooleanField();
    schema.healTime = new fields.StringField();

    return schema;
  }

  prepareDerivedData() {
    this.healTimeInfo = this.permanent ? game.i18n.localize(`CORIOLIS_TGD.Item.Affliction.FIELDS.permanent.label`) : this.healTime;
    this.afflictionTypeInfo = game.i18n.localize(`CORIOLIS_TGD.Item.Affliction.FIELDS.afflictionType.${this.afflictionType}`);
  }

  static validateJoint(data) {
    if (data.currentLevel > data.maxLevel)
      throw new Error(game.i18n.localize("CORIOLIS_TGD.Item.Talent.FIELDS.currentLevel.error"));

    return super.validateJoint(data);
  }

  get chatTemplate() {
    return "systems/coriolis-tgd/templates/chat/affliction.hbs";
  };
}
