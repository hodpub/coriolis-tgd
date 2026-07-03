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
          max: 10
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
    super.prepareDerivedData();
  }

  async _prepareItems(context) {
    // Initialize containers.
    const talents = [];
    const equipments = [];

    // Iterate through items, allocating to containers
    for (let i of this.parent.items) {
      i.enrichedDescription = await TextEditor.enrichHTML(
        i.system.description,
        {
          // Whether to show secret blocks in the finished html
          secrets: i.isOwner,
          // Data to fill in for inline rolls
          rollData: i.getRollData(),
          // Relative UUID resolution
          relativeTo: i,
        }
      );
      if (i.type === 'talent') {
        talents.push(i);
        continue;
      }
      if (i.type === 'weapon') {
        i.system.info = ` (+${i.system.bonus})`;
        equipments.push(i);
      }
      if (i.type === "armor") {
        i.system.info = ` (armor ${i.system.armorRating})`;
        equipments.push(i);
      }
      if (i.type === 'equipment') {
        equipments.push(i);
      }
    }

    context.talents = talents.sort((a, b) => a.name.localeCompare(b.name));
    context.equipments = equipments.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  EMBED_TEMPLATE = "systems/coriolis-tgd/templates/embeds/actor.hbs";

  async toEmbed(config, options = {}) {
    config.cite = false;
    config.caption = false;
    config.showHeart = config.values.indexOf("showHeart") > -1;
    config.hideImg = config.values.indexOf("hideImg") > -1;
    console.log(config, options)
    const context = {
      actor: this.parent,
      img: config.img || this.parent.img,
      options,
      config
    }

    await this._prepareItems(context);
    const content = await foundry.applications.handlebars.renderTemplate(this.EMBED_TEMPLATE, context);
    const result = document.createElement("div");
    result.innerHTML = content;
    return result.firstChild;
  }

}
