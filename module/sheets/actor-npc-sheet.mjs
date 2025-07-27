import { cgdActorSheet } from "./actor-sheet.mjs";

export class cgdActorNpcSheet extends cgdActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ['cgd', 'actor', 'simple'],
    position: {
      width: 400,
      height: 800,
    }
  };
}