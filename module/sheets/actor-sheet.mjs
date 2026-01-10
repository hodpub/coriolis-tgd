import cgdRollDialog from "../applications/dialog/roller.mjs";
import { prepareActiveEffectCategories } from '../helpers/effects.mjs';
import { prepareAutomationCategories } from '../helpers/automation.mjs';

const { api, sheets } = foundry.applications;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class cgdActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['cgd', 'actor', 'explorer'],
    position: {
      width: 900,
      height: 800,
    },
    actions: {
      onEditImage: this._onEditImage,
      viewDoc: this._viewDoc,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
      toggleEffect: this._toggleEffect,
      roll: this._onRoll,
      expand: this.#onExpand,
      toggleStatusEffect: this._toggleStatusEffect,
      setValue: this.#setValue,
      setSupply: this.#setSupply,
      togglePlayEditMode: this._togglePlayEditMode,
    },
    // Custom property that's merged into `this.options`
    // dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
    defaultTab: "automations",
    window: {
      resizable: true
    }
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/coriolis-tgd/templates/actor/header.hbs',
      templates: ["systems/coriolis-tgd/templates/actor/explorer/attributes.hbs"]
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    biography: {
      template: 'systems/coriolis-tgd/templates/actor/explorer/biography.hbs',
      scrollable: [""],
    },
    talents: {
      template: 'systems/coriolis-tgd/templates/actor/explorer/talents.hbs',
      scrollable: [""],
    },
    equipments: {
      template: 'systems/coriolis-tgd/templates/actor/explorer/equipments.hbs',
      scrollable: [".scrollable"],
    },
    combat: {
      template: 'systems/coriolis-tgd/templates/actor/explorer/combat.hbs',
      templates: ['systems/coriolis-tgd/templates/actor/explorer/weapons.hbs'],
      scrollable: [""],
    },
    afflictions: {
      template: 'systems/coriolis-tgd/templates/actor/explorer/afflictions.hbs',
      scrollable: [""],
    },
    solo: {
      template: 'systems/coriolis-tgd/templates/actor/explorer/solo.hbs',
      scrollable: [""],
    },
    effects: {
      template: 'systems/coriolis-tgd/templates/actor/effects.hbs',
      scrollable: [""],
    },
    automations: {
      template: 'systems/coriolis-tgd/templates/actor/automations.hbs',
      scrollable: [""],
    },
    simple: {
      template: 'systems/coriolis-tgd/templates/actor/simple.hbs',
      scrollable: [".scrollable"]
    },
    creature: {
      template: 'systems/coriolis-tgd/templates/actor/creature.hbs',
      scrollable: [".scrollable"]
    }
  };

  /** @override */
  _configureRenderOptions(options) {
    // Add the current documents' actor type to the css classes.
    if (!this.options.classes.includes(this.document.type))
      this.options.classes.push(this.document.type);

    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = [];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'explorer':
        options.parts.push('header', 'tabs', "automations", 'combat', 'talents', 'equipments', 'afflictions', 'effects', 'biography', 'solo');
        break;
      case 'npc':
        options.parts.push('simple');
        break;
      case 'creature':
        options.parts.push('creature');
        break;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Output initialization
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the actor document.
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      automations: this.actor.system.automations,
      automationsCategorized: prepareAutomationCategories(this.actor.system.automations),
      // Adding a pointer to CONFIG.CORIOLIS_TGD
      config: CONFIG.CORIOLIS_TGD,
      statusEffects: CONFIG.statusEffects.filter(it => it.name.startsWith("CORIOLIS_TGD.")),
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
    };

    // Offloading context prep to a helper function
    this._prepareItems(context);

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'biography':
        context.enrichedContacts = await TextEditor.enrichHTML(
          this.actor.system.biography.contacts,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        context.enrichedOthers = await TextEditor.enrichHTML(
          this.actor.system.biography.others,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
      case 'simple':
        // Enrich biography info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedBiography = await TextEditor.enrichHTML(
          this.actor.system.biography,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
      case 'effects':
        // Prepare active effects
        context.effects = prepareActiveEffectCategories(
          // A generator that returns all effects stored on the actor
          // as well as any items
          this.actor.allApplicableEffects()
        );
        break;
      case 'creature':
        context.enrichedBiography = await TextEditor.enrichHTML(
          this.actor.system.biography,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        context.enrichedcontainmentProtocol = await TextEditor.enrichHTML(
          this.actor.system.containmentProtocol,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
        case 'notes':
        context.enrichedNotes = await TextEditor.enrichHTML(
          this.actor.system.notes,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.actor.getRollData(),
            // Relative UUID resolution
            relativeTo: this.actor,
          }
        );
        break;
    }
    context.tab = context.tabs[partId];
    return context;
  }


  static TABS_CONFIGURATION = {};
  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = this.options.defaultTab;
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'CORIOLIS_TGD.Actor.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'simple':
        case 'creature':
        case 'tabs':
          return tabs;

        default:
          let config = partId;
          if (this.constructor.TABS_CONFIGURATION[partId])
            config = this.constructor.TABS_CONFIGURATION[partId];

          tab.id = config.toLowerCase();
          tab.label += `${config.charAt(0).toUpperCase()}${config.substring(1)}`;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const solo = [];
    const talents = [];
    const equipments = [];
    const afflictions = [];
    const weapons = [];
    const weaponsInventory = [];
    const attacks = [];
    const abilities = [];
    let armor;

    // Iterate through items, allocating to containers
    for (let i of this.document.items) {
      if (i.type === 'solo') {
        solo.push(i);
        continue;
      }
      if (i.type === 'talent') {
        talents.push(i);
        continue;
      }
      if (i.type === 'weapon') {
        if (this.actor.type == "explorer")
          equipments.push(i);
        if (this.actor.type != "explorer" || i.system.atHand)
          weapons.push(i);
        else
          weaponsInventory.push(i);
        continue;
      }
      if (i.type === "armor") {
        armor = i;
        continue;
      }
      if (i.type === 'equipment') {
        equipments.push(i);
        continue;
      }
      if (i.type === 'affliction') {
        afflictions.push(i);
        continue;
      }
      if (i.type === 'creatureAttack') {
        attacks.push(i);
        continue;
      }
      if (i.type === "creatureAbility") {
        abilities.push(i);
        continue;
      }
    }

    // Sort then assign
    context.solo = solo.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.talents = talents.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.equipments = equipments.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.weaponsInventory = weaponsInventory.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.afflictions = afflictions.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.abilities = abilities.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.attacks = attacks.sort((a, b) => (a.system.attackNumber || 0) - (b.system.attackNumber || 0));
    context.armor = armor;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @override
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#disableOverrides();
    // You may want to add other special handling here
    // Foundry comes with a large number of utility classes, e.g. SearchFilter
    // That you may want to implement yourself.
  }

  /* -------------------------------------------------- */
  /*   Application Life-Cycle Events                    */
  /* -------------------------------------------------- */

  /**
   * Actions performed after a first render of the Application.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);

    this._createContextMenu(this._getItemButtonContextOptions, "[data-document-class]");
    //, { hookName: "getItemButtonContextOptions", parentClassHooks: false, fixed: true }
  }

  /** @inheritDoc */
  async _renderFrame(options) {
    const frame = await super._renderFrame(options);

    if (!this.document.inCompendium && this.document.isOwner) {
      const togglePlayEditLabel = game.i18n.localize(`CORIOLIS_TGD.Actor.base.FIELDS.playMode.${this.actor.system.playMode}`);
      const cssClass = this.actor.system.playMode ? "circle-play" : "pen-to-square";
      const togglePlayEditId = `
        <button type="button" class="header-control fa-solid fa-${cssClass} icon" data-action="togglePlayEditMode" data-tooltip="${togglePlayEditLabel}" aria-label="${togglePlayEditLabel}"></button>
      `;
      this.window.close.insertAdjacentHTML("beforebegin", togglePlayEditId);
    }

    return frame;
  }

  /**
   * Get context menu entries for item buttons.
   * @returns {ContextMenuEntry[]}
   * @protected
   */
  _getItemButtonContextOptions() {
    // name is auto-localized
    return [
      // //Ability specific options
      // {
      //   name: "DRAW_STEEL.Item.Ability.SwapUsage.ToMelee",
      //   icon: "<i class=\"fa-solid fa-fw fa-sword\"></i>",
      //   condition: (target) => {
      //     let item = this._getEmbeddedDocument(target);
      //     return (item?.type === "ability") && (item?.system.distance.type === "meleeRanged") && (item?.system.damageDisplay === "ranged");
      //   },
      //   callback: async (target) => {
      //     const item = this._getEmbeddedDocument(target);
      //     if (!item) {
      //       console.error("Could not find item");
      //       return;
      //     }
      //     await item.update({ "system.damageDisplay": "melee" });
      //     await this.render();
      //   },
      // },
      // {
      //   name: "DRAW_STEEL.Item.Ability.SwapUsage.ToRanged",
      //   icon: "<i class=\"fa-solid fa-fw fa-bow-arrow\"></i>",
      //   condition: (target) => {
      //     let item = this._getEmbeddedDocument(target);
      //     return (item?.type === "ability") && (item?.system.distance.type === "meleeRanged") && (item?.system.damageDisplay === "melee");
      //   },
      //   callback: async (target) => {
      //     const item = this._getEmbeddedDocument(target);
      //     if (!item) {
      //       console.error("Could not find item");
      //       return;
      //     }
      //     await item.update({ "system.damageDisplay": "ranged" });
      //     await this.render();
      //   },
      // },
      // // Kit specific options
      // {
      //   name: "DRAW_STEEL.Item.Kit.PreferredKit.MakePreferred",
      //   icon: "<i class=\"fa-solid fa-star\"></i>",
      //   condition: (target) => this._getEmbeddedDocument(target)?.type === "kit",
      //   callback: async (target) => {
      //     const item = this._getEmbeddedDocument(target);
      //     if (!item) {
      //       console.error("Could not find item");
      //       return;
      //     }
      //     await this.actor.update({ "system.hero.preferredKit": item.id });
      //     await this.render();
      //   },
      // },
      // All applicable options
      {
        name: "CORIOLIS_TGD.Item.Weapon.atHand.equip",
        icon: "<i class=\"fa-solid fa-hand-fist\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          if (["rover", "shuttle"].includes(this.actor.type)) return false;
          return this.actor.isOwner && this.actor.system.hasOwnProperty("atHandMax") && item.type == "weapon" && !item.system.atHand && this.actor.system.atHandCount < this.actor.system.atHandMax;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.atHand": true });
        },
      },
      {
        name: "CORIOLIS_TGD.Item.Weapon.atHand.unequip",
        icon: "<i class=\"fa-solid fa-hand\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          if (["rover", "shuttle"].includes(this.actor.type)) return false;
          return this.actor.isOwner && item.type == "weapon" && item.system.atHand;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.atHand": false });
        },
      },
      {
        name: "CORIOLIS_TGD.Item.Armor.equipped.equip",
        icon: "<i class=\"fa-solid fa-hand-fist\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          if (["rover", "shuttle"].includes(this.actor.type)) return false;
          return this.actor.isOwner && item.type == "armor" && !item.system.equipped;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.equipped": true });
        },
      },
      {
        name: "CORIOLIS_TGD.Item.Armor.equipped.unequip",
        icon: "<i class=\"fa-solid fa-hand\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          if (["rover", "shuttle"].includes(this.actor.type)) return false;
          return this.actor.isOwner && item.type == "armor" && item.system.equipped;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.equipped": false });
        },
      },

      {
        name: "CORIOLIS_TGD.Item.VehicleUpgrade.install",
        icon: "<i class=\"fa-solid fa-wrench\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          return this.actor.isOwner && item.type == "vehicleWeapon" && !item.system.atHand && this.actor.system.atHandCount < this.actor.system.atHandMax;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.atHand": true });
        },
      },
      {
        name: "CORIOLIS_TGD.Item.VehicleUpgrade.uninstall",
        icon: "<i class=\"fa-solid fa-remove\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          return this.actor.isOwner && item.type == "vehicleWeapon" && item.system.atHand && this.actor.system.atHandCount < this.actor.system.atHandMax;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.atHand": false });
        },
      },
      {
        name: "CORIOLIS_TGD.Item.VehicleUpgrade.install",
        icon: "<i class=\"fa-solid fa-wrench\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          return this.actor.isOwner && ((this.actor.type == "kite" && item.type == "kiteUpgrade") || (this.actor.type == "rover" && item.type == "roverUpgrade") || (this.actor.type == "shuttle" && item.type == "shuttleUpgrade")) && !item.system.partOfFrame && !item.system.installed && this.actor.system.slotsUsed + item.system.slot <= this.actor.system.slots;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.installed": true });
        },
      },
      {
        name: "CORIOLIS_TGD.Item.VehicleUpgrade.uninstall",
        icon: "<i class=\"fa-solid fa-remove\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          return this.actor.isOwner && ((this.actor.type == "kite" && item.type == "kiteUpgrade") || (this.actor.type == "rover" && item.type == "roverUpgrade") || (this.actor.type == "shuttle" && item.type == "shuttleUpgrade")) && !item.system.partOfFrame && item.system.installed;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.update({ "system.installed": false });
        },
      },
      {
        name: "CORIOLIS_TGD.Chat.SendToChat",
        icon: "<i class=\"fa-solid fa-comment\"></i>",
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.sendToChat();
        },
      },
      {
        name: "Edit",
        icon: "<i class=\"fa-solid fa-fw fa-edit\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          return this.actor.type == "explorer" ? !item.flags["coriolis-tgd"]?.isSupply : true;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.sheet.render({ force: true });
        },
      },
      {
        name: "Delete",
        icon: "<i class=\"fa-solid fa-fw fa-trash\"></i>",
        condition: (target) => {
          let item = this._getEmbeddedDocument(target);
          return this.actor.isOwner && !item.flags["coriolis-tgd"]?.isSupply;
        },
        callback: async (target) => {
          const item = this._getEmbeddedDocument(target);
          if (!item) {
            console.error("Could not find item");
            return;
          }
          await item.deleteDialog();
        },
      },
    ];
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  /**
   * Handle changing a Document's image.
   *
   * @this cgdActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @protected
   */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Renders an embedded document's sheet
   *
   * @this cgdActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /**
   * Handles item deletion
   *
   * @this cgdActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    await doc.deleteDialog();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this cgdActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createDoc(event, target) {
    // Retrieve the configured document class for Item or ActiveEffect
    const docCls = getDocumentClass(target.dataset.documentClass);
    // Prepare the document creation data by initializing it a default name.
    const docData = {
      name: docCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(docData, dataKey, value);
    }
    const filter = target.dataset.filter.split(",");
    const maxValue = Math.max(...this.actor.items.filter(it => filter.indexOf(it.type) > -1).map(it => it.sort), 0) + 1;
    foundry.utils.setProperty(docData, "sort", maxValue);

    // Finally, create the embedded document!
    const itemCreated = await docCls.create(docData, { parent: this.actor });
    itemCreated.sheet.render(true);
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this cgdActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    await effect.update({ disabled: !effect.disabled });
  }
  static async _togglePlayEditMode(event, target) {
    const togglePlayEditLabel = game.i18n.localize(`CORIOLIS_TGD.Actor.base.FIELDS.playMode.${!this.actor.system.playMode}`);
    $(target).toggleClass("fa-circle-play").toggleClass("fa-pen-to-square").attr("data-tooltip", togglePlayEditLabel);
    await this.actor.update({ "system.playMode": !this.actor.system.playMode });
  }

  /**
   * Handle clickable rolls.
   *
   * @this cgdActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onRoll(event, target) {
    event.preventDefault();
    const dataset = target.dataset;

    // Handle item rolls.
    switch (dataset.rollType) {
      case 'item':
        const item = this._getEmbeddedDocument(target);
        if (item) return item.automate(event);
      case 'attribute':
        return new cgdRollDialog({ actor: this.actor, requireAttribute: true, canChangeAttribute: false, attribute: dataset.value }).wait(event);
      case "automation":
        const automationItem = await fromUuid(dataset.item);
        if (automationItem)
          return automationItem.automate(event, dataset.automationId);

        const automation = this.actor.system.automations.filter(it => it._id == dataset.automationId)[0];
        return automation.execute(event);
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  static #onExpand(event, target) {
    event.preventDefault();
    target.classList.toggle("expanded");
  }

  static async _toggleStatusEffect(event, target) {
    event.preventDefault();
    const condition = target.dataset.value;
    await this.actor.toggleStatusEffect(condition);
  }

  static #setValue(event, target) {
    event.preventDefault();
    const dataset = target.dataset;
    const field = dataset.field;
    const value = dataset.value;

    return this.actor.update({ [field]: value });
  }

  static async #setSupply(event, target) {
    event.preventDefault();
    const dataset = target.dataset;
    const value = dataset.value;

    await this.actor.getSupplyItem().update({ "system.quantity": value });

    return game.actors.filter(a => a.type == "crew")
      .forEach(crew => {
        crew.system.recalculateSupplies();
        crew.render();
      });
  }

  /** Helper Functions */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target    The element subject to search
   * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    const docRow = target.closest('[data-document-class]');
    if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }

  /***************
   *
   * Drag and Drop
   *
   ***************/

  /**
   * An event that occurs when a drag workflow begins for a draggable item on the sheet.
   * @param {DragEvent} event       The initiating drag start event
   * @returns {Promise<void>}
   * @protected
   */

  async _onDragStart(event) {
    const target = event.currentTarget;
    let dragData = {};
    switch (target.dataset.rollType) {
      case "attribute":
        dragData = {
          type: "Attribute",
          target: target.dataset.value,
          command: `
            const actor = await fromUuid("${this.actor.uuid}");
            new coriolistgd.applications.cgdRollDialog({actor, requireAttribute: true, canChangeAttribute: false, attribute: "${target.dataset.value}"}).wait();`,
          actorName: this.actor.name
        };
        break;
      case "automation":
        let item = await fromUuid(target.dataset.item);
        let automation = item.system.automations[target.dataset.automationId];
        dragData = {
          type: "Automation",
          target: target.dataset.item,
          command: `
            const item = await fromUuid("${target.dataset.item}");
            item?.system.automations["${target.dataset.automationId}"]?.execute();`,
          actorName: this.actor.name,
          itemName: item.name,
          automationName: automation.name,
          img: item.img
        };
        break;
      default:
        return super._onDragStart(event);
    }

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    return event;
  }

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        (siblingId !== effect.id || parentId !== effect.parent.id)
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments('ActiveEffect', updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  async _onDropItem(event, item) {
    if (!this.actor.isOwner) return;
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, item);

    if (item.type == "kiteUpgrade" || item.type == "shuttleUpgrade" || item.type == "roverUpgrade")
      return super._onDropItem(event, item);

    if (!["rover", "shuttle"].includes(this.actor.type) && item.type == "armor" && this.actor.items.filter(it => it.type == "armor").length) {
      ui.notifications.error("This actor already has an armor. Remove it before trying to equip another.");
      return;
    }
    let data = { quantity: 1 };
    if (item.system.quantity > 1) {
      const label = game.i18n.format("CORIOLIS_TGD.Actor.general.TransferTo", { actor: this.actor.name });
      data = await api.DialogV2.prompt({
        classes: ["cgd"],
        content: `<div class="form-group stacked cgd-custom"><label>${game.i18n.localize("CORIOLIS_TGD.Actor.general.QuantityToTransfer")}</label><div class="form-fields"><range-picker name="quantity" value="1" min="1" max="${item.system.quantity}" step="1"><input type="range" min="1" max="${item.system.quantity}" step="1"><input type="number" min="1" max="${item.system.quantity}" step="1"></range-picker></div></div>`,
        ok: {
          label: label,
          icon: "fa-solid fa-right-left",
          callback: (event, button, dialog) => new foundry.applications.ux.FormDataExtended(button.form).object
        },
        window: {
          title: label
        }
      });
    }

    const quantityToTransfer = data.quantity;
    const quantityToKeep = (item.system.quantity ?? 1) - quantityToTransfer;

    let done = false;
    let currentItem = this.actor.items.get(item.id);
    if (item.flags["coriolis-tgd"]?.isSupply)
      currentItem = this.actor.getSupplyItem();
    if (item.system.hasOwnProperty("quantity") && currentItem) {
      await currentItem.update({ "system.quantity": currentItem.system.quantity + quantityToTransfer });
      done = true;
    }
    else {
      const itemToCreate = foundry.utils.deepClone(item).toObject();
      itemToCreate.system.quantity = quantityToTransfer;
      const newItem = await Item.create(itemToCreate, { parent: this.actor, keepId: true });
      done = newItem;
    }

    if (!done || !item.parent)
      return;

    if (quantityToKeep == 0 && item.system.deleteWhenZero)
      await item.delete();
    else
      await item.update({ "system.quantity": quantityToKeep });
  }

  /********************
   *
   * Actor Override Handling
   *
   ********************/

  /**
   * Submit a document update based on the processed form data.
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {object} submitData                   Processed and validated form data to be used for a document update
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  async _processSubmitData(event, form, submitData) {
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (let k of Object.keys(overrides)) delete submitData[k];
    await this.document.update(submitData);
  }

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }
}
