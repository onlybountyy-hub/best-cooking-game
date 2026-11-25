// Ingredients and recipes for Warung Kilat. Every dish is assembled from
// raw ingredients that are chopped on the talenan, cooked on the kompor,
// or used straight from the counter, then combined on a plate at the
// meja peracik. Names and dishes are original.

// One ingredient id per processing stage; `stage` tells the player what
// still has to happen to it.
export const INGREDIENTS = {
  nasi: { id: 'nasi', name: 'Nasi', color: '#f5f0dc', dark: '#cbbf8f', cook: 'nasiMatang', chop: null },
  mie: { id: 'mie', name: 'Mie', color: '#f2c94c', dark: '#c79a1e', cook: 'mieMatang', chop: null },
  ayam: { id: 'ayam', name: 'Ayam', color: '#f2a0a0', dark: '#c96a6a', cook: null, chop: 'ayamPotong' },
  telur: { id: 'telur', name: 'Telur', color: '#fdf3d0', dark: '#d9c27a', cook: 'telurGoreng', chop: null },
  sayur: { id: 'sayur', name: 'Sayur', color: '#7ec850', dark: '#4c8a2e', cook: null, chop: 'sayurPotong' },
  cabai: { id: 'cabai', name: 'Cabai', color: '#e8442e', dark: '#a02318', cook: null, chop: 'cabaiPotong' },
  kecap: { id: 'kecap', name: 'Kecap', color: '#5b3a1e', dark: '#3a2412', cook: null, chop: null },
  es: { id: 'es', name: 'Es Batu', color: '#bfe8ff', dark: '#6fb7dd', cook: null, chop: null },
  teh: { id: 'teh', name: 'Teh', color: '#c98a3d', dark: '#8a5a1e', cook: null, chop: null },
  nasiMatang: { id: 'nasiMatang', name: 'Nasi Matang', color: '#fff8e0', dark: '#d9c98f', cook: null, chop: null },
  mieMatang: { id: 'mieMatang', name: 'Mie Matang', color: '#f7d774', dark: '#c79a1e', cook: null, chop: null },
  ayamPotong: { id: 'ayamPotong', name: 'Ayam Potong', color: '#f6b8b8', dark: '#c96a6a', cook: 'ayamGoreng', chop: null },
  ayamGoreng: { id: 'ayamGoreng', name: 'Ayam Goreng', color: '#d98a3d', dark: '#96571a', cook: null, chop: null },
  telurGoreng: { id: 'telurGoreng', name: 'Telur Goreng', color: '#ffe9a8', dark: '#d9a83d', cook: null, chop: null },
  sayurPotong: { id: 'sayurPotong', name: 'Sayur Potong', color: '#9be36e', dark: '#4c8a2e', cook: null, chop: null },
  cabaiPotong: { id: 'cabaiPotong', name: 'Cabai Potong', color: '#ff6a4d', dark: '#a02318', cook: null, chop: null },
};

// Counter bins the player picks raw ingredients from, left to right.
export const BIN_ORDER = ['nasi', 'mie', 'ayam', 'telur', 'sayur', 'cabai', 'kecap', 'es', 'teh'];

export const RECIPES = {
  nasgor: {
    id: 'nasgor', name: 'Nasi Goreng', price: 100,
    needs: ['nasiMatang', 'ayamGoreng', 'telurGoreng', 'kecap'],
    color: '#e8a13d', blurb: 'Nasi + ayam + telur + kecap',
  },
  miegor: {
    id: 'miegor', name: 'Mie Goreng', price: 100,
    needs: ['mieMatang', 'sayurPotong', 'ayamGoreng', 'kecap'],
    color: '#f2c94c', blurb: 'Mie + sayur + ayam + kecap',
  },
  sate: {
    id: 'sate', name: 'Sate Ayam', price: 90,
    needs: ['ayamGoreng', 'cabaiPotong', 'kecap'],
    color: '#c96a3d', blurb: 'Ayam goreng + cabai + kecap',
  },
  esteh: {
    id: 'esteh', name: 'Es Teh', price: 60,
    needs: ['es', 'teh'],
    color: '#c98a3d', blurb: 'Es batu + teh',
  },
  telorbalado: {
    id: 'telorbalado', name: 'Telur Balado', price: 80,
    needs: ['telurGoreng', 'cabaiPotong'],
    color: '#e8442e', blurb: 'Telur goreng + cabai',
  },
};

export const RECIPE_LIST = Object.values(RECIPES);

export function canChop(id) {
  return Boolean(INGREDIENTS[id] && INGREDIENTS[id].chop);
}

export function canCook(id) {
  return Boolean(INGREDIENTS[id] && INGREDIENTS[id].cook);
}

export function chopResult(id) {
  return INGREDIENTS[id].chop;
}

export function cookResult(id) {
  return INGREDIENTS[id].cook;
}

// The recipe whose needs exactly match the plate contents, or null.
export function recipeForPlate(contents) {
  const sorted = contents.slice().sort().join(',');
  for (const recipe of RECIPE_LIST) {
    if (recipe.needs.slice().sort().join(',') === sorted) return recipe;
  }
  return null;
}

// True when every item on the plate belongs to at least one recipe that
// could still be completed from these contents (no wasted ingredient).
export function plateStillPossible(contents) {
  if (contents.length === 0) return true;
  return RECIPE_LIST.some((recipe) => {
    if (contents.length > recipe.needs.length) return false;
    const remaining = recipe.needs.slice();
    for (const item of contents) {
      const at = remaining.indexOf(item);
      if (at === -1) return false;
      remaining.splice(at, 1);
    }
    return true;
  });
}
