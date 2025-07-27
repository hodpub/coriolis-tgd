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