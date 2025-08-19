import { CORIOLIS_TGD } from "../../config/config.mjs";
import { roll } from "../../helpers/rolls.mjs";

const { HandlebarsApplicationMixin, ApplicationV2, DialogV2 } = foundry.applications.api;

export default class cgdRollDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor({ actor, attribute, item, requireAttribute = true, canChangeAttribute = true, hideAttribute = false, maxPush = undefined, birdEnergy = 0, connectedActor = undefined, rollOptions = {}, formatLabel = undefined }, options) {
    super(options);
    this.actor = actor;
    this.attribute = attribute;
    this.requireAttribute = requireAttribute;
    this.hideAttribute = hideAttribute;
    this.canAddGearTalent = true;
    this.talent = null;
    this.gear = null;
    this.birdPower = null;
    this.birdEnergy = birdEnergy;
    this.format = "";
    this.maxPush = maxPush;
    this.rollOptions = rollOptions;
    this.connectedActor = connectedActor;
    this.bonusGroups = {
      "manualBonus": [
        {
          label: game.i18n.format(`CORIOLIS_TGD.Roller.Bonuses.manualBonus.name`, { dice: "+1" }),
          selected: false,
          bonus: 1
        },
        {
          label: game.i18n.format(`CORIOLIS_TGD.Roller.Bonuses.manualBonus.name`, { dice: "+2" }),
          selected: false,
          bonus: 2
        },
        {
          label: game.i18n.format(`CORIOLIS_TGD.Roller.Bonuses.manualBonus.name`, { dice: "+3" }),
          selected: false,
          bonus: 3
        },
        {
          label: game.i18n.format(`CORIOLIS_TGD.Roller.Bonuses.manualBonus.name`, { dice: "-1" }),
          selected: false,
          bonus: -1
        },
        {
          label: game.i18n.format(`CORIOLIS_TGD.Roller.Bonuses.manualBonus.name`, { dice: "-2" }),
          selected: false,
          bonus: -2
        },
        {
          label: game.i18n.format(`CORIOLIS_TGD.Roller.Bonuses.manualBonus.name`, { dice: "-3" }),
          selected: false,
          bonus: -3
        }
      ]
    };

    this.options.window.title = actor.name;

    if (this.connectedActor) {
      this.options.window.title = `${this.options.window.title} - ${this.connectedActor.name}`;
    }

    this.canChangeAttribute = canChangeAttribute;

