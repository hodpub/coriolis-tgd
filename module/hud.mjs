import cgdRollDialog from "/systems/coriolis-tgd/module/applications/dialog/roller.mjs";
class CoriolisTGDPlayerHUD extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "coriolis-tgd-player-hud",
    tag: "aside",
    classes: ["cgd", "coriolis-hud"],
    position: { width: 130, height: "auto", left: 80, top: 160 },
    window: { title: "Player HUD", icon: "fas fa-user", minimizable: true, resizable: false },
    actions: {
      openSheet: CoriolisTGDPlayerHUD._openSheet,
      rollAttribute: CoriolisTGDPlayerHUD._rollAttribute,
      adjustValue: CoriolisTGDPlayerHUD._adjustValue
    }
  };

  static PARTS = { hud: { template: "systems/coriolis-tgd/templates/hud/player-hud.hbs" } };

  get title() { return game.user.character?.name || "Player HUD"; }

async _prepareContext(options) {
    const character = game.user?.character;
    if (!character) return { noCharacter: true };

    const attrsObj = character.system?.attributes ?? {};
    const attributes = Object.entries(attrsObj).map(([key, value]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      abbr: key.slice(0, 3).toUpperCase(),
      value
    }));

    const derived = character.system?.derivedAttributes ?? {};
    const resourceOrder = ["health", "hope", "heart"];
    const resources = resourceOrder.map(key => {
      const res = derived[key] ?? { value: 0, max: 0 };
      return {
        type: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: res.value,
        max: res.max
      };
    }).filter(r => r.max > 0);

    const supplyItem = character.getSupplyItem();
    const supply = { value: supplyItem?.system?.quantity ?? 0 };

    const avatar = { img: character.img || "/icons/svg/mystery-man.svg" };

    return { attributes, resources, supply, avatar };
  }

  // Action Handlers
  static _openSheet(event, target) {
    const actor = game.user.character;
    actor?.sheet.render(true);
  }

  static _rollAttribute(event, target) {
    const key = target.dataset.key;
    const actor = game.user.character;
    if (actor && key) {
      new cgdRollDialog({
        actor,
        requireAttribute: true,
        canChangeAttribute: false,
        attribute: key
      }).wait(event);
    }
  }

  static _adjustValue(event, target) {
    const type = target.dataset.type;
    const actor = game.user.character;
    if (!actor || !type) return;

    const delta = event.shiftKey ? 1 : -1;

    if (type === "supply") {
      const supplyItem = actor.getSupplyItem();
      if (supplyItem) {
        const current = supplyItem.system?.quantity ?? 0;
        const newValue = Math.max(0, current + delta);
        if (newValue !== current) supplyItem.update({ "system.quantity": newValue });
      }
    } else {
      const path = `system.derivedAttributes.${type}.value`;
      const current = foundry.utils.getProperty(actor, path) ?? 0;
      const max = actor.system.derivedAttributes?.[type]?.max ?? 0;
      let newValue = Math.clamp(current + delta, 0, max);
      if (newValue !== current) actor.update({ [path]: newValue });
    }
  }

}

let playerHUD = null;

function renderHUD() {
  if (!game.settings.get("coriolis-tgd", "enablePlayerHUD")) return;
  if (!game.user.character) return;

  if (!playerHUD) {
    playerHUD = new CoriolisTGDPlayerHUD();
    playerHUD.render(true);
  } else {
    playerHUD.render();
  }
}

function closeHUD() {
  if (playerHUD) {
    playerHUD.close();
    playerHUD = null;
  }
}

// Register setting
Hooks.once("init", () => {
  game.settings.register("coriolis-tgd", "enablePlayerHUD", {
    name: "Enable Player HUD",
    hint: "Show a floating quick-access HUD for attributes, resources, and supply.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
});

// Render on ready if enabled and character assigned
Hooks.once("ready", () => {
  renderHUD();
});

// Auto-open/close on character assignment
Hooks.on("updateUser", (user, diff) => {
  if (user.id === game.user.id && "character" in diff) {
    if (game.user.character) {
      renderHUD();
    } else {
      closeHUD();
    }
  }
});

// Refresh on data changes
Hooks.on("updateActor", (actor) => {
  if (actor.id === game.user.character?.id) playerHUD?.render();
});

Hooks.on("updateItem", (item) => {
  const char = game.user.character;
  if (char && item.parent?.id === char.id && item.id === char.getSupplyItem()?.id) {
    playerHUD?.render();
  }
});

// Close on logout or character removal
Hooks.on("closeCoriolisTGDPlayerHUD", () => closeHUD());