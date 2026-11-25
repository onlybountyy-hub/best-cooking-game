// Warung Kilat — main loop and game state. A busy Indonesian street-food
// stall: take orders, chop, cook, assemble on a plate, serve before the
// ticket timer runs out. Keyboard + mouse, no network, no build step.
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { render } from './render.js';
import { mulberry32, pick } from './random.js';
import {
  INGREDIENTS, RECIPES, RECIPE_LIST, canChop, canCook,
  chopResult, cookResult, recipeForPlate, plateStillPossible,
} from './recipes.js';
import { MAX_ORDERS, makeOrder, spawnInterval, orderLifetime, resetOrderIds } from './orders.js';
import { VIEW_W, VIEW_H, STATIONS, nearestStation, collide, distanceToRect } from './world.js';
import { applyScene } from './scenes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const rng = mulberry32(20261125);

const DAY_LENGTH = 150;
const CHEF_SPEED = 270;
const CHOP_TIME = 0.9;
const COOK_TIME = 4;

function freshState() {
  return {
    screen: 'menu',
    day: 1,
    dayLength: DAY_LENGTH,
    dayTime: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    stars: 0,
    orders: [],
    nextSpawn: 2,
    chef: { x: 640, y: 480, r: 22, moving: false, chopT: 0, chopTotal: CHOP_TIME },
    hands: [null, null],
    burners: [
      { item: null, t: 0, dur: COOK_TIME },
      { item: null, t: 0, dur: COOK_TIME },
    ],
    plate: [],
    plateRecipe: null,
    platePossible: true,
    readyPlates: [],
    nearStation: null,
    prompt: '',
    toasts: [],
    pendingInteract: null,
  };
}

const state = freshState();

function toast(text, color = '#ffe9a8') {
  state.toasts.push({ text, color, t: 0, life: 1.8 });
  if (state.toasts.length > 4) state.toasts.shift();
}

function handFreeSlot() {
  if (!state.hands[0]) return 0;
  if (!state.hands[1]) return 1;
  return -1;
}

function handHas(predicate) {
  for (let i = 0; i < 2; i += 1) {
    const item = state.hands[i];
    if (item && predicate(item)) return i;
  }
  return -1;
}

function takeHandItem(index) {
  const item = state.hands[index];
  state.hands[index] = null;
  return item;
}

function refreshPlate() {
  state.plateRecipe = recipeForPlate(state.plate);
  state.platePossible = plateStillPossible(state.plate);
}

function startDay(day) {
  resetOrderIds();
  const keepScore = state.score;
  const fresh = freshState();
  fresh.day = day;
  fresh.score = keepScore;
  fresh.screen = 'playing';
  Object.assign(state, fresh);
}

function endDay() {
  state.screen = 'dayend';
  state.stars = state.served >= 13 ? 3 : state.served >= 10 ? 2 : state.served >= 7 ? 1 : 0;
  audio.sizzleStop();
}

function spawnOrder() {
  const dish = pick(rng, RECIPE_LIST);
  const life = orderLifetime(state.dayTime);
  state.orders.push(makeOrder(rng, dish.id, life, state.day));
  audio.bell();
}

function servePlate(dishId) {
  const at = state.orders.findIndex((o) => o.dish === dishId);
  if (at === -1) {
    audio.denied();
    toast('Tidak ada pesanan itu!', '#ff8a7a');
    return false;
  }
  const order = state.orders[at];
  state.orders.splice(at, 1);
  const recipe = RECIPES[dishId];
  const timeBonus = Math.round(100 * (order.timeLeft / order.timeTotal));
  const gained = Math.round((recipe.price + timeBonus) * (1 + state.combo * 0.1));
  state.score += gained;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  audio.serve();
  toast(`+${gained}  ${recipe.name} tersaji!`, '#7ec850');
  return true;
}

