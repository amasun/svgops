<script lang="ts">
  import { onMount } from "svelte";

  import { cn } from "@/utils/cn";

  interface Props {
    src: string;
    alt: string;
    class?: string;
    replayToken?: number;
  }

  let {
    src,
    alt,
    class: className = "",
    replayToken = 0,
  }: Props = $props();
  let srcdoc = $state<string | null>(null);

  const withAnimationWrapper = (source: string) =>
    source.replace(
      /<svg\b([^>]*)>/i,
      '<svg$1 data-animation-icon-wrapper="true" data-animation-phase="enter" aria-hidden="true">',
    );

  onMount(() => {
    let cancelled = false;

    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load animated SVG");
        return response.text();
      })
      .then((source) => {
        if (!cancelled) {
          srcdoc = `<style>html,body{width:100%;height:100%;margin:0;display:grid;place-items:center;overflow:hidden}svg{width:100%;height:100%;display:block}</style>${withAnimationWrapper(source)}`;
        }
      })
      .catch(() => {
        if (!cancelled) srcdoc = null;
      });

    return () => {
      cancelled = true;
    };
  });
</script>

<div
  class={cn("animated-svg-preview size-9", className)}
  role="img"
  aria-label={alt}
  title="Animation preview"
>
  {#if srcdoc}
    {#key replayToken}
      <iframe
        {srcdoc}
        title={alt}
        class="size-full border-0"
        sandbox=""
        tabindex="-1"
      ></iframe>
    {/key}
  {:else}
    <img {src} alt="" class="size-full object-contain dark:invert" />
  {/if}
</div>
