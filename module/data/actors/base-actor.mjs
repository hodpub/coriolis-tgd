export default class cgdActorBase extends foundry.abstract
  .TypeDataModel {
  static LOCALIZATION_PREFIXES = ["CORIOLIS_TGD.Actor.base"];

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.playMode = new fields.BooleanField();

    return schema;
  }

  prepareAutomations(filter) {
    let items = this.parent.items;
    if (filter)
      items = items.filter(it => filter.indexOf(it.type) >= 0);
    let automations = items.reduce((p, v) => {
      for (const [key, value] of Object.entries(v.system.automations)) {
        if (value.showAsSelection)
          p.push(value);
      }
      return p;
    }, []);
    const defaultAutomations = this.prepareDefaultAutomations();
    automations.splice(0, 0, ...defaultAutomations);
    this.automations = automations;
  }

  prepareDefaultAutomations() { return []; }
}