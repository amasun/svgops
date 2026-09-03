<script lang="ts">
  import { cn } from "@/utils/cn";
  import { globals } from "@/globals";
  import { mode } from "mode-watcher";

  import { page } from "$app/state";

  import Search from "@/components/search.svelte";
  import ModeToggle from "@/components/modeToggle.svelte";
  import GithubLink from "@/components/githubLink.svelte";
  import HomeLink from "@/components/layout/homeLink.svelte";
  import SettingsMenu from "@/components/settings/settingsMenu.svelte";
  import SidebarMobileMenu from "@/components/layout/sidebarMobileMenu.svelte";

  import { Separator } from "@/components/ui/separator";
  import { buttonVariants } from "@/components/ui/button";
  import SendIcon from "@/components/ui/moving-icons/send-icon.svelte";
  import ExternalLink from "@/components/ui/links/external-link.svelte";
  import HeartHandshake from "@lucide/svelte/icons/heart-handshake";

  let searchTerm = $derived(page.url.searchParams.get("search") || "");
  const handleSearch = (_value: string) => {
    // Search component updates URL search params automatically
  };
</script>

<header
  class="sticky top-0 z-50 w-full bg-transparent px-2 py-3 md:px-4"
>
  <nav class="flex w-full items-center justify-between">
    <div class="flex items-center space-x-2 shrink-0 md:w-52">
      <SidebarMobileMenu className="md:hidden" />
      <HomeLink />
    </div>

    <!-- Above main card: Search box left-aligned with main card, submit area right-aligned -->
    <div class="flex flex-1 items-center justify-between gap-4">
      <div class="w-full max-w-xs sm:max-w-sm md:max-w-md">
        <Search
          searchValue={searchTerm}
          onSearch={handleSearch}
          placeholder="Search icons..."
          inputClass="h-9 text-sm shadow-none"
        />
      </div>

      <!-- Right submit and tools area: removed unnecessary border and background color -->
      <div class="flex items-center space-x-2 shrink-0">
        <div class="flex items-center space-x-1">
          <ExternalLink
            title="Support svgops on GitHub"
            href={globals.sponsorLink}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hover:bg-neutral-200 dark:hover:bg-neutral-800",
            )}
          >
            <HeartHandshake size={20} strokeWidth={1.5} />
          </ExternalLink>
          <ModeToggle
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hover:bg-neutral-200 dark:hover:bg-neutral-800",
            )}
          />
          <SettingsMenu />
        </div>
        <div class="hidden h-5 items-center space-x-2 md:flex">
          <Separator orientation="vertical" />
          <GithubLink />
          <Separator orientation="vertical" />
          <ExternalLink
            href={globals.submitUrl}
            className={cn(
              buttonVariants({
                variant: mode.current === "dark" ? "default" : "radial",
              }),
            )}
          >
            <SendIcon size={14} />
            <span>Submit</span>
          </ExternalLink>
        </div>
      </div>
    </div>
  </nav>
</header>
