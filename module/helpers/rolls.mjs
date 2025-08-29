import { YearZeroRoll } from "../../lib/yzur.js";
import cgdRollDialog from "../applications/dialog/roller.mjs";
import { CORIOLIS_TGD } from "../config/config.mjs"
import cgdArmor from "../data/items/item-armor.mjs";

const ID = CORIOLIS_TGD.ID;
export function registerDice3D(dice3d) {
  dice3d.addColorset(
    {
      name: 'CTGDBase',
      description: 'CTGDBase',
      category: 'Colors',
      foreground: ['#000000'],
      background: ['#c1af79'],
      outline: '#c1af79',
      texture: 'none',
    },
    'preferred',
  );

  dice3d.addColorset(
    {
      name: 'CTGDGear',
      description: 'CTGDGear',
      category: 'Colors',
      foreground: ['#c1af79'],
      background: ['#000000'],
      outline: '#000000',
      texture: 'none',
    },
    'preferred',
  );

  dice3d.addSystem({ id: ID, name: 'Coriolis: The Great Dark' }, 'preferred');
  dice3d.addDicePreset({
    type: 'db',
    labels: [
      `systems/${ID}/assets/dice/base-1.webp`,
      `systems/${ID}/assets/dice/base-2.webp`,
      `systems/${ID}/assets/dice/base-3.webp`,
      `systems/${ID}/assets/dice/base-4.webp`,
      `systems/${ID}/assets/dice/base-5.webp`,
      `systems/${ID}/assets/dice/base-6.webp`,
    ],
    colorset: 'CTGDBase',
    system: ID,
  });
  dice3d.addDicePreset({
    type: 'dg',
    labels: [
      `systems/${ID}/assets/dice/gear-1.webp`,
      `systems/${ID}/assets/dice/gear-2.webp`,
      `systems/${ID}/assets/dice/gear-3.webp`,
      `systems/${ID}/assets/dice/gear-4.webp`,
      `systems/${ID}/assets/dice/gear-5.webp`,
      `systems/${ID}/assets/dice/gear-6.webp`,
    ],
    colorset: 'CTGDGear',
    system: ID,
  });
}

export async function roll(actor, { dice, flavor, gear, birdPower, breakdown, maxPush, rollMode, rollOptions }) {
  let formula = [];
  if (dice.base)
    formula.push(`${dice.base}db`);
  if (dice.gear)
    formula.push(`${dice.gear}dg`);

  if (!formula.length) {
    ui.notifications.warn("You must select at least one die to roll!");
    return;
  }

  let options = rollOptions;
  if (gear?.type == "weapon") {
    options.damage = gear.system.damage;
    options.critical = gear.system.critical;
    options.blight = gear.system.blight;
  }
  if (birdPower && birdPower.system.isAttack) {
    options.damage = birdPower.system.damage;
    options.critical = birdPower.system.critical;
  }
  options.breakdown = breakdown;

  let roll = await new YearZeroRoll(formula.join(" + "), { maxPush }, options).roll();
  const speaker = ChatMessage.getSpeaker({ actor });
  const message = await roll.toMessage({
    speaker,
    flavor,
  }, { rollMode });
  if (gear) {
    message.setFlag(CORIOLIS_TGD.ID, "gearUuid", gear.uuid);
    message.setFlag(CORIOLIS_TGD.ID, "gearField", "bonus");
  }
  if (birdPower)
    message.setFlag(CORIOLIS_TGD.ID, "birdPowerUuid", birdPower.uuid);
  await game.dice3d?.waitFor3DAnimationByMessageID(message.id);
  return message;
}

export async function accept(event) {

  // Get the message.
  const { messageId } = event.target.closest("[data-message-id]")?.dataset ?? {};
  let message = game.messages.get(messageId);

  // Copy the roll.
  let roll = message.rolls[0].duplicate();
  roll.maxPush = 0;
  await Promise.all([
    spendBirdEnergy(message, roll),
    applyFailedDamage(message, roll),
  ]);
  await message.update({ rolls: [roll.toJSON()] });
  return message;
}

async function spendBirdEnergy(message, roll) {
  const birdPowerUuid = message.getFlag(CORIOLIS_TGD.ID, "birdPowerUuid");
  if (!birdPowerUuid)
    return;

  const birdPower = await fromUuid(birdPowerUuid);
  const birdEnergy = message.getFlag(CORIOLIS_TGD.ID, "birdEnergy");

  roll.options.energyUsed = roll.successCount ? birdEnergy : 0;
  if (roll.options.energyUsed)
    await birdPower.actor.update({ "system.energy.value": birdPower.actor.system.energy.value - roll.options.energyUsed });
}

