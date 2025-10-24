import { createListAndChoices } from "../helpers/config.mjs";

export const Vehicle = {};

// KITE RANGE
Vehicle.kiteRangeConstants = {
  engaged: "engaged",
  short: "short",
  medium: "medium",
  long: "long",
  extreme: "extreme",
  special: "special"
};
createListAndChoices(Vehicle, "kiteRange", Vehicle.kiteRangeConstants, "CORIOLIS_TGD.Item.Weapon.FIELDS.range");
