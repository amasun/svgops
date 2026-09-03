import type { Load } from "@sveltejs/kit";
import type { IconSort, IconStyle } from "@/types/site-icon";
import { siteCollections } from "@/data/site-icons";

export const load: Load = ({ url }) => {
  const requestedSite = url.searchParams.get("site");
  const site =
    requestedSite &&
    siteCollections.some((collection) => collection.id === requestedSite)
      ? requestedSite
      : "all";
  const requestedStyle = url.searchParams.get("style");
  const style: IconStyle | "all" =
    requestedStyle === "outline" || requestedStyle === "filled"
      ? requestedStyle
      : "all";
  const sort: IconSort = url.searchParams.get("sort") === "za" ? "za" : "az";

  return {
    searchTerm: url.searchParams.get("search") || "",
    site,
    category: url.searchParams.get("category") || "all",
    style,
    sort,
  };
};
