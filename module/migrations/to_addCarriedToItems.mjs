export async function migrateToAddCarriedToItems() {
  console.log("=> Migration addCarriedToItems Starting");
  console.log("=> Migration addCarriedToItems: Setting carried=true on existing items");

  const types = ["equipment", "weapon", "armor"];

  for (let actor of game.actors) {
    for (let item of actor.items) {
      if (types.includes(item.type) && item.system.carried === undefined) {
        await item.update({ "system.carried": true });
        console.log(`==> Migration addCarriedToItems: ${item.name} on ${actor.name} set to carried`);
      }
    }
  }

  console.log("=> Migration addCarriedToItems Finished");
}
