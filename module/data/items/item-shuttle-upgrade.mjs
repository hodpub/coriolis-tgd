import cgdVehicleUpgrade from "./item-vehicle-upgrade.mjs";

export default class cgdRoverUpgrade extends cgdVehicleUpgrade {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Item.RoverUpgrade',
  ];
}
