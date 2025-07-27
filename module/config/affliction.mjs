export const Affliction = {};

Affliction.types = ["criticalInjury", "mentalTrauma", "blightManifestation"];

Affliction.choices = Object.assign(
  ...Affliction.types.map((t) => ({
    [t]: `CORIOLIS_TGD.Item.Affliction.FIELDS.afflictionType.${t}`
  }))
);