import { DataHelper } from "../../helpers/data.mjs";

export default class EmbeddedFeature extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
      name: new fields.StringField({ required: true, blank: false }),
      modifier: new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 }),
      description: new fields.HTMLField({initial: ""}),
      type: new fields.StringField({ initial: "feature", required: true, blank: false })
    };
  }

  static #TYPES;

  /**
     * The subtypes of this pseudo-document.
     * @type {Record<string, typeof PseudoDocument>}
     */
  static get TYPES() {
    return EmbeddedFeature.#TYPES ??= Object.freeze({
      ["feature"]: EmbeddedFeature,
    });
  }
}