function interact() {
  const station = state.nearStation;
  if (!station) return;
  const chef = state.chef;
  if (chef.chopT > 0) return;

  if (station.kind === 'bin') {
    const slot = handFreeSlot();
    if (slot === -1) {
      audio.denied();
      toast('Tangan penuh!', '#ff8a7a');
      return;
    }
    state.hands[slot] = station.ingredient;
    audio.pickup();
    return;
  }

  if (station.kind === 'talenan') {
    const at = handHas((item) => !item.startsWith('plate:') && canChop(item));
    if (at === -1) {
      const any = handHas((item) => !item.startsWith('plate:'));
      audio.denied();
      toast(any === -1 ? 'Bawa bahan mentah ke talenan' : 'Bahan ini tidak perlu dipotong', '#ff8a7a');
      return;
    }
    chef.chopT = CHOP_TIME;
    chef.chopTotal = CHOP_TIME;
    chef.chopItem = state.hands[at];
    chef.chopSlot = at;
    audio.chop();
    return;
  }

  if (station.kind === 'kompor') {
    // Take a finished dish off a burner first.
    const doneAt = state.burners.findIndex((b) => b.item && b.t >= b.dur);
    const freeSlot = handFreeSlot();
    if (doneAt !== -1 && freeSlot !== -1) {
      const cooked = cookResult(state.burners[doneAt].item);
      state.burners[doneAt] = { item: null, t: 0, dur: COOK_TIME };
      state.hands[freeSlot] = cooked;
      audio.pickup();
      return;
    }
    const cookAt = handHas((item) => !item.startsWith('plate:') && canCook(item));
    if (cookAt !== -1) {
      const freeBurner = state.burners.findIndex((b) => !b.item);
      if (freeBurner === -1) {
        audio.denied();
        toast('Kompor penuh!', '#ff8a7a');
        return;
      }
      state.burners[freeBurner] = { item: takeHandItem(cookAt), t: 0, dur: COOK_TIME };
      audio.place();
      audio.sizzleStart();
      return;
    }
    audio.denied();
    toast(state.burners.some((b) => b.item) ? 'Sedang memasak…' : 'Bawa bahan mentah ke kompor', '#ff8a7a');
    return;
  }

  if (station.kind === 'peracik') {
    const itemAt = handHas((item) => !item.startsWith('plate:'));
    if (itemAt !== -1) {
      const item = takeHandItem(itemAt);
      state.plate.push(item);
      refreshPlate();
      audio.place();
      if (state.plateRecipe) audio.ding();
      return;
    }
    if (state.plateRecipe && handFreeSlot() !== -1) {
      const slot = handFreeSlot();
      state.hands[slot] = `plate:${state.plateRecipe.id}`;
      state.plate = [];
      refreshPlate();
      audio.pickup();
      return;
    }
    audio.denied();
    toast(state.plate.length === 0 ? 'Piring kosong — taruh bahan dulu' : 'Piring belum lengkap (Q: kosongkan)', '#ff8a7a');
    return;
  }

  if (station.kind === 'saji') {
    const plateAt = handHas((item) => item.startsWith('plate:'));
    if (plateAt !== -1) {
      const dishId = state.hands[plateAt].slice(6);
      if (servePlate(dishId)) {
        takeHandItem(plateAt);
      }
      return;
    }
    audio.denied();
    toast('Bawa piring siap saji ke sini', '#ff8a7a');
    return;
  }

  if (station.kind === 'sampah') {
    const at = handHas(() => true);
    if (at === -1) {
      audio.denied();
      toast('Tangan kosong', '#ff8a7a');
      return;
    }
    takeHandItem(at);
    audio.clear();
    toast('Dibuang', '#ccc');
  }
}

function computePrompt() {
  const station = state.nearStation;
  if (!station || state.screen !== 'playing') {
    state.prompt = '';
    return;
  }
  const handsFull = handFreeSlot() === -1;
  if (station.kind === 'bin') {
    const ing = INGREDIENTS[station.ingredient];
    state.prompt = handsFull ? 'Tangan penuh!' : `E: Ambil ${ing.name}`;
  } else if (station.kind === 'talenan') {
    const at = handHas((item) => !item.startsWith('plate:') && canChop(item));
    state.prompt = at !== -1 ? `E: Potong ${INGREDIENTS[state.hands[at]].name}` : 'Talenan — bawa bahan untuk dipotong';
  } else if (station.kind === 'kompor') {
    const done = state.burners.some((b) => b.item && b.t >= b.dur);
    const cookable = handHas((item) => !item.startsWith('plate:') && canCook(item));
    if (done && !handsFull) state.prompt = 'E: Angkat masakan matang';
    else if (cookable !== -1) state.prompt = `E: Masak ${INGREDIENTS[state.hands[cookable]].name}`;
    else state.prompt = 'Kompor — masak bahan di wajan';
  } else if (station.kind === 'peracik') {
    const itemAt = handHas((item) => !item.startsWith('plate:'));
    if (itemAt !== -1) state.prompt = `E: Taruh ${INGREDIENTS[state.hands[itemAt]].name} di piring`;
    else if (state.plateRecipe) state.prompt = `E: Ambil piring ${state.plateRecipe.name}`;
    else state.prompt = 'Meja peracik — rakit hidangan di piring';
  } else if (station.kind === 'saji') {
    const plateAt = handHas((item) => item.startsWith('plate:'));
    state.prompt = plateAt !== -1 ? `E: Sajikan ${RECIPES[state.hands[plateAt].slice(6)].name}` : 'Jendela saji — antar pesanan di sini';
  } else if (station.kind === 'sampah') {
    state.prompt = 'E: Buang bahan di tangan';
  }
}

