import { DataHelper } from "../../helpers/data.mjs";
import cgdVehicle from "./actor-vehicle.mjs";

export default class cgdShuttle extends cgdVehicle {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Vehicle',
    'CORIOLIS_TGD.Actor.Shuttle',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.combatSpeed = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.travelSpeed = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.range = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    
    return schema;
  }
}