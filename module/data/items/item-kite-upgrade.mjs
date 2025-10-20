import cgdVehicleUpgrade from "./item-vehicle-upgrade.mjs";

export default class cgdKiteUpgrade extends cgdVehicleUpgrade {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Item.KiteUpgrade',
  ];
}
