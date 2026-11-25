// Keyboard + mouse input. Movement keys are read every frame; action
// keys (E / Space) and clicks are consumed as one-shot events.
export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  const input = {
    keys,
    pressed,
    mouseX: 0,
    mouseY: 0,
    clickX: null,
    clickY: null,
    clicked: false,
    moveTarget: null,
  };

  function toGameCoords(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(event.key.toLowerCase());
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });
  canvas.addEventListener('pointerdown', (event) => {
    const pos = toGameCoords(event);
    input.mouseX = pos.x;
    input.mouseY = pos.y;
    input.clickX = pos.x;
    input.clickY = pos.y;
    input.clicked = true;
  });
  canvas.addEventListener('pointermove', (event) => {
    const pos = toGameCoords(event);
    input.mouseX = pos.x;
    input.mouseY = pos.y;
  });

  // Direction from held movement keys, normalised.
  input.moveVector = function moveVector() {
    let x = 0;
    let y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  };

  input.consumeAction = function consumeAction() {
    if (pressed.has('e') || pressed.has(' ')) {
      pressed.delete('e');
      pressed.delete(' ');
      return true;
    }
    return false;
  };

  input.consumeKey = function consumeKey(key) {
    if (pressed.has(key)) {
      pressed.delete(key);
      return true;
    }
    return false;
  };

  input.consumeClick = function consumeClick() {
    if (input.clicked) {
      input.clicked = false;
      const at = { x: input.clickX, y: input.clickY };
      input.clickX = null;
      input.clickY = null;
      return at;
    }
    return null;
  };

  // One-shot presses are cleared at the end of each frame.
  input.endFrame = function endFrame() {
    pressed.clear();
    input.clicked = false;
    input.clickX = null;
    input.clickY = null;
  };

  return input;
}
