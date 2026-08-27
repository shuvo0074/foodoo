import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';
import { getRestaurant, ORDER_STAGES, COURIERS } from '../data';

/* ------------------------------------------------------------------ *
 * Single in-memory store for cart, favourites and orders.
 * Swap the reducer's side-effect-free actions for API calls later.
 * ------------------------------------------------------------------ */

const SERVICE_FEE = 5;
const PROMO_CODES = {
  FOODOO50: { type: 'percent', value: 50, cap: 45, label: '50% off (max SR 45)' },
  FREESHIP: { type: 'shipping', value: 0, label: 'Free delivery' },
  SAVE20: { type: 'flat', value: 20, label: 'SR 20 off' },
};

/** Stable key so the same dish with different options are separate lines. */
const lineKey = (dishId, opts) => {
  const flat = Object.keys(opts || {})
    .sort()
    .map((g) => `${g}:${[...(opts[g] || [])].sort().join('+')}`)
    .join('|');
  return `${dishId}__${flat}`;
};

/** Unit price = base + every selected option's surcharge. */
export const unitPriceOf = (dish, opts) => {
  let p = dish.price;
  for (const group of dish.options || []) {
    const picked = opts?.[group.id] || [];
    for (const id of picked) {
      const item = group.items.find((i) => i.id === id);
      if (item) p += item.price;
    }
  }
  return Math.round(p * 100) / 100;
};

/** Human label for the chosen options, e.g. "Double patty · Extra cheese". */
export const optionLabels = (dish, opts) => {
  const out = [];
  for (const group of dish.options || []) {
    for (const id of opts?.[group.id] || []) {
      const item = group.items.find((i) => i.id === id);
      if (item) out.push(item.label);
    }
  }
  return out;
};

const initial = {
  cartRid: null,
  lines: [],           // { key, dish, qty, opts, note }
  favRestaurants: ['r4', 'r7'],
  favDishes: [],
  promo: null,         // { code, ...rule }
  tip: 5,
  addressId: 'a1',
  paymentId: 'pm1',
  orders: [],          // live orders, newest first
  lastAdded: 0,        // bumps so the cart bar can react
};

