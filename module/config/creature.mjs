import { createListAndChoices } from "../helpers/config.mjs";

export const Creature = {};

Creature.sizeConstants = {
  small: "small",
  normal: "normal",
  large: "large"
};
createListAndChoices(Creature, "size", Creature.sizeConstants, "CORIOLIS_TGD.Actor.Creature.FIELDS.size");