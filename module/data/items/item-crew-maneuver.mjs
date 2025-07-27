import { CORIOLIS_TGD } from "../../config/config.mjs";
import cgdItemBase from "./base-item.mjs";

export default class cgdCrewManeuver extends cgdItemBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Item.CrewManeuver',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.role = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Crew.roles, initial: CORIOLIS_TGD.Crew.roleConstants.delver });

    return schema;
  }

  get chatTemplate() {
    return "systems/coriolis-tgd/templates/chat/crewManeuver.hbs";
  };
}