// Order board: tickets arrive over the day, each with its own countdown.
// Colour shifts green -> amber -> red as the timer runs out.
import { RECIPE_LIST } from './recipes.js';
import { pick } from './random.js';

export const MAX_ORDERS = 4;

let nextOrderId = 1;

export function makeOrder(rng, dishId, timeLeft, day) {
  const recipe = RECIPE_LIST.find((r) => r.id === dishId) || pick(rng, RECIPE_LIST);
  return {
    id: nextOrderId,
    dish: recipe.id,
    name: recipe.name,
    needs: recipe.needs.slice(),
    timeLeft,
    timeTotal: timeLeft,
    day,
    born: performance.now(),
  };
}

export function resetOrderIds() {
  nextOrderId = 1;
}

// Seconds until the next ticket, shrinking as the day goes on.
export function spawnInterval(dayElapsed) {
  return Math.max(6, 13 - dayElapsed * 0.045);
}

// How long a fresh ticket lives, shrinking as the day goes on.
export function orderLifetime(dayElapsed) {
  return Math.max(45, 72 - dayElapsed * 0.18);
}

export function timerColor(order) {
  const frac = order.timeLeft / order.timeTotal;
  if (frac > 0.5) return '#3da53d';
  if (frac > 0.25) return '#e8a13d';
  return '#d93a2b';
}

export function timerFraction(order) {
  return Math.max(0, order.timeLeft / order.timeTotal);
}
