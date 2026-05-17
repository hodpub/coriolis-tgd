export default class cgdActiveEffect extends foundry.documents.ActiveEffect {
  static applyChange(targetDoc, change, { replacementData = {}, modifyTarget = true } = {}) {
    if (change.value.toString().indexOf("@") == -1) {
      return super.applyChange(targetDoc, change, { replacementData, modifyTarget });
    }

    change = foundry.utils.deepClone(change);
    const terms = new Roll(change.value, change.effect.parent.getRollData()).evaluateSync();
    change.value = terms.total;
    return super.applyChange(targetDoc, change, { replacementData, modifyTarget });
  }

  get active() {
    const superResult = super.active;
    if (["kiteUpgrade", "roverUpgrade", "shuttleUpgrade"].indexOf(this.parent.type) >= 0)
      return this.parent.system.installed && superResult;
    if (["armor"].indexOf(this.parent.type) >= 0)
      return this.parent.system.equipped && superResult;
    return superResult;
  }
}
