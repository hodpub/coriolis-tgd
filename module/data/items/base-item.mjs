import { CORIOLIS_TGD } from "../../config/config.mjs";

export default class cgdItemBase extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = [
    'CORIOLIS_TGD.Item.base',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.HTMLField();

    schema.automations = new fields.TypedObjectField(new fields.TypedSchemaField(coriolistgd.models.automations.BaseAutomation.TYPES));
    return schema;
  }

  get chatTemplate() {
    return "systems/coriolis-tgd/templates/chat/item.hbs";
  };
}
