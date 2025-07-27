export function createListAndChoices(obj, name, constants, label, { plural = undefined } = {}) {
  plural ??= `${name}s`;
  obj[plural] = Object.keys(constants);
  obj[`${name}Choices`] = Object.assign(
    ...Object.keys(constants).map(it => ({
      [it]: `${label}.${it}.label`
    }))
  );
}