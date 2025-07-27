import cgdWeapon from "./item-weapon.mjs";

export default class cgdVehicleWeapon extends cgdWeapon {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Item.VehicleWeapon',
  ];

  static defineSchema() {
    const schema = super.defineSchema();

    delete schema.attackType;
    delete schema.grip;

    return schema;
  }
}