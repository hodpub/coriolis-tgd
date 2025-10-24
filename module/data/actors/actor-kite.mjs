import { CORIOLIS_TGD } from "../../config/config.mjs";
import { DataHelper } from "../../helpers/data.mjs";
import RollDialogWithConnectedActorAutomation from "../automations/roll-dialog-with-connected-actor.mjs";
import RollDialogAutomation from "../automations/roll-dialog.mjs";
import cgdVehicle from "./actor-vehicle.mjs";

export default class cgdKite extends cgdVehicle {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Kite',
    'CORIOLIS_TGD.Item.Equipment',
    'CORIOLIS_TGD.Item.Weapon',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    delete schema.passengers;

    schema.cost = new fields.NumberField({...DataHelper.requiredInteger, initial: 1, min: 0 });
    schema.range = new fields.StringField({ required: true, choices: CORIOLIS_TGD.Vehicle.kiteRanges, initial: CORIOLIS_TGD.Vehicle.kiteRangeConstants.medium });
    schema.tech = new fields.SetField(new fields.StringField({ required: true, choices: CORIOLIS_TGD.Equipment.techChoices }), { initial: [CORIOLIS_TGD.Equipment.techConstants.ordinary] });
    
    return schema;
  }

  prepareDefaultAutomations() {
    var automationList = [
      new RollDialogWithConnectedActorAutomation({
        name: game.i18n.localize("CORIOLIS_TGD.Actor.Kite.Automation.UseKite.name"),
        connectedActor: this.parent,
        canChangeAttribute: true,
        item: {
          name: game.i18n.localize("CORIOLIS_TGD.Actor.Kite.Automation.UseKite.item.type.name"),
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
      })
    ];

    return automationList;
  }
}
