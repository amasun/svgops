<script lang="ts">
  import type { SiteCollection, SiteIcon } from "@/types/site-icon";

  import { cn } from "@/utils/cn";
  import { clipboard } from "@/utils/clipboard";
  import { downloadSvg } from "@/utils/downloadSvg";

  import AnimatedSvgPreview from "@/components/site-icons/animatedSvgPreview.svelte";
  import SiteIconFavoriteButton from "@/components/site-icons/siteIconFavoriteButton.svelte";

  import { toast } from "svelte-sonner";

  interface Props {
    icon: SiteIcon;
    site: SiteCollection;
    isFavorite?: boolean;
  }

  let { icon, site, isFavorite }: Props = $props();
  let copied = $state(false);
  let animationReplayToken = $state(0);

  const replayAnimation = () => {
    animationReplayToken += 1;
  };

  const downloadIcon = async () => {
    if (icon.kind !== "asset") return;

    const result = await downloadSvg({ url: icon.assetPath });
    if (result.success) {
      toast.success("Downloading SVG...", {
        description: `${icon.name} · ${site.name}`,
      });
    } else {
      toast.error("Unable to download SVG", {
        description: `${icon.name} · ${site.name}`,
      });
    }
  };

  const copyIcon = async () => {
    try {
      const content =
        icon.kind === "asset"
          ? await fetch(icon.assetPath).then((response) => {
              if (!response.ok) throw new Error("Unable to load SVG source");
              return response.text();
            })
          : `import ${icon.componentName} from "${icon.importPath}";`;

      await clipboard(content);
      copied = true;
      toast.success(
        icon.kind === "asset"
          ? `${icon.name} SVG copied`
          : `${icon.name} import copied`,
        { description: site.name },
      );
      setTimeout(() => (copied = false), 1600);
    } catch {
      toast.error(`Unable to copy ${icon.name}`);
    }
  };
</script>

<article
  class="flex h-full flex-col justify-between rounded-md border border-neutral-200 px-3.5 py-3 transition-colors hover:bg-neutral-100/80 dark:border-neutral-800 dark:hover:bg-neutral-800/20 [content-visibility:auto] [contain-intrinsic-size:170px_220px]"
>
  <div class="flex w-full items-center justify-between pb-0.5">
    <span class="truncate text-xs text-neutral-500 dark:text-neutral-400">
      {site.name}
    </span>
    <SiteIconFavoriteButton iconId={icon.id} iconName={icon.name} {isFavorite} />
  </div>

  <div class="my-2.5 flex w-full flex-1 flex-col items-center justify-center">
    <div
      class="mb-3 flex h-10 items-center justify-center text-neutral-950 dark:text-neutral-50"
    >
      {#if icon.kind === "asset"}
        {#if icon.isAnimated}
          <AnimatedSvgPreview
            src={icon.assetPath}
            alt={`${icon.name} animation preview`}
            replayToken={animationReplayToken}
          />
        {:else}
          <img
            src={icon.assetPath}
            alt=""
            loading="lazy"
            decoding="async"
            class={cn(
              "size-9 object-contain",
              !icon.preserveColor && "dark:invert",
            )}
          />
        {/if}
      {:else}
        {@const Icon = icon.icon}
        <Icon size={36} strokeWidth={1.7} aria-hidden="true" />
      {/if}
    </div>

    <div
      class="flex w-full min-w-0 flex-col items-center justify-center space-y-1"
    >
      <h2
        class="max-w-full truncate text-center text-[15px] font-medium text-neutral-950 dark:text-neutral-50"
      >
        {icon.name}
      </h2>
      <div
        class="flex max-w-full flex-wrap items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400"
      >
        <span
          class="shrink-0 rounded border border-neutral-200 px-1 py-0.5 text-[10px] leading-none dark:border-neutral-700"
        >
          {icon.category}
        </span>
        <span
          class="shrink-0 rounded border border-neutral-200 px-1 py-0.5 text-[10px] leading-none dark:border-neutral-700"
        >
          {icon.style === "outline" ? "Outline" : "Filled"}
        </span>
        {#if icon.isAnimated && icon.category !== "Animation"}
          <span
            class="shrink-0 rounded border border-neutral-200 px-1 py-0.5 text-[10px] leading-none dark:border-neutral-700"
          >
            Animation
          </span>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex items-center justify-center space-x-0.5 pt-1">
    {#if icon.isAnimated}
      <button
        type="button"
        class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
        title="Play animation"
        aria-label={`Play animation for ${icon.name}`}
        onclick={replayAnimation}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>
      </button>
    {/if}
    {#if icon.sourceUrl}
      <a
        href={icon.sourceUrl}
        target="_blank"
        rel="noreferrer"
        class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
        title="Open icon source"
        aria-label={`Open source for ${icon.name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
      </a>
    {/if}
    {#if icon.kind === "asset"}
      <button
        type="button"
        class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
        title="Download SVG"
        aria-label={`Download SVG for ${icon.name}`}
        onclick={downloadIcon}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      </button>
    {/if}
    <button
      type="button"
      class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
      title={icon.kind === "asset" ? "Copy SVG" : "Copy component import"}
      aria-label={icon.kind === "asset"
        ? `Copy SVG for ${icon.name}`
        : `Copy import for ${icon.name}`}
      onclick={copyIcon}
    >
      {#if copied}
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      {/if}
    </button>
  </div>
</article>
