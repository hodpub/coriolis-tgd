export function registerStatusEffects() {
  const conditionPath = "systems/coriolis-tgd/assets/icons/";
  CONFIG.statusEffects = [
    {
      id: "dead",
      img: "icons/svg/skull.svg",
      name: "EFFECT.StatusDead"
    },
    {
      id:"exhausted",
      name:"CORIOLIS_TGD.Actor.base.FIELDS.conditions.exhausted.label",
      img: `${conditionPath}exhausted.svg`,
      changes: [
        {
          key: "system.attributesBonus.strength",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -2
        }
      ]
    },
    {
      id:"dazed",
      name:"CORIOLIS_TGD.Actor.base.FIELDS.conditions.dazed.label",
      img: `${conditionPath}dazed.svg`,
      changes: [
        {
          key: "system.attributesBonus.agility",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -2
        }
      ]
    },
    {
      id:"confused",
      name:"CORIOLIS_TGD.Actor.base.FIELDS.conditions.confused.label",
      img: `${conditionPath}confused.svg`,
      changes: [
        {
          key: "system.attributesBonus.logic",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -2
        }
      ]
    },
    {
      id:"distracted",
      name:"CORIOLIS_TGD.Actor.base.FIELDS.conditions.distracted.label",
      img: `${conditionPath}distracted.svg`,
      changes: [
        {
          key: "system.attributesBonus.perception",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -2
        }
      ]
    },
    {
      id:"shaken",
      name:"CORIOLIS_TGD.Actor.base.FIELDS.conditions.shaken.label",
      img: `${conditionPath}shaken.svg`,
      changes: [
        {
          key: "system.attributesBonus.insight",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -2
        }
      ]
    },
    {
      id:"disheartened",
      name:"CORIOLIS_TGD.Actor.base.FIELDS.conditions.disheartened.label",
      img: `${conditionPath}disheartened.svg`,
      changes: [
        {
          key: "system.attributesBonus.empathy",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -2
        }
      ]
    }
  ]
}