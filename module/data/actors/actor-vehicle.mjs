import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import ConsumeSupplyAutomation from "../automations/consume-supply-automation.mjs";
import RollDialogWithConnectedActorAutomation from "../automations/roll-dialog-with-connected-actor.mjs";
import RollDialogAutomation from "../automations/roll-dialog.mjs";
import RollUpgradeAutomation from "../automations/roll-upgrade-automation.mjs";
import cgdActorBase from "./base-actor.mjs";

export default class cgdVehicle extends cgdActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Vehicle',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.maneuverability = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.maxManeuverability = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.hull = new fields.SchemaField({
      value: new fields.NumberField({
        ...DataHelper.requiredInteger,
        initial: 0,
        min: 0
      }),
      max: new fields.NumberField({
        ...DataHelper.requiredInteger,
        initial: 0,
        min: 0
      })
    });
    schema.armor = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.passengers = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.cargo = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.slots = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0, min: 0 });
    schema.paint = new fields.StringField();
    schema.notes = new fields.HTMLField();

    return schema;
  }

  prepareDerivedData() {
    this.prepareAutomations(["roverUpgrade", "shuttleUpgrade", "vehicleWeapon"]);
    const items = this.parent.items;
    let cargoUsed = 0;
    let supplyCount = 0;
    let slotUsed = 0;
    for (const item of items) {
      if (item.system.hasOwnProperty("weight"))
        cargoUsed += item.system.weight * item.system.quantity;
      if (item.flags["coriolis-tgd"]?.isSupply)
        supplyCount += item.system.quantity;
      if (item.system.installed && !item.system.partOfFrame)
        slotUsed += item.system.slot;
    }
    this.cargoUsed = {
      value: cargoUsed
    };
    this.supplyCount = supplyCount;
    this.slotsUsed = slotUsed;
    this.atHandMax = this.atHandMaxBonus ?? 0;
    this.atHandCount = this.parent.items.filter(it => it.type == "vehicleWeapon" && it.system.atHand).length;
  }

  prepareDefaultAutomations() {
    var automationList = [
      new RollDialogWithConnectedActorAutomation({
        name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.Stunt.name"),
        connectedActor: this.parent,
        attribute: "agility",
        canChangeAttribute: false,
        item: {
          name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.Stunt.item.type.name"),
          type: "equipment",
          system: {
            bonus: this.maneuverability
          },
        },
        postExecution: async (message) => {
          message.setFlag(CORIOLIS_TGD.ID, "gearUuid", this.parent.uuid);
          message.setFlag(CORIOLIS_TGD.ID, "gearField", "maneuverability");
        }
      }),
      new RollDialogWithConnectedActorAutomation({
        name:  game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.Ramming.name"),
        connectedActor: this.parent,
        attribute: "agility",
        canChangeAttribute: false,
        item: {
          name:  game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.Ramming.item.type.name"),
          type: "weapon",
          system: {
            bonus: this.maneuverability,
            damage: Math.ceil(this.hull.value / 2),
            critical: Math.ceil(this.hull.value / 2) + 2
          },
        },
        postExecution: async (message) => {
          message.setFlag(CORIOLIS_TGD.ID, "gearUuid", this.parent.uuid);
          message.setFlag(CORIOLIS_TGD.ID, "gearField", "maneuverability");
        }
      }),
      new RollDialogAutomation({
        name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.ArmorRoll.name"),
        actor: this.parent,
        hideAttribute: true,
        item: {
          name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.ArmorRoll.item.name"),
          label: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.ArmorRoll.item.label"),
          type: "armor",
          system: {
            bonus: this.armor,
            rollType: "armorRating"
          },
        },
        maxPush: 0,
      }),
      new RollDialogAutomation({
        name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.BlightProtectionRoll.name"),
        actor: this.parent,
        hideAttribute: true,
        item: {
          name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.BlightProtectionRoll.item.name"),
          label: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.BlightProtectionRoll.item.label"),
          type: "armor",
          system: {
            bonus: this.blightProtection,
            rollType: "blightProtection"
          },
        },
        maxPush: 0,
      }),
      new RollDialogWithConnectedActorAutomation({
        name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.Overload.name"),
        connectedActor: this.parent,
        attribute: "logic",
        canChangeAttribute: false,
        formatLabel: "Overload",
        postExecution: async (message) => {
          message.setFlag(CORIOLIS_TGD.ID, "damagedUuid", this.parent.uuid);
          message.setFlag(CORIOLIS_TGD.ID, "damagedValue", 1);
          message.setFlag(CORIOLIS_TGD.ID, "damagedField", "hull.value");
        }
      }),
      new RollDialogWithConnectedActorAutomation({
        name: game.i18n.localize("CORIOLIS_TGD.Actor.Vehicle.Automation.SensorSweep.name"),
        connectedActor: this.parent,
        attribute: "logic",
        canChangeAttribute: false,
        formatLabel: "Sensor Sweep",
      }),
    ];
    return automationList;
  }

  async _preCreate(data, options, user) {
    if (!data.items?.length) {
      const supplyAutomation = new ConsumeSupplyAutomation();
      const supply = {
        name: game.i18n.localize("CORIOLIS_TGD.Item.Equipment.FIELDS.supply.label"),
        img: "systems/coriolis-tgd/assets/icons/supply.svg",
        type: "equipment",
        flags: {
          "coriolis-tgd": {
            isSupply: true
          }
        },
        system: {
          bonus: 0,
          maxBonus: 0,
          consumable: true,
          cost: 100,
          quantity: 0,
          supplyConsumed: 1,
          tech: ["ordinary"],
          weight: 0.25,
          deleteWhenZero: false,
          automations: {
            [supplyAutomation._id]: supplyAutomation
          }
        }
      };
      this.parent.updateSource({ items: [supply] });
    }
  }
}
