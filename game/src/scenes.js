// Deterministic screenshot scenes: fixed game states so each screenshot
// in shots.json is a reproducible render of the real game. The game reads
// ?scene=<name> on load and jumps straight into that state.
export function applyScene(state, name) {
  state.screen = 'playing';
  state.day = 1;
  state.dayLength = 150;
  state.dayTime = 12;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.served = 0;
  state.failed = 0;
  state.nextSpawn = 8;
  state.orders = [];
  state.hands = [null, null];
  state.burners = [
    { item: null, t: 0, dur: 4 },
    { item: null, t: 0, dur: 4 },
  ];
  state.plate = [];
  state.readyPlates = [];
  state.toasts = [];
  state.chef.x = 640;
  state.chef.y = 480;
  state.chef.chopT = 0;

  function order(id, dish, name, needs, timeLeft, timeTotal) {
    return { id, dish, name, needs, timeLeft, timeTotal, day: 1, born: 0 };
  }

  if (name === 'cover') {
    // The cover: kitchen + order board + first orders + a dish mid-assembly
    // + ingredients on the counter + a ready plate at the window.
    state.dayTime = 12;
    state.score = 180;
    state.combo = 2;
    state.bestCombo = 2;
    state.served = 2;
    state.orders = [
      order(1, 'nasgor', 'Nasi Goreng', ['nasiMatang', 'ayamGoreng', 'telurGoreng', 'kecap'], 55, 70),
      order(2, 'miegor', 'Mie Goreng', ['mieMatang', 'sayurPotong', 'ayamGoreng', 'kecap'], 40, 70),
    ];
    state.chef.x = 330;
    state.chef.y = 430;
    state.hands = ['ayamPotong', null];
    state.burners = [
      { item: 'mie', t: 2.4, dur: 4 },
      { item: 'telur', t: 4, dur: 4 },
    ];
    state.plate = ['nasiMatang', 'ayamGoreng'];
    state.readyPlates = ['esteh'];
  } else if (name === 'cooking') {
    // One dish being assembled at the meja peracik, kecap in hand.
    state.dayTime = 30;
    state.score = 320;
    state.combo = 3;
    state.bestCombo = 3;
    state.served = 3;
    state.orders = [
      order(1, 'nasgor', 'Nasi Goreng', ['nasiMatang', 'ayamGoreng', 'telurGoreng', 'kecap'], 30, 70),
    ];
    state.chef.x = 930;
    state.chef.y = 460;
    state.hands = ['kecap', null];
    state.burners = [{ item: 'nasi', t: 1.5, dur: 4 }, { item: null, t: 0, dur: 4 }];
    state.plate = ['nasiMatang', 'ayamGoreng', 'telurGoreng'];
  } else if (name === 'rush') {
    // Service rush: four tickets, one timer nearly out, both burners busy.
    state.dayTime = 95;
    state.score = 640;
    state.combo = 5;
    state.bestCombo = 6;
    state.served = 7;
    state.failed = 1;
    state.orders = [
      order(1, 'nasgor', 'Nasi Goreng', ['nasiMatang', 'ayamGoreng', 'telurGoreng', 'kecap'], 8, 70),
      order(2, 'miegor', 'Mie Goreng', ['mieMatang', 'sayurPotong', 'ayamGoreng', 'kecap'], 14, 70),
      order(3, 'sate', 'Sate Ayam', ['ayamGoreng', 'cabaiPotong', 'kecap'], 22, 70),
      order(4, 'esteh', 'Es Teh', ['es', 'teh'], 35, 70),
    ];
    state.chef.x = 565;
    state.chef.y = 480;
    state.hands = ['ayamGoreng', null];
    state.burners = [
      { item: 'ayamPotong', t: 3.1, dur: 4 },
      { item: 'mie', t: 1.2, dur: 4 },
    ];
    state.plate = ['mieMatang', 'sayurPotong'];
  } else if (name === 'serve') {
    // A finished plate in hand at the serving window, another ready plate.
    state.dayTime = 60;
    state.score = 420;
    state.combo = 3;
    state.bestCombo = 4;
    state.served = 4;
    state.orders = [
      order(1, 'nasgor', 'Nasi Goreng', ['nasiMatang', 'ayamGoreng', 'telurGoreng', 'kecap'], 20, 70),
      order(2, 'sate', 'Sate Ayam', ['ayamGoreng', 'cabaiPotong', 'kecap'], 45, 70),
    ];
    state.chef.x = 1060;
    state.chef.y = 470;
    state.hands = ['plate:nasgor', null];
    state.readyPlates = ['miegor'];
  }
  return state;
}
