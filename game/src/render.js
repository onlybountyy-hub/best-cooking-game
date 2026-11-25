// All canvas drawing for Warung Kilat: warm warung palette, vector food,
// the order board, stations, chef, plates and overlays. No image assets.
import { VIEW_W, VIEW_H, BOARD_H, STATIONS, burnerRects } from './world.js';
import { INGREDIENTS, RECIPES } from './recipes.js';
import { timerColor, timerFraction } from './orders.js';

const WOOD = '#8a5a2e';
const WOOD_DARK = '#6b4423';
const COUNTER_TOP = '#c98f4e';
const WALL = '#f7e3bd';
const FLOOR_A = '#a9743f';
const FLOOR_B = '#9c6836';

export function drawIngredientIcon(ctx, id, x, y, size) {
  const ing = INGREDIENTS[id];
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (!ing) {
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = ing.dark;
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  if (id === 'nasi' || id === 'nasiMatang') {
    // A mound of rice.
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ing.dark;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(i * r * 0.3, -r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie' || id === 'mieMatang') {
    // Noodle swirls.
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = Math.max(1.5, size * 0.08);
    for (let k = 0; k < 3; k += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.25 + k * 0.22), 0.4, Math.PI * 1.7);
      ctx.stroke();
    }
  } else if (id === 'ayam' || id === 'ayamPotong') {
    // Drumstick.
    ctx.rotate(-0.6);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.8, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(r * 0.75, -r * 0.35, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'ayamGoreng') {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r * 0.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#96571a';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.1, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.2, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur' || id === 'telurGoreng') {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.62, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (id === 'telurGoreng') {
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(0, -r * 0.15, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'sayur' || id === 'sayurPotong') {
    // Leafy greens.
    ctx.fillStyle = ing.color;
    for (let k = -1; k <= 1; k += 1) {
      ctx.beginPath();
      ctx.ellipse(k * r * 0.45, -k * r * 0.15, r * 0.5, r * 0.28, k * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (id === 'cabai' || id === 'cabaiPotong') {
    ctx.rotate(0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#4c8a2e';
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.beginPath();
    ctx.moveTo(r * 0.8, 0);
    ctx.quadraticCurveTo(r * 1.2, -r * 0.3, r * 1.05, -r * 0.55);
    ctx.stroke();
  } else if (id === 'kecap') {
    // Little sauce bottle.
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(-r * 0.35, -r * 0.5, r * 0.7, r * 1.1);
    ctx.fillStyle = ing.color;
    ctx.fillRect(-r * 0.45, -r * 0.2, r * 0.9, r * 0.75);
    ctx.fillStyle = '#e8d8b0';
    ctx.fillRect(-r * 0.3, -r * 0.85, r * 0.6, r * 0.4);
  } else if (id === 'es') {
    ctx.fillStyle = ing.color;
    ctx.strokeStyle = ing.dark;
    ctx.save();
    ctx.rotate(0.4);
    ctx.fillRect(-r * 0.55, -r * 0.55, r * 1.1, r * 1.1);
    ctx.strokeRect(-r * 0.55, -r * 0.55, r * 1.1, r * 1.1);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(-r * 0.3, -r * 0.4, r * 0.25, r * 0.8);
  } else if (id === 'teh') {
    // Glass of tea.
    ctx.fillStyle = 'rgba(201,138,61,0.9)';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.6);
    ctx.lineTo(r * 0.55, -r * 0.6);
    ctx.lineTo(r * 0.35, r * 0.7);
    ctx.lineTo(-r * 0.35, r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.2);
    ctx.lineTo(r * 0.4, -r * 0.2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, size, contents) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f8f4ea';
  ctx.strokeStyle = '#c9bda0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, size / 2, size / 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e8dfc8';
  ctx.beginPath();
  ctx.ellipse(0, 0, size / 3.2, size / 4.4, 0, 0, Math.PI * 2);
  ctx.fill();
  const n = contents.length;
  contents.forEach((id, i) => {
    const angle = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
    const ix = Math.cos(angle) * size * 0.16;
    const iy = Math.sin(angle) * size * 0.1;
    drawIngredientIcon(ctx, id, ix, iy, size * 0.34);
  });
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(0, 0, VIEW_W, BOARD_H);
  ctx.fillStyle = '#f7e3bd';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAPAN PESANAN', 16, 22);
  // HUD on the right side of the board.
  ctx.textAlign = 'right';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(`Skor ${state.score}`, VIEW_W - 16, 22);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#fff';
  const dayLeft = Math.max(0, state.dayLength - state.dayTime);
  const mm = Math.floor(dayLeft / 60);
  const ss = Math.floor(dayLeft % 60).toString().padStart(2, '0');
  ctx.fillText(`Hari ${state.day}  •  ${mm}:${ss}  •  Kombo x${state.combo}  •  Saji ${state.served}  •  Gagal ${state.failed}`, VIEW_W - 16, 48);
  // Day progress bar, below the tickets.
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(16, 98, VIEW_W - 32, 6);
  ctx.fillStyle = '#e8a13d';
  ctx.fillRect(16, 98, (VIEW_W - 32) * (state.dayTime / state.dayLength), 6);

  // Order tickets.
  const ticketW = 218;
  const ticketH = 62;
  const startX = 16;
  const startY = 34;
  state.orders.forEach((order, i) => {
    const x = startX + i * (ticketW + 10);
    const y = startY;
    const frac = timerFraction(order);
    ctx.save();
    roundRect(ctx, x, y, ticketW, ticketH, 8);
    ctx.fillStyle = '#fffdf5';
    ctx.fill();
    ctx.strokeStyle = timerColor(order);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(order.name, x + 10, y + 16);
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${Math.ceil(order.timeLeft)} dtk`, x + 10, y + 34);
    // Needed ingredients as mini icons.
    order.needs.forEach((need, k) => {
      drawIngredientIcon(ctx, need, x + 150 + k * 20, y + 42, 17);
    });
    // Timer bar.
    ctx.fillStyle = '#eee';
    ctx.fillRect(x + 10, y + ticketH - 10, ticketW - 20, 5);
    ctx.fillStyle = timerColor(order);
    ctx.fillRect(x + 10, y + ticketH - 10, (ticketW - 20) * frac, 5);
    ctx.restore();
  });
  if (state.orders.length === 0) {
    ctx.fillStyle = '#f7e3bd';
    ctx.font = 'italic 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Belum ada pesanan — pelanggan segera datang…', 200, 62);
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = WALL;
  ctx.fillRect(0, BOARD_H, VIEW_W, 16);
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(col * 128, BOARD_H + 16 + row * 76, 128, 76);
    }
  }
  // Warm hanging lamps.
  for (let i = 0; i < 4; i += 1) {
    const x = 180 + i * 320;
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, BOARD_H + 16);
    ctx.lineTo(x, BOARD_H + 52);
    ctx.stroke();
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(x, BOARD_H + 60, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,215,106,0.25)';
    ctx.beginPath();
    ctx.arc(x, BOARD_H + 60, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  // Warung sign on the wall strip.
  ctx.fillStyle = '#d93a2b';
  roundRect(ctx, 560, BOARD_H - 2, 160, 20, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ WARUNG KILAT ★', 640, BOARD_H + 8);
}

function drawBins(ctx, state) {
  STATIONS.bins.forEach((bin) => {
    const hover = state.nearStation === bin;
    ctx.save();
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 8);
    ctx.fillStyle = hover ? '#e8c07a' : COUNTER_TOP;
    ctx.fill();
    ctx.strokeStyle = hover ? '#ffd76a' : WOOD_DARK;
    ctx.lineWidth = hover ? 3 : 2;
    ctx.stroke();
    const ing = INGREDIENTS[bin.ingredient];
    drawIngredientIcon(ctx, bin.ingredient, bin.x + bin.w / 2, bin.y + 26, 34);
    ctx.fillStyle = '#2b1a0c';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ing.name, bin.x + bin.w / 2, bin.y + 56);
    ctx.restore();
  });
}

function drawTalenan(ctx, state) {
  const s = STATIONS.talenan;
  const hover = state.nearStation === s;
  ctx.save();
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fillStyle = hover ? '#b98a52' : WOOD;
  ctx.fill();
  ctx.strokeStyle = hover ? '#ffd76a' : WOOD_DARK;
  ctx.lineWidth = hover ? 3 : 2;
  ctx.stroke();
  // Chopping board slab.
  ctx.fillStyle = '#e8c98f';
  roundRect(ctx, s.x + 24, s.y + 22, s.w - 48, s.h - 44, 8);
  ctx.fill();
  ctx.strokeStyle = '#b98a52';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2b1a0c';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TALENAN — potong bahan', s.x + s.w / 2, s.y + s.h - 12);
  // Chopping progress.
  if (state.chef.chopT > 0) {
    const frac = 1 - state.chef.chopT / state.chef.chopTotal;
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(s.x + 40, s.y + 48, s.w - 80, 12);
    ctx.fillStyle = '#7ec850';
    ctx.fillRect(s.x + 40, s.y + 48, (s.w - 80) * frac, 12);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('MEMOTONG…', s.x + s.w / 2, s.y + 40);
  }
  ctx.restore();
}

function drawKompor(ctx, state) {
  const s = STATIONS.kompor;
  const hover = state.nearStation === s;
  ctx.save();
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fillStyle = '#2b2b2b';
  ctx.fill();
  ctx.strokeStyle = hover ? '#ffd76a' : '#111';
  ctx.lineWidth = hover ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KOMPOR — masak di wajan', s.x + s.w / 2, s.y + s.h - 10);
  burnerRects().forEach((b, i) => {
    const burner = state.burners[i];
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 - 4, b.h / 2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (burner && burner.item) {
      const frac = Math.min(1, burner.t / burner.dur);
      // Wok with food.
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 - 10, b.h / 2 - 10, 0, 0, Math.PI * 2);
      ctx.fill();
      drawIngredientIcon(ctx, burner.item, b.x + b.w / 2, b.y + b.h / 2 - 4, 40);
      if (frac < 1) {
        ctx.fillStyle = '#e8a13d';
        ctx.fillRect(b.x + 8, b.y + b.h - 12, (b.w - 16) * frac, 5);
      } else {
        ctx.fillStyle = '#7ec850';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MATANG!', b.x + b.w / 2, b.y + b.h - 14);
      }
    }
  });
  ctx.restore();
}

function drawPeracik(ctx, state) {
  const s = STATIONS.peracik;
  const hover = state.nearStation === s;
  ctx.save();
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fillStyle = hover ? '#e8c07a' : COUNTER_TOP;
  ctx.fill();
  ctx.strokeStyle = hover ? '#ffd76a' : WOOD_DARK;
  ctx.lineWidth = hover ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = '#2b1a0c';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MEJA PERACIK — rakit di piring', s.x + s.w / 2, s.y + 18);
  const recipe = state.plateRecipe;
  if (state.plate.length > 0) {
    drawPlate(ctx, s.x + s.w / 2, s.y + 62, 84, state.plate);
    if (recipe) {
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`✓ ${recipe.name} SIAP!`, s.x + s.w / 2, s.y + s.h - 10);
    } else if (!state.platePossible) {
      ctx.fillStyle = '#d93a2b';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('✗ Kombinasi salah — tekan Q', s.x + s.w / 2, s.y + s.h - 10);
    }
  } else {
    ctx.fillStyle = '#6b4423';
    ctx.font = '14px sans-serif';
    ctx.fillText('Piring kosong — taruh bahan di sini', s.x + s.w / 2, s.y + 62);
  }
  ctx.restore();
}

function drawSaji(ctx, state) {
  const s = STATIONS.saji;
  const hover = state.nearStation === s;
  ctx.save();
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fillStyle = hover ? '#ffe9a8' : '#f7e3bd';
  ctx.fill();
  ctx.strokeStyle = hover ? '#ffd76a' : '#8a5a2e';
  ctx.lineWidth = hover ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = '#2b1a0c';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('JENDELA SAJI', s.x + 12, s.y + 18);
  ctx.textAlign = 'center';
  if (state.readyPlates.length > 0) {
    state.readyPlates.forEach((dishId, i) => {
      const recipe = RECIPES[dishId];
      const px = s.x + 60 + i * 110;
      drawPlate(ctx, px, s.y + 66, 76, recipe ? recipe.needs : []);
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(recipe ? recipe.name : dishId, px, s.y + s.h - 12);
    });
  } else {
    ctx.fillStyle = '#8a6a42';
    ctx.font = '14px sans-serif';
    ctx.fillText('Belum ada piring siap saji', s.x + s.w / 2, s.y + 66);
  }
  // Little bell.
  ctx.fillStyle = '#e8a13d';
  ctx.beginPath();
  ctx.arc(s.x + s.w - 22, s.y + 22, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSampah(ctx, state) {
  const s = STATIONS.sampah;
  const hover = state.nearStation === s;
  ctx.save();
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fillStyle = hover ? '#9aa5ad' : '#7c8891';
  ctx.fill();
  ctx.strokeStyle = hover ? '#ffd76a' : '#4a545b';
  ctx.lineWidth = hover ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TONG', s.x + s.w / 2, s.y + 22);
  ctx.fillText('SAMPAH', s.x + s.w / 2, s.y + 40);
  ctx.font = '12px sans-serif';
  ctx.fillText('buang bahan', s.x + s.w / 2, s.y + 62);
  ctx.restore();
}

function drawChef(ctx, state) {
  const c = state.chef;
  ctx.save();
  ctx.translate(c.x, c.y);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, c.r * 0.9, c.r, c.r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  const bob = c.moving ? Math.sin(performance.now() / 90) * 2 : 0;
  ctx.translate(0, bob);
  // Body + apron.
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.arc(0, 0, c.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c96a1e';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, c.r * 0.35, c.r * 0.62, c.r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Face.
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.arc(0, -c.r * 0.35, c.r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-c.r * 0.2, -c.r * 0.4, 2.5, 0, Math.PI * 2);
  ctx.arc(c.r * 0.2, -c.r * 0.4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Chef toque.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-c.r * 0.28, -c.r * 0.85, c.r * 0.32, 0, Math.PI * 2);
  ctx.arc(0, -c.r * 0.95, c.r * 0.36, 0, Math.PI * 2);
  ctx.arc(c.r * 0.28, -c.r * 0.85, c.r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-c.r * 0.5, -c.r * 0.85, c.r, c.r * 0.25);
  // Chopping animation: knife slash.
  if (c.chopT > 0) {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 4;
    const swing = Math.sin((1 - c.chopT / c.chopTotal) * Math.PI * 3) * 10;
    ctx.beginPath();
    ctx.moveTo(c.r * 0.9, -c.r * 0.4 + swing);
    ctx.lineTo(c.r * 1.5, c.r * 0.5);
    ctx.stroke();
  }
  ctx.restore();
  // Carried items as bubbles above the chef.
  state.hands.forEach((item, i) => {
    if (!item) return;
    const bx = c.x - 18 + i * 36;
    const by = c.y - c.r - 26;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#8a5a2e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bx, by, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (item.startsWith('plate:')) {
      const recipe = RECIPES[item.slice(6)];
      drawPlate(ctx, bx, by, 24, recipe ? recipe.needs : []);
    } else {
      drawIngredientIcon(ctx, item, bx, by, 22);
    }
    ctx.restore();
  });
}

function drawPrompt(ctx, state) {
  if (!state.prompt) return;
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,12,0.9)';
  ctx.font = 'bold 15px sans-serif';
  const w = ctx.measureText(state.prompt).width + 28;
  roundRect(ctx, VIEW_W / 2 - w / 2, VIEW_H - 46, w, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.prompt, VIEW_W / 2, VIEW_H - 30);
  ctx.restore();
}

function drawToasts(ctx, state) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  state.toasts.forEach((toast, i) => {
    const alpha = Math.max(0, 1 - toast.t / toast.life);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = toast.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 4;
    const y = 150 + i * 30 - toast.t * 18;
    ctx.strokeText(toast.text, VIEW_W / 2, y);
    ctx.fillText(toast.text, VIEW_W / 2, y);
  });
  ctx.restore();
}

function drawMenu(ctx, state) {
  ctx.fillStyle = 'rgba(43,26,12,0.88)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('WARUNG KILAT', VIEW_W / 2, 150);
  ctx.fillStyle = '#fff';
  ctx.font = '22px sans-serif';
  ctx.fillText('Warung kaki lima paling sibuk di kota — masak cepat, antar tepat waktu!', VIEW_W / 2, 200);
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#ffe9a8';
  const lines = [
    'WASD / Panah — gerakkan koki    •    Klik — berjalan ke stasiun',
    'E / Spasi — ambil, potong, masak, rakit, sajikan    •    Q — kosongkan piring',
    'Ambil bahan di counter → potong di talenan → masak di kompor',
    'Rakit hidangan di meja peracik → antar ke jendela saji sebelum timer habis!',
    'Pesanan benar + cepat = poin & kombo. Hari berlangsung 2,5 menit.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 260 + i * 32));
  ctx.fillStyle = '#7ec850';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Tekan ENTER atau klik untuk mulai memasak', VIEW_W / 2, 470);
  ctx.fillStyle = '#ccc';
  ctx.font = '15px sans-serif';
  ctx.fillText('M — musik nyala/mati', VIEW_W / 2, 510);
  ctx.restore();
}

function drawDayEnd(ctx, state) {
  ctx.fillStyle = 'rgba(43,26,12,0.9)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(`Hari ${state.day} Selesai!`, VIEW_W / 2, 150);
  const stars = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(stars, VIEW_W / 2, 230);
  ctx.fillStyle = '#fff';
  ctx.font = '22px sans-serif';
  ctx.fillText(`Pesanan tersaji: ${state.served}    •    Gagal: ${state.failed}`, VIEW_W / 2, 300);
  ctx.fillText(`Kombo terbaik: x${state.bestCombo}    •    Skor: ${state.score}`, VIEW_W / 2, 340);
  ctx.fillStyle = '#7ec850';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Tekan ENTER — hari berikutnya (makin ramai!)', VIEW_W / 2, 430);
  ctx.fillStyle = '#ccc';
  ctx.font = '16px sans-serif';
  ctx.fillText('Tekan R — ulangi hari ini dari awal', VIEW_W / 2, 470);
  ctx.restore();
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx);
  drawBins(ctx, state);
  drawTalenan(ctx, state);
  drawKompor(ctx, state);
  drawPeracik(ctx, state);
  drawSaji(ctx, state);
  drawSampah(ctx, state);
  drawChef(ctx, state);
  drawOrderBoard(ctx, state);
  drawToasts(ctx, state);
  drawPrompt(ctx, state);
  if (state.screen === 'menu') drawMenu(ctx, state);
  if (state.screen === 'dayend') drawDayEnd(ctx, state);
}
