export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper({
    dots,
    getItemAutomations,
    inc,
    percentage
  })

  Handlebars.registerHelper('get', function (obj, property) {
    return obj[property];
  });

  Handlebars.registerHelper('has', function (obj, property) {
    return obj.has(property);
  });
}

export function dots(n, max, options) {
  let { divCss = "", imgCss = "", group = 0, groupCss = "", field = "" } = options.hash;
  let accum = `<div class="dots ${divCss}">`;
  for (let i = 1; i <= max; ++i) {
    if (group && i % group == 1) {
      accum += `<div class="${groupCss}">`
    }
    let action = "";
    let imgSource = i <= n ? "filled" : "empty";
    if (field) {
      const value = i == 1 && n == 1 ? 0 : i;
      action = `data-action="setValue" data-field="${field}" data-value="${value}" data-tooltip="${game.i18n.format("CORIOLIS_TGD.Actor.base.FIELDS.setValue", { value })}"`
      imgCss += " rollable";
    }
    accum += `<img class="${imgCss}" src="systems/coriolis-tgd/assets/frames/dot-${imgSource}.svg" data-action="setValue" ${action}>`;
    if (group && i % group == 0) {
      accum += `</div>`
    }
  }
  accum += "</div>"
  return new Handlebars.SafeString(accum);
}

export function getItemAutomations(automations, current) {
  const selectOptions = {};

  for (const automationId of Object.keys(automations)) {
    if (automationId == current)
      continue;

    selectOptions[automationId] = `${automations[automationId].name}`;
  }
  return selectOptions;
}

export function inc(number) {
  return number + 1;
}

export function percentage(current, max) {
  if (current == 0)
    return 0;
  if (max == 0)
    return 100;

  return Math.min(100, Math.round(current / max * 100));
}