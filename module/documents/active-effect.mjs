export default class cgdActiveEffect extends foundry.documents.ActiveEffect {
  apply(actor, change) {
    if (change.value.toString().indexOf("@") == -1) {
      return super.apply(actor, change);
    }

    change = foundry.utils.deepClone(change);
    const terms = new Roll(change.value, change.effect.parent.getRollData()).evaluateSync();
    change.value = terms.total;
    return super.apply(actor, change);
  }

  get active() {
    const superResult = super.active;
    if (["roverUpgrade", "shuttleUpgrade"].indexOf(this.parent.type) >= 0)
      return this.parent.system.installed && superResult;
    if (["armor"].indexOf(this.parent.type) >= 0)
      return this.parent.system.equipped && superResult;
    return superResult;
  }
}
