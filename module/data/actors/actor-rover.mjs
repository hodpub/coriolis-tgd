import { DataHelper } from "../../helpers/data.mjs";
import cgdVehicle from "./actor-vehicle.mjs";

export default class cgdRover extends cgdVehicle {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Rover',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.speed = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.blightProtection = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.propulsion = new fields.StringField();

    return schema;
  }
}