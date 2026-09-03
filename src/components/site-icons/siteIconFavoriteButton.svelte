<script lang="ts">
  import { cn } from "@/utils/cn";
  import siteIconFavoritesStore from "@/stores/siteIconFavorites.store";

  interface Props {
    iconId: string;
    iconName: string;
    isFavorite?: boolean;
  }

  let { iconId, iconName, isFavorite: propIsFavorite }: Props = $props();
  let isFavorite = $derived(
    propIsFavorite !== undefined
      ? propIsFavorite
      : siteIconFavoritesStore.isFavorite(iconId, $siteIconFavoritesStore),
  );

  const toggleFavorite = () => {
    siteIconFavoritesStore.toggleFavorite(iconId);
  };
</script>

<button
  type="button"
  class={cn(
    "flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors",
    "text-neutral-500 hover:bg-neutral-200 hover:text-red-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-red-500",
    isFavorite && "text-red-500 dark:text-red-400",
  )}
  onclick={toggleFavorite}
  title={isFavorite
    ? `Remove ${iconName} from favorites`
    : `Add ${iconName} to favorites`}
  aria-label={isFavorite
    ? `Remove ${iconName} from favorites`
    : `Add ${iconName} to favorites`}
  aria-pressed={isFavorite}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={isFavorite ? "currentColor" : "none"}
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={cn(isFavorite && "fill-red-500 text-red-600 dark:text-red-400")}
    aria-hidden="true"
  >
    <path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
    />
  </svg>
</button>
