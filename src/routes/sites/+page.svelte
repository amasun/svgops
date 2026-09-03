<script lang="ts">
  import { getSvgImgUrl } from "@/data";
  import { siteCollections, siteIcons } from "@/data/site-icons";

  import Container from "@/components/container.svelte";
  import PageCard from "@/components/pageCard.svelte";
  import ExternalLink from "@/components/ui/links/external-link.svelte";
  import InternalLink from "@/components/ui/links/internal-link.svelte";

  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  const siteCounts = new Map(
    siteCollections.map((site) => [
      site.id,
      siteIcons.filter((icon) => icon.siteId === site.id).length,
    ]),
  );
</script>

<svelte:head>
  <title>Collections - svgops</title>
  <meta
    name="description"
    content="Browse the collections represented in the svgops functional icon library."
  />
</svelte:head>

<PageCard
  containerClass="mt-2"
  contentCardClass="max-h-[calc(100vh-4.5rem)] min-h-[calc(100vh-4.5rem)]"
>
  <Container className="px-4 py-6 sm:px-6 lg:px-8">
    <header class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold text-neutral-950 dark:text-neutral-50">
          Collections
        </h1>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {siteCollections.length} collections · {siteIcons.length} functional icons
        </p>
      </div>
    </header>

    <div
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {#each siteCollections as site (site.id)}
        <article
          class="flex min-h-56 flex-col rounded-md border border-neutral-200 bg-white transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
        >
          <InternalLink
            href={`/?site=${site.id}`}
            preloadData={true}
            className="group flex flex-1 cursor-pointer flex-col items-center justify-center px-4 py-5 text-center"
            title={`View ${site.name} icons`}
          >
            <span
              class="flex size-14 items-center justify-center rounded-xl border border-neutral-200 bg-white p-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <img
                src={getSvgImgUrl({ url: site.logoRoute, isDark: false })}
                alt={`${site.name} logo`}
                class="size-full object-contain"
              />
            </span>
            <h2
              class="mt-4 max-w-full truncate text-base font-semibold text-neutral-950 group-hover:underline dark:text-neutral-50"
            >
              {site.name}
            </h2>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {siteCounts.get(site.id) ?? 0} icons
            </p>
          </InternalLink>

          <div
            class="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800"
          >
            <ExternalLink
              href={site.sourceUrl}
              className="flex min-w-0 cursor-pointer items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
              title={`Open ${site.name} website`}
            >
              <span class="truncate">{site.domain}</span>
              <ArrowUpRight size={13} class="shrink-0" />
            </ExternalLink>
            <span class="text-[11px] text-neutral-400 dark:text-neutral-500">
              Source
            </span>
          </div>
        </article>
      {/each}
    </div>
  </Container>
</PageCard>
