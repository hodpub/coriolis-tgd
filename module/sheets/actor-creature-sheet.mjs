import cgdRollDialog from "../applications/dialog/roller.mjs";
import { CORIOLIS_TGD } from "../config/config.mjs";
import { cgdActorNpcSheet } from "./actor-npc-sheet.mjs";

export class cgdActorCreatureSheet extends cgdActorNpcSheet {
  static DEFAULT_OPTIONS = {
    classes: ['cgd', 'actor', 'simple', 'creature'],
    actions: {
      attack: this._attack,
      behavior: this._behavior,
      armor: this._armor,
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.system.showAttribute = {};
    CORIOLIS_TGD.Attributes.list.map(x => {
      context.system.showAttribute[x] = !context.system.playMode || context.system.attributes[x];
    });

    return context;
  }
  _prepareItems(context) {
    const attacks = [];
    const abilities = [];

    for (let i of this.document.items) {
      if (i.type === 'creatureAttack') {
        attacks.push(i);
        continue;
      }
      if (i.type === "creatureAbility") {
        abilities.push(i);
        continue;
      }
    }
    context.abilities = abilities.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.attacks = attacks.sort((a, b) => (a.system.attackNumber || 0) - (b.system.attackNumber || 0));
    context.nextAttackNumber = attacks.length + 1;
  }

  async _onDropItem(event, item) {
    if (item.type != "creatureAttack")
      return super._onDropItem(event, item);

    const attacksCount = this.actor.items.filter(it => it.type == "creatureAttack").length;
    foundry.utils.deepClone
    item.updateSource({ "system.attackNumber": attacksCount + 1 });
    super._onDropItem(event, item);
  }

  static async _attack(event, target) {
    const attacks = this.actor.items.filter(it => it.type == "creatureAttack");
    const roll = await new Roll("1d6").roll();
    let attackNumber = roll.total;
    console.log(attackNumber, this.actor.system.lastAttack);
    if (this.actor.system.lastAttack == attackNumber)
      attackNumber += 1;
    if (attackNumber == 7)
      attackNumber = 1;
    const currentAttack = attacks[attackNumber - 1];
    await currentAttack.automate(event);
    console.log(this.actor, attackNumber, currentAttack.name);
    return this.actor.update({ "system.lastAttack": attackNumber });
  }
  static async _behavior(event, target) {
    const roll = await new Roll("1d6").roll();
    const content = `<p>${this.actor.system.behaviourPattern[roll.total - 1]}</p>`;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const flavor = game.i18n.localize("CORIOLIS_TGD.Actor.Creature.FIELDS.behavior.label");
    await roll.toMessage({ flavor, content, speaker, rollMode });
  }

  static async _armor(event, target) {
    const itemName = `${this.actor.name}'s Armor`;
    const roller = new cgdRollDialog({
      actor: this.actor,
      item: { type: "armor", system: { bonus: this.actor.system.armor }, label: itemName, name: itemName },
      hideAttribute: true,
      maxPush: 0
    });
    return roller.wait(event);
  }
}