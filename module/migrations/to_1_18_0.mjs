const pattern = /system\.derivedAttributes\.(.*?)\.max\.bonus/gm;
const subst = `system.derivedAttributes.$1.bonus`;

export async function migrateTo_1_18_0() {
  console.log("=> Migration to 1.18.0 Starting");
  console.log("=> Migration to 1.18.0: ITEMS");

  await updateEffect(game.items);

  console.log("=> Migration to 1.18.0: ACTORS' ITEMS");

  for (let actor of game.actors) {
    await updateEffect(actor.items, actor.name);
  }

  console.log("=> Migration to 1.18.0 Finished");
}

async function updateEffect(items, parent) {
  for (let item of items) {
    let itemChanged = false;
    for (let effect of item.effects) {
      let effectChanged = false;
      const changes = effect.changes.map(c => {
        const originalKey = c.key;
        c.key = c.key.replace(pattern, subst);
        effectChanged = effectChanged || originalKey != c.key;
        return c;
      });
      if (effectChanged)
        await effect.update({ "changes": changes });

      itemChanged = itemChanged || effectChanged;
    }

    if (itemChanged)
      console.log(`==> Migration to 1.18.0: Item migrated: ${item.name} [${parent}] (${item.uuid})`);
  }
}