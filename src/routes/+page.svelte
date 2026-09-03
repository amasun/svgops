<script lang="ts">
  import type { PageProps } from "./$types";
  import type {
    IconCategory,
    IconSort,
    IconStyle,
  } from "@/types/site-icon";

  import { getSvgImgUrl } from "@/data";
  import {
    iconCategories,
    siteCollections,
    siteIcons,
  } from "@/data/site-icons";
  import { addParams } from "@/utils/searchParams";
  import { cn } from "@/utils/cn";
  import siteIconFavoritesStore from "@/stores/siteIconFavorites.store";

  import Container from "@/components/container.svelte";
  import PageCard from "@/components/pageCard.svelte";
  import PageHeader from "@/components/pageHeader.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import SiteIconCard from "@/components/site-icons/siteIconCard.svelte";

  import GlobeIcon from "@lucide/svelte/icons/globe-2";
  import LayersIcon from "@lucide/svelte/icons/layers-3";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import SearchXIcon from "@lucide/svelte/icons/search-x";
  import ArrowDownUpIcon from "@lucide/svelte/icons/arrow-down-up";
  import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";

  let { data }: PageProps = $props();

  const searchTerm = $derived(data.searchTerm);

  // Local reactive overrides for INSTANT 0ms tab switching & filter response
  let siteOverride = $state<string | null>(null);
  let categoryOverride = $state<string | null>(null);
  let styleOverride = $state<IconStyle | "all" | null>(null);
  let sortOverride = $state<IconSort | null>(null);

  const selectedSite = $derived(siteOverride !== null ? siteOverride : data.site);
  const selectedCategory = $derived(
    categoryOverride !== null ? categoryOverride : data.category,
  );
  const selectedStyle = $derived(
    styleOverride !== null ? styleOverride : data.style,
  );
  const selectedSort = $derived(
    sortOverride !== null ? sortOverride : (data.sort as IconSort),
  );

  // Sync back when URL changes via back/forward browser navigation
  $effect(() => {
    if (siteOverride !== null && data.site === siteOverride) siteOverride = null;
    if (categoryOverride !== null && data.category === categoryOverride) categoryOverride = null;
    if (styleOverride !== null && data.style === styleOverride) styleOverride = null;
    if (sortOverride !== null && data.sort === sortOverride) sortOverride = null;
  });

  // Centralized favorites lookup: 1 subscription instead of 72
  const favorites = $derived($siteIconFavoritesStore);
  const favoriteIdSet = $derived(new Set(favorites));

  const iconStyles: IconStyle[] = ["outline", "filled"];
  const styleLabel = (style: IconStyle) =>
    style === "outline" ? "Outline" : "Filled";

  const siteLookup = new Map(siteCollections.map((site) => [site.id, site]));
  const siteCounts = new Map(
    siteCollections.map((site) => [
      site.id,
      siteIcons.filter((icon) => icon.siteId === site.id).length,
    ]),
  );

  const contextualIcons = $derived.by(() => {
    const query = searchTerm.trim().toLowerCase();

    return siteIcons
      .filter((icon) => selectedSite === "all" || icon.siteId === selectedSite)
      .filter(
        (icon) =>
          selectedCategory === "all" ||
          (selectedCategory === "Animation"
            ? icon.isAnimated
            : icon.category === selectedCategory),
      )
      .filter((icon) => {
        if (!query) return true;
        const site = siteLookup.get(icon.siteId);
        return [
          icon.name,
          icon.category,
          icon.style,
          icon.isAnimated ? "animation" : "",
          site?.name ?? "",
          site?.domain ?? "",
          ...icon.keywords,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) =>
        selectedSort === "za"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name),
      );
  });

  const filteredIcons = $derived(
    contextualIcons.filter(
      (icon) => selectedStyle === "all" || icon.style === selectedStyle,
    ),
  );

  const FAST_BATCH = 24;
  const PAGE_SIZE = 72;
  let visibleCount = $state(PAGE_SIZE);

  const triggerFastSwitch = () => {
    visibleCount = FAST_BATCH;
    requestAnimationFrame(() => {
      visibleCount = PAGE_SIZE;
    });
  };

  $effect(() => {
    void searchTerm;
    triggerFastSwitch();
  });

  const displayedIcons = $derived(filteredIcons.slice(0, visibleCount));

  let sentinelEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!sentinelEl || visibleCount >= filteredIcons.length) return;

    const scrollContainer =
      sentinelEl.closest<HTMLElement>("[data-bits-scroll-area-viewport]") ||
      sentinelEl.closest<HTMLElement>("[data-slot='scroll-area-viewport']") ||
      null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          visibleCount = Math.min(
            visibleCount + PAGE_SIZE,
            filteredIcons.length,
          );
        }
      },
      {
        root: scrollContainer,
        rootMargin: "400px",
      },
    );

    observer.observe(sentinelEl);

    return () => {
      observer.disconnect();
    };
  });

  const hasActiveFilters = $derived(
    Boolean(searchTerm) ||
      selectedSite !== "all" ||
      selectedCategory !== "all" ||
      selectedStyle !== "all",
  );

  const categoryCount = (category: IconCategory) =>
    siteIcons.filter(
      (icon) =>
        (category === "Animation"
          ? icon.isAnimated
          : icon.category === category) &&
        (selectedSite === "all" || icon.siteId === selectedSite),
    ).length;

  const styleCount = (style: IconStyle) =>
    contextualIcons.filter((icon) => icon.style === style).length;

  const handleSearch = (_value: string) => {
    void _value;
  };

  const selectSite = (siteId: string) => {
    if (selectedSite === siteId) return;
    siteOverride = siteId;
    triggerFastSwitch();
    addParams({ params: { site: siteId === "all" ? null : siteId } });
  };

  const selectCategory = (category: string) => {
    if (selectedCategory === category) return;
    categoryOverride = category;
    triggerFastSwitch();
    addParams({ params: { category: category === "all" ? null : category } });
  };

  const selectStyle = (style: IconStyle | "all") => {
    if (selectedStyle === style) return;
    styleOverride = style;
    triggerFastSwitch();
    addParams({ params: { style: style === "all" ? null : style } });
  };

  const toggleSort = () => {
    const nextSort = selectedSort === "az" ? "za" : "az";
    sortOverride = nextSort;
    triggerFastSwitch();
    addParams({ params: { sort: nextSort === "az" ? null : "za" } });
  };

  const resetFilters = () => {
    siteOverride = "all";
    categoryOverride = "all";
    styleOverride = "all";
    sortOverride = "az";
    triggerFastSwitch();
    addParams({
      params: {
        search: null,
        site: null,
        category: null,
        style: null,
        sort: null,
      },
    });
  };
