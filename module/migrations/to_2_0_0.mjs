export async function migrateTo_2_0_0() {
  console.log("=> Migration 2.0.0 Starting");
  console.log("=> Migration 2.0.0: Setting carried=true on existing items");

  const types = ["equipment", "weapon", "armor"];

  for (let actor of game.actors) {
    for (let item of actor.items) {
      if (types.includes(item.type) && item.system.carried === undefined) {
        await item.update({ "system.carried": true });
        console.debug(`==> Migration 2.0.0: ${item.name} on ${actor.name} set to carried`);
      }
    }
  }
  console.log("=> Migration 2.0.0 Finished");
}
