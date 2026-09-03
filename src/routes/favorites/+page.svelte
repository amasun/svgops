<script lang="ts">
  import type { iSVG } from "@/types/svg";

  import { resolve } from "$app/paths";
  import { siteCollections, siteIcons } from "@/data/site-icons";
  import { searchSvgsWithFuse } from "@/utils/searchWithFuse";
  import { deleteParam, getParamValue } from "@/utils/searchParams";

  // Store:
  import favoritesStore from "@/stores/favorites.store";
  import siteIconFavoritesStore from "@/stores/siteIconFavorites.store";

  // Components:
  import { buttonVariants } from "@/components/ui/button";
  import { Button } from "@/components/ui/button";
  import PageCard from "@/components/pageCard.svelte";
  import PageHeader from "@/components/pageHeader.svelte";
  import Grid from "@/components/grid.svelte";
  import Container from "@/components/container.svelte";

  // Svgs:
  import Search from "@/components/search.svelte";
  import SvgCard from "@/components/svgs/svgCard.svelte";
  import SiteIconCard from "@/components/site-icons/siteIconCard.svelte";

  import SearchIcon from "@lucide/svelte/icons/search";
  import SearchXIcon from "@lucide/svelte/icons/search-x";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import FolderHeart from "@lucide/svelte/icons/folder-heart";

  // States:
  let searchTerm = $state<string>(getParamValue("search") || "");

  let allFavorites = $derived($favoritesStore);
  let siteIconFavoriteIds = $derived($siteIconFavoritesStore);
  let filteredFavorites = $derived.by((): iSVG[] => {
    if (!searchTerm) return allFavorites;

    return searchSvgsWithFuse(allFavorites)
      .search(searchTerm)
      .map((result) => result.item);
  });
  const siteLookup = new Map(siteCollections.map((site) => [site.id, site]));
  let favoriteSiteIcons = $derived(
    siteIcons.filter((icon) => siteIconFavoriteIds.includes(icon.id)),
  );
  let filteredSiteIcons = $derived.by(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return favoriteSiteIcons;

    return favoriteSiteIcons.filter((icon) => {
      const site = siteLookup.get(icon.siteId);
      return [
        icon.name,
        icon.category,
        site?.name ?? "",
        ...icon.keywords,
      ].some((value) => value.toLowerCase().includes(query));
    });
  });
  let favoritesCount = $derived(
    favoritesStore.getCount(allFavorites) +
      siteIconFavoritesStore.getCount(siteIconFavoriteIds),
  );
  let searchResultsCount = $derived(
    filteredFavorites.length + filteredSiteIcons.length,
  );

  const handleSearch = (value: string) => {
    searchTerm = value;
  };

  const handleClearSearch = () => {
    searchTerm = "";
    deleteParam("search");
  };

  const handleClearFavorites = () => {
    favoritesStore.clearFavorites();
    siteIconFavoritesStore.clearFavorites();
  };
</script>

<svelte:head>
  <title>Favorites - svgops</title>
  <meta name="description" content="Your favorite website UI icons." />
</svelte:head>

<Search
  searchValue={searchTerm}
  onSearch={handleSearch}
  placeholder="Search..."
/>

<PageCard
  containerClass="mt-2"
  contentCardClass="max-h-[calc(100vh-7.6rem)] min-h-[calc(100vh-7.6rem)]"
>
  <PageHeader>
    <div
      class="flex items-center space-x-2 font-medium text-neutral-950 dark:text-neutral-50"
    >
      {#if searchTerm}
        <Button
          title="Clear Search"
          onclick={handleClearSearch}
          variant="ghost"
          size="icon"
        >
          <SearchXIcon size={18} strokeWidth={1.5} />
        </Button>
      {:else}
        <FolderHeart size={18} strokeWidth={1.5} />
      {/if}
      <p>Favorites</p>
      {#if favoritesCount > 0}
        <span>-</span>
        {#if !searchTerm}
          <span>{favoritesCount} icons</span>
        {:else}
          <p>
            <span class="font-mono">{searchResultsCount}</span>
            <span>search results</span>
          </p>
        {/if}
      {/if}
    </div>
    {#if favoritesCount > 0}
      <Button variant="ghost" onclick={handleClearFavorites}>
        <TrashIcon size={14} strokeWidth={1.5} />
        <span>Clear All</span>
      </Button>
    {/if}
  </PageHeader>
  <Container className="my-6">
    <Grid>
      {#each filteredFavorites as svg (svg.id)}
        <SvgCard svgInfo={svg} />
      {/each}
      {#each filteredSiteIcons as icon (icon.id)}
        {@const site = siteLookup.get(icon.siteId)}
        {#if site}
          <SiteIconCard {icon} {site} isFavorite={true} />
        {/if}
      {/each}
    </Grid>
    {#if searchResultsCount === 0 && searchTerm}
      <div
        class="flex min-h-64 flex-col items-center justify-center px-4 text-center"
      >
        <SearchXIcon size={36} strokeWidth={1.4} class="text-neutral-400" />
        <h2 class="mt-4 text-base font-medium">No favorites found</h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Try another icon, website, or function.
        </p>
      </div>
    {/if}
    {#if favoritesCount === 0 && !searchTerm}
      <div
        class="flex w-full flex-col items-center justify-center space-y-4 py-6"
      >
        <FolderHeart size={48} strokeWidth={1} />
        <h2 class="text-xl font-semibold">No favorites yet</h2>
        <p class="text-center text-neutral-600 dark:text-neutral-400">
          Add icons to your favorites by clicking the heart button on a card.
        </p>
        <a href={resolve("/")} class={buttonVariants({ variant: "outline" })}>
          <SearchIcon size={14} strokeWidth={1.5} />
          <span>Browse icons</span>
        </a>
      </div>
    {/if}
  </Container>
</PageCard>
