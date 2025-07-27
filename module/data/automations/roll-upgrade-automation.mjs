import cgdRollDialog from "../../applications/dialog/roller.mjs";
import { CORIOLIS_TGD } from "../../config/config.mjs";
import BaseAutomation from "./base-automation.mjs";

const { StringField, BooleanField, DocumentUUIDField } = foundry.data.fields;
export default class RollUpgradeAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollUpgrade";
  }

  static defineSchema() {
    const schema = super.defineSchema();

    schema.attribute = new StringField({ required: true });
    schema.requireAttribute = new BooleanField({ initial: true });
    schema.canChangeAttribute = new BooleanField({ initial: true });
    schema.postExecution = new DocumentUUIDField({ required: false, nullable: true });

    return schema;
  }

  async execute(event) {
    const { item, actor, system } = this.getParents();
    const explorer = game.user.character ?? game.canvas.tokens.controlled[0]?.actor;
    if (explorer == undefined || explorer.type != "explorer") {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.upgrade.noExplorer", { localize: true });
      return;
    }

    if (item.type == "vehicleWeapon" && !system.loaded) {
      ui.notifications.error(game.i18n.localize("CORIOLIS_TGD.Automation.FIELDS.rollAttack.notLoaded"));
      return;
    }

    const roller = new cgdRollDialog({ actor: explorer, attribute: this.attribute, item, canChangeAttribute: this.canChangeAttribute, requireAttribute: this.requireAttribute });
    const message = await roller.wait(event);

    if (message && this.postExecution) {
      const macro = await fromUuid(this.postExecution);
      if (!macro) {
        ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.macro.notFound");
        return;
      }
      const speaker = ChatMessage.getSpeaker({ actor: this.actor });
      await macro.execute({ speaker, actor: this.actor, event, automation: this, message });
    }

    return message;
  }
}