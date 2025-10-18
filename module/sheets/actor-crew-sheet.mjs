import { CORIOLIS_TGD } from "../config/config.mjs";
import { cgdActorSheet } from "./actor-sheet.mjs";

export class cgdActorCrewSheet extends cgdActorSheet {
  static DEFAULT_OPTIONS = {
    defaultTab: "maneuvers"
  };

  static PARTS = {
    header: {
      template: 'systems/coriolis-tgd/templates/actor/crew/header.hbs',
      templates: ['systems/coriolis-tgd/templates/actor/crew/role.hbs']
    },
    maneuvers: {
      template: 'systems/coriolis-tgd/templates/actor/crew/maneuvers.hbs',
    }
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = [];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;

    options.parts.push("header", "maneuvers");
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.explorers = game.actors.filter(e => e.type == "explorer").reduce((p, v) => {
      p[v.uuid] = v.name;
      return p;
    }, {});

    const explorer = game.user.character ?? game.canvas.tokens.controlled[0]?.actor;
    for (const role of Object.keys(this.document.system.roles)) {
      if (game.user.isGM || this.document.system.roles[role] == explorer?.uuid)
        context[`is${role}`] = true;
    }

    this.document.system.recalculateSupplies();

    return context;
  }

  _prepareItems(context) {
    const maneuvers = [];

    for (let i of this.document.items) {
      if (i.type === 'crewManeuver') {
        maneuvers.push(i);
        continue;
      }
    }
    context.maneuvers = maneuvers.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }
}