    if (item) {
      this.options.window.title = `${this.options.window.title}: ${item.name} `;
      console.log(item);

      if (item.type == "birdPower") {
        this.options.window.title = `${actor.name} - ${item.actor.name}: ${item.name} `;
        this.birdPower = item;
        this.format = `{bird}: {birdPower} + {attribute}`;
        this.canRemoveGear = false;
      }
      else if (item.type == "roverUpgrade" || item.type == "shuttleUpgrade") {
        // this.options.window.title = `${actor.name} - ${item.actor.name}: ${item.name} `;
        this.format = `${item.actor.name}: {gear} + {attribute}`;
        this.gear = item;
        this.canRemoveGear = false;
      }
      else if (item.type == "vehicleWeapon") {
        // this.options.window.title = `${actor.name} - ${item.actor.name}: ${item.name} `;
        this.format = `${item.actor.name}: {gear} + {attribute}`;
        this.gear = item;
        this.canRemoveGear = false;
      }
      else if (item.type == "talent") {
        this.talent = item;
        this.format = `{talent} + {attribute}`;
        this.canRemoveTalent = false;
      }
      else if (["equipment", "weapon"].indexOf(item.type) >= 0) {
        this.gear = item;
        this.format = `{gear} + {attribute}`;
        this.canRemoveGear = false;
      }
      else if (["armor"].indexOf(item.type) >= 0) {
        this.armor = item;
        if (!item.label) {
          const key = `CORIOLIS_TGD.Automation.FIELDS.armorRoll.${item.system.rollType}Title`;
          const flavor = `${item.name}: ${game.i18n.localize(key)} `;
          this.armor.label = flavor;
        }
        this.format = this.armor.label;
        this.canRemoveGear = false;
        this.canAddGearTalent = false;
        this.bonusGroups["cover"] = [
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.cover.Shrubbery`),
            selected: false,
            bonus: 2,
            type: "dg",
          },
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.cover.Furniture`),
            selected: false,
            bonus: 3,
            type: "dg",
          },
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.cover.Door`),
            selected: false,
            bonus: 4,
            type: "dg",
          },
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.cover.InnerBulkhead`),
            selected: false,
            bonus: 5,
            type: "dg",
          },
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.cover.OuterBulkhead`),
            selected: false,
            bonus: 6,
            type: "dg",
          },
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.cover.ArmoredBulkhead`),
            selected: false,
            bonus: 7,
            type: "dg",
          },
        ]
      }
      else if (item.type == "creatureAttack") {
        this.format = item.name;
        this.canAddGearTalent = false;
        this.hideAttribute = true;
        this.creatureAttack = item;
      }
      else
        ui.notifications.warn("This item type is not configured for rolls.");
    }

    if (formatLabel)
      this.format += formatLabel;

    if (attribute && this.format.indexOf("{attribute}") == -1)
      this.format += " + {attribute}";

    if (this.connectedActor)
      this.format = `${this.connectedActor.name}: ${this.format}`;

    if (this.format.startsWith(" + "))
      this.format = this.format.substring(3);

    if (this.gear?.type == "weapon") {
      if (this.gear.system.attackType == CORIOLIS_TGD.Weapon.attackTypeConstants.ranged) {
        this.bonusGroups["aimed"] = [{
          label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.aimed.aimedFire`),
          selected: false,
          bonus: 2
        }];
        this.bonusGroups["targetSize"] = [
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.targetSize.proneOrSmall`),
            selected: false,
            bonus: -2
          },
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.targetSize.largeOrVehicle`),
            selected: false,
            bonus: 2
          }
        ];
        const features = [];
        for (const [_, feature] of Object.entries(this.gear.system.features)) {
          if (feature.modifier == 0)
            continue;

          features.push({
            label: feature.name,
            selected: false,
            bonus: feature.modifier,
            tooltip: feature.description
          });
        }
        if (features.length > 0)
          this.bonusGroups["features"] = features;
      }
      else if (this.gear.system.attackType == CORIOLIS_TGD.Weapon.attackTypeConstants.close) {
        this.bonusGroups["restrained"] = [
          {
            label: game.i18n.localize(`CORIOLIS_TGD.Roller.Bonuses.restrained.restrainedOrUnaware`),
            selected: false,
            bonus: 2
          }
        ];
      }
    }
  }

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["cgd", 'roll-application'],
    position: {
      width: 600,
    },
    window: {
      title: "Coriolis: The Great Dark",
      icon: "fa-solid fa-dice",
      resizable: false
    },
    actions: {
      selectAttribute: this.selectAttribute,
      add: this.add,
      remove: this.remove,
      change: this.change,
    },
    tag: "form",
    form: {
      handler: cgdRollDialog.myFormHandler,
      //closeOnSubmit: true,
    },
  };

  /** @inheritdoc */
  static PARTS = {
    form: {
      template: `systems/coriolis-tgd/templates/dialog/roller.hbs`,
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    }
  };

  /**
   * Process form submission for the sheet
   * @this {cgdRollDialog}                        The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async myFormHandler(event, form, formData) {
    return this._handleRoll(event, form, formData);
  }

  async _handleRoll(event, form, formData) {
    console.log(event, form, formData);
    if (!event.submitter) {
      const formValues = formData.object;
      for (const [groupName, values] of Object.entries(formValues)) {
        if (Array.isArray(values)) {
          let newSelection = -1;
          let oldSelection = -1;
          for (const index in values) {
            const currentItem = this.bonusGroups[groupName][index];
            if (!currentItem.selected && values[index])
              newSelection = index;
            else if (currentItem.selected && values[index])
              oldSelection = index;
            currentItem.selected = false;
          }
          const currentSelection = newSelection > -1 ? newSelection : oldSelection;
          if (currentSelection > -1)
            this.bonusGroups[groupName][currentSelection].selected = true;
        }
        else if (typeof values === "boolean") {
          const currentItem = this.bonusGroups[groupName][0];
          currentItem.selected = values;
        }

      }

      this.render(true);
      return;
    }

    if (!await this.rollIfBroken())
      return;

    let maxPush = this.maxPush ?? this.actor.system.maxPush[this.attribute] ?? 1;
    let flavor = this.format;
    flavor = flavor.replace("{bird}", this.birdPower?.actor.name);
    flavor = flavor.replace("{birdPower}", this.birdPower?.name);
    flavor = flavor.replace("{attribute}", this.context.attributeInfo?.name);
    flavor = flavor.replace("{gear}", this.gear?.name);
    flavor = flavor.replace("{armor}", this.armor?.name);
    flavor = flavor.replace("{talent}", this.talent?.name);
    flavor = flavor.replace("+ undefined", "");
    this.close();
    this.result = roll(
      this.actor,
      {
        dice: this.context.dice,
        flavor,
        gear: this.gear,
        birdPower: this.birdPower,
        maxPush,
        rollMode: event.submitter.dataset.action,
        rollOptions: this.rollOptions,
      });
    return this.result;
  }

  async _prepareContext() {
    let baseBonus = 0;
    let gearBonus = 0;
    for (const [groupName, list] of Object.entries(this.bonusGroups)) {
      for (const index in list) {
        const currentItem = this.bonusGroups[groupName][index];
        if (!currentItem.selected)
          continue;
        if (currentItem.type == "dg")
          gearBonus += currentItem.bonus;
        else
          baseBonus += currentItem.bonus;
      }
    }

    const baseValue =
      (this.actor.system.attributes?.[this.attribute] ?? 0) +
      (this.actor.system.attributesBonus?.[this.attribute] ?? 0) +
      (this.talent?.system.bonus ?? 0) +
      (this.creatureAttack?.system.baseDice ?? 0) +
      this.birdEnergy +
      baseBonus;
    const gearValue = (this.gear?.system.bonus ?? 0) +
      (this.armor?.system.bonus ?? 0) +
      gearBonus;

    const context = {
      buttons: [
        {
          type: "submit", icon: "fa-solid fa-globe", label: "CHAT.RollPublic",
          disabled: !this.hideAttribute && this.requireAttribute && !this.attribute,
          action: CONST.DICE_ROLL_MODES.PUBLIC
        },
        {
          type: "submit", icon: "fa-solid fa-user-secret", label: "CHAT.RollPrivate",
          disabled: !this.hideAttribute && this.requireAttribute && !this.attribute,
          action: CONST.DICE_ROLL_MODES.PRIVATE
        },
        {
          type: "submit", icon: "fa-solid fa-eye-slash", label: "CHAT.RollBlind",
          disabled: !this.hideAttribute && this.requireAttribute && !this.attribute,
          action: CONST.DICE_ROLL_MODES.BLIND
        },
        {
          type: "submit", icon: "fa-solid fa-user", label: "CHAT.RollSelf",
          disabled: !this.hideAttribute && this.requireAttribute && !this.attribute,
          action: CONST.DICE_ROLL_MODES.SELF
        },
      ],
      dice: {
        base: baseValue,
        gear: gearValue,
      },
      gear: this.gear,
      talent: this.talent,
      birdPower: this.birdPower,
      birdEnergy: this.birdEnergy,
      conditions: [],
      requireAttribute: this.requireAttribute,
      canChangeAttribute: this.canChangeAttribute,
      hideAttribute: this.hideAttribute,
      canRemoveGear: this.canRemoveGear,
      canRemoveTalent: this.canRemoveTalent,
      canAddGearTalent: this.canAddGearTalent,
      config: CORIOLIS_TGD,
      actor: this.actor,
      bird: this.bird,
      armor: this.armor,
      creatureAttack: this.creatureAttack,
      bonusGroups: this.bonusGroups,
    };

    if (this.attribute) {
      context.attributeInfo = {
        name: game.i18n.localize(`CORIOLIS_TGD.Actor.base.FIELDS.attributes.${this.attribute}.label`),
        bonus: this.actor.system.attributes[this.attribute],
      };
    }

    await this._prepareConditions(context);

    this.context = context;

    return context;
  }

  async _prepareConditions(context) {
    if (!this.attribute)
      return;

    for (const condition of this.actor.appliedEffects) {
      if (condition.disabled)
        continue;

      let conditionName = condition.name;

      let value = 0;
      let changes = [...condition.changes];

      if (condition.origin) {
        let item = await fromUuid(condition.origin);
        conditionName = item?.name ?? `${condition.parent.name} (${condition.name})`;

        for (const statusId of condition.statuses) {
          const statusConfig = CONFIG.statusEffects.find(it => it.id == statusId);
          if (!statusConfig)
            continue;
          changes.push(...statusConfig.changes);
        }
      }

      for (const change of changes) {
        if (change.key == `system.attributesBonus.${this.attribute}`)
          value += parseInt(change.value);
      }
      if (value != 0) {
        context.conditions.push({
          name: conditionName,
          system: { bonus: value }
        });
      }
    }
  }

  async wait(event) {
    if (event?.shiftKey && (!this.requireAttribute || this.attribute)) {
      event.submitter = {
        dataset: { action: game.settings.get('core', 'rollMode') }
      };
      await this._prepareContext();
      return this._handleRoll(event, undefined, undefined);
    }

    return new Promise((resolve, reject) => {
      this.addEventListener("close", async event => {
        resolve(await this.result);
      }, { once: true });
      this.render(true);
    });
  }

  // ACTIONS

  static async selectAttribute(event, target) {
    this.attribute = target.dataset.choice;
    this.render(true);
  }

  static async add(event, target) {
    const isTalent = target.dataset.type == "talent";
    const types = isTalent ? ["talent"] : ["equipment", "weapon"];
    const items = this.actor.items.filter(it => types.indexOf(it.type) >= 0)
      .sort((a, b) => (a.name.localeCompare(b.name)));
    let btnIndex = 0;
    const buttons = [
      ...items.map((item) => {
        let bonus = (item.system.bonus < 0 ? "" : "+") + item.system.bonus;

        const btn = Object.assign({
          label: `${item.name} (${bonus})`,
          action: item.id,
          callback: () => item,
        });
        btnIndex++;
        return btn;
      })
    ];

    const title = "Add Item";

    const result = await DialogV2.wait({
      content: "",
      buttons,
      rejectClose: false,
      modal: true,
      classes: ["cgd", 'dialog', 'choice-dialog'],
      position: {
        width: 400
      },
      window: { title },
    });

    if (!result)
      return;

    if (isTalent) {
      this.talent = result;
      this.format = `${this.format} + {talent}`;
      this.canRemoveTalent = true;
    }
    else {
      this.gear = result;
      this.format = `${this.format} + {gear}`;
      this.canRemoveGear = true;
    }

    this.render(true);
  }

  static async remove(event, target) {
    const isTalent = target.dataset.type == "talent";
    if (isTalent) {
      this.talent = undefined;
      this.format = this.format.replace(" + {talent}", "");
    }
    else {
      this.gear = undefined;
      this.format = this.format.replace(" + {gear}", "");
    }

    this.render(true);
  }

  static async change(event, target) {
    console.log(event, target);
  }

  async rollIfBroken() {
    let rollWhileBroken = true;

    if (this.actor.isBroken)
      rollWhileBroken = await DialogV2.confirm(
        {
          content: game.i18n.format("CORIOLIS_TGD.Automation.actorBroken", { actor: this.actor.name }),
          window: {
            icon: "fa-solid fa-heart-crack",
            title: this.actor.name
          },
          modal: true
        }
      );
    if (this.birdPower?.actor.isBroken)
      rollWhileBroken = await DialogV2.confirm(
        {
          content: game.i18n.format("CORIOLIS_TGD.Automation.actorBroken", { actor: this.birdPower?.actor.name }),
          window: {
            icon: "fa-solid fa-heart-crack",
            title: this.birdPower?.actor.name
          },
          modal: true
        }
      );

    return rollWhileBroken;
  }
}