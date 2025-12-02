export async function migrateTo_1_12_0() {
  for (let item of game.items.filter(it => it.type === "armor")) {
    await item.update({ "system.weight": 5 });
  }

  for (let actor of game.actors.contents) {
    for (let item of actor.items.filter(it => it.type === "armor")) {
      await item.update({ "system.weight": 5 });
    }
  }
}