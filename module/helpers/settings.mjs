import { CORIOLIS_TGD } from "../config/config.mjs";

const settings = {
  configuredYzeCombat: {
    config: false,
    scope: 'world',
    type: Boolean,
    default: false,
  },

};

export function registerSettings() {
  for (let k of Object.keys(settings)) {
    game.settings.register(CORIOLIS_TGD.ID, k, settings[k]);
  }
}

export async function registerYearZeroCombatSettings(yzec) {
  if (game.settings.get(CORIOLIS_TGD.ID, 'configuredYzeCombat')) return;
  await yzec.register({
    actorSpeedAttribute: 'system.ferocity',
    duplicateCombatantOnCombatStart: true,
    initAutoDraw: true,
    initResetDeckOnCombatStart: true,
    slowAndFastActions: false,
    singleAction: true,
    resetEachRound: true
  });
  game.settings.set(CORIOLIS_TGD.ID, 'configuredYzeCombat', true)
} 