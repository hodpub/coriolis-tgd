export function showAutomationsDialog(automations, title, { content, icon = 'fa-solid fa-play' } = {}) {
  let btnIndex = 0;
  const buttons = [
    ...Object.keys(automations).map((automationId) => {
      const automation = automations[automationId];
      if (!automation.showAsSelection)
        return;

      const btn = Object.assign({
        label: automation.name,
        icon: icon,
        action: automationId,
        callback: () => automations[automationId],
      });
      btnIndex++;
      return btn;
    })
  ].filter(it => it !== undefined);

  return foundry.applications.api.DialogV2.wait({
    content,
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

export function prepareAutomationCategories(automations) {
  const categories = {
    default: {
      label: game.i18n.localize('CORIOLIS_TGD.Automation.Category.Default'),
      automations: [],
    },
    talents: {
      label: game.i18n.localize('CORIOLIS_TGD.Automation.Category.Talent'),
      automations: [],
    },
    combat: {
      label: game.i18n.localize('CORIOLIS_TGD.Automation.Category.Combat'),
      automations: [],
    },
  };
  if (automations) {
    // Iterate over automations, classifying them into categories
    for (const a of automations) {
      switch (a.type) {
        case "rollArmorBlight":
        case "rollArmorDamage":
        case "rollAttack":
          categories.combat.automations.push(a);
        break;
        case "rollAttribute":
          categories.talents.automations.push(a);
        break;
        default:
          categories.default.automations.push(a);
      }
    }
  
    // Sort each category
    for (const c of Object.values(categories)) {
      c.automations.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }
  }
  return categories;
}
