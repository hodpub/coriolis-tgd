// Import document classes.
import { cgdActor } from './documents/actor.mjs';
import { cgdItem } from './documents/item.mjs';
import { cgdChatMessage } from './documents/chat-message.mjs';
import cgdActiveEffect from "./documents/active-effect.mjs";
// Import sheet classes.
import * as sheets from "./sheets/_module.mjs";
// Import helper/utility classes and constants.
import { CORIOLIS_TGD } from './config/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
import registerHandlebarsHelpers from "./helpers/handlebars.mjs"
// Import extensions from Foundry
import { cgdChatLog } from "./applications/sidebar/tabs/chatLog.mjs"
// YearZero Roll Manager
import { YearZeroRollManager } from '../lib/yzur.js';
import { registerDice3D } from './helpers/rolls.mjs';
import { registerStatusEffects } from "./config/statusEffects.mjs";
import cgdRollDialog from "./applications/dialog/roller.mjs";
import { registerSettings, registerYearZeroCombatSettings } from "./helpers/settings.mjs";

const collections = foundry.documents.collections;
const foundrySheets = foundry.appv1.sheets;

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Add key classes to the global scope so they can be more easily used
// by downstream developers
globalThis.coriolistgd = {
  documents: {
    cgdActor,
    cgdItem,
  },
  applications: {
    cgdRollDialog,
  },
  sheets,
  models,
};

Hooks.once('init', function () {
  // Add custom constants for configuration.
  CONFIG.CORIOLIS_TGD = CORIOLIS_TGD;
  registerStatusEffects();

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = cgdActor;

  CONFIG.ui.chat = cgdChatLog;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    explorer: models.cgdExplorer,
    npc: models.cgdNPC,
    creature: models.cgdCreature,
    bird: models.cgdBird,
    crew: models.cgdCrew,
    rover: models.cgdRover,
    shuttle: models.cgdShuttle,
  };
  CONFIG.Item.documentClass = cgdItem;
  CONFIG.Item.dataModels = {
    talent: models.cgdTalent,
    equipment: models.cgdEquipment,
    weapon: models.cgdWeapon,
    armor: models.cgdArmor,
    affliction: models.cgdAffliction,
    creatureAttack: models.cgdCreatureAttack,
    creatureAbility: models.cgdCreatureAbility,
    birdPower: models.cgdBirdPower,
    crewManeuver: models.cgdCrewManeuver,
    roverUpgrade: models.cgdRoverUpgrade,
    shuttleUpgrade: models.cgdShuttleUpgrade,
    vehicleWeapon: models.cgdVehicleWeapon,
    feature: models.cgdFeature
  };

  CONFIG.ActiveEffect.documentClass = cgdActiveEffect;

  CONFIG.ChatMessage.documentClass = cgdChatMessage;
  CONFIG.ChatMessage.template = "systems/coriolis-tgd/templates/sidebar/chat-message.hbs";

  // Register sheet application classes
  collections.Actors.unregisterSheet('core', foundrySheets.ActorSheet);
  collections.Actors.registerSheet('coriolis-tgd', sheets.cgdActorSheet, {
    types: ["explorer"],
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Actor.Explorer',
  });
  collections.Actors.registerSheet('coriolis-tgd', sheets.cgdActorNpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Actor.NPC',
  });
  collections.Actors.registerSheet('coriolis-tgd', sheets.cgdActorCreatureSheet, {
    types: ["creature"],
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Actor.Creature',
  });
  collections.Actors.registerSheet('coriolis-tgd', sheets.cgdActorBirdSheet, {
    types: ["bird"],
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Actor.Bird',
  });
  collections.Actors.registerSheet('coriolis-tgd', sheets.cgdActorCrewSheet, {
    types: ["crew"],
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Actor.Crew',
  });
  collections.Actors.registerSheet('coriolis-tgd', sheets.cgdActorVehicleSheet, {
    types: ["rover", "shuttle"],
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Actor.Vehicle',
  });
  collections.Items.unregisterSheet('core', foundrySheets.ItemSheet);
  collections.Items.registerSheet('coriolis-tgd', sheets.cgdItemSheet, {
    makeDefault: true,
    label: 'CORIOLIS_TGD.SheetLabels.Item',
  });

  YearZeroRollManager.register("cgd", {
    "ROLL.baseTemplate": `systems/${CORIOLIS_TGD.ID}/templates/dice/broll.hbs`,
    "ROLL.chatTemplate": `systems/${CORIOLIS_TGD.ID}/templates/dice/roll.hbs`,
    "ROLL.tooltipTemplate": `systems/${CORIOLIS_TGD.ID}/templates/dice/tooltip.hbs`,
    "ROLL.infosTemplate": `systems/${CORIOLIS_TGD.ID}/templates/dice/infos.hbs`,
  });

  registerSettings();
});

Hooks.once('yzeCombatReady', registerYearZeroCombatSettings);

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

registerHandlebarsHelpers();
// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  const roleClass = game.user.isGM ? "isGM" : "isNotGM";
  document.body.classList.add(roleClass);
  console.log(document.body.classList);
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (["Item", "Attribute"].indexOf(data.type) > -1) {
      createDocMacro(data, slot); return false;
    }
  });

});

Hooks.once('diceSoNiceReady', registerDice3D);

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
  if (data.type === "Attribute") return createAttributeMacro(data, slot);
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);
  const macroName = game.i18n.format("CORIOLIS_TGD.Automation.automate",
    {
      name: item.name,
      actor: item.actor.name
    });

  // Create the macro command using the uuid.
  const command = `(await fromUuid("${data.uuid}")).automate();`;
  let macro = game.macros.find(
    (m) => m.name === macroName && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'coriolis-tgd.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}

async function createAttributeMacro(data, slot) {
  const macroName = game.i18n.format("CORIOLIS_TGD.Automation.automate",
    {
      name: game.i18n.localize(`CORIOLIS_TGD.Actor.base.FIELDS.attributes.${data.target}.label`),
      actor: data.actorName
    });

  let macro = game.macros.find(
    (m) => m.name === macroName && m.command === data.command
  );
  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: 'script',
      img: `systems/coriolis-tgd/assets/icons/gears.svg`,
      command: data.command,
      flags: { 'coriolis-tgd.attributeMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}