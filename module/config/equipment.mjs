import { createListAndChoices } from "../helpers/config.mjs";

export const Equipment = {};

Equipment.techConstants = {
  // 0: "ZERO",
  ordinary: "ordinary",
  guildExplorers: "guildExplorers",
  guildNavigators: "guildNavigators",
  guildMachinists: "guildMachinists",
  guildGardeners: "guildGardeners",
  heirloom: "heirloom",
  restricted: "restricted",
  guildGmChoice: "guildGmChoice"
}

Equipment.techChoices = Object.assign(
  ...Object.keys(Equipment.techConstants).map(tech => ({
    [tech]: `CORIOLIS_TGD.Item.Equipment.FIELDS.tech.${tech}.label`
  }))
);

Equipment.weightConstants = {
  tiny: 0.0,
  veryLight: 0.25,
  light: 0.5,
  regular: 1,
  heavy: 2,
  veryHeavy: 3,
  superHeavy: 4,
  extreme: 5,
};

Equipment.weightChoices =
  Object.entries(Equipment.weightConstants).map(([label, p]) => ({
    value: p,
    label: `CORIOLIS_TGD.Item.Equipment.FIELDS.weight.${label}.label`
  }));

Equipment.featureConstants = {
  weapon: "weapon",
  armor: "armor"
};
createListAndChoices(Equipment, "feature", Equipment.featureConstants, "CORIOLIS_TGD.Item.Feature.FIELDS.type");