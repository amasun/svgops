import type { IconCategory, SiteCollection, SiteIcon } from "@/types/site-icon";
import { cursorIcons } from "@/data/site-icons/cursor";
import { kimiIcons } from "@/data/site-icons/kimi";
import { monicaIcons } from "@/data/site-icons/monica";
import { traeIcons } from "@/data/site-icons/trae";
import { vscodeIcons } from "@/data/site-icons/vscode";

export const iconCategories: IconCategory[] = [
  "AI",
  "Actions",
  "Animation",
  "Commerce",
  "Communication",
  "Content",
  "Navigation",
  "Status",
];

export const siteCollections: SiteCollection[] = [
  {
    id: "cursor",
    name: "Cursor",
    domain: "cursor.com",
    logoRoute: {
      dark: "/library/cursor_dark.svg",
      light: "/library/cursor_light.svg",
    },
    license: "Proprietary / Anysphere (Reference)",
    sourceUrl: "https://cursor.com/",
    accent: "#000000",
  },
  {
    id: "trae",
    name: "Trae",
    domain: "trae.ai",
    logoRoute: "/site-icons/trae/trae-logo.svg",
    license: "Proprietary / ByteDance (Reference)",
    sourceUrl: "https://www.trae.ai/",
    accent: "#00d084",
  },
  {
    id: "vscode",
    name: "VS Code",
    domain: "code.visualstudio.com",
    logoRoute: "/library/vscode.svg",
    license: "MIT (Codicons / Microsoft)",
    sourceUrl: "https://code.visualstudio.com/",
    accent: "#007acc",
  },
  {
    id: "kimi",
    name: "Kimi",
    domain: "kimi.com",
    logoRoute: "/library/kimi-icon.svg",
    license: "Unknown / permission required",
    sourceUrl: "https://www.kimi.com/",
    accent: "#027aff",
  },
  {
    id: "monica",
    name: "Monica",
    domain: "monica.im",
    logoRoute:
      "https://assets.monica.im/home-web/_next/static/media/monicaLogo.83e0ae18.png",
    license: "Unspecified",
    sourceUrl: "https://monica.im/",
    accent: "#7c5cff",
  },
];

export const siteIcons: SiteIcon[] = [
  ...cursorIcons,
  ...traeIcons,
  ...vscodeIcons,
  ...kimiIcons,
  ...monicaIcons,
];
