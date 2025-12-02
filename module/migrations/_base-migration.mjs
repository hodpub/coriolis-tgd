import * as migrations from "./_migrations.mjs";

const migrationList = {
  "1.12.0": migrations.migrateTo_1_12_0,
}

export function registerMigrationSettings() {
  game.settings.register("coriolis-tgd", "systemMigrationVersion", {
    config: false,
    scope: "world",
    type: String,
    default: ""
  });
}

export async function migrate() {
  if (!game.user.isGM)
    return;

  const currentVersion = game.settings.get("coriolis-tgd", "systemMigrationVersion");
  console.log("Coriolis TGD Data CurrentVersion", currentVersion);

  let latestMigration = undefined;
  for (const key of Object.keys(migrationList)) {
    if (currentVersion && !foundry.utils.isNewerVersion(key, currentVersion))
      continue;

    ui.notifications.warn(`Migrating your data to version ${key}. Please, wait until it finishes.`);
    await migrationList[key]();
    ui.notifications.info(`Data migrated to version ${key}.`);
    latestMigration = key;
  }
  if (latestMigration)
    game.settings.set("coriolis-tgd", "systemMigrationVersion", latestMigration);
}