export async function pushRoll(event) {

  // Get the message.
  const { messageId } = event.target.closest("[data-message-id]")?.dataset ?? {};
  let message = game.messages.get(messageId);

  // Copy the roll.
  let roll = message.rolls[0].duplicate();

  // Delete the previous message.
  await message.delete();

  // Push the roll and send it.
  await roll.push();
  await Promise.all([
    applyHopeDamage(message, roll),
    applyGearDamage(message, roll),
    applyBirdPowerLosingControl(message, roll),
    spendBirdEnergy(message, roll),
    applyFailedDamage(message, roll),
  ]);
  const newMessage = await roll.toMessage({
    speaker: message.speaker,
    flavor: message.flavor,
    rollMode: game.settings.get('core', 'rollMode'),
  });
  await game.dice3d?.waitFor3DAnimationByMessageID(newMessage.id);
  return message;
}

async function applyHopeDamage(message, roll) {
  if (!roll.attributeTrauma)
    return;

  const actor = game.actors.get(message.speaker.actor);
  if (actor.type != "explorer")
    return;

  actor.update({ "system.derivedAttributes.hope.value": actor.system.derivedAttributes.hope.value - roll.attributeTrauma });
}

async function applyGearDamage(message, roll) {
  const gearUuid = message.getFlag(CORIOLIS_TGD.ID, "gearUuid");
  if (!gearUuid || !roll.gearDamage)
    return;
  const gear = await fromUuid(gearUuid);
  const gearField = message.getFlag(CORIOLIS_TGD.ID, "gearField");
  const gearFieldMax = `max${gearField.charAt(0).toUpperCase() + gearField.substring(1)}`;
  const newBonus = gear.system[gearField] - roll.gearDamage;
  await gear.update({
    [`system.${gearField}`]: newBonus,
    [`system.${gearFieldMax}`]: gear.system[gearFieldMax]
  });
}

async function applyFailedDamage(message, roll) {
  const damagedUuid = message.getFlag(CORIOLIS_TGD.ID, "damagedUuid");
  if (!damagedUuid || roll.successCount)
    return;
  const obj = await fromUuid(damagedUuid);
  const objField = message.getFlag(CORIOLIS_TGD.ID, "damagedField");
  const objDamage = message.getFlag(CORIOLIS_TGD.ID, "damagedValue");
  const objFieldMax = `max${objField.charAt(0).toUpperCase() + objField.substring(1)}`;
  const newBonus = foundry.utils.getProperty(obj, `system.${objField}`) - objDamage;
  await obj.update({
    [`system.${objField}`]: newBonus,
    [`system.${objFieldMax}`]: foundry.utils.getProperty(obj, `system.${objFieldMax}`)
  });
}

async function applyBirdPowerLosingControl(message, roll) {
  if (!roll.attributeTrauma)
    return;

  const birdPowerUuid = message.getFlag(CORIOLIS_TGD.ID, "birdPowerUuid");
  if (!birdPowerUuid)
    return;
  const birdPower = await fromUuid(birdPowerUuid);
  console.log(birdPower);

  //TODO: roll LOSING CONTROL pg 84
}

export async function applyTargetDamage(event) {
  if (!game.user.isGM) {
    ui.notifications.error("You are not a GM!");
    return;
  }
  const { messageId } = event.target.closest("[data-message-id]")?.dataset ?? {};
  let message = game.messages.get(messageId);
  let roll = message.rolls[0];
  console.log(roll, message);

  for (const target of game.canvas.tokens.controlled) {
    const changes = {};
    if (roll.attackDamage && target.actor.system.derivedAttributes.health) {
      changes["system.derivedAttributes.health.value"] = target.actor.system.derivedAttributes.health.value - roll.attackDamage;
    }
    if (roll.options.despair && target.actor.system.derivedAttributes.hope) {
      changes["system.derivedAttributes.hope.value"] = target.actor.system.derivedAttributes.hope.value - parseInt(roll.options.despair);
    }
    if (roll.options.blight && target.actor.system.derivedAttributes.heart) {
      changes["system.derivedAttributes.heart.value"] = target.actor.system.derivedAttributes.heart.value - parseInt(roll.options.blight);
    }

    await target.actor.update(changes);
  }
}