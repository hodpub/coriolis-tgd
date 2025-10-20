import cgdRollDialog from "../../applications/dialog/roller.mjs";

export default class RollDialogAutomation {
  constructor(data) {
    this._id = foundry.utils.randomID();
    this.actor = data.actor;
    this.name = data.name;
    this.attribute = data.attribute;
    this.item = data.item;
    this.canChangeAttribute = data.canChangeAttribute;
    this.requireAttribute = data.requireAttribute;
    this.hideAttribute = data.hideAttribute;
    this.maxPush = data.maxPush;
    this.postExecution = data.postExecution;
  }

  async execute(event) {
    console.log(this);
    const roller = new cgdRollDialog({ actor: this.actor, attribute: this.attribute, item: this.item, canChangeAttribute: this.canChangeAttribute, requireAttribute: this.requireAttribute, hideAttribute: this.hideAttribute, maxPush: this.maxPush, formatLabel: this.formatLabel });
    const message = await roller.wait(event);
    // When the automation dialogue box is closed, the message can be nonexistent.
    if (this.postExecution && message != null) {
      this.postExecution(message);
    }
    return message;
  }
}