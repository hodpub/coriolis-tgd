export class cgdChatMessage extends foundry.documents.ChatMessage {
  async renderHTML({ canDelete, canClose = false, ...rest } = {}) {
    let html = await super.renderHTML({ canDelete, canClose, rest });
    if (!this.rolls || !this.rolls.length)
      return html;

    let actor = game.actors.get(this.speaker.actor);
    if (game.user.isGM || actor?.isOwner || (this.author.id === game.user.id)) {
      return html;
    }

    html.querySelector(".dice-buttons")?.remove();
    return html;
  }
}