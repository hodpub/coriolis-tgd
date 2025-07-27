import BaseAutomation from "./base-automation.mjs";

const { DocumentUUIDField } = foundry.data.fields;
export default class RunMacroAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "runMacro";
  }

  static defineSchema() {
    const schema = super.defineSchema();

    schema.macro = new DocumentUUIDField({ required: false, nullable: true });

    return schema;
  }

  async viewAutomationMacro() {
    const macro = await fromUuid(this.macro);
    macro.sheet.render(true);
  }

  async execute(event) {
    const { actor } = this.getParents();
    const macro = await fromUuid(this.macro);
    if (!macro) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.macro.notFound");
      return;
    }
    const speaker = ChatMessage.getSpeaker({ actor });
    await macro.execute({ speaker, actor, event, automation: this });
  }
}