</script>

<svelte:head>
  <title>Website UI icons - svgops</title>
  <meta
    name="description"
    content="A directory of functional icons organized by website and product."
  />
</svelte:head>

<PageCard
  containerClass="home-page-card"
  contentCardClass="max-h-[calc(100vh-4.5rem)] min-h-[calc(100vh-4.5rem)]"
>
  <section
    class="border-b border-neutral-200 px-4 py-5 dark:border-neutral-800"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div class="min-w-0">
        <h1 class="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
          Website icons
        </h1>
        <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
          {siteIcons.length} functional icons · {siteCollections.length} website collections
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2 md:hidden">
      <label class="min-w-0">
        <span
          class="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          Website
        </span>
        <select
          class="h-11 w-full cursor-pointer rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600 dark:focus:ring-neutral-800"
          value={selectedSite}
          onchange={(event) => selectSite(event.currentTarget.value)}
        >
          <option value="all">All websites ({siteIcons.length})</option>
          {#each siteCollections as site (site.id)}
            <option value={site.id}
              >{site.name} ({siteCounts.get(site.id)})</option
            >
          {/each}
        </select>
      </label>

      <label class="col-span-2 min-w-0">
        <span
          class="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          Icon style
        </span>
        <select
          class="h-11 w-full cursor-pointer rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600 dark:focus:ring-neutral-800"
          value={selectedStyle}
          onchange={(event) =>
            selectStyle(event.currentTarget.value as IconStyle | "all")}
        >
          <option value="all">All styles ({contextualIcons.length})</option>
          {#each iconStyles as style (style)}
            <option value={style}
              >{styleLabel(style)} ({styleCount(style)})</option
            >
          {/each}
        </select>
      </label>

      <label class="min-w-0">
        <span
          class="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          Function
        </span>
        <select
          class="h-11 w-full cursor-pointer rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-600 dark:focus:ring-neutral-800"
          value={selectedCategory}
          onchange={(event) => selectCategory(event.currentTarget.value)}
        >
          <option value="all">All functions</option>
          {#each iconCategories as category (category)}
            <option value={category}
              >{category} ({categoryCount(category)})</option
            >
          {/each}
        </select>
      </label>
    </div>

    <div
      class="mt-4 hidden flex-wrap gap-2 md:flex"
      aria-label="Website filters"
    >
      <button
        type="button"
        class={cn(
          "flex h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:focus-visible:ring-neutral-600",
          selectedSite === "all"
            ? "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700",
        )}
        aria-pressed={selectedSite === "all"}
        onclick={() => selectSite("all")}
      >
        <GlobeIcon size={16} />
        <span>All websites</span>
        <span class="font-mono text-xs opacity-60">{siteIcons.length}</span>
      </button>

      {#each siteCollections as site (site.id)}
        <button
          type="button"
          class={cn(
            "flex h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:focus-visible:ring-neutral-600",
            selectedSite === site.id
              ? "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700",
          )}
          aria-pressed={selectedSite === site.id}
          onclick={() => selectSite(site.id)}
        >
          <span
            class="flex size-5 items-center justify-center rounded-sm bg-white/90 p-0.5"
          >
            <img
              src={getSvgImgUrl({ url: site.logoRoute, isDark: false })}
              alt=""
              class="size-full object-contain"
            />
          </span>
          <span>{site.name}</span>
          <span class="font-mono text-xs opacity-60"
            >{siteCounts.get(site.id)}</span
          >
        </button>
      {/each}
    </div>
  </section>

  <PageHeader className="top-0 h-auto min-h-12.5 flex-wrap gap-2">
    <div
      class="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400"
    >
      <LayersIcon size={16} />
      <span class="font-mono text-neutral-950 dark:text-neutral-50">
        {filteredIcons.length}
      </span>
      <span>{filteredIcons.length === 1 ? "icon" : "icons"}</span>
      <span aria-hidden="true" class="text-neutral-300 dark:text-neutral-700">
        ·
      </span>
      <button
        type="button"
        class={cn(
          "cursor-pointer rounded border px-1.5 py-0.5 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none",
          selectedStyle === "all"
            ? "border-neutral-400 bg-neutral-100 font-medium text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-50"
            : "border-transparent text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
        )}
        aria-pressed={selectedStyle === "all"}
        onclick={() => selectStyle("all")}
      >
        All styles
      </button>
      {#each iconStyles as style (style)}
        <button
          type="button"
          class={cn(
            "cursor-pointer rounded border px-1.5 py-0.5 text-[11px] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none",
            selectedStyle === style
              ? "border-neutral-400 bg-neutral-100 font-medium text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-50"
              : "border-transparent text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
          )}
          aria-pressed={selectedStyle === style}
          onclick={() => selectStyle(style)}
        >
          {styleLabel(style)}
          <span class="ml-1 font-mono text-[10px] opacity-60"
            >{styleCount(style)}</span
          >
        </button>
      {/each}
    </div>
    <div class="flex items-center gap-1">
      <Button variant="ghost" size="sm" onclick={toggleSort}>
        {#if selectedSort === "az"}
          <ArrowUpDownIcon size={16} />
          <span>Sort A-Z</span>
        {:else}
          <ArrowDownUpIcon size={16} />
          <span>Sort Z-A</span>
        {/if}
      </Button>
      {#if hasActiveFilters}
        <Button variant="ghost" size="sm" onclick={resetFilters}>
          <RotateCcwIcon size={14} />
          <span>Reset</span>
        </Button>
      {/if}
    </div>
  </PageHeader>

  <Container className="w-full max-w-none px-3 py-4 sm:px-4">
    {#if displayedIcons.length > 0}
      <div
        class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(170px,1fr))]"
        style="grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));"
      >
        {#each displayedIcons as icon (icon.id)}
          {@const site = siteLookup.get(icon.siteId)}
          {#if site}
            <SiteIconCard
              {icon}
              {site}
              isFavorite={favoriteIdSet.has(icon.id)}
            />
          {/if}
        {/each}
      </div>

      {#if visibleCount < filteredIcons.length}
        <div
          bind:this={sentinelEl}
          class="flex flex-col items-center justify-center pt-8 pb-4"
        >
          <Button
            variant="outline"
            size="sm"
            class="h-8 gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            onclick={() =>
              (visibleCount = Math.min(
                visibleCount + PAGE_SIZE,
                filteredIcons.length,
              ))}
          >
            <span>Load more icons</span>
            <span class="font-mono text-[10px] opacity-60">
              ({displayedIcons.length} / {filteredIcons.length})
            </span>
          </Button>
        </div>
      {/if}
    {:else}
      <div
        class="flex min-h-72 flex-col items-center justify-center px-4 text-center"
      >
        <SearchXIcon size={36} strokeWidth={1.4} class="text-neutral-400" />
        <h2
          class="mt-4 text-base font-medium text-neutral-950 dark:text-neutral-50"
        >
          No icons found
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Try another website, function, or search term.
        </p>
        <Button variant="outline" size="sm" class="mt-4" onclick={resetFilters}>
          <RotateCcwIcon size={14} />
          <span>Reset filters</span>
        </Button>
      </div>
    {/if}
  </Container>
</PageCard>

<style>
  :global(.home-page-card > div) {
    border-radius: 16px 34px 8px 8px;
  }

  @media (max-width: 767px) {
    :global(.home-page-card > div) {
      border-radius: 12px;
    }
  }
</style>
