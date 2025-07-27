import cgdRollDialog from "../../applications/dialog/roller.mjs";
import { CORIOLIS_TGD } from "../../config/config.mjs";
import BaseAutomation from "./base-automation.mjs";

const { api } = foundry.applications;

export default class RollBirdPowerAutomation extends BaseAutomation {
  /** @inheritdoc */
  static get TYPE() {
    return "rollBirdPower";
  }

  async execute(event) {
    const { system, actor, item } = this.getParents();
    const explorer = game.user.character ?? game.canvas.tokens.controlled[0]?.actor;
    if (explorer == undefined) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.birdPower.noExplorer", { localize: true });
      return;
    }

    if (actor.system.energy.value < system.minEnergy) {
      ui.notifications.error("CORIOLIS_TGD.Automation.FIELDS.birdPower.notEnoughEnergy", { localize: true });
      return;
    }
    let energy = { quantity: system.minEnergy };

    if (actor.system.energy.value > system.minEnergy)
      energy = await api.DialogV2.prompt({
        classes: ["cgd"],
        window: { title: `${item.actor.name}: ${item.name}` },
        content: `<div class="form-group stacked cgd-custom"><label>${game.i18n.localize("CORIOLIS_TGD.Item.BirdPower.FIELDS.energyBonus")}</label><div class="form-fields"><range-picker name="quantity" value="1" min="${system.minEnergy}" max="${item.actor.system.energy.value}" step="1"><input type="range" min="${system.minEnergy}" max="${item.actor.system.energy.value}" step="1"><input type="number" min="${system.minEnergy}" max="${item.actor.system.energy.value}" step="1"></range-picker></div></div>`,
        ok: {
          label: "Use Energy",
          icon: "fa-solid fa-bolt",
          callback: (event, button, dialog) => new foundry.applications.ux.FormDataExtended(button.form).object
        },
      });
    if (!energy)
      return;

    const roller = new cgdRollDialog({ actor: explorer, attribute: "insight", item, canChangeAttribute: false, requireAttribute: true, birdEnergy: energy.quantity });
    const message = await roller.wait(event);
    if (!message)
      return;
    message.setFlag(CORIOLIS_TGD.ID, "birdEnergy", energy.quantity);
    return message;
  }
}