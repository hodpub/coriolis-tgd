import { DataHelper } from "../../helpers/data.mjs";
import cgdActorBase from "./base-actor.mjs";

export default class cgdCrew extends cgdActorBase {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    'CORIOLIS_TGD.Actor.Crew',
  ];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.crewPoints = new fields.NumberField({ ...DataHelper.requiredInteger, initial: 0 });
    schema.roles = new fields.SchemaField({
      delver: new fields.DocumentUUIDField({ required: false, nullable: true }),
      scout: new fields.DocumentUUIDField({ required: false, nullable: true }),
      guard: new fields.DocumentUUIDField({ required: false, nullable: true }),
      burrower: new fields.DocumentUUIDField({ required: false, nullable: true }),
      archaeologist: new fields.DocumentUUIDField({ required: false, nullable: true }),
    });

    schema.bird = new fields.DocumentUUIDField({ required: false, nullable: true });
    //TODO: relation with the Rover and Shuttle

    return schema;
  }

  async _preCreate(data, options, user) {
    const bird = game.actors.filter(it => it.type == "bird");
    if (bird.length == 1)
      this.parent.updateSource({ ["system.bird"]: bird[0].uuid });
  }

  recalculateSupplies() {
    const crewExplorers = Object.values(this.roles).filter(x => x);
     this.totalSupply = game.actors
      .filter(e => crewExplorers.includes(e.uuid))
      .reduce((p, v) => p + v.system.supplyCount, 0);
  }
}