import cgdRollDialog from "../../applications/dialog/roller.mjs";
import BaseAutomation from "./base-automation.mjs";

const { StringField, BooleanField } = foundry.data.fields;
export default class RollAttributeAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollAttribute";
  }

  static defineSchema() {
    const schema = super.defineSchema();

    schema.attribute = new StringField({ required: false });
    schema.requireAttribute = new BooleanField({ initial: true });
    schema.canChangeAttribute = new BooleanField({ initial: true });

    return schema;
  }

  async execute(event) {
    const { item, actor } = this.getParents();
    const roller = new cgdRollDialog({ actor, attribute: this.attribute, item, canChangeAttribute: this.canChangeAttribute, requireAttribute: this.requireAttribute });
    const result = await roller.wait(event);
    return result;
  }
}