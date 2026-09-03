<script lang="ts">
  import { cn } from "@/utils/cn";
  import { globals } from "@/globals";

  import { page } from "$app/state";
  import favoritesStore from "@/stores/favorites.store";
  import siteIconFavoritesStore from "@/stores/siteIconFavorites.store";

  import ExternalLink from "@/components/ui/links/external-link.svelte";
  import InternalLink from "@/components/ui/links/internal-link.svelte";

  import { sidebarItemClasses } from "@/components/layout/sidebarItemClasses";
  import { sidebarBadgeClasses } from "@/components/layout/sidebarBadgeClasses";

  import Box from "@lucide/svelte/icons/box";
  import House from "@lucide/svelte/icons/house";
  import Heart from "@lucide/svelte/icons/heart";
  import Cloud from "@lucide/svelte/icons/cloud";
  import Globe2 from "@lucide/svelte/icons/globe-2";
  import Submit from "@lucide/svelte/icons/send";

  import { siteCollections } from "@/data/site-icons";

  import Github from "@/components/logos/github.svelte";
  import Shadcn from "@/components/logos/shadcn.svelte";

  let favorites = $derived($favoritesStore);
  let siteIconFavorites = $derived($siteIconFavoritesStore);
  let favoritesCount = $derived(
    favoritesStore.getCount(favorites) +
      siteIconFavoritesStore.getCount(siteIconFavorites),
  );
</script>

<InternalLink
  href="/"
  preloadData={true}
  className={cn(
    sidebarItemClasses.base,
    "justify-start space-x-3",
    page.url.pathname === "/" && sidebarItemClasses.active,
  )}
>
  <House size={16} />
  <p class="truncate">Home</p>
</InternalLink>
<InternalLink
  href="/sites"
  preloadData={true}
  className={cn(
    sidebarItemClasses.base,
    "justify-between",
    page.url.pathname === "/sites" && sidebarItemClasses.active,
  )}
>
  <div class="flex min-w-0 items-center space-x-3">
    <Globe2 size={16} />
    <p class="truncate">Collections</p>
  </div>
  <span class={cn(sidebarBadgeClasses, "border-transparent")}
    >{siteCollections.length}</span
  >
</InternalLink>
<InternalLink
  href="/favorites"
  preloadData={true}
  className={cn(
    sidebarItemClasses.base,
    "justify-between",
    String(page.url.pathname) === "/favorites" && sidebarItemClasses.active,
  )}
>
  <div class="flex items-center space-x-3">
    <Heart size={16} />
    <p class="truncate">Favorites</p>
  </div>
  {#if favoritesCount > 0}
    <span
      class={cn(sidebarBadgeClasses, page.url.pathname && "border-transparent")}
    >
      {favoritesCount}
    </span>
  {/if}
</InternalLink>
<div
  class={cn(
    sidebarItemClasses.base,
    "cursor-not-allowed justify-between opacity-55 hover:text-neutral-600 dark:hover:text-neutral-400",
  )}
  aria-disabled="true"
  title="Not available for this icon library"
>
  <div class="flex min-w-0 items-center space-x-3">
    <Cloud size={16} />
    <p class="truncate">API</p>
  </div>
  <span class={cn(sidebarBadgeClasses, "px-1.5 text-[10px] shadow-none")}>
    Disabled
  </span>
</div>
<div
  class={cn(
    sidebarItemClasses.base,
    "cursor-not-allowed justify-between opacity-55 hover:text-neutral-600 dark:hover:text-neutral-400",
  )}
  aria-disabled="true"
  title="Not available for this icon library"
>
  <div class="flex min-w-0 items-center space-x-3">
    <Shadcn size={14} />
    <p class="truncate">shadcn/ui</p>
  </div>
  <span class={cn(sidebarBadgeClasses, "px-1.5 text-[10px] shadow-none")}>
    Disabled
  </span>
</div>
<div
  class={cn(
    sidebarItemClasses.base,
    "cursor-not-allowed justify-between opacity-55 hover:text-neutral-600 dark:hover:text-neutral-400",
  )}
  aria-disabled="true"
  title="Not available for this icon library"
>
  <div class="flex min-w-0 items-center space-x-3">
    <Box size={16} />
    <p class="truncate">Extensions</p>
  </div>
  <span class={cn(sidebarBadgeClasses, "px-1.5 text-[10px] shadow-none")}>
    Disabled
  </span>
</div>
<ExternalLink
  href={globals.submitUrl}
  className={cn(
    sidebarItemClasses.base,
    "flex justify-start space-x-3 md:hidden",
  )}
>
  <Submit size={16} />
  <p class="truncate">Submit SVG</p>
</ExternalLink>
<ExternalLink
  href={globals.githubUrl}
  className={cn(
    sidebarItemClasses.base,
    "flex justify-start space-x-3 md:hidden",
  )}
>
  <Github size={16} />
  <p class="truncate">GitHub Repository</p>
</ExternalLink>
