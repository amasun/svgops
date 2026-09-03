import type { Component } from "svelte";

import type { ThemeOptions } from "@/types/svg";

export type IconCategory =
  | "AI"
  | "Navigation"
  | "Actions"
  | "Communication"
  | "Content"
  | "Commerce"
  | "Status"
  | "Animation";

export type IconStyle = "outline" | "filled";
export type IconSort = "az" | "za";

export interface SiteCollection {
  id: string;
  name: string;
  domain: string;
  logoRoute: string | ThemeOptions;
  license: string;
  sourceUrl: string;
  accent: string;
}

interface SiteIconBase {
  id: string;
  name: string;
  siteId: string;
  category: IconCategory;
  style: IconStyle;
  keywords: string[];
  isAnimated?: boolean;
  unicode?: string;
  glyphName?: string;
  hasFilledVariant?: boolean;
  license: string;
  sourceUrl: string;
}

export interface ComponentSiteIcon extends SiteIconBase {
  kind: "component";
  icon: Component;
  componentName: string;
  importPath: string;
}

export interface AssetSiteIcon extends SiteIconBase {
  kind: "asset";
  assetPath: string;
  originalFileName: string;
  preserveColor?: boolean;
}

export type SiteIcon = ComponentSiteIcon | AssetSiteIcon;
