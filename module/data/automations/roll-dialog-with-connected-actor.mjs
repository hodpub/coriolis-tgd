import cgdRollDialog from "../../applications/dialog/roller.mjs";

export default class RollDialogWithConnectedActorAutomation {
  constructor(data) {
    this._id = foundry.utils.randomID();
    this.name = data.name;
    this.attribute = data.attribute;
    this.connectedActor = data.connectedActor;
    this.item = data.item;
    this.canChangeAttribute = data.canChangeAttribute;
    this.requireAttribute = data.requireAttribute;
    this.hideAttribute = data.hideAttribute;
    this.maxPush = data.maxPush;
    this.postExecution = data.postExecution;
    this.postPush = data.postPush;
    this.formatLabel = data.formatLabel;
  }

  async execute(event) {
    console.log(this);
    const explorer = game.user.character ?? game.canvas.tokens.controlled[0]?.actor;
    if (explorer == undefined || explorer.type != "explorer") {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.upgrade.noExplorer", { localize: true });
      return;
    }
    const roller = new cgdRollDialog({ actor: explorer, connectedActor: this.connectedActor, attribute: this.attribute, item: this.item, canChangeAttribute: this.canChangeAttribute, requireAttribute: this.requireAttribute, hideAttribute: this.hideAttribute, maxPush: this.maxPush, formatLabel: this.formatLabel });
    const message = await roller.wait(event);
    if (this.postExecution) {
      this.postExecution(message);
    }
    return message;
  }
}