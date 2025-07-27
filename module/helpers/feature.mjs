export function createFeatureTagsAndCheckBulky(features) {
  const featureTags = ["<div class=\"tagList\">"];
  let bulky = false;
  for (const [_, feature] of Object.entries(features)) {
    featureTags.push(`<label data-tooltip-html='${feature.description}'>${feature.name}</label>`)
    bulky = bulky || feature.name == "Bulky";
  }
  featureTags.push("</div>");
  const html = featureTags.join("");
  return [html, bulky];
}