<script lang="ts">
  import type { IconCategory } from "@/types/site-icon";
  import { page } from "$app/state";
  import { SvelteURLSearchParams } from "svelte/reactivity";

  import { cn } from "@/utils/cn";
  import { iconCategories, siteIcons } from "@/data/site-icons";

  import InternalLink from "@/components/ui/links/internal-link.svelte";
  import { sidebarItemClasses } from "@/components/layout/sidebarItemClasses";
  import { sidebarBadgeClasses } from "@/components/layout/sidebarBadgeClasses";

  const categoryCounts: Record<IconCategory, number> = Object.fromEntries(
    iconCategories.map((category) => [
      category,
      siteIcons.filter((icon) =>
        category === "Animation" ? icon.isAnimated : icon.category === category,
      ).length,
    ]),
  ) as Record<IconCategory, number>;

  const isActive = (category: IconCategory) => {
    return page.url.searchParams.get("category") === category;
  };

  const categoryUrl = (category: IconCategory) => {
    const params = new SvelteURLSearchParams(page.url.searchParams);
    params.set("category", category);
    return `/?${params.toString()}`;
  };
</script>

<p
  class="px-2 pb-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500"
>
  Functions
</p>

{#each iconCategories as category (category)}
  <InternalLink
    href={categoryUrl(category)}
    preloadData={true}
    className={cn(
      sidebarItemClasses.base,
      isActive(category) && sidebarItemClasses.active,
      "pr-3",
    )}
  >
    <p class="truncate">{category}</p>
    <span
      class={cn(sidebarBadgeClasses, page.url.pathname && "border-transparent")}
    >
      {categoryCounts[category]}
    </span>
  </InternalLink>
{/each}
