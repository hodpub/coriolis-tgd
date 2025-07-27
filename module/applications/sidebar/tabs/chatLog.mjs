import { accept, applyTargetDamage, pushRoll } from "../../../helpers/rolls.mjs";

export class cgdChatLog extends foundry.applications.sidebar.tabs.ChatLog {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      actions: {
        pushRoll: this.#pushRoll,
        acceptRoll: this.#acceptRoll,
        applyTargetDamage: this.#applyTargetDamage,
      }
    }
  );

  static async #pushRoll(event) {
    await pushRoll(event);
  }
  static async #acceptRoll(event) {
    await accept(event);
  }
  static async #applyTargetDamage(event){
    await applyTargetDamage(event);
  }
}