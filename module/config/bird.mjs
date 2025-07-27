import { createListAndChoices } from "../helpers/config.mjs";

export const Bird = {};

Bird.typeConstants = {
  ward: "ward",
  guide: "guide",
  specter: "specter"
};

createListAndChoices(Bird, "type", Bird.typeConstants, "CORIOLIS_TGD.Actor.Bird.FIELDS.type");

Bird.defaultValues = {
  ward: {
    health: 5,
    energy: 2,
    power: "name:Raptor's Call"
  },
  guide: {
    health: 4,
    energy: 3,
    power: "name:Farsight"
  },
  specter: {
    health: 3,
    energy: 4,
    power: "name:Enshroud"
  }
};