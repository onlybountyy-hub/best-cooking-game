// Kitchen layout: station rectangles, the ingredient counter, and the
// collision / proximity helpers the chef uses to interact.
import { BIN_ORDER } from './recipes.js';

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const BOARD_H = 108;

// Stations are solid rectangles the chef walks around. `kind` decides the
// interaction; `label` is the prompt shown when the chef is close.
export const STATIONS = {
  bins: BIN_ORDER.map((id, i) => ({
    kind: 'bin', ingredient: id, index: i,
    x: 24 + i * 136, y: 124, w: 128, h: 72,
    label: id,
  })),
  talenan: { kind: 'talenan', x: 40, y: 300, w: 250, h: 112, label: 'Talenan' },
  kompor: { kind: 'kompor', x: 400, y: 288, w: 330, h: 124, label: 'Kompor' },
  peracik: { kind: 'peracik', x: 800, y: 300, w: 260, h: 112, label: 'Meja Peracik' },
  saji: { kind: 'saji', x: 1000, y: 520, w: 240, h: 132, label: 'Jendela Saji' },
  sampah: { kind: 'sampah', x: 40, y: 540, w: 110, h: 92, label: 'Tong Sampah' },
};

export function allStations() {
  return [
    ...STATIONS.bins,
    STATIONS.talenan,
    STATIONS.kompor,
    STATIONS.peracik,
    STATIONS.saji,
    STATIONS.sampah,
  ];
}

// Burners sit on the kompor; each holds one cooking item.
export function burnerRects() {
  const k = STATIONS.kompor;
  return [
    { x: k.x + 28, y: k.y + 26, w: 120, h: 72 },
    { x: k.x + 182, y: k.y + 26, w: 120, h: 72 },
  ];
}

// Distance from a point to a rectangle (0 when inside).
export function distanceToRect(px, py, rect) {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.w));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}

const REACH = 78;

export function nearestStation(px, py) {
  let best = null;
  let bestD = REACH;
  for (const station of allStations()) {
    const d = distanceToRect(px, py, station);
    if (d < bestD) {
      bestD = d;
      best = station;
    }
  }
  return best;
}

// Push a circle (chef) out of solid station rectangles and the walls.
export function collide(chef) {
  const r = chef.r;
  chef.x = Math.max(r + 8, Math.min(VIEW_W - r - 8, chef.x));
  chef.y = Math.max(BOARD_H + r + 8, Math.min(VIEW_H - r - 8, chef.y));
  for (const station of allStations()) {
    const cx = Math.max(station.x, Math.min(chef.x, station.x + station.w));
    const cy = Math.max(station.y, Math.min(chef.y, station.y + station.h));
    const dx = chef.x - cx;
    const dy = chef.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r && d2 > 0.0001) {
      const d = Math.sqrt(d2);
      chef.x = cx + (dx / d) * r;
      chef.y = cy + (dy / d) * r;
    } else if (d2 <= 0.0001) {
      chef.y = station.y + station.h + r;
    }
  }
}
