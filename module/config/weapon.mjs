import { createListAndChoices } from "../helpers/config.mjs";

export const Weapon = {};

// ATTACK TYPE
Weapon.attackTypeConstants = {
  close: "close",
  ranged: "ranged",
  vehicle: "vehicle",
};
createListAndChoices(Weapon, "attackType", Weapon.attackTypeConstants, "CORIOLIS_TGD.Item.Weapon.FIELDS.attackType");

// ATTACK RANGE
Weapon.attackRangeConstants = {
  engaged: "engaged",
  short: "short",
  medium: "medium",
  long: "long",
  extreme: "extreme",
  special: "special"
};
createListAndChoices(Weapon, "attackRange", Weapon.attackRangeConstants, "CORIOLIS_TGD.Item.Weapon.FIELDS.range");

// ATTACK GRIP
Weapon.gripConstants = {
  oneHand: "oneHand",
  twoHands: "twoHands"
};
createListAndChoices(Weapon, "grip", Weapon.gripConstants, "CORIOLIS_TGD.Item.Weapon.FIELDS.grip");