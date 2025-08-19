export function noteActivator() {
  Hooks.once("canvasReady", (canvas) => {
    const notesLayer = canvas.getLayerByEmbeddedName("Note");
    if (notesLayer) {
      notesLayer.options.controllableObjects = true;
    }
  });

  Hooks.on(`refreshNote`, (placeable) => {
    if (placeable.controlled) {
      placeable.controlIcon.border.visible = true;
    }
  });
}