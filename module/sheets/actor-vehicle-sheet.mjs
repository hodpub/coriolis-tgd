import cgdRollDialog from "../applications/dialog/roller.mjs";
import { cgdActorSheet } from "./actor-sheet.mjs";

export class cgdActorVehicleSheet extends cgdActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ['vehicle'],
    defaultTab: "automations",
    position: {
      width: 700,
      height: 800,
    },
  };

  static PARTS = {
    header: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    kiteStats: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/kite-stats.hbs',
    },
    roverStats: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/rover-stats.hbs',
    },
    shuttleStats: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/shuttle-stats.hbs',
    },
    cargo: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/cargo.hbs',
      templates: ['systems/coriolis-tgd/templates/actor/meter.hbs'],
      scrollable: [""],
    },
    combat: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/combat.hbs',
      templates: [
        'systems/coriolis-tgd/templates/actor/explorer/weapons.hbs',
        'systems/coriolis-tgd/templates/actor/meter.hbs',
      ],
      scrollable: [""],
    },
    upgrades: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/upgrades.hbs',
      templates: ['systems/coriolis-tgd/templates/actor/meter.hbs'],
      scrollable: [""],
    },
    effects: {
      template: 'systems/coriolis-tgd/templates/actor/effects.hbs',
      scrollable: [""],
    },
    automations: {
      template: 'systems/coriolis-tgd/templates/actor/automations.hbs',
      scrollable: [""],
    },
    notes: {
      template: 'systems/coriolis-tgd/templates/actor/vehicle/notes.hbs',
      scrollable: [""],
    },
  }

  static TABS_CONFIGURATION = {
    kiteStats: "stats",
    roverStats: "stats",
    shuttleStats: "stats"
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = [];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;

    options.parts.push("header", 'tabs', "automations", `${this.document.type}Stats`, "combat", "cargo", "upgrades", "effects", "notes");

    // Kites do not carry cargo; remove the part.
    if (this.document.type == "kite") {
      const cargoIdx = options.parts.indexOf("cargo");
      options.parts.splice(cargoIdx, 1);
    }
  }

  _prepareItems(context) {
    const cargo = [];
    const upgrades = [];
    const upgradesInstalled = [];
    const weapons = [];
    const weaponsInventory = [];

    for (let i of this.document.items) {
      if (i.type === "kiteUpgrade" || i.type === "roverUpgrade" || i.type === "shuttleUpgrade") {
        if (i.system.installed)
          upgradesInstalled.push(i);
        else
          upgrades.push(i);
        continue;
      }
      if (i.type === 'vehicleWeapon') {
        if (i.system.atHand)
          weapons.push(i);
        else
          weaponsInventory.push(i);
        continue;
      }
      cargo.push(i);
    }
    context.cargo = cargo.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.upgrades = upgrades.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.upgradesInstalled = upgradesInstalled.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.weaponsInventory = weaponsInventory.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }


  static async _armor(event, target) {
    const itemName = `${this.actor.name}'s Armor`;
    const roller = new cgdRollDialog({
      actor: this.actor,
      item: { type: "armor", system: { bonus: this.actor.system.armor }, label: itemName, name: itemName },
      hideAttribute: true,
      maxPush: 0
    });
    return roller.wait(event);
  }
}
