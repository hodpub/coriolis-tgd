import { createListAndChoices } from "../helpers/config.mjs";

export const Crew = {};

Crew.roleConstants = {
  delver: "delver",
  scout: "scout",
  guard: "guard",
  burrower: "burrower",
  archaeologist: "archaeologist"
};
createListAndChoices(Crew, "role", Crew.roleConstants, "CORIOLIS_TGD.Actor.Crew.FIELDS.roles");