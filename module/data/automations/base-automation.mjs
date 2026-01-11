
const fields = foundry.data.fields;
export default class BaseAutomation extends foundry.abstract.DataModel {

  static get metadata() {
    return {
      documentName: "Automation",
      types: coriolistgd.models.automations,
    };
  }

  static #TYPES;
  /**
   * The type of this shape.
   * @type {string}
   */
  static TYPE = "";


  static defineSchema() {
    return {
      _id: new fields.DocumentIdField({ initial: () => foundry.utils.randomID() }),
      name: new fields.StringField({
        initial: () => game.i18n.format("CORIOLIS_TGD.Automation.new", { type: game.i18n.localize(`CORIOLIS_TGD.Automation.Type.${this.TYPE}`) }),
        required: true,
        blank: false
      }),
      type: new fields.StringField({
        initial: () => this.TYPE,
        required: true,
        blank: false,
        readonly: true,
        validate: value => value === this.TYPE,
        validationError: `Type can only be '${this.TYPE}'.`,
      }),
      showAsSelection: new fields.BooleanField({
        initial: true
      }),
      origin: new fields.StringField(),
      defaultGear: new fields.DocumentUUIDField(),
      defaultTalent: new fields.DocumentUUIDField()
    };
  }

  /**
   * The subtypes of this pseudo-document.
   * @type {Record<string, typeof PseudoDocument>}
   */
  static get TYPES() {
    return Object.values(this.metadata.types).reduce((acc, Cls) => {
      if (Cls.TYPE) {
        acc[Cls.TYPE] = Cls;
        foundry.applications.handlebars.loadTemplates([`systems/coriolis-tgd/templates/item/automation-parts/${Cls.TYPE}.hbs`]);
      }
      return acc;
    }, {});
  }

  static async createNew() {
    let btnIndex = 0;
    const buttons = [
      ...Object.values(this.metadata.types).map((type) => {
        const btn = Object.assign({
          label: game.i18n.localize(`CORIOLIS_TGD.Automation.Type.${type.TYPE}`),
          action: type.TYPE,
          callback: () => new type(),
        });
        btnIndex++;
        return btn;
      })
    ].filter(it => it !== undefined && it.action);
    const title = game.i18n.localize(`CORIOLIS_TGD.Automation.addNew`);

    return await foundry.applications.api.DialogV2.wait({
      undefined,
      buttons,
      rejectClose: false,
      modal: true,
      classes: ["cgd", 'dialog', 'choice-dialog'],
      position: {
        width: 400
      },
      window: { title },
    });
  }

  getParents() {
    return {
      system: this.parent,
      item: this.parent.parent,
      actor: this.parent.parent.actor,
    };
  }

  get item() {
    return this.parent.parent;
  }

  get system() {
    return this.parent;
  }

  get actor() {
    return this.parent.parent.actor;
  }

  async getDefaults() {
    return {
      gear: fromUuidSync(this.defaultGear),
      talent: fromUuidSync(this.defaultTalent)
    }
  }
}
