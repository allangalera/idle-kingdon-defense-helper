import { browser } from '$app/env';
import { CONQUEST_FORTRESS_MAX_LEVEL } from '$lib/db/conquest';
import { append, filter, hasPath, is, mergeDeepRight, pathOr } from 'ramda';
import * as R from 'remeda';
import { writable } from 'svelte/store';
import { z } from 'zod';

type Fortress = {
  id: number;
  level: number;
};

type ConquestStore = {
  kingdoms: number[];
  fortress: Fortress[];
};

const CONQUEST_STORE_KEY = 'CONQUEST_STORE_KEY';

const initialState = browser
  ? JSON.parse(window.localStorage.getItem(CONQUEST_STORE_KEY)) ?? {}
  : {};

export const conquest = writable<ConquestStore>(initialState);

export const addKingdom = (kingdomId: number) => {
  if (!is(Number, kingdomId)) return false;
  conquest.update((currentData) => {
    if (hasPath(['kingdoms'], currentData) && currentData.kingdoms.includes(kingdomId))
      return currentData;
    return mergeDeepRight(currentData, {
      kingdoms: append(kingdomId, pathOr([], ['kingdoms'], currentData)),
    });
  });
  return true;
};

export const removeKingdom = (kingdomId: number) => {
  if (!is(Number, kingdomId)) return false;
  conquest.update((currentData) => {
    if (!hasPath(['kingdoms'], currentData)) return currentData;
    if (!currentData.kingdoms.includes(kingdomId)) return currentData;

    return mergeDeepRight(currentData, {
      kingdoms: filter((item) => item !== kingdomId, currentData.kingdoms),
    });
  });
  return true;
};

export const addFortress = (fortress: Fortress) => {
  conquest.update((currentData) => {
    if (
      Boolean(currentData?.fortress) &&
      currentData.fortress.find((item) => item.id === fortress.id)
    ) {
      return currentData;
    }

    return R.merge(currentData, {
      fortress: R.concat(currentData?.fortress ?? [], [fortress]),
    });
  });
};

export const removeFortress = (fortressId: number) => {
  if (!R.isNumber(fortressId)) return false;

  conquest.update((currentData) => {
    if (!Boolean(currentData?.fortress)) return currentData;

    return R.merge(currentData, {
      fortress: currentData.fortress.filter((item) => item.id !== fortressId),
    });
  });
  return true;
};

export const updateFortressLevel = (fortressId: number, level: number) => {
  if (!R.isNumber(fortressId) || !R.isNumber(level)) return false;

  const schema = z.object({
    level: z.number().gt(0).lte(CONQUEST_FORTRESS_MAX_LEVEL),
  });

  const levelValidation = schema.safeParse({ level });

  if (!levelValidation.success) return false;

  conquest.update((currentData) => {
    if (!Boolean(currentData?.fortress)) return currentData;

    return R.merge(currentData, {
      fortress: currentData.fortress.map((item) => {
        if (item.id === fortressId)
          return {
            ...item,
            level,
          };
        return item;
      }),
    });
  });
  return true;
};

conquest.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem(CONQUEST_STORE_KEY, JSON.stringify(value));
  }
});
