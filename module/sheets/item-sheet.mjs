import { CORIOLIS_TGD } from "../config/config.mjs";
import BaseAutomation from "../data/automations/base-automation.mjs";
import RunMacroAutomation from "../data/automations/run-macro-automation.mjs";
import EmbeddedFeature from "../data/embedded/embedded-feature.mjs";
import { prepareActiveEffectCategories } from '../helpers/effects.mjs';

const { api, sheets } = foundry.applications;
const DragDrop = foundry.applications.ux.DragDrop;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export class cgdItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['cgd', 'item'],
    actions: {
      onEditImage: this._onEditImage,
      viewDoc: this._viewEffect,
      createDoc: this._createEffect,
      deleteDoc: this._deleteEffect,
      toggleEffect: this._toggleEffect,
      createAutomation: this._createAutomation,
      deleteAutomation: this._deleteAutomation,
      automationCommand: this._automationCommand,
      deleteFeature: this._deleteFeature,
    },
    position: {
      width: 409,
      height: 700
    },
    form: {
      submitOnChange: true,
    },
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/coriolis-tgd/templates/item/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    description: {
      template: 'systems/coriolis-tgd/templates/item/description.hbs',
    },
    configurationTalent: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/talent.hbs',
      scrollable: [""]
    },
    configurationAffliction: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/affliction.hbs',
      scrollable: [""]
    },
    configurationEquipment: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/equipment.hbs',
      scrollable: [""]
    },
    configurationWeapon: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/weapon.hbs',
      scrollable: [""]
    },
    configurationArmor: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/armor.hbs',
      scrollable: [""]
    },
    configurationCreatureAttack: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/creature-attack.hbs',
      scrollable: [""]
    },
    configurationBirdPower: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/bird-power.hbs',
      scrollable: [""]
    },
    configurationCrewManeuver: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/crew-maneuver.hbs',
      scrollable: [""]
    },
    configurationVehicleUpgrade: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/vehicle-upgrade.hbs',
      scrollable: [""]
    },
    configurationVehicleWeapon: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/vehicle-weapon.hbs',
      scrollable: [""]
    },
    configurationFeature: {
      template: 'systems/coriolis-tgd/templates/item/configuration-parts/feature.hbs',
      scrollable: [""]
    },
    automations: {
      template: 'systems/coriolis-tgd/templates/item/automations.hbs',
      scrollable: [""],
    },
    effects: {
      template: 'systems/coriolis-tgd/templates/item/effects.hbs',
      scrollable: [""]
    },
    features: {
      template: 'systems/coriolis-tgd/templates/item/features.hbs',
      scrollable: [""]
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ['header', 'tabs', 'description'];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    console.log(this.document.type);
    switch (this.document.type) {
      case 'talent':
        options.parts.push('configurationTalent');
        break;
      case 'equipment':
        options.parts.push('configurationEquipment');
        break;
      case 'weapon':
        options.parts.push('configurationWeapon', 'features');
        break;
      case 'armor':
        options.parts.push('configurationArmor', 'features');
        break;
      case 'affliction':
        options.parts.push('configurationAffliction');
        break;
      case 'creatureAttack':
        options.parts.push('configurationCreatureAttack');
        break;
      case "birdPower":
        options.parts.push("configurationBirdPower");
        break;
      case "crewManeuver":
        options.parts.push("configurationCrewManeuver");
        break;
      case "roverUpgrade":
      case "shuttleUpgrade":
        options.parts.push("configurationVehicleUpgrade");
        break;
      case "vehicleWeapon":
        options.parts.push("configurationVehicleWeapon", 'features');
        break;
      case "feature":
        options.parts.push("configurationFeature");
        break;
    }
    options.parts.push('effects', 'automations');
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.CORIOLIS_TGD
      config: CONFIG.CORIOLIS_TGD,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      isEmbedded: this.item.isEmbedded,
    };

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'automations':
      case 'configurationTalent':
      case 'configurationEquipment':
      case 'configurationWeapon':
      case 'configurationArmor':
      case 'configurationAffliction':
      case 'configurationCreatureAttack':
      case "configurationBirdPower":
      case "configurationCrewManeuver":
      case "configurationVehicleUpgrade":
      case "configurationVehicleWeapon":
      case "configurationFeature":
      case "features":
        // Necessary for preserving active tab on re-render
        context.tab = context.tabs[partId];
        break;
      case 'description':
        context.tab = context.tabs[partId];
        // Enrich description info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.item.getRollData(),
            // Relative UUID resolution
            relativeTo: this.item,
          }
        );
        break;
      case 'effects':
        context.tab = context.tabs[partId];
        // Prepare active effects for easier access
        context.effects = prepareActiveEffectCategories(this.item.effects);
        break;
    }
    return context;
  }

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
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'description';
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'CORIOLIS_TGD.Item.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'description':
          tab.id = 'description';
          tab.label += 'Description';
          break;
        case 'configurationTalent':
        case 'configurationEquipment':
        case 'configurationWeapon':
        case 'configurationArmor':
        case 'configurationAffliction':
        case 'configurationCreatureAttack':
        case "configurationBirdPower":
        case "configurationCrewManeuver":
        case "configurationVehicleUpgrade":
        case "configurationVehicleWeapon":
        case "configurationFeature":
          tab.id = 'configuration';
          tab.label += 'Configuration';
          break;
        case 'automations':
          tab.id = 'automations';
          tab.label += 'Automations';
          break;
        case 'effects':
          tab.id = 'effects';
          tab.label += 'Effects';
          break;
        case 'features':
          tab.id = 'features';
          tab.label += 'Features';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    new DragDrop.implementation({
      dragSelector: ".draggable",
      dropSelector: null,
      permissions: {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      },
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      }
    }).bind(this.element);
    // You may want to add other special handling here
    // Foundry comes with a large number of utility classes, e.g. SearchFilter
    // That you may want to implement yourself.
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  /**
   * Handle changing a Document's image.
   *
   * @this cgdItemSheet
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
   * @this cgdItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewEffect(event, target) {
    const effect = this._getEffect(target);
    effect.sheet.render(true);
  }

  /**
   * Handles item deletion
   *
   * @this cgdItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteEffect(event, target) {
    const effect = this._getEffect(target);
    await effect.deleteDialog();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this cgdItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createEffect(event, target) {
    // Retrieve the configured document class for ActiveEffect
    const aeCls = getDocumentClass('ActiveEffect');
    // Prepare the document creation data by initializing it a default name.
    // As of v12, you can define custom Active Effect subtypes just like Item subtypes if you want
    const effectData = {
      name: aeCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.item,
      }),
    };
    // Loop through the dataset and add it to our effectData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(effectData, dataKey, value);
    }

    // Finally, create the embedded document!
    await aeCls.create(effectData, { parent: this.item });
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this cgdItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEffect(target);
    await effect.update({ disabled: !effect.disabled });
  }

  static async _createAutomation(event, target) {
    const automation = await BaseAutomation.createNew();
    if (!automation)
      return;
    return this.item.update({ [`system.automations.${automation._id}`]: automation });
  }
  static async _deleteAutomation(event, target) {
    const automationId = this._getAutomationId(target);
    const automation = this._getAutomation(automationId);

    const type = game.i18n.localize("CORIOLIS_TGD.Automation.Type.automation");
    const question = game.i18n.localize("AreYouSure");
    const warning = game.i18n.format("SIDEBAR.DeleteWarning", { type });
    const content = `<p><strong>${question}</strong> ${warning}</p>`;

    return foundry.applications.api.DialogV2.confirm(
      {
        content,
        yes: { callback: async () => await this.item.update({ [`system.automations.-=${automationId}`]: null }) },
        window: {
          icon: "fa-solid fa-trash",
          title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${automation.name}`
        }
      }
    );
  }

  static async _deleteFeature(event, target) {
    const featureId = this._getFeatureId(target);
    const feature = this.item.system.features[featureId];

    const type = game.i18n.localize("TYPES.Item.feature");
    const question = game.i18n.localize("AreYouSure");
    const warning = game.i18n.format("SIDEBAR.DeleteWarning", { type });
    const content = `<p><strong>${question}</strong> ${warning}</p>`;

    console.log(this.item);
    const effects = this.item.effects.filter(it => it.origin == featureId);
    const automations = [];
    for (const [automationId, automation] of Object.entries(this.item.system.automations)) {
      if (automation.origin == featureId)
        automations.push(automationId);
    }
    console.log(effects, automations);

    return foundry.applications.api.DialogV2.confirm(
      {
        content,
        yes: {
          callback: async () => {
            const changes = {
              [`system.features.-=${featureId}`]: null
            };
            for (const automationId of automations) {
              changes[`system.automations.-=${automationId}`] = null;
            }
            for (const effect of effects) {
              await effect.delete();
            }
            await this.item.update(changes);
          }
        },
        window: {
          icon: "fa-solid fa-trash",
          title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${feature.name}`
        }
      }
    );
  }

  static async _automationCommand(event, target) {
    const automation = this._getAutomation(target);
    if (typeof automation[target.dataset.command] === "function")
      return automation[target.dataset.command](event, target);

    console.error("Command not available for the automation.", { command: target.dataset.command, automation });
  }


  /** Helper Functions */

  /**
   * Fetches the row with the data for the rendered embedded document
   *
   * @param {HTMLElement} target  The element with the action
   * @returns {HTMLLIElement} The document's row
   */
  _getEffect(target) {
    const li = target.closest('.effect');
    return this.item.effects.get(li?.dataset?.effectId);
  }
  _getFeatureId(target) {
    const objectTarget = target.closest('[data-feature-id]');
    return objectTarget?.dataset?.featureId;
  }
  _getAutomationId(target) {
    const objectTarget = target.closest('[data-automation-id]');
    return objectTarget?.dataset?.automationId;
  }

  _getAutomation(target) {
    let automationId = target;
    if (typeof automationId != "string") {
      automationId = this._getAutomationId(target);
    }
    return this.item.system.automations[automationId];
  }

  /**
   *
   * DragDrop
   *
   */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call('dropItemSheetData', item, this, data);
    if (allowed === false) return;

    // Although you will find implmentations to all doc types here, it is important to keep 
    // in mind that only Active Effects are "valid" for items.
    // Actors have items, but items do not have actors.
    // Items in items is not implemented on Foudry per default. If you need an implementation with that,
    // try to search how other systems do. Basically they will use the drag and drop, but they will store
    // the UUID of the item.
    // Folders can only contain Actors or Items. So, fall on the cases above.
    // We left them here so you can have an idea of how that would work, if you want to do some kind of
    // implementation for that.
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Macro':
        return this._onDropMacro(event, data);
      case "Item":
        return this._onDropItem(event, data);
    }
  }

  /* -------------------------------------------- */

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
    if (!this.item.isOwner || !effect) return false;

    if (this.item.uuid === effect.parent?.uuid)
      return this._onEffectSort(event, effect);
    return aeCls.create(effect, { parent: this.item });
  }

  /**
   * Sorts an Active Effect based on its surrounding attributes
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  _onEffectSort(event, effect) {
    const effects = this.item.effects;
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = effects.get(dropTarget.dataset.effectId);

    // Don't sort on yourself
    if (effect.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      if (siblingId && siblingId !== effect.id)
        siblings.push(effects.get(el.dataset.effectId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.item.updateEmbeddedDocuments('ActiveEffect', updateData);
  }

  async _onDropMacro(event, data) {
    const automationId = this._getAutomationId(event.target);
    if (!automationId)
      return;
    const automation = this._getAutomation(automationId);
    if (automation.type !== RunMacroAutomation.TYPE) {
      ui.notifications.warn(game.i18n.localize("CORIOLIS_TGD.Automation.FIELDS.macro.error"));
      return;
    }

    await this.item.update({ [`system.automations.${automationId}.macro`]: data.uuid });
  }

  async _onDropItem(event, data) {
    const itemDropped = await fromUuid(data.uuid);
    const acceptsFeature = {
      "weapon": ["weapon", "vehicleWeapon"],
      "armor": ["armor"]
    };
    if (itemDropped.type == "feature" &&
      acceptsFeature[itemDropped.system.type].indexOf(this.item.type) >= 0)
      return this._onDropFeature(event, itemDropped);
  }

  async _onDropFeature(event, itemDropped) {
    const feature = new EmbeddedFeature({
      name: itemDropped.name,
      modifier: itemDropped.system.modifier,
      description: itemDropped.system.description
    });
    await this.item.update({ [`system.features.${feature._id}`]: feature });

    const aeCls = getDocumentClass('ActiveEffect');
    for (const effect of itemDropped.effects) {
      const newEffect = new ActiveEffect(foundry.utils.mergeObject(
        effect.toObject(),
        { origin: feature._id }));
      await aeCls.create(newEffect, { parent: this.item });
    }
    for (const [_, automation] of Object.entries(itemDropped.system.automations)) {
      const automationType = BaseAutomation.TYPES[automation.type];
      const newAutomation = new automationType(
        foundry.utils.mergeObject(
          automation.toObject(),
          { origin: feature._id }
        ));
      // const newAutomation = foundry.utils.deepClone(automation);
      // newAutomation.updateSource({ "origin": feature._id });
      // foundry.utils.setProperty(newAutomation, "origin", feature._id);
      console.log(newAutomation);

      await this.item.update({ [`system.automations.${newAutomation._id}`]: newAutomation });
      if (newAutomation.type == "runMacro" && newAutomation.name == "Configure Feature") {
        const configureAutomation = this.item.system.automations[newAutomation._id];
        configureAutomation.execute({});
      }
    }

    console.log(itemDropped, feature, this.item);
  }
}