function reducer(state, a) {
  switch (a.type) {
    case 'ADD': {
      const { dish, opts, qty, note } = a;
      // one restaurant per cart — the UI confirms before this fires
      const base = state.cartRid && state.cartRid !== dish.rid
        ? { ...state, lines: [], cartRid: dish.rid }
        : { ...state, cartRid: dish.rid };
      const key = lineKey(dish.id, opts);
      const at = base.lines.findIndex((l) => l.key === key);
      const lines =
        at >= 0
          ? base.lines.map((l, i) => (i === at ? { ...l, qty: l.qty + qty } : l))
          : [...base.lines, { key, dish, qty, opts: opts || {}, note: note || '' }];
      return { ...base, lines, lastAdded: state.lastAdded + 1 };
    }
    case 'SET_QTY': {
      const lines = state.lines
        .map((l) => (l.key === a.key ? { ...l, qty: Math.max(0, a.qty) } : l))
        .filter((l) => l.qty > 0);
      return { ...state, lines, cartRid: lines.length ? state.cartRid : null };
    }
    case 'REMOVE': {
      const lines = state.lines.filter((l) => l.key !== a.key);
      return { ...state, lines, cartRid: lines.length ? state.cartRid : null };
    }
    case 'CLEAR':
      return { ...state, lines: [], cartRid: null, promo: null };
    case 'FAV_R': {
      const has = state.favRestaurants.includes(a.id);
      return {
        ...state,
        favRestaurants: has
          ? state.favRestaurants.filter((x) => x !== a.id)
          : [...state.favRestaurants, a.id],
      };
    }
    case 'FAV_D': {
      const has = state.favDishes.includes(a.id);
      return {
        ...state,
        favDishes: has ? state.favDishes.filter((x) => x !== a.id) : [...state.favDishes, a.id],
      };
    }
    case 'PROMO':
      return { ...state, promo: a.promo };
    case 'TIP':
      return { ...state, tip: a.tip };
    case 'ADDRESS':
      return { ...state, addressId: a.id };
    case 'PAYMENT':
      return { ...state, paymentId: a.id };
    case 'PLACE_ORDER':
      return {
        ...state,
        lines: [],
        cartRid: null,
        promo: null,
        orders: [a.order, ...state.orders],
      };
    case 'ADVANCE': {
      const orders = state.orders.map((o) =>
        o.id === a.id && o.stage < ORDER_STAGES.length - 1 ? { ...o, stage: o.stage + 1 } : o,
      );
      return { ...state, orders };
    }
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const totals = useMemo(() => {
    const subtotal = state.lines.reduce(
      (s, l) => s + unitPriceOf(l.dish, l.opts) * l.qty,
      0,
    );
    const r = state.cartRid ? getRestaurant(state.cartRid) : null;
    let delivery = r ? r.deliveryFee : 0;
    let discount = 0;

    if (state.promo) {
      if (state.promo.type === 'percent') {
        discount = Math.min(subtotal * (state.promo.value / 100), state.promo.cap ?? Infinity);
      } else if (state.promo.type === 'flat') {
        discount = Math.min(state.promo.value, subtotal);
      } else if (state.promo.type === 'shipping') {
        delivery = 0;
      }
    }

    const service = state.lines.length ? SERVICE_FEE : 0;
    const tip = state.lines.length ? state.tip : 0;
    const total = Math.max(0, subtotal - discount + delivery + service + tip);
    const count = state.lines.reduce((s, l) => s + l.qty, 0);

    return {
      subtotal: round(subtotal),
      delivery: round(delivery),
      service: round(service),
      discount: round(discount),
      tip: round(tip),
      total: round(total),
      count,
      restaurant: r,
    };
  }, [state.lines, state.cartRid, state.promo, state.tip]);

  const api = useMemo(
    () => ({
      add: (dish, opts, qty = 1, note = '') => dispatch({ type: 'ADD', dish, opts, qty, note }),
      setQty: (key, qty) => dispatch({ type: 'SET_QTY', key, qty }),
      remove: (key) => dispatch({ type: 'REMOVE', key }),
      clear: () => dispatch({ type: 'CLEAR' }),
      toggleFavRestaurant: (id) => dispatch({ type: 'FAV_R', id }),
      toggleFavDish: (id) => dispatch({ type: 'FAV_D', id }),
      setTip: (tip) => dispatch({ type: 'TIP', tip }),
      setAddress: (id) => dispatch({ type: 'ADDRESS', id }),
      setPayment: (id) => dispatch({ type: 'PAYMENT', id }),
      advance: (id) => dispatch({ type: 'ADVANCE', id }),
      applyPromo: (raw) => {
        const code = String(raw || '').trim().toUpperCase();
        const rule = PROMO_CODES[code];
        if (!rule) return false;
        dispatch({ type: 'PROMO', promo: { code, ...rule } });
        return true;
      },
      clearPromo: () => dispatch({ type: 'PROMO', promo: null }),
      placeOrder: () => {
        const id = `o-${9000 + Math.floor(Date.now() / 1000) % 999}`;
        const order = {
          id,
          rid: state.cartRid,
          stage: 0,
          status: 'live',
          placedAt: 'Just now',
          etaMinutes: totals.restaurant?.etaMax ?? 30,
          total: totals.total,
          courier: COURIERS[state.orders.length % COURIERS.length],
          items: state.lines.map((l) => ({ name: l.dish.name, qty: l.qty })),
        };
        dispatch({ type: 'PLACE_ORDER', order });
        return order;
      },
    }),
    [state.cartRid, state.lines, state.orders.length, totals],
  );

  const value = useMemo(() => ({ ...state, totals, ...api }), [state, totals, api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
};

/** Convenience: how many of this dish are in the cart right now. */
export const useDishQty = (dishId) => {
  const { lines } = useStore();
  return lines.reduce((s, l) => (l.dish.id === dishId ? s + l.qty : s), 0);
};

export const useIsFavRestaurant = (id) => useStore().favRestaurants.includes(id);

function round(n) {
  return Math.round(n * 100) / 100;
}

/** Saudi riyal. Whole amounts drop the decimals — prices here are mostly round. */
export const money = (n) => {
  const v = Number(n) || 0;
  return `SR ${Number.isInteger(v) ? v : v.toFixed(2)}`;
};
export { PROMO_CODES };