function update(dt) {
  // Toasts always age.
  state.toasts.forEach((t) => { t.t += dt; });
  state.toasts = state.toasts.filter((t) => t.t < t.life);

  if (state.screen !== 'playing') return;

  state.dayTime += dt;
  if (state.dayTime >= state.dayLength) {
    endDay();
    return;
  }

  // Order timers.
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      state.orders.splice(i, 1);
      state.failed += 1;
      state.combo = 0;
      audio.fail();
      toast(`Pesanan ${order.name} gagal — pelanggan kecewa!`, '#ff8a7a');
    }
  }

  // Spawn new tickets.
  state.nextSpawn -= dt;
  if (state.nextSpawn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder();
    state.nextSpawn = spawnInterval(state.dayTime);
  }

  // Burners cook.
  let anyCooking = false;
  state.burners.forEach((b) => {
    if (b.item && b.t < b.dur) {
      b.t += dt;
      anyCooking = true;
      if (b.t >= b.dur) audio.ding();
    }
  });
  if (anyCooking) audio.sizzleStart();
  else audio.sizzleStop();

  // Chopping channel.
  const chef = state.chef;
  if (chef.chopT > 0) {
    chef.chopT -= dt;
    if (chef.chopT <= 0) {
      chef.chopT = 0;
      const done = chopResult(chef.chopItem);
      if (done) state.hands[chef.chopSlot] = done;
      audio.ding();
    }
    return;
  }

  // Movement: keys win over click-to-move.
  const vec = input.moveVector();
  chef.moving = false;
  if (vec.x !== 0 || vec.y !== 0) {
    input.moveTarget = null;
    state.pendingInteract = null;
    chef.x += vec.x * CHEF_SPEED * dt;
    chef.y += vec.y * CHEF_SPEED * dt;
    chef.moving = true;
  } else if (input.moveTarget) {
    const dx = input.moveTarget.x - chef.x;
    const dy = input.moveTarget.y - chef.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) {
      input.moveTarget = null;
      if (state.pendingInteract) {
        state.pendingInteract = null;
        interact();
      }
    } else {
      chef.x += (dx / dist) * CHEF_SPEED * dt;
      chef.y += (dy / dist) * CHEF_SPEED * dt;
      chef.moving = true;
    }
  }
  collide(chef);

  state.nearStation = nearestStation(chef.x, chef.y);
  computePrompt();

  // Click handling: click a station to walk to it (and interact on arrival),
  // click open floor to walk there.
  const click = input.consumeClick();
  if (click) {
    audio.unlock();
    let targetStation = null;
    let bestD = Infinity;
    for (const s of [STATIONS.talenan, STATIONS.kompor, STATIONS.peracik, STATIONS.saji, STATIONS.sampah, ...STATIONS.bins]) {
      if (click.x >= s.x && click.x <= s.x + s.w && click.y >= s.y && click.y <= s.y + s.h) {
        targetStation = s;
        break;
      }
      const d = distanceToRect(click.x, click.y, s);
      if (d < bestD) bestD = d;
    }
    if (targetStation) {
      if (state.nearStation === targetStation) {
        interact();
      } else {
        // Walk to the closest point just outside the station.
        const cx = Math.max(targetStation.x, Math.min(chef.x, targetStation.x + targetStation.w));
        const cy = Math.max(targetStation.y, Math.min(chef.y, targetStation.y + targetStation.h));
        let dx = chef.x - cx;
        let dy = chef.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        input.moveTarget = { x: cx + dx * (chef.r + 10), y: cy + dy * (chef.r + 10) };
        state.pendingInteract = targetStation;
      }
    } else {
      input.moveTarget = { x: click.x, y: click.y };
      state.pendingInteract = null;
    }
  }

  if (input.consumeAction()) {
    audio.unlock();
    interact();
  }
  if (input.consumeKey('q')) {
    if (state.nearStation === STATIONS.peracik && state.plate.length > 0) {
      state.plate = [];
      refreshPlate();
      audio.clear();
      toast('Piring dikosongkan', '#ccc');
    }
  }
}

function handleMetaKeys() {
  if (input.consumeKey('enter')) {
    audio.unlock();
    audio.startMusic();
    if (state.screen === 'menu') {
      startDay(1);
    } else if (state.screen === 'dayend') {
      startDay(state.day + 1);
    }
  }
  if (input.consumeKey('r') && state.screen === 'dayend') {
    startDay(state.day);
  }
  if (input.consumeKey('m')) {
    const on = audio.toggleMusic();
    toast(on ? 'Musik nyala' : 'Musik mati', '#ccc');
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleMetaKeys();
  update(dt);
  render(ctx, state);
  input.endFrame();
  requestAnimationFrame(frame);
}

// Screenshot scenes jump straight into a fixed playing state.
const params = new URLSearchParams(window.location.search);
const scene = params.get('scene');
if (scene) {
  applyScene(state, scene);
  refreshPlate();
} else {
  refreshPlate();
}

canvas.width = VIEW_W;
canvas.height = VIEW_H;
requestAnimationFrame(frame);

// Test hook for the headless play-test (not part of gameplay).
window.__warung = { state, input, interact, startDay, servePlate };
