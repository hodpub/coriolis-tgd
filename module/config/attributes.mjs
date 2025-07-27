export const Attributes = {};

Attributes.list = [
  "strength",
  "agility",
  "empathy",
  "logic",
  "insight",
  "perception"
];

Attributes.choices = Object.assign(
  ...Attributes.list.map((attribute) => ({
    [attribute]: `CORIOLIS_TGD.Actor.base.FIELDS.attributes.${attribute}.label`
  }))
);