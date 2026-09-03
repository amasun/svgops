import { browser } from "$app/environment";
import { writable } from "svelte/store";

import { siteIcons } from "@/data/site-icons";

const localStorageKey = "svgops_site_icon_favorites";
const validIconIds = new Set(siteIcons.map((icon) => icon.id));

const validateFavorites = (ids: string[]) =>
  ids.filter((id, index) => validIconIds.has(id) && ids.indexOf(id) === index);

const loadFavorites = (): string[] => {
  if (!browser) return [];

  try {
    const stored = localStorage.getItem(localStorageKey);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    const favorites = validateFavorites(
      parsed.filter((id): id is string => typeof id === "string"),
    );
    localStorage.setItem(localStorageKey, JSON.stringify(favorites));
    return favorites;
  } catch (error) {
    console.error("Unable to load website icon favorites:", error);
    return [];
  }
};

const saveFavorites = (favorites: string[]) => {
  if (!browser) return;

  try {
    localStorage.setItem(localStorageKey, JSON.stringify(favorites));
  } catch (error) {
    console.error("Unable to save website icon favorites:", error);
  }
};

const { subscribe, set, update } = writable<string[]>(loadFavorites());

const siteIconFavoritesStore = {
  subscribe,
  toggleFavorite: (iconId: string) =>
    update((favorites) => {
      const nextFavorites = favorites.includes(iconId)
        ? favorites.filter((id) => id !== iconId)
        : [...favorites, iconId];
      saveFavorites(nextFavorites);
      return nextFavorites;
    }),
  clearFavorites: () => {
    set([]);
    saveFavorites([]);
  },
  isFavorite: (iconId: string, favorites: string[]) =>
    favorites.includes(iconId),
  getCount: (favorites: string[]) => favorites.length,
};

export default siteIconFavoritesStore;
