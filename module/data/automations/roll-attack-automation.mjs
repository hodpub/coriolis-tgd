import RollAttributeAutomation from "./roll-attribute-automation.mjs";

const { DocumentUUIDField } = foundry.data.fields;
export default class RollAttackAutomation extends RollAttributeAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollAttack";
  }

  static defineSchema() {
    const schema = super.defineSchema();

    schema.postExecution = new DocumentUUIDField({ required: false, nullable: true });

    return schema;
  }

  async viewAutomationMacro() {
    const macro = await fromUuid(this.macro);
    macro.sheet.render(true);
  }

  async execute(event) {
    if (this.system.loaded) {
      const message = await super.execute(event);
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

    ui.notifications.error(game.i18n.localize("CORIOLIS_TGD.Automation.FIELDS.rollAttack.notLoaded"));
    return;
  }
}