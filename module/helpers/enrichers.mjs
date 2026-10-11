const AUTOMATION_ENRICHER_PATTERN = /@auto\[(.+?)(?:\s(.+?))?\](?:\{([^{}]+)\})?/gi;
const AUTOMATION_LINK_SELECTOR = "a.roll-automation";

export function registerEnrichers() {
  CONFIG.TextEditor.enrichers.push({
    pattern: AUTOMATION_ENRICHER_PATTERN,
    enricher: enrichRollAutomation,
  });
}

export function registerEnricherActions() {
  document.addEventListener("click", onAutomationClick);
}

/** @param {RegExpMatchArray} match */
async function enrichRollAutomation(match) {
  const itemId = match[1];
  const automationId = match[2];
  const item = await fromUuid(itemId);
  const label = match[3]?.trim() || item.name;
  const link = document.createElement("a");

  link.classList.add("content-link", "roll-automation");
  link.dataset.itemId = itemId;
  link.dataset.automationId = automationId;
  link.setAttribute("role", "button");
  link.setAttribute("aria-label", label);

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-dice");
  link.append(icon, document.createTextNode(label));
  return link;
}

/** @param {MouseEvent} event */
async function onAutomationClick(event) {
  const link = event.target.closest?.(AUTOMATION_LINK_SELECTOR);
  if (!link) return;

  event.preventDefault();
  event.stopPropagation();
  const item = await fromUuid(link.dataset.itemId);
  if (!item)
    return ui.notifications.error("Item not found");

  item.automate(event, link.dataset.automationId);
}
