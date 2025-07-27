import BaseAutomation from "./base-automation.mjs";

const { ArrayField, StringField } = foundry.data.fields;
export default class RunSequenceAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "runSequence";
  }

  static defineSchema() {
    const schema = super.defineSchema();

    schema.sequence = new ArrayField(new StringField());

    return schema;
  }

  async addSequence(event, target) {
    const select = target.parentElement.parentElement.parentElement.previousElementSibling;
    this.sequence.push(select.value);
    await this.parent.parent.update({ [`system.automations.${this._id}.sequence`]: this.sequence });
    console.log(this);
  }

  async deleteSequence(event, target) {
    this.sequence.splice(parseInt(target.dataset.index), 1);
    await this.parent.parent.update({ [`system.automations.${this._id}.sequence`]: this.sequence });
    console.log(this);
  }

  async execute(event) {
    const { system } = this.getParents();
    console.log("STARTING SEQUENCE", this);
    for (const sequenceId of this.sequence) {
      const sequence = system.automations[sequenceId];
      console.log("EXECUTING SEQUENCE", sequence);
      await sequence.execute(event);
      console.log("EXECUTED SEQUENCE", sequence);
    }
    console.log("ENDING SEQUENCE", this);
  }
}