import { CORIOLIS_TGD } from "../config/config.mjs";
import { cgdActorSheet } from "./actor-sheet.mjs";

export class cgdActorBirdSheet extends cgdActorSheet {
  static DEFAULT_OPTIONS = {
    defaultTab: "powers"
  };

  static PARTS = {
    header: {
      template: 'systems/coriolis-tgd/templates/actor/bird/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    powers: {
      template: 'systems/coriolis-tgd/templates/actor/bird/powers.hbs',
    }
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = [];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;

    options.parts.push("header", "powers");
  }

  async _processSubmitData(event, form, submitData) {
    if (submitData.system.type && submitData.type != this.actor.system.type) {
      const defaultValues = CORIOLIS_TGD.Bird.defaultValues[submitData.system.type];
      submitData.system.energy.max = defaultValues.energy;
      submitData.system.energy.value = defaultValues.energy;
      submitData.system.health.max = defaultValues.health;
      submitData.system.health.value = defaultValues.health;
    }

    return super._processSubmitData(event, form, submitData);
  }

  _prepareItems(context) {
    const powers = [];

    for (let i of this.document.items) {
      if (i.type === 'birdPower') {
        powers.push(i);
        continue;
      }
    }
    context.powers = powers.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